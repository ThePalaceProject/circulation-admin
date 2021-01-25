/* eslint-disable @typescript-eslint/camelcase */
import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";
import { PluginData, LibraryData } from "../../interfaces";
import buildStore from "../../store";

import { PluginListsSidebar } from "../PluginListSidebar";

describe("Testing PluginListSidebar.tsx", () => {
  let wrapper;
  let fetchPlugins;
  let pluginData;
  let context;

  beforeEach(() => {
    fetchPlugins = stub().resolves();

    const store = buildStore();
    context = {
      editorStore: store,
      csrfToken: "token",
    };
  });

  it("without plugin installed", () => {
    const testLibrary = { short_name: "test-library" } as LibraryData;
    const testPlugin = undefined;

    pluginData = [] as PluginData[];

    wrapper = mount(
      <PluginListsSidebar
        activePlugin={testPlugin}
        library={testLibrary}
        plugins={pluginData}
        fetchPlugins={fetchPlugins}
      />,
      context
    );

    wrapper.setState({ fetched: true });

    const pluginEntries = wrapper.find(".plugin-entry");
    expect(pluginEntries.length).to.equal(0);
  });

  it("with one plugin", () => {
    const testLibrary = { short_name: "test-library" } as LibraryData;
    const testPlugin = undefined;

    pluginData = [{ name: "list-plugin" }] as PluginData[];

    wrapper = mount(
      <PluginListsSidebar
        activePlugin={testPlugin}
        library={testLibrary}
        plugins={pluginData}
        fetchPlugins={fetchPlugins}
      />,
      context
    );

    wrapper.setState({ fetched: true });

    const pluginEntries = wrapper.find(".plugin-entry");
    expect(pluginEntries.length).to.equal(1);
  });

  it("with two plugins", () => {
    const testLibrary = { short_name: "test-library" } as LibraryData;
    const testPlugin = undefined;

    pluginData = [
      { name: "first-plugin" },
      { name: "second-plugin" },
    ] as PluginData[];

    wrapper = mount(
      <PluginListsSidebar
        activePlugin={testPlugin}
        library={testLibrary}
        plugins={pluginData}
        fetchPlugins={fetchPlugins}
      />,
      context
    );

    wrapper.setState({ fetched: true });

    const pluginEntries = wrapper.find(".plugin-entry");
    expect(pluginEntries.length).to.equal(2);
  });

  it("with active plugin", () => {
    const testLibrary = { short_name: "test-library" } as LibraryData;
    const testPlugin = { name: "second-plugin" } as PluginData;

    pluginData = [
      { name: "first-plugin" },
      { name: "second-plugin" },
    ] as PluginData[];

    wrapper = mount(
      <PluginListsSidebar
        activePlugin={testPlugin}
        library={testLibrary}
        plugins={pluginData}
        fetchPlugins={fetchPlugins}
      />,
      context
    );

    wrapper.setState({ fetched: true });

    const pluginEntries = wrapper.find(".active");
    expect(pluginEntries.length).to.equal(1);
  });
});
