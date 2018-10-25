import { expect } from "chai";
import { stub, spy } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import SitewideSettingEditForm from "../SitewideSettingEditForm";
import EditableInput from "../EditableInput";

describe("SitewideSettingEditForm", () => {
  let wrapper;
  let save;
  let settingData = {
    key: "test_key",
    value: "value",
  };
  let settingDataWithDescription = {
    key: "other_key1",
    value: "label1",
    description: "some description",
  };
  let settingDataWithSelect = {
    key: "other_key2",
    value: "label2",
  };
  let allSettings = [
    { key: "test_key", label: "label" },
    { key: "other_key1", label: "label1", description: "some description" },
    {
      key: "other_key2",
      label: "label2",
      type: "select",
      options: [
        { key: "select_key1", label: "select label1" },
        { key: "select_key2", label: "select label2" },
        { key: "select_key3", label: "select label3" },
        { key: "select_key4", label: "select label4" },
      ]
    }
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
      save = stub();
      wrapper = shallow(
        <SitewideSettingEditForm
          data={settingsData}
          disabled={false}
          save={save}
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
          save={save}
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

    it("should render a select value option", () => {
      wrapper.setProps({ item: settingDataWithSelect });
      wrapper.setState({ inputKey: "other_key2" });

      let firstSelect = editableInputByName("key");
      let dynamicSelect = editableInputByName("value");
      expect(firstSelect.props().value).to.equal("other_key2");
      expect(dynamicSelect.props().value).to.equal("label2");
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      save = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <SitewideSettingEditForm
          data={settingsData}
          disabled={false}
          save={save}
          urlBase="url base"
          listDataKey="settings"
          />
      );
    });

    it("calls save when the save button is clicked", () => {
      let saveButton = wrapper.find("SaveButton");
      saveButton.simulate("click");
      expect(save.callCount).to.equal(1);
    });

    it("calls save when the form is submitted directly", () => {
      let form = wrapper.find("form");
      form.simulate("submit");
      expect(save.callCount).to.equal(1);
    });

    it("submits data", () => {
      wrapper.setProps({ item: settingData });

      let saveButton = wrapper.find("SaveButton");
      saveButton.simulate("click");

      expect(save.callCount).to.equal(1);
      let formData = save.args[0][0];
      expect(formData.get("key")).to.equal("test_key");
      expect(formData.get("value")).to.equal("value");
    });

    let fillOutFormFields = () => {
      wrapper.setProps({ item: settingData });
      let input = wrapper.find("input[name='value']");
      let inputElement = input.get(0);
      inputElement.value = "new setting";
      input.simulate("change");
    };

    it("clears the form", () => {
      fillOutFormFields();
      let select = wrapper.find("select[name='key']");
      expect(select.props().value).to.equal("test_key");

      let input = wrapper.find("input[name='value']");
      expect(input.props().value).to.equal("new setting");

      wrapper.find("form").simulate("submit");
      let newProps = {responseBody: "new setting", ...wrapper.props()};
      wrapper.setProps(newProps);

      expect(input.props().value).to.equal("");
      expect(select.props().value).to.equal("");

    });

    it("doesn't clear the form if there's an error message", () => {
      fillOutFormFields();
      let select = wrapper.find("select[name='key']");
      expect(select.props().value).to.equal("test_key");

      let input = wrapper.find("input[name='value']");
      expect(input.props().value).to.equal("new setting");

      wrapper.find("form").simulate("submit");
      let newProps = {fetchError: "ERROR", ...wrapper.props()};
      wrapper.setProps(newProps);

      expect(input.props().value).to.equal("new setting");
      expect(select.props().value).to.equal("test_key");
    });

    it("should switch between rendering a select and input value options", () => {
      let select = wrapper.find("select");
      let input = wrapper.find("input");

      expect(select.length).to.equal(1);
      expect(input.length).to.equal(1);

      // select.simulate("change", { target: { value: "other_key2" } });
      wrapper.setState({ inputKey: "other_key2" });

      select = wrapper.find("select");
      input = wrapper.find("input");
      expect(select.length).to.equal(2);
      expect(input.length).to.equal(0);

      // select.simulate("change", { target: { value: "other_key2" } });
      wrapper.setState({ inputKey: "other_key1 " });

      select = wrapper.find("select");
      input = wrapper.find("input");
      expect(select.length).to.equal(1);
      expect(input.length).to.equal(1);
    });
  });
});
