import * as React from "react";
import { render } from "@testing-library/react";
import Autocomplete from "../../../src/components/shared/Autocomplete";

const autocompleteValues = ["a", "b", "c"];

describe("Autocomplete", () => {
  describe("rendering", () => {
    it("shows an input with correct attributes", () => {
      const { container } = render(
        <Autocomplete
          autocompleteValues={autocompleteValues}
          disabled={false}
          name="test"
          label="Test"
          value="b"
        />
      );
      const input = container.querySelector("input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("name", "test");
      expect(input).toHaveAttribute("list", "test-autocomplete-list");
      expect(input).not.toBeDisabled();
    });

    it("shows a datalist with the correct id and options", () => {
      const { container } = render(
        <Autocomplete
          autocompleteValues={autocompleteValues}
          disabled={false}
          name="test"
          label="Test"
          value="b"
        />
      );
      const datalist = container.querySelector(
        "datalist#test-autocomplete-list"
      );
      expect(datalist).toBeInTheDocument();
      const options = datalist!.querySelectorAll("option");
      expect(options).toHaveLength(3);
      expect((options[0] as HTMLOptionElement).value).toBe("a");
      expect((options[1] as HTMLOptionElement).value).toBe("b");
      expect((options[2] as HTMLOptionElement).value).toBe("c");
    });
  });
});
