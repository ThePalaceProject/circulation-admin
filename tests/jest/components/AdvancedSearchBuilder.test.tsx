import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdvancedSearchBuilder from "../../../src/components/AdvancedSearchBuilder";

describe("AdvancedSearchBuilder", () => {
  it("renders a placeholder and help text when the publication date filter is selected", async () => {
    const user = userEvent.setup();

    const query = {
      id: "0",
      key: "genre",
      value: "Horror",
    };

    render(
      <AdvancedSearchBuilder
        isOwner={true}
        name="search"
        query={query}
        selectedQueryId="0"
      />
    );

    const publicationDateRadio = screen.getByRole("radio", {
      name: "publication date",
    });

    await user.click(publicationDateRadio);

    const filterValueField = screen.getByRole("textbox", {
      name: "filter value",
    });

    expect(filterValueField).toHaveAttribute("placeholder", "YYYY-MM-DD");
    expect(filterValueField).toHaveAccessibleDescription(/publication date/i);
    expect(filterValueField).toHaveAccessibleDescription(/YYYY-MM-DD/i);
  });
});
