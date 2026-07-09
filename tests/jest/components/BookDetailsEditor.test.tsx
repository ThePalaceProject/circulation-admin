import * as React from "react";
import { render, screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
import {
  PER_LIBRARY_SUPPRESS_REL,
  PER_LIBRARY_UNSUPPRESS_REL,
} from "../../../src/features/book/bookEditorSlice";

// BookEditForm is a heavy child; the legacy enzyme tests only shallow-rendered
// it and asserted the props it received. Mock it to a marker that surfaces those
// props as data attributes so the same facts can be asserted against real DOM.
jest.mock("../../../src/components/BookEditForm", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="book-edit-form"
      data-title={props.title}
      data-roles={JSON.stringify(props.roles ?? null)}
      data-media={JSON.stringify(props.media ?? null)}
      data-languages={JSON.stringify(props.languages ?? null)}
    />
  ),
}));

import BookDetailsEditor, {
  BookDetailsEditor as UnconnectedBookDetailsEditor,
} from "../../../src/components/BookDetailsEditor";

// The connected component derives bookData from OPDS parsing of a fetch, which is
// impractical to synthesize; render the unconnected class with injected props for
// the render-behavior tests (as the legacy enzyme tests did), and cover the
// connect wiring with the dedicated connected test below.
const renderEditor = (overrides: Record<string, unknown> = {}) => {
  const props = {
    bookUrl: "url",
    csrfToken: "token",
    canSuppress: true,
    bookAdminUrl: "admin url",
    bookData: undefined,
    roles: undefined,
    media: undefined,
    languages: undefined,
    isFetching: false,
    fetchError: undefined,
    editError: undefined,
    refreshCatalog: jest.fn().mockResolvedValue(undefined),
    fetchBookData: jest.fn(),
    fetchRoles: jest.fn(),
    fetchMedia: jest.fn(),
    fetchLanguages: jest.fn(),
    postBookData: jest.fn(),
    suppressBook: jest.fn(),
    unsuppressBook: jest.fn(),
    ...overrides,
  };
  const result = render(<UnconnectedBookDetailsEditor {...(props as any)} />);
  return { props, ...result };
};

describe("BookDetailsEditor", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads admin book url, roles, languages, and media on mount", () => {
    const { props } = renderEditor({ bookUrl: "works/1234" });

    expect(props.fetchBookData).toHaveBeenCalledTimes(1);
    expect(props.fetchBookData).toHaveBeenCalledWith("admin/works/1234");
    expect(props.fetchRoles).toHaveBeenCalledTimes(1);
    expect(props.fetchMedia).toHaveBeenCalledTimes(1);
    expect(props.fetchLanguages).toHaveBeenCalledTimes(1);
  });

  it("loads admin book url when given a new book url", () => {
    const { props, rerender } = renderEditor({ bookUrl: "works/1234" });
    rerender(
      <UnconnectedBookDetailsEditor {...(props as any)} bookUrl="works/5555" />
    );

    expect(props.fetchBookData).toHaveBeenCalledTimes(2);
    expect((props.fetchBookData as jest.Mock).mock.calls[1][0]).toBe(
      "admin/works/5555"
    );
  });

  it("shows the title", () => {
    renderEditor({ bookData: { id: "id", title: "title" } });
    expect(
      screen.getByRole("heading", { level: 2, name: "title" })
    ).toBeInTheDocument();
  });

  it("shows a Hide button for a per-library suppress link", () => {
    renderEditor({
      bookData: {
        id: "id",
        title: "title",
        suppressPerLibraryLink: { href: "href", rel: PER_LIBRARY_SUPPRESS_REL },
      },
    });
    expect(screen.getByRole("button", { name: "Hide" })).toBeInTheDocument();
  });

  it("shows a Restore button in the visibility banner for a per-library unsuppress link", () => {
    const { container } = renderEditor({
      bookData: {
        id: "id",
        title: "title",
        unsuppressPerLibraryLink: {
          href: "href",
          rel: PER_LIBRARY_UNSUPPRESS_REL,
        },
        visibilityStatus: "manually-suppressed",
      },
    });
    expect(container.querySelector(".visibility-status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Restore" })).toBeInTheDocument();
  });

  it("shows the restore banner when an unsuppress link exists without a visibilityStatus", () => {
    const { container } = renderEditor({
      bookData: {
        id: "id",
        title: "title",
        unsuppressPerLibraryLink: {
          href: "href",
          rel: PER_LIBRARY_UNSUPPRESS_REL,
        },
      },
    });
    expect(
      container.querySelector(".visibility-status-manually-suppressed")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Restore" })).toBeInTheDocument();
  });

  it("shows the manually-suppressed banner without a restore button when there is no unsuppress link", () => {
    const { container } = renderEditor({
      bookData: {
        id: "id",
        title: "title",
        visibilityStatus: "manually-suppressed",
      },
    });
    const banner = container.querySelector(
      ".visibility-status-manually-suppressed"
    );
    expect(banner).toBeInTheDocument();
    expect(banner.textContent).toContain(
      "manually hidden by a library staff member"
    );
    expect(
      screen.queryByRole("button", { name: "Restore" })
    ).not.toBeInTheDocument();
  });

  it("shows the policy-filtered banner without a restore button", () => {
    const { container } = renderEditor({
      bookData: {
        id: "id",
        title: "title",
        visibilityStatus: "policy-filtered",
      },
    });
    const banner = container.querySelector(
      ".visibility-status-policy-filtered"
    );
    expect(banner).toBeInTheDocument();
    expect(banner.textContent).toContain("library content filtering");
    expect(
      screen.queryByRole("button", { name: "Restore" })
    ).not.toBeInTheDocument();
  });

  it("shows a Refresh Metadata button for a refresh link", () => {
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
      screen.getByRole("button", { name: "Refresh Metadata" })
    ).toBeInTheDocument();
  });

  it("shows a fetch error message and no edit form", () => {
    renderEditor({
      bookData: { id: "id", title: "title" },
      fetchError: { status: 500, response: "response", url: "" },
    });
    expect(screen.getByText(/Error: response/)).toBeInTheDocument();
    expect(screen.queryByTestId("book-edit-form")).not.toBeInTheDocument();
  });

  it("shows an edit error message together with the edit form", () => {
    renderEditor({
      bookData: {
        id: "id",
        title: "title",
        editLink: {
          href: "href",
          rel: "http://librarysimplified.org/terms/rel/edit",
        },
      },
      editError: { status: 500, response: "response", url: "" },
    });
    expect(screen.getByTestId("book-edit-form")).toBeInTheDocument();
    expect(screen.getByText(/Error: response/)).toBeInTheDocument();
  });

  it("shows the book edit form with roles, media, and languages", () => {
    const roles = { aut: "Author", nar: "Narrator" };
    const media = {
      "http://schema.org/AudioObject": "Audio",
      "http://schema.org/Book": "Book",
    };
    const languages = { eng: ["English"], spa: ["Spanish", "Castilian"] };
    renderEditor({
      bookData: {
        id: "id",
        title: "title",
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
    expect(form).toHaveAttribute("data-title", "title");
    expect(JSON.parse(form.getAttribute("data-roles"))).toStrictEqual(roles);
    expect(JSON.parse(form.getAttribute("data-media"))).toStrictEqual(media);
    expect(JSON.parse(form.getAttribute("data-languages"))).toStrictEqual(
      languages
    );
  });

  it("wires up the connected default export (mapStateToProps / mapDispatchToProps)", async () => {
    // Stub fetch so mounting the connected panel does not hit the network. The
    // roles/media/languages endpoints return JSON; the book endpoint returns a
    // non-OPDS body so getBookData rejects (handled) and surfaces a fetch error.
    jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response("{}", { status: 200 }));

    const store = buildStore();
    renderWithProviders(
      <BookDetailsEditor
        store={store}
        bookUrl="works/1234"
        csrfToken="token"
        canSuppress={true}
        refreshCatalog={jest.fn().mockResolvedValue(undefined)}
      />,
      { reduxProviderProps: { store } }
    );

    // getBookData's OPDS parse fails on the non-OPDS body, so mapStateToProps
    // feeds the resulting fetch error back in and the panel renders an error.
    expect(
      await screen.findByText(/Failed to parse OPDS data/)
    ).toBeInTheDocument();
  });
});
