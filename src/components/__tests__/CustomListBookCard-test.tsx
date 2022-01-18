// import { expect } from "chai";
// import { stub } from "sinon";
// import * as React from "react";
// import * as Enzyme from "enzyme";
// import CustomListBookCard from "../CustomListBookCard";
// import { DragDropContext, Draggable } from "react-beautiful-dnd";
// import * as PropTypes from "prop-types";
// import { CollectionData, BookData } from "opds-web-client/lib/interfaces";
// import { Button } from "library-simplified-reusable-components";
// import CustomListEntries from "../CustomListEntries";
// import CustomListSearchResults from "../CustomListSearchResults";

// export interface Entry extends BookData {
//   medium?: string;
// }

// describe("CustomListBookCard", () => {
//   let wrapper;

//   const listData: CollectionData = {
//     id: "1",
//     url: "some url",
//     title: "original list title",
//     lanes: [],
//     books: [
//       {
//         id: "A",
//         title: "entry A",
//         authors: ["author 1"],
//         url: "/some/urlA",
//         raw: {
//           $: {
//             "schema:additionalType": {
//               value: "http://bib.schema.org/Audiobook",
//             },
//           },
//         },
//       },
//     ],
//     navigationLinks: [],
//   };

//   const searchResultsData: CollectionData = {
//     id: "id",
//     url: "url",
//     title: "title - search",
//     lanes: [],
//     navigationLinks: [],
//     books: [
//       {
//         id: "2",
//         title: "result 2",
//         authors: ["author 2a", "author 2b"],
//         url: "/some/url2",
//         language: "eng",
//         raw: {
//           $: {
//             "schema:additionalType": {
//               value: "http://bib.schema.org/Audiobook",
//             },
//           },
//         },
//       },
//     ],
//   };

//   const entriesNextPageUrl = "nextpage?after=50";

//   const deleteAll = stub();
//   const loadMoreEntries = stub();
//   const deleteEntry = stub();
//   const setLoadedMoreEntries = stub();
//   const handleDeleteEntry = stub();
//   const handleAddEntry = stub();
//   const onDragEnd = stub();
//   const addAll = stub();
//   const loadMoreSearchResults = stub();
//   const addEntry = stub();

//   const childContextTypes = {
//     pathFor: PropTypes.func.isRequired,
//     router: PropTypes.object.isRequired,
//   };
//   const fullContext = {
//     pathFor: stub().returns("url"),
//     router: {
//       createHref: stub(),
//       push: stub(),
//       isActive: stub(),
//       replace: stub(),
//       go: stub(),
//       goBack: stub(),
//       goForward: stub(),
//       setRouteLeaveHook: stub(),
//     },
//   };

//   it("renders a single entry", () => {
//     // Must include CustomListBookCard's parent because
//     // CustomListBookCard includes a Draggable and Draggables
//     // must always be inside a Droppable.
//     wrapper = Enzyme.mount(
//       <DragDropContext onDragEnd={onDragEnd}>
//         <CustomListEntries
//           addedListEntries={[]}
//           deletedListEntries={[]}
//           entries={listData.books}
//           entryCount="2"
//           isFetchingMoreCustomListEntries={false}
//           nextPageUrl={entriesNextPageUrl}
//           opdsFeedUrl="opdsFeedUrl"
//           deleteAll={deleteAll}
//           deleteEntry={deleteEntry}
//           loadMoreEntries={loadMoreEntries}
//           setLoadedMoreEntries={setLoadedMoreEntries}
//         >
//           <CustomListBookCard
//             index={0}
//             typeOfCard="entry"
//             book={listData.books[0]}
//             opdsFeedUrl="opdsFeedUrl"
//             handleDeleteEntry={handleDeleteEntry}
//           />
//         </CustomListEntries>
//       </DragDropContext>,
//       { context: fullContext, childContextTypes }
//     );
//     const result = wrapper.find(Draggable);
//     expect(result.length).to.equal(1);
//     expect(result.at(0).text()).to.contain("entry A");
//     expect(result.at(0).text()).to.contain("author 1");
//     const button = result.find(Button);
//     expect(button.text()).to.contain("Remove from list");
//   });

//   it("renders a single search result", () => {
//     // Must include CustomListBookCard's parent because
//     // CustomListBookCard includes a Draggable and Draggables
//     // must always be inside a Droppable.
//     wrapper = Enzyme.mount(
//       <DragDropContext onDragEnd={onDragEnd}>
//         <CustomListSearchResults
//           entries={listData.books}
//           isFetchingMoreSearchResults={false}
//           opdsFeedUrl="opdsFeedUrl"
//           searchResults={searchResultsData}
//           addAll={addAll}
//           addEntry={addEntry}
//           loadMoreSearchResults={loadMoreSearchResults}
//         >
//           <CustomListBookCard
//             index={0}
//             typeOfCard="searchResult"
//             book={searchResultsData.books[0]}
//             opdsFeedUrl="opdsFeedUrl"
//             handleDeleteEntry={handleAddEntry}
//           />
//         </CustomListSearchResults>
//       </DragDropContext>,
//       { context: fullContext, childContextTypes }
//     );

//     const result = wrapper.find(Draggable);
//     expect(result.length).to.equal(1);
//     expect(result.at(0).text()).to.contain("result 2");
//     expect(result.at(0).text()).to.contain("author 2");
//     const button = result.find(Button);
//     expect(button.text()).to.contain("Add to list");
//   });
// });
