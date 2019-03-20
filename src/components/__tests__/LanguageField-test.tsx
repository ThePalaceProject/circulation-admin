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
    // fetchLanguages = stub().returns(["abc", "def", "ghi"]);
    wrapper = mount(
      <LanguageField store={buildStore()} fetchLanguages={stub()}/>
    );
  });

  it.only("fetches the list of languages", () => {
    let spyFetchLanguages = spy(wrapper.instance(), "fetchLanguages");
    expect(fetchLanguages.callCount).to.equal(1);
    console.log(wrapper.find(Autocomplete).props());
  });
});
