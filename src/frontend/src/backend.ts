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
    getUsernameByPrincipal(): Promise<string | null>;
    getWatchlist(): Promise<Array<Id>>;
    isCallerAdmin(): Promise<boolean>;
    login(username: string, passwordHash: string): Promise<string | null>;
    logout(token: string): Promise<void>;
    registerUser(): Promise<void>;
    registerWithII(username: string): Promise<SignUpResult>;
    removeFromWatchlist(showId: Id): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveEpisodeProgress(episodeId: Id, timestamp: bigint): Promise<void>;
    searchShows(searchTerm: string): Promise<Array<Show>>;
    signUp(username: string, passwordHash: string): Promise<SignUpResult>;
    updateEpisode(episodeId: Id, seasonNumber: bigint, episodeNumber: bigint, title: string, description: string, videoUrl: string, thumbnailUrl: string, duration: bigint): Promise<void>;
    updateShow(showId: Id, title: string, description: string, genre: string, thumbnailUrl: string, isFeatured: boolean, isPublic: boolean): Promise<void>;
    validateSession(token: string): Promise<string | null>;
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
            const result = await (this.actor as any).createEpisode(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
            return result as Episode;
        });
    }
    async createShow(arg0: string, arg1: string, arg2: string, arg3: string, arg4: boolean): Promise<Show> {
        return this.call(async () => {
            const result = await (this.actor as any).createShow(arg0, arg1, arg2, arg3, arg4);
            return result as Show;
        });
    }
    async deleteEpisode(arg0: Id): Promise<void> {
        return this.call(() => (this.actor as any).deleteEpisode(arg0));
    }
    async deleteShow(arg0: Id): Promise<void> {
        return this.call(() => (this.actor as any).deleteShow(arg0));
    }
    async getAllShows(arg0: boolean): Promise<Array<Show>> {
        return this.call(async () => {
            const result = await (this.actor as any).getAllShows(arg0);
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
            const result = await (this.actor as any).getAllUsersV2();
            return result as Array<UserAccountSummary>;
        });
    }
    async getCallerUserProfile(): Promise<UserProfile | null> {
        return this.call(async () => {
            const result = await (this.actor as any).getCallerUserProfile();
            return result.length === 0 ? null : result[0] as UserProfile;
        });
    }
    async getCallerUserRole(): Promise<UserRole> {
        return this.call(async () => {
            const result = await (this.actor as any).getCallerUserRole();
            return "admin" in result ? UserRole.admin : "user" in result ? UserRole.user : UserRole.guest;
        });
    }
    async getContinueWatching(): Promise<Array<EpisodeProgress>> {
        return this.call(() => (this.actor as any).getContinueWatching() as Promise<Array<EpisodeProgress>>);
    }
    async getEpisode(arg0: Id): Promise<Episode> {
        return this.call(async () => {
            const result = await (this.actor as any).getEpisode(arg0);
            return result as Episode;
        });
    }
    async getEpisodesBySeason(arg0: Id, arg1: bigint): Promise<Array<Episode>> {
        return this.call(async () => {
            const result = await (this.actor as any).getEpisodesBySeason(arg0, arg1);
            return result as Array<Episode>;
        });
    }
    async getEpisodesByShow(arg0: Id): Promise<Array<Episode>> {
        return this.call(async () => {
            const result = await (this.actor as any).getEpisodesByShow(arg0);
            return result as Array<Episode>;
        });
    }
    async getFeaturedShow(): Promise<Show | null> {
        return this.call(async () => {
            const result = await (this.actor as any).getFeaturedShow();
            return result.length === 0 ? null : result[0] as Show;
        });
    }
    async getShow(arg0: Id): Promise<Show> {
        return this.call(async () => {
            const result = await (this.actor as any).getShow(arg0);
            return result as Show;
        });
    }
    async getUserProfile(arg0: Principal): Promise<UserProfile | null> {
        return this.call(async () => {
            const result = await (this.actor as any).getUserProfile(arg0);
            return result.length === 0 ? null : result[0] as UserProfile;
        });
    }
    async getUsernameByPrincipal(): Promise<string | null> {
        return this.call(async () => {
            const result = await (this.actor as any).getUsernameByPrincipal();
            if (Array.isArray(result)) {
                return result.length === 0 ? null : result[0] as string;
            }
            return result as string | null;
        });
    }
    async getWatchlist(): Promise<Array<Id>> {
        return this.call(() => (this.actor as any).getWatchlist() as Promise<Array<Id>>);
    }
    async isCallerAdmin(): Promise<boolean> {
        return this.call(() => (this.actor as any).isCallerAdmin());
    }
    async login(arg0: string, arg1: string): Promise<string | null> {
        return this.call(async () => {
            const result = await (this.actor as any).login(arg0, arg1);
            if (Array.isArray(result)) {
                return result.length === 0 ? null : result[0] as string;
            }
            return result as string | null;
        });
    }
    async logout(arg0: string): Promise<void> {
        return this.call(() => (this.actor as any).logout(arg0));
    }
    async registerUser(): Promise<void> {
        return this.call(() => (this.actor as any).registerUser());
    }
    async registerWithII(arg0: string): Promise<SignUpResult> {
        return this.call(async () => {
            const result = await (this.actor as any).registerWithII(arg0);
            if (result && typeof result === 'object') {
                if ('ok' in result) return { ok: result.ok as string };
                if ('err' in result) return { err: result.err as string };
            }
            return { err: 'Unknown error' };
        });
    }
    async removeFromWatchlist(arg0: Id): Promise<void> {
        return this.call(() => (this.actor as any).removeFromWatchlist(arg0));
    }
    async saveCallerUserProfile(arg0: UserProfile): Promise<void> {
        return this.call(() => (this.actor as any).saveCallerUserProfile(arg0));
    }
    async saveEpisodeProgress(arg0: Id, arg1: bigint): Promise<void> {
        return this.call(() => (this.actor as any).saveEpisodeProgress(arg0, arg1));
    }
    async searchShows(arg0: string): Promise<Array<Show>> {
        return this.call(async () => {
            const result = await (this.actor as any).searchShows(arg0);
            return result as Array<Show>;
        });
    }
    async signUp(arg0: string, arg1: string): Promise<SignUpResult> {
        return this.call(async () => {
            const result = await (this.actor as any).signUp(arg0, arg1);
            if (result && typeof result === 'object') {
                if ('ok' in result) return { ok: result.ok as string };
                if ('err' in result) return { err: result.err as string };
            }
            return { err: 'Unknown error' };
        });
    }
    async updateEpisode(arg0: Id, arg1: bigint, arg2: bigint, arg3: string, arg4: string, arg5: string, arg6: string, arg7: bigint): Promise<void> {
        return this.call(() => (this.actor as any).updateEpisode(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7));
    }
    async updateShow(arg0: Id, arg1: string, arg2: string, arg3: string, arg4: string, arg5: boolean, arg6: boolean): Promise<void> {
        return this.call(() => (this.actor as any).updateShow(arg0, arg1, arg2, arg3, arg4, arg5, arg6));
    }
    async validateSession(arg0: string): Promise<string | null> {
        return this.call(async () => {
            const result = await (this.actor as any).validateSession(arg0);
            if (Array.isArray(result)) {
                return result.length === 0 ? null : result[0] as string;
            }
            return result as string | null;
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
