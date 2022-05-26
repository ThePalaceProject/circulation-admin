import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchFilter from "../AdvancedSearchFilter";
import AdvancedSearchFilterViewer from "../AdvancedSearchFilterViewer";

describe("AdvancedSearchFilterViewer", () => {
  let wrapper;
  let onBooleanChange;
  let onMove;
  let onSelect;
  let onRemove;
  let query;

  beforeEach(() => {
    onBooleanChange = stub();
    onMove = stub();
    onSelect = stub();
    onRemove = stub();

    query = {
      id: "0",
      key: "genre",
      value: "Horror",
    };

    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchFilterViewer
          query={query}
          selectedQueryId="0"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );
  });

  it("should render an AdvancedSearchFilter", () => {
    const filter = wrapper.find(AdvancedSearchFilter);

    expect(filter.length).to.equal(1);

    expect(filter.prop("query")).to.equal(query);
    expect(filter.prop("selectedQueryId")).to.equal("0");
    expect(filter.prop("onBooleanChange")).to.equal(onBooleanChange);
    expect(filter.prop("onMove")).to.equal(onMove);
    expect(filter.prop("onSelect")).to.equal(onSelect);
    expect(filter.prop("onRemove")).to.equal(onRemove);
  });
});
