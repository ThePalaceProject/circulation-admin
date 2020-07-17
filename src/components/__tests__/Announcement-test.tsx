import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import Announcement from "../Announcement";

describe("Announcement", () => {
  let wrapper;
  let stubDelete = stub();
  let stubEdit = stub();
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
    expect(wrapper.find("section").at(0).prop("className")).to.equal("announcement-info");
    let dates = wrapper.find(".dates");
    expect(dates.text()).to.equal("05/12/2020 – 05/28/2020");
    let content = wrapper.find("span");
    expect(content.text()).to.equal("test");
  });
  it("renders an edit button", () => {
    let editButton = wrapper.find(".buttons").children().at(0);
    expect(editButton.text()).to.equal("Edit");
    editButton.simulate("click");
    expect(stubEdit.callCount).to.equal(1);
    expect(stubEdit.args[0][0]).to.equal("1");
  });
  it("renders a delete button", () => {
    let deleteButton = wrapper.find(".buttons").children().at(1);
    expect(deleteButton.text()).to.equal("Delete");
    deleteButton.simulate("click");
    expect(stubDelete.callCount).to.equal(1);
    expect(stubDelete.args[0][0]).to.equal("1");
  });
  it("formats dates", () => {
    let date = "2020-03-14";
    expect(wrapper.instance().format(date)).to.equal("03/14/2020");
  });
});
