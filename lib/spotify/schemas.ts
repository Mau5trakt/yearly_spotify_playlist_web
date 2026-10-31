import { z } from "zod";

export const CreatePlaylistSchema = z.object({
  year: z.union([z.number(), z.string()]).transform((val) => String(val)),
  trackUris: z.array(z.string()).min(1, "Debe incluir al menos un track"),
  isPublic: z.boolean().default(true),
  customName: z.string().optional(),
});

export type CreatePlaylistInput = z.infer<typeof CreatePlaylistSchema>;
