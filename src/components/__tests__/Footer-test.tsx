import { expect } from "chai";
import * as React from "react";
import { shallow } from "enzyme";

import Footer from "../Footer";

describe("Footer", () => {
  let wrapper;
  let context;
  beforeEach(() => {
    context = { tos_link_text: "Terms of Service Text", tos_link_href: "terms_of_service" };
    wrapper = shallow(<Footer />, { context });
  });
  it("displays a list with a default link", () => {
    let linkElement = wrapper.find("p").find("a");
    expect(linkElement.length).to.equal(1);
    expect(linkElement.text()).to.equal("Terms of Service Text");
    expect(linkElement.prop("href")).to.equal("terms_of_service");
  });
  it("accepts an optional className prop", () => {
    wrapper.setProps({ "className": "customClass" });
    expect(wrapper.hasClass("customClass")).to.be.true;
  });
});
