jest.autoMockOff();

import * as React from "react";
import { shallow } from "enzyme";

import CirculationEventsDownloadForm from "../CirculationEventsDownloadForm";

describe("CirculationEventsDownloadForm", () => {
  let wrapper;
  let hide;

  beforeEach(() => {
    hide = jest.genMockFunction();
    wrapper = shallow(
      <CirculationEventsDownloadForm show={true} hide={hide} />
    );
  });

  it("shows date input", () => {
    let date = wrapper.find("input[type='date']");
    expect(date.length).toBe(1);
  });

  it("shows download and close buttons", () => {
    let buttons = wrapper.find("button");
    expect(buttons.length).toBe(2);
    expect(buttons.at(0).text()).toBe("Download");
    expect(buttons.at(1).text()).toBe("Close");
  });
});