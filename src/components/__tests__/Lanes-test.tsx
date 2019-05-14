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
import Lane from "../Lane";
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
    expect(editor.props().findParent()).to.equal(null);
    expect(editor.props().customLists).to.equal(customListsData);
    expect(editor.props().editLane).to.be.ok;

    wrapper.setProps({ identifier: "2" });
    editor = wrapper.find(LaneEditor);
    expect(editor.length).to.equal(1);
    expect(editor.props().library).to.equal("library");
    expect(editor.props().findParent()).to.equal(sublaneData);
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
    expect(editor.props().findParent(editor.props().lane)).to.deep.equal(lanesData[0]);
    expect(editor.props().customLists).to.deep.equal(customListsData);
    expect(editor.props().editLane).to.be.ok;
    expect(editor.props().deleteLane).to.be.ok;
    expect(editor.props().toggleLaneVisibility).to.be.ok;
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

    let allChildren = (lane) => {
      return lane.find(Lane).find(".lane-info");
    };
    let draggableChildren = (lane) => {
      return lane.children(Droppable).children(Draggable).children("div");
    };
    let expand = (lane) => {
      lane.find(".expand-button").at(0).props().onClick();
    };
    let isDraggable = (lane) => {
      return lane.find(".lane-info").at(0).hasClass("draggable");
    };

    mountWrapper();

    let lane1 = getTopLevelLanes().at(0);
    expect(isDraggable(lane1)).to.be.true;
    // Lane 1 has two children (Sublane 2 and Sublane 5), which are draggable.
    let lane1Children = draggableChildren(lane1);
    expect(lane1Children.length).to.equal(2);
    expect(allChildren(lane1).length).to.equal(2);

    let sublane2 = lane1Children.at(0);
    expect(isDraggable(sublane2)).to.be.true;
    expand(sublane2);
    expect(sublane2.text()).to.contain("sublane 2");
    // Sublane 2 has a child (Sublane 3).
    expect(allChildren(sublane2).length).to.equal(1);
    // But because it's the only one, it's not draggable.
    expect(draggableChildren(sublane2).length).to.equal(0);

    let sublane5 = lane1Children.at(1);
    expect(isDraggable(sublane5)).to.be.true;
    expand(sublane5);
    expect(sublane5.text()).to.contain("sublane 5");
    // Sublane 5 has two children (Sublane 6 and Sublane 7).
    expect(allChildren(sublane5).length).to.equal(2);
    // Both of them are draggable.
    let sublane5Children = draggableChildren(sublane5);
    expect(sublane5Children.length).to.equal(2);

    let sublane6 = sublane5Children.at(0);
    expect(isDraggable(sublane6)).to.be.true;
    expand(sublane6);
    expect(sublane6.text()).to.contain("sublane 6");
    // Sublane 6 has a child (Sublane 8).
    expect(allChildren(sublane6).length).to.equal(1);
    // But it's the only one, so it's not draggable.
    expect(draggableChildren(sublane6).length).to.equal(0);

    let sublane7 = sublane5Children.at(1);
    expect(isDraggable(sublane7)).to.be.true;
    expand(sublane7);
    expect(sublane7.text()).to.contain("sublane 7");
    // Sublane 7 doesn't have children.
    expect(allChildren(sublane7).length).to.equal(0);
    expect(draggableChildren(sublane7).length).to.equal(0);

    let lane4 = getTopLevelLanes().at(1);
    expect(isDraggable(lane4)).to.be.true;
    // Lane 4 doesn't have children.
    expect(allChildren(lane4).length).to.equal(0);
    expect(draggableChildren(lane4).length).to.equal(0);
  });
});
