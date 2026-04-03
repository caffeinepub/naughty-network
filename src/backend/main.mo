import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Mixin support
  include MixinStorage();

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

  // Types
  module Show {
    public type Id = Nat;

    public type Show = {
      id : Id;
      title : Text;
      description : Text;
      genre : Text;
      thumbnailBlob : ?Storage.ExternalBlob;
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
      videoBlob : ?Storage.ExternalBlob;
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

  // Storage
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

  let shows = Map.empty<Show.Id, Show.Show>();
  let episodes = Map.empty<Episode.Id, Episode.Episode>();
  let watchlists = Map.empty<Principal, List.List<WatchlistEntry.WatchlistEntry>>();
  let progress = Map.empty<Principal, List.List<WatchProgress>>();

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
    // Track join time on first save
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

  // Shows — no auth required, frontend password gate handles access control
  public shared ({ caller }) func createShow(title : Text, description : Text, genre : Text, thumbnailBlob : ?Storage.ExternalBlob, isPublic : Bool) : async Show.Show {
    let id = nextShowId;
    nextShowId += 1;
    let show : Show.Show = {
      id;
      title;
      description;
      genre;
      thumbnailBlob;
      isFeatured = false;
      isPublic;
      creatorId = caller;
      createdAt = Time.now();
    };
    shows.add(id, show);
    show;
  };

  public shared ({ caller }) func updateShow(showId : Show.Id, title : Text, description : Text, genre : Text, thumbnailBlob : ?Storage.ExternalBlob, isFeatured : Bool, isPublic : Bool) : async () {
    switch (shows.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?existingShow) {
        let updatedShow : Show.Show = {
          id = existingShow.id;
          title;
          description;
          genre;
          thumbnailBlob;
          isFeatured;
          isPublic;
          creatorId = existingShow.creatorId;
          createdAt = existingShow.createdAt;
        };
        shows.add(showId, updatedShow);
      };
    };
  };

  public shared ({ caller }) func deleteShow(showId : Show.Id) : async () {
    switch (shows.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?show) {
        shows.remove(showId);
        // Delete episodes
        let episodeIdsToDelete = List.empty<Episode.Id>();
        for ((episodeId, episode) in episodes.entries()) {
          if (episode.showId == showId) {
            episodeIdsToDelete.add(episodeId);
          };
        };
        for (episodeId in episodeIdsToDelete.values()) {
          episodes.remove(episodeId);
        };
      };
    };
  };

  public query ({ caller }) func getShow(showId : Show.Id) : async Show.Show {
    switch (shows.get(showId)) {
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
    let iter = shows.values().map(
      func(show) {
        if (publicOnly) {
          if (show.isPublic) {
            ?show;
          } else {
            null;
          };
        } else {
          ?show;
        };
      }
    );
    iter.toArray().filterMap(func(x) { x }).sort();
  };

  public query func searchShows(searchTerm : Text) : async [Show.Show] {
    let results = List.empty<Show.Show>();
    let lowerSearchTerm = searchTerm.toLower();
    for ((_, show) in shows.entries()) {
      if (show.title.toLower().contains(#text lowerSearchTerm) and show.isPublic) {
        results.add(show);
      };
    };
    results.toArray();
  };

  public query func getFeaturedShow() : async ?Show.Show {
    for ((_, show) in shows.entries()) {
      if (show.isFeatured and show.isPublic) {
        return ?show;
      };
    };
    null;
  };

  // Episodes — no auth required, frontend password gate handles access control
  public shared ({ caller }) func createEpisode(showId : Show.Id, seasonNumber : Nat, episodeNumber : Nat, title : Text, description : Text, videoBlob : ?Storage.ExternalBlob, duration : Nat) : async Episode.Episode {
    switch (shows.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?show) {
        let id = nextEpisodeId;
        nextEpisodeId += 1;
        let episode : Episode.Episode = {
          id;
          showId;
          seasonNumber;
          episodeNumber;
          title;
          description;
          videoBlob;
          duration;
          createdAt = Time.now();
        };
        episodes.add(id, episode);
        episode;
      };
    };
  };

  public shared ({ caller }) func updateEpisode(episodeId : Episode.Id, seasonNumber : Nat, episodeNumber : Nat, title : Text, description : Text, videoBlob : ?Storage.ExternalBlob, duration : Nat) : async () {
    switch (episodes.get(episodeId)) {
      case (null) { Runtime.trap("Episode does not exist") };
      case (?existingEpisode) {
        let updatedEpisode : Episode.Episode = {
          id = existingEpisode.id;
          showId = existingEpisode.showId;
          seasonNumber;
          episodeNumber;
          title;
          description;
          videoBlob;
          duration;
          createdAt = existingEpisode.createdAt;
        };
        episodes.add(episodeId, updatedEpisode);
      };
    };
  };

  public shared ({ caller }) func deleteEpisode(episodeId : Episode.Id) : async () {
    switch (episodes.get(episodeId)) {
      case (null) { Runtime.trap("Episode does not exist") };
      case (?episode) {
        episodes.remove(episodeId);
      };
    };
  };

  public query ({ caller }) func getEpisode(episodeId : Episode.Id) : async Episode.Episode {
    switch (episodes.get(episodeId)) {
      case (null) { Runtime.trap("Episode does not exist") };
      case (?episode) {
        switch (shows.get(episode.showId)) {
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
    switch (shows.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?show) {
        if (not (show.isPublic or caller == show.creatorId or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Show is not public");
        };
        let results = List.empty<Episode.Episode>();
        for ((_, episode) in episodes.entries()) {
          if (episode.showId == showId) {
            results.add(episode);
          };
        };
        results.toArray();
      };
    };
  };

  public query ({ caller }) func getEpisodesBySeason(showId : Show.Id, seasonNumber : Nat) : async [Episode.Episode] {
    switch (shows.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?show) {
        if (not (show.isPublic or caller == show.creatorId or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Show is not public");
        };
        let results = List.empty<Episode.Episode>();
        for ((_, episode) in episodes.entries()) {
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
    switch (shows.get(showId)) {
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
    switch (shows.get(showId)) {
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
    switch (episodes.get(episodeId)) {
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
