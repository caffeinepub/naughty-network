/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";

export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface Episode {
    id: Id;
    title: string;
    duration: bigint;
    showId: Id;
    createdAt: bigint;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    seasonNumber: bigint;
    episodeNumber: bigint;
}
export interface EpisodeProgress {
    episodeId: Id;
    updatedAt: bigint;
    timestamp: bigint;
}
export interface Show {
    id: Id;
    title: string;
    createdAt: bigint;
    creatorId: Principal;
    description: string;
    thumbnailUrl: string;
    isFeatured: boolean;
    genre: string;
    isPublic: boolean;
}
export interface UserRecord {
    principal: Principal;
    name: string;
    joinedAt: bigint;
}
export interface UserAccountSummary {
    username: string;
    createdAt: bigint;
}
export type Id = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export type SignUpResult = { ok: string } | { err: string };
export interface backendInterface {
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    addToWatchlist(showId: Id): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEpisode(showId: Id, seasonNumber: bigint, episodeNumber: bigint, title: string, description: string, videoUrl: string, thumbnailUrl: string, duration: bigint): Promise<Episode>;
    createShow(title: string, description: string, genre: string, thumbnailUrl: string, isPublic: boolean): Promise<Show>;
    deleteEpisode(episodeId: Id): Promise<void>;
    deleteShow(showId: Id): Promise<void>;
    getAllShows(publicOnly: boolean): Promise<Array<Show>>;
    getAllUsers(): Promise<Array<UserRecord>>;
    getAllUsersV2(): Promise<Array<UserAccountSummary>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContinueWatching(): Promise<Array<EpisodeProgress>>;
    getEpisode(episodeId: Id): Promise<Episode>;
    getEpisodesBySeason(showId: Id, seasonNumber: bigint): Promise<Array<Episode>>;
    getEpisodesByShow(showId: Id): Promise<Array<Episode>>;
    getFeaturedShow(): Promise<Show | null>;
    getShow(showId: Id): Promise<Show>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWatchlist(): Promise<Array<Id>>;
    isCallerAdmin(): Promise<boolean>;
    login(username: string, passwordHash: string): Promise<string | null>;
    logout(token: string): Promise<void>;
    registerUser(): Promise<void>;
    removeFromWatchlist(showId: Id): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveEpisodeProgress(episodeId: Id, timestamp: bigint): Promise<void>;
    searchShows(searchTerm: string): Promise<Array<Show>>;
    signUp(username: string, passwordHash: string): Promise<SignUpResult>;
    updateEpisode(episodeId: Id, seasonNumber: bigint, episodeNumber: bigint, title: string, description: string, videoUrl: string, thumbnailUrl: string, duration: bigint): Promise<void>;
    updateShow(showId: Id, title: string, description: string, genre: string, thumbnailUrl: string, isFeatured: boolean, isPublic: boolean): Promise<void>;
    validateSession(token: string): Promise<string | null>;
}

function processError_default(e: unknown): never {
    throw e;
}

export class Backend implements backendInterface {
    constructor(
        private actor: ActorSubclass<_SERVICE>,
        private processError?: (error: unknown) => never
    ) {}

    private async call<T>(fn: () => Promise<T>): Promise<T> {
        if (this.processError) {
            try {
                return await fn();
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        }
        return fn();
    }

    async _initializeAccessControlWithSecret(arg0: string): Promise<void> {
        return this.call(() => (this.actor as any)._initializeAccessControlWithSecret(arg0));
    }
    async addToWatchlist(arg0: Id): Promise<void> {
        return this.call(() => this.actor.addToWatchlist(arg0));
    }
    async assignCallerUserRole(arg0: Principal, arg1: UserRole): Promise<void> {
        const role = arg1 == UserRole.admin ? { admin: null } : arg1 == UserRole.user ? { user: null } : { guest: null };
        return this.call(() => this.actor.assignCallerUserRole(arg0, role));
    }
    async createEpisode(arg0: Id, arg1: bigint, arg2: bigint, arg3: string, arg4: string, arg5: string, arg6: string, arg7: bigint): Promise<Episode> {
        return this.call(async () => {
            const result = await this.actor.createEpisode(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
            return result as Episode;
        });
    }
    async createShow(arg0: string, arg1: string, arg2: string, arg3: string, arg4: boolean): Promise<Show> {
        return this.call(async () => {
            const result = await this.actor.createShow(arg0, arg1, arg2, arg3, arg4);
            return result as Show;
        });
    }
    async deleteEpisode(arg0: Id): Promise<void> {
        return this.call(() => this.actor.deleteEpisode(arg0));
    }
    async deleteShow(arg0: Id): Promise<void> {
        return this.call(() => this.actor.deleteShow(arg0));
    }
    async getAllShows(arg0: boolean): Promise<Array<Show>> {
        return this.call(async () => {
            const result = await this.actor.getAllShows(arg0);
            return result as Array<Show>;
        });
    }
    async getAllUsers(): Promise<Array<UserRecord>> {
        return this.call(async () => {
            const result = await (this.actor as any).getAllUsers();
            return result as Array<UserRecord>;
        });
    }
    async getAllUsersV2(): Promise<Array<UserAccountSummary>> {
        return this.call(async () => {
            const result = await this.actor.getAllUsersV2();
            return result as Array<UserAccountSummary>;
        });
    }
    async getCallerUserProfile(): Promise<UserProfile | null> {
        return this.call(async () => {
            const result = await this.actor.getCallerUserProfile();
            return result.length === 0 ? null : result[0] as UserProfile;
        });
    }
    async getCallerUserRole(): Promise<UserRole> {
        return this.call(async () => {
            const result = await this.actor.getCallerUserRole();
            return "admin" in result ? UserRole.admin : "user" in result ? UserRole.user : UserRole.guest;
        });
    }
    async getContinueWatching(): Promise<Array<EpisodeProgress>> {
        return this.call(() => this.actor.getContinueWatching() as Promise<Array<EpisodeProgress>>);
    }
    async getEpisode(arg0: Id): Promise<Episode> {
        return this.call(async () => {
            const result = await this.actor.getEpisode(arg0);
            return result as Episode;
        });
    }
    async getEpisodesBySeason(arg0: Id, arg1: bigint): Promise<Array<Episode>> {
        return this.call(async () => {
            const result = await this.actor.getEpisodesBySeason(arg0, arg1);
            return result as Array<Episode>;
        });
    }
    async getEpisodesByShow(arg0: Id): Promise<Array<Episode>> {
        return this.call(async () => {
            const result = await this.actor.getEpisodesByShow(arg0);
            return result as Array<Episode>;
        });
    }
    async getFeaturedShow(): Promise<Show | null> {
        return this.call(async () => {
            const result = await this.actor.getFeaturedShow();
            return result.length === 0 ? null : result[0] as Show;
        });
    }
    async getShow(arg0: Id): Promise<Show> {
        return this.call(async () => {
            const result = await this.actor.getShow(arg0);
            return result as Show;
        });
    }
    async getUserProfile(arg0: Principal): Promise<UserProfile | null> {
        return this.call(async () => {
            const result = await this.actor.getUserProfile(arg0);
            return result.length === 0 ? null : result[0] as UserProfile;
        });
    }
    async getWatchlist(): Promise<Array<Id>> {
        return this.call(() => this.actor.getWatchlist() as Promise<Array<Id>>);
    }
    async isCallerAdmin(): Promise<boolean> {
        return this.call(() => this.actor.isCallerAdmin());
    }
    async login(arg0: string, arg1: string): Promise<string | null> {
        return this.call(async () => {
            const result = await this.actor.login(arg0, arg1);
            return result.length === 0 ? null : result[0] as string;
        });
    }
    async logout(arg0: string): Promise<void> {
        return this.call(() => this.actor.logout(arg0));
    }
    async registerUser(): Promise<void> {
        return this.call(() => this.actor.registerUser());
    }
    async removeFromWatchlist(arg0: Id): Promise<void> {
        return this.call(() => this.actor.removeFromWatchlist(arg0));
    }
    async saveCallerUserProfile(arg0: UserProfile): Promise<void> {
        return this.call(() => this.actor.saveCallerUserProfile(arg0));
    }
    async saveEpisodeProgress(arg0: Id, arg1: bigint): Promise<void> {
        return this.call(() => this.actor.saveEpisodeProgress(arg0, arg1));
    }
    async searchShows(arg0: string): Promise<Array<Show>> {
        return this.call(async () => {
            const result = await this.actor.searchShows(arg0);
            return result as Array<Show>;
        });
    }
    async signUp(arg0: string, arg1: string): Promise<SignUpResult> {
        return this.call(async () => {
            const result = await this.actor.signUp(arg0, arg1);
            // Candid variant: { ok: string } or { err: string }
            if ('ok' in result) return { ok: result.ok };
            return { err: result.err };
        });
    }
    async updateEpisode(arg0: Id, arg1: bigint, arg2: bigint, arg3: string, arg4: string, arg5: string, arg6: string, arg7: bigint): Promise<void> {
        return this.call(() => this.actor.updateEpisode(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7));
    }
    async updateShow(arg0: Id, arg1: string, arg2: string, arg3: string, arg4: string, arg5: boolean, arg6: boolean): Promise<void> {
        return this.call(() => this.actor.updateShow(arg0, arg1, arg2, arg3, arg4, arg5, arg6));
    }
    async validateSession(arg0: string): Promise<string | null> {
        return this.call(async () => {
            const result = await this.actor.validateSession(arg0);
            return result.length === 0 ? null : result[0] as string;
        });
    }
}

export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}

export function createActor(canisterId: string, options: CreateActorOptions = {}): Backend {
    const agent = options.agent || HttpAgent.createSync({
        ...options.agentOptions
    });
    if (options.agent && options.agentOptions) {
        console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions.");
    }
    const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId: canisterId,
        ...options.actorOptions
    });
    return new Backend(actor, options.processError);
}
