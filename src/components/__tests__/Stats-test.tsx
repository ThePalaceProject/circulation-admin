import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { Stats } from "../Stats";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import LibraryStats from "../LibraryStats";
import { StatsData, LibraryStatsData, LibraryData } from "../../interfaces";

describe("Stats", () => {
  const libraryStatsData: LibraryStatsData = {
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
    patrons: {
      holds: 5,
      loans: 0,
      total: 132,
      with_active_loans: 0,
      with_active_loans_or_holds: 4,
    },
  };
  const totalStatsData = Object.assign({}, libraryStatsData, {
    inventory: {
      titles: 100000,
      licenses: 234567,
      available_licenses: 200000,
    },
  });

  const statsData: StatsData = {
    NYPL: libraryStatsData,
    BPL: libraryStatsData,
    total: totalStatsData,
  };

  const librariesData: LibraryData[] = [
    { short_name: "NYPL" },
    { short_name: "BPL" },
  ];

  describe("rendering", () => {
    let wrapper;
    const fetchError = { status: 401, response: "test", url: "test url" };
    let fetchStats;
    let fetchLibraries;

    beforeEach(() => {
      fetchStats = stub().returns(
        new Promise<void>((resolve, reject) => resolve())
      );
      fetchLibraries = stub().returns(
        new Promise<void>((resolve, reject) => resolve())
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
      expect(libraryStats.at(0).props().library).to.deep.equal(
        librariesData[0]
      );
      expect(libraryStats.at(1).props().stats).to.deep.equal(totalStatsData);
      expect(libraryStats.at(1).props().library).to.be.undefined;

      // No total stats.
      wrapper.setProps({ stats: { NYPL: libraryStatsData } });
      libraryStats = wrapper.find(LibraryStats);
      expect(libraryStats.length).to.equal(1);

      expect(libraryStats.at(0).props().stats).to.deep.equal(libraryStatsData);
      expect(libraryStats.at(0).props().library).to.deep.equal(
        librariesData[0]
      );

      // Still no total stats, since there's only one library.
      wrapper.setProps({
        stats: { NYPL: libraryStatsData, total: totalStatsData },
        libraries: [librariesData[0]],
      });
      libraryStats = wrapper.find(LibraryStats);
      expect(libraryStats.length).to.equal(1);

      expect(libraryStats.at(0).props().stats).to.deep.equal(libraryStatsData);
      expect(libraryStats.at(0).props().library).to.deep.equal(
        librariesData[0]
      );
    });

    it("shows site-wide stats when no library specified", () => {
      wrapper.setProps({ isLoaded: true, library: null });
      const libraryStats = wrapper.find(LibraryStats);
      expect(libraryStats.length).to.equal(1);

      expect(libraryStats.at(0).props().stats).to.deep.equal(totalStatsData);
      expect(libraryStats.at(0).props().library).to.be.undefined;
    });
  });
});
