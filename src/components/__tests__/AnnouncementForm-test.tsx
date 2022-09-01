/* eslint-disable */
import { expect } from "chai";
import { stub, spy } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import AnnouncementForm from "../AnnouncementForm";
import EditableInput from "../EditableInput";

describe("AnnouncementForm", () => {
  let wrapper;
  let add;
  beforeEach(() => {
    add = stub();
    wrapper = mount(<AnnouncementForm add={add} />);
  });
  it("renders the input fields", () => {
    let fields = wrapper.find(EditableInput);
    expect(fields.length).to.equal(3);
    checkDefaultValues();

    let contentField = fields.at(0);
    expect(contentField.props().elementType).to.equal("textarea");
    expect(contentField.props().minLength).to.equal(15);
    expect(contentField.props().maxLength).to.equal(350);
    expect(contentField.props().label).to.equal(
      "New Announcement Text (15-350 characters)"
    );
    expect(contentField.props().description).to.equal(
      "(Current length: 0/350)"
    );

    let startDateField = fields.at(1);
    expect(startDateField.props().type).to.equal("date");
    expect(startDateField.props().label).to.equal("Start Date");
    expect(startDateField.props().description).to.equal(
      "If no start date is chosen, the default start date is today's date."
    );

    let endDateField = fields.at(2);
    expect(endDateField.props().type).to.equal("date");
    expect(endDateField.props().label).to.equal("End Date");
    expect(endDateField.props().description).to.equal(
      "If no expiration date is chosen, the default expiration date is 2 months from the start date."
    );
  });
  it("renders the buttons", () => {
    let buttons = wrapper.find("button");
    expect(buttons.length).to.equal(2);
    expect(buttons.at(0).text()).to.equal("Add");
    expect(buttons.at(1).text()).to.equal("Cancel");
  });
  it("keeps track of whether the content is too short or too long", () => {
    let counter = wrapper.find(".description").at(0);
    expect(counter.text()).to.equal("(Current length: 0/350)");
    expect(counter.parent().hasClass("wrong-length")).to.be.true;
    expect(wrapper.find("button").at(0).prop("disabled")).to.be.true;

    fillOutForm();

    counter = wrapper.find(".description").at(0);
    expect(counter.text()).to.equal("(Current length: 66/350)");
    expect(counter.parent().hasClass("wrong-length")).to.be.false;
    expect(wrapper.find("button").at(0).prop("disabled")).not.to.be.true;

    let longString =
      "Here's some extremely/gratuitously long content.  The point of the content is just to get up to 350 characters so that I can test whether the class name will change.  I realize even as I am typing this that it probably would have been a better idea to do it with filler text; oh well...?  Anyway, I have now written the most boring announcement EVER.";
    let contentField = wrapper.find("textarea");
    contentField.getDOMNode().value = longString;
    contentField.simulate("change");

    counter = wrapper.find(".description").at(0);
    expect(counter.text()).to.equal("(Current length: 350/350)");
    expect(counter.parent().hasClass("wrong-length")).to.be.true;
  });
  let fillOutForm = () => {
    checkDefaultState();
    checkDefaultValues();
    expect(add.callCount).to.equal(0);

    let contentString =
      "Here is some sample content which comes out to over 15 characters.";
    let contentField = wrapper.find("textarea");
    contentField.getDOMNode().value = contentString;
    contentField.simulate("change");
    let start = wrapper.find("input").at(0);
    start.getDOMNode().value = "2020-06-01";
    start.simulate("change");
    let finish = wrapper.find("input").at(1);
    finish.getDOMNode().value = "2020-07-01";
    finish.simulate("change");

    expect(wrapper.state().content).to.equal(contentString);
    expect(wrapper.state().start).to.equal("2020-06-01");
    expect(wrapper.state().finish).to.equal("2020-07-01");
  };
  let checkDefaultState = () => {
    expect(wrapper.state().content).to.equal("");
    expect(wrapper.state().start).to.equal(
      wrapper.instance().getDefaultDates()[0]
    );
    expect(wrapper.state().finish).to.equal(
      wrapper.instance().getDefaultDates()[1]
    );
  };
  let checkDefaultValues = () => {
    expect(wrapper.find("textarea").text()).to.equal("");
    expect(wrapper.find("input").at(0).props().value).to.equal(
      wrapper.instance().getDefaultDates()[0]
    );
    expect(wrapper.find("input").at(1).props().value).to.equal(
      wrapper.instance().getDefaultDates()[1]
    );
  };
  it("adds a new announcement", () => {
    fillOutForm();
    wrapper.find("button").at(0).simulate("click");
    expect(add.callCount).to.equal(1);
    expect(add.args[0][0].content).to.equal(
      "Here is some sample content which comes out to over 15 characters."
    );
    expect(add.args[0][0].start).to.equal("2020-06-01");
    expect(add.args[0][0].finish).to.equal("2020-07-01");
  });
  it("cancels adding a new announcement", () => {
    fillOutForm();
    wrapper.find("button").at(1).simulate("click");
    checkDefaultState();
    checkDefaultValues();
  });
  it("edits an existing announcement", () => {
    wrapper.setProps({
      content:
        "Here is some sample content which comes out to over 15 characters.",
      start: "07/01/2020",
      finish: "08/01/2020",
    });
    expect(wrapper.state().content).to.equal(
      "Here is some sample content which comes out to over 15 characters."
    );
    expect(wrapper.state().start).to.equal("2020-07-01");
    expect(wrapper.state().finish).to.equal("2020-08-01");
    expect(wrapper.find("textarea").text()).to.equal(
      "Here is some sample content which comes out to over 15 characters."
    );
    expect(wrapper.find("input").at(0).props().value).to.equal("2020-07-01");
    expect(wrapper.find("input").at(1).props().value).to.equal("2020-08-01");
    let contentField = wrapper.find("textarea");
    contentField.getDOMNode().value =
      "Here is an edited version of the content";
    contentField.simulate("change");
    wrapper.find("button").at(0).simulate("click");
    expect(add.callCount).to.equal(1);
    expect(add.args[0][0].content).to.equal(
      "Here is an edited version of the content"
    );
    checkDefaultState();
    checkDefaultValues();
  });
  it("cancels editing an existing announcement", () => {
    let spyCancel = spy(wrapper.instance(), "cancel");
    wrapper.setProps({
      content:
        "Here is some sample content which comes out to over 15 characters.",
      start: "07/01/2020",
      finish: "08/01/2020",
    });
    expect(wrapper.state().content).to.equal(
      "Here is some sample content which comes out to over 15 characters."
    );
    expect(wrapper.state().start).to.equal("2020-07-01");
    expect(wrapper.state().finish).to.equal("2020-08-01");
    expect(wrapper.find("textarea").text()).to.equal(
      "Here is some sample content which comes out to over 15 characters."
    );
    expect(wrapper.find("input").at(0).props().value).to.equal("2020-07-01");
    expect(wrapper.find("input").at(1).props().value).to.equal("2020-08-01");
    let contentField = wrapper.find("textarea");
    contentField.getDOMNode().value =
      "Here is an edited version of the content";
    contentField.simulate("change");
    wrapper.find("button").at(1).simulate("click");
    expect(add.callCount).to.equal(1);
    expect(add.args[0][0].content).to.equal(
      "Here is an edited version of the content"
    );
    expect(spyCancel.callCount).to.equal(1);
    checkDefaultState();
    checkDefaultValues();
    spyCancel.restore();
  });
});
