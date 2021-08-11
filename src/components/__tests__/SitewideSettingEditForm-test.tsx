import { expect } from "chai";
import { stub, spy } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import SitewideSettingEditForm from "../SitewideSettingEditForm";
import EditableInput from "../EditableInput";
import { Button, Form } from "library-simplified-reusable-components";

describe("SitewideSettingEditForm", () => {
  let wrapper;
  let save;
  const settingData = {
    key: "test_key",
    value: "value",
  };
  const settingDataWithDescription = {
    key: "other_key1",
    value: "label1",
    description: "some description",
  };
  const settingDataWithSelect = {
    key: "other_key2",
    value: "label2",
  };
  const allSettings = [
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
      ],
    },
  ];
  const settingsData = {
    settings: [settingData],
    all_settings: allSettings,
  };

  const editableInputByName = (name) => {
    const inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere((input) => input.props().name === name);
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      save = stub();
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

    it("renders message if there are no remaining fields", () => {
      const data = {
        settings: [settingData],
        all_settings: [allSettings[0]],
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
      const message = wrapper.find("p");
      expect(wrapper.text()).to.contain("All sitewide settings");
      // prettier-ignore
      const input = wrapper.find("input[name=\"csrf_token\"]");
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
      const description = wrapper.find(Form).find(".description").at(1);
      expect(description.prop("dangerouslySetInnerHTML")).to.eql({
        __html: "some description",
      });
    });

    it("should render a select value option", () => {
      wrapper.setProps({ item: settingDataWithSelect });
      wrapper.setState({ inputKey: "other_key2" });

      const firstSelect = editableInputByName("key");
      const dynamicSelect = editableInputByName("value");
      expect(firstSelect.props().value).to.equal("other_key2");
      expect(dynamicSelect.props().value).to.equal("label2");
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      save = stub().returns(
        new Promise<void>((resolve) => resolve())
      );
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
      const saveButton = wrapper.find(Button);
      saveButton.simulate("click");
      expect(save.callCount).to.equal(1);
    });

    it("calls save when the form is submitted directly", () => {
      const form = wrapper.find(Form);
      form.prop("onSubmit")();
      expect(save.callCount).to.equal(1);
    });

    it("submits data", () => {
      wrapper.setProps({ item: settingData });

      const saveButton = wrapper.find(Button);
      saveButton.simulate("click");

      expect(save.callCount).to.equal(1);
      const formData = save.args[0][0];
      expect(formData.get("key")).to.equal("test_key");
      expect(formData.get("value")).to.equal("value");
    });

    const fillOutFormFields = () => {
      wrapper.setProps({ item: settingData });
      const input = wrapper.find("input[name='value']");
      // For input elements, use `getDOMNode`. The previous API method,
      // .get(0), outputs the following error message:
      // Cannot add property value, object is not extensible
      const inputElement = input.getDOMNode();
      inputElement.value = "new setting";
      input.simulate("change");
    };

    it("clears the form", () => {
      fillOutFormFields();
      let select = wrapper.find("select[name='key']");
      let input = wrapper.find("input[name='value']");

      expect(select.props().value).to.equal("test_key");
      expect(input.props().value).to.equal("new setting");

      wrapper.find("form").simulate("submit");
      const newProps = { responseBody: "new setting", ...wrapper.props() };
      wrapper.setProps(newProps);

      input = wrapper.find("input[name='value']");
      select = wrapper.find("select[name='key']");
      expect(input.props().value).to.equal("");
      expect(select.props().value).to.equal("");
    });

    it("doesn't clear the form if there's an error message", () => {
      fillOutFormFields();
      let select = wrapper.find("select[name='key']");
      let input = wrapper.find("input[name='value']");

      expect(select.props().value).to.equal("test_key");
      expect(input.props().value).to.equal("new setting");

      wrapper.find("form").simulate("submit");
      const newProps = { fetchError: "ERROR", ...wrapper.props() };
      wrapper.setProps(newProps);

      input = wrapper.find("input[name='value']");
      select = wrapper.find("select[name='key']");
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
