import * as React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils/withProviders";
import ManagePatrons from "../../../src/components/patrons/ManagePatrons";

describe("ManagePatrons", () => {
  const defaultParams = { library: "", tab: "" };

  it("renders the manage-patrons-page container", () => {
    const { container } = renderWithProviders(
      <ManagePatrons params={defaultParams} />
    );
    expect(container.querySelector(".manage-patrons-page")).toBeInTheDocument();
  });

  it("renders a 'Patron Manager' heading", () => {
    renderWithProviders(<ManagePatrons params={defaultParams} />);
    expect(
      screen.getByRole("heading", { name: "Patron Manager" })
    ).toBeInTheDocument();
  });

  it("renders a header landmark", () => {
    const { container } = renderWithProviders(
      <ManagePatrons params={defaultParams} />
    );
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("renders a footer landmark", () => {
    const { container } = renderWithProviders(
      <ManagePatrons params={defaultParams} />
    );
    expect(container.querySelector("footer")).toBeInTheDocument();
  });
});
