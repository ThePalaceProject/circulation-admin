import * as React from "react";
import { screen } from "@testing-library/react";
import LibraryStats from "../../../src/components/dashboard/LibraryStats";
import { renderWithProviders } from "../testUtils/withProviders";
import {
  statisticsApiResponseData,
  testLibraryKey,
  noCollectionsLibraryKey,
  noInventoryLibraryKey,
  noPatronsLibraryKey,
} from "../../__data__/statisticsApiResponseData";
import { normalizeStatistics } from "../../../src/features/stats/normalizeStatistics";
import { ConfigurationSettings } from "../../../src/interfaces";

// ResizeObserver polyfill required by recharts
// eslint-disable-next-line @typescript-eslint/no-var-requires
global.ResizeObserver = require("resize-observer-polyfill");

// ── Shared test data ─────────────────────────────────────────────────────────
const statisticsData = normalizeStatistics(statisticsApiResponseData);
const byKey = statisticsData.libraries.reduce(
  (map, lib) => ({ ...map, [lib.key]: lib }),
  {} as Record<string, any>
);

const defaultStats = byKey[testLibraryKey];
const noCollectionsStats = byKey[noCollectionsLibraryKey];
const noInventoryStats = byKey[noInventoryLibraryKey];
const noPatronsStats = byKey[noPatronsLibraryKey];

// ── Helper ───────────────────────────────────────────────────────────────────
function renderStats(
  props: Partial<React.ComponentProps<typeof LibraryStats>> & {
    isSysAdmin?: boolean;
  } = {}
) {
  const { isSysAdmin, ...rest } = props;
  const appConfigSettings: Partial<ConfigurationSettings> = isSysAdmin
    ? { roles: [{ role: "system" }] }
    : {};
  const mergedProps = { stats: defaultStats, ...rest };
  return renderWithProviders(<LibraryStats {...mergedProps} />, {
    appConfigSettings,
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("LibraryStats", () => {
  describe("heading", () => {
    it("shows 'All Authorized Libraries' heading when no library prop", () => {
      renderStats();
      expect(screen.getByRole("heading", { level: 2 }).textContent).toContain(
        "All Authorized Libraries"
      );
    });

    it("shows library-specific heading when library prop provided", () => {
      renderStats({ library: defaultStats.key });
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading.textContent).toContain(defaultStats.name);
      expect(heading.textContent).not.toContain("All Authorized Libraries");
    });
  });

  describe("stat groups (no-library view – 4 groups)", () => {
    it("shows 4 stat groups", () => {
      const { container } = renderStats();
      expect(container.querySelectorAll(".stat-group").length).toBe(4);
    });

    it("shows patrons and circulation groups even when there are no patrons", () => {
      const { container } = renderStats({ stats: noPatronsStats });
      const groups = container.querySelectorAll(".stat-group");
      expect(groups.length).toBe(4);
      expect(groups[0].textContent).toContain("Patron");
      expect(groups[1].textContent).toContain("Circulation");
    });

    it("shows inventory group even when there is no inventory", () => {
      const { container } = renderStats({ stats: noInventoryStats });
      const groups = container.querySelectorAll(".stat-group");
      expect(groups.length).toBe(4);
      expect(groups[2].textContent).toContain("Inventor");
    });

    it("shows 'No associated collections' message when there are no collections", () => {
      const { container } = renderStats({ stats: noCollectionsStats });
      const groups = container.querySelectorAll(".stat-group");
      expect(groups.length).toBe(4);
      expect(groups[3].textContent).toContain("No associated collections");
    });
  });

  describe("stats data", () => {
    it("shows patron stats with active loan counts", () => {
      const { container } = renderStats();
      const patronGroup = container.querySelector(".stat-patrons-group");
      expect(patronGroup.textContent).toContain("21");
      expect(patronGroup.textContent).toMatch(/Active Loans?/);
    });

    it("shows circulation stats", () => {
      const { container } = renderStats();
      const circGroup = container.querySelector(
        ".stat-circulation-reports-group"
      );
      expect(circGroup.textContent).toContain("87");
      expect(circGroup.textContent).toMatch(/Active Loans?/);
      expect(circGroup.textContent).toContain("5");
      expect(circGroup.textContent).toMatch(/Hold/);
    });

    it("shows inventory stats (formatted numbers)", () => {
      const { container } = renderStats();
      const invGroup = container.querySelector(".stat-inventory-reports-group");
      // 29119 → "29.1k"
      expect(invGroup.textContent).toContain("29.1k");
      expect(invGroup.textContent).toContain("Titles");
      // 7838 → "7.8k"
      expect(invGroup.textContent).toContain("7.8k");
    });

    it("shows collections group", () => {
      const { container } = renderStats();
      const collectionsGroup = container.querySelector(
        ".stat-collections-group"
      );
      expect(collectionsGroup.textContent).toContain("Collection");
    });
  });

  describe("collections rendering: list vs bar chart", () => {
    it("shows a <ul> list of collection names for non-sysadmin", () => {
      const { container } = renderStats({ isSysAdmin: false });
      const collectionsGroup = container.querySelector(
        ".stat-collections-group"
      );
      const list = collectionsGroup.querySelector("ul");
      expect(list).toBeTruthy();

      const expectedNames = [
        "New BiblioBoard Test",
        "New Bibliotheca Test Collection",
        "Palace Bookshelf",
        "TEST Baker & Taylor",
        "TEST Palace Marketplace",
      ];
      const listText = list.textContent;
      expectedNames.forEach((name) => {
        expect(listText).toContain(name);
      });
      expect(list.querySelectorAll("li").length).toBe(expectedNames.length);
    });

    it("does not show a plain list for sysadmin (shows bar chart instead)", () => {
      const { container } = renderStats({ isSysAdmin: true });
      const collectionsGroup = container.querySelector(
        ".stat-collections-group"
      );
      // sysadmin gets StatsCollectionsBarChart which has no collection-name-list
      const plainList = collectionsGroup.querySelector(".collection-name-list");
      expect(plainList).toBeNull();
    });
  });
});
