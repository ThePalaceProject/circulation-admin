import { expect } from "chai";

import * as React from "react";
import { mount } from "enzyme";

import UpdatingLoader from "../UpdatingLoader";

describe("UpdatingLoader", () => {
  it("should only render a container", () => {
    const wrapper = mount(
      <UpdatingLoader show={false} />
    );

    const container = wrapper.find(".updating-loader-container");
    const loader = wrapper.find(".updating-loader");
    expect(container.length).to.equal(1);
    expect(loader.length).to.equal(0);
  });

  it("should render a container and the updating message", () => {
    const wrapper = mount(
      <UpdatingLoader show={true} />
    );

    const container = wrapper.find(".updating-loader-container");
    const loader = wrapper.find(".updating-loader");
    expect(container.length).to.equal(1);
    expect(loader.length).to.equal(1);
  });

  it("should render passed in text", () => {
    const wrapper = mount(
      <UpdatingLoader show={true} text="Doing something" />
    );

    const container = wrapper.find(".updating-loader-container");
    const loader = wrapper.find(".updating-loader");
    expect(container.length).to.equal(1);
    expect(loader.length).to.equal(1);
    expect(loader.text()).to.equal("Doing something");
  });
});
