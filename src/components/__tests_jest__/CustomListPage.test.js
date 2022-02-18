/**
 * The following is an example test meant to check that testUtils.jsx is working as expected.
 * */

import { fireEvent } from "@testing-library/react";
import React from "react";
import { render } from "../../testUtils/testUtils";
import CustomListPage from "../CustomListPage";

const params = {
  library: "library",
  editOrCreate: "edit",
  identifier: "identifier",
};

let utils;

beforeEach(() => {
  utils = render(<CustomListPage params={params} />);
});

test("renders header and footer", () => {
  const header = utils.getByText(/hidden books/i);

  expect(header).toBeInTheDocument();

  const footer = utils.getByText(/terms of service/i);

  expect(footer).toBeInTheDocument();
});
