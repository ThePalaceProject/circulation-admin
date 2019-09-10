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
    let linkElement = wrapper.find("a");
    expect(linkElement.length).to.equal(1);
    expect(linkElement.text()).to.equal("Terms of Service for presenting e-reading materials through NYPL's SimplyE mobile app");
    expect(linkElement.prop("href")).to.equal("https://www.librarysimplified.org/SimplyETermsofService2.html");
  });
  it("accepts an optional className prop", () => {
    wrapper.setProps({ "className": "sticky" });
    expect(wrapper.hasClass("sticky")).to.be.true;
  });
  it("accepts an optional links prop", () => {
    let links = {
      "Link 1": "www.link1.html",
      "Link 2": "www.link2.html",
      "Link 3": "www.link3.html"
    };
    wrapper.setProps({ links });
    let linkElements = wrapper.find("a");
    expect(linkElements.length).to.equal(3);
    linkElements.map((el, idx) => {
      expect(el.text()).to.equal(`Link ${idx + 1}`);
      expect(el.prop("href")).to.equal(`www.link${idx + 1}.html`);
    });
  });
});
