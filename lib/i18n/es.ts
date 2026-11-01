import type { Translations } from "./types";

export const es: Translations = {
  common: {
    appName: "Yearly Spotify Playlists",
    loading: "Cargando...",
    tracks: "canciones",
    songs: "temas",
  },
  header: {
    logout: "Cerrar sesión",
    login: "Iniciar sesión con Spotify",
    switchLanguage: "Cambiar idioma",
  },
  hero: {
    badge: "⚡ 100% Automático y Seguro",
    title: "Tus canciones favoritas,",
    titleHighlight: "organizadas por año",
    subtitle:
      "Conectá tu cuenta de Spotify y generá automáticamente playlists dedicadas para cada año según la fecha en que diste Me Gusta a tus canciones.",
    cta: "Iniciar sesión con Spotify",
    authError: "⚠️ Error al conectar con Spotify: {error}",
    step1Title: "Conectá tu cuenta",
    step1Desc:
      "Acceso seguro con OAuth oficial de Spotify. Tus credenciales nunca se almacenan en nuestros servidores.",
    step2Title: "Escaneo por lotes",
    step2Desc:
      "Leemos tu biblioteca en segundo plano y agrupamos cada tema según el año en el que lo guardaste.",
    step3Title: "Playlists Anuales Listas",
    step3Desc:
      "Se generan las listas anuales directamente en tu Spotify para que las escuches en cualquier dispositivo.",
  },
  dashboard: {
    welcome: "¡Hola, {name}!",
    welcomeSubtitle:
      "Todo listo para escanear tus canciones guardadas en Spotify y crear tus playlists anuales de forma automática.",
    generateButton: "Crear mis Playlists Anuales",
    generatingButton: "Generando Playlists...",
    retryButton: "Volver a intentar",
    completedTitle: "🎉 ¡Sincronización Completada!",
    completedSubtitle:
      "Revisá tus estadísticas a continuación o abrí tus nuevas playlists directamente en tu aplicación de Spotify.",
    syncAgainButton: "Volver a sincronizar",
  },
  progress: {
    fetchingStart: "Iniciando descarga de canciones guardadas...",
    fetchingProgress: "Descargadas {fetched} de {total} canciones...",
    analyzing: "Analizando canciones y agrupando por año de guardado...",
    preparing: "Se encontraron {count} años distintos. Preparando playlists...",
    creatingStep: "Creando playlist de {year} ({current}/{total}) con {count} canciones...",
    completed: "¡Listo! Todas tus playlists anuales han sido generadas con éxito.",
    noTracks: "No se encontraron canciones guardadas en tu biblioteca de Spotify.",
    error: "Ocurrió un error en la sincronización.",
    songsIdentified: "{fetched} de {total} canciones identificadas",
    progressBarAria: "Progreso de sincronización",
  },
  toasts: {
    yearBadge: "Año {year}",
  },
  creationToast: {
    creating: "Creando Playlist",
    tracksCount: "{count} canciones",
    progressIndicator: "Playlist {current} de {total}",
  },
  earliestTrack: {
    badge: "Tu Primer Me Gusta",
    title: "La Canción Que Empezó Todo",
    subtitle: "La primerísima canción que guardaste en Spotify ({year})",
    savedOn: "Guardada el {date}",
  },
  stats: {
    title: "Resumen de tu Biblioteca",
    totalTracks: "Canciones Guardadas",
    earliestYear: "Año Inicial",
    latestYear: "Año Más Reciente",
    topYear: "Año más musical",
    timeRange: "Rango Temporal",
    distributionTitle: "Distribución de temas guardados por año",
    percentOfTotal: "{percent}% de tu biblioteca",
  },
  playlists: {
    title: "Playlists Anuales Creadas en Spotify",
    trackBadge: "{count} temas",
    upToDateBadge: "Al día ({count} temas)",
    deltaBadge: "+{added} nuevos ({skipped} existentes)",
    openInSpotify: "Abrir en Spotify",
  },
};
