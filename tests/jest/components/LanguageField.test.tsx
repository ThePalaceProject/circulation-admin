import * as React from "react";
import { render, screen } from "@testing-library/react";

import LanguageField from "../../../src/components/LanguageField";

describe("LanguageField", () => {
  const languages = {
    eng: ["English"],
    es: ["Spanish", "Castilian"],
    spa: ["Spanish", "Castilian"],
  };

  it("renders an autocomplete field", () => {
    const { container } = render(
      <LanguageField name="language" languages={languages} />
    );

    // An <input> with a `list` attribute has the implicit ARIA role "combobox".
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("name", "language");
    expect(input).toHaveAttribute("list", "language-autocomplete-list");
    expect(
      container.querySelector("datalist#language-autocomplete-list")
    ).toBeInTheDocument();
  });

  it("renders a unique, ordered list of language names as options", () => {
    const { container } = render(
      <LanguageField name="language" languages={languages} />
    );

    const options = Array.from(
      container.querySelectorAll<HTMLOptionElement>(
        "#language-autocomplete-list option"
      )
    ).map((option) => option.value);

    expect(options).toStrictEqual(["English", "Spanish", "Castilian"]);
  });
});
