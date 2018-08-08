import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { Stats } from "../Stats";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import LibraryStats from "../LibraryStats";
import { StatsData, LibraryStatsData, LibraryData } from "../../interfaces";

describe("Stats", () => {
  let libraryStatsData: LibraryStatsData = {
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
        licensed_titles: 500,
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

  let totalStatsData = Object.assign({}, libraryStatsData, {
    inventory: {
      titles: 100000,
      licenses: 234567,
      available_licenses: 200000
    }
  });

  let statsData: StatsData = {
    NYPL: libraryStatsData,
    BPL: libraryStatsData,
    total: totalStatsData
  };

  let librariesData: LibraryData[] = [
    { short_name: "NYPL" },
    { short_name: "BPL" }
  ];

  describe("rendering", () => {
    let wrapper;
    let fetchError = { status: 401, response: "test", url: "test url" };
    let fetchStats;
    let fetchLibraries;

    beforeEach(() => {
      fetchStats = stub().returns(
        new Promise((resolve, reject) => resolve())
      );
      fetchLibraries = stub().returns(
        new Promise((resolve, reject) => resolve())
      );

      wrapper = shallow(
        <Stats
          stats={statsData}
          libraries={librariesData}
          fetchStats={fetchStats}
          fetchLibraries={fetchLibraries}
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

    it("shows LibraryStats", () => {
      wrapper.setProps({ isLoaded: true, library: "NYPL" });
      let libraryStats = wrapper.find(LibraryStats);
      expect(libraryStats.length).to.equal(2);

      expect(libraryStats.at(0).props().stats).to.deep.equal(libraryStatsData);
      expect(libraryStats.at(0).props().library).to.deep.equal(librariesData[0]);
      expect(libraryStats.at(1).props().stats).to.deep.equal(totalStatsData);
      expect(libraryStats.at(1).props().library).to.be.undefined;

      // No total stats.
      wrapper.setProps({ stats: { NYPL: libraryStatsData } });
      libraryStats = wrapper.find(LibraryStats);
      expect(libraryStats.length).to.equal(1);

      expect(libraryStats.at(0).props().stats).to.deep.equal(libraryStatsData);
      expect(libraryStats.at(0).props().library).to.deep.equal(librariesData[0]);

      // Still no total stats, since there's only one library.
      wrapper.setProps({ stats: { NYPL: libraryStatsData, total: totalStatsData }, libraries: [librariesData[0]] });
      libraryStats = wrapper.find(LibraryStats);
      expect(libraryStats.length).to.equal(1);

      expect(libraryStats.at(0).props().stats).to.deep.equal(libraryStatsData);
      expect(libraryStats.at(0).props().library).to.deep.equal(librariesData[0]);

      // No library stats.
      wrapper.setProps({ stats: { total: totalStatsData }, libraries: librariesData, library: null });
      libraryStats = wrapper.find(LibraryStats);
      expect(libraryStats.length).to.equal(1);

      expect(libraryStats.at(0).props().stats).to.deep.equal(totalStatsData);
      expect(libraryStats.at(0).props().library).to.be.undefined;
    });
  });
});