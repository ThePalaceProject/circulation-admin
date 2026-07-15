import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConnectedComplaints, {
  Complaints,
} from "../../../src/components/Complaints";
import { renderWithProviders } from "../testUtils/withProviders";

const bookData = {
  id: "id",
  title: "test title",
  issuesLink: {
    href: "issues url",
    rel: "issues",
  },
};

const complaintsData = {
  "http://librarysimplified.org/terms/problem/test-type": 5,
  "http://librarysimplified.org/terms/problem/other-type": 3,
  "http://librarysimplified.org/terms/problem/last-type": 1,
};

// The unconnected `Complaints` takes its data + dispatch functions as props, so
// a bare `render` (no store) is enough for the rendering/behavior assertions.
// One separate test below renders the connected default export through the real
// providers to cover the connect() wiring (mapStateToProps/mapDispatchToProps).
const renderComplaints = (
  props: Partial<React.ComponentProps<typeof Complaints>> = {}
) =>
  render(
    <Complaints
      csrfToken="token"
      bookUrl="book url"
      book={bookData}
      complaints={complaintsData}
      fetchComplaints={jest.fn()}
      postComplaint={jest.fn()}
      refreshCatalog={jest.fn()}
      {...props}
    />
  );

describe("Complaints", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("rendering", () => {
    it("shows the book title", () => {
      renderComplaints();
      expect(
        screen.getByRole("heading", { name: "test title" })
      ).toBeInTheDocument();
    });

    it("shows complaints with their counts", () => {
      const { container } = renderComplaints();
      const types = Array.from(
        container.querySelectorAll(".complaint-type")
      ).map((el) => el.textContent);
      const counts = Array.from(
        container.querySelectorAll(".complaint-count")
      ).map((el) => parseInt(el.textContent || "", 10));
      expect(types).toStrictEqual(["Test type", "Other type", "Last type"]);
      expect(counts).toStrictEqual([5, 3, 1]);
    });

    it("shows simplified complaint types", () => {
      const { container } = renderComplaints();
      const types = Array.from(
        container.querySelectorAll(".complaint-type")
      ).map((el) => el.textContent);
      expect(types).toStrictEqual(["Test type", "Other type", "Last type"]);
    });

    it("shows an unrecognized complaint type unchanged", () => {
      // A type that does not match the /terms/problem/ pattern is rendered as-is.
      const { container } = renderComplaints({
        complaints: { "custom-complaint": 2 },
      });
      const types = Array.from(
        container.querySelectorAll(".complaint-type")
      ).map((el) => el.textContent);
      expect(types).toStrictEqual(["custom-complaint"]);
    });

    it("shows an enabled resolve button for each complaint type", () => {
      renderComplaints();
      const buttons = screen.getAllByRole("button", { name: "Resolve" });
      expect(buttons).toHaveLength(Object.keys(complaintsData).length);
      buttons.forEach((button) => expect(button).not.toBeDisabled());
    });

    it("shows an enabled complaint form when the book has an issues link", () => {
      const { container } = renderComplaints();
      // The ComplaintForm is only rendered when `book.issuesLink` exists, so its
      // presence (with an enabled select) reflects that the form was wired up.
      expect(screen.getByText("Add Complaint")).toBeInTheDocument();
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select).toBeInTheDocument();
      expect(select).not.toBeDisabled();
    });

    it("shows a fetch error and re-fetches when trying again", async () => {
      const user = userEvent.setup();
      const fetchComplaints = jest.fn();
      const fetchError = { status: 401, response: "test", url: "test url" };
      const { container } = render(
        <Complaints
          csrfToken="token"
          bookUrl="book url"
          book={{ id: "id", title: "test book" }}
          fetchError={fetchError}
          fetchComplaints={fetchComplaints}
          postComplaint={jest.fn()}
          refreshCatalog={jest.fn()}
        />
      );

      // The error alert is rendered from the fetchError prop.
      expect(container.querySelector(".alert-danger")).toBeInTheDocument();
      // fetchComplaints is called once on mount (bookUrl is set).
      expect(fetchComplaints).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole("button", { name: "Try again" }));

      expect(fetchComplaints).toHaveBeenCalledTimes(2);
      expect(fetchComplaints.mock.calls[1][0]).toBe("book url/complaints");
    });
  });

  describe("behavior", () => {
    const singleComplaint = {
      "http://librarysimplified.org/terms/problem/test-type": 2,
    };
    const bookUrl = "http://example.com/works/fakeid";

    it("fetches complaints on mount", () => {
      const fetchComplaints = jest.fn();
      render(
        <Complaints
          csrfToken="token"
          book={{ id: "id", title: "test book" }}
          bookUrl={bookUrl}
          complaints={singleComplaint}
          fetchComplaints={fetchComplaints}
          refreshCatalog={jest.fn()}
          resolveComplaints={jest.fn().mockResolvedValue(undefined)}
        />
      );

      expect(fetchComplaints).toHaveBeenCalledTimes(1);
      expect(fetchComplaints.mock.calls[0][0]).toBe(
        "http://example.com/admin/works/fakeid/complaints"
      );
    });

    it("resolves a complaint type when its resolve button is clicked", async () => {
      const user = userEvent.setup();
      jest.spyOn(window, "confirm").mockReturnValue(true);
      const resolveComplaints = jest.fn().mockResolvedValue(undefined);
      render(
        <Complaints
          csrfToken="token"
          book={{ id: "id", title: "test book" }}
          bookUrl={bookUrl}
          complaints={singleComplaint}
          fetchComplaints={jest.fn()}
          refreshCatalog={jest.fn()}
          resolveComplaints={resolveComplaints}
        />
      );

      await user.click(screen.getByRole("button", { name: "Resolve" }));

      expect(resolveComplaints).toHaveBeenCalledTimes(1);
      expect(resolveComplaints.mock.calls[0][0]).toBe(
        "http://example.com/admin/works/fakeid/resolve_complaints"
      );
      // The FormData sent along carries the complaint type being resolved.
      const submittedData = resolveComplaints.mock.calls[0][1];
      expect(submittedData.get("type")).toBe(
        "http://librarysimplified.org/terms/problem/test-type"
      );
    });

    it("re-fetches complaints and refreshes the catalog after resolving", async () => {
      const user = userEvent.setup();
      jest.spyOn(window, "confirm").mockReturnValue(true);
      const fetchComplaints = jest.fn();
      const refreshCatalog = jest.fn();
      const resolveComplaints = jest.fn().mockResolvedValue(undefined);
      render(
        <Complaints
          csrfToken="token"
          book={{ id: "id", title: "test book" }}
          bookUrl={bookUrl}
          complaints={singleComplaint}
          fetchComplaints={fetchComplaints}
          refreshCatalog={refreshCatalog}
          resolveComplaints={resolveComplaints}
        />
      );

      await user.click(screen.getByRole("button", { name: "Resolve" }));

      await waitFor(() => expect(refreshCatalog).toHaveBeenCalledTimes(1));
      expect(resolveComplaints).toHaveBeenCalledTimes(1);
      // Once on mount, and again as part of the post-resolve refresh.
      expect(fetchComplaints).toHaveBeenCalledTimes(2);
    });
  });

  describe("connect() wiring", () => {
    it("renders the connected default export, mapping state and dispatch", async () => {
      const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ complaints: {} }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { container } = renderWithProviders(
        <ConnectedComplaints
          bookUrl="http://example.com/works/fakeid"
          book={{ id: "id", title: "connected book" }}
          csrfToken="token"
          refreshCatalog={jest.fn().mockResolvedValue(undefined)}
        />
      );

      // Own prop flows through the connected component.
      expect(
        screen.getByRole("heading", { name: "connected book" })
      ).toBeInTheDocument();

      // mapDispatchToProps.fetchComplaints ran on mount and hit the network.
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy.mock.calls[0][0]).toBe(
        "http://example.com/admin/works/fakeid/complaints"
      );

      // Let the request/load cycle settle (isFetching true -> false), which also
      // flushes the pending fetch so it cannot reject during teardown.
      await waitFor(() =>
        expect(
          container.querySelector(".updating-loader")
        ).not.toBeInTheDocument()
      );

      // mapStateToProps: no complaints in the store -> "None found." is shown.
      expect(screen.getByText("None found.")).toBeInTheDocument();

      jest.restoreAllMocks();
    });
  });
});
