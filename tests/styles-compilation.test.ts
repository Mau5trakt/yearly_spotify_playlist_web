import { describe, expect, it } from "bun:test";
import * as sass from "sass";
import fs from "fs";

describe("SASS Architecture & Compilation Suite", () => {
  const globalFiles = [
    "styles/globals/_variables.scss",
    "styles/globals/_text_colors.scss",
    "styles/globals/_typography.scss",
    "styles/globals/_auxiliars.scss",
    "styles/globals/_mixins.scss",
    "styles/globals/normalize.scss",
    "styles/globals/base.scss",
    "styles/globals/index.scss",
  ];

  const componentAndPageFiles = [
    "styles/components/Header.module.scss",
    "styles/components/LandingHero.module.scss",
    "styles/components/Dashboard.module.scss",
    "styles/components/ProgressBar.module.scss",
    "styles/components/StatsView.module.scss",
    "styles/components/PlaylistsView.module.scss",
    "styles/components/LiveTrackToasts.module.scss",
    "styles/components/PlaylistCreationToast.module.scss",
    "styles/pages/Home.module.scss",
  ];

  it("verifies all modular SASS files exist in styles/globals, styles/components, and styles/pages", () => {
    for (const file of [...globalFiles, ...componentAndPageFiles]) {
      expect(fs.existsSync(file)).toBe(true);
    }
  });

  it("compiles normalize.scss cleanly as a self-contained reset without needing any @use imports", () => {
    const normalizeContent = fs.readFileSync("styles/globals/normalize.scss", "utf-8");
    // Assert that normalize.scss has no @use or @import dependencies
    expect(normalizeContent).not.toContain("@use");
    expect(normalizeContent).not.toContain("@import");

    const result = sass.compile("styles/globals/normalize.scss");
    expect(result.css.length).toBeGreaterThan(0);
    expect(result.css).toContain("normalize.css v8.0.1");
  });

  it("compiles every component and page SASS module cleanly without errors", () => {
    for (const file of componentAndPageFiles) {
      const result = sass.compile(file);
      expect(result.css.length).toBeGreaterThan(0);
    }
  });

  it("compiles index.scss as a pure abstraction barrel with 0 emitted CSS rules (pure for CSS modules)", () => {
    const result = sass.compile("styles/globals/index.scss");
    // Since index.scss forwards only variables and mixins, direct compiled CSS must be empty
    expect(result.css.trim().length).toBe(0);
  });

  it("enforces SVG safety constraints and dark body styles in base.scss", () => {
    const result = sass.compile("styles/globals/base.scss");
    const css = result.css;

    // Verify that base.scss compiles SVG safety rule
    expect(css).toContain("svg");
    expect(css).toContain("max-width: 100%");
    expect(css).toContain("flex-shrink: 0");

    // Verify that base.scss compiles dark background
    expect(css).toContain("#121212");
  });

  it("generates responsive media queries for mobile and tablet breakpoints", () => {
    const landingResult = sass.compile("styles/components/LandingHero.module.scss");
    const headerResult = sass.compile("styles/components/Header.module.scss");

    // Verify that responsive mixins compile to valid @media blocks
    expect(landingResult.css).toContain("@media (max-width: 768px)");
    expect(landingResult.css).toContain("@media (max-width: 480px)");
    expect(headerResult.css).toContain("@media (max-width: 768px)");
    expect(headerResult.css).toContain("@media (max-width: 480px)");
  });

  it("injects Spotify brand colors and dark theme palette into component styles", () => {
    const landingResult = sass.compile("styles/components/LandingHero.module.scss");
    const headerResult = sass.compile("styles/components/Header.module.scss");

    // #1db954 is official Spotify brand green defined in _text_colors.scss
    expect(landingResult.css).toContain("#1db954");
    expect(headerResult.css).toContain("#1db954");

    // #181818 card background
    expect(headerResult.css).toContain("#181818");
  });

  it("strictly constrains SVG dimensions in Header and LandingHero modules", () => {
    const headerResult = sass.compile("styles/components/Header.module.scss");
    const landingResult = sass.compile("styles/components/LandingHero.module.scss");

    // Header logoIcon must be 32px
    expect(headerResult.css).toContain("32px");

    // Landing ctaButton btnIcon must be 24px
    expect(landingResult.css).toContain("24px");
  });
});
