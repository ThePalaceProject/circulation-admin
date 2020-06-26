import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import AnnouncementsSection from "../AnnouncementsSection";

describe("AnnouncementsSection", () => {
  let wrapper;
  let announcements = [
    {
      content: "First Announcement",
      start: "2020-05-12",
      finish: "2020-06-12",
      id: 1
    },
    {
      content: "Second Announcement",
      start: "2020-05-28",
      finish: "2020-06-28",
      id: 2
    }
  ];
  let setting = {
    description: "announcements",
    format: "date-range",
    key: "announcements",
    label: "Announcements",
    type: "list"
  };

  beforeEach(() => {
    wrapper = mount(
      <AnnouncementsSection setting={setting} value={announcements} />
    );
  });
  it("renders a list of announcements", () => {
    let list = wrapper.find(".announcements-ul");
    let announcement1 = list.find(".announcement").at(0);
    let announcement2 = list.find(".announcement").at(1);
    expect(announcement1.find("span").text()).to.equal("First Announcement");
    expect(announcement1.find(".dates").text()).to.equal("05/12/2020 – 06/12/2020");
    expect(announcement2.find("span").text()).to.equal("Second Announcement");
    expect(announcement2.find(".dates").text()).to.equal("05/28/2020 – 06/28/2020");
  });
  it("renders a form", () => {
    expect(wrapper.find(".announcement-form").length).to.equal(1);
  });
  it("adds an announcement", () => {
    expect(wrapper.state().currentAnnouncements.length).to.equal(2);
    expect(wrapper.find(".announcement").length).to.equal(2);
    let form = wrapper.find(".announcement-form");
    let textarea = form.find("textarea");
    textarea.getDOMNode().value = "Third Announcement";
    textarea.simulate("change");
    form.find("button").at(0).simulate("click");
    expect(wrapper.state().currentAnnouncements.length).to.equal(3);
    expect(wrapper.find(".announcement").length).to.equal(3);

  });
  it("edits an announcement", () => {
    expect(wrapper.state().editing).to.be.undefined;
    expect(wrapper.state().currentAnnouncements.length).to.equal(2);
    expect(wrapper.find(".announcement").length).to.equal(2);
    let editButton = wrapper.find("button").at(0);
    expect(editButton.text()).to.equal("Edit");
    editButton.simulate("click");
    expect(wrapper.state().editing.content).to.equal("First Announcement");
    expect(wrapper.state().editing.start).to.equal("2020-05-12");
    expect(wrapper.state().editing.finish).to.equal("2020-06-12");
    expect(wrapper.state().currentAnnouncements.length).to.equal(1);
    expect(wrapper.state().currentAnnouncements[0].content).to.equal("Second Announcement");
    expect(wrapper.find(".announcement").length).to.equal(1);
  });
  it("deletes an announcement", () => {
    let confirmStub = stub(window, "confirm").returns(true);
    expect(wrapper.state().currentAnnouncements.length).to.equal(2);
    expect(wrapper.find(".announcement").length).to.equal(2);
    let deleteButton = wrapper.find("button").at(1);
    expect(deleteButton.text()).to.equal("Delete");
    deleteButton.simulate("click");
    expect(wrapper.state().currentAnnouncements.length).to.equal(1);
    expect(wrapper.find(".announcement").length).to.equal(1);
    expect(wrapper.find(".announcement").at(0).text()).to.contain("Second Announcement");
    confirmStub.restore();
  });
});
