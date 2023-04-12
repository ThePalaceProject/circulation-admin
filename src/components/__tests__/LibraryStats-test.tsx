import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import LibraryStats from "../LibraryStats";
import { LibraryStatsData } from "../../interfaces";
import { BarChart } from "recharts";

describe("LibraryStats", () => {
  // const statsData: LibraryStatsData = {
  //   patrons: {
  //     total: 3456,
  //     with_active_loans: 55,
  //     with_active_loans_or_holds: 1234,
  //     loans: 100,
  //     holds: 2000,
  //   },
  //   inventory: {
  //     titles: 54321,
  //     licenses: 123456,
  //     available_licenses: 100000,
  //   },
  //   collections: {
  //     Overdrive: {
  //       licensed_titles: 490,
  //       open_access_titles: 10,
  //       licenses: 350,
  //       available_licenses: 100,
  //     },
  //     Bibliotheca: {
  //       licensed_titles: 400,
  //       open_access_titles: 0,
  //       licenses: 300,
  //       available_licenses: 170,
  //     },
  //     "Axis 360": {
  //       licensed_titles: 300,
  //       open_access_titles: 0,
  //       licenses: 280,
  //       available_licenses: 260,
  //     },
  //     "Open Bookshelf": {
  //       licensed_titles: 0,
  //       open_access_titles: 1200,
  //       licenses: 0,
  //       available_licenses: 0,
  //     },
  //   },
  // };
  const statsData: LibraryStatsData = {
    inventory: {
      available_licenses: 88850,
      enumerated_license_titles: 21281,
      lendable_titles: 29092,
      licensed_titles: 21281,
      licenses: 319263,
      open_access_titles: 7838,
      self_hosted_titles: 0,
      titles: 29119,
      unlimited_license_titles: 0,
    },
    collections: {
      OverDrive: {
        titles: 500,
        lendable_titles: 90,
        enumerated_license_titles: 490,
        unlimited_license_titles: 0,
        licensed_titles: 490,
        open_access_titles: 10,
        licenses: 350,
        available_licenses: 100,
        self_hosted_titles: 0,
      },
      BiblioBoard: {
        available_licenses: 13306,
        enumerated_license_titles: 13306,
        lendable_titles: 13306,
        licensed_titles: 13306,
        licenses: 13306,
        open_access_titles: 0,
        self_hosted_titles: 0,
        titles: 13306,
        unlimited_license_titles: 0,
      },
      Bibliotheca: {
        available_licenses: 72,
        enumerated_license_titles: 76,
        lendable_titles: 64,
        licensed_titles: 76,
        licenses: 85,
        open_access_titles: 0,
        self_hosted_titles: 0,
        titles: 76,
        unlimited_license_titles: 0,
      },
      "B&T Axis 360": {
        available_licenses: 135,
        enumerated_license_titles: 146,
        lendable_titles: 134,
        licensed_titles: 146,
        licenses: 147,
        open_access_titles: 0,
        self_hosted_titles: 0,
        titles: 146,
        unlimited_license_titles: 0,
      },
      "Palace Marketplace": {
        available_licenses: 75337,
        enumerated_license_titles: 7753,
        lendable_titles: 7750,
        licensed_titles: 7753,
        licenses: 305725,
        open_access_titles: 0,
        self_hosted_titles: 0,
        titles: 7753,
        unlimited_license_titles: 0,
      },
      "Palace Bookshelf": {
        available_licenses: 0,
        enumerated_license_titles: 0,
        lendable_titles: 7838,
        licensed_titles: 0,
        licenses: 0,
        open_access_titles: 7838,
        self_hosted_titles: 0,
        titles: 7838,
        unlimited_license_titles: 0,
      },
    },
    patrons: {
      total: 3456,
      with_active_loans: 55,
      with_active_loans_or_holds: 1234,
      loans: 100,
      holds: 2000,
    },
  };

  const libraryData = {
    name: "Brooklyn Public Library",
    short_name: "BPL",
  };

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
      wrapper = shallow(<LibraryStats stats={statsData} />);
    });

    it("shows 'all libraries' header when there is no library", () => {
      const header = wrapper.find("h2");
      expect(header.text()).to.contain("All Libraries");
    });

    it("shows library header", () => {
      wrapper.setProps({ library: libraryData });
      const header = wrapper.find("h2");
      expect(header.text()).to.contain("Brooklyn Public Library");
      expect(header.text()).not.to.contain("All Libraries");
    });

    it("shows stats data", () => {
      const groups = wrapper.find(".stat-group");
      let singleStats;
      expect(groups.length).to.equal(5);

      expect(groups.at(0).text()).to.contain("Patrons");
      singleStats = groups.at(0).find("SingleStat");
      expect(singleStats.length).to.equal(3);
      expectStats(singleStats.at(0).props(), "Total Patrons", 3456);
      expectStats(singleStats.at(1).props(), "Patrons With Active Loans", 55);
      expectStats(
        singleStats.at(2).props(),
        "Patrons With Active Loans or Holds",
        1234
      );
      // expect(groups.at(0).text()).to.contain("3.5kTotal Patrons");
      // expect(groups.at(0).text()).to.contain("55Patrons With Active Loans");
      // expect(groups.at(0).text()).to.contain(
      //   "1.2kPatrons With Active Loans or Holds"
      // );

      expect(groups.at(1).text()).to.contain("Circulation");
      singleStats = groups.at(1).find("SingleStat");
      expect(singleStats.length).to.equal(2);
      expectStats(singleStats.at(0).props(), "Active Loans", 100);
      expectStats(singleStats.at(1).props(), "Active Holds", 2000);
      // expectStats(singleStats.at(0).props(), "Patrons With Active Loans or Holds", 1234);
      // expect(groups.at(1).text()).to.contain("100Active Loans");
      // expect(groups.at(1).text()).to.contain("2kActive Holds");

      expect(groups.at(2).text()).to.contain("Inventory");
      singleStats = groups.at(2).find("SingleStat");
      expect(singleStats.length).to.equal(5);
      expectStats(singleStats.at(0).props(), "Titles", 29119);
      expectStats(
        singleStats.at(1).props(),
        "Enumerated license titles",
        21281
      );
      expectStats(singleStats.at(2).props(), "Unlimited license titles", 0);
      expectStats(singleStats.at(3).props(), "Open access titles", 7838);
      expectStats(singleStats.at(4).props(), "Self-hosted titles", 0);
      // expect(groups.at(2).text()).to.contain("54.3kTitles");
      // expect(groups.at(2).text()).to.contain("123.5kTotal Licenses");
      // expect(groups.at(2).text()).to.contain("100kAvailable Licenses");

      expect(groups.at(3).text()).to.contain("Enumerated Licenses");
      singleStats = groups.at(3).find("SingleStat");
      expect(singleStats.length).to.equal(3);
      expectStats(
        singleStats.at(0).props(),
        "Enumerated license titles",
        21281
      );
      expectStats(singleStats.at(1).props(), "Total Licenses", 319263);
      expectStats(singleStats.at(2).props(), "Available Licenses", 88850);
      // expect(groups.at(2).text()).to.contain("54.3kTitles");
      // expect(groups.at(2).text()).to.contain("123.5kTotal Licenses");
      // expect(groups.at(2).text()).to.contain("100kAvailable Licenses");

      expect(groups.at(4).text()).to.contain("Collections");
      const chart = groups.at(4).find(BarChart);
      expect(chart.length).to.equal(1);
      const chartData = chart.props().data;
      expect(chartData.length).to.equal(6);
      expect(chartData[0]).to.equal({
        label: "Overdrive",
        "Licensed Titles": 490,
        "Open Access Titles": 10,
      });
      expect(chart.props().data).to.deep.equal([
        {
          label: "Overdrive",
          "Licensed Titles": 490,
          "Open Access Titles": 10,
        },
        {
          label: "Bibliotheca",
          "Licensed Titles": 400,
          "Open Access Titles": 0,
        },
        { label: "Axis 360", "Licensed Titles": 300, "Open Access Titles": 0 },
        {
          label: "Open Bookshelf",
          "Licensed Titles": 0,
          "Open Access Titles": 1200,
        },
      ]);
    });

    it("hides patrons and circulation groups when there are no patrons", () => {
      const noPatrons = Object.assign({}, statsData, {
        patrons: {
          total: 0,
          with_active_loans: 0,
          with_active_loans_or_holds: 0,
          loans: 0,
          holds: 0,
        },
      });
      wrapper.setProps({ stats: noPatrons });
      const groups = wrapper.find(".stat-group");
      expect(groups.length).to.equal(2);

      expect(groups.at(0).text()).to.contain("Inventory");
      expect(groups.at(1).text()).to.contain("Collections");
    });

    it("hides licenses in inventory when there are no licenses", () => {
      const noLicenses = Object.assign({}, statsData, {
        inventory: {
          titles: 54321,
          licenses: 0,
          available_licenses: 0,
        },
      });
      wrapper.setProps({ stats: noLicenses });
      const groups = wrapper.find(".stat-group");
      expect(groups.length).to.equal(4);

      expect(groups.at(2).text()).to.contain("Inventory");
      expect(groups.at(2).text()).to.contain("54.3kTitles");
      expect(groups.at(2).text()).not.to.contain("Licenses");
    });

    it("hides collections section when there are no collections", () => {
      const noCollections = Object.assign({}, statsData, { collections: {} });
      wrapper.setProps({ stats: noCollections });
      const groups = wrapper.find(".stat-group");
      expect(groups.length).to.equal(3);

      expect(groups.at(0).text()).to.contain("Patrons");
      expect(groups.at(1).text()).to.contain("Circulation");
      expect(groups.at(2).text()).to.contain("Inventory");
    });
  });
});
