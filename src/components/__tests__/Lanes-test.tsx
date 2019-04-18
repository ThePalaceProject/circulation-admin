import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { Lanes } from "../Lanes";
import { Link } from "react-router";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import LaneEditor from "../LaneEditor";
import EditableInput from "../EditableInput";
import { Button } from "library-simplified-reusable-components";
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
  let changeLaneOrder;

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

  const mountWrapper = () => {
    wrapper = mount(
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
        changeLaneOrder={changeLaneOrder}
        />
    );
  };

  const getTopLevelLanes = () => {
    let sidebar = wrapper.find(".lanes-sidebar");
    let topLevelLanes = sidebar.children(DragDropContext).children(Draggable).children("div");
    return topLevelLanes;
  };

  const getDroppableById = (id) => {
    return wrapper.find(Droppable).filterWhere(node => node.props().droppableId === id);
  };

  beforeEach(() => {
    fetchLanes = stub();
    fetchCustomLists = stub();
    editLane = stub().returns(new Promise<void>(resolve => resolve()));
    deleteLane = stub().returns(new Promise<void>(resolve => resolve()));
    showLane = stub().returns(new Promise<void>(resolve => resolve()));
    hideLane = stub().returns(new Promise<void>(resolve => resolve()));
    resetLanes = stub().returns(new Promise<void>(resolve => resolve()));
    changeLaneOrder = stub().returns(new Promise<void>(resolve => resolve()));

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
        changeLaneOrder={changeLaneOrder}
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
    let create = wrapper.find(".lanes-sidebar > div > .create-lane");
    expect(create.length).to.equal(1);
    expect(create.prop("to")).to.equal("/admin/web/lanes/library/create");

    // the link is disabled if there are lane order changes
    wrapper.setState({ orderChanged: true });
    create = wrapper.find(".lanes-sidebar > div > .create-lane");
    expect(create.length).to.equal(1);
    expect(create.prop("to")).to.be.null;
    expect(create.hasClass("disabled")).to.be.true;
  });

  it("renders reset link", () => {
    let reset = wrapper.find(".lanes-sidebar .reset-lanes");
    expect(reset.length).to.equal(1);
    expect(reset.prop("to")).to.equal("/admin/web/lanes/library/reset");

    // the link is disabled if there are lane order changes
    wrapper.setState({ orderChanged: true });
    reset = wrapper.find(".lanes-sidebar > div > .reset-lanes");
    expect(reset.length).to.equal(1);
    expect(reset.prop("to")).to.be.null;
    expect(reset.hasClass("disabled")).to.be.true;
  });

  it("renders and expands and collapses lanes and sublanes", () => {
    mountWrapper();

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

    let topLevelLanes = getTopLevelLanes();
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
    let sublane2 = lane1.find("> ul > li > div");
    expect(sublane2.text()).to.contain("sublane 2");
    expect(sublane2.text()).to.contain("(3)");
    expect(sublane2.length).to.equal(1);
    let sublane2Expand = expectCollapsed(sublane2);

    // lane 4 has no sublanes
    let lane4Sublanes = lane4.find("> ul > li > div");
    let lane4Draggables = lane4.children(Droppable).children(Draggable).children("div");
    expect(lane4Sublanes.length).to.equal(0);
    expect(lane4Draggables.length).to.equal(0);

    // sublane 2 has a sublane, but it's not shown since sublane 2 is collapsed.
    let sublane3 = sublane2.find("> ul > li > div");
    expect(sublane3.length).to.equal(0);

    // if we expand sublane 2, we can see sublane 3 below it.
    sublane2Expand.simulate("click");
    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    sublane2 = lane1.find("> ul > li > div");
    let sublane2Collapse = expectExpanded(sublane2);
    sublane3 = sublane2.find("> ul > li > div");
    expect(sublane3.length).to.equal(1);
    expect(sublane3.text()).to.contain("sublane 3");
    expect(sublane3.text()).to.contain("(2)");
    expectCollapsed(sublane3);

    // if we collapse sublane 2, sublane 3 is hidden again.
    sublane2Collapse.simulate("click");
    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    sublane2 = lane1.find("> ul > li > div");
    expectCollapsed(sublane2);
    sublane3 = sublane2.find("> ul > li > div");
    expect(sublane3.length).to.equal(0);

    // if we collapse lane 1, sublane 2 is hidden.
    let lane1Collapse = expectExpanded(lane1);
    lane1Collapse.simulate("click");
    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    let lane1Expand = expectCollapsed(lane1);
    sublane2 = lane1.find("> ul > li > div");
    expect(sublane2.length).to.equal(0);

    // if we expand lane 1, sublane 2 is shown again.
    lane1Expand.simulate("click");
    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    expectExpanded(lane1);
    sublane2 = lane1.find("> ul > li > div");
    expect(sublane2.length).to.equal(1);
  });

  it("renders active lane", () => {
    mountWrapper();
    let topLevelLanes = getTopLevelLanes();
    let lane1 = topLevelLanes.at(0);
    let lane4 = topLevelLanes.at(1);
    let sublane2 = lane1.find("> ul > li > div");
    expect(lane1.props().className).not.to.contain("active");
    expect(lane4.props().className).not.to.contain("active");
    expect(sublane2.props().className).not.to.contain("active");

    wrapper.setProps({ identifier: "1" });
    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    lane4 = topLevelLanes.at(1);
    sublane2 = lane1.find("> ul > li > div");
    expect(lane1.props().className).to.contain("active");
    expect(lane4.props().className).not.to.contain("active");
    expect(sublane2.props().className).not.to.contain("active");

    wrapper.setProps({ identifier: "2" });
    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    lane4 = topLevelLanes.at(1);
    sublane2 = lane1.find("> ul > li > div");
    expect(lane1.props().className).not.to.contain("active");
    expect(lane4.props().className).not.to.contain("active");
    expect(sublane2.props().className).to.contain("active");
  });

  it("renders create sublane link", () => {
    mountWrapper();
    let topLevelLanes = getTopLevelLanes();
    let lane1 = topLevelLanes.at(0);
    let lane1CreateSublane = lane1.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("create-lane"));
    expect(lane1CreateSublane.length).to.equal(1);
    expect(lane1CreateSublane.prop("to")).to.equal("/admin/web/lanes/library/create/1");
    let lane4 = topLevelLanes.at(1);
    let lane4CreateSublane = lane4.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("create-lane"));
    expect(lane4CreateSublane.length).to.equal(1);
    expect(lane4CreateSublane.prop("to")).to.equal("/admin/web/lanes/library/create/4");

    // sublane 2 is collapsed so its create sublane button isn't shown
    let sublane2 = lane1.find("> ul > li > div");
    let sublane2CreateSublane = sublane2.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("create-lane"));
    expect(sublane2CreateSublane.length).to.equal(0);
    let sublane2Expand = sublane2.find("> div > span > .expand-button");
    sublane2Expand.simulate("click");

    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    sublane2 = lane1.find("> ul > li > div");
    sublane2CreateSublane = sublane2.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("create-lane"));
    expect(sublane2CreateSublane.length).to.equal(1);
    expect(sublane2CreateSublane.prop("to")).to.equal("/admin/web/lanes/library/create/2");

    // the links are disabled if there are lane order changes.
    wrapper.setState({ orderChanged: true });

    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    lane1CreateSublane = lane1.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("create-lane"));
    expect(lane1CreateSublane.length).to.equal(1);
    expect(lane1CreateSublane.prop("to")).to.be.null;
    expect(lane1CreateSublane.hasClass("disabled")).to.be.true;

    lane4 = topLevelLanes.at(1);
    lane4CreateSublane = lane4.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("create-lane"));
    expect(lane4CreateSublane.length).to.equal(1);
    expect(lane4CreateSublane.prop("to")).to.be.null;
    expect(lane4CreateSublane.hasClass("disabled")).to.be.true;

    sublane2 = lane1.find("> ul > li > div");
    sublane2CreateSublane = sublane2.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("create-lane"));
    expect(sublane2CreateSublane.length).to.equal(1);
    expect(sublane2CreateSublane.prop("to")).to.be.null;
    expect(sublane2CreateSublane.hasClass("disabled")).to.be.true;
  });

  it("renders edit link", () => {
    mountWrapper();
    let topLevelLanes = getTopLevelLanes();
    let lane1 = topLevelLanes.at(0);
    let lane1Edit = lane1.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("edit-lane"));
    expect(lane1Edit.length).to.equal(1);
    expect(lane1Edit.prop("to")).to.equal("/admin/web/lanes/library/edit/1");

    // lane 4 wasn't created from lists, so it's not editable
    let lane4 = topLevelLanes.at(1);
    let lane4Edit = lane4.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("edit-lane"));
    expect(lane4Edit.length).to.equal(0);

    // sublane 2 is collapsed so its edit button isn't shown
    let sublane2 = lane1.find("> ul > li > div");
    let sublane2Edit = sublane2.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("edit-lane"));
    expect(sublane2Edit.length).to.equal(0);
    let sublane2Expand = sublane2.find("> div > span > .expand-button");
    sublane2Expand.simulate("click");

    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    sublane2 = lane1.find("> ul > li > div");
    sublane2Edit = sublane2.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("edit-lane"));
    expect(sublane2Edit.length).to.equal(1);
    expect(sublane2Edit.prop("to")).to.equal("/admin/web/lanes/library/edit/2");

    // the links are disabled if there are lane order changes.
    wrapper.setState({ orderChanged: true });

    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    lane1Edit = lane1.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("edit-lane"));
    expect(lane1Edit.length).to.equal(1);
    expect(lane1Edit.prop("to")).to.be.null;
    expect(lane1Edit.hasClass("disabled")).to.be.true;

    sublane2 = lane1.find("> ul > li > div");
    sublane2Edit = sublane2.children(".lane-buttons").children(Link).filterWhere(node => node.props().className.includes("edit-lane"));
    expect(sublane2Edit.length).to.equal(1);
    expect(sublane2Edit.prop("to")).to.be.null;
    expect(sublane2Edit.hasClass("disabled")).to.be.true;
  });

  it("shows a lane", () => {
    mountWrapper();
    let topLevelLanes = getTopLevelLanes();
    let lane1 = topLevelLanes.at(0);

    // lane 1 is already visible, so it has no show link
    let lane1Show = lane1.find("> div > .show-lane");
    expect(lane1Show.length).to.equal(0);

    let sublane2 = lane1.find("> ul > li > div");
    expect(sublane2.text()).to.contain("Hidden");
    let sublane2Show = sublane2.find("> div > .show-lane");
    expect(sublane2Show.length).to.equal(1);

    sublane2Show.simulate("click");
    expect(showLane.callCount).to.equal(1);
    expect(showLane.args[0][0]).to.equal("2");

    let sublane2Expand = sublane2.find("> div > span > .expand-button");
    sublane2Expand.simulate("click");

    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    sublane2 = lane1.find("> ul > li > div");
    let sublane3 = sublane2.find("> ul > li > div");

    // sublane 3 has a hidden parent, so it can't be shown.
    expect(sublane3.text()).to.contain("Hidden");
    let sublane3Show = sublane3.find("> div > .show-lane");
    expect(sublane3Show.length).to.equal(0);

    // if lane order has changed, no lanes can be shown
    wrapper.setState({ orderChanged: true });

    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    sublane2 = lane1.find("> ul > li > div");
    expect(sublane2.text()).to.contain("Hidden");
    sublane2Show = sublane2.find("> div > .show-lane");
    expect(sublane2Show.length).to.equal(0);
  });

  it("hides a lane", () => {
    mountWrapper();
    let topLevelLanes = getTopLevelLanes();
    let lane1 = topLevelLanes.at(0);
    expect(lane1.text()).to.contain("Visible");
    let lane1Hide = lane1.find("> div > .hide-lane");
    expect(lane1Hide.length).to.equal(1);

    let sublane2 = lane1.find("> ul > li > div");
    expect(sublane2.text()).to.contain("Hidden");
    let sublane2Hide = sublane2.find("> div > .hide-lane");
    expect(sublane2Hide.length).to.equal(0);

    lane1Hide.simulate("click");
    expect(hideLane.callCount).to.equal(1);
    expect(hideLane.args[0][0]).to.equal("1");

    // if lane order has changed, no lanes can be hidden
    wrapper.setState({ orderChanged: true });

    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    expect(lane1.text()).to.contain("Visible");
    lane1Hide = lane1.find("> div > .hide-lane");
    expect(lane1Hide.length).to.equal(0);
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

  it("renders save and reset order if order has changed", () => {
    mountWrapper();
    let orderInfo = wrapper.find(".order-change-info");
    expect(orderInfo.length).to.equal(0);

    wrapper.setState({ orderChanged: true });
    orderInfo = wrapper.find(".order-change-info");
    expect(orderInfo.length).to.equal(1);

    let save = orderInfo.find("button").findWhere(el => el.text() === "Save Order Changes");
    expect(save.length).to.equal(1);
    let reset = orderInfo.find(".cancel-order-changes");
    expect(reset.length).to.equal(1);
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
    expect(editor.props().lane).to.deep.equal(sublaneData);
    expect(editor.props().parent).to.deep.equal(lanesData[0]);
    expect(editor.props().customLists).to.deep.equal(customListsData);
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
    mountWrapper();
    wrapper.setProps({ editOrCreate: "reset" });

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

  it("prevents dragging a lane out of its parent", () => {
    let newSublaneData: LaneData = {
      id: 5, display_name: "sublane 5", visible: true, count: 6, sublanes: [],
      custom_list_ids: [2], inherit_parent_restrictions: false
    };
    let newSubsublaneData: LaneData = {
      id: 6, display_name: "sublane 6", visible: true, count: 6, sublanes: [],
      custom_list_ids: [2], inherit_parent_restrictions: false
    };
    lanesData = [
      { id: 1, display_name: "lane 1", visible: true, count: 5,
        sublanes: [{...sublaneData, sublanes: [subsublaneData, newSubsublaneData] }, newSublaneData],
        custom_list_ids: [1], inherit_parent_restrictions: true },
      { id: 4, display_name: "lane 4", visible: true, count: 1, sublanes: [],
        custom_list_ids: [], inherit_parent_restrictions: false }
    ];
    mountWrapper();

    // simulate starting a drag of lane1
    (wrapper.instance() as Lanes).onDragStart({
      draggableId: "1",
      source: {
        droppableId: "top"
      }
    });

    // dropping should be disabled everywhere except the top-level lane
    let topDroppable = getDroppableById("top");
    expect(topDroppable.props().isDropDisabled).to.be.false;
    let lane1Droppable = getDroppableById("1");
    expect(lane1Droppable.props().isDropDisabled).to.be.true;

    // sublane 2 is collapsed so it isn't droppable
    let topLevelLanes = getTopLevelLanes();
    let lane1 = topLevelLanes.at(0);
    let sublane2 = lane1.children(Droppable).children(Draggable).children("div").at(0);
    let sublane2Expand = sublane2.find("> div > span > .expand-button");
    sublane2Expand.simulate("click");
    let sublane2Droppable = getDroppableById("2");
    expect(sublane2Droppable.props().isDropDisabled).to.be.true;

    // now simulate dragging sublane 2
    (wrapper.instance() as Lanes).onDragStart({
      draggableId: "2",
      source: {
        droppableId: "1"
      }
    });

    expect(topDroppable.props().isDropDisabled).to.be.true;
    expect(lane1Droppable.props().isDropDisabled).to.be.false;
    expect(sublane2Droppable.props().isDropDisabled).to.be.true;
  });

  it("drags a top-level lane", () => {
    mountWrapper();

    // simulate starting a drag of lane1
    (wrapper.instance() as Lanes).onDragStart({
      draggableId: "1",
      source: {
        droppableId: "top"
      }
    });

    // simulate dropping below lane 4
    (wrapper.instance() as Lanes).onDragEnd({
      draggableId: "1",
      source: {
        droppableId: "top",
        index: 0
      },
      destination: {
        droppableId: "top",
        index: 1
      }
    });

    let topLevelLanes = getTopLevelLanes();
    let lane4 = topLevelLanes.at(0);
    let lane1 = topLevelLanes.at(1);
    expect(lane1.text()).to.contain("lane 1");
    expect(lane1.text()).to.contain("(5)");
    expect(lane4.text()).to.contain("lane 4");
    expect(lane4.text()).to.contain("(1)");
  });

  it("drags a sublane", () => {
    let newSublaneData: LaneData = {
      id: 5, display_name: "sublane 5", visible: true, count: 6, sublanes: [],
      custom_list_ids: [2], inherit_parent_restrictions: false
    };
    lanesData = [
      { id: 1, display_name: "lane 1", visible: true, count: 5,
        sublanes: [sublaneData, newSublaneData], custom_list_ids: [1], inherit_parent_restrictions: true },
      { id: 4, display_name: "lane 4", visible: true, count: 1, sublanes: [],
        custom_list_ids: [], inherit_parent_restrictions: false }
    ];
    mountWrapper();

    // simulate starting a drag of sublane 5
    (wrapper.instance() as Lanes).onDragStart({
      draggableId: "5",
      source: {
        droppableId: "1"
      }
    });

    // simulate dropping above sublane 2
    (wrapper.instance() as Lanes).onDragEnd({
      draggableId: "5",
      source: {
        droppableId: "1",
        index: 1
      },
      destination: {
        droppableId: "1",
        index: 0
      }
    });

    let topLevelLanes = getTopLevelLanes();
    let lane1 = topLevelLanes.at(0);
    let sublanes = lane1.children(Droppable).children(Draggable).children("div");
    let sublane5 = sublanes.at(0);
    let sublane2 = sublanes.at(1);
    expect(sublane2.text()).to.contain("sublane 2");
    expect(sublane5.text()).to.contain("sublane 5");
  });

  it("saves lane order changes", () => {
    mountWrapper();
    wrapper.setState({ orderChanged: true, lanes: [lanesData[1], lanesData[0]] });

    let saveOrderButton = wrapper.find("button").findWhere(el => el.text() === "Save Order Changes");
    saveOrderButton.simulate("click");
    expect(changeLaneOrder.callCount).to.equal(1);
    expect(changeLaneOrder.args[0][0]).to.deep.equal([lanesData[1], lanesData[0]]);
    expect(fetchLanes.callCount).to.equal(2);
  });

  it("resets lane order changes", () => {
    mountWrapper();
    wrapper.setState({ orderChanged: true, lanes: [lanesData[1], lanesData[0]] });

    let cancelOrderChangesButton = wrapper.find(".cancel-order-changes");
    cancelOrderChangesButton.simulate("click");
    expect(wrapper.state().orderChanged).to.equal(false);
    expect(wrapper.state().lanes).to.deep.equal(lanesData);
  });

  it("renders draggable sublanes only if there's more than one", () => {
    // lane structure:
    //        top
    //       /   \
    //      1     4
    //     / \
    //    2   5
    //   /   / \
    //  3   6   7
    //      |
    //      8
    //
    // top, 1, and 5 are the only lanes with draggable sublanes.
    // 1, 2, 4, 5, 6, and 7 should be draggable.

    let sublane8Data: LaneData = {
      id: 8, display_name: "sublane 8", visible: true, count: 6, sublanes: [],
      custom_list_ids: [2], inherit_parent_restrictions: false
    };
    let sublane6Data: LaneData = {
      id: 6, display_name: "sublane 6", visible: true, count: 6, sublanes: [sublane8Data],
      custom_list_ids: [2], inherit_parent_restrictions: false
    };
    let sublane7Data: LaneData = {
      id: 7, display_name: "sublane 7", visible: true, count: 6, sublanes: [],
      custom_list_ids: [2], inherit_parent_restrictions: false
    };
    let sublane5Data: LaneData = {
      id: 5, display_name: "sublane 5", visible: true, count: 6, sublanes: [sublane6Data, sublane7Data],
      custom_list_ids: [2], inherit_parent_restrictions: false
    };
    lanesData = [
      { id: 1, display_name: "lane 1", visible: true, count: 5,
        sublanes: [sublaneData, sublane5Data], custom_list_ids: [1], inherit_parent_restrictions: true },
      { id: 4, display_name: "lane 4", visible: true, count: 1, sublanes: [],
        custom_list_ids: [], inherit_parent_restrictions: false }
    ];
    mountWrapper();
    let topLevelLanes = getTopLevelLanes();

    let lane1 = topLevelLanes.at(0);
    expect(lane1.children(Droppable).children(Draggable).children("div").length).to.equal(2);
    expect(lane1.find("> ul > li > div").length).to.equal(0);

    let lane1Children = lane1.children(Droppable).children(Draggable).children("div");
    let sublane2 = lane1Children.at(0);
    let sublane2Expand = sublane2.find("> div > span > .expand-button");
    sublane2Expand.simulate("click");
    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    lane1Children = lane1.children(Droppable).children(Draggable).children("div");
    sublane2 = lane1Children.at(0);
    expect(sublane2.text()).to.contain("sublane 2");
    expect(sublane2.children(Droppable).children(Draggable).children("div").length).to.equal(0);
    expect(sublane2.find("> ul > li > div").length).to.equal(1);

    let sublane5 = lane1Children.at(1);
    let sublane5Expand = sublane5.find("> div > span > .expand-button");
    sublane5Expand.simulate("click");
    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    lane1Children = lane1.children(Droppable).children(Draggable).children("div");
    sublane5 = lane1Children.at(1);
    expect(sublane5.text()).to.contain("sublane 5");
    expect(sublane5.children(Droppable).children(Draggable).children("div").length).to.equal(2);
    expect(sublane5.find("> ul > li > div").length).to.equal(0);

    let sublane5Children = sublane5.children(Droppable).children(Draggable).children("div");
    let sublane6 = sublane5Children.at(0);
    let sublane6Expand = sublane6.find("> div > span > .expand-button");
    sublane6Expand.simulate("click");
    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    lane1Children = lane1.children(Droppable).children(Draggable).children("div");
    sublane5 = lane1Children.at(1);
    sublane5Children = sublane5.children(Droppable).children(Draggable).children("div");
    sublane6 = sublane5Children.at(0);
    expect(sublane6.text()).to.contain("sublane 6");
    expect(sublane6.children(Droppable).children(Draggable).children("div").length).to.equal(0);
    expect(sublane6.find("> ul > li > div").length).to.equal(1);

    let sublane7 = sublane5Children.at(1);
    let sublane7Expand = sublane7.find("> div > span > .expand-button");
    sublane7Expand.simulate("click");
    topLevelLanes = getTopLevelLanes();
    lane1 = topLevelLanes.at(0);
    lane1Children = lane1.children(Droppable).children(Draggable).children("div");
    sublane5 = lane1Children.at(1);
    sublane5Children = sublane5.children(Droppable).children(Draggable).children("div");
    sublane7 = sublane5Children.at(1);
    expect(sublane7.text()).to.contain("sublane 7");
    expect(sublane7.children(Droppable).children(Draggable).children("div").length).to.equal(0);
    expect(sublane7.find("> ul > li > div").length).to.equal(0);

    let lane4 = topLevelLanes.at(1);
    expect(lane4.children(Droppable).children(Draggable).children("div").length).to.equal(0);
    expect(lane4.find("> ul > li > div").length).to.equal(0);
  });
});
