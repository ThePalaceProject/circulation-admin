import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import * as Enzyme from "enzyme";
import CustomListBookCard from "../CustomListBookCard";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import * as PropTypes from "prop-types";
import { BookData } from "opds-web-client/lib/interfaces";
import { Button } from "library-simplified-reusable-components";

export interface Entry extends BookData {
  medium?: string;
}

describe("CustomListBookCard", () => {
  let wrapper;

  const entry: Entry = {
    id: "A",
    title: "entry A",
    authors: ["author 1"],
    raw: {
      $: {
        "schema:additionalType": { value: "http://schema.org/EBook" },
      },
    },
  };

  const searchResult: Entry = {
    id: "1",
    title: "result 1",
    authors: ["author 1"],
    url: "/some/url1",
    language: "eng",
    raw: {
      $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
    },
  };

  const childContextTypes = {
    pathFor: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
  };
  const fullContext = {
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
  };

  const handleDeleteEntry = stub();
  const handleAddEntry = stub();

  beforeEach(() => {
    wrapper = Enzyme.mount(
      <DragDropContext>
        <CustomListBookCard
          typeOfCard="entry"
          book={entry}
          opdsFeedUrl="opdsFeedUrl"
          handleDeleteEntry={handleDeleteEntry}
        />
      </DragDropContext>,
      { context: fullContext, childContextTypes }
    );
  });

  it("renders a single entry", () => {
    const result = wrapper.find(Draggable);
    expect(result.length).to.equal(1);
    expect(result.at(0).text()).to.contain("entry A");
    expect(result.at(0).text()).to.contain("author 1e");
    const button = result.find(Button);
    expect(button.text()).to.contain("Remove from list");
  });

  it("renders a single search result", () => {
    wrapper.setProps({
      children: (
        <CustomListBookCard
          typeOfCard="searchResult"
          book={searchResult}
          opdsFeedUrl="opdsFeedUrl"
          handleDeleteEntry={handleAddEntry}
        />
      ),
    });
    const result = wrapper.find(Draggable);
    expect(result.length).to.equal(1);
    expect(result.at(0).text()).to.contain("result 1");
    expect(result.at(0).text()).to.contain("author 1");
    const button = result.find(Button);
    expect(button.text()).to.contain("Add to list");
  });
});
