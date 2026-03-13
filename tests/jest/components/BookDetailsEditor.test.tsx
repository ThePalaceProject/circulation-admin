import * as React from "react";
import { render, screen } from "@testing-library/react";
import { BookDetailsEditor } from "../../../src/components/book/BookDetailsEditor";
import {
  PER_LIBRARY_SUPPRESS_REL,
  PER_LIBRARY_UNSUPPRESS_REL,
} from "../../../src/features/book/bookEditorSlice";

// Mock BookEditForm to avoid pulling in Draft.js / EditorField complexity.
// BookEditForm is tested in its own suite.
jest.mock("../../../src/components/book/BookEditForm", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  function BookEditFormMock(props: any) {
    return (
      <div
        data-testid="book-edit-form"
        data-title={props.title}
        data-roles={JSON.stringify(props.roles ?? null)}
        data-media={JSON.stringify(props.media ?? null)}
        data-languages={JSON.stringify(props.languages ?? null)}
      />
    );
  }
  return BookEditFormMock;
});

// ── Fixtures ─────────────────────────────────────────────────────────────────
function makeDispatchProps() {
  return {
    fetchBookData: jest.fn(),
    fetchRoles: jest.fn(),
    fetchMedia: jest.fn(),
    fetchLanguages: jest.fn(),
    postBookData: jest.fn().mockResolvedValue({}),
    suppressBook: jest.fn(),
    unsuppressBook: jest.fn(),
    refreshCatalog: jest.fn(),
  };
}

function renderEditor(
  overrides: Partial<React.ComponentProps<typeof BookDetailsEditor>> = {}
) {
  const dispatch = makeDispatchProps();
  // Provide default values for all required props (including Redux-mapped state props)
  const defaultProps = {
    // OwnProps
    bookUrl: "works/1234",
    csrfToken: "token",
    canSuppress: true,
    // Mapped state props (would normally come from Redux)
    bookAdminUrl: "",
    bookData: undefined,
    roles: null,
    media: null,
    languages: null,
    isFetching: false,
    fetchError: null,
    editError: null,
    // Dispatch props
    ...dispatch,
    // Allow test-specific overrides
    ...overrides,
  } as React.ComponentProps<typeof BookDetailsEditor>;
  render(<BookDetailsEditor {...defaultProps} />);
  return dispatch;
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("BookDetailsEditor", () => {
  it("fetches book data, roles, media, and languages on mount", () => {
    const {
      fetchBookData,
      fetchRoles,
      fetchMedia,
      fetchLanguages,
    } = renderEditor();

    expect(fetchBookData).toHaveBeenCalledTimes(1);
    expect(fetchBookData).toHaveBeenCalledWith("admin/works/1234");
    expect(fetchRoles).toHaveBeenCalledTimes(1);
    expect(fetchMedia).toHaveBeenCalledTimes(1);
    expect(fetchLanguages).toHaveBeenCalledTimes(1);
  });

  it("re-fetches book data when bookUrl changes", () => {
    const fetchBookData = jest.fn();
    const baseProps = {
      bookUrl: "works/1234",
      csrfToken: "token",
      canSuppress: true,
      bookAdminUrl: "",
      bookData: undefined,
      roles: null,
      media: null,
      languages: null,
      isFetching: false,
      fetchError: null,
      editError: null,
      fetchBookData,
      fetchRoles: jest.fn(),
      fetchMedia: jest.fn(),
      fetchLanguages: jest.fn(),
      postBookData: jest.fn().mockResolvedValue({}),
      suppressBook: jest.fn(),
      unsuppressBook: jest.fn(),
      refreshCatalog: jest.fn(),
    } as React.ComponentProps<typeof BookDetailsEditor>;

    const { rerender } = render(<BookDetailsEditor {...baseProps} />);
    expect(fetchBookData).toHaveBeenCalledWith("admin/works/1234");

    rerender(<BookDetailsEditor {...baseProps} bookUrl="works/5555" />);
    expect(fetchBookData).toHaveBeenCalledWith("admin/works/5555");
  });

  it("shows the book title", () => {
    renderEditor({ bookData: { id: "id", title: "Test Book Title" } });
    expect(screen.getByRole("heading", { level: 2 }).textContent).toContain(
      "Test Book Title"
    );
  });

  it("shows Hide button when suppressPerLibraryLink is present and canSuppress=true", () => {
    renderEditor({
      bookData: {
        id: "id",
        title: "title",
        suppressPerLibraryLink: { href: "href", rel: PER_LIBRARY_SUPPRESS_REL },
      },
      canSuppress: true,
    });
    expect(screen.getByRole("button", { name: /Hide/i })).toBeInTheDocument();
  });

  it("shows Restore button in visibility banner when unsuppressPerLibraryLink and visibilityStatus=manually-suppressed", () => {
    renderEditor({
      bookData: {
        id: "id",
        title: "title",
        unsuppressPerLibraryLink: {
          href: "href",
          rel: PER_LIBRARY_UNSUPPRESS_REL,
        },
        visibilityStatus: "manually-suppressed",
      },
      canSuppress: true,
    });
    expect(
      screen.getByRole("button", { name: /Restore/i })
    ).toBeInTheDocument();
    expect(
      document.querySelector(".visibility-status-manually-suppressed")
    ).toBeTruthy();
  });

  it("shows manually-suppressed banner (restore) when unsuppressLink present without visibilityStatus", () => {
    renderEditor({
      bookData: {
        id: "id",
        title: "title",
        unsuppressPerLibraryLink: {
          href: "href",
          rel: PER_LIBRARY_UNSUPPRESS_REL,
        },
      },
      canSuppress: true,
    });
    expect(
      document.querySelector(".visibility-status-manually-suppressed")
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Restore/i })
    ).toBeInTheDocument();
  });

  it("shows manually-suppressed banner WITHOUT restore button when no unsuppressLink", () => {
    renderEditor({
      bookData: {
        id: "id",
        title: "title",
        visibilityStatus: "manually-suppressed",
        // no unsuppressPerLibraryLink
      },
      canSuppress: true,
    });
    expect(
      document.querySelector(".visibility-status-manually-suppressed")
    ).toBeTruthy();
    expect(
      document.querySelector(".visibility-status-manually-suppressed")
        .textContent
    ).toContain("manually hidden");
    expect(screen.queryByRole("button", { name: /Restore/i })).toBeNull();
  });

  it("shows policy-filtered banner without restore button", () => {
    renderEditor({
      bookData: {
        id: "id",
        title: "title",
        visibilityStatus: "policy-filtered",
      },
      canSuppress: true,
    });
    const banner = document.querySelector(".visibility-status-policy-filtered");
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain("content filtering");
    expect(screen.queryByRole("button", { name: /Restore/i })).toBeNull();
  });

  it("shows Refresh Metadata button when refreshLink is present", () => {
    renderEditor({
      bookData: {
        id: "id",
        title: "title",
        refreshLink: {
          href: "href",
          rel: "http://librarysimplified/terms/rel/refresh",
        },
      },
    });
    expect(
      screen.getByRole("button", { name: /Refresh Metadata/i })
    ).toBeInTheDocument();
  });

  it("shows fetch error message (no BookEditForm)", () => {
    renderEditor({
      bookData: { id: "id", title: "title" },
      fetchError: { status: 500, response: "error", url: "" },
    });
    expect(screen.queryByTestId("book-edit-form")).toBeNull();
    // ErrorMessage renders with role="alert" (shadcn Alert) or similar
    expect(
      document.querySelector(".alert-danger, [role='alert']")
    ).toBeTruthy();
  });

  it("shows edit error message alongside the BookEditForm", () => {
    renderEditor({
      bookData: {
        id: "id",
        title: "title",
        editLink: {
          href: "href",
          rel: "http://librarysimplified.org/terms/rel/edit",
        },
      },
      editError: { status: 500, response: "error", url: "" },
    });
    expect(screen.getByTestId("book-edit-form")).toBeInTheDocument();
    expect(
      document.querySelector(".alert-danger, [role='alert']")
    ).toBeTruthy();
  });

  it("shows BookEditForm with roles, media, and languages when editLink is present", () => {
    const roles = { aut: "Author", nar: "Narrator" };
    const media = { "http://schema.org/Book": "Book" };
    const languages = { eng: ["English"] };
    renderEditor({
      bookData: {
        id: "id",
        title: "The Book",
        editLink: {
          href: "href",
          rel: "http://librarysimplified.org/terms/rel/edit",
        },
      },
      roles,
      media,
      languages,
    });
    const form = screen.getByTestId("book-edit-form");
    expect(form.getAttribute("data-title")).toBe("The Book");
    expect(JSON.parse(form.getAttribute("data-roles"))).toEqual(roles);
    expect(JSON.parse(form.getAttribute("data-media"))).toEqual(media);
    expect(JSON.parse(form.getAttribute("data-languages"))).toEqual(languages);
  });
});
