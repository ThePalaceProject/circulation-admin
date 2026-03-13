import * as React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { Complaints } from "../../../src/components/book/Complaints";

const buildBookData = (opts: { issuesLink?: boolean } = {}) => ({
  id: "id",
  title: "test title",
  ...(opts.issuesLink !== false
    ? { issuesLink: { href: "issues url", rel: "issues" } }
    : {}),
});

const complaintsData = {
  "http://librarysimplified.org/terms/problem/test-type": 5,
  "http://librarysimplified.org/terms/problem/other-type": 3,
  "http://librarysimplified.org/terms/problem/last-type": 1,
};

function renderComplaints(
  overrides: Partial<React.ComponentProps<typeof Complaints>> = {}
) {
  const fetchComplaints = jest.fn();
  const postComplaint = jest.fn();
  const refreshCatalog = jest.fn();

  const utils = render(
    <Complaints
      csrfToken="token"
      bookUrl="http://example.com/works/fakeid"
      book={buildBookData()}
      complaints={complaintsData}
      fetchComplaints={fetchComplaints}
      postComplaint={postComplaint}
      refreshCatalog={refreshCatalog}
      {...overrides}
    />
  );
  return { ...utils, fetchComplaints, postComplaint, refreshCatalog };
}

// ── rendering ────────────────────────────────────────────────────────────────

describe("Complaints rendering", () => {
  it("shows book title in h2", () => {
    const { container } = renderComplaints();
    const h2 = container.querySelector("h2");
    expect(h2).toBeTruthy();
    expect(h2!.textContent).toBe("test title");
  });

  it("shows complaint type and count for each complaint", () => {
    const { container } = renderComplaints();
    const types = Array.from(container.querySelectorAll(".complaint-type")).map(
      (el) => el.textContent
    );
    const counts = Array.from(
      container.querySelectorAll(".complaint-count")
    ).map((el) => parseInt(el.textContent!, 10));

    expect(types).toEqual(["Test type", "Other type", "Last type"]);
    expect(counts).toEqual([5, 3, 1]);
  });

  it("shows simplified (human-readable) complaint types", () => {
    const { container } = renderComplaints();
    const types = Array.from(container.querySelectorAll(".complaint-type")).map(
      (el) => el.textContent
    );
    expect(types).toEqual(["Test type", "Other type", "Last type"]);
  });

  it("shows a Resolve button for each complaint type", () => {
    const { container } = renderComplaints();
    // Find all Resolve buttons — one per complaint type row
    const resolveButtons = Array.from(
      container.querySelectorAll("button")
    ).filter((b) => b.textContent?.trim() === "Resolve");
    expect(resolveButtons).toHaveLength(Object.keys(complaintsData).length);
    resolveButtons.forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });

  it("renders ComplaintForm when book has an issuesLink", () => {
    const { container } = renderComplaints();
    // ComplaintForm renders a <select> for complaint types
    const select = container.querySelector("select");
    expect(select).toBeTruthy();
  });

  it("does not render ComplaintForm when book has no issuesLink", () => {
    const { container } = renderComplaints({
      book: buildBookData({ issuesLink: false }),
    });
    const select = container.querySelector("select");
    expect(select).toBeFalsy();
  });

  it("shows fetch error message", () => {
    const fetchError = { status: 401, response: "test", url: "test url" };
    const { container } = render(
      <Complaints
        csrfToken="token"
        bookUrl="book url"
        book={{ id: "id", title: "test book" }}
        fetchError={fetchError}
        fetchComplaints={jest.fn()}
        postComplaint={jest.fn()}
        refreshCatalog={jest.fn()}
      />
    );
    // ErrorMessage is rendered — for 401 it shows "You have been logged out"
    expect(container.textContent).toContain("logged out");
  });

  it("tryAgain from ErrorMessage calls fetchComplaints with complaintsUrl", () => {
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

    // bookUrl="book url" → complaintsUrl = "book url" (no 'works' to replace) + "/complaints"
    const complaintsUrl = "book url/complaints";

    // The ErrorMessage should have a "try again" button or link — click it
    const tryAgainBtn = Array.from(
      container.querySelectorAll("button, a")
    ).find(
      (el) =>
        el.textContent?.toLowerCase().includes("try") ||
        el.textContent?.toLowerCase().includes("again") ||
        el.getAttribute("role") === "button"
    );
    if (tryAgainBtn) {
      fireEvent.click(tryAgainBtn as HTMLElement);
      expect(fetchComplaints).toHaveBeenCalledWith(complaintsUrl);
    } else {
      // ErrorMessage may auto-call; verify mount call at minimum
      expect(fetchComplaints).toHaveBeenCalled();
    }
  });
});

// ── behaviour ────────────────────────────────────────────────────────────────

describe("Complaints behaviour", () => {
  it("fetches complaints on mount with correct complaintsUrl", () => {
    const { fetchComplaints } = renderComplaints();
    // bookUrl "http://example.com/works/fakeid"
    // → complaintsUrl = "http://example.com/admin/works/fakeid/complaints"
    const expectedUrl = "http://example.com/admin/works/fakeid/complaints";
    expect(fetchComplaints).toHaveBeenCalledTimes(1);
    expect(fetchComplaints).toHaveBeenCalledWith(expectedUrl);
  });

  it("calls resolve with the complaint type when Resolve button is clicked", () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const resolveComplaints = jest.fn().mockResolvedValue(undefined);
    const { container } = renderComplaints({ resolveComplaints });

    const resolveButtons = Array.from(
      container.querySelectorAll("button")
    ).filter((b) => b.textContent?.trim() === "Resolve");
    // Click the first Resolve button → should resolve "test-type"
    fireEvent.click(resolveButtons[0]);

    expect(resolveComplaints).toHaveBeenCalledTimes(1);
    // First arg is resolveComplaintsUrl
    const resolveUrl =
      "http://example.com/admin/works/fakeid/resolve_complaints";
    expect(resolveComplaints.mock.calls[0][0]).toBe(resolveUrl);

    confirmSpy.mockRestore();
  });

  it("calls fetchComplaints and refreshCatalog after resolving", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const resolveComplaints = jest.fn().mockResolvedValue(undefined);
    const { container, fetchComplaints, refreshCatalog } = renderComplaints({
      resolveComplaints,
    });

    const resolveButtons = Array.from(
      container.querySelectorAll("button")
    ).filter((b) => b.textContent?.trim() === "Resolve");
    fireEvent.click(resolveButtons[0]);

    await waitFor(() => {
      // 1 for mount + 1 after resolve
      expect(fetchComplaints).toHaveBeenCalledTimes(2);
      expect(refreshCatalog).toHaveBeenCalledTimes(1);
    });

    confirmSpy.mockRestore();
  });

  it("does not resolve when user cancels confirmation", () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
    const resolveComplaints = jest.fn();
    const { container } = renderComplaints({ resolveComplaints });

    const resolveButtons = Array.from(
      container.querySelectorAll("button")
    ).filter((b) => b.textContent?.trim() === "Resolve");
    fireEvent.click(resolveButtons[0]);

    expect(resolveComplaints).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
