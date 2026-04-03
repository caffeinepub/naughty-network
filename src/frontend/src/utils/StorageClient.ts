import { Actor, type HttpAgent } from "@icp-sdk/core/agent";
import { IDL } from "@icp-sdk/core/candid";

type Headers = Record<string, string>;

const MAXIMUM_CONCURRENT_UPLOADS = 10;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

const GATEWAY_VERSION = "v1";

const HASH_ALGORITHM = "SHA-256";
const SHA256_PREFIX = "sha256:";
const DOMAIN_SEPARATOR_FOR_CHUNKS = new TextEncoder().encode("icfs-chunk/");
const DOMAIN_SEPARATOR_FOR_METADATA = new TextEncoder().encode(
  "icfs-metadata/",
);
const DOMAIN_SEPARATOR_FOR_NODES = new TextEncoder().encode("ynode/");

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const shouldRetry = isRetriableError(error);
      if (attempt === MAX_RETRIES || !shouldRetry) {
        if (!shouldRetry && attempt < MAX_RETRIES) {
          console.warn(
            `Non-retriable error: ${lastError.message}. Not retrying.`,
          );
        }
        throw error;
      }
      const delay = Math.min(
        BASE_DELAY_MS * 2 ** attempt + Math.random() * 1000,
        MAX_DELAY_MS,
      );
      console.warn(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Unknown error during retry");
}

function isRetriableError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || "";
  if (error?.response?.status) {
    const status = error.response.status;
    if (status === 408 || status === 429) return true;
    if (status >= 400 && status < 500) return false;
    if (status >= 500) return true;
  }
  if (
    errorMessage.includes("ssl") ||
    errorMessage.includes("tls") ||
    errorMessage.includes("network error") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("fetch")
  ) {
    return true;
  }
  if (
    errorMessage.includes("validation") ||
    errorMessage.includes("invalid") ||
    errorMessage.includes("malformed") ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("forbidden") ||
    errorMessage.includes("not found")
  ) {
    return false;
  }
  return true;
}

function validateHashFormat(hash: string, context: string): void {
  if (!hash) throw new Error(`${context}: Hash cannot be empty`);
  if (!hash.startsWith(SHA256_PREFIX)) {
    throw new Error(`${context}: Expected sha256: prefix, got: ${hash}`);
  }
  const hexPart = hash.substring(SHA256_PREFIX.length);
  if (hexPart.length !== 64) {
    throw new Error(`${context}: Expected 64 hex chars, got ${hexPart.length}`);
  }
  if (!/^[0-9a-f]{64}$/i.test(hexPart)) {
    throw new Error(`${context}: Hash must be hex only`);
  }
}

class YHash {
  public readonly bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    if (bytes.length !== 32) {
      throw new Error(`YHash must be 32 bytes, got ${bytes.length}`);
    }
    this.bytes = new Uint8Array(bytes);
  }

  static async fromNodes(
    left: YHash | null,
    right: YHash | null,
  ): Promise<YHash> {
    const leftBytes =
      left instanceof YHash
        ? left.bytes
        : new TextEncoder().encode("UNBALANCED");
    const rightBytes =
      right instanceof YHash
        ? right.bytes
        : new TextEncoder().encode("UNBALANCED");
    const combined = new Uint8Array(
      DOMAIN_SEPARATOR_FOR_NODES.length + leftBytes.length + rightBytes.length,
    );
    let offset = 0;
    for (const data of [DOMAIN_SEPARATOR_FOR_NODES, leftBytes, rightBytes]) {
      combined.set(data, offset);
      offset += data.length;
    }
    return new YHash(
      new Uint8Array(await crypto.subtle.digest(HASH_ALGORITHM, combined)),
    );
  }

  static async fromChunk(data: Uint8Array): Promise<YHash> {
    return YHash.fromBytes(DOMAIN_SEPARATOR_FOR_CHUNKS, data);
  }

  static async fromHeaders(headers: Headers): Promise<YHash> {
    const headerLines = Object.entries(headers)
      .map(([k, v]) => `${k.trim()}: ${v.trim()}\n`)
      .sort();
    return YHash.fromBytes(
      DOMAIN_SEPARATOR_FOR_METADATA,
      new TextEncoder().encode(headerLines.join("")),
    );
  }

  static async fromBytes(
    domainSeparator: Uint8Array,
    data: Uint8Array,
  ): Promise<YHash> {
    const combined = new Uint8Array(domainSeparator.length + data.length);
    combined.set(domainSeparator);
    combined.set(data, domainSeparator.length);
    return new YHash(
      new Uint8Array(await crypto.subtle.digest(HASH_ALGORITHM, combined)),
    );
  }

  public static fromHex(hexString: string): YHash {
    const bytes = new Uint8Array(
      hexString.match(/.{1,2}/g)!.map((b) => Number.parseInt(b, 16)),
    );
    return new YHash(bytes);
  }

  public toShaString(): string {
    return `${SHA256_PREFIX}${this.toHex()}`;
  }

  public toString(): string {
    throw new Error("toString not supported for YHash");
  }

  private toHex(): string {
    return Array.from(this.bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

type TreeNode = { hash: YHash; left: TreeNode | null; right: TreeNode | null };
type TreeNodeJSON = {
  hash: string;
  left: TreeNodeJSON | null;
  right: TreeNodeJSON | null;
};

function nodeToJSON(node: TreeNode): TreeNodeJSON {
  return {
    hash: node.hash.toShaString(),
    left: node.left ? nodeToJSON(node.left) : null,
    right: node.right ? nodeToJSON(node.right) : null,
  };
}

type BlobHashTreeJSON = {
  tree_type: "DSBMTWH";
  chunk_hashes: string[];
  tree: TreeNodeJSON;
  headers: string[];
};

class BlobHashTree {
  public tree_type: "DSBMTWH";
  public chunk_hashes: YHash[];
  public tree: TreeNode;
  public headers: string[];

  constructor(
    chunk_hashes: YHash[],
    tree: TreeNode,
    headers: string[] | Headers | null = null,
  ) {
    this.tree_type = "DSBMTWH";
    this.chunk_hashes = chunk_hashes;
    this.tree = tree;
    if (headers == null) {
      this.headers = [];
    } else if (Array.isArray(headers)) {
      this.headers = headers;
    } else {
      this.headers = Object.entries(headers).map(
        ([k, v]) => `${k.trim()}: ${v.trim()}`,
      );
    }
    this.headers.sort();
  }

  public static async build(
    chunkHashes: YHash[],
    headers: Headers = {},
  ): Promise<BlobHashTree> {
    if (chunkHashes.length === 0) {
      const hex =
        "8b8e620f084e48da0be2287fd12c5aaa4dbe14b468fd2e360f48d741fe7628a0";
      chunkHashes.push(new YHash(new TextEncoder().encode(hex)));
    }

    let level: TreeNode[] = chunkHashes.map((hash) => ({
      hash,
      left: null,
      right: null,
    }));
    while (level.length > 1) {
      const nextLevel: TreeNode[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1] || null;
        const parentHash = await YHash.fromNodes(
          left.hash,
          right ? right.hash : null,
        );
        nextLevel.push({ hash: parentHash, left, right });
      }
      level = nextLevel;
    }
    const chunksRoot = level[0];

    if (headers && Object.keys(headers).length > 0) {
      const metadataRootHash = await YHash.fromHeaders(headers);
      const metadataRoot: TreeNode = {
        hash: metadataRootHash,
        left: null,
        right: null,
      };
      const combinedRootHash = await YHash.fromNodes(
        chunksRoot.hash,
        metadataRoot.hash,
      );
      return new BlobHashTree(
        chunkHashes,
        { hash: combinedRootHash, left: chunksRoot, right: metadataRoot },
        headers,
      );
    }
    return new BlobHashTree(chunkHashes, chunksRoot, headers);
  }

  public toJSON(): BlobHashTreeJSON {
    return {
      tree_type: this.tree_type,
      chunk_hashes: this.chunk_hashes.map((h) => h.toShaString()),
      tree: nodeToJSON(this.tree),
      headers: this.headers,
    };
  }
}

interface UploadChunkParams {
  blobRootHash: YHash;
  chunkHash: YHash;
  chunkIndex: number;
  chunkData: Uint8Array;
  bucketName: string;
  owner: string;
  projectId: string;
  httpHeaders: Headers;
}

class StorageGatewayClient {
  constructor(private readonly storageGatewayUrl: string) {}

  public getStorageGatewayUrl(): string {
    return this.storageGatewayUrl;
  }

  public async uploadChunk(
    params: UploadChunkParams,
  ): Promise<{ isComplete: boolean }> {
    validateHashFormat(
      params.blobRootHash.toShaString(),
      `uploadChunk[${params.chunkIndex}] blob_hash`,
    );
    validateHashFormat(
      params.chunkHash.toShaString(),
      `uploadChunk[${params.chunkIndex}] chunk_hash`,
    );

    return await withRetry(async () => {
      const queryParams = new URLSearchParams({
        owner_id: params.owner,
        blob_hash: params.blobRootHash.toShaString(),
        chunk_hash: params.chunkHash.toShaString(),
        chunk_index: params.chunkIndex.toString(),
        bucket_name: params.bucketName,
        project_id: params.projectId,
      });
      const url = `${this.storageGatewayUrl}/${GATEWAY_VERSION}/chunk/?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Caffeine-Project-ID": params.projectId,
        },
        body: params.chunkData as BodyInit,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `Failed to upload chunk ${params.chunkIndex}: ${response.status} - ${errorText}`,
        );
        (error as any).response = { status: response.status };
        throw error;
      }

      const result = (await response.json()) as { status: string };
      return { isComplete: result.status === "blob_complete" };
    });
  }

  /**
   * Uploads the blob tree using OwnerCanisterMethod auth.
   * certMethod and certBlobHash come from _caffeineStorageCreateCertificate on the canister.
   */
  public async uploadBlobTree(
    blobHashTree: BlobHashTree,
    bucketName: string,
    numBlobBytes: number,
    owner: string,
    projectId: string,
    certMethod: string,
    certBlobHash: string,
  ): Promise<void> {
    const treeJSON = blobHashTree.toJSON();
    validateHashFormat(treeJSON.tree.hash, "uploadBlobTree root hash");
    treeJSON.chunk_hashes.forEach((hash, index) => {
      validateHashFormat(hash, `uploadBlobTree chunk_hash[${index}]`);
    });

    return await withRetry(async () => {
      const url = `${this.storageGatewayUrl}/${GATEWAY_VERSION}/blob-tree/`;
      const requestBody = {
        blob_tree: treeJSON,
        bucket_name: bucketName,
        num_blob_bytes: numBlobBytes,
        owner: owner,
        project_id: projectId,
        headers: blobHashTree.headers,
        auth: {
          OwnerCanisterMethod: {
            method: certMethod,
            blob_hash: certBlobHash,
          },
        },
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Caffeine-Project-ID": projectId,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `Failed to upload blob tree: ${response.status} - ${errorText}`,
        );
        (error as any).response = { status: response.status };
        throw error;
      }
    });
  }
}

/**
 * IDL factory for _caffeineStorageCreateCertificate.
 * Used to create a minimal actor that can call this method via Actor.createActor,
 * which handles all the Candid encoding/decoding and IC request polling internally.
 */
const certIdlFactory = ({ IDL }: { IDL: any }) => {
  const CertResult = IDL.Record({
    method: IDL.Text,
    blob_hash: IDL.Text,
  });
  return IDL.Service({
    _caffeineStorageCreateCertificate: IDL.Func([IDL.Text], [CertResult], []),
  });
};

export class StorageClient {
  private readonly storageGatewayClient: StorageGatewayClient;

  public constructor(
    private readonly bucket: string,
    storageGatewayUrl: string,
    private readonly backendCanisterId: string,
    private readonly projectId: string,
    private readonly agent: HttpAgent,
  ) {
    this.storageGatewayClient = new StorageGatewayClient(storageGatewayUrl);
  }

  /**
   * Calls _caffeineStorageCreateCertificate through Actor.createActor so that
   * the IC agent handles Candid encoding, request submission, and polling automatically.
   * Returns { method, blob_hash } which is used as OwnerCanisterMethod auth.
   */
  private async getCertificate(
    hash: string,
  ): Promise<{ method: string; blob_hash: string }> {
    const certActor = Actor.createActor<{
      _caffeineStorageCreateCertificate: (
        hash: string,
      ) => Promise<{ method: string; blob_hash: string }>;
    }>(certIdlFactory, {
      agent: this.agent,
      canisterId: this.backendCanisterId,
    });
    return certActor._caffeineStorageCreateCertificate(hash);
  }

  public async putFile(
    blobBytes: Uint8Array,
    onProgress?: (percentage: number) => void,
  ): Promise<{ hash: string }> {
    const httpHeaders: Headers = { "Content-Type": "application/json" };
    const file = new Blob([new Uint8Array(blobBytes)], {
      type: "application/octet-stream",
    });
    const fileHeaders: Headers = {
      "Content-Type": "application/octet-stream",
      "Content-Length": file.size.toString(),
    };

    const { chunks, chunkHashes, blobHashTree } =
      await this.processFileForUpload(file, fileHeaders);
    const blobRootHash = blobHashTree.tree.hash;
    const hashString = blobRootHash.toShaString();

    const cert = await this.getCertificate(hashString);

    await this.storageGatewayClient.uploadBlobTree(
      blobHashTree,
      this.bucket,
      file.size,
      this.backendCanisterId,
      this.projectId,
      cert.method,
      cert.blob_hash,
    );
    await this.parallelUpload(
      chunks,
      chunkHashes,
      blobRootHash,
      httpHeaders,
      onProgress,
    );
    return { hash: hashString };
  }

  public async getDirectURL(hash: string): Promise<string> {
    if (!hash) throw new Error("Hash must not be empty");
    validateHashFormat(hash, `getDirectURL for path '${hash}'`);
    return `${this.storageGatewayClient.getStorageGatewayUrl()}/${GATEWAY_VERSION}/blob/?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent(this.backendCanisterId)}&project_id=${encodeURIComponent(this.projectId)}`;
  }

  private async processFileForUpload(file: Blob, headers: Headers) {
    const chunks = this.createFileChunks(file);
    const chunkHashes: YHash[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkData = new Uint8Array(await chunks[i].arrayBuffer());
      chunkHashes.push(await YHash.fromChunk(chunkData));
    }
    const blobHashTree = await BlobHashTree.build(chunkHashes, headers);
    return { chunks, chunkHashes, blobHashTree };
  }

  private async parallelUpload(
    chunks: Blob[],
    chunkHashes: YHash[],
    blobRootHash: YHash,
    httpHeaders: Headers,
    onProgress: ((percentage: number) => void) | undefined,
  ): Promise<void> {
    let completedChunks = 0;
    const uploadSingleChunk = async (index: number) => {
      const chunkData = new Uint8Array(await chunks[index].arrayBuffer());
      await this.storageGatewayClient.uploadChunk({
        blobRootHash,
        chunkHash: chunkHashes[index],
        chunkIndex: index,
        chunkData,
        bucketName: this.bucket,
        owner: this.backendCanisterId,
        projectId: this.projectId,
        httpHeaders,
      });
      const current = ++completedChunks;
      if (onProgress != null) {
        onProgress(
          chunks.length === 0
            ? 100
            : Math.round((current / chunks.length) * 100),
        );
      }
    };
    await Promise.all(
      Array.from(
        { length: MAXIMUM_CONCURRENT_UPLOADS },
        async (_, workerId) => {
          for (
            let i = workerId;
            i < chunks.length;
            i += MAXIMUM_CONCURRENT_UPLOADS
          ) {
            await uploadSingleChunk(i);
          }
        },
      ),
    );
  }

  private createFileChunks(file: Blob, chunkSize = 1024 * 1024): Blob[] {
    const chunks: Blob[] = [];
    const totalChunks = Math.ceil(file.size / chunkSize);
    for (let index = 0; index < totalChunks; index++) {
      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      chunks.push(file.slice(start, end));
    }
    return chunks;
  }
}
