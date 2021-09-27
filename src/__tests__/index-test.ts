import { expect } from "chai";
import { spy } from "sinon";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { mount } from "enzyme";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CirculationAdmin = require("../index");
import SetupPage from "../components/SetupPage";
import { Router } from "react-router";

describe("CirculationAdmin", () => {
  it("renders Setup", () => {
    const renderSpy = spy(ReactDOM, "render");
    new CirculationAdmin({ settingUp: true });
    expect(renderSpy.callCount).to.equal(1);
    const component = renderSpy.args[0][0];
    const wrapper = mount(component);
    const setup = wrapper.find(SetupPage);
    expect(setup.length).to.equal(1);
    renderSpy.restore();
  });

  it("renders Router", () => {
    const renderSpy = spy(ReactDOM, "render");
    new CirculationAdmin({});
    expect(renderSpy.callCount).to.equal(1);
    const component = renderSpy.args[0][0];
    const wrapper = mount(component);
    const router = wrapper.find(Router);
    expect(router.length).to.equal(1);
    renderSpy.restore();
  });
});
