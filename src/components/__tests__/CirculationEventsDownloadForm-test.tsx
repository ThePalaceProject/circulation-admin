import { expect } from "chai";
import { stub } from "sinon";
import { Button } from "library-simplified-reusable-components";
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
    let buttons = wrapper.find(Button);
    expect(buttons.length).to.equal(2);
    expect(buttons.at(0).prop("content")).to.equal("Download");
    expect(buttons.at(1).prop("content")).to.equal("Close");
  });
});
