import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ErrorMessage from "../../../src/components/ErrorMessage";

describe("ErrorMessage", () => {
  it("shows logged out message for 401 error", () => {
    render(<ErrorMessage error={{ status: 401, response: "", url: "" }} />);

    expect(screen.getByRole("alert")).toHaveTextContent("logged out");
  });

  it("shows detail for problem detail", () => {
    render(
      <ErrorMessage
        error={{
          status: 500,
          response: JSON.stringify({ status: 500, detail: "detail" }),
          url: "",
        }}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("detail");
  });

  it("shows response for non-json response", () => {
    render(
      <ErrorMessage error={{ status: 500, response: "response", url: "" }} />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("response");
  });

  it("parses non-JSON problem detail string", () => {
    // prettier-ignore
    const response = "Remote service returned a problem detail document: {\"status\": 502, \"detail\": problem text, \"title\": TITLE}";
    render(<ErrorMessage error={{ status: 500, response, url: "" }} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Remote service returned a problem detail document with status 502: problem text"
    );
    expect(screen.getByText("TITLE")).toBeInTheDocument();
  });

  it("can handle missing detail property in non-JSON problem detail string", () => {
    // prettier-ignore
    const response = "Remote service returned a problem detail document: {\"status\": 502, \"title\": TITLE}";
    render(<ErrorMessage error={{ status: 500, response, url: "" }} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Remote service returned a problem detail document with status 502:"
    );
    expect(screen.getByText("TITLE")).toBeInTheDocument();
  });

  it("can handle missing status property in non-JSON problem detail string", () => {
    // prettier-ignore
    const response = "Remote service returned a problem detail document:  {\"detail\": problem text, \"title\": TITLE}";
    render(<ErrorMessage error={{ status: 500, response, url: "" }} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Remote service returned a problem detail document: problem text"
    );
    expect(screen.getByText("TITLE")).toBeInTheDocument();
  });

  it("can handle missing title property in non-JSON problem detail string", () => {
    // prettier-ignore
    const response = "Remote service returned a problem detail document:  {\"status\": 502, \"detail\": problem text}";
    render(<ErrorMessage error={{ status: 500, response, url: "" }} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Remote service returned a problem detail document with status 502:"
    );
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("shows a try again button that fires the callback when clicked", async () => {
    const user = userEvent.setup();
    const tryAgain = jest.fn();
    render(
      <ErrorMessage
        error={{ status: 500, response: "response", url: "" }}
        tryAgain={tryAgain}
      />
    );

    const tryAgainButton = screen.getByRole("button", { name: "Try again" });
    expect(tryAgainButton).toBeInTheDocument();

    await user.click(tryAgainButton);

    expect(tryAgain).toHaveBeenCalledTimes(1);
  });
});
