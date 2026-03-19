import * as React from "react";
import { renderWithProviders } from "../testUtils/withProviders";
import CustomListPage from "../../../src/components/lists/CustomListPage";

// CustomLists makes API calls on mount — mock it for this page-level test
jest.mock("../../../src/components/lists/CustomLists", () => {
  const MockCustomLists = React.forwardRef((_props, _ref) =>
    React.createElement("div", { "data-testid": "custom-lists" })
  );
  MockCustomLists.displayName = "MockCustomLists";
  return { __esModule: true, default: MockCustomLists };
});

const defaultParams = {
  library: "library",
  editOrCreate: "edit",
  identifier: "identifier",
};

describe("CustomListPage", () => {
  it("renders the custom-list-page container", () => {
    const { container } = renderWithProviders(
      <CustomListPage params={defaultParams} />
    );
    expect(container.querySelector(".custom-list-page")).toBeInTheDocument();
  });

  it("renders header but not footer", () => {
    const { container } = renderWithProviders(
      <CustomListPage params={defaultParams} />
    );
    expect(container.querySelector("header")).toBeInTheDocument();
    expect(container.querySelector("footer")).not.toBeInTheDocument();
  });
});
