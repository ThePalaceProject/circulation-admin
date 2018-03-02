import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import SitewideSettingEditForm from "../SitewideSettingEditForm";
import EditableInput from "../EditableInput";

describe("SitewideSettingEditForm", () => {
  let wrapper;
  let editSitewideSetting;
  let settingData = {
    key: "test_key",
    value: "value",
  };
  let settingDataWithDescription = {
    key: "other_key1",
    label: "label1",
    description: "some description",
  };
  let allSettings = [
    { key: "test_key", label: "label" },
    { key: "other_key1", label: "label1", description: "some description" },
    { key: "other_key2", label: "label2" }
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
      editSitewideSetting = stub();
      wrapper = shallow(
        <SitewideSettingEditForm
          data={settingsData}
          disabled={false}
          editItem={editSitewideSetting}
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
        <SitewideSettingEditForm
          data={data}
          disabled={false}
          editItem={editSitewideSetting}
          urlBase="url base"
          listDataKey="settings"
          />
      );
      let message = wrapper.find("p");
      expect(wrapper.text()).to.contain("All sitewide settings");

      let input = wrapper.find("input[name=\"csrf_token\"]");
      expect(input.length).to.equal(0);
    });

    it("renders key", () => {
      let input = editableInputByName("key");
      expect(input.props().value).not.to.be.ok;
      expect(input.props().readOnly).to.equal(false);
      let children = input.find("option");
      expect(children.length).to.equal(2);
      expect(children.at(0).text()).to.contain("label1");
      expect(children.at(1).text()).to.contain("label2");

      wrapper.setProps({ item: settingData });
      input = editableInputByName("key");
      expect(input.props().value).to.equal("test_key");
      expect(input.props().readOnly).to.equal(true);
      children = input.find("option");
      expect(children.length).to.equal(1);
    });

    it("renders value", () => {
      let input = editableInputByName("value");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: settingData });
      input = editableInputByName("value");
      expect(input.props().value).to.equal("value");
    });

    it("should render a description", () => {
      wrapper.setProps({ item: settingDataWithDescription });
      const description = wrapper.find(".description");

      expect(description.length).to.equal(1);
      expect(description.prop("dangerouslySetInnerHTML")).to.eql({ __html: "some description" });
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      editSitewideSetting = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <SitewideSettingEditForm
          data={settingsData}
          disabled={false}
          editItem={editSitewideSetting}
          urlBase="url base"
          listDataKey="settings"
          />
      );
    });

    it("submits data", () => {
      wrapper.setProps({ item: settingData });

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editSitewideSetting.callCount).to.equal(1);
      let formData = editSitewideSetting.args[0][0];
      expect(formData.get("key")).to.equal("test_key");
      expect(formData.get("value")).to.equal("value");
    });
  });
});
