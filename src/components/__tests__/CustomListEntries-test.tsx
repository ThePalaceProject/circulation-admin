// import { expect } from "chai";
// import { stub } from "sinon";
// import * as React from "react";
// import * as Enzyme from "enzyme";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { AudioHeadphoneIcon, BookIcon } from "@nypl/dgx-svg-icons";
// import * as PropTypes from "prop-types";
// import CustomListEntries from "../CustomListEntries";
// import CatalogLink from "opds-web-client/lib/components/CatalogLink";

// describe("CustomListEntries", () => {
//   let wrapper;

//   const listData = {
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
//       {
//         id: "B",
//         title: "entry B",
//         authors: ["author 2a", "author 2b"],
//         url: "/some/urlB",
//         raw: {
//           $: {
//             "schema:additionalType": { value: "http://schema.org/EBook" },
//           },
//         },
//       },
//     ],
//     navigationLinks: [],
//   };

//   const entriesNextPageUrl = "nextpage?after=50";

//   const deleteAll = stub();
//   const loadMoreEntries = stub();
//   const deleteEntry = stub();
//   const setLoadedMoreEntries = stub();
//   const onDragEnd = stub();

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
//         />
//       </DragDropContext>,
//       { context: fullContext, childContextTypes }
//     );
//   });

//   it("renders list entries", () => {
//     const entriesContainer = wrapper.find(".custom-list-entries");
//     expect(entriesContainer.length).to.equal(1);

//     const droppable = entriesContainer.find(Droppable);
//     expect(droppable.length).to.equal(1);

//     const entries = droppable.find(Draggable);
//     expect(entries.length).to.equal(2);

//     expect(entries.at(0).text()).to.contain("entry A");
//     expect(entries.at(0).text()).to.contain("author 1");
//     expect(entries.at(1).text()).to.contain("entry B");
//     expect(entries.at(1).text()).to.contain("author 2a, author 2b");

//     const display = wrapper.find(".custom-list-entries h4");
//     expect(display.text()).to.equal("Displaying 1 - 2 of 2 Books");
//   });

//   it("renders a link to view each entry", () => {
//     const entriesContainer = wrapper.find(".custom-list-entries");
//     expect(entriesContainer.length).to.equal(1);

//     const droppable = entriesContainer.find(Droppable);
//     expect(droppable.length).to.equal(1);

//     const entries = droppable.find(Draggable);
//     expect(entries.length).to.equal(2);

//     expect(entries.at(0).find(CatalogLink).text()).to.equal("View details");
//     expect(entries.at(0).find(CatalogLink).prop("bookUrl")).to.equal(
//       "/some/urlA"
//     );
//     expect(entries.at(1).find("CatalogLink").text()).to.equal("View details");
//     expect(entries.at(1).find("CatalogLink").prop("bookUrl")).to.equal(
//       "/some/urlB"
//     );
//   });

//   it("renders SVG icons for each entry", () => {
//     const entriesContainer = wrapper.find(".custom-list-entries");
//     const audioSVGs = entriesContainer.find(AudioHeadphoneIcon);
//     const bookSVGs = entriesContainer.find(BookIcon);

//     expect(audioSVGs.length).to.equal(1);
//     expect(bookSVGs.length).to.equal(1);
//   });

//   it("disables load more button when loading more entries for a list", () => {
//     let button = wrapper
//       .find(".custom-list-entries .load-more-button")
//       .hostNodes();
//     expect(button.length).to.equal(1);
//     expect(button.prop("disabled")).not.to.be.true;

//     wrapper.setProps({
//       children: (
//         <CustomListEntries
//           addedListEntries={[]}
//           deletedListEntries={[]}
//           entries={listData.books}
//           entryCount="2"
//           // set isFetchingMoreCustomListEntries to true
//           isFetchingMoreCustomListEntries={true}
//           nextPageUrl={entriesNextPageUrl}
//           opdsFeedUrl="opdsFeedUrl"
//           deleteAll={deleteAll}
//           deleteEntry={deleteEntry}
//           loadMoreEntries={loadMoreEntries}
//           setLoadedMoreEntries={setLoadedMoreEntries}
//         />
//       ),
//     });

//     button = wrapper.find(".custom-list-entries .load-more-button").hostNodes();
//     expect(button.length).to.equal(1);
//     expect(button.prop("disabled")).to.equal(true);
//   });

//   it("hides delete all button when there are no entries", () => {
//     wrapper.setProps({
//       children: (
//         <CustomListEntries
//           addedListEntries={[]}
//           deletedListEntries={[]}
//           entries={[]}
//           entryCount="0"
//           isFetchingMoreCustomListEntries={false}
//           nextPageUrl={entriesNextPageUrl}
//           opdsFeedUrl="opdsFeedUrl"
//           deleteAll={deleteAll}
//           deleteEntry={deleteEntry}
//           loadMoreEntries={loadMoreEntries}
//           setLoadedMoreEntries={setLoadedMoreEntries}
//         />
//       ),
//     });

//     const button = wrapper.find(".delete-all-button");
//     expect(button.length).to.equal(0);
//   });

//   it("loads more entries in a list", () => {
//     const button = wrapper.find(".custom-list-entries .load-more-button").at(0);
//     button.simulate("click");
//     expect(loadMoreEntries.callCount).to.equal(1);
//   });

//   it("hides load more button when there's no next link for a list's entries", () => {
//     wrapper.setProps({
//       children: (
//         <CustomListEntries
//           addedListEntries={[]}
//           deletedListEntries={[]}
//           entries={[]}
//           entryCount="0"
//           isFetchingMoreCustomListEntries={false}
//           opdsFeedUrl="opdsFeedUrl"
//           deleteAll={deleteAll}
//           deleteEntry={deleteEntry}
//           loadMoreEntries={loadMoreEntries}
//           setLoadedMoreEntries={setLoadedMoreEntries}
//         />
//       ),
//     });
//     // no entries at all
//     let button = wrapper.find(".custom-list-entries .load-more-button");
//     expect(button.length).to.equal(0);

//     // entries with no next link
//     wrapper.setProps({
//       children: (
//         <CustomListEntries
//           addedListEntries={[]}
//           deletedListEntries={[]}
//           entries={listData.books}
//           entryCount="2"
//           isFetchingMoreCustomListEntries={false}
//           opdsFeedUrl="opdsFeedUrl"
//           deleteAll={deleteAll}
//           deleteEntry={deleteEntry}
//           loadMoreEntries={loadMoreEntries}
//           setLoadedMoreEntries={setLoadedMoreEntries}
//         />
//       ),
//     });
//     button = wrapper.find(".custom-list-entries .load-more-button");
//     expect(button.length).to.equal(0);
//   });
// });
