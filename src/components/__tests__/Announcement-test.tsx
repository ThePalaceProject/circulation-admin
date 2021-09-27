import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import Announcement from "../Announcement";

describe("Announcement", () => {
  let wrapper;
  const stubDelete = stub();
  const stubEdit = stub();
  beforeEach(() => {
    wrapper = mount(
      <Announcement
        content="test"
        start="2020-05-12"
        finish="2020-05-28"
        id="1"
        delete={stubDelete}
        edit={stubEdit}
      />
    );
  });
  it("renders the content and dates", () => {
    expect(wrapper.find("section").at(0).prop("className")).to.equal(
      "announcement-info"
    );
    const dates = wrapper.find(".dates");
    expect(dates.text()).to.equal("05/12/2020 – 05/28/2020");
    const content = wrapper.find("span");
    expect(content.text()).to.equal("test");
  });
  it("renders an edit button", () => {
    const editButton = wrapper.find(".buttons").children().at(0);
    expect(editButton.text()).to.equal("Edit");
    editButton.simulate("click");
    expect(stubEdit.callCount).to.equal(1);
    expect(stubEdit.args[0][0]).to.equal("1");
  });
  it("renders a delete button", () => {
    const deleteButton = wrapper.find(".buttons").children().at(1);
    expect(deleteButton.text()).to.equal("Delete");
    deleteButton.simulate("click");
    expect(stubDelete.callCount).to.equal(1);
    expect(stubDelete.args[0][0]).to.equal("1");
  });
  it("formats dates", () => {
    const date = "2020-03-14";
    expect(wrapper.instance().format(date)).to.equal("03/14/2020");
  });
});
