import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import AdvancedSearchBuilder from "../AdvancedSearchBuilder";
import AdvancedSearchFilterInput from "../AdvancedSearchFilterInput";
import AdvancedSearchFilterViewer from "../AdvancedSearchFilterViewer";

describe("AdvancedSearchBuilder", () => {
  let wrapper;
  let addQuery;
  let updateQueryBoolean;
  let moveQuery;
  let removeQuery;
  let selectQuery;
  let query;

  beforeEach(() => {
    addQuery = stub();
    updateQueryBoolean = stub();
    moveQuery = stub();
    removeQuery = stub();
    selectQuery = stub();

    query = {
      id: "0",
      key: "genre",
      value: "Horror",
    };

    wrapper = mount(
      <AdvancedSearchBuilder
        isOwner={true}
        name="include"
        query={query}
        selectedQueryId="0"
        addQuery={addQuery}
        updateQueryBoolean={updateQueryBoolean}
        moveQuery={moveQuery}
        removeQuery={removeQuery}
        selectQuery={selectQuery}
      />
    );
  });

  it("should render an AdvancedSearchFilterInput and an AdvancedSearchFilterViewer", () => {
    const filterInput = wrapper.find(AdvancedSearchFilterInput);

    expect(filterInput).to.have.length(1);
    expect(filterInput.prop("name")).to.equal("include");

    const filterViewer = wrapper.find(AdvancedSearchFilterViewer);

    expect(filterViewer).to.have.length(1);
    expect(filterViewer.prop("query")).to.equal(query);
    expect(filterViewer.prop("selectedQueryId")).to.equal("0");
  });

  it("should not render an AdvancedSearchFilterInput when isOwner is false", () => {
    wrapper.setProps({
      isOwner: false,
    });

    const filterInput = wrapper.find(AdvancedSearchFilterInput);

    expect(filterInput).to.have.length(0);
  });

  it("should set readOnly to true on the AdvancedSearchFilterViewer when isOwner is false", () => {
    wrapper.setProps({
      isOwner: false,
    });

    expect(wrapper.find(AdvancedSearchFilterViewer).prop("readOnly")).to.equal(
      true
    );
  });

  it("should call addQuery with the correct name when a query is added in the AdvancedSearchFilterInput", () => {
    const filterInput = wrapper.find(AdvancedSearchFilterInput);
    const onAdd = filterInput.prop("onAdd");

    const newQuery = {
      key: "title",
      value: "The Shining",
    };

    const clearFilter = false;

    onAdd(newQuery, clearFilter);

    expect(addQuery.callCount).to.equal(1);
    expect(addQuery.args[0]).to.deep.equal(["include", newQuery, clearFilter]);
  });

  it("should call updateQueryBoolean with the correct name when a boolean query operator is changed in the AdvancedSearchFilterViewer", () => {
    const filterViewer = wrapper.find(AdvancedSearchFilterViewer);
    const onBooleanChange = filterViewer.prop("onBooleanChange");

    onBooleanChange("2", "or");

    expect(updateQueryBoolean.callCount).to.equal(1);
    expect(updateQueryBoolean.args[0]).to.deep.equal(["include", "2", "or"]);
  });

  it("should call moveQuery with the correct name when a query is moved in the AdvancedSearchFilterViewer", () => {
    const filterViewer = wrapper.find(AdvancedSearchFilterViewer);
    const onMove = filterViewer.prop("onMove");

    onMove("2", "33");

    expect(moveQuery.callCount).to.equal(1);
    expect(moveQuery.args[0]).to.deep.equal(["include", "2", "33"]);
  });

  it("should call removeQuery with the correct name when a query is removed in the AdvancedSearchFilterViewer", () => {
    const filterViewer = wrapper.find(AdvancedSearchFilterViewer);
    const onRemove = filterViewer.prop("onRemove");

    onRemove("2");

    expect(removeQuery.callCount).to.equal(1);
    expect(removeQuery.args[0]).to.deep.equal(["include", "2"]);
  });

  it("should call selectQuery with the correct name when a query is selected in the AdvancedSearchFilterViewer", () => {
    const filterViewer = wrapper.find(AdvancedSearchFilterViewer);
    const onSelect = filterViewer.prop("onSelect");

    onSelect("2");

    expect(selectQuery.callCount).to.equal(1);
    expect(selectQuery.args[0]).to.deep.equal(["include", "2"]);
  });
});
