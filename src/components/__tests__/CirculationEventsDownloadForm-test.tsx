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

  it("shows start and end date inputs", () => {
    let start = wrapper.find("input[name='start']");
    expect(start.length).toBe(1);
    let end = wrapper.find("input[name='end']");
    expect(end.length).toBe(1);
  });

  it("shows download and close buttons", () => {
    let buttons = wrapper.find("button");
    expect(buttons.length).toBe(2);
    expect(buttons.at(0).text()).toBe("Download");
    expect(buttons.at(1).text()).toBe("Close");
  });
});