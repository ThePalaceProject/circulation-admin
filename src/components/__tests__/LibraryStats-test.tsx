import { expect } from "chai";

import * as React from "react";
import { mount } from "enzyme";

import { normalizeStatistics } from "../Stats";
import LibraryStats from "../LibraryStats";
import { BarChart, ResponsiveContainer } from "recharts";

import {
  statisticsApiResponseData,
  testLibraryKey,
  noCollectionsLibraryKey,
  noInventoryLibraryKey,
  noPatronsLibraryKey,
} from "../../../tests/__data__/statisticsApiResponseData";

describe("LibraryStats", () => {
  // Convert from the API format to our in-app format.
  const statisticsData = normalizeStatistics(statisticsApiResponseData);
  const librariesStatsTestDataByKey = Object.assign(
    {},
    ...statisticsData.libraries.map((l) => ({ [l.key]: l }))
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

  describe("rendering", () => {
    let wrapper;
    beforeEach(() => {
      wrapper = mount(<LibraryStats stats={defaultLibraryStatsTestData} />);
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
      expect(statItems.length).to.equal(6);
      expectStats(statItems.at(0).props(), "Titles", 29119);
      expectStats(statItems.at(1).props(), "Lendable titles", 29092);
      expectStats(statItems.at(2).props(), "Metered license titles", 20658);
      expectStats(statItems.at(3).props(), "Unlimited license titles", 623);
      expectStats(statItems.at(4).props(), "Open access titles", 7838);
      expectStats(statItems.at(5).props(), "Self-hosted titles", 145);
      expect(groups.at(2).text()).to.contain("29.1kTitles");
      expect(groups.at(2).text()).to.contain("29.1kLendable titles");
      expect(groups.at(2).text()).to.contain("20.7kMetered license titles");
      expect(groups.at(2).text()).to.contain("623Unlimited license titles");
      expect(groups.at(2).text()).to.contain("7.8kOpen access titles");
      expect(groups.at(2).text()).to.contain("145Self-hosted titles");

      /* Collections */
      expect(groups.at(3).text()).to.contain("Collections");
      const chart = groups.at(3).find(ResponsiveContainer).find(BarChart);
      expect(chart.length).to.equal(1);
      const chartData = chart.props().data;
      expect(chartData.length).to.equal(
        defaultLibraryStatsTestData.collections.length
      );
      expect(chartData[0]).to.deep.equal({
        name: "New BiblioBoard Test",
        titles: 13306,
        lendable: 13306,
        selfHosted: 0,
        openAccess: 0,
        licensed: 13306,
        unlimitedLicense: 0,
        meteredLicense: 13306,
        meteredLicensesOwned: 13306,
        meteredLicensesAvailable: 13306,
      });
      expect(chart.props().data).to.deep.equal([
        {
          name: "New BiblioBoard Test",
          titles: 13306,
          lendable: 13306,
          selfHosted: 0,
          openAccess: 0,
          licensed: 13306,
          unlimitedLicense: 0,
          meteredLicense: 13306,
          meteredLicensesOwned: 13306,
          meteredLicensesAvailable: 13306,
        },
        {
          name: "New Bibliotheca Test Collection",
          titles: 76,
          lendable: 64,
          selfHosted: 0,
          openAccess: 0,
          licensed: 76,
          unlimitedLicense: 0,
          meteredLicense: 76,
          meteredLicensesOwned: 85,
          meteredLicensesAvailable: 72,
        },
        {
          name: "Palace Bookshelf",
          titles: 7838,
          lendable: 7838,
          selfHosted: 0,
          openAccess: 7838,
          licensed: 0,
          unlimitedLicense: 0,
          meteredLicense: 0,
          meteredLicensesOwned: 0,
          meteredLicensesAvailable: 0,
        },
        {
          name: "TEST Baker & Taylor",
          titles: 146,
          lendable: 134,
          selfHosted: 0,
          openAccess: 0,
          licensed: 146,
          unlimitedLicense: 0,
          meteredLicense: 146,
          meteredLicensesOwned: 147,
          meteredLicensesAvailable: 135,
        },
        {
          name: "TEST Palace Marketplace",
          titles: 7753,
          lendable: 7750,
          selfHosted: 0,
          openAccess: 0,
          licensed: 7753,
          unlimitedLicense: 0,
          meteredLicense: 7753,
          meteredLicensesOwned: 305725,
          meteredLicensesAvailable: 75337,
        },
      ]);
    });

    it("show patrons and circulation groups, even when there are no patrons", () => {
      const noPatrons = librariesStatsTestDataByKey[noPatronsLibraryKey];
      wrapper.setProps({ stats: noPatrons });
      const groups = wrapper.find(".stat-group");
      expect(groups.length).to.equal(4);

      expect(groups.at(0).text()).to.contain("Patrons");
      expect(groups.at(1).text()).to.contain("Circulation");
      expect(groups.at(2).text()).to.contain("Inventory");
    });

    it("shows inventory group, even when there is no inventory", () => {
      const noInventory = librariesStatsTestDataByKey[noInventoryLibraryKey];
      wrapper.setProps({ stats: noInventory });
      const groups = wrapper.find(".stat-group");
      expect(groups.length).to.equal(4);

      expect(groups.at(0).text()).to.contain("Patrons");
      expect(groups.at(1).text()).to.contain("Circulation");
      expect(groups.at(2).text()).to.contain("Inventory");
    });

    it("shows appropriate message when there are no collections", () => {
      const noCollections =
        librariesStatsTestDataByKey[noCollectionsLibraryKey];
      wrapper.setProps({ stats: noCollections });
      const groups = wrapper.find(".stat-group");
      expect(groups.length).to.equal(4);

      expect(groups.at(0).text()).to.contain("Patrons");
      expect(groups.at(1).text()).to.contain("Circulation");
      expect(groups.at(2).text()).to.contain("Inventory");
      expect(groups.at(3).text()).to.contain(noCollectionsHeadingText);
    });
  });
});
