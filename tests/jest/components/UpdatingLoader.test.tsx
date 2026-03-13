import * as React from "react";
import { render } from "@testing-library/react";
import UpdatingLoader from "../../../src/components/shared/UpdatingLoader";

describe("UpdatingLoader", () => {
  it("renders only the container when show=false", () => {
    const { container } = render(<UpdatingLoader show={false} />);
    expect(
      container.querySelector(".updating-loader-container")
    ).toBeInTheDocument();
    expect(container.querySelector(".updating-loader")).toBeNull();
  });

  it("renders the container and updating message when show=true", () => {
    const { container } = render(<UpdatingLoader show={true} />);
    expect(
      container.querySelector(".updating-loader-container")
    ).toBeInTheDocument();
    expect(container.querySelector(".updating-loader")).toBeInTheDocument();
  });

  it("renders passed-in text", () => {
    const { container } = render(
      <UpdatingLoader show={true} text="Doing something" />
    );
    const loader = container.querySelector(".updating-loader");
    expect(loader).toBeInTheDocument();
    expect(loader!.textContent).toContain("Doing something");
  });

  it("renders a fa-spinner icon when showing", () => {
    const { container } = render(<UpdatingLoader show={true} />);
    const spinner = container.querySelector("i.fa-spinner");
    expect(spinner).toBeInTheDocument();
  });
});
