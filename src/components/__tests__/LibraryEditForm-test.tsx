import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import LibraryEditForm from "../LibraryEditForm";
import EditableInput from "../EditableInput";
import { Panel, Button, Form } from "library-simplified-reusable-components";
import ProtocolFormField from "../ProtocolFormField";
import PairedMenus from "../PairedMenus";
import InputList from "../InputList";
import AnnouncementsSection from "../AnnouncementsSection";

describe("LibraryEditForm", () => {
  let wrapper;
  let save;
  const libraryData = {
    uuid: "uuid",
    name: "name",
    short_name: "short_name",
    // prettier-ignore
    settings: {
      "privacy-policy": "http://privacy",
      "copyright": "http://copyright",
      "featured_lane_size": "20",
      "announcements": "[{\"content\": \"Announcement #1\", \"start\": \"2020-06-15\", \"finish\": \"2020-08-15\", \"id\": \"1\"}]"
    },
  };
  const settingFields = [
    { key: "name", label: "Name", category: "Basic Information", level: 3 },
    {
      key: "short_name",
      label: "Short Name",
      category: "Basic Information",
      level: 3,
    },
    { key: "privacy-policy", label: "Privacy Policy", category: "Links" },
    { key: "copyright", label: "Copyright", category: "Links" },
    { key: "logo", label: "Logo", category: "Client Interface Customization" },
    { key: "large_collections", label: "Languages", category: "Languages" },
    {
      key: "featured_lane_size",
      label: "Maximum number of books in the 'featured' lanes",
      category: "Lanes & Filters",
      type: "number",
    },
    {
      key: "service_area",
      label: "Service Area",
      category: "Geographic Areas",
      type: "list",
    },
    {
      key: "announcements",
      label: "Announcements",
      category: "Announcements",
      type: "announcements",
    },
  ];

  const editableInputByName = (name) => {
    const inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere((input) => input.props().name === name);
    }
    return [];
  };

  const protocolFormFieldByKey = (key) => {
    const formFields = wrapper.find(ProtocolFormField);
    if (formFields.length >= 1) {
      return formFields.filterWhere(
        (formField) => formField.props().setting.key === key
      );
    }
    return [];
  };

  const collapsibleByName = (name: string) => {
    const collapsibles = wrapper.find(Panel);
    if (collapsibles.length >= 1) {
      return collapsibles.filterWhere((collapsible) =>
        collapsible.find(".panel-heading").text().startsWith(name)
      );
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      save = stub();
      wrapper = mount(
        <LibraryEditForm
          data={{ libraries: [libraryData], settings: settingFields }}
          disabled={false}
          save={save}
          urlBase="url base"
          listDataKey="libraries"
          adminLevel={3}
        />
      );
    });

    it("renders hidden uuid", () => {
      // prettier-ignore
      let input = wrapper.find("input[name=\"uuid\"]");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      // prettier-ignore
      input = wrapper.find("input[name=\"uuid\"]");
      expect(input.props().value).to.equal("uuid");
    });

    it("renders name", () => {
      let input = editableInputByName("name");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      input = editableInputByName("name");
      expect(input.props().value).to.equal("name");
    });

    it("renders short name", () => {
      let input = editableInputByName("short_name");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      input = editableInputByName("short_name");
      expect(input.props().value).to.equal("short_name");
    });

    it("renders settings", () => {
      let privacyInput = protocolFormFieldByKey("privacy-policy");
      expect(privacyInput.props().setting).to.equal(settingFields[2]);
      expect(privacyInput.props().value).not.to.be.ok;
      let copyrightInput = protocolFormFieldByKey("copyright");
      expect(copyrightInput.props().setting).to.equal(settingFields[3]);
      expect(copyrightInput.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      privacyInput = protocolFormFieldByKey("privacy-policy");
      expect(privacyInput.props().value).to.equal("http://privacy");
      copyrightInput = protocolFormFieldByKey("copyright");
      expect(copyrightInput.props().value).to.equal("http://copyright");
    });

    it("does not render settings with the skip attribute", () => {
      expect(wrapper.find(ProtocolFormField).length).to.equal(8);
      const settings = wrapper
        .prop("data")
        .settings.concat([
          { key: "skip", label: "Skip this setting!", skip: true },
        ]);
      wrapper.setProps({ data: { ...wrapper.prop("data"), ...{ settings } } });
      expect(wrapper.find(ProtocolFormField).length).to.equal(8);
      expect(protocolFormFieldByKey("skip").length).to.equal(0);
    });

    it("renders the PairedMenus component", () => {
      const inputListSetting = {
        key: "inputList",
        label: "Input List",
        paired: "dropdown",
        options: [],
        default: ["opt_1"],
        level: 2,
      };
      const dropdownSetting = {
        key: "dropdown",
        label: "Dropdown List",
        options: [
          { key: "opt_1", label: "Option 1" },
          { key: "opt_2", label: "Option 2" },
        ],
        type: "select",
        level: 2,
      };
      wrapper.setProps({
        data: {
          ...wrapper.prop("data"),
          ...{ settings: [inputListSetting, dropdownSetting] },
        },
      });
      let pairedMenus = wrapper.find(PairedMenus);
      expect(pairedMenus.length).to.equal(1);
      expect(pairedMenus.prop("readOnly")).not.to.be.true;

      const inputList = pairedMenus.find(InputList);
      expect(inputList.length).to.equal(1);
      expect(inputList.prop("setting")).to.eql({
        ...inputListSetting,
        ...{ format: "narrow", menuOptions: [], type: "menu" },
      });

      const dropdown = pairedMenus.find("select");
      expect(dropdown.length).to.equal(1);
      expect(dropdown.prop("name")).to.equal("dropdown");
      expect(dropdown.children().length).to.equal(1);
      expect(dropdown.children().at(0).prop("value")).to.equal(
        inputListSetting.default[0]
      );

      // If the admin isn't authorized to make changes to the setting represented by the PairedMenus component,
      // PairedMenus should be read-only.
      wrapper.setProps({ adminLevel: 1 });
      pairedMenus = wrapper.find(PairedMenus);
      expect(pairedMenus.prop("readOnly")).to.be.true;
    });

    it("renders the InputList component", () => {
      const inputListSetting = {
        key: "inputList",
        label: "Input List",
        options: [],
        default: ["opt_1"],
        level: 2,
        menuOptions: [],
        type: "menu",
      };
      wrapper.setProps({
        data: { ...wrapper.prop("data"), ...{ settings: [inputListSetting] } },
      });
      let inputList = wrapper.find(InputList);
      expect(inputList.length).to.equal(1);
      expect(inputList.prop("setting")).to.eql(inputListSetting);
      expect(inputList.prop("readOnly")).not.to.be.true;
      expect(inputList.prop("disableButton")).not.to.be.true;

      // If the admin isn't authorized to make changes to the setting represented by the InputList component,
      // InputList should be read-only.
      wrapper.setProps({ adminLevel: 1 });
      inputList = wrapper.find(InputList);
      expect(inputList.prop("readOnly")).to.be.true;
      expect(inputList.prop("disableButton")).to.be.true;
    });

    it("renders the Announcements component", () => {
      wrapper.setProps({ item: libraryData });
      const announcements = wrapper.find(AnnouncementsSection);
      expect(announcements.length).to.equal(1);
      expect(announcements.props().setting.key).to.equal("announcements");
      expect(announcements.props().value).to.eql(
        JSON.parse(libraryData.settings.announcements)
      );
    });

    it("subdivides fields", () => {
      const collapsible = wrapper.find(".panel");
      expect(collapsible.length).to.equal(7);

      const basic = collapsible.at(0).find(".panel-heading");
      expect(basic.text()).to.contain("Basic Information");

      const other = collapsible.slice(1, collapsible.length);
      other.map((form) => {
        const title = form.find(".panel-heading").text();
        expect(title).to.contain("(Optional)");
      });

      expect(
        collapsibleByName("Links").find(ProtocolFormField).length
      ).to.equal(2);
      expect(
        collapsibleByName("Languages").find(ProtocolFormField).length
      ).to.equal(1);
      expect(
        collapsibleByName("Client Interface Customization").find(
          ProtocolFormField
        ).length
      ).to.equal(1);

      const geographic = collapsibleByName("Geographic Areas");
      expect(geographic.find(ProtocolFormField).length).to.equal(1);
      const addListItems = geographic.find(".add-list-item").hostNodes();
      expect(addListItems.length).to.equal(2);
      expect(addListItems.at(0).type()).to.equal("span");
      expect(addListItems.at(1).type()).to.equal("button");
    });

    it("has a save button", () => {
      const form = wrapper.find(Form);
      const saveButton = form.find(Button).last();
      expect(saveButton.text()).to.equal("Submit");
      expect(form.prop("onSubmit")).to.equal(wrapper.instance().submit);
    });

    it("disables some fields if the user isn't a system admin", () => {
      const sysAdminOnly = {
        key: "level-3",
        label: "Level 3",
        category: "Basic Information",
        level: 3,
      };
      const sysAdminAndLibMgr = {
        key: "level-2",
        label: "Level 2",
        category: "Basic Information",
        level: 2,
      };
      const data = {
        libraries: [libraryData],
        settings: settingFields.concat([sysAdminOnly, sysAdminAndLibMgr]),
      };
      let fields = wrapper.find(EditableInput);

      // System admin
      fields.forEach((x) => {
        if (!["Name", "Short name"].includes(x.prop("label"))) {
          expect(x.prop("readOnly")).to.be.false;
        }
      });

      // Library manager
      wrapper.setProps({ adminLevel: 2, data });
      fields = wrapper.find(EditableInput);
      fields.forEach((x) => {
        expect(x.prop("readOnly")).to.equal(
          ["Name", "Short Name", "Level 3"].includes(x.prop("label"))
        );
      });

      // Librarian
      wrapper.setProps({ adminLevel: 1 });
      fields = wrapper.find(EditableInput);
      fields.forEach((x) => {
        expect(x.prop("readOnly")).to.equal(
          ["Name", "Short Name", "Level 3", "Level 2"].includes(x.prop("label"))
        );
      });
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      save = stub().returns(
        new Promise<void>((resolve) => resolve())
      );
      wrapper = mount(
        <LibraryEditForm
          data={{ libraries: [libraryData], settings: settingFields }}
          disabled={false}
          save={save}
          urlBase="url base"
          listDataKey="libraries"
        />
      );
    });

    it("calls save when the save button is clicked", () => {
      const saveButton = wrapper.find(Button).last();
      saveButton.simulate("click");
      expect(save.callCount).to.equal(1);
    });

    it("calls save when the form is submitted directly", () => {
      wrapper.find(Form).prop("onSubmit")();
      expect(save.callCount).to.equal(1);
    });

    it("submits data", () => {
      wrapper.setProps({ item: libraryData });

      const saveButton = wrapper.find(Button).last();
      saveButton.simulate("click");

      expect(save.callCount).to.equal(1);
      const formData = save.args[0][0];
      expect(formData.get("uuid")).to.equal("uuid");
      expect(formData.get("name")).to.equal("name");
      expect(formData.get("short_name")).to.equal("short_name");
      expect(formData.get("privacy-policy")).to.equal("http://privacy");
      expect(formData.get("copyright")).to.equal("http://copyright");
    });

    const fillOutFormFields = () => {
      const nameInput = wrapper.find("input[name='name']");
      const nameInputElement = nameInput.getDOMNode();
      nameInputElement.value = "new name";
      nameInput.simulate("change");
    };

    it("clears the form", () => {
      fillOutFormFields();
      let nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("new name");

      wrapper.simulate("submit");
      const newProps = { responseBody: "new library", ...wrapper.props() };
      wrapper.setProps(newProps);

      nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("");
    });

    it("doesn't clear the form if there's an error message", () => {
      fillOutFormFields();
      let nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("new name");

      wrapper.simulate("submit");
      const newProps = { fetchError: "ERROR", ...wrapper.props() };
      wrapper.setProps(newProps);

      nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("new name");
    });
  });
});
