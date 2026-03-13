import * as React from "react";
import { render } from "@testing-library/react";
import LanguageField from "../../../src/components/shared/LanguageField";

const languages = {
  eng: ["English"],
  es: ["Spanish", "Castilian"],
  spa: ["Spanish", "Castilian"],
};

describe("LanguageField", () => {
  it("renders an autocomplete input with the correct name", () => {
    const { container } = render(
      <LanguageField name="language" languages={languages} />
    );
    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("name", "language");
  });

  it("renders a datalist with the correct id", () => {
    const { container } = render(
      <LanguageField name="language" languages={languages} />
    );
    expect(
      container.querySelector("datalist#language-autocomplete-list")
    ).toBeInTheDocument();
    expect(
      container.querySelector("input[list='language-autocomplete-list']")
    ).toBeInTheDocument();
  });

  it("renders a unique list of language name options in the datalist", () => {
    const { container } = render(
      <LanguageField name="language" languages={languages} />
    );
    const options = Array.from(
      container.querySelectorAll("datalist option")
    ).map((o) => (o as HTMLOptionElement).value);
    expect(options).toEqual(["English", "Spanish", "Castilian"]);
  });
});
