import { describe, expect, it } from "bun:test";
import { apiClient } from "../lib/api";
import * as hooks from "../hooks";

describe("Axios API Client & TanStack Query Hooks Suite", () => {
  it("initializes apiClient with Axios instance, timeout and json headers", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.defaults.timeout).toBe(15000);
    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("exports auth hooks through hooks/ barrel", () => {
    expect(hooks.useAuthQuery).toBeDefined();
    expect(hooks.useLogoutMutation).toBeDefined();
    expect(hooks.AUTH_QUERY_KEY).toEqual(["auth_me"]);
  });

  it("exports spotify hooks and api callers through hooks/ barrel", () => {
    expect(hooks.useSpotifySync).toBeDefined();
    expect(hooks.useCreatePlaylistMutation).toBeDefined();
    expect(hooks.fetchLikedTracksPageApi).toBeDefined();
    expect(hooks.createPlaylistApi).toBeDefined();
  });
});
