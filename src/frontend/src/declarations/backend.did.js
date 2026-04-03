/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const Id = IDL.Nat;
export const UserRole = IDL.Variant({
  'admin' : IDL.Null,
  'user' : IDL.Null,
  'guest' : IDL.Null,
});
export const Episode = IDL.Record({
  'id' : Id,
  'title' : IDL.Text,
  'duration' : IDL.Nat,
  'showId' : Id,
  'createdAt' : IDL.Int,
  'description' : IDL.Text,
  'videoUrl' : IDL.Text,
  'seasonNumber' : IDL.Nat,
  'episodeNumber' : IDL.Nat,
});
export const Show = IDL.Record({
  'id' : Id,
  'title' : IDL.Text,
  'createdAt' : IDL.Int,
  'creatorId' : IDL.Principal,
  'description' : IDL.Text,
  'thumbnailUrl' : IDL.Text,
  'isFeatured' : IDL.Bool,
  'genre' : IDL.Text,
  'isPublic' : IDL.Bool,
});
export const UserProfile = IDL.Record({ 'name' : IDL.Text });
export const UserRecord = IDL.Record({
  'principal' : IDL.Principal,
  'name' : IDL.Text,
  'joinedAt' : IDL.Int,
});
export const EpisodeProgress = IDL.Record({
  'episodeId' : Id,
  'updatedAt' : IDL.Int,
  'timestamp' : IDL.Nat,
});

export const idlService = IDL.Service({
  '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
  'addToWatchlist' : IDL.Func([Id], [], []),
  'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
  'createEpisode' : IDL.Func(
      [Id, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat],
      [Episode],
      [],
    ),
  'createShow' : IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Bool],
      [Show],
      [],
    ),
  'deleteEpisode' : IDL.Func([Id], [], []),
  'deleteShow' : IDL.Func([Id], [], []),
  'getAllShows' : IDL.Func([IDL.Bool], [IDL.Vec(Show)], ['query']),
  'getAllUsers' : IDL.Func([], [IDL.Vec(UserRecord)], ['query']),
  'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
  'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
  'getContinueWatching' : IDL.Func([], [IDL.Vec(EpisodeProgress)], ['query']),
  'getEpisode' : IDL.Func([Id], [Episode], ['query']),
  'getEpisodesBySeason' : IDL.Func([Id, IDL.Nat], [IDL.Vec(Episode)], ['query']),
  'getEpisodesByShow' : IDL.Func([Id], [IDL.Vec(Episode)], ['query']),
  'getFeaturedShow' : IDL.Func([], [IDL.Opt(Show)], ['query']),
  'getShow' : IDL.Func([Id], [Show], ['query']),
  'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
  'getWatchlist' : IDL.Func([], [IDL.Vec(Id)], ['query']),
  'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
  'removeFromWatchlist' : IDL.Func([Id], [], []),
  'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
  'saveEpisodeProgress' : IDL.Func([Id, IDL.Nat], [], []),
  'searchShows' : IDL.Func([IDL.Text], [IDL.Vec(Show)], ['query']),
  'updateEpisode' : IDL.Func(
      [Id, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat],
      [],
      [],
    ),
  'updateShow' : IDL.Func(
      [Id, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Bool, IDL.Bool],
      [],
      [],
    ),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const Id = IDL.Nat;
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const Episode = IDL.Record({
    'id' : Id,
    'title' : IDL.Text,
    'duration' : IDL.Nat,
    'showId' : Id,
    'createdAt' : IDL.Int,
    'description' : IDL.Text,
    'videoUrl' : IDL.Text,
    'seasonNumber' : IDL.Nat,
    'episodeNumber' : IDL.Nat,
  });
  const Show = IDL.Record({
    'id' : Id,
    'title' : IDL.Text,
    'createdAt' : IDL.Int,
    'creatorId' : IDL.Principal,
    'description' : IDL.Text,
    'thumbnailUrl' : IDL.Text,
    'isFeatured' : IDL.Bool,
    'genre' : IDL.Text,
    'isPublic' : IDL.Bool,
  });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const UserRecord = IDL.Record({
    'principal' : IDL.Principal,
    'name' : IDL.Text,
    'joinedAt' : IDL.Int,
  });
  const EpisodeProgress = IDL.Record({
    'episodeId' : Id,
    'updatedAt' : IDL.Int,
    'timestamp' : IDL.Nat,
  });

  return IDL.Service({
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'addToWatchlist' : IDL.Func([Id], [], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'createEpisode' : IDL.Func(
        [Id, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat],
        [Episode],
        [],
      ),
    'createShow' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Bool],
        [Show],
        [],
      ),
    'deleteEpisode' : IDL.Func([Id], [], []),
    'deleteShow' : IDL.Func([Id], [], []),
    'getAllShows' : IDL.Func([IDL.Bool], [IDL.Vec(Show)], ['query']),
    'getAllUsers' : IDL.Func([], [IDL.Vec(UserRecord)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getContinueWatching' : IDL.Func([], [IDL.Vec(EpisodeProgress)], ['query']),
    'getEpisode' : IDL.Func([Id], [Episode], ['query']),
    'getEpisodesBySeason' : IDL.Func([Id, IDL.Nat], [IDL.Vec(Episode)], ['query']),
    'getEpisodesByShow' : IDL.Func([Id], [IDL.Vec(Episode)], ['query']),
    'getFeaturedShow' : IDL.Func([], [IDL.Opt(Show)], ['query']),
    'getShow' : IDL.Func([Id], [Show], ['query']),
    'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'getWatchlist' : IDL.Func([], [IDL.Vec(Id)], ['query']),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'removeFromWatchlist' : IDL.Func([Id], [], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'saveEpisodeProgress' : IDL.Func([Id, IDL.Nat], [], []),
    'searchShows' : IDL.Func([IDL.Text], [IDL.Vec(Show)], ['query']),
    'updateEpisode' : IDL.Func(
        [Id, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat],
        [],
        [],
      ),
    'updateShow' : IDL.Func(
        [Id, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Bool, IDL.Bool],
        [],
        [],
      ),
  });
};

export const init = ({ IDL }) => { return []; };
