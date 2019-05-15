import { expect } from "chai";
import { stub } from "sinon";
import { LaneData } from "../../interfaces";
import * as React from "react";
import { shallow, mount } from "enzyme";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import LanesSidebar from "../LanesSidebar";
import Lane from "../Lane";
import { Link } from "react-router";

describe("LanesSidebar", () => {
  let wrapper;
  let drag;
  let findLaneForIdentifier;
  let findParentOfLane;
  let subsublaneData: LaneData = {
    id: 3, display_name: "SubSublane 1", visible: false, count: 2, sublanes: [],
    custom_list_ids: [2], inherit_parent_restrictions: false
  };
  let sublaneData: LaneData = {
    id: 2, display_name: "Sublane 1", visible: false, count: 3, sublanes: [subsublaneData],
    custom_list_ids: [2], inherit_parent_restrictions: false
  };
  let lanesData: LaneData[];

  const getTopLevelLanes = () => {
    return wrapper.children(DragDropContext).children(Draggable).children("div");
  };
  beforeEach(() => {
    lanesData = [
      { id: 1, display_name: "Top Lane 1", visible: true, count: 5,
      sublanes: [sublaneData], custom_list_ids: [1], inherit_parent_restrictions: true },
      { id: 4, display_name: "Top Lane 2", visible: true, count: 1, sublanes: [],
      custom_list_ids: [], inherit_parent_restrictions: false }
    ];
    drag = stub();
    findLaneForIdentifier = stub().returns(lanesData[1]);
    findParentOfLane = stub().returns(null);
    wrapper = mount(
      <LanesSidebar
        orderChanged={false}
        drag={drag}
        lanes={lanesData}
        library={"library"}
        findLaneForIdentifier={findLaneForIdentifier}
        findParentOfLane={findParentOfLane}
      />);
  });
  it("renders create top-level lane link", () => {
    let create = wrapper.find(".lanes-sidebar > div").find(Link).at(0);
    expect(create.hasClass("create-lane")).to.be.true;
    expect(create.prop("to")).to.equal("/admin/web/lanes/library/create");

    // the link is disabled if there are lane order changes
    wrapper.setProps({ orderChanged: true });
    create =  wrapper.find(".lanes-sidebar > div").find(Link).at(0);
    expect(create.hasClass("create-lane")).to.be.true;
    expect(create.prop("to")).to.be.null;
    expect(create.hasClass("disabled")).to.be.true;
  });
  it("renders reset link", () => {
    let reset = wrapper.find(".lanes-sidebar > div").find(Link).at(1);
    expect(reset.hasClass("reset-lane")).to.be.true;
    expect(reset.prop("to")).to.equal("/admin/web/lanes/library/reset");

    // the link is disabled if there are lane order changes
    wrapper.setProps({ orderChanged: true });
    reset = wrapper.find(".lanes-sidebar > div").find(Link).at(1);
    expect(reset.hasClass("reset-lane")).to.be.true;
    expect(reset.prop("to")).to.be.null;
    expect(reset.hasClass("disabled")).to.be.true;
  });

  it("renders active lane", () => {
    let topLevelLanes = getTopLevelLanes();
    let topLane1 = topLevelLanes.at(0);
    let topLane2 = topLevelLanes.at(1);
    let subLane1 = topLane1.find(Lane).find("> div");

    expect(topLane1.hasClass("active")).to.be.false;
    expect(topLane2.hasClass("active")).to.be.false;
    expect(subLane1.hasClass("active")).to.be.false;

    wrapper.setProps({ identifier: "1" });
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0);
    topLane2 = topLevelLanes.at(1);
    subLane1 = topLane1.find(Lane).find("> div");
    expect(topLane1.hasClass("active")).to.be.true;
    expect(topLane2.hasClass("active")).to.be.false;
    expect(subLane1.hasClass("active")).to.be.false;

    wrapper.setProps({ identifier: "2" });
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0);
    topLane2 = topLevelLanes.at(1);
    subLane1 = topLane1.find(Lane).find("> div");
    expect(topLane1.hasClass("active")).to.be.false;
    expect(topLane2.hasClass("active")).to.be.false;
    expect(subLane1.hasClass("active")).to.be.true;
  });

  it("drags and drops a top-level lane", () => {
    let topLevelLanes = getTopLevelLanes();
    let dragTopLane2 = { draggableId: "4", source: { index: 1, droppableId: "top" }};
    // pick up Top Lane 2
    wrapper.instance().onDragStart(dragTopLane2);
    expect(drag.callCount).to.equal(1);
    expect(drag.args[0][0]).to.eql({ draggableId: "4", draggingFrom: "top" });
    // drop it before Top Lane 1
    wrapper.instance().onDragEnd({...dragTopLane2,  ...{destination: { droppableId: "top", index: 0 }}});
    expect(drag.callCount).to.equal(2);
    expect(drag.args[1][0]).to.eql({
      draggableId: null,
      draggingFrom: null,
      lanes: [lanesData[1], lanesData[0]],
      orderChanged: true
    });
  });

  it("drags and drops a sublane", () => {
    let newSublane: LaneData = {
      id: 5, display_name: "Sublane 2", visible: true, count: 0, inherit_parent_restrictions: false, sublanes: [], custom_list_ids: []
    };
    findLaneForIdentifier.returns(newSublane);
    findParentOfLane.returns(lanesData[0]);
    lanesData[0].sublanes = [sublaneData, newSublane];
    let dragNewSublane = { draggableId: "5", source: { index: 1, droppableId: "1" }};
    // pick up Sublane 2
    wrapper.instance().onDragStart(dragNewSublane);
    expect(drag.callCount).to.equal(1);
    expect(drag.args[0][0]).to.eql({ draggableId: "5", draggingFrom: "1" });
    // drop it before Sublane 1
    wrapper.instance().onDragEnd({...dragNewSublane,  ...{destination: { droppableId: "1", index: 0 }}});
    expect(drag.callCount).to.equal(2);
    expect(drag.args[1][0].draggableId).to.be.null;
    expect(drag.args[1][0].draggingFrom).to.be.null;
    expect(drag.args[1][0].orderChanged).to.be.true;
    expect(drag.args[1][0].lanes[0].sublanes).to.eql([newSublane, sublaneData]);
  });

  it("drops a lane back into its original position", () => {
    wrapper.instance().onDragEnd({ draggableId: "1", source: { index: 0, droppableId: "top" }, destination: { index: 0, droppableId: "top" }});
    expect(drag.callCount).to.equal(0);
  });

  it("renders and expands and collapses lanes and sublanes", () => {
    const expectExpanded = (lane) => {
      let collapse = lane.find(".lane-info").at(0).find(".collapse-button");
      expect(collapse.length).to.equal(1);
      let expand = lane.find(".lane-info").at(0).find(".expand-button");
      expect(expand.length).to.equal(0);
      return collapse;
    };

    const expectCollapsed = (lane) => {
      let collapse = lane.find(".lane-info").at(0).find(".collapse-button");
      expect(collapse.length).to.equal(0);
      let expand = lane.find(".lane-info").at(0).find(".expand-button");
      expect(expand.length).to.equal(1);
      return expand;
    };

    let topLevelLanes = getTopLevelLanes();
    expect(topLevelLanes.length).to.equal(2);
    let topLane1 = topLevelLanes.at(0);
    let topLane2 = topLevelLanes.at(1);
    expect(topLane1.text()).to.contain("Top Lane 1");
    expect(topLane1.text()).to.contain("(5)");
    expect(topLane2.text()).to.contain("Top Lane 2");
    expect(topLane2.text()).to.contain("(1)");

    // both top-level lanes are expanded to start.
    expectExpanded(topLane1);
    expectExpanded(topLane2);

    // top lane 1 has one sublane which is collapsed
    let subLane1 = topLane1.find(Lane);
    expect(subLane1.text()).to.contain("Sublane 1");
    expect(subLane1.text()).to.contain("(3)");
    expect(subLane1.length).to.equal(1);
    let subLane1Expand = expectCollapsed(subLane1);

    // top lane 2 has no sublanes
    let topLane2Sublanes = topLane2.find(Lane).find("> div");
    let topLane2Draggables = topLane2.children(Droppable).children(Draggable).children("div");
    expect(topLane2Sublanes.length).to.equal(0);
    expect(topLane2Draggables.length).to.equal(0);

    // sublane 1 has a sublane, but it's not shown since sublane 1 is collapsed.
    let subSubLane = subLane1.find("div").at(0).find(Lane);
    expect(subSubLane.length).to.equal(0);

    // if we expand sublane 1, we can see its sublane below it.
    subLane1Expand.simulate("click");
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0);
    subLane1 = topLane1.find(Lane).at(0);
    let subLane1Collapse = expectExpanded(subLane1);
    subSubLane = subLane1.find("div").at(0).find(Lane);
    expect(subSubLane.text()).to.contain("SubSublane 1");
    expect(subSubLane.text()).to.contain("(2)");
    expectCollapsed(subSubLane);

    // if we collapse sublane 1, its sublane is hidden again.
    subLane1Collapse.simulate("click");
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0);
    subLane1 = topLane1.find(Lane).at(0);
    expectCollapsed(subLane1);
    expect(subLane1.find("div").at(0).find(Lane).length).to.equal(0);

    // if we collapse lane 1, sublane 2 is hidden.
    let topLane1Collapse = expectExpanded(topLane1);
    topLane1Collapse.simulate("click");
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0);
    let topLane1Expand = expectCollapsed(topLane1);
    subLane1 = topLane1.find(Lane).at(0);
    expect(subLane1.length).to.equal(0);

    // if we expand lane 1, sublane 2 is shown again.
    topLane1Expand.simulate("click");
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0);
    expectExpanded(topLane1);
    subLane1 = topLane1.find(Lane).at(0);
    expect(subLane1.length).to.equal(1);
  });
});
