import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { Stats } from "../Stats";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import { StatsData } from "../../interfaces";

describe("Stats", () => {
  let statsData: StatsData = {
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
    vendors: {
      overdrive: 500,
      bibliotheca: 400,
      axis360: 300,
      open_access: 1000
    }
  };

  describe("rendering", () => {
    let wrapper;
    let fetchError = { status: 401, response: "test", url: "test url" };
    let fetchStats;

    beforeEach(() => {
      fetchStats = stub().returns(
        new Promise((resolve, reject) => resolve())
      );

      wrapper = shallow(
        <Stats
          stats={statsData}
          fetchStats={fetchStats}
          isLoaded={false}
          />
      );
    });

    it("shows error message", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(0);
      wrapper.setProps({ fetchError });
      error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(1);
    });

    it("shows/hides loading indicator", () => {
      let loading = wrapper.find(LoadingIndicator);
      expect(loading.length).to.equal(1);
      wrapper.setProps({ isLoaded: true });
      loading = wrapper.find(LoadingIndicator);
      expect(loading.length).to.equal(0);
    });

    it("shows stats data", () => {
      wrapper.setProps({ isLoaded: true });
      let groups = wrapper.find(".list-inline");
      expect(groups.length).to.equal(3);

      expect(groups.at(0).text()).to.contain("Patrons");
      expect(groups.at(0).text()).to.contain("Total Patrons:3,456");
      expect(groups.at(0).text()).to.contain("Patrons with Active Loans:55");
      expect(groups.at(0).text()).to.contain("Patrons with Active Loans or Holds:1,234");
      expect(groups.at(0).text()).to.contain("Loans:100");
      expect(groups.at(0).text()).to.contain("Holds:2,000");

      expect(groups.at(1).text()).to.contain("Inventory");
      expect(groups.at(1).text()).to.contain("Titles:54,321");
      expect(groups.at(1).text()).to.contain("Licenses:123,456");
      expect(groups.at(1).text()).to.contain("Available Licenses:81%");

      expect(groups.at(2).text()).to.contain("Vendors");
      expect(groups.at(2).text()).to.contain("Overdrive Titles:500");
      expect(groups.at(2).text()).to.contain("Bibliotheca Titles:400");
      expect(groups.at(2).text()).to.contain("Axis 360 Titles:300");
      expect(groups.at(2).text()).to.contain("Open Access Titles:1,000");
    });
  });
});