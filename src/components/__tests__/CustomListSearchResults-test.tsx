// import { expect } from "chai";
// import { stub } from "sinon";
// import * as React from "react";
// import * as Enzyme from "enzyme";
// import CustomListSearchResults from "../CustomListSearchResults";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { AudioHeadphoneIcon, BookIcon } from "@nypl/dgx-svg-icons";
// import * as PropTypes from "prop-types";
// import { BookData } from "opds-web-client/lib/interfaces";
// import LoadButton from "../LoadButton";

// export interface Entry extends BookData {
//   medium?: string;
// }

// describe("CustomListSearchResults", () => {
//   let wrapper;

//   const entriesData: Entry[] = [
//     {
//       id: "A",
//       title: "entry A",
//       authors: ["author 1"],
//       raw: {
//         $: {
//           "schema:additionalType": { value: "http://schema.org/EBook" },
//         },
//       },
//     },
//     {
//       id: "B",
//       title: "entry B",
//       authors: ["author 2a", "author 2b"],
//       raw: {
//         $: {
//           "schema:additionalType": { value: "http://schema.org/EBook" },
//         },
//       },
//     },
//   ];

//   let searchResultsData = {
//     id: "id",
//     url: "url",
//     title: "title - search",
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
//       {
//         id: "3",
//         title: "result 3",
//         authors: ["author 3"],
//         url: "/some/url3",
//         language: "eng",
//         raw: {
//           $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
//         },
//       },
//     ],
//   };

//   const addAll = stub();
//   const loadMoreSearchResults = stub();
//   const setDraggingFrom = stub();
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
//   beforeEach(() => {
//     wrapper = Enzyme.mount(
//       <DragDropContext>
//         <CustomListSearchResults
//           draggingFrom={null}
//           entries={entriesData}
//           isFetchingMoreSearchResults={false}
//           opdsFeedUrl="opdsFeedUrl"
//           searchResults={searchResultsData}
//           addAll={addAll}
//           addEntry={addEntry}
//           loadMoreSearchResults={loadMoreSearchResults}
//           setDraggingFrom={setDraggingFrom}
//         />
//       </DragDropContext>,
//       { context: fullContext, childContextTypes }
//     );
//   });

//   it("renders search results", () => {
//     const resultsContainer = wrapper.find(".custom-list-search-results");
//     expect(resultsContainer.length).to.equal(1);

//     const droppable = resultsContainer.find(Droppable);
//     expect(droppable.length).to.equal(1);

//     const results = droppable.find(Draggable);
//     expect(results.length).to.equal(3);
//     expect(results.at(0).text()).to.contain("result 1");
//     expect(results.at(0).text()).to.contain("author 1");
//     expect(results.at(1).text()).to.contain("result 2");
//     expect(results.at(1).text()).to.contain("author 2a, author 2b");
//     expect(results.at(2).text()).to.contain("result 3");
//     expect(results.at(2).text()).to.contain("author 3");
//   });

//   it("renders a link to view each search result", () => {
//     const resultsContainer = wrapper.find(".custom-list-search-results");
//     expect(resultsContainer.length).to.equal(1);

//     const droppable = resultsContainer.find(Droppable);
//     expect(droppable.length).to.equal(1);

//     const results = droppable.find(Draggable);
//     expect(results.length).to.equal(3);

//     expect(results.at(0).find("CatalogLink").text()).to.equal("View details");
//     expect(results.at(0).find("CatalogLink").prop("bookUrl")).to.equal(
//       "/some/url1"
//     );
//     expect(results.at(1).find("CatalogLink").text()).to.equal("View details");
//     expect(results.at(1).find("CatalogLink").prop("bookUrl")).to.equal(
//       "/some/url2"
//     );
//     expect(results.at(2).find("CatalogLink").text()).to.equal("View details");
//     expect(results.at(2).find("CatalogLink").prop("bookUrl")).to.equal(
//       "/some/url3"
//     );
//   });

//   it("renders SVG icons for each search results", () => {
//     const resultsContainer = wrapper.find(".custom-list-search-results");
//     const audioSVGs = resultsContainer.find(AudioHeadphoneIcon);
//     const bookSVGs = resultsContainer.find(BookIcon);

//     expect(audioSVGs.length).to.equal(1);
//     expect(bookSVGs.length).to.equal(2);
//   });

//   it("doesn't render any SVG icon with bad medium value", () => {
//     searchResultsData = {
//       id: "id",
//       url: "url",
//       title: "title - search",
//       lanes: [],
//       navigationLinks: [],
//       books: [
//         {
//           id: "1",
//           title: "result 1",
//           authors: ["author 1"],
//           url: "/some/url1",
//           language: "eng",
//           raw: {
//             $: {
//               "schema:additionalType": { value: "http://schema.org/EBook" },
//             },
//           },
//         },
//         {
//           id: "2",
//           title: "result 2",
//           authors: ["author 2a", "author 2b"],
//           url: "/some/url2",
//           language: "eng",
//           raw: {
//             $: {
//               "schema:additionalType": {
//                 value: "http://bib.schema.org/Audiobook",
//               },
//             },
//           },
//         },
//         {
//           id: "3",
//           title: "result 3",
//           authors: ["author 3"],
//           url: "/some/url3",
//           language: "eng",
//           raw: {
//             $: {
//               "schema:additionalType": { value: "" },
//             },
//           },
//         },
//       ],
//     };
//     wrapper.setProps({
//       children: (
//         <CustomListSearchResults
//           draggingFrom={null}
//           entries={entriesData}
//           isFetchingMoreSearchResults={false}
//           opdsFeedUrl="opdsFeedUrl"
//           searchResults={searchResultsData}
//           addAll={addAll}
//           addEntry={addEntry}
//           loadMoreSearchResults={loadMoreSearchResults}
//           setDraggingFrom={setDraggingFrom}
//         />
//       ),
//     });
//     searchResultsData.books[2].raw["$"]["schema:additionalType"].value = "";
//     const resultsContainer = wrapper.find(".custom-list-search-results");
//     const audioSVGs = resultsContainer.find(AudioHeadphoneIcon);
//     const bookSVGs = resultsContainer.find(BookIcon);

//     expect(audioSVGs.length).to.equal(1);
//     expect(bookSVGs.length).to.equal(1);
//   });

//   it("doesn't include search results that are already in the list", () => {
//     const entriesData = [
//       {
//         id: "1",
//         title: "result 1",
//         authors: ["author 1"],
//         language: "eng",
//         raw: {
//           $: {
//             "schema:additionalType": {
//               value: "http://bib.schema.org/Audiobook",
//             },
//           },
//         },
//       },
//     ];

//     wrapper.setProps({
//       children: (
//         <CustomListSearchResults
//           draggingFrom={null}
//           entries={entriesData}
//           isFetchingMoreSearchResults={false}
//           opdsFeedUrl="opdsFeedUrl"
//           searchResults={searchResultsData}
//           addAll={addAll}
//           addEntry={addEntry}
//           loadMoreSearchResults={loadMoreSearchResults}
//           setDraggingFrom={setDraggingFrom}
//         />
//       ),
//     });

//     const resultsContainer = wrapper.find(".custom-list-search-results");
//     expect(resultsContainer.length).to.equal(1);

//     const droppable = resultsContainer.find(Droppable);
//     expect(droppable.length).to.equal(1);

//     const results = droppable.find(Draggable);
//     expect(results.length).to.equal(2);

//     expect(results.at(0).text()).to.contain("result 2");
//     expect(results.at(0).text()).to.contain("author 2a, author 2b");
//     expect(results.at(1).text()).to.contain("result 3");
//     expect(results.at(1).text()).to.contain("author 3");
//   });

//   it("hides add all button when there are no search results", () => {
//     wrapper.setProps({
//       children: (
//         <CustomListSearchResults
//           draggingFrom={null}
//           entries={entriesData}
//           isFetchingMoreSearchResults={false}
//           opdsFeedUrl="opdsFeedUrl"
//           addAll={addAll}
//           addEntry={addEntry}
//           loadMoreSearchResults={loadMoreSearchResults}
//           setDraggingFrom={setDraggingFrom}
//         />
//       ),
//     });
//     const button = wrapper.find(".add-all-button");
//     expect(button.length).to.equal(0);
//   });

//   it("hides load more button when there's no next link for search results", () => {
//     // search results with no next link
//     let button = wrapper.find(LoadButton);
//     expect(button.length).to.equal(0);

//     wrapper.setProps({
//       children: (
//         <CustomListSearchResults
//           draggingFrom={null}
//           entries={entriesData}
//           isFetchingMoreSearchResults={false}
//           opdsFeedUrl="opdsFeedUrl"
//           // search results with next link
//           searchResults={{ ...searchResultsData, nextPageUrl: "next" }}
//           addAll={addAll}
//           addEntry={addEntry}
//           loadMoreSearchResults={loadMoreSearchResults}
//           setDraggingFrom={setDraggingFrom}
//         />
//       ),
//     });
//     button = wrapper.find(LoadButton);
//     expect(button.length).to.equal(1);
//   });

//   it("disables load more button when loading more search results", () => {
//     wrapper.setProps({
//       children: (
//         <CustomListSearchResults
//           draggingFrom={null}
//           entries={entriesData}
//           isFetchingMoreSearchResults={false}
//           opdsFeedUrl="opdsFeedUrl"
//           // search results with next link
//           searchResults={{ ...searchResultsData, nextPageUrl: "next" }}
//           addAll={addAll}
//           addEntry={addEntry}
//           loadMoreSearchResults={loadMoreSearchResults}
//           setDraggingFrom={setDraggingFrom}
//         />
//       ),
//     });
//     let button = wrapper
//       .find(".custom-list-search-results .load-more-button")
//       .hostNodes();
//     expect(button.length).to.equal(1);
//     expect(button.prop("disabled")).not.to.be.true;

//     wrapper.setProps({
//       children: (
//         <CustomListSearchResults
//           draggingFrom={null}
//           entries={entriesData}
//           // set isFetchingMoreSearchResults to true
//           isFetchingMoreSearchResults={true}
//           opdsFeedUrl="opdsFeedUrl"
//           searchResults={{ ...searchResultsData, nextPageUrl: "next" }}
//           addAll={addAll}
//           addEntry={addEntry}
//           loadMoreSearchResults={loadMoreSearchResults}
//           setDraggingFrom={setDraggingFrom}
//         />
//       ),
//     });

//     button = wrapper
//       .find(".custom-list-search-results .load-more-button")
//       .hostNodes();
//     expect(button.length).to.equal(1);
//     expect(button.prop("disabled")).to.equal(true);
//   });

//   it("loads more search results", () => {
//     wrapper.setProps({
//       children: (
//         <CustomListSearchResults
//           draggingFrom={null}
//           entries={entriesData}
//           isFetchingMoreSearchResults={false}
//           opdsFeedUrl="opdsFeedUrl"
//           // search results with next link
//           searchResults={{ ...searchResultsData, nextPageUrl: "next" }}
//           addAll={addAll}
//           addEntry={addEntry}
//           loadMoreSearchResults={loadMoreSearchResults}
//           setDraggingFrom={setDraggingFrom}
//         />
//       ),
//     });

//     const button = wrapper
//       .find(".custom-list-search-results .load-more-button")
//       .at(0);
//     button.simulate("click");
//     expect(loadMoreSearchResults.callCount).to.equal(1);
//   });
// });
