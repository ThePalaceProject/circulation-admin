import { expect } from "chai";

import * as React from "react";
import { mount } from "enzyme";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ContextProvider from "../ContextProvider";

import { normalizeStatistics } from "../Stats";
import LibraryStats from "../LibraryStats";
import { BarChart } from "recharts";
import {
  statisticsApiResponseData,
  testLibraryKey,
  noCollectionsLibraryKey,
  noInventoryLibraryKey,
  noPatronsLibraryKey,
} from "../../../tests/__data__/statisticsApiResponseData";

const AllProviders = ({ children }) => {
  const queryClient = new QueryClient();
  return (
    <ContextProvider csrfToken={""} email={"user@example.org"}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ContextProvider>
  );
};

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
    { label, value },
    expected_label: string,
    expected_value
  ) => {
    expect(label).to.equal(expected_label);
    expect(value).to.equal(expected_value);
  };

  const expectAllGroups = (groups) => {
    expect(groups.length).to.equal(4);
    expect(groups.at(0).text()).to.contain("Patrons");
    expect(groups.at(1).text()).to.contain("Circulation");
    expect(groups.at(2).text()).to.contain("Inventory");
  };

  describe("rendering", () => {
    let wrapper;
    beforeEach(() => {
      wrapper = mount(<LibraryStats stats={defaultLibraryStatsTestData} />, {
        wrappingComponent: AllProviders,
      });
    });

    it("shows 'all libraries' header when there is no library", () => {
      const header = wrapper.find("h2");
      expect(header.text()).to.contain(allLibrariesHeadingText);
    });

    it("shows library header", () => {
      wrapper.setProps({ library: defaultLibraryStatsTestData.key });
      const header = wrapper.find("h2");
      expect(header.text()).to.contain(defaultLibraryStatsTestData.name);
      expect(header.text()).not.to.contain(allLibrariesHeadingText);
    });

    it("show patrons and circulation groups, even when no patrons", () => {
      const noPatrons = librariesStatsTestDataByKey[noPatronsLibraryKey];
      wrapper.setProps({ stats: noPatrons });
      const groups = wrapper.find(".stat-group");
      expectAllGroups(groups);
    });

    it("shows inventory group, even when there is no inventory", () => {
      const noInventory = librariesStatsTestDataByKey[noInventoryLibraryKey];
      wrapper.setProps({ stats: noInventory });
      const groups = wrapper.find(".stat-group");
      expectAllGroups(groups);
    });

    it("shows appropriate message when there are no collections", () => {
      const noCollections =
        librariesStatsTestDataByKey[noCollectionsLibraryKey];
      wrapper.setProps({ stats: noCollections });
      const groups = wrapper.find(".stat-group");
      expectAllGroups(groups);
      expect(groups.at(3).text()).to.contain(noCollectionsHeadingText);
    });

    it("shows stats data", () => {
      const groups = wrapper.find(".stat-group");
      let statItems;
      expect(groups.length).to.equal(4);

      /* Patrons */
      expect(groups.at(0).text()).to.contain("Patrons");
      statItems = groups.at(0).find("SingleStatListItem");
      expect(statItems.length).to.equal(3);
      expectStats(statItems.at(0).props(), "Total Patrons", 132);
      expectStats(statItems.at(1).props(), "Patrons With Active Loans", 21);
      expectStats(
        statItems.at(2).props(),
        "Patrons With Active Loans or Holds",
        23
      );
      expect(groups.at(0).text()).to.contain("132Total Patrons");
      expect(groups.at(0).text()).to.contain("21Patrons With Active Loans");
      expect(groups.at(0).text()).to.contain(
        "23Patrons With Active Loans or Holds"
      );

      /* Circulation */
      expect(groups.at(1).text()).to.contain("Circulation");
      statItems = groups.at(1).find("SingleStatListItem");
      expect(statItems.length).to.equal(2);
      expectStats(statItems.at(0).props(), "Active Loans", 87);
      expectStats(statItems.at(1).props(), "Active Holds", 5);
      expect(groups.at(1).text()).to.contain("87Active Loans");
      expect(groups.at(1).text()).to.contain("5Active Holds");

      /* Inventory */
      expect(groups.at(2).text()).to.contain("Inventory");
      statItems = groups.at(2).find("SingleStatListItem");
      expect(statItems.length).to.equal(5);
      expectStats(statItems.at(0).props(), "Titles", 29119);
      expectStats(statItems.at(1).props(), "Available Titles", 29092);
      expectStats(statItems.at(2).props(), "Metered License Titles", 20658);
      expectStats(statItems.at(3).props(), "Unlimited License Titles", 623);
      expectStats(statItems.at(4).props(), "Open Access Titles", 7838);
      expect(groups.at(2).text()).to.contain("29.1kTitles");
      expect(groups.at(2).text()).to.contain("29.1kAvailable Titles");
      expect(groups.at(2).text()).to.contain("20.7kMetered License Titles");
      expect(groups.at(2).text()).to.contain("623Unlimited License Titles");
      expect(groups.at(2).text()).to.contain("7.8kOpen Access Titles");

      /* Collections */
      expect(groups.at(3).text()).to.contain("Collections");
      const chart = groups.at(3).find(BarChart);
      expect(chart.length).to.equal(1);
      const chartData = chart.props().data;
      expect(chartData.length).to.equal(
        defaultLibraryStatsTestData.collections.length
      );
      expect(chartData[0]).to.deep.equal({
        name: "New BiblioBoard Test",
        titles: 13306,
        availableTitles: 13306,
        selfHostedTitles: 0,
        openAccessTitles: 0,
        licensedTitles: 13306,
        unlimitedLicenseTitles: 0,
        meteredLicenseTitles: 13306,
        meteredLicensesOwned: 13306,
        meteredLicensesAvailable: 13306,
        _by_medium: {},
      });
      expect(chart.props().data).to.deep.equal([
        {
          name: "New BiblioBoard Test",
          titles: 13306,
          availableTitles: 13306,
          selfHostedTitles: 0,
          openAccessTitles: 0,
          licensedTitles: 13306,
          unlimitedLicenseTitles: 0,
          meteredLicenseTitles: 13306,
          meteredLicensesOwned: 13306,
          meteredLicensesAvailable: 13306,
          _by_medium: {},
        },
        {
          name: "New Bibliotheca Test Collection",
          titles: 76,
          availableTitles: 64,
          selfHostedTitles: 0,
          openAccessTitles: 0,
          licensedTitles: 76,
          unlimitedLicenseTitles: 0,
          meteredLicenseTitles: 76,
          meteredLicensesOwned: 85,
          meteredLicensesAvailable: 72,
          _by_medium: {},
        },
        {
          name: "Palace Bookshelf",
          titles: 7838,
          availableTitles: 7838,
          selfHostedTitles: 0,
          openAccessTitles: 7838,
          licensedTitles: 0,
          unlimitedLicenseTitles: 0,
          meteredLicenseTitles: 0,
          meteredLicensesOwned: 0,
          meteredLicensesAvailable: 0,
          _by_medium: {},
        },
        {
          name: "TEST Baker & Taylor",
          titles: 146,
          availableTitles: 134,
          selfHostedTitles: 0,
          openAccessTitles: 0,
          licensedTitles: 146,
          unlimitedLicenseTitles: 0,
          meteredLicenseTitles: 146,
          meteredLicensesOwned: 147,
          meteredLicensesAvailable: 135,
          _by_medium: {},
        },
        {
          name: "TEST Palace Marketplace",
          titles: 7753,
          availableTitles: 7750,
          selfHostedTitles: 0,
          openAccessTitles: 0,
          licensedTitles: 7753,
          unlimitedLicenseTitles: 0,
          meteredLicenseTitles: 7753,
          meteredLicensesOwned: 305725,
          meteredLicensesAvailable: 75337,
          _by_medium: {},
        },
      ]);
    });
  });
});
