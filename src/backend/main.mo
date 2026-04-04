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

  // ── Internet Identity based auth ────────────────────────────────────────────
  // key = principal text, value = chosen username
  let principalUsernames = Map.empty<Text, Text>();
  // key = username (lowercase), value = principal text (for uniqueness check)
  let usernameIndex = Map.empty<Text, Text>();

  public shared ({ caller }) func registerWithII(username : Text) : async { #ok : Text; #err : Text } {
    if (caller.isAnonymous()) {
      return #err("Must be authenticated with Internet Identity");
    };
    // Validate username length
    let uLen = username.size();
    if (uLen < 3 or uLen > 20) {
      return #err("Username must be between 3 and 20 characters");
    };
    // Check for valid characters (alphanumeric + underscore)
    for (c in username.chars()) {
      if (not (c.isAlphabetic() or c.isDigit() or c == '_')) {
        return #err("Username can only contain letters, numbers, and underscores");
      };
    };
    let normalized = username.toLower();
    let callerText = caller.toText();
    // If principal already has a username, return it
    switch (principalUsernames.get(callerText)) {
      case (?existingUsername) { return #ok(existingUsername) };
      case (null) {};
    };
    // Check username uniqueness
    switch (usernameIndex.get(normalized)) {
      case (?_) { return #err("Username already taken") };
      case (null) {};
    };
    principalUsernames.add(callerText, username);
    usernameIndex.add(normalized, callerText);
    // Also register the principal join time
    switch (userJoinedAt.get(caller)) {
      case (null) { userJoinedAt.add(caller, Time.now()) };
      case (?_) {};
    };
    #ok(username);
  };

  public query ({ caller }) func getUsernameByPrincipal() : async ?Text {
    if (caller.isAnonymous()) {
      return null;
    };
    let callerText = caller.toText();
    principalUsernames.get(callerText);
  };

  public query func getAllUsersV2() : async [{ username : Text; createdAt : Int }] {
    let results = List.empty<{ username : Text; createdAt : Int }>();
    // Include II-registered users
    for ((principalText, username) in principalUsernames.entries()) {
      let principal = Principal.fromText(principalText);
      let createdAt = switch (userJoinedAt.get(principal)) {
        case (?t) { t };
        case (null) { 0 };
      };
      results.add({ username; createdAt });
    };
    results.toArray();
  };

  // ── Username/Password Auth (legacy, kept for data compatibility) ─────────────
  public type UserAccount = {
    username : Text;
    passwordHash : Text;
    createdAt : Int;
  };

  let usersV1 = Map.empty<Text, UserAccount>();
  let sessions = Map.empty<Text, Text>();

  private func normalizeUsername(username : Text) : Text {
    username.toLower();
  };

  private func generateToken(username : Text) : Text {
    let ts = Time.now().toText();
    username.concat("_").concat(ts);
  };

  public shared func signUp(username : Text, passwordHash : Text) : async { #ok : Text; #err : Text } {
    let uLen = username.size();
    if (uLen < 3 or uLen > 20) {
      return #err("Username must be between 3 and 20 characters");
    };
    for (c in username.chars()) {
      if (not (c.isAlphabetic() or c.isDigit() or c == '_')) {
        return #err("Username can only contain letters, numbers, and underscores");
      };
    };
    let normalized = normalizeUsername(username);
    switch (usersV1.get(normalized)) {
      case (?_) { return #err("Username already taken") };
      case (null) {};
    };
    if (passwordHash.size() < 8) {
      return #err("Invalid password hash");
    };
    let account : UserAccount = {
      username = username;
      passwordHash;
      createdAt = Time.now();
    };
    usersV1.add(normalized, account);
    #ok("Account created successfully");
  };

  public shared func login(username : Text, passwordHash : Text) : async ?Text {
    let normalized = normalizeUsername(username);
    switch (usersV1.get(normalized)) {
      case (null) { null };
      case (?account) {
        if (account.passwordHash == passwordHash) {
          let token = generateToken(normalized);
          sessions.add(token, account.username);
          ?token;
        } else {
          null;
        };
      };
    };
  };

  public query func validateSession(token : Text) : async ?Text {
    sessions.get(token);
  };

  public shared func logout(token : Text) : async () {
    sessions.remove(token);
  };

  // ── Legacy principal-based user profiles ────────────────────────────────────
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

  type OldEpisodeV2 = {
    id : Nat;
    showId : Nat;
    seasonNumber : Nat;
    episodeNumber : Nat;
    title : Text;
    description : Text;
    videoUrl : Text;
    duration : Nat;
    createdAt : Int;
  };

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
      thumbnailUrl : Text;
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

  let showsV2 = Map.empty<Show.Id, Show.Show>();
  let episodesV2 = Map.empty<Episode.Id, OldEpisodeV2>();
  let episodesV3 = Map.empty<Episode.Id, Episode.Episode>();
  let watchlists = Map.empty<Principal, List.List<WatchlistEntry.WatchlistEntry>>();
  let progress = Map.empty<Principal, List.List<WatchProgress>>();

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
      if (old.id >= nextShowId) {
        nextShowId := old.id + 1;
      };
    };
    shows.clear();

    for ((id, old) in episodes.entries()) {
      let migrated : OldEpisodeV2 = {
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

    for ((id, old) in episodesV2.entries()) {
      if (episodesV3.get(id) == null) {
        let migrated : Episode.Episode = {
          id = old.id;
          showId = old.showId;
          seasonNumber = old.seasonNumber;
          episodeNumber = old.episodeNumber;
          title = old.title;
          description = old.description;
          videoUrl = old.videoUrl;
          thumbnailUrl = "";
          duration = old.duration;
          createdAt = old.createdAt;
        };
        episodesV3.add(id, migrated);
        if (old.id >= nextEpisodeId) {
          nextEpisodeId := old.id + 1;
        };
      };
    };
    episodesV2.clear();
  };

  private func autoRegisterUser(caller : Principal) {
    switch (userJoinedAt.get(caller)) {
      case (null) { userJoinedAt.add(caller, Time.now()) };
      case (?_) {};
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func registerUser() : async () {
    autoRegisterUser(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    autoRegisterUser(caller);
    userProfiles.add(caller, profile);
  };

  public query func getAllUsers() : async [UserRecord] {
    let results = List.empty<UserRecord>();
    for ((principal, joinedAt) in userJoinedAt.entries()) {
      let name = switch (userProfiles.get(principal)) {
        case (null) { "" };
        case (?profile) { profile.name };
      };
      results.add({
        principal;
        name;
        joinedAt;
      });
    };
    for ((principal, profile) in userProfiles.entries()) {
      if (userJoinedAt.get(principal) == null) {
        results.add({
          principal;
          name = profile.name;
          joinedAt = 0;
        });
      };
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

  public shared func updateShow(showId : Show.Id, title : Text, description : Text, genre : Text, thumbnailUrl : Text, isFeatured : Bool, isPublic : Bool) : async () {
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

  public shared func deleteShow(showId : Show.Id) : async () {
    switch (showsV2.get(showId)) {
      case (null) { Runtime.trap("Show does not exist") };
      case (?_show) {
        showsV2.remove(showId);
        let episodeIdsToDelete = List.empty<Episode.Id>();
        for ((episodeId, episode) in episodesV3.entries()) {
          if (episode.showId == showId) {
            episodeIdsToDelete.add(episodeId);
          };
        };
        for (episodeId in episodeIdsToDelete.values()) {
          episodesV3.remove(episodeId);
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

  public query func getAllShows(publicOnly : Bool) : async [Show.Show] {
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
  public shared func createEpisode(showId : Show.Id, seasonNumber : Nat, episodeNumber : Nat, title : Text, description : Text, videoUrl : Text, thumbnailUrl : Text, duration : Nat) : async Episode.Episode {
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
          thumbnailUrl;
          duration;
          createdAt = Time.now();
        };
        episodesV3.add(id, episode);
        episode;
      };
    };
  };

  public shared func updateEpisode(episodeId : Episode.Id, seasonNumber : Nat, episodeNumber : Nat, title : Text, description : Text, videoUrl : Text, thumbnailUrl : Text, duration : Nat) : async () {
    switch (episodesV3.get(episodeId)) {
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
          thumbnailUrl;
          duration;
          createdAt = existingEpisode.createdAt;
        };
        episodesV3.add(episodeId, updatedEpisode);
      };
    };
  };

  public shared func deleteEpisode(episodeId : Episode.Id) : async () {
    switch (episodesV3.get(episodeId)) {
      case (null) { Runtime.trap("Episode does not exist") };
      case (?_) {
        episodesV3.remove(episodeId);
      };
    };
  };

  public query ({ caller }) func getEpisode(episodeId : Episode.Id) : async Episode.Episode {
    switch (episodesV3.get(episodeId)) {
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
        for ((_, episode) in episodesV3.entries()) {
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
        for ((_, episode) in episodesV3.entries()) {
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
    autoRegisterUser(caller);
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
    autoRegisterUser(caller);
    switch (episodesV3.get(episodeId)) {
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
    switch (progress.get(caller)) {
      case (null) { [] };
      case (?prog) {
        prog.toArray().sort(EpisodeProgress.compareByUpdatedAt);
      };
    };
  };
};
