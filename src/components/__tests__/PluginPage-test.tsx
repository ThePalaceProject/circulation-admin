/* eslint-disable @typescript-eslint/camelcase */
import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";
import { PluginData, LibraryData } from "../../interfaces";
import { Plugin } from "../Plugin";
import buildStore from "../../store";

import PluginPage from "../PluginPage";

describe("Testing PluginPage.tsx", () => {
  let wrapper;
  let context;

  beforeEach(() => {
    const store = buildStore();
    context = {
      editorStore: store,
      csrfToken: "token",
    };
  });

  it("without plugin", () => {
    const params = {
      library: "some-library",
      plugin: undefined,
    };

    wrapper = shallow(<PluginPage params={params} />, context);

    const sideBar = wrapper.find(Plugin);
    expect(sideBar.length).to.equal(1);
  });

  it("with plugin", () => {
    const params = {
      library: "some-library",
      plugin: "a plugin",
    };

    wrapper = shallow(<PluginPage params={params} />, context);

    const targetLibraryObject = {
      name: undefined,
      short_name: params.library,
    } as LibraryData;
    const targetPluginObject = { name: params.plugin } as PluginData;

    const sideBar = wrapper.find(Plugin);
    expect(sideBar.length).to.equal(1);
    expect(sideBar.prop("library").short_name).to.equal(
      targetLibraryObject.short_name
    );
    expect(sideBar.prop("plugin").name).to.equal(targetPluginObject.name);
  });
});
