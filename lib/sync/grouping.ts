import type { SpotifyTrackItem } from "../spotify";

export interface YearGroup {
  year: number;
  tracks: SpotifyTrackItem[];
  uris: string[];
}

export function groupTracksByYear(tracks: SpotifyTrackItem[]): Map<number, YearGroup> {
  const groups = new Map<number, YearGroup>();

  for (const track of tracks) {
    const year = track.year;
    let group = groups.get(year);
    if (!group) {
      group = {
        year,
        tracks: [],
        uris: [],
      };
      groups.set(year, group);
    }
    group.tracks.push(track);
    group.uris.push(track.uri);
  }

  return groups;
}
