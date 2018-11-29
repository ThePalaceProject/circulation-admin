import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { Lanes } from "../Lanes";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import LaneEditor from "../LaneEditor";
import { Link } from "react-router";
import EditableInput from "../EditableInput";
import { LaneData } from "../../interfaces";

describe("Lanes", () => {
  let wrapper;
  let fetchLanes;
  let fetchCustomLists;
  let editLane;
  let deleteLane;
  let showLane;
  let hideLane;
  let resetLanes;

  let customListsData = [
    { id: 1, name: "list 1", entries: [] },
    { id: 2, name: "list 2", entries: [{ pwid: "1", title: "title", authors: [] }] }
  ];

  let subsublaneData: LaneData = {
    id: 3, display_name: "sublane 3", visible: false, count: 2, sublanes: [],
    custom_list_ids: [2], inherit_parent_restrictions: false
  };
  let sublaneData: LaneData = {
    id: 2, display_name: "sublane 2", visible: false, count: 3, sublanes: [subsublaneData],
    custom_list_ids: [2], inherit_parent_restrictions: false
  };
  let lanesData: LaneData[] = [
    { id: 1, display_name: "lane 1", visible: true, count: 5,
      sublanes: [sublaneData], custom_list_ids: [1], inherit_parent_restrictions: true },
    { id: 4, display_name: "lane 4", visible: true, count: 1, sublanes: [],
      custom_list_ids: [], inherit_parent_restrictions: false }
  ];

  beforeEach(() => {
    fetchLanes = stub();
    fetchCustomLists = stub();
    editLane = stub().returns(new Promise<void>(resolve => resolve()));
    deleteLane = stub().returns(new Promise<void>(resolve => resolve()));
    showLane = stub().returns(new Promise<void>(resolve => resolve()));
    hideLane = stub().returns(new Promise<void>(resolve => resolve()));
    resetLanes = stub().returns(new Promise<void>(resolve => resolve()));

    wrapper = shallow(
      <Lanes
        csrfToken="token"
        library="library"
        lanes={lanesData}
        customLists={customListsData}
        isFetching={false}
        fetchLanes={fetchLanes}
        fetchCustomLists={fetchCustomLists}
        editLane={editLane}
        deleteLane={deleteLane}
        showLane={showLane}
        hideLane={hideLane}
        resetLanes={resetLanes}
        />
    );
  });

  it("renders error message from a bad form submission", () => {
    let error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);

    wrapper.setProps({ formError: { status: 500, response: "Error", url: "url" } });
    error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(1);
  });

  it("renders error message from loading error", () => {
    let error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);

    wrapper.setProps({ fetchError: { status: 500, response: "Error", url: "url" } });
    error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(1);
  });

  it("renders loading message", () => {
    let loading = wrapper.find(LoadingIndicator);
    expect(loading.length).to.equal(0);

    wrapper.setProps({ isFetching: true });
    loading = wrapper.find(LoadingIndicator);
    expect(loading.length).to.equal(1);
  });

  it("renders create top-level lane link", () => {
    let create = wrapper.find(".lanes-sidebar > .create-lane");
    expect(create.length).to.equal(1);
    expect(create.props().to).to.equal("/admin/web/lanes/library/create");
  });

  it("renders reset link", () => {
    let reset = wrapper.find(".lanes-sidebar > .reset-lanes");
    expect(reset.length).to.equal(1);
    expect(reset.props().to).to.equal("/admin/web/lanes/library/reset");
  });

  it("renders and expands and collapses lanes and sublanes", () => {
    const expectExpanded = (lane) => {
      let collapse = lane.find("> div > span > .collapse-button");
      expect(collapse.length).to.equal(1);
      let expand = lane.find("> div > span > .expand-button");
      expect(expand.length).to.equal(0);
      return collapse;
    };

    const expectCollapsed = (lane) => {
      let collapse = lane.find("> div > span > .collapse-button");
      expect(collapse.length).to.equal(0);
      let expand = lane.find("> div > span > .expand-button");
      expect(expand.length).to.equal(1);
      return expand;
    };

    let topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    expect(topLevelLanes.length).to.equal(2);
    let lane1 = topLevelLanes.at(0);
    let lane4 = topLevelLanes.at(1);
    expect(lane1.text()).to.contain("lane 1");
    expect(lane1.text()).to.contain("(5)");
    expect(lane4.text()).to.contain("lane 4");
    expect(lane4.text()).to.contain("(1)");

    // both top-level lanes are expanded to start.
    expectExpanded(lane1);
    expectExpanded(lane4);

    // lane 1 has one sublane which is collapsed
    let sublane2 = lane1.find("> ul > li");
    expect(sublane2.text()).to.contain("sublane 2");
    expect(sublane2.text()).to.contain("(3)");
    expect(sublane2.length).to.equal(1);
    let sublane2Expand = expectCollapsed(sublane2);

    // lane 4 has no sublanes
    let lane4Sublanes = lane4.find("> ul > li");
    expect(lane4Sublanes.length).to.equal(0);

    // sublane 2 has a sublane, but it's not shown since sublane 2 is collapsed.
    let sublane3 = sublane2.find("> ul > li");
    expect(sublane3.length).to.equal(0);

    // if we expand sublane 2, we can see sublane 3 below it.
    sublane2Expand.simulate("click");
    topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    lane1 = topLevelLanes.at(0);
    sublane2 = lane1.find("> ul > li");
    let sublane2Collapse = expectExpanded(sublane2);
    sublane3 = sublane2.find("> ul > li");
    expect(sublane3.length).to.equal(1);
    expect(sublane3.text()).to.contain("sublane 3");
    expect(sublane3.text()).to.contain("(2)");
    expectCollapsed(sublane3);

    // if we collapse sublane 2, sublane 3 is hidden again.
    sublane2Collapse.simulate("click");
    topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    lane1 = topLevelLanes.at(0);
    sublane2 = lane1.find("> ul > li");
    expectCollapsed(sublane2);
    sublane3 = sublane2.find("> ul > li");
    expect(sublane3.length).to.equal(0);

    // if we collapse lane 1, sublane 2 is hidden.
    let lane1Collapse = expectExpanded(lane1);
    lane1Collapse.simulate("click");
    topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    lane1 = topLevelLanes.at(0);
    let lane1Expand = expectCollapsed(lane1);
    sublane2 = lane1.find("> ul > li");
    expect(sublane2.length).to.equal(0);

    // if we expand lane 1, sublane 2 is shown again.
    lane1Expand.simulate("click");
    topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    lane1 = topLevelLanes.at(0);
    expectExpanded(lane1);
    sublane2 = lane1.find("> ul > li");
    expect(sublane2.length).to.equal(1);
  });

  it("renders active lane", () => {
    let topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    let lane1 = topLevelLanes.at(0);
    let lane4 = topLevelLanes.at(1);
    let sublane2 = lane1.find("> ul > li");
    expect(lane1.props().className).not.to.contain("active");
    expect(lane4.props().className).not.to.contain("active");
    expect(sublane2.props().className).not.to.contain("active");

    wrapper.setProps({ identifier: "1" });
    topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    lane1 = topLevelLanes.at(0);
    lane4 = topLevelLanes.at(1);
    sublane2 = lane1.find("> ul > li");
    expect(lane1.props().className).to.contain("active");
    expect(lane4.props().className).not.to.contain("active");
    expect(sublane2.props().className).not.to.contain("active");

    wrapper.setProps({ identifier: "2" });
    topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    lane1 = topLevelLanes.at(0);
    lane4 = topLevelLanes.at(1);
    sublane2 = lane1.find("> ul > li");
    expect(lane1.props().className).not.to.contain("active");
    expect(lane4.props().className).not.to.contain("active");
    expect(sublane2.props().className).to.contain("active");
  });

  it("renders create sublane link", () => {
    let topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    let lane1 = topLevelLanes.at(0);
    let lane1CreateSublane = lane1.find("> .lane-buttons .create-lane");
    expect(lane1CreateSublane.length).to.equal(1);
    expect(lane1CreateSublane.props().to).to.equal("/admin/web/lanes/library/create/1");
    let lane4 = topLevelLanes.at(1);
    let lane4CreateSublane = lane4.find("> .lane-buttons .create-lane");
    expect(lane4CreateSublane.length).to.equal(1);
    expect(lane4CreateSublane.props().to).to.equal("/admin/web/lanes/library/create/4");

    // sublane 2 is collapsed so its create sublane button isn't shown
    let sublane2 = lane1.find("> ul > li");
    let sublane2CreateSublane = sublane2.find("> .lane-buttons .create-lane");
    expect(sublane2CreateSublane.length).to.equal(0);
    let sublane2Expand = sublane2.find("> div > span > .expand-button");
    sublane2Expand.simulate("click");

    topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    lane1 = topLevelLanes.at(0);
    sublane2 = lane1.find("> ul > li");
    sublane2CreateSublane = sublane2.find("> .lane-buttons .create-lane");
    expect(sublane2CreateSublane.length).to.equal(1);
    expect(sublane2CreateSublane.props().to).to.equal("/admin/web/lanes/library/create/2");
  });

  it("renders edit link", () => {
    let topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    let lane1 = topLevelLanes.at(0);
    let lane1Edit = lane1.find("> .lane-buttons .edit-lane");
    expect(lane1Edit.length).to.equal(1);
    expect(lane1Edit.props().to).to.equal("/admin/web/lanes/library/edit/1");

    // lane 4 wasn't created from lists, so it's not editable
    let lane4 = topLevelLanes.at(1);
    let lane4Edit = lane4.find("> .lane-buttons .edit-lane");
    expect(lane4Edit.length).to.equal(0);

    // sublane 2 is collapsed so its edit button isn't shown
    let sublane2 = lane1.find("> ul > li");
    let sublane2Edit = sublane2.find("> .lane-buttons .edit-lane");
    expect(sublane2Edit.length).to.equal(0);
    let sublane2Expand = sublane2.find("> div > span > .expand-button");
    sublane2Expand.simulate("click");

    topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    lane1 = topLevelLanes.at(0);
    sublane2 = lane1.find("> ul > li");
    sublane2Edit = sublane2.find("> .lane-buttons .edit-lane");
    expect(sublane2Edit.length).to.equal(1);
    expect(sublane2Edit.props().to).to.equal("/admin/web/lanes/library/edit/2");
  });

  it("shows a lane", () => {
    let topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    let lane1 = topLevelLanes.at(0);

    // lane 1 is already visible, so it has no show link
    let lane1Show = lane1.find("> div > .show-lane");
    expect(lane1Show.length).to.equal(0);

    let sublane2 = lane1.find("> ul > li");
    expect(sublane2.text()).to.contain("Hidden");
    let sublane2Show = sublane2.find("> div > .show-lane");
    expect(sublane2Show.length).to.equal(1);

    sublane2Show.simulate("click");
    expect(showLane.callCount).to.equal(1);
    expect(showLane.args[0][0]).to.equal("2");

    let sublane2Expand = sublane2.find("> div > span > .expand-button");
    sublane2Expand.simulate("click");

    topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    lane1 = topLevelLanes.at(0);
    sublane2 = lane1.find("> ul > li");
    let sublane3 = sublane2.find("> ul > li");

    // sublane 3 has a hidden parent, so it can't be shown.
    expect(sublane3.text()).to.contain("Hidden");
    let sublane3Show = sublane3.find("> div > .show-lane");
    expect(sublane3Show.length).to.equal(0);
  });

  it("hides a lane", () => {
    let topLevelLanes = wrapper.find(".lanes-sidebar > ul > li");
    let lane1 = topLevelLanes.at(0);
    expect(lane1.text()).to.contain("Visible");
    let lane1Hide = lane1.find("> div > .hide-lane");
    expect(lane1Hide.length).to.equal(1);

    let sublane2 = lane1.find("> ul > li");
    expect(sublane2.text()).to.contain("Hidden");
    let sublane2Hide = sublane2.find("> div > .hide-lane");
    expect(sublane2Hide.length).to.equal(0);

    lane1Hide.simulate("click");
    expect(hideLane.callCount).to.equal(1);
    expect(hideLane.args[0][0]).to.equal("1");
  });

  it("edits a lane", () => {
    const testData = new (window as any).FormData();
    (wrapper.instance() as Lanes).editLane(testData);
    expect(editLane.callCount).to.equal(1);
    expect(editLane.args[0][0]).to.equal(testData);
    expect(fetchLanes.callCount).to.equal(1);
  });

  it("deletes a lane", () => {
    let confirmStub = stub(window, "confirm").returns(false);

    (wrapper.instance() as Lanes).deleteLane(sublaneData);
    expect(deleteLane.callCount).to.equal(0);

    confirmStub.returns(true);
    (wrapper.instance() as Lanes).deleteLane(sublaneData);
    expect(deleteLane.callCount).to.equal(1);
    expect(deleteLane.args[0][0]).to.equal("2");
    expect(fetchLanes.callCount).to.equal(1);

    confirmStub.restore();
  });

  it("renders create form", () => {
    let editor = wrapper.find(LaneEditor);
    expect(editor.length).to.equal(0);

    wrapper.setProps({ editOrCreate: "create" });
    editor = wrapper.find(LaneEditor);
    expect(editor.length).to.equal(1);
    expect(editor.props().library).to.equal("library");
    expect(editor.props().parent).to.equal(null);
    expect(editor.props().customLists).to.equal(customListsData);
    expect(editor.props().editLane).to.be.ok;

    wrapper.setProps({ identifier: "2" });
    editor = wrapper.find(LaneEditor);
    expect(editor.length).to.equal(1);
    expect(editor.props().library).to.equal("library");
    expect(editor.props().parent).to.equal(sublaneData);
    expect(editor.props().customLists).to.equal(customListsData);
    expect(editor.props().editLane).to.be.ok;
  });

  it("renders edit form", () => {
    let editor = wrapper.find(LaneEditor);
    expect(editor.length).to.equal(0);

    wrapper.setProps({ editOrCreate: "edit", identifier: "2" });
    editor = wrapper.find(LaneEditor);
    expect(editor.length).to.equal(1);
    expect(editor.props().library).to.equal("library");
    expect(editor.props().lane).to.equal(sublaneData);
    expect(editor.props().parent).to.equal(lanesData[0]);
    expect(editor.props().customLists).to.equal(customListsData);
    expect(editor.props().editLane).to.be.ok;
    expect(editor.props().deleteLane).to.be.ok;
    expect(editor.props().hideLane).to.be.ok;
    expect(editor.props().showLane).to.be.ok;
  });

  it("renders reset form", () => {
    let resetForm = wrapper.find(".reset");
    expect(resetForm.length).to.equal(0);

    wrapper.setProps({ editOrCreate: "reset" });
    resetForm = wrapper.find(".reset");
    expect(resetForm.length).to.equal(1);
    expect(resetForm.text()).to.contain("cannot be undone");
  });

  it("resets lanes", () => {
    wrapper = mount(
      <Lanes
        csrfToken="token"
        library="library"
        editOrCreate="reset"
        lanes={lanesData}
        customLists={customListsData}
        isFetching={false}
        fetchLanes={fetchLanes}
        fetchCustomLists={fetchCustomLists}
        editLane={editLane}
        deleteLane={deleteLane}
        showLane={showLane}
        hideLane={hideLane}
        resetLanes={resetLanes}
        />
    );

    // mock typing in the 'RESET' confirmation input box
    let editableInputStub = stub(EditableInput.prototype, "getValue").returns("DO NOT RESET");

    let resetButton = wrapper.find(".reset-button");
    resetButton.simulate("click");
    expect(resetLanes.callCount).to.equal(0);

    editableInputStub.returns("RESET");
    resetButton.simulate("click");
    expect(resetLanes.callCount).to.equal(1);
    expect(fetchLanes.callCount).to.equal(2);

    editableInputStub.restore();
  });
});
