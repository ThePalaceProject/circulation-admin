import { expect } from "chai";
import { stub } from "sinon";
import { Button } from "library-simplified-reusable-components";
import * as React from "react";
import { mount } from "enzyme";

import CirculationEventsDownloadForm from "../CirculationEventsDownloadForm";

describe("CirculationEventsDownloadForm", () => {
  let wrapper;
  let hide;

  beforeEach(() => {
    hide = stub();
    wrapper = mount(<CirculationEventsDownloadForm show={true} hide={hide} />);
  });

  it("renders a select element", () => {
    const select = wrapper.find("select");
    const textInput = wrapper.find("input[name='locations']");

    expect(select.length).to.equal(1);
    expect(textInput.length).to.equal(0);
  });

  it("renders a text input when 'locations' is selected", () => {
    const select = wrapper.find("select");
    let textInput = wrapper.find("input[name='locations']");

    expect(textInput.length).to.equal(0);
    select.getDOMNode().value = "locations";
    select.simulate("change");

    textInput = wrapper.find("input[name='locations']");
    expect(textInput.length).to.equal(1);

    select.getDOMNode().value = "all";
    select.simulate("change");

    textInput = wrapper.find("input[name='locations']");
    expect(textInput.length).to.equal(0);

    // Manually testing the `toggleLocationsInput` function
    // without simulation the select element.
    select.getDOMNode().value = "locations";
    (wrapper.instance() as any).toggleLocationsInput();
    wrapper.update();

    textInput = wrapper.find("input[name='locations']");
    expect(textInput.length).to.equal(1);
  });

  it("renders start date and end date inputs", () => {
    const dates = wrapper.find("input[type='date']");
    expect(dates.length).to.equal(2);
    expect(dates.at(0).props().name).to.equal("dateStart");
    expect(dates.at(1).props().name).to.equal("dateEnd");
  });

  it("renders download and close buttons", () => {
    const buttons = wrapper.find(Button);
    expect(buttons.length).to.equal(2);
    expect(buttons.at(0).prop("content")).to.equal("Download");
    expect(buttons.at(1).prop("content")).to.equal("Close");

    buttons.at(1).simulate("click");

    expect(hide.calledOnce).to.be.true;
  });
});
