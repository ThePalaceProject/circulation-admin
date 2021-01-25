import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";
import { PluginData, LibraryData } from "../../interfaces";
import PluginListsSidebar from "./../PluginListSidebar";
import PluginEditor from "./../PluginEditor";

import { Plugin } from "../Plugin";

describe("Testing Plugin.tsx", () => {
  let wrapper;

  it("open the plugin component", () => {
    const testLibrary = {} as LibraryData;
    const testPlugin = {} as PluginData;

    wrapper = shallow(<Plugin library={testLibrary} plugin={testPlugin} />);
    const sideBar = wrapper.find(PluginListsSidebar);
    expect(sideBar.length).to.equal(1);

    const editor = wrapper.find(PluginEditor);
    expect(editor.length).to.equal(1);
  });
});
