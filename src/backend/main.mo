import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserRole = AccessControl.UserRole;
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  public type UserRecord = {
    principal : Principal;
    name : Text;
    joinedAt : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userJoinedAt = Map.empty<Principal, Int>();

  // ── Old types (for migration from blob-based storage) ──────────────────────
  // The previous version stored these types in stable maps named `shows` and `episodes`.
  // We keep those same variable names with the OLD types so the runtime can deserialise
  // existing stable memory without a compatibility error. Then in postupgrade we migrate
  // all entries into the new `showsV2` / `episodesV2` maps and clear the old maps.
  type OldShow = {
    id : Nat;
    title : Text;
    description : Text;
    genre : Text;
    thumbnailBlob : ?Blob;
    isFeatured : Bool;
    isPublic : Bool;
    creatorId : Principal;
    createdAt : Int;
  };

  type OldEpisode = {
    id : Nat;
    showId : Nat;
    seasonNumber : Nat;
    episodeNumber : Nat;
    title : Text;
    description : Text;
    videoBlob : ?Blob;
    duration : Nat;
    createdAt : Int;
  };

  // Old stable maps -- same names as before so deserialization succeeds
  let shows = Map.empty<Nat, OldShow>();
  let episodes = Map.empty<Nat, OldEpisode>();

  // ── New types ───────────────────────────────────────────────────────────────
  module Show {
    public type Id = Nat;

    public type Show = {
      id : Id;
      title : Text;
      description : Text;
      genre : Text;
      thumbnailUrl : Text;
      isFeatured : Bool;
      isPublic : Bool;
      creatorId : Principal;
      createdAt : Int;
    };

    public func compare(show1 : Show, show2 : Show) : Order.Order {
      Nat.compare(show1.id, show2.id);
    };
  };

  module Episode {
    public type Id = Nat;

    public type Episode = {
      id : Id;
      showId : Show.Id;
      seasonNumber : Nat;
      episodeNumber : Nat;
      title : Text;
      description : Text;
      videoUrl : Text;
      duration : Nat;
      createdAt : Int;
    };

    public func compare(episode1 : Episode, episode2 : Episode) : Order.Order {
      Nat.compare(episode1.id, episode2.id);
    };
  };

  module EpisodeProgress {
    public type EpisodeProgress = {
      episodeId : Episode.Id;
      timestamp : Nat;
      updatedAt : Int;
    };

    public func compareByUpdatedAt(p1 : EpisodeProgress, p2 : EpisodeProgress) : Order.Order {
      Int.compare(p2.updatedAt, p1.updatedAt);
    };
  };

  type WatchProgress = EpisodeProgress.EpisodeProgress;

  // Storage counters
  var nextShowId = 1;
  var nextEpisodeId = 1;

  module WatchlistEntry {
    public type WatchlistEntry = {
      showId : Show.Id;
      createdAt : Int;
    };

    public func compare(entry1 : WatchlistEntry, entry2 : WatchlistEntry) : Order.Order {
      Nat.compare(entry1.showId, entry2.showId);
    };
  };

  // New URL-based stable maps (v2)
  let showsV2 = Map.empty<Show.Id, Show.Show>();
  let episodesV2 = Map.empty<Episode.Id, Episode.Episode>();
  let watchlists = Map.empty<Principal, List.List<WatchlistEntry.WatchlistEntry>>();
  let progress = Map.empty<Principal, List.List<WatchProgress>>();

  // Migration: on upgrade, copy old blob-based records into new URL-based maps
  system func postupgrade() {
    for ((id, old) in shows.entries()) {
      let migrated : Show.Show = {
        id = old.id;
        title = old.title;
        description = old.description;
        genre = old.genre;
        thumbnailUrl = "";
        isFeatured = old.isFeatured;
        isPublic = old.isPublic;
        creatorId = old.creatorId;
        createdAt = old.createdAt;
      };
      showsV2.add(id, migrated);
      // Keep nextShowId in sync
      if (old.id >= nextShowId) {
        nextShowId := old.id + 1;
      };
    };
    shows.clear();

    for ((id, old) in episodes.entries()) {
      let migrated : Episode.Episode = {
        id = old.id;
        showId = old.showId;
        seasonNumber = old.seasonNumber;
        episodeNumber = old.episodeNumber;
        title = old.title;
        description = old.description;
        videoUrl = "";
        duration = old.duration;
        createdAt = old.createdAt;
      };
      episodesV2.add(id, migrated);
      if (old.id >= nextEpisodeId) {
        nextEpisodeId := old.id + 1;
      };
    };
    episodes.clear();
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (userJoinedAt.get(caller)) {
      case (null) { userJoinedAt.add(caller, Time.now()) };
      case (?_) {};
    };
    userProfiles.add(caller, profile);
  };

  // Admin: get all registered users
  public query func getAllUsers() : async [UserRecord] {
    let results = List.empty<UserRecord>();
    for ((principal, profile) in userProfiles.entries()) {
      let joinedAt = switch (userJoinedAt.get(principal)) {
        case (null) { 0 };
        case (?t) { t };
      };
      results.add({
        principal;
        name = profile.name;
        joinedAt;
      });
    };
    results.toArray();
  };

  // Shows
  public shared ({ caller }) func createShow(title : Text, description : Text, genre : Text, thumbnailUrl : Text, isPublic : Bool) : async Show.Show {
    let id = nextShowId;
    nextShowId += 1;
    let show : Show.Show = {
      id;
      title;
      description;
      genre;
      thumbnailUrl;
      isFeatured = false;
      isPublic;
      creatorId = caller;
      createdAt = Time.now();
    };
    showsV2.add(id, show);
    show;
  };

  public shared ({ caller }) func updateShow(showId : Show.Id, title : Text, description : Text, genre : Text, thumbnailUrl : Text, isFeatured : Bool, isPublic : Bool) : async () {
    switch (showsV2.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?existingShow) {
        let updatedShow : Show.Show = {
          id = existingShow.id;
          title;
          description;
          genre;
          thumbnailUrl;
          isFeatured;
          isPublic;
          creatorId = existingShow.creatorId;
          createdAt = existingShow.createdAt;
        };
        showsV2.add(showId, updatedShow);
      };
    };
  };

  public shared ({ caller }) func deleteShow(showId : Show.Id) : async () {
    switch (showsV2.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?_show) {
        showsV2.remove(showId);
        let episodeIdsToDelete = List.empty<Episode.Id>();
        for ((episodeId, episode) in episodesV2.entries()) {
          if (episode.showId == showId) {
            episodeIdsToDelete.add(episodeId);
          };
        };
        for (episodeId in episodeIdsToDelete.values()) {
          episodesV2.remove(episodeId);
        };
      };
    };
  };

  public query ({ caller }) func getShow(showId : Show.Id) : async Show.Show {
    switch (showsV2.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?show) {
        if (show.isPublic or caller == show.creatorId or AccessControl.isAdmin(accessControlState, caller)) {
          show;
        } else {
          Runtime.trap("Unauthorized: Show is not public");
        };
      };
    };
  };

  public query ({ caller }) func getAllShows(publicOnly : Bool) : async [Show.Show] {
    let results = List.empty<Show.Show>();
    for ((_, show) in showsV2.entries()) {
      if (publicOnly) {
        if (show.isPublic) {
          results.add(show);
        };
      } else {
        results.add(show);
      };
    };
    results.toArray().sort();
  };

  public query func searchShows(searchTerm : Text) : async [Show.Show] {
    let results = List.empty<Show.Show>();
    let lowerSearchTerm = searchTerm.toLower();
    for ((_, show) in showsV2.entries()) {
      if (show.title.toLower().contains(#text lowerSearchTerm) and show.isPublic) {
        results.add(show);
      };
    };
    results.toArray();
  };

  public query func getFeaturedShow() : async ?Show.Show {
    for ((_, show) in showsV2.entries()) {
      if (show.isFeatured and show.isPublic) {
        return ?show;
      };
    };
    null;
  };

  // Episodes
  public shared ({ caller }) func createEpisode(showId : Show.Id, seasonNumber : Nat, episodeNumber : Nat, title : Text, description : Text, videoUrl : Text, duration : Nat) : async Episode.Episode {
    switch (showsV2.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?_show) {
        let id = nextEpisodeId;
        nextEpisodeId += 1;
        let episode : Episode.Episode = {
          id;
          showId;
          seasonNumber;
          episodeNumber;
          title;
          description;
          videoUrl;
          duration;
          createdAt = Time.now();
        };
        episodesV2.add(id, episode);
        episode;
      };
    };
  };

  public shared ({ caller }) func updateEpisode(episodeId : Episode.Id, seasonNumber : Nat, episodeNumber : Nat, title : Text, description : Text, videoUrl : Text, duration : Nat) : async () {
    switch (episodesV2.get(episodeId)) {
      case (null) { Runtime.trap("Episode does not exist") };
      case (?existingEpisode) {
        let updatedEpisode : Episode.Episode = {
          id = existingEpisode.id;
          showId = existingEpisode.showId;
          seasonNumber;
          episodeNumber;
          title;
          description;
          videoUrl;
          duration;
          createdAt = existingEpisode.createdAt;
        };
        episodesV2.add(episodeId, updatedEpisode);
      };
    };
  };

  public shared ({ caller }) func deleteEpisode(episodeId : Episode.Id) : async () {
    switch (episodesV2.get(episodeId)) {
      case (null) { Runtime.trap("Episode does not exist") };
      case (?_) {
        episodesV2.remove(episodeId);
      };
    };
  };

  public query ({ caller }) func getEpisode(episodeId : Episode.Id) : async Episode.Episode {
    switch (episodesV2.get(episodeId)) {
      case (null) { Runtime.trap("Episode does not exist") };
      case (?episode) {
        switch (showsV2.get(episode.showId)) {
          case (null) { Runtime.trap("Show does not exist") };
          case (?show) {
            if (show.isPublic or caller == show.creatorId or AccessControl.isAdmin(accessControlState, caller)) {
              episode;
            } else {
              Runtime.trap("Unauthorized: Show is not public");
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getEpisodesByShow(showId : Show.Id) : async [Episode.Episode] {
    switch (showsV2.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?show) {
        if (not (show.isPublic or caller == show.creatorId or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Show is not public");
        };
        let results = List.empty<Episode.Episode>();
        for ((_, episode) in episodesV2.entries()) {
          if (episode.showId == showId) {
            results.add(episode);
          };
        };
        results.toArray();
      };
    };
  };

  public query ({ caller }) func getEpisodesBySeason(showId : Show.Id, seasonNumber : Nat) : async [Episode.Episode] {
    switch (showsV2.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?show) {
        if (not (show.isPublic or caller == show.creatorId or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Show is not public");
        };
        let results = List.empty<Episode.Episode>();
        for ((_, episode) in episodesV2.entries()) {
          if (episode.showId == showId and episode.seasonNumber == seasonNumber) {
            results.add(episode);
          };
        };
        results.toArray();
      };
    };
  };

  // Watchlist
  public shared ({ caller }) func addToWatchlist(showId : Show.Id) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add to watchlist");
    };
    switch (showsV2.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (_) {
        let entry : WatchlistEntry.WatchlistEntry = {
          showId;
          createdAt = Time.now();
        };
        let currentWatchlist = switch (watchlists.get(caller)) {
          case (null) { List.empty<WatchlistEntry.WatchlistEntry>() };
          case (?watchlist) { watchlist };
        };
        let filteredWatchlist = List.empty<WatchlistEntry.WatchlistEntry>();
        for (item in currentWatchlist.values()) {
          if (item.showId != showId) {
            filteredWatchlist.add(item);
          };
        };
        filteredWatchlist.add(entry);
        watchlists.add(caller, filteredWatchlist);
      };
    };
  };

  public shared ({ caller }) func removeFromWatchlist(showId : Show.Id) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove from watchlist");
    };
    switch (showsV2.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (_) {
        let currentWatchlist = switch (watchlists.get(caller)) {
          case (null) { List.empty<WatchlistEntry.WatchlistEntry>() };
          case (?watchlist) { watchlist };
        };
        let filteredWatchlist = List.empty<WatchlistEntry.WatchlistEntry>();
        for (item in currentWatchlist.values()) {
          if (item.showId != showId) {
            filteredWatchlist.add(item);
          };
        };
        watchlists.add(caller, filteredWatchlist);
      };
    };
  };

  public query ({ caller }) func getWatchlist() : async [Show.Id] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get watchlist");
    };
    switch (watchlists.get(caller)) {
      case (null) { [] };
      case (?watchlist) {
        let iter = watchlist.values().map(func(item) { item.showId });
        iter.toArray();
      };
    };
  };

  // Watch Progress
  public shared ({ caller }) func saveEpisodeProgress(episodeId : Episode.Id, timestamp : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save episode progress");
    };
    switch (episodesV2.get(episodeId)) {
      case (null) { Runtime.trap("Episode does not exist") };
      case (_) {
        let progressEntry : EpisodeProgress.EpisodeProgress = {
          episodeId;
          timestamp;
          updatedAt = Time.now();
        };
        let currentProgress = switch (progress.get(caller)) {
          case (null) { List.empty<EpisodeProgress.EpisodeProgress>() };
          case (?prog) { prog };
        };
        let filteredProgress = List.empty<EpisodeProgress.EpisodeProgress>();
        for (item in currentProgress.values()) {
          if (item.episodeId != episodeId) {
            filteredProgress.add(item);
          };
        };
        filteredProgress.add(progressEntry);
        progress.add(caller, filteredProgress);
      };
    };
  };

  public query ({ caller }) func getContinueWatching() : async [EpisodeProgress.EpisodeProgress] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get continue watching list");
    };
    switch (progress.get(caller)) {
      case (null) { [] };
      case (?prog) {
        prog.toArray().sort(EpisodeProgress.compareByUpdatedAt);
      };
    };
  };
};
