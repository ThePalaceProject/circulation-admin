import { expect } from "chai";
import * as React from "react";
import { shallow } from "enzyme";

import Footer from "../Footer";

describe("Footer", () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<Footer />);
  });
  it("displays a link", () => {
    let link = wrapper.find("a");
    expect(link.length).to.equal(1);
    expect(link.text()).to.equal("Terms of Service");
    expect(link.prop("href")).to.equal("http://www.librarysimplified.org/EULA.html");
  });
});
