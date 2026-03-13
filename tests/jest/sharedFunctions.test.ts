import {
  findDefault,
  formatString,
  isEqual,
} from "../../src/utils/sharedFunctions";

describe("findDefault", () => {
  const settingWithoutDefaults = {
    key: "test_setting_no_default",
    options: [
      { key: "true", label: "Yes" },
      { key: "false", label: "No" },
    ],
  };

  const settingWithOneDefault = {
    default: "true",
    key: "test_setting_1_default",
    options: [
      { key: "true", label: "Yes" },
      { key: "false", label: "No" },
    ],
  };

  const settingWithMultipleDefaults = {
    default: ["first default", "second default"],
    key: "test_setting_mult_defaults",
    options: [
      { key: "first default", label: "Yes" },
      { key: "no", label: "No" },
      { key: "second default", label: "This one too" },
      { key: "also no", label: "Not this one" },
    ],
  };

  it("doesn't return anything if the setting has no default value", () => {
    expect(findDefault(settingWithoutDefaults)).toBeUndefined();
  });

  it("identifies the default setting from a list of options", () => {
    const result = findDefault(settingWithOneDefault);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("true");
    expect(result[0].label).toBe("Yes");
  });

  it("identifies multiple default settings from a list of options", () => {
    const result = findDefault(settingWithMultipleDefaults);
    expect(result).toHaveLength(2);
    expect(result[0].key).toBe("first default");
    expect(result[0].label).toBe("Yes");
    expect(result[1].key).toBe("second default");
    expect(result[1].label).toBe("This one too");
  });
});

describe("formatString", () => {
  const stringToFormat = "this-is-a-sentence.";

  it("capitalizes the first letter of a string by default", () => {
    expect(formatString(stringToFormat)).toBe("This-is-a-sentence.");
  });

  it("can be prevented from capitalizing", () => {
    expect(formatString(stringToFormat, null, false)).toBe(
      "this-is-a-sentence."
    );
  });

  it("replaces characters", () => {
    expect(formatString(stringToFormat, ["-", " "], false)).toBe(
      "this is a sentence."
    );
  });

  it("replaces characters and capitalizes", () => {
    expect(formatString(stringToFormat, ["-", "!"])).toBe(
      "This!is!a!sentence."
    );
  });

  it("replaces multiple characters", () => {
    expect(
      formatString("need-to-replace!multiple-characters", ["-", "!", " "])
    ).toBe("Need to replace multiple characters");
  });

  it("defaults to replacing characters with a space", () => {
    expect(formatString(stringToFormat, ["-"])).toBe("This is a sentence.");
  });
});

describe("isEqual", () => {
  const arr1 = ["a", "b", "c"];

  it("returns false if the arrays are not the same length", () => {
    expect(isEqual(arr1, ["a", "b", "c", "d"])).toBe(false);
  });

  it("returns false if the lengths are the same but not all of the elements match", () => {
    expect(isEqual(arr1, ["a", "b", "d"])).toBe(false);
  });

  it("returns false if there are duplicates", () => {
    expect(isEqual(arr1, ["a", "a", "b"])).toBe(false);
  });

  it("returns true if the arrays are the same", () => {
    expect(isEqual(arr1, ["a", "b", "c"])).toBe(true);
  });

  it("returns true even if the arrays do not list the elements in the same order", () => {
    expect(isEqual(arr1, ["b", "c", "a"])).toBe(true);
  });

  it("returns true if the arrays have the same duplicates", () => {
    expect(isEqual(["a", "a", "b"], ["b", "a", "a"])).toBe(true);
  });
});
