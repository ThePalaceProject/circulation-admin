import * as React from "react";
import { render, within, waitFor } from "@testing-library/react";
import { normalizeStatistics } from "../../../src/components/Stats";
import LibraryStats, {
  humanNumber,
} from "../../../src/components/LibraryStats";
import {
  statisticsApiResponseData,
  testLibraryKey,
  noCollectionsLibraryKey,
  noInventoryLibraryKey,
  noPatronsLibraryKey,
} from "../../__data__/statisticsApiResponseData";

// Polyfill ResizeObserver and use fixed width and height
// for Recharts's ResponsiveContainer.
// This will produce a warning, but the tests will run.
window.ResizeObserver = require("resize-observer-polyfill");
jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});

describe("LibraryStats", () => {
  // Convert from the API format to our in-app format.
  const statisticsData = normalizeStatistics(statisticsApiResponseData);
  const librariesStatsTestDataByKey = statisticsData.libraries.reduce(
    (map, library) => ({ ...map, [library.key]: library }),
    {}
  );
  const defaultLibraryStatsTestData =
    librariesStatsTestDataByKey[testLibraryKey];
  const allLibrariesHeadingText = "All Libraries";
  const noCollectionsHeadingText = "No associated collections.";

  const expectStats = (
    statItem,
    label: string,
    value: number,
    readable: string | number
  ) => {
    const displayed_value = readable.toString();
    const statLabels = statItem.getElementsByClassName("stat-label");
    const statValues = statItem.getElementsByClassName("stat-value");
    expect(displayed_value).toEqual(humanNumber(value));
    expect(statLabels).toHaveLength(1);
    expect(statValues).toHaveLength(1);
    within(statLabels[0]).getByText(label);
    within(statValues[0]).getByText(displayed_value);
    expect(statItem).toHaveTextContent(label);
    expect(statItem).toHaveTextContent(displayed_value);
  };

  const expectAllGroups = (groups) => {
    expect(groups).toHaveLength(4);
    expect(groups[0]).toHaveTextContent("Patrons");
    expect(groups[1]).toHaveTextContent("Circulation");
    expect(groups[2]).toHaveTextContent("Inventory");
  };

  describe("rendering", () => {
    it("shows 'all libraries' header when there is no library", () => {
      const { getByRole } = render(
        <LibraryStats stats={defaultLibraryStatsTestData} />
      );
      const header = getByRole("heading", { level: 2 });
      expect(header).toHaveTextContent(allLibrariesHeadingText);
      expect(header).not.toHaveTextContent(defaultLibraryStatsTestData.name);
    });

    it("shows library header", () => {
      const { getByRole } = render(
        <LibraryStats
          stats={defaultLibraryStatsTestData}
          library={defaultLibraryStatsTestData.key}
        />
      );
      const header = getByRole("heading", { level: 2 });
      expect(header).not.toHaveTextContent(allLibrariesHeadingText);
      expect(header).toHaveTextContent(defaultLibraryStatsTestData.name);
    });

    it("show patrons and circulation groups, even when no patrons", () => {
      const noPatrons = librariesStatsTestDataByKey[noPatronsLibraryKey];
      const { container } = render(<LibraryStats stats={noPatrons} />);

      const groups = container.getElementsByClassName("stat-group");
      expectAllGroups(groups);
    });

    it("shows inventory group, even when there is no inventory", () => {
      const noInventory = librariesStatsTestDataByKey[noInventoryLibraryKey];
      const { container } = render(<LibraryStats stats={noInventory} />);
      const groups = container.getElementsByClassName("stat-group");
      expectAllGroups(groups);
    });

    it("shows appropriate message when there are no collections", () => {
      const noCollections =
        librariesStatsTestDataByKey[noCollectionsLibraryKey];
      const { container } = render(<LibraryStats stats={noCollections} />);
      const groups = container.getElementsByClassName("stat-group");
      expectAllGroups(groups);
      expect(groups[3]).toHaveTextContent(noCollectionsHeadingText);
    });

    it("shows stats data", () => {
      const { container } = render(
        <LibraryStats stats={defaultLibraryStatsTestData} />
      );
      const groups = container.getElementsByClassName("stat-group");
      expectAllGroups(groups);

      /* Patrons */
      const patronStatItems = groups[0].getElementsByClassName("single-stat");
      expect(patronStatItems).toHaveLength(3);
      expectStats(patronStatItems[0], "Total Patrons", 132, 132);
      expectStats(patronStatItems[1], "Patrons With Active Loans", 21, 21);
      expectStats(
        patronStatItems[2],
        "Patrons With Active Loans or Holds",
        23,
        23
      );

      /* Circulation */
      const circulationStatItems = groups[1].getElementsByClassName(
        "single-stat"
      );
      expect(circulationStatItems).toHaveLength(2);
      expectStats(circulationStatItems[0], "Active Loans", 87, 87);
      expectStats(circulationStatItems[1], "Active Holds", 5, 5);

      /* Inventory */
      const inventoryStatItems = groups[2].getElementsByClassName(
        "single-stat"
      );
      expect(inventoryStatItems).toHaveLength(6);
      expectStats(inventoryStatItems[0], "Titles", 29119, "29.1k");
      expectStats(inventoryStatItems[1], "Available Titles", 29092, "29.1k");
      expectStats(
        inventoryStatItems[2],
        "Metered License Titles",
        20658,
        "20.7k"
      );
      expectStats(inventoryStatItems[3], "Unlimited License Titles", 623, 623);
      expectStats(inventoryStatItems[4], "Open Access Titles", 7838, "7.8k");
      expectStats(inventoryStatItems[5], "Self-Hosted Titles", 145, 145);
    });
  });
  // ^^ the above work ^^

  describe("charting", () => {
    it("shows stats data", async () => {
      const testLibraryData = defaultLibraryStatsTestData;
      const collections = testLibraryData.collections;
      const numberOfCollections = collections.length;
      const collectionsWithBooks = collections
        .filter((c) => c.inventory.titles > 0)
        .map((c) => c.name);
      expect(numberOfCollections).toEqual(5);
      expect(collectionsWithBooks).toHaveLength(5);

      const { container } = render(<LibraryStats stats={testLibraryData} />);

      const groups = container.getElementsByClassName("stat-group");
      expectAllGroups(groups);

      /* Collections */
      const collectionsGroup = groups[3];
      within(collectionsGroup as HTMLElement).getByRole("heading", {
        level: 3,
        name: "Collections",
      });

      // There should be a single chart.
      const charts = (collectionsGroup as HTMLElement).getElementsByClassName(
        "recharts-wrapper"
      );
      const chart = charts[0]; // (charts[0] as HTMLElement);

      // Collection labels are on the y-axis of the chart.
      const yaxis = chart.getElementsByClassName("recharts-yAxis");
      const collectionLabels = yaxis[0].getElementsByClassName(
        "recharts-cartesian-axis-tick"
      );
      expect(charts).toHaveLength(1);
      expect(yaxis).toHaveLength(1);
      expect(collectionLabels).toHaveLength(numberOfCollections);

      // A wrapper element for a single tooltip should be present.
      const tooltipWrappers = chart.getElementsByClassName(
        "recharts-tooltip-wrapper"
      );
      expect(tooltipWrappers).toHaveLength(1);

      // A single chart bar should be present for each collection that contains any books.
      // The bars load with an animation, so we need to wait for them to appear.
      await waitFor(() =>
        expect(chart.querySelectorAll("path").length).toBeGreaterThanOrEqual(1)
      );
      const bars = chart.querySelectorAll<HTMLElement>("path");
      const collectionsWithBars = Array.from(bars, (bar) =>
        bar.getAttribute("name")
      );
      expect(collectionsWithBars).toHaveLength(collectionsWithBooks.length);
      collectionsWithBars.map((name) =>
        expect(collectionsWithBooks).toContain(name)
      );
    });
  });
});
