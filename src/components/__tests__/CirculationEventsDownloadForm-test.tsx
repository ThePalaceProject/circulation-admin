import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import CirculationEventsDownloadForm from "../CirculationEventsDownloadForm";

describe("CirculationEventsDownloadForm", () => {
  let wrapper;
  let hide;

  beforeEach(() => {
    hide = stub();
    wrapper = shallow(
      <CirculationEventsDownloadForm show={true} hide={hide} />
    );
  });

  it("shows date input", () => {
    let date = wrapper.find("input[type='date']");
    expect(date.length).to.equal(1);
  });

  it("shows download and close buttons", () => {
    let buttons = wrapper.find("button");
    expect(buttons.length).to.equal(2);
    expect(buttons.at(0).text()).to.equal("Download");
    expect(buttons.at(1).text()).to.equal("Close");
  });
});