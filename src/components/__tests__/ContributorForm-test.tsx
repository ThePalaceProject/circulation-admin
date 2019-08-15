import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import ContributorForm from "../ContributorForm";
import EditableInput from "../EditableInput";
import WithRemoveButton from "../WithRemoveButton";
import { Button } from "library-simplified-reusable-components";
import { RolesData, ContributorData } from "../../interfaces";

describe.only("ContributorForm", () => {
  let roles: RolesData = {
    "aut": "Author",
    "ill": "Illustrator",
    "nrt": "Narrator",
    "trl": "Translator"
  };
  let contributors: ContributorData[] = [
    { name: "A Translator", role: "trl" },
    { name: "A Narrator", role: "nrt" }
  ];
  let wrapper;

  let hasSelect = (element, value: string) => {
    let select = element.find("select");
    expect(select.length).to.equal(1);
    expect(select.prop("name")).to.equal("contributor-role");
    expect(select.prop("value")).to.equal(value);
    expect(select.find("option").map(o => o.prop("value"))).to.eql(Object.values(roles));
  };

  let hasInput = (element, value = "") => {
    let input = element.find("input");
    expect(element.length).to.equal(1);
    expect(input.prop("name")).to.equal("contributor-name");
    expect(input.prop("value")).to.equal(value);
  };

  beforeEach(() => {
    wrapper = mount(
      <ContributorForm roles={roles} contributors={contributors}/>
    );
  });

  it("displays a label", () => {
    let label = wrapper.find("label").at(0);
    expect(label.text()).to.equal("Authors and Contributors");
  });

  it("displays a list of existing contributors", () => {
    let removables = wrapper.find(".with-remove-button");
    expect(removables.length).to.equal(2);
    removables.forEach((el, idx) => {
      expect(hasSelect(el, roles[contributors[idx].role]));
      expect(hasInput(el, contributors[idx].name));
    });
  });

  it("displays a blank field for adding a new contributor", () => {
    let newContributorForm = wrapper.find(".contributor-form").last();
    expect(hasSelect(newContributorForm, "Author"));
    expect(hasInput(newContributorForm));
    let button = newContributorForm.find(".btn.add-contributor");
    expect(button.length).to.equal(1);
    expect(button.text()).to.equal("Add");
  });

  it.only("deletes a contributor", () => {

  });

});
