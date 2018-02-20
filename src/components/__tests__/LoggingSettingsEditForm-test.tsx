import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import LoggingSettingEditForm from "../LoggingSettingEditForm";
import EditableInput from "../EditableInput";

describe("LoggingSettingEditForm", () => {
  let wrapper;
  let editLoggingSetting;
  let settingData = {
    key: "test_key",
    value: "value"
  };
  let allSettings = [
    {
      key: "test_key",
      label: "test label",
      options: [{ key: "test inner key", value: "test inner label", label: "some label" }],
    },
    { key: "other_key1", label: "label1", options: [] },
    { key: "other_key2", label: "label2", options: [] }
  ];
  let settingsData = {
    settings: [settingData],
    all_settings: allSettings
  };

  let editableInputByName = (name) => {
    let inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere(input => input.props().name === name);
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      editLoggingSetting = stub();
      wrapper = shallow(
        <LoggingSettingEditForm
          data={settingsData}
          disabled={false}
          editItem={editLoggingSetting}
          urlBase="url base"
          listDataKey="settings"
          />
      );
    });

    it("renders message if there are no remaining fields", () => {
      let data = {
        settings: [settingData],
        all_settings: [allSettings[0]]
      };
      wrapper = shallow(
        <LoggingSettingEditForm
          data={data}
          disabled={false}
          editItem={editLoggingSetting}
          urlBase="url base"
          listDataKey="settings"
          />
      );
      let message = wrapper.find("p");
      expect(wrapper.text()).to.contain("All logging settings");

      let input = wrapper.find("input[name=\"csrf_token\"]");
      expect(input.length).to.equal(0);
    });

    it("renders key", () => {
      let input = editableInputByName("key");
      expect(input.props().value).not.to.be.ok;
      expect(input.props().readOnly).to.equal(false);
      let children = input.find("option");
      expect(children.length).to.equal(3);
      expect(children.at(0).text()).to.contain("None");
      expect(children.at(1).text()).to.contain("label1");
      expect(children.at(2).text()).to.contain("label2");

      wrapper.setProps({ item: settingData });
      input = editableInputByName("key");
      expect(input.props().value).to.equal("test_key");
      expect(input.props().readOnly).to.equal(true);
      children = input.find("option");
      expect(children.length).to.equal(2);
    });

    it("renders value", () => {
      let input = editableInputByName("value");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: settingData });
      input = editableInputByName("value");
      expect(input.props().value).to.equal("value");
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      editLoggingSetting = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <LoggingSettingEditForm
          data={settingsData}
          disabled={false}
          editItem={editLoggingSetting}
          urlBase="url base"
          listDataKey="settings"
          />
      );
    });

    it("submits data", () => {
      wrapper.setProps({ item: settingData });

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editLoggingSetting.callCount).to.equal(1);
      let formData = editLoggingSetting.args[0][0];
      expect(formData.get("key")).to.eql({ value: "test_key" });
      expect(formData.get("value")).to.eql({ value: "" });
    });
  });
});
