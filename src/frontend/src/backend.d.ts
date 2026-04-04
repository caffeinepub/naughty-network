import type { Principal } from "@icp-sdk/core/principal";
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
