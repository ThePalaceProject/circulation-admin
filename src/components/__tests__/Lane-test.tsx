import { expect } from "chai";
import { stub } from "sinon";
import { LaneData } from "../../interfaces";
import * as React from "react";
import { shallow, mount } from "enzyme";
import Lane from "../Lane";
import { Link } from "react-router";

describe("Lane", () => {
  let wrapper;
  let renderLanes;
  let toggleLaneVisibility;
  const subsublaneData: LaneData = {
    id: 3,
    display_name: "subsublane 1",
    visible: false,
    count: 2,
    sublanes: [],
    custom_list_ids: [2],
    inherit_parent_restrictions: false,
  };
  const sublaneData: LaneData = {
    id: 2,
    display_name: "sublane 1",
    visible: false,
    count: 3,
    sublanes: [subsublaneData],
    custom_list_ids: [2],
    inherit_parent_restrictions: false,
  };
  const laneData: LaneData = {
    id: 1,
    display_name: "Top Lane 1",
    visible: true,
    count: 5,
    sublanes: [sublaneData],
    custom_list_ids: [1],
    inherit_parent_restrictions: true,
  };
  beforeEach(() => {
    renderLanes = stub();
    toggleLaneVisibility = stub();
    wrapper = mount(
      <Lane
        lane={laneData}
        active={false}
        library="test_library"
        orderChanged={false}
        renderLanes={renderLanes}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );
  });

  it("renders create sublane link", () => {
    // The lane starts out expanded by default, so the create link is already showing.
    let createSublane = wrapper
      .find(Link)
      .filterWhere((el) => el.find("a").hasClass("create-lane"));
    expect(createSublane.length).to.equal(1);
    expect(createSublane.prop("to")).to.equal(
      "/admin/web/lanes/test_library/create/1"
    );
    expect(createSublane.hasClass("disabled")).to.be.false;

    // The link is disabled if there are lane order changes.
    wrapper.setProps({ orderChanged: true });
    createSublane = wrapper
      .find(Link)
      .filterWhere((el) => el.find("a").hasClass("create-lane"));
    expect(createSublane.length).to.equal(1);
    expect(createSublane.prop("to")).to.be.null;
    expect(createSublane.hasClass("disabled")).to.be.true;

    // If the lane isn't expanded, the create link isn't shown.
    wrapper.setState({ expanded: false });
    createSublane = wrapper
      .find(Link)
      .filterWhere((el) => el.find("a").hasClass("create-lane"));
    expect(createSublane.length).to.equal(0);
  });

  it("renders edit link", () => {
    // The lane starts out expanded by default, so the edit link is already showing.
    let editSublane = wrapper
      .find(Link)
      .filterWhere((el) => el.find("a").hasClass("edit-lane"));
    expect(editSublane.length).to.equal(1);
    expect(editSublane.prop("to")).to.equal(
      "/admin/web/lanes/test_library/edit/1"
    );
    expect(editSublane.hasClass("disabled")).to.be.false;

    // The link is disabled if there are lane order changes.
    wrapper.setProps({ lane: laneData, orderChanged: true });
    editSublane = wrapper
      .find(Link)
      .filterWhere((el) => el.find("a").hasClass("edit-lane"));
    expect(editSublane.length).to.equal(1);
    expect(editSublane.prop("to")).to.be.null;
    expect(editSublane.hasClass("disabled")).to.be.true;

    // If the lane isn't expanded, the edit link isn't shown.
    wrapper.setState({ expanded: false });
    editSublane = wrapper
      .find(Link)
      .filterWhere((el) => el.find("a").hasClass("edit-lane"));
    expect(editSublane.length).to.equal(0);
  });

  it("shows a lane", () => {
    // The lane is already showing.
    let showButton = wrapper.find(".show-lane").hostNodes();
    expect(showButton.length).to.equal(0);

    wrapper.setState({ visible: false });
    showButton = wrapper.find(".show-lane").hostNodes();
    expect(showButton.length).to.equal(1);
    expect(showButton.text()).to.contain("Hidden");
    expect(showButton.find("svg title").text()).to.equal("Hidden Icon");
    showButton.simulate("click");
    expect(wrapper.state()["visible"]).to.be.true;

    // If the lane has a hidden parent, it can't be shown.
    wrapper.setProps({ parent: { visible: false } });
    wrapper.setState({ expanded: true, visible: false });
    showButton = wrapper.find(".show-lane").hostNodes();
    expect(showButton.length).to.equal(1);
    expect(showButton.prop("disabled")).to.be.true;
    // Clicking the show button doesn't do anything; it's disabled.
    showButton.simulate("click");
    expect(wrapper.state()["visible"]).to.be.false;

    // If lane order has changed, all of the show buttons are disabled.
    wrapper.setProps({ parent: null, orderChanged: true });
    wrapper.setState({ visible: false });
    showButton = wrapper.find(".show-lane").hostNodes();
    expect(showButton.length).to.equal(1);
    expect(showButton.prop("disabled")).to.be.true;
    // Clicking the show button doesn't do anything; it's disabled.
    showButton.simulate("click");
    expect(wrapper.state()["visible"]).to.be.false;
  });
  it("hides a lane", () => {
    let hideButton = wrapper.find(".hide-lane").hostNodes();
    expect(hideButton.length).to.equal(1);
    expect(hideButton.text()).to.contain("Visible");
    expect(hideButton.find("svg title").text()).to.equal("Visible Icon");
    hideButton.simulate("click");
    expect(wrapper.state()["visible"]).to.be.false;

    // If lane order has changed, all of the hide buttons are disabled.
    wrapper.setProps({ orderChanged: true });
    wrapper.setState({ visible: true });
    hideButton = wrapper.find(".hide-lane").hostNodes();
    expect(hideButton.length).to.equal(1);
    expect(hideButton.prop("disabled")).to.be.true;
    // Clicking the hide button doesn't do anything; it's disabled.
    hideButton.simulate("click");
    expect(wrapper.state()["visible"]).to.be.true;
  });
});
