import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Autocomplete from "../../../src/components/Autocomplete";

describe("Autocomplete", () => {
  const autocompleteValues = ["a", "b", "c"];

  const renderAutocomplete = (ref?: React.Ref<Autocomplete>) =>
    render(
      <Autocomplete
        ref={ref}
        autocompleteValues={autocompleteValues}
        disabled={false}
        name="test"
        label="Test"
        value="b"
      />
    );

  describe("rendering", () => {
    it("shows input", () => {
      renderAutocomplete();

      expect(screen.getByText("Test")).toBeInTheDocument();
      // An <input> with a `list` attribute has the implicit role "combobox".
      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("type", "text");
      expect(input).not.toBeDisabled();
      expect(input).toHaveAttribute("name", "test");
      expect(input).toHaveValue("b");
      expect(input).toHaveAttribute("list", "test-autocomplete-list");
    });

    it("shows autocomplete list", () => {
      const { container } = renderAutocomplete();

      const list = container.querySelector("datalist#test-autocomplete-list");
      expect(list).toBeInTheDocument();
      const options = list.querySelectorAll("option");
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveAttribute("value", "a");
      expect(options[1]).toHaveAttribute("value", "b");
      expect(options[2]).toHaveAttribute("value", "c");
    });
  });

  describe("behavior", () => {
    it("returns value", async () => {
      const user = userEvent.setup();
      // getValue() is the imperative API ProtocolFormField/LanguageField call
      // via a ref in production, so exercise it through a real ref here.
      const ref = React.createRef<Autocomplete>();
      renderAutocomplete(ref);

      expect(ref.current.getValue()).toBe("b");

      const input = screen.getByRole("combobox");
      await user.clear(input);
      await user.type(input, "test value");

      expect(input).toHaveValue("test value");
      expect(ref.current.getValue()).toBe("test value");
    });
  });
});
