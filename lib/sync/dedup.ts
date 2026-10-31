/**
 * Filters out track URIs that are already present in the target playlist,
 * deduplicates intra-input duplicates, and preserves strict original insertion order.
 */
export function selectNewTracks(trackUris: string[], existingUris: Set<string>): string[] {
  const seenInInput = new Set<string>();
  const result: string[] = [];

  for (const uri of trackUris) {
    if (!uri) continue;
    if (existingUris.has(uri)) continue;
    if (seenInInput.has(uri)) continue;

    seenInInput.add(uri);
    result.push(uri);
  }

  return result;
}

/**
 * Splits an array into consecutive chunks of at most `size` elements.
 * Throws an Error if `size` is non-positive.
 */
export function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) {
    throw new Error("Chunk size must be positive");
  }

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}
