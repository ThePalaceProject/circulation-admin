import { LanguageField } from "../LanguageField";
import Autocomplete from "../Autocomplete";
import * as React from "react";
import { expect } from "chai";
import { mount } from "enzyme";
import { spy, stub } from "sinon";
import buildStore from "../../store";

describe("LanguageField", () => {
  let wrapper;
  let store;
  let fetchLanguages;

  beforeEach(() => {
    fetchLanguages = stub();
    wrapper = mount(
      <LanguageField
        store={buildStore()}
        fetchLanguages={fetchLanguages}
        name="language"
      />
    );
  });

  it("renders an autocomplete field", () => {
    let autocomplete = wrapper.find(Autocomplete);
    expect(autocomplete.length).to.equal(1);
    expect(autocomplete.prop("name")).to.equal("language");
    expect(autocomplete.find("input").prop("list")).to.equal("language-autocomplete-list");
    expect(autocomplete.find("datalist#language-autocomplete-list").length).to.equal(1);
  });

  it("fetches the list of languages", () => {
    expect(fetchLanguages.callCount).to.equal(1);
  });

  it("gets a unique list of language names and passes it to the Autocomplete component", () => {
    let languages = {
      "eng": ["English"],
      "es": ["Spanish", "Castilian"],
      "spa": ["Spanish", "Castilian"]
    };
    wrapper.setProps({ languages });
    expect(wrapper.find(Autocomplete).prop("autocompleteValues")).to.eql(["English", "Spanish", "Castilian"]);
    wrapper.find("option").map((option, idx) => {
      expect(option.prop("value")).to.equal(["English", "Spanish", "Castilian"][idx]);
    });
  });
});
