import * as React from "react";
import { render } from "@testing-library/react";
import PatronInfo from "../../../src/components/patrons/PatronInfo";
import { PatronData } from "../../../src/interfaces";

const fullPatron: PatronData = {
  authorization_expires: "",
  username: "User Name",
  personal_name: "Personal Name",
  email_address: "user@email.com",
  authorization_identifier: "1234",
  authorization_identifiers: [""],
  block_reason: "",
  external_type: "",
  fines: "",
  permanent_id: "",
};

const partialPatron: PatronData = {
  authorization_expires: "",
  personal_name: "Personal Name2",
  authorization_identifier: "5678",
  authorization_identifiers: [""],
  block_reason: "",
  external_type: "",
  fines: "",
  permanent_id: "",
};

describe("PatronInfo", () => {
  it("displays all patron fields when provided", () => {
    const { container, getByText } = render(<PatronInfo patron={fullPatron} />);
    const items = container.querySelectorAll("ul li");
    expect(items).toHaveLength(4);
    expect(getByText("User Name")).toBeInTheDocument();
    expect(getByText("Personal Name")).toBeInTheDocument();
    expect(getByText("user@email.com")).toBeInTheDocument();
    expect(getByText("1234")).toBeInTheDocument();
  });

  it("shows only the available fields for a patron without username or email", () => {
    const { container } = render(<PatronInfo patron={partialPatron} />);
    const items = container.querySelectorAll("ul li");
    expect(items).toHaveLength(2);
  });
});
