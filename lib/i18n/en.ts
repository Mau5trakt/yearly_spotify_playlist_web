import type { Translations } from "./types";

export const en: Translations = {
  common: {
    appName: "Yearly Spotify Playlists",
    loading: "Loading...",
    tracks: "tracks",
    songs: "songs",
  },
  header: {
    logout: "Log out",
    login: "Log in with Spotify",
    switchLanguage: "Change Language",
  },
  hero: {
    badge: "100% Client-Side & Secure",
    title: "Your favorite songs,",
    titleHighlight: "organized by year",
    subtitle:
      "Connect your Spotify account to automatically generate dedicated playlists for every year based on when you liked your songs.",
    cta: "Log in with Spotify",
    authError: "Error connecting to Spotify: {error}",
    step1Title: "Connect your account",
    step1Desc:
      "Secure official Spotify OAuth. Your credentials are never stored on external servers.",
    step2Title: "Fast library scan",
    step2Desc: "We read your liked songs and group every track by the year you saved it.",
    step3Title: "Yearly Playlists Ready",
    step3Desc:
      "Your yearly playlists are created directly inside your Spotify account, ready to stream anywhere.",
  },
  dashboard: {
    welcome: "Welcome, {name}!",
    welcomeSubtitle:
      "All set to scan your saved songs on Spotify and generate your yearly playlists automatically.",
    generateButton: "Create my Yearly Playlists",
    generatingButton: "Generating Playlists...",
    retryButton: "Try again",
    completedTitle: "🎉 Sync Completed!",
    completedSubtitle:
      "Explore your statistics below or open your new playlists directly in Spotify.",
    syncAgainButton: "Sync again",
  },
  progress: {
    fetchingStart: "Starting download of your liked songs...",
    fetchingProgress: "Downloaded {fetched} of {total} songs...",
    analyzing: "Analyzing tracks and grouping by saved year...",
    preparing: "Found {count} distinct years. Preparing playlists...",
    creatingStep: "Creating playlist for {year} ({current}/{total}) with {count} songs...",
    completed: "All done! All your yearly playlists were successfully created.",
    noTracks: "No saved tracks found in your Spotify library.",
    error: "An error occurred during synchronization.",
    songsIdentified: "{fetched} of {total} songs identified",
    progressBarAria: "Synchronization progress",
  },
  toasts: {
    yearBadge: "Year {year}",
  },
  creationToast: {
    creating: "Creating Playlist",
    tracksCount: "{count} tracks",
    progressIndicator: "Playlist {current} of {total}",
  },
  earliestTrack: {
    badge: "Your Very First Like",
    title: "The Song That Started It All",
    subtitle: "The very first song you ever saved on Spotify ({year})",
    savedOn: "Saved on {date}",
  },
  stats: {
    title: "Your Musical Journey",
    totalTracks: "Saved Songs",
    earliestYear: "Earliest Year",
    latestYear: "Latest Year",
    topYear: "Top Musical Year",
    timeRange: "Time Range",
    distributionTitle: "Saved Songs Distribution by Year",
    percentOfTotal: "{percent}% of your library",
  },
  playlists: {
    title: "Yearly Playlists in Spotify",
    trackBadge: "{count} tracks",
    upToDateBadge: "Up to date ({count} tracks)",
    deltaBadge: "+{added} new ({skipped} existing)",
    openInSpotify: "Open in Spotify",
  },
};
