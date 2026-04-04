/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Episode {
  'id' : Id,
  'title' : string,
  'duration' : bigint,
  'showId' : Id,
  'createdAt' : bigint,
  'description' : string,
  'videoUrl' : string,
  'thumbnailUrl' : string,
  'seasonNumber' : bigint,
  'episodeNumber' : bigint,
}
export interface EpisodeProgress {
  'episodeId' : Id,
  'updatedAt' : bigint,
  'timestamp' : bigint,
}
export type Id = bigint;
export interface Show {
  'id' : Id,
  'title' : string,
  'createdAt' : bigint,
  'creatorId' : Principal,
  'description' : string,
  'thumbnailUrl' : string,
  'isFeatured' : boolean,
  'genre' : string,
  'isPublic' : boolean,
}
export interface UserProfile { 'name' : string }
export interface UserRecord {
  'principal' : Principal,
  'name' : string,
  'joinedAt' : bigint,
}
export interface UserAccountSummary {
  'username' : string,
  'createdAt' : bigint,
}
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export type SignUpResult = { 'ok' : string } | { 'err' : string };
export interface _SERVICE {
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'addToWatchlist' : ActorMethod<[Id], undefined>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'createEpisode' : ActorMethod<
    [Id, bigint, bigint, string, string, string, string, bigint],
    Episode
  >,
  'createShow' : ActorMethod<
    [string, string, string, string, boolean],
    Show
  >,
  'deleteEpisode' : ActorMethod<[Id], undefined>,
  'deleteShow' : ActorMethod<[Id], undefined>,
  'getAllShows' : ActorMethod<[boolean], Array<Show>>,
  'getAllUsers' : ActorMethod<[], Array<UserRecord>>,
  'getAllUsersV2' : ActorMethod<[], Array<UserAccountSummary>>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getContinueWatching' : ActorMethod<[], Array<EpisodeProgress>>,
  'getEpisode' : ActorMethod<[Id], Episode>,
  'getEpisodesBySeason' : ActorMethod<[Id, bigint], Array<Episode>>,
  'getEpisodesByShow' : ActorMethod<[Id], Array<Episode>>,
  'getFeaturedShow' : ActorMethod<[], [] | [Show]>,
  'getShow' : ActorMethod<[Id], Show>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'getWatchlist' : ActorMethod<[], Array<Id>>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'login' : ActorMethod<[string, string], [] | [string]>,
  'logout' : ActorMethod<[string], undefined>,
  'registerUser' : ActorMethod<[], undefined>,
  'removeFromWatchlist' : ActorMethod<[Id], undefined>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'saveEpisodeProgress' : ActorMethod<[Id, bigint], undefined>,
  'searchShows' : ActorMethod<[string], Array<Show>>,
  'signUp' : ActorMethod<[string, string], SignUpResult>,
  'updateEpisode' : ActorMethod<
    [Id, bigint, bigint, string, string, string, string, bigint],
    undefined
  >,
  'updateShow' : ActorMethod<
    [Id, string, string, string, string, boolean, boolean],
    undefined
  >,
  'validateSession' : ActorMethod<[string], [] | [string]>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
