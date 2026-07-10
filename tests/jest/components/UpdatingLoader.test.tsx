import * as React from "react";
import { render, screen } from "@testing-library/react";

import UpdatingLoader from "../../../src/components/UpdatingLoader";

describe("UpdatingLoader", () => {
  it("renders only its container when not showing", () => {
    const { container } = render(<UpdatingLoader show={false} />);

    expect(
      container.querySelector(".updating-loader-container")
    ).toBeInTheDocument();
    expect(container.querySelector(".updating-loader")).not.toBeInTheDocument();
    expect(screen.queryByText("Updating")).not.toBeInTheDocument();
  });

  it("renders the default message when showing", () => {
    render(<UpdatingLoader show={true} />);

    expect(screen.getByText("Updating")).toBeInTheDocument();
  });

  it("renders the text it is given instead of the default", () => {
    render(<UpdatingLoader show={true} text="Doing something" />);

    expect(screen.getByText("Doing something")).toBeInTheDocument();
    expect(screen.queryByText("Updating")).not.toBeInTheDocument();
  });

  it("renders a spinner", () => {
    const { container } = render(<UpdatingLoader show={true} />);

    // The spinner is a Font Awesome <i>, which carries no accessible role.
    expect(container.querySelector("i.fa-spinner")).toBeInTheDocument();
  });
});
