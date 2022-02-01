/**
 * The following are example tests meant to check that testUtils.jsx is working as expected.
 * */

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../../testUtils/testUtils";
import { stub } from "sinon";
import CustomListEntries from "../CustomListEntries";
import { DragDropContext } from "react-beautiful-dnd";

const listData = {
  id: "1",
  url: "some url",
  title: "original list title",
  lanes: [],
  books: [
    {
      id: "A",
      title: "entry A",
      authors: ["author 1"],
      url: "/some/urlA",
      raw: {
        $: {
          "schema:additionalType": {
            value: "http://bib.schema.org/Audiobook",
          },
        },
      },
    },
    {
      id: "B",
      title: "entry B",
      authors: ["author 2a", "author 2b"],
      url: "/some/urlB",
      raw: {
        $: {
          "schema:additionalType": { value: "http://schema.org/EBook" },
        },
      },
    },
  ],
  navigationLinks: [],
};

const library = { short_name: "OWL" };

const searchResults = {
  id: "id",
  url: "url",
  title: "title",
  lanes: [],
  books: [],
  navigationLinks: [],
};

const saveFormData = stub();
const loadMoreEntries = stub();
const onDragEnd = stub();

test.only("renders header", () => {
  render(
    <DragDropContext onDragEnd={onDragEnd}>
      <CustomListEntries
        entries={listData.books}
        totalListEntries={2}
        isFetchingMoreCustomListEntries={false}
        listId={listData.id}
        nextPageUrl="nextpage?after=50"
        opdsFeedUrl="opdsFeedUrl"
        searchResults={searchResults}
        showSaveError={false}
        saveFormData={saveFormData}
        loadMoreEntries={loadMoreEntries}
      />
    </DragDropContext>
  );

  waitFor(() => screen.getByText(/displaying/i));
});
