import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";
import { PluginConfig } from "../../interfaces";
import buildStore from "../../store";

import { PluginEditor } from "../PluginEditor";
import PluginEditForm from "../PluginEditForm";

describe("Testing PluginEditor.tsx", () => {
  let wrapper;
  let library;
  let fetchData;
  let updatePlugin;
  let context;

  beforeEach(() => {
    fetchData = stub().resolves();
    updatePlugin = stub().resolves();

    const store = buildStore();
    context = {
      editorStore: store,
      csrfToken: "token",
    };
  });

  it("no plugin selected", () => {
    const plugin = undefined as PluginConfig;

    wrapper = mount(
      <PluginEditor
        library={library}
        plugin={plugin}
        fetchData={fetchData}
        updatePlugin={updatePlugin}
      />,
      context
    );

    wrapper.setState({ fetched: true });

    const missingPlugin = wrapper.find(".missing-plugin");
    expect(missingPlugin.length).to.equal(1);

    const pluginEditFormWrapper = wrapper.find(PluginEditForm);
    expect(pluginEditFormWrapper.length).to.equal(0);
  });

  it("plugin exist", () => {
    const plugin = {
      name: "a-plugin",
      lib: "a-lib",
      fields: [],
    } as PluginConfig;

    wrapper = mount(
      <PluginEditor
        library={library}
        plugin={plugin}
        fetchData={fetchData}
        updatePlugin={updatePlugin}
      />,
      context
    );
    wrapper.setState({
      fetched: true,
      pluginConfig: plugin,
    });

    const missingPlugin = wrapper.find(".missing-plugin");
    expect(missingPlugin.length).to.equal(0);

    const pluginEditFormWrapper = wrapper.find(PluginEditForm);
    expect(pluginEditFormWrapper.length).to.equal(1);
  });
});
