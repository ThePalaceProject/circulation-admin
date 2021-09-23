import LanguageField from "../LanguageField";
import Autocomplete from "../Autocomplete";
import * as React from "react";
import { expect } from "chai";
import { mount } from "enzyme";
import { spy, stub } from "sinon";

describe("LanguageField", () => {
  let wrapper;
  const languages = {
    eng: ["English"],
    es: ["Spanish", "Castilian"],
    spa: ["Spanish", "Castilian"],
  };
  beforeEach(() => {
    wrapper = mount(<LanguageField name="language" languages={languages} />);
  });

  it("renders an autocomplete field", () => {
    const autocomplete = wrapper.find(Autocomplete);
    expect(autocomplete.length).to.equal(1);
    expect(autocomplete.prop("name")).to.equal("language");
    expect(autocomplete.find("input").prop("list")).to.equal(
      "language-autocomplete-list"
    );
    expect(
      autocomplete.find("datalist#language-autocomplete-list").length
    ).to.equal(1);
  });

  it("gets a unique list of language names and passes it to the Autocomplete component", () => {
    wrapper.setProps({ languages });
    expect(wrapper.find(Autocomplete).prop("autocompleteValues")).to.eql([
      "English",
      "Spanish",
      "Castilian",
    ]);
    wrapper.find("option").map((option, idx) => {
      expect(option.prop("value")).to.equal(
        ["English", "Spanish", "Castilian"][idx]
      );
    });
  });
});
