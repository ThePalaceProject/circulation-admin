import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import DiagnosticsPage from "../DiagnosticsPage";
import Header from "../Header";

describe("DiagnosticsPage", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<DiagnosticsPage />);
  });

  it("renders a Header", () => {
    let header = wrapper.find(Header);
    expect(header.length).to.equal(1);
  });
});
