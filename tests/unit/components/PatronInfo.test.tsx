import * as React from "react";
import { render } from "@testing-library/react";

import PatronInfo from "../../../src/components/PatronInfo";
import { PatronData } from "../../../src/interfaces";

const patrons: PatronData[] = [
  {
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
  },
  {
    authorization_expires: "",
    personal_name: "Personal Name2",
    authorization_identifier: "5678",
    authorization_identifiers: [""],
    block_reason: "",
    external_type: "",
    fines: "",
    permanent_id: "",
  },
];

describe("PatronInfo", () => {
  it("should display the patron's information", () => {
    const { container } = render(<PatronInfo patron={patrons[0]} />);

    const items = container.querySelectorAll("ul.patron-data-list > li");
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent("Username:User Name");
    expect(items[1]).toHaveTextContent("Personal Name:Personal Name");
    expect(items[2]).toHaveTextContent("Email Address:user@email.com");
    expect(items[3]).toHaveTextContent("Identifier:1234");
  });

  it("should update the patron's information if a new patron was searched and found", () => {
    const { container, rerender } = render(<PatronInfo patron={patrons[0]} />);

    rerender(<PatronInfo patron={patrons[1]} />);

    const items = container.querySelectorAll("ul.patron-data-list > li");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Personal Name:Personal Name2");
    expect(items[1]).toHaveTextContent("Identifier:5678");
  });
});
