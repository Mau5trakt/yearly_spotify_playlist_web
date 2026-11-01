export type Locale = "en" | "es";

export interface Translations {
  common: {
    appName: string;
    loading: string;
    tracks: string;
    songs: string;
  };
  header: {
    logout: string;
    login: string;
    switchLanguage: string;
  };
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    cta: string;
    authError: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  dashboard: {
    welcome: string;
    welcomeSubtitle: string;
    generateButton: string;
    generatingButton: string;
    retryButton: string;
    completedTitle: string;
    completedSubtitle: string;
    syncAgainButton: string;
  };
  progress: {
    fetchingStart: string;
    fetchingProgress: string;
    analyzing: string;
    preparing: string;
    creatingStep: string;
    completed: string;
    noTracks: string;
    error: string;
    songsIdentified: string;
    progressBarAria: string;
  };
  toasts: {
    yearBadge: string;
  };
  creationToast: {
    creating: string;
    tracksCount: string;
    progressIndicator: string;
  };
  earliestTrack: {
    badge: string;
    title: string;
    subtitle: string;
    savedOn: string;
  };
  stats: {
    title: string;
    totalTracks: string;
    earliestYear: string;
    latestYear: string;
    topYear: string;
    timeRange: string;
    distributionTitle: string;
    percentOfTotal: string;
  };
  playlists: {
    title: string;
    trackBadge: string;
    upToDateBadge: string;
    deltaBadge: string;
    openInSpotify: string;
  };
}
