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
  'thumbnailUrl' : IDL.Text,
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
export const UserAccountSummary = IDL.Record({
  'username' : IDL.Text,
  'createdAt' : IDL.Int,
});
export const SignUpResult = IDL.Variant({
  'ok' : IDL.Text,
  'err' : IDL.Text,
});

export const idlService = IDL.Service({
  '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
  'addToWatchlist' : IDL.Func([Id], [], []),
  'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
  'createEpisode' : IDL.Func(
      [Id, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat],
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
  'getAllUsersV2' : IDL.Func([], [IDL.Vec(UserAccountSummary)], ['query']),
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
  'login' : IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(IDL.Text)], []),
  'logout' : IDL.Func([IDL.Text], [], []),
  'registerUser' : IDL.Func([], [], []),
  'removeFromWatchlist' : IDL.Func([Id], [], []),
  'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
  'saveEpisodeProgress' : IDL.Func([Id, IDL.Nat], [], []),
  'searchShows' : IDL.Func([IDL.Text], [IDL.Vec(Show)], ['query']),
  'signUp' : IDL.Func([IDL.Text, IDL.Text], [SignUpResult], []),
  'updateEpisode' : IDL.Func(
      [Id, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat],
      [],
      [],
    ),
  'updateShow' : IDL.Func(
      [Id, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Bool, IDL.Bool],
      [],
      [],
    ),
  'validateSession' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
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
    'thumbnailUrl' : IDL.Text,
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
  const UserAccountSummary = IDL.Record({
    'username' : IDL.Text,
    'createdAt' : IDL.Int,
  });
  const SignUpResult = IDL.Variant({
    'ok' : IDL.Text,
    'err' : IDL.Text,
  });

  return IDL.Service({
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'addToWatchlist' : IDL.Func([Id], [], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'createEpisode' : IDL.Func(
        [Id, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat],
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
    'getAllUsersV2' : IDL.Func([], [IDL.Vec(UserAccountSummary)], ['query']),
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
    'login' : IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(IDL.Text)], []),
    'logout' : IDL.Func([IDL.Text], [], []),
    'registerUser' : IDL.Func([], [], []),
    'removeFromWatchlist' : IDL.Func([Id], [], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'saveEpisodeProgress' : IDL.Func([Id, IDL.Nat], [], []),
    'searchShows' : IDL.Func([IDL.Text], [IDL.Vec(Show)], ['query']),
    'signUp' : IDL.Func([IDL.Text, IDL.Text], [SignUpResult], []),
    'updateEpisode' : IDL.Func(
        [Id, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat],
        [],
        [],
      ),
    'updateShow' : IDL.Func(
        [Id, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Bool, IDL.Bool],
        [],
        [],
      ),
    'validateSession' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
