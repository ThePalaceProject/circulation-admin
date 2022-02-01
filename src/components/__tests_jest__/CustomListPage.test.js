/**
 * The following is an example test meant to check that testUtils.jsx is working as expected.
 * */

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../../testUtils/testUtils";
import CustomListPage from "../CustomListPage";

const params = {
  library: "library",
  editOrCreate: "edit",
  identifier: "identifier",
};

test("renders header", () => {
  render(<CustomListPage params={params} />);
  waitFor(() => screen.getByText(/hidden books/i));
});

test("renders footer", () => {
  render(<CustomListPage params={params} />);

  waitFor(() => screen.getByText(/terms of service/i));
});
