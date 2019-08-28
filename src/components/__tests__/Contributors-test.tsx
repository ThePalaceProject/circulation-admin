import { expect } from "chai";
import * as React from "react";
import { mount } from "enzyme";
import { spy } from "sinon";

import Contributors from "../Contributors";
import { RolesData, ContributorData } from "../../interfaces";

describe("Contributors", () => {
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
      <Contributors roles={roles} contributors={contributors} disabled={false} />
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

  it("does not add an empty string as a contributor's name", () => {
    let spyAddContributor = spy(wrapper.instance(), "addContributor");
    let newContributorForm = wrapper.find(".contributor-form").last();
    let button = newContributorForm.find("button");
    expect(wrapper.state()["disabled"]).to.be.true;
    button.simulate("click");
    // Nothing happens.
    expect(spyAddContributor.callCount).to.equal(0);

    newContributorForm.find("input").getDOMNode().value = "An Author";
    newContributorForm.find("input").simulate("change");
    expect(wrapper.state()["disabled"]).to.be.false;
    button.simulate("click");
    // The button works now!
    expect(spyAddContributor.callCount).to.equal(1);

    // Deleting the text disables the button again.
    newContributorForm.find("input").getDOMNode().value = "";
    newContributorForm.find("input").simulate("change");
    expect(wrapper.state()["disabled"]).to.be.true;
    expect(wrapper.state()["disabled"]).to.be.true;
    button.simulate("click");
    expect(spyAddContributor.callCount).to.equal(1);

    spyAddContributor.restore();
  });

  it("looks up the full name of a contributor's role", () => {
    expect(wrapper.instance().getContributorRole(contributors[0])).to.equal("Translator");
    // If the look-up doesn't yield anything, it just uses the abbreviated version.
    let adapter = { name: "An Adapter", role: "adp" };
    expect(wrapper.instance().getContributorRole(adapter)).to.equal("adp");
  });

  it("resets the form after adding a contributor", () => {
    // Add a contributor:
    let newContributorForm = wrapper.find(".contributor-form").last();
    newContributorForm.find("select").getDOMNode().value = "Illustrator";
    newContributorForm.find("select").simulate("change");
    newContributorForm.find("input").getDOMNode().value = "An Illustrator";
    newContributorForm.find("input").simulate("change");
    newContributorForm.find("button").simulate("click");

    newContributorForm = wrapper.find(".contributor-form").last();
    // The input field is blank.
    expect(newContributorForm.find("input").prop("value")).to.equal("");
    // The drop-down menu has defaulted to "Author".
    expect(newContributorForm.find("select").prop("value")).to.equal("Author");
    // The button is disabled.
    expect(wrapper.state()["disabled"]).to.be.true;
  });

});
