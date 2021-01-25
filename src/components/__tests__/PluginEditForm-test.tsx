import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";
import { PluginConfig } from "../../interfaces";
import buildStore from "../../store";

import PluginEditForm from "../PluginEditForm";
import { Form } from "library-simplified-reusable-components";

describe("Testing PluginEditForm.tsx", () => {
  let wrapper;
  let library;
  let updatePlugin;
  let context;

  beforeEach(() => {
    const store = buildStore();
    context = {
      editorStore: store,
      csrfToken: "token",
      skip: false,
    };
  });

  it("doesnt expect config", () => {
    updatePlugin = stub().resolves();

    const plugin = {
      name: "a-plugin",
      lib: "a-lib",
      fields: [],
    } as PluginConfig;

    wrapper = shallow(
      <PluginEditForm
        library={library}
        plugin={plugin}
        updatePlugin={updatePlugin}
      />,
      context
    );

    wrapper.setState({
      fetched: true,
      pluginConfig: plugin,
    });

    const pluginWithoutConfig = wrapper.find(".plugin-without-config");
    expect(pluginWithoutConfig.length).to.equal(1);

    const errorWrapper = wrapper.find(".error-alert");
    expect(errorWrapper.length).to.equal(0);
  });

  it("cannot save", () => {
    updatePlugin = stub().rejects();

    const plugin = {
      name: "a-plugin",
      lib: "a-lib",
      fields: [],
    } as PluginConfig;

    wrapper = shallow(
      <PluginEditForm
        library={library}
        plugin={plugin}
        updatePlugin={updatePlugin}
      />,
      context
    );

    wrapper.setState({
      fetched: true,
      pluginConfig: plugin,
    });

    wrapper.setState({ error: true });

    const errorWrapper = wrapper.find(".error-alert");
    expect(errorWrapper.length).to.equal(1);
  });

  it("expect fields", () => {
    updatePlugin = stub().resolves();

    const plugin = {
      name: "a-plugin",
      lib: "a-lib",
      fields: [
        {
          key: "field-key",
          label: "field-label",
          required: false,
        },
      ],
    } as PluginConfig;

    wrapper = shallow(
      <PluginEditForm
        library={library}
        plugin={plugin}
        updatePlugin={updatePlugin}
      />,
      context
    );

    wrapper.setState({
      fetched: true,
      pluginConfig: plugin,
    });

    const pluginWithoutConfig = wrapper.find(".plugin-without-config");
    expect(pluginWithoutConfig.length).to.equal(0);

    const errorWrapper = wrapper.find(".error-alert");
    expect(errorWrapper.length).to.equal(0);

    const formWrapper = wrapper.find(Form);
    expect(formWrapper.length).to.equal(1);
  });
});
