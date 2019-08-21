import { expect } from "chai";
import * as React from "react";
import { mount } from "enzyme";

import ContributorForm from "../ContributorForm";
import { RolesData, ContributorData } from "../../interfaces";

describe("ContributorForm", () => {
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

  it("deletes a contributor", () => {
    expect(wrapper.state()["contributors"]).to.eql(contributors);
    let existingContributors = wrapper.find(".with-remove-button");
    expect(existingContributors.length).to.equal(2);
    expect(hasSelect(existingContributors.first(), roles[contributors[0].role]));
    expect(hasInput(existingContributors.first(), contributors[0].name));
    existingContributors.first().find("button").simulate("click");
    expect(wrapper.state()["contributors"]).to.eql([contributors[1]]);
    existingContributors = wrapper.find(".with-remove-button");
    expect(existingContributors.length).to.equal(1);
    expect(hasSelect(existingContributors.first(), roles[contributors[1].role]));
    expect(hasInput(existingContributors.first(), contributors[1].name));
  });

  it("adds a contributor", () => {
    expect(wrapper.state()["contributors"]).to.eql(contributors);
    let existingContributors = wrapper.find(".with-remove-button");
    expect(existingContributors.length).to.equal(2);
    let newContributorForm = wrapper.find(".contributor-form").last();
    newContributorForm.find("select").getDOMNode().value = "Illustrator";
    newContributorForm.find("select").simulate("change");
    newContributorForm.find("input").getDOMNode().value = "An Illustrator";
    newContributorForm.find("input").simulate("change");
    newContributorForm.find("button").simulate("click");
    expect(wrapper.state()["contributors"]).to.eql(
      contributors.concat({ role: "Illustrator", name: "An Illustrator" })
    );
    existingContributors = wrapper.find(".with-remove-button");
    expect(existingContributors.length).to.equal(3);
    expect(existingContributors.last().find("select").prop("value")).to.equal("Illustrator");
    expect(existingContributors.last().find("input").prop("value")).to.equal("An Illustrator");
  });

  it("looks up the full name of a contributor's role", () => {
    expect(wrapper.instance().getContributorRole(contributors[0])).to.equal("Translator");
    // If the look-up doesn't yield anything, it just uses the abbreviated version.
    let adapter = { name: "An Adapter", role: "adp" };
    expect(wrapper.instance().getContributorRole(adapter)).to.equal("adp");
  });

});
