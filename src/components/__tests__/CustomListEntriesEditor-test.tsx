import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import CustomListEntriesEditor from "../CustomListEntriesEditor";

import * as PropTypes from "prop-types";
import CustomListSearchResults from "../CustomListSearchResults";
import CustomListEntries from "../CustomListEntries";

describe("CustomListEntriesEditor", () => {
  let wrapper;
  let loadMoreSearchResults;
  let loadMoreEntries;
  let childContextTypes;
  let fullContext;
  let addEntry;
  let addAll;
  let deleteAll;
  let deleteEntry;
  let setLoadedMoreEntries;

  const searchResultsData = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    navigationLinks: [],
    books: [
      {
        id: "1",
        title: "result 1",
        authors: ["author 1"],
        url: "/some/url1",
        language: "eng",
        raw: {
          $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
        },
      },
    ],
  };

  const entriesData = [
    {
      id: "A",
      title: "entry A",
      authors: ["author A"],
      url: "/some/urlA",
      raw: {
        $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
      },
    },
  ];

  beforeEach(() => {
    loadMoreSearchResults = stub();
    loadMoreEntries = stub();
    setLoadedMoreEntries = stub();
    addEntry = stub();
    addAll = stub();
    deleteAll = stub();
    deleteEntry = stub();

    childContextTypes = {
      pathFor: PropTypes.func.isRequired,
      router: PropTypes.object.isRequired,
    };
    fullContext = Object.assign(
      {},
      {
        pathFor: stub().returns("url"),
        router: {
          createHref: stub(),
          push: stub(),
          isActive: stub(),
          replace: stub(),
          go: stub(),
          goBack: stub(),
          goForward: stub(),
          setRouteLeaveHook: stub(),
        },
      }
    );

    wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        searchResults={searchResultsData}
        addAll={addAll}
        addEntry={addEntry}
        deleteAll={deleteAll}
        deleteEntry={deleteEntry}
        setLoadedMoreEntries={setLoadedMoreEntries}
      />,
      { context: fullContext, childContextTypes }
    );
  });
  it("renders Search Results and Entries components", () => {
    expect(wrapper.find(CustomListSearchResults)).to.be.ok;
    expect(wrapper.find(CustomListEntries)).to.be.ok;
  });
});
