import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import LibraryStats from "../LibraryStats";
import { LibraryStatsData } from "../../interfaces";
import { BarChart } from "recharts";

describe("LibraryStats", () => {
  let statsData: LibraryStatsData = {
    patrons:  {
      total: 3456,
      with_active_loans: 55,
      with_active_loans_or_holds: 1234,
      loans: 100,
      holds: 2000
    },
    inventory: {
      titles: 54321,
      licenses: 123456,
      available_licenses: 100000
    },
    collections: {
      Overdrive: {
        licensed_titles: 490,
        open_access_titles: 10,
        licenses: 350,
        available_licenses: 100
      },
      Bibliotheca: {
        licensed_titles: 400,
        open_access_titles: 0,
        licenses: 300,
        available_licenses: 170
      },
      "Axis 360": {
        licensed_titles: 300,
        open_access_titles: 0,
        licenses: 280,
        available_licenses: 260
      },
      "Open Bookshelf" : {
        licensed_titles: 0,
        open_access_titles: 1200,
        licenses: 0,
        available_licenses: 0
      }
    }
  };

  const libraryData = {
    name: "Brooklyn Public Library",
    short_name: "BPL"
  };

  describe("rendering", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(
        <LibraryStats
          stats={statsData}
          />
      );
    });

    it("shows 'all libraries' header when there is no library", () => {
      let header = wrapper.find("h2");
      expect(header.text()).to.contain("All Libraries");
    });

    it("shows library header", () => {
      wrapper.setProps({ library: libraryData });
      let header = wrapper.find("h2");
      expect(header.text()).to.contain("Brooklyn Public Library");
      expect(header.text()).not.to.contain("All Libraries");
    });

    it("shows stats data", () => {
      let groups = wrapper.find(".stat-group");
      expect(groups.length).to.equal(4);

      expect(groups.at(0).text()).to.contain("Patrons");
      expect(groups.at(0).text()).to.contain("3.5kTotal Patrons");
      expect(groups.at(0).text()).to.contain("55Patrons With Active Loans");
      expect(groups.at(0).text()).to.contain("1.2kPatrons With Active Loans or Holds");

      expect(groups.at(1).text()).to.contain("Circulation");
      expect(groups.at(1).text()).to.contain("100Active Loans");
      expect(groups.at(1).text()).to.contain("2kActive Holds");

      expect(groups.at(2).text()).to.contain("Inventory");
      expect(groups.at(2).text()).to.contain("54.3kTitles");
      expect(groups.at(2).text()).to.contain("123.5kTotal Licenses");
      expect(groups.at(2).text()).to.contain("100kAvailable Licenses");

      expect(groups.at(3).text()).to.contain("Collections");
      let chart = groups.at(3).find(BarChart);
      expect(chart.length).to.equal(1);
      expect(chart.props().data).to.deep.equal([
        { label: "Overdrive", "Licensed Titles": 490, "Open Access Titles": 10 },
        { label: "Bibliotheca", "Licensed Titles": 400, "Open Access Titles" : 0 },
        { label: "Axis 360", "Licensed Titles": 300, "Open Access Titles": 0 },
        { label: "Open Bookshelf", "Licensed Titles": 0, "Open Access Titles": 1200 }
      ]);
    });

    it("hides patrons and circulation groups when there are no patrons", () => {
      let noPatrons = Object.assign({}, statsData, {
        patrons: {
          total: 0,
          with_active_loans: 0,
          with_active_loans_or_holds: 0,
          loans: 0,
          holds: 0
        }
      });
      wrapper.setProps({ stats: noPatrons });
      let groups = wrapper.find(".stat-group");
      expect(groups.length).to.equal(2);

      expect(groups.at(0).text()).to.contain("Inventory");
      expect(groups.at(1).text()).to.contain("Collections");
    });

    it("hides licenses in inventory when there are no licenses", () => {
      let noLicenses = Object.assign({}, statsData, {
        inventory: {
          titles: 54321,
          licenses: 0,
          available_licenses: 0
        }
      });
      wrapper.setProps({ stats: noLicenses });
      let groups = wrapper.find(".stat-group");
      expect(groups.length).to.equal(4);

      expect(groups.at(2).text()).to.contain("Inventory");
      expect(groups.at(2).text()).to.contain("54.3kTitles");
      expect(groups.at(2).text()).not.to.contain("Licenses");
    });

    it("hides collections section when there are no collections", () => {
      let noCollections = Object.assign({}, statsData, { collections: {} });
      wrapper.setProps({ stats: noCollections });
      let groups = wrapper.find(".stat-group");
      expect(groups.length).to.equal(3);

      expect(groups.at(0).text()).to.contain("Patrons");
      expect(groups.at(1).text()).to.contain("Circulation");
      expect(groups.at(2).text()).to.contain("Inventory");
    });
  });
});