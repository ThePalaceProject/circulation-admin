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
    const sidebar = wrapper.find(".lanes-sidebar");
    // let topLevelLanes = sidebar.children(DragDropContext).children(Draggable).children("div");
    const topLevelLanes = sidebar.find("ul.droppable").at(0).children();
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

    let save = orderInfo.find(".save-lane-order-changes").hostNodes();
    expect(save.length).to.equal(1);
    let reset = orderInfo.find(".cancel-lane-order-changes").hostNodes();
    expect(reset.length).to.equal(1);
  });

  it("renders create form by default", () => {
    expect(wrapper.instance().props.editOrCreate).to.equal("create");
    let editor = wrapper.find(LaneEditor);
    expect(editor.length).to.equal(1);
    expect(editor.props().library).to.equal("library");
    expect(editor.props().findParentOfLane()).to.equal(null);
    expect(editor.props().customLists).to.equal(customListsData);
    expect(editor.props().editLane).to.be.ok;

    wrapper.setProps({ identifier: "2" });
    editor = wrapper.find(LaneEditor);
    expect(editor.length).to.equal(1);
    expect(editor.props().library).to.equal("library");
    expect(editor.props().findParentOfLane()).to.equal(sublaneData);
    expect(editor.props().customLists).to.equal(customListsData);
    expect(editor.props().editLane).to.be.ok;
  });

  it("renders edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "2" });
    let editor = wrapper.find(LaneEditor);
    expect(editor.length).to.equal(1);
    expect(editor.props().library).to.equal("library");
    expect(editor.props().lane).to.deep.equal(sublaneData);
    expect(editor.props().findParentOfLane(editor.props().lane)).to.deep.equal(lanesData[0]);
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

    let resetButton = wrapper.find(".reset-button").hostNodes();
    resetButton.simulate("click");
    expect(resetLanes.callCount).to.equal(0);

    editableInputStub.returns("RESET");
    wrapper.setState({ canReset: true });
    resetButton.simulate("click");
    expect(resetLanes.callCount).to.equal(1);
    expect(fetchLanes.callCount).to.equal(2);

    editableInputStub.restore();
  });

  it("updates the state to determine whether the lanes can be reset", () => {
    mountWrapper();
    wrapper.setProps({ editOrCreate: "reset" });
    expect(wrapper.state()["canReset"]).to.be.false;
    let button = wrapper.find(".reset button");
    expect(button.prop("disabled")).to.be.true;
    let input = wrapper.find(".reset input");
    input.getDOMNode().value = "RESET";
    input.simulate("change");

    button = wrapper.find(".reset button");
    expect(wrapper.state()["canReset"]).to.be.true;
    expect(button.prop("disabled")).not.to.be.true;
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
    (wrapper.instance() as Lanes).drag({
      draggableId: "1",
      source: {
        droppableId: "top"
      }
    });
    wrapper.update();

    // dropping should be disabled everywhere except the top-level lane
    let topDroppable = getDroppableById("top");
    expect(topDroppable.props().isDropDisabled).to.be.false;
    let lane1Droppable = getDroppableById("1");
    expect(lane1Droppable.props().isDropDisabled).to.be.true;

    // sublane 2 is collapsed so it isn't droppable
    let topLevelLanes = getTopLevelLanes();
    let lane1 = topLevelLanes.at(0).find(".lane-parent").at(0);
    let sublane2 = lane1.find("li .lane-parent").at(0);
    let sublane2Expand = sublane2.find(".expand-button");
    sublane2Expand.simulate("click");
    let sublane2Droppable = getDroppableById("2");
    expect(sublane2Droppable.props().isDropDisabled).to.be.true;

    // now simulate dragging sublane 2
    (wrapper.instance() as Lanes).drag({
      draggableId: "2",
      source: {
        droppableId: "1"
      }
    });
    wrapper.update();

    topDroppable = getDroppableById("top");
    lane1Droppable = getDroppableById("1");
    sublane2Droppable = getDroppableById("2");
    expect(topDroppable.props().isDropDisabled).to.be.true;
    expect(lane1Droppable.props().isDropDisabled).to.be.false;
    expect(sublane2Droppable.props().isDropDisabled).to.be.true;
  });

  it("drags a top-level lane", () => {
    mountWrapper();
    // simulate starting a drag of lane1
    (wrapper.instance() as Lanes).drag({
      draggableId: "1",
      droppableId: "top"
    });
    wrapper.update();

    // simulate dropping below lane 4
    (wrapper.instance() as Lanes).drag({
      draggableId: null,
      droppableId: null,
      lanes: [lanesData[1], lanesData[0]],
      orderChanged: true
    });
    wrapper.update();

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
    let rearrangedLane = {...lanesData[1], ...{sublanes: [newSublaneData, sublaneData]}};
    mountWrapper();

    // simulate starting a drag of sublane 5
    (wrapper.instance() as Lanes).drag({
      draggableId: "5",
      droppableId: "1"
    });
    wrapper.update();

    // simulate dropping above sublane 2
    (wrapper.instance() as Lanes).drag({
      draggableId: null,
      droppableId: null,
      orderChanged: true,
      lanes: [rearrangedLane, lanesData[1]]
    });
    wrapper.update();

    let topLevelLanes = getTopLevelLanes();
    let lane1 = topLevelLanes.at(0).find(".lane-parent").at(0);
    // let sublanes = lane1.children(Droppable).children(Draggable).children("div");
    let sublanes = lane1.find("li .lane-parent");
    let sublane5 = sublanes.at(0);
    let sublane2 = sublanes.at(1);
    expect(sublane2.text()).to.contain("sublane 2");
    expect(sublane5.text()).to.contain("sublane 5");
  });

  it("saves lane order changes", () => {
    mountWrapper();
    wrapper.setState({ orderChanged: true, lanes: [lanesData[1], lanesData[0]] });

    let saveOrderButton = wrapper.find(".order-change-info .save-lane-order-changes").hostNodes();
    saveOrderButton.simulate("click");
    expect(changeLaneOrder.callCount).to.equal(1);
    expect(changeLaneOrder.args[0][0]).to.deep.equal([lanesData[1], lanesData[0]]);
    expect(fetchLanes.callCount).to.equal(2);
  });

  it("resets lane order changes", () => {
    mountWrapper();
    wrapper.setState({ orderChanged: true, lanes: [lanesData[1], lanesData[0]] });

    let cancelOrderChangesButton = wrapper.find(".order-change-info .cancel-lane-order-changes").hostNodes();
    cancelOrderChangesButton.simulate("click");
    expect(wrapper.state().orderChanged).to.equal(false);
    expect(wrapper.state().lanes).to.deep.equal(lanesData);
  });
});
