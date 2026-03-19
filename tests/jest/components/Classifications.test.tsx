import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Classifications } from "../../../src/components/book/Classifications";
import genreData from "../genreData";
import classificationsData from "../classificationsData";

// Mock heavy child components
jest.mock("../../../src/components/book/ClassificationsForm", () => {
  const Mock = (props: any) => (
    <div
      data-testid="classifications-form"
      data-book-title={props.book?.title}
    />
  );
  Mock.displayName = "MockClassificationsForm";
  return { __esModule: true, default: Mock };
});

jest.mock("../../../src/components/book/ClassificationsTable", () => {
  const Mock = (props: any) => (
    <div
      data-testid="classifications-table"
      data-count={props.classifications?.length}
    />
  );
  Mock.displayName = "MockClassificationsTable";
  return { __esModule: true, default: Mock };
});

jest.mock("../../../src/components/shared/UpdatingLoader", () => {
  const Mock = (props: any) => (
    <div data-testid="updating-loader" data-show={String(props.show)} />
  );
  Mock.displayName = "MockUpdatingLoader";
  return { __esModule: true, default: Mock };
});

const bookData = {
  id: "1",
  title: "title",
  fiction: true,
  categories: ["Space Opera"],
};

const makeMockProps = () => ({
  store: {} as any,
  csrfToken: "token",
  bookUrl: "works/1",
  book: bookData,
  bookAdminUrl: "book admin url",
  genreTree: genreData,
  classifications: classificationsData,
  isFetching: false,
  fetchError: null,
  refreshCatalog: jest.fn(),
  fetchGenreTree: jest.fn(),
  fetchClassifications: jest.fn(),
  fetchBook: jest.fn(),
  editClassifications: jest.fn().mockResolvedValue(undefined),
});

describe("Classifications", () => {
  describe("rendering", () => {
    it("shows book title", () => {
      render(<Classifications {...makeMockProps()} />);
      expect(screen.getByText("title")).toBeInTheDocument();
    });

    it("hides/shows updating indicator", () => {
      const props = makeMockProps();
      const { rerender } = render(<Classifications {...props} />);
      expect(screen.getByTestId("updating-loader")).toHaveAttribute(
        "data-show",
        "false"
      );

      rerender(<Classifications {...props} isFetching={true} />);
      expect(screen.getByTestId("updating-loader")).toHaveAttribute(
        "data-show",
        "true"
      );
    });

    it("shows fetchError", () => {
      const props = makeMockProps();
      const { rerender } = render(<Classifications {...props} />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();

      const errorData = { status: 500, url: "url", response: "error" };
      rerender(<Classifications {...props} fetchError={errorData} />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("shows classifications form", () => {
      render(<Classifications {...makeMockProps()} />);
      expect(screen.getByTestId("classifications-form")).toBeInTheDocument();
      expect(screen.getByTestId("classifications-form")).toHaveAttribute(
        "data-book-title",
        "title"
      );
    });

    it("shows classifications table", () => {
      render(<Classifications {...makeMockProps()} />);
      expect(screen.getByTestId("classifications-table")).toBeInTheDocument();
    });
  });

  describe("behavior", () => {
    it("fetches genre tree and classifications on mount", () => {
      const props = makeMockProps();
      render(<Classifications {...props} />);
      expect(props.fetchGenreTree).toHaveBeenCalledTimes(1);
      expect(props.fetchGenreTree).toHaveBeenCalledWith("/admin/genres");
      expect(props.fetchClassifications).toHaveBeenCalledTimes(1);
      // bookUrl "works/1" → classifications URL is "admin/works/1/classifications"
      expect(props.fetchClassifications).toHaveBeenCalledWith(
        "admin/works/1/classifications"
      );
    });

    it("refreshes book, classifications, and catalog after editing classifications", async () => {
      const props = makeMockProps();
      const ref = React.createRef<Classifications>();
      render(<Classifications {...props} ref={ref} />);

      const formData = new FormData();
      await ref.current.editClassifications(formData);

      expect(props.editClassifications).toHaveBeenCalledTimes(1);
      expect(props.editClassifications).toHaveBeenCalledWith(
        "admin/works/1/edit_classifications",
        formData
      );
      expect(props.fetchBook).toHaveBeenCalledWith("book admin url");
      // fetchClassifications called twice: on mount + after edit
      expect(props.fetchClassifications).toHaveBeenCalledTimes(2);
      expect(props.refreshCatalog).toHaveBeenCalledTimes(1);
    });
  });
});
