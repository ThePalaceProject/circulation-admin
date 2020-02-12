import { expect } from "chai";
import * as React from "react";
import { shallow, mount } from "enzyme";

import Footer from "../Footer";
import { TOSContextProvider } from "../TOSContext";

describe("Footer", () => {
  let wrapper;
  let context;
  beforeEach(() => {
    context = ["Terms of Service Text", "terms_of_service"];
    wrapper = mount(
      <TOSContextProvider value={["Terms of Service Text", "terms_of_service"]}>
        <Footer />
      </TOSContextProvider>
    );
  });
  it("displays a link", () => {
    let linkElement = wrapper.find("p").find("a");
    expect(linkElement.length).to.equal(1);
    expect(linkElement.text()).to.equal("Terms of Service Text");
    expect(linkElement.prop("href")).to.equal("terms_of_service");
  });
  it("accepts an optional className prop", () => {
    wrapper = mount(
      <TOSContextProvider value={["Terms of Service Text", "terms_of_service"]}>
        <Footer className="customClass" />
      </TOSContextProvider>
    );
    expect(wrapper.hasClass("customClass")).to.be.true;
  });
});
