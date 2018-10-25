import { expect } from "chai";
import { handleSubmit, findDefault, clearForm } from "../sharedFunctions";


describe("findDefault", () => {

  const settingWithoutDefaults = {
    key: "test_setting_no_default",
    options: [
      { key: "true", label: "Yes" },
      { key: "false", label: "No" }
    ]
  };

  const settingWithOneDefault = {
    default: "true",
    key: "test_setting_1_default",
    options: [
      { key: "true", label: "Yes" },
      { key: "false", label: "No" }
    ]
  };

  const settingWithMultipleDefaults = {
    default: ["first default", "second default"],
    key: "test_setting_mult_defaults",
    options: [
      { key: "first default", label: "Yes" },
      { key: "no", label: "No" },
      { key: "second default", label: "This one too" },
      { key: "also no", label: "Not this one" }
    ]
  };

  it("doesn't return anything if the setting has no default value", () => {
    let result = findDefault(settingWithoutDefaults);
    expect(result).to.be.undefined;
  });

  it("identifies the default setting from a list of options", () => {
    let result = findDefault(settingWithOneDefault);
    expect(result.length).to.equal(1);
    expect(result[0].key).to.equal("true");
    expect(result[0].label).to.equal("Yes");
  });

  it("identifies multiple default settings from a list of options", () => {
    let result = findDefault(settingWithMultipleDefaults);
    expect(result.length).to.equal(2);
    expect(result[0].key).to.equal("first default");
    expect(result[0].label).to.equal("Yes");
    expect(result[1].key).to.equal("second default");
    expect(result[1].label).to.equal("This one too");
  });

});
