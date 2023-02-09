import { expect } from "chai";

import * as React from "react";
import { mount } from "enzyme";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import { normalizeStatistics, Stats, StatsProps } from "../Stats";
import LibraryStats from "../LibraryStats";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";

import { statisticsApiResponseData } from "../../../tests/__data__/statisticsApiResponseData";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const statisticsData = normalizeStatistics(statisticsApiResponseData);
const { summaryStatistics } = statisticsData;
const libraries = statisticsData.libraries;
const librariesDataByKey = Object.assign(
  {},
  ...libraries.map((l) => ({ [l.key]: l }))
);

describe("Stats", () => {
  const testLibraryKey = "lyrasis-reads";
  const testLibraryApiData = librariesDataByKey[testLibraryKey];
  const testLibraryStatsData = librariesDataByKey[testLibraryKey];

  describe("rendering", () => {
    const fetchError = { status: 401, response: "test", url: "test url" };
    const statsState = (stats: object) => ({ editor: { stats } });
    const initialState = statsState({ isLoaded: false });
    const loadedState = statsState({
      data: statisticsApiResponseData,
      isLoaded: true,
    });
    const errorState = statsState({ fetchError });

    const ReduxProvider = ({ children, store }) => {
      return (
        <Provider store={store ?? mockStore(statsState({}))}>
          {children}
        </Provider>
      );
    };

    /** Helper function to wrap the component under test in a Redux
     * <Provider /> component.
     * @param state - passed to the <Provider/> component in a mock store.
     * @param {StatsProps} props - passed to the <Stats/> component as props.
     */
    const mountStatsInProvider = (state?, props?) => {
      const wrapper = mount(<Stats {...props} />, {
        wrappingComponent: ReduxProvider,
      });
      const provider = wrapper.getWrappingComponent();
      !!state && provider.setProps({ store: mockStore(state) });
      return { wrapper, provider };
    };

    it("shows error message", () => {
      const { wrapper, provider } = mountStatsInProvider(initialState);

      let error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(0);

      provider.setProps({ store: mockStore(errorState) });
      error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(1);
    });

    it("shows/hides loading indicator", () => {
      const { wrapper, provider } = mountStatsInProvider(initialState);

      let loading = wrapper.find(LoadingIndicator);
      expect(loading.length).to.equal(1);

      provider.setProps({ store: mockStore(loadedState) });
      loading = wrapper.find(LoadingIndicator);
      expect(loading.length).to.equal(0);
    });

    it("shows stats for only specified library, if library is specified", () => {
      const { wrapper } = mountStatsInProvider(loadedState, {
        library: testLibraryApiData.key,
      });

      const libraryStats = wrapper.find(LibraryStats);
      expect(libraryStats.length).to.equal(1);
      expect(libraryStats.at(0).props().stats).to.deep.equal(
        testLibraryStatsData
      );
      expect(libraryStats.at(0).props().library).to.equal(testLibraryKey);
    });

    it("shows site-wide stats when no library specified", () => {
      const { wrapper } = mountStatsInProvider(loadedState);

      const libraryStats = wrapper.find(LibraryStats);
      expect(libraryStats.length).to.equal(1);
      expect(libraryStats.at(0).props().stats).to.deep.equal(summaryStatistics);
      expect(libraryStats.at(0).props().library).to.be.undefined;
    });
  });
});
