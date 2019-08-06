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

  // Returns all the list item elements from the first list in the DOM
  // that is a droppable list.
  const getTopLevelLanes = () => {
    return wrapper.find("ul.droppable").at(0).children();
  };
  // Returns all the children lanes (including grandchildren) from the given parent lane.
  let allChildren = (lane) => {
    return lane.find("li .lane-parent");
  };
  // Returns all the draggable children lanes
  // (including grandchildren) from the given parent lane.
  let draggableChildren = (lane) => {
    return lane.find("li .lane-parent .draggable");
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
    expect(create.render().hasClass("create-lane")).to.be.true;
    expect(create.prop("to")).to.equal("/admin/web/lanes/library/create");

    // the link is disabled if there are lane order changes
    wrapper.setProps({ orderChanged: true });
    create =  wrapper.find(".lanes-sidebar > div").find(Link).at(0);
    expect(create.render().hasClass("create-lane")).to.be.true;
    expect(create.prop("to")).to.be.null;
    expect(create.render().hasClass("disabled")).to.be.true;
  });
  it("renders reset link", () => {
    let reset = wrapper.find(".lanes-sidebar > div").find(Link).at(1);
    expect(reset.render().hasClass("reset-lane")).to.be.true;
    expect(reset.prop("to")).to.equal("/admin/web/lanes/library/reset");

    // the link is disabled if there are lane order changes
    wrapper.setProps({ orderChanged: true });
    reset = wrapper.find(".lanes-sidebar > div").find(Link).at(1);
    expect(reset.render().hasClass("reset-lane")).to.be.true;
    expect(reset.prop("to")).to.be.null;
    expect(reset.render().hasClass("disabled")).to.be.true;
  });

  it("renders active lane", () => {
    let topLevelLanes = getTopLevelLanes();
    // The first div in each li is the main DOM element to test.
    // Using the `div` for testing because that's the main DOM element
    // that contains the interactive classes.
    let topLane1 = topLevelLanes.at(0).find("div").at(0);
    let topLane2 = topLevelLanes.at(1).find("div").at(0);
    // This does the same as above but it's for a sublane,
    // so the sublane of the parent lane.
    // This now replaces `.find(Lane).find("> div"); as the second
    // query now returns a parsing error (can't start a selector with `>`).
    let subLane1 = topLane1.find("li > div");

    expect(topLane1.render().hasClass("active")).to.be.false;
    expect(topLane2.render().hasClass("active")).to.be.false;
    expect(subLane1.render().hasClass("active")).to.be.false;

    wrapper.setProps({ identifier: "1" });
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0).find("div").at(0);
    topLane2 = topLevelLanes.at(1).find("div").at(0);
    subLane1 = topLane1.find("li > div");
    expect(topLane1.render().hasClass("active")).to.be.true;
    expect(topLane2.render().hasClass("active")).to.be.false;
    expect(subLane1.render().hasClass("active")).to.be.false;

    wrapper.setProps({ identifier: "2" });
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0).find("div").at(0);
    topLane2 = topLevelLanes.at(1).find("div").at(0);
    subLane1 = topLane1.find("li > div");
    expect(topLane1.render().hasClass("active")).to.be.false;
    expect(topLane2.render().hasClass("active")).to.be.false;
    expect(subLane1.render().hasClass("active")).to.be.true;
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
      id: 5,
      display_name: "Sublane 2",
      visible: true,
      count: 0,
      inherit_parent_restrictions: false,
      sublanes: [], custom_list_ids: []
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
    wrapper.instance().onDragEnd({
      ...dragNewSublane,
      ...{ destination: { droppableId: "1", index: 0 } }
    });
    expect(drag.callCount).to.equal(2);
    expect(drag.args[1][0].draggableId).to.be.null;
    expect(drag.args[1][0].draggingFrom).to.be.null;
    expect(drag.args[1][0].orderChanged).to.be.true;
    expect(drag.args[1][0].lanes[0].sublanes).to.eql([newSublane, sublaneData]);
  });

  it("drops a lane back into its original position", () => {
    wrapper.instance().onDragEnd({
      draggableId: "1",
      source: { index: 0, droppableId: "top" },
      destination: { index: 0, droppableId: "top" }
    });
    expect(drag.callCount).to.equal(0);
  });

  it("renders and expands and collapses lanes and sublanes", () => {
    const expectExpanded = (lane) => {
      let collapse = lane.find(".lane-info").at(0).find(".collapse-button").hostNodes();
      expect(collapse.length).to.equal(1);
      let expand = lane.find(".lane-info").at(0).find(".expand-button").hostNodes();
      expect(expand.length).to.equal(0);
      return collapse;
    };

    const expectCollapsed = (lane) => {
      let collapse = lane.find(".lane-info").at(0).find(".collapse-button").hostNodes();
      expect(collapse.length).to.equal(0);
      let expand = lane.find(".lane-info").at(0).find(".expand-button").hostNodes();
      expect(expand.length).to.equal(1);
      return expand;
    };

    let topLevelLanes = getTopLevelLanes();
    expect(topLevelLanes.length).to.equal(2);
    let topLane1 = topLevelLanes.at(0).find("div").at(0);
    let topLane2 = topLevelLanes.at(1).find("div").at(0);
    expect(topLane1.text()).to.contain("Top Lane 1");
    expect(topLane1.text()).to.contain("(5)");
    expect(topLane2.text()).to.contain("Top Lane 2");
    expect(topLane2.text()).to.contain("(1)");

    // both top-level lanes are expanded to start.
    expectExpanded(topLane1);
    expectExpanded(topLane2);

    // top lane 1 has one sublane which is collapsed
    let subLane1 = topLane1.find("li > div");
    expect(subLane1.text()).to.contain("Sublane 1");
    expect(subLane1.text()).to.contain("(3)");
    expect(subLane1.length).to.equal(1);
    let subLane1Expand = expectCollapsed(subLane1);

    // top lane 2 has no sublanes
    // let topLane2Sublanes = topLane2.find("li > div");
    // let topLane2Draggables = topLane2.find(Droppable).find(Draggable);
    let topLane2Sublanes = allChildren(topLane2);
    let topLane2Draggables = draggableChildren(topLane2);
    expect(topLane2Sublanes.length).to.equal(0);
    expect(topLane2Draggables.length).to.equal(0);

    // sublane 1 has a sublane, but it's not shown since sublane 1 is collapsed.
    let subSubLane = subLane1.find("li > div");
    expect(subSubLane.length).to.equal(0);

    // if we expand sublane 1, we can see its sublane below it.
    subLane1Expand.simulate("click");
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0).find("div").at(0);
    subLane1 = topLane1.find("li > div");
    let subLane1Collapse = expectExpanded(subLane1);
    subSubLane = subLane1.find("li > div");
    expect(subSubLane.text()).to.contain("SubSublane 1");
    expect(subSubLane.text()).to.contain("(2)");
    expectCollapsed(subSubLane);

    // if we collapse sublane 1, its sublane is hidden again.
    subLane1Collapse.simulate("click");
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0).find("div").at(0);
    subLane1 = topLane1.find("li > div");
    expectCollapsed(subLane1);
    subSubLane = subLane1.find("li > div");
    expect(subSubLane.length).to.equal(0);

    // if we collapse lane 1, sublane 2 is hidden.
    let topLane1Collapse = expectExpanded(topLane1);
    topLane1Collapse.simulate("click");
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0).find("div").at(0);
    let topLane1Expand = expectCollapsed(topLane1);
    subLane1 = topLane1.find("li > div");
    expect(subLane1.length).to.equal(0);

    // if we expand lane 1, sublane 2 is shown again.
    topLane1Expand.simulate("click");
    topLevelLanes = getTopLevelLanes();
    topLane1 = topLevelLanes.at(0).find("div").at(0);
    expectExpanded(topLane1);
    subLane1 = topLane1.find("li > div");
    expect(subLane1.length).to.equal(1);
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
    let sublaneData: LaneData = {
      id: 2, display_name: "sublane 2", visible: false, count: 3, sublanes: [subsublaneData],
      custom_list_ids: [2], inherit_parent_restrictions: false
    };

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

    let expand = (lane) => {
      lane.find(".expand-button").hostNodes().at(0).props().onClick();
    };
    let isDraggable = (lane) => {
      return lane.find(".lane-info").at(0).hasClass("draggable");
    };

    wrapper.setProps({ lanes: lanesData });
    // Updated props so update the component.
    wrapper.update();

    //        top
    //       /   \
    //      1     4

    /** lane 1 */
    let lane1 = getTopLevelLanes().at(0).find(".lane-parent").at(0);
    let lane1Children = allChildren(lane1);
    expect(lane1.text()).to.contain("lane 1");
    expect(isDraggable(lane1)).to.be.true;
    // Lane 1 has two children (Sublane 2 and Sublane 5), which are draggable.
    expect(draggableChildren(lane1).length).to.equal(2);
    expect(lane1Children.length).to.equal(2);

    /** lane 4 */
    let lane4 = getTopLevelLanes().at(1).find(".lane-parent").at(0);
    expect(lane4.text()).to.contain("lane 4");
    expect(isDraggable(lane4)).to.be.true;
    // Lane 4 doesn't have children.
    expect(allChildren(lane4).length).to.equal(0);
    expect(draggableChildren(lane4).length).to.equal(0);

    //        top
    //       /   \
    //      1     4
    //     / \
    //    2   5

    /** lane 2 */
    let sublane2 = lane1Children.at(0);
    expect(isDraggable(sublane2)).to.be.true;
    expand(sublane2);
    // The component's DOM was updated so the component needs to be updated.
    wrapper.update();

    expect(sublane2.text()).to.contain("sublane 2");
    // Sublane 2 has a child (Sublane 3).
    expect(allChildren(sublane2.render()).length).to.equal(1);
    // But because it's the only one, it's not draggable.
    expect(draggableChildren(sublane2.render()).length).to.equal(0);

    /** lane 5 */
    let sublane5 = lane1Children.at(1);
    expect(isDraggable(sublane5)).to.be.true;
    expand(sublane5);
    wrapper.update();

    expect(sublane5.text()).to.contain("sublane 5");
    // Sublane 5 has two children (Sublane 6 and Sublane 7).
    expect(allChildren(sublane5.render()).length).to.equal(2);
    // Both of them are draggable.
    expect(draggableChildren(sublane5.render()).length).to.equal(2);

    //        top
    //       /   \
    //      1     4
    //     / \
    //    2   5
    //   /   / \
    //  3   6   7

    /** lane 3 */
    // There's a need to refetch the DOM elements after updating it.
    lane1 = getTopLevelLanes().at(0).find(".lane-parent").at(0);
    lane1Children = allChildren(lane1);
    sublane2 = lane1Children.at(0);
    let sublane3 = allChildren(sublane2);

    expect(isDraggable(sublane3)).to.be.false;
    expect(sublane3.text()).to.contain("SubSublane 1");
    // Sublane 3 doesn't have children.
    expect(allChildren(sublane3).length).to.equal(0);

    /** lane 6 */
    // All lane 1 children are expanded:
    // at(1) corresponds to lane 3 and at(2) corresponds to lane 5
    sublane5 = lane1Children.at(2);
    let sublane6 = allChildren(sublane5).at(0);
    expect(isDraggable(sublane6)).to.be.true;
    expand(sublane6);
    wrapper.update();
    expect(sublane6.text()).to.contain("sublane 6");
    // Sublane 6 has a child (Sublane 8).
    expect(allChildren(sublane6.render()).length).to.equal(1);
    // But it's the only one, so it's not draggable.
    expect(draggableChildren(sublane6.render()).length).to.equal(0);

    /** lane 7 */
    let sublane7 = allChildren(sublane5).at(1);
    expect(isDraggable(sublane7)).to.be.true;
    expand(sublane7);
    expect(sublane7.text()).to.contain("sublane 7");
    // Sublane 7 doesn't have children.
    expect(allChildren(sublane7.render()).length).to.equal(0);
    expect(draggableChildren(sublane7.render()).length).to.equal(0);

    //        top
    //       /   \
    //      1     4
    //     / \
    //    2   5
    //   /   / \
    //  3   6   7
    //      |
    //      8
    /** lane  8 */
    lane1 = getTopLevelLanes().at(0).find(".lane-parent").at(0);
    lane1Children = allChildren(lane1);
    // The fourth child is the 8th lane since all lanes are expanded.
    let sublane8 = lane1Children.at(4);
    expect(isDraggable(sublane8)).to.be.false;
    expand(sublane8);
    expect(sublane8.text()).to.contain("sublane 8");
    // Sublane 8 doesn't have children.
    expect(allChildren(sublane8.render()).length).to.equal(0);
    expect(draggableChildren(sublane8.render()).length).to.equal(0);
  });
});
