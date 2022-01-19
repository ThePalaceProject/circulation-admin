// import { expect } from "chai";
// import { stub } from "sinon";

// import * as React from "react";
// import { mount } from "enzyme";

// import CustomListBuilder from "../CustomListBuilder";

// import * as PropTypes from "prop-types";
// import CustomListSearchResults from "../CustomListSearchResults";
// import CustomListEntries from "../CustomListEntries";

// describe("CustomListBuilder", () => {
//   let wrapper;
//   let loadMoreSearchResults;
//   let loadMoreEntries;
//   let childContextTypes;
//   let fullContext;
//   let addEntry;
//   let addAll;
//   let deleteAll;
//   let deleteEntry;
//   let setLoadedMoreEntries;

//   const searchResultsData = {
//     id: "id",
//     url: "url",
//     title: "title",
//     lanes: [],
//     navigationLinks: [],
//     books: [
//       {
//         id: "1",
//         title: "result 1",
//         authors: ["author 1"],
//         url: "/some/url1",
//         language: "eng",
//         raw: {
//           $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
//         },
//       },
//     ],
//   };

//   const entriesData = [
//     {
//       id: "A",
//       title: "entry A",
//       authors: ["author A"],
//       url: "/some/urlA",
//       raw: {
//         $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
//       },
//     },
//   ];

//   beforeEach(() => {
//     loadMoreSearchResults = stub();
//     loadMoreEntries = stub();
//     setLoadedMoreEntries = stub();
//     addEntry = stub();
//     addAll = stub();
//     deleteAll = stub();
//     deleteEntry = stub();

//     childContextTypes = {
//       pathFor: PropTypes.func.isRequired,
//       router: PropTypes.object.isRequired,
//     };
//     fullContext = {
//       pathFor: stub().returns("url"),
//       router: {
//         createHref: stub(),
//         push: stub(),
//         isActive: stub(),
//         replace: stub(),
//         go: stub(),
//         goBack: stub(),
//         goForward: stub(),
//         setRouteLeaveHook: stub(),
//       },
//     };

//     wrapper = mount(
//       <CustomListBuilder
//         entries={entriesData}
//         loadMoreSearchResults={loadMoreSearchResults}
//         loadMoreEntries={loadMoreEntries}
//         isFetchingMoreSearchResults={false}
//         isFetchingMoreCustomListEntries={false}
//         searchResults={searchResultsData}
//         addAll={addAll}
//         addEntry={addEntry}
//         deleteAll={deleteAll}
//         deleteEntry={deleteEntry}
//         setLoadedMoreEntries={setLoadedMoreEntries}
//       />,
//       { context: fullContext, childContextTypes }
//     );
//   });
//   it("renders Search Results and Entries components", () => {
//     expect(wrapper.find(CustomListSearchResults)).to.be.ok;
//     expect(wrapper.find(CustomListEntries)).to.be.ok;
//   });

//   // Skipping tests related to drag-and-drop functionality until the
//   // react-beautiful-dnd dependency in this repository is updated from
//   // v2.3.1 to the current, v13+, or whatever the highest version is
//   // that still works.

//   it.skip("prevents dragging within search results", () => {
//     // simulate starting a drag from search results
//     // find search results container and check that isDropDisabled is true
//   });

//   it.skip("prevents dragging within list entries", () => {
//     // simulate starting a drag from entries
//     // find entries container and check that isDropDisabled is true
//   });

//   it.skip("drags from search results to list entries", () => {
//     // simulate starting a drag from search results
//     // find entries container and check that isDropDisabled is false
//     // simulate dropping on the entries
//     // check entries for new entry
//     // check entry has been removed from search results
//   });

//   it.skip("drags from list entries to search results, assuming entry is from current results", () => {
//     // simulate starting a drag from entries
//     // find search results container and check that isDropDisabled is false
//     // simulate dropping on the search results
//     // check search results for result
//     // check search result has been removed from entries
//   });

//   it.skip("shows message in place of search results when dragging from list entries", () => {
//     // simulate starting a drag from entries
//     // find search results container and check that isDropDisabled is false
//     // expect message to equal "Drag books here to remove them from the list."
//     // if you drop anywhere on the page, the message goes away
//     // simulate dropping outside a droppable (no destination)
//     // find search results container and check that isDropDisabled is true
//     // message length should be 0
//   });
// });
