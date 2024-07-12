import * as React from "react";
import { render } from "@testing-library/react";
import LibraryStats, {
  CustomTooltip,
} from "../../../src/components/LibraryStats";
import { renderWithProviders } from "../testUtils/withProviders";
import { ContextProviderProps } from "../../../src/components/ContextProvider";

import {
  statisticsApiResponseData,
  testLibraryKey as sampleLibraryKey,
} from "../../__data__/statisticsApiResponseData";

import { normalizeStatistics } from "../../../src/features/stats/normalizeStatistics";

describe("Dashboard Statistics", () => {
  // NB: This adds test to the already existing tests in:
  // - `src/components/__tests__/Stats-test.tsx`.
  // - `src/components/__tests__/LibraryStats-test.tsx`.
  // - `src/components/__tests__/SingleStatListItem-test.tsx`.
  //
  // Those tests should eventually be migrated here and
  // adapted to the Jest/React Testing Library paradigm.

  describe("requesting inventory reports", () => {
    // Convert from the API format to our in-app format.
    const statisticsData = normalizeStatistics(statisticsApiResponseData);
    const librariesStatsTestDataByKey = statisticsData.libraries.reduce(
      (map, library) => ({ ...map, [library.key]: library }),
      {}
    );
    const sampleStatsData = librariesStatsTestDataByKey[sampleLibraryKey];

    const systemAdmin = [{ role: "system" }];
    const managerAll = [{ role: "manager-all" }];
    const librarianAll = [{ role: "librarian-all" }];

    const baseContextProviderProps = {
      csrfToken: "",
      featureFlags: { reportsOnlyForSysadmins: false },
    };

    const renderFor = (
      onlySysadmins: boolean,
      roles: { role: string; library?: string }[]
    ) => {
      const contextProviderProps: ContextProviderProps = {
        ...baseContextProviderProps,
        featureFlags: { reportsOnlyForSysadmins: onlySysadmins },
        roles,
      };

      const { container, queryByRole } = renderWithProviders(
        <LibraryStats stats={sampleStatsData} library={sampleLibraryKey} />,
        { contextProviderProps }
      );

      const result = queryByRole("button", { name: "⬇︎" });
      // Clean up the container after each render.
      document.body.removeChild(container);
      return result;
    };

    it("shows inventory reports only for sysadmins, if feature flag set", async () => {
      // If the feature flag is set, the button should be visible only to sysadmins.
      expect(renderFor(true, systemAdmin)).not.toBeNull();
      expect(renderFor(true, managerAll)).toBeNull();
      expect(renderFor(true, librarianAll)).toBeNull();
      // If the feature flag is false, the button should be visible to all users.
      expect(renderFor(false, systemAdmin)).not.toBeNull();
      expect(renderFor(false, managerAll)).not.toBeNull();
      expect(renderFor(false, librarianAll)).not.toBeNull();
    });
  });

  describe("charting - custom tooltip", () => {
    const defaultLabel = "Collection X";
    const summaryInventory = {
      availableTitles: 7953,
      licensedTitles: 7974,
      meteredLicenseTitles: 7974,
      meteredLicensesAvailable: 75446,
      meteredLicensesOwned: 301541,
      openAccessTitles: 0,
      titles: 7974,
      unlimitedLicenseTitles: 0,
    };
    const perMediumInventory = {
      Audio: {
        availableTitles: 148,
        licensedTitles: 165,
        meteredLicenseTitles: 165,
        meteredLicensesAvailable: 221,
        meteredLicensesOwned: 392,
        openAccessTitles: 0,
        titles: 165,
        unlimitedLicenseTitles: 0,
      },
      Book: {
        availableTitles: 7805,
        licensedTitles: 7809,
        meteredLicenseTitles: 7809,
        meteredLicensesAvailable: 75225,
        meteredLicensesOwned: 301149,
        openAccessTitles: 0,
        titles: 7809,
        unlimitedLicenseTitles: 0,
      },
    };
    const defaultChartItemWithoutPerMediumInventory = {
      name: defaultLabel,
      ...summaryInventory,
    };
    const defaultChartItemWithPerMediumInventory = {
      ...defaultChartItemWithoutPerMediumInventory,
      _by_medium: perMediumInventory,
    };
    const defaultPayload = [
      {
        fill: "#606060",
        dataKey: "meteredLicenseTitles",
        name: "Metered License Titles",
        color: "#606060",
        value: 7974,
      },
      {
        fill: "#404040",
        dataKey: "unlimitedLicenseTitles",
        name: "Unlimited License Titles",
        color: "#404040",
        value: 0,
      },
      {
        fill: "#202020",
        dataKey: "openAccessTitles",
        name: "Open Access Titles",
        color: "#202020",
        value: 0,
      },
    ];

    const populateTooltipProps = ({
      active = true,
      label = defaultLabel,
      payload = [],
      chartItem = undefined,
    }) => {
      const constructedChartItem = !chartItem
        ? chartItem
        : {
            ...chartItem,
            name: label,
          };
      const constructedPayload = payload.map((entry) => ({
        ...entry,
        payload: constructedChartItem,
      }));
      return {
        active,
        label,
        payload: constructedPayload,
      };
    };

    /**
     * Helper function to test passing tests for a tooltip
     *
     * @param tooltipProps - passed to the <CustomTooltip /> component
     * @param expectedInventoryItemText - the expected inventory item text content
     */
    const expectPassingTestsForActiveTooltip = ({
      tooltipProps,
      expectedInventoryItemText,
    }) => {
      const { container, getByRole } = render(
        <CustomTooltip {...tooltipProps} />
      );
      const tooltipContent = container.querySelector(".customTooltip");

      const detail = tooltipContent.querySelector(".customTooltipDetail");
      const detailChildren = detail.children;
      const heading = getByRole("heading", { level: 1, name: "Collection X" });
      const items = tooltipContent.querySelectorAll("p.customTooltipItem");
      const divider = detail.querySelector("hr");

      expect(heading).toHaveTextContent("Collection X");

      // Eight (8) metrics in the following order.
      expect(items).toHaveLength(8);
      // The expected inventory item labels array should be the same length.
      expect(expectedInventoryItemText).toHaveLength(items.length);
      // And the items should contain at least the expected text.
      Array.from(items).forEach((item, index) => {
        expect(item).toHaveTextContent(expectedInventoryItemText[index]);
      });

      // The heading should be at the top and the divider (`hr`)
      // should be between the third and fourth statistics.
      expect(detailChildren).toHaveLength(10);
      expect(heading).toEqual(detailChildren[0]);
      expect(items[0]).toEqual(detailChildren[1]);
      expect(items[2]).toEqual(detailChildren[3]);
      expect(divider).toEqual(detailChildren[4]);
      expect(items[3]).toEqual(detailChildren[5]);
      expect(items[7]).toEqual(detailChildren[9]);
    };

    it("should not render when active is false", () => {
      // Recharts sticks some extra props
      const tooltipProps = populateTooltipProps({
        active: false,
        chartItem: defaultChartItemWithPerMediumInventory,
        payload: defaultPayload,
      });

      const { container, getByRole } = render(
        <CustomTooltip {...tooltipProps} />
      );
      const tooltipContent = container.querySelectorAll(".customTooltip");

      expect(tooltipContent).toHaveLength(0);
    });
    it("should render when active is true", () => {
      const tooltipProps = populateTooltipProps({
        active: true,
        chartItem: defaultChartItemWithoutPerMediumInventory,
        payload: defaultPayload,
      });

      const expectedInventoryItemText = [
        "Titles:",
        "Available Titles:",
        "Metered License Titles:",
        "Licensed Titles:",
        "Metered Licenses Available:",
        "Metered Licenses Owned:",
        "Open Access Titles:",
        "Unlimited License Titles:",
      ];

      expectPassingTestsForActiveTooltip({
        tooltipProps,
        expectedInventoryItemText,
      });
    });
    it("should render without per-medium inventory", () => {
      const tooltipProps = populateTooltipProps({
        active: true,
        chartItem: defaultChartItemWithoutPerMediumInventory,
        payload: defaultPayload,
      });

      const expectedInventoryItemText = [
        "Titles: 7,974",
        "Available Titles: 7,953",
        "Metered License Titles: 7,974",
        "Licensed Titles: 7,974",
        "Metered Licenses Available: 75,446",
        "Metered Licenses Owned: 301,541",
        "Open Access Titles: 0",
        "Unlimited License Titles: 0",
      ];

      expectPassingTestsForActiveTooltip({
        tooltipProps,
        expectedInventoryItemText,
      });
    });
    it("should render additional detail with per-medium inventory", () => {
      const tooltipProps = populateTooltipProps({
        active: true,
        chartItem: defaultChartItemWithPerMediumInventory,
        payload: defaultPayload,
      });

      const expectedInventoryItemText = [
        "Titles: 7,974 (Audio: 165, Book: 7,809)",
        "Available Titles: 7,953 (Audio: 148, Book: 7,805)",
        "Metered License Titles: 7,974 (Audio: 165, Book: 7,809)",
        "Licensed Titles: 7,974 (Audio: 165, Book: 7,809)",
        "Metered Licenses Available: 75,446 (Audio: 221, Book: 75,225)",
        "Metered Licenses Owned: 301,541 (Audio: 392, Book: 301,149)",
        "Open Access Titles: 0",
        "Unlimited License Titles: 0",
      ];

      expectPassingTestsForActiveTooltip({
        tooltipProps,
        expectedInventoryItemText,
      });
    });
  });
});
