import * as React from "react";
import { installFormDataShim } from "../testUtils/formDataShim";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
// Render the CONNECTED default export so that mapStateToProps / mapDispatchToProps
// are exercised: `preview`, `rightsStatuses`, `isFetching`, the fetch errors, and
// `bookAdminUrl` are all fed in through the Redux store, while `book`, `bookUrl`,
// `csrfToken`, and `refreshCatalog` are own props.
import BookCoverEditor from "../../../src/components/BookCoverEditor";
import { BookData, RightsStatusData } from "../../../src/interfaces";
// The reusable-components `Form` builds `new FormData(formElement)` on
// submit, which the unit jsdom env's undici FormData rejects; install the
// shared shim that reads the form's successful controls.
installFormDataShim();
const rightsStatuses: RightsStatusData = {
  "http://creativecommons.org/licenses/by/4.0/": {
    allows_derivatives: true,
    name: "Creative Commons Attribution (CC BY)",
    open_access: true,
  },
  "http://librarysimplified.org/terms/rights-status/in-copyright": {
    allows_derivatives: false,
    name: "In Copyright",
    open_access: false,
  },
  "https://creativecommons.org/licenses/by-nd/4.0": {
    allows_derivatives: false,
    name: "Creative Commons Attribution-NoDerivs (CC BY-ND)",
    open_access: true,
  },
};

const bookData: BookData = {
  id: "id",
  title: "title",
  coverUrl: "/cover",
  changeCoverLink: {
    href: "/change_cover",
    rel: "http://librarysimplified.org/terms/rel/change_cover",
  },
};

describe("BookCoverEditor", () => {
  let fetchSpy: jest.SpyInstance;

  // The connected component fetches the rights statuses on mount and posts the
  // cover preview / edited cover. Serve those endpoints and answer anything else
  // (e.g. the OPDS book re-fetch) benignly so nothing rejects after teardown.
  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, "fetch").mockImplementation((async (
      url: string
    ) => {
      const u = String(url);
      if (u.includes("rights_status")) {
        return new Response(JSON.stringify(rightsStatuses), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (u.includes("preview_book_cover")) {
        return new Response("image data", { status: 200 });
      }
      return new Response("", { status: 200 });
    }) as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Each test gets a fresh store so state does not leak. `preSeed` runs before
  // mount; note the component clears the preview on mount, so preview-slice state
  // must be dispatched after render instead.
  const renderEditor = (
    preSeed?: (store: ReturnType<typeof buildStore>) => void
  ) => {
    const store = buildStore();
    preSeed?.(store);
    const refreshCatalog = jest.fn().mockResolvedValue(undefined);
    const utils = renderWithProviders(
      <BookCoverEditor
        csrfToken="token"
        bookUrl="/book"
        book={bookData}
        refreshCatalog={refreshCatalog}
      />,
      { reduxProviderProps: { store } }
    );
    return { store, refreshCatalog, ...utils };
  };

  // The rights inputs only appear once the on-mount fetch resolves; awaiting them
  // both settles that fetch and confirms the rights statuses were fetched.
  const awaitMounted = () =>
    screen.findByText("License") as Promise<HTMLElement>;

  describe("rendering", () => {
    it("shows the book title", async () => {
      renderEditor();
      await awaitMounted();
      expect(
        screen.getByRole("heading", { level: 2, name: "title" })
      ).toBeInTheDocument();
    });

    it("shows the current cover", async () => {
      const { container } = renderEditor();
      await awaitMounted();
      const cover = container.querySelector(".current-cover");
      expect(cover).toBeInTheDocument();
      expect(cover).toHaveAttribute("src", bookData.coverUrl);
      expect(cover).toHaveAttribute("alt", "Current book cover");
    });

    it("shows the cover URL and cover file inputs", async () => {
      const { container } = renderEditor();
      await awaitMounted();

      expect(screen.getByText("URL for cover image")).toBeInTheDocument();
      expect(
        container.querySelector('input[name="cover_url"]')
      ).toBeInTheDocument();

      expect(screen.getByText("Or upload cover image")).toBeInTheDocument();
      const fileInput = container.querySelector('input[name="cover_file"]');
      expect(fileInput).toHaveAttribute("type", "file");
      expect(fileInput).toHaveAttribute("accept", "image/*");
    });

    it("shows the title position select", async () => {
      const { container } = renderEditor();
      await awaitMounted();

      expect(screen.getByText("Title and Author Position")).toBeInTheDocument();
      const select = container.querySelector('select[name="title_position"]');
      expect(select).toBeInTheDocument();
      const options = select.querySelectorAll("option");
      expect(Array.from(options).map((o) => o.getAttribute("value"))).toEqual([
        "none",
        "top",
        "center",
        "bottom",
      ]);
    });

    it("shows the rights inputs", async () => {
      const { container } = renderEditor();
      await awaitMounted();

      const rightsSelect = container.querySelector(
        'select[name="rights_status"]'
      );
      expect(rightsSelect).toBeInTheDocument();
      const options = Array.from(rightsSelect.querySelectorAll("option"));
      expect(options).toHaveLength(3);
      expect(options[0].getAttribute("value")).toBe(
        "http://creativecommons.org/licenses/by/4.0/"
      );
      expect(options[0].textContent).toBe(
        "Creative Commons Attribution (CC BY)"
      );
      expect(options[1].getAttribute("value")).toBe(
        "http://librarysimplified.org/terms/rights-status/in-copyright"
      );
      expect(options[1].textContent).toBe("In Copyright");
      expect(options[2].getAttribute("value")).toBe(
        "http://librarysimplified.org/terms/rights-status/unknown"
      );
      expect(options[2].textContent).toBe("Other");

      expect(screen.getByText("Explanation of rights")).toBeInTheDocument();
      expect(
        container.querySelector('textarea[name="rights_explanation"]')
      ).toBeInTheDocument();
    });

    it("shows the updating loader while fetching", async () => {
      const { container } = renderEditor((store) =>
        store.dispatch({ type: "BOOK_COVER_REQUEST" })
      );
      await awaitMounted();

      // Only the top loader (driven by `isFetching`) shows; the preview loader
      // (driven by `isFetchingPreview`) does not.
      const loaders = container.querySelectorAll(".updating-loader");
      expect(loaders).toHaveLength(1);
      expect(loaders[0]).toHaveTextContent("Updating");
      expect(loaders[0]).not.toHaveTextContent("Updating Preview");
    });

    it("shows the preview updating message", async () => {
      const { store, container } = renderEditor();
      await awaitMounted();
      expect(container.querySelectorAll(".updating-loader")).toHaveLength(0);

      act(() => {
        store.dispatch({ type: "PREVIEW_BOOK_COVER_REQUEST" });
      });

      const loaders = container.querySelectorAll(".updating-loader");
      expect(loaders).toHaveLength(1);
      expect(loaders[0]).toHaveTextContent("Updating Preview");
    });

    it("shows the preview once it is loaded", async () => {
      const { store, container } = renderEditor();
      await awaitMounted();
      expect(container.querySelector(".preview-cover")).toBeNull();

      act(() => {
        store.dispatch({ type: "PREVIEW_BOOK_COVER_LOAD", data: "image data" });
      });

      const preview = container.querySelector(".preview-cover");
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute("src", "image data");
      expect(preview).toHaveAttribute("alt", "Preview of new cover");
    });

    it("shows a fetch error", async () => {
      const { store } = renderEditor();
      await awaitMounted();
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();

      act(() => {
        store.dispatch({
          type: "BOOK_COVER_FAILURE",
          error: { status: 500, url: "url", response: "fetch failed" },
        });
      });

      expect(screen.getByText("Error: fetch failed")).toBeInTheDocument();
    });

    it("shows a preview fetch error", async () => {
      const { store } = renderEditor();
      await awaitMounted();
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();

      act(() => {
        store.dispatch({
          type: "PREVIEW_BOOK_COVER_FAILURE",
          error: { status: 500, url: "url", response: "preview failed" },
        });
      });

      expect(screen.getByText("Error: preview failed")).toBeInTheDocument();
    });

    it("enables the save button only once there is a preview", async () => {
      const { store } = renderEditor();
      await awaitMounted();

      const save = screen.getByRole("button", { name: "Save this cover" });
      expect(save).toBeDisabled();

      act(() => {
        store.dispatch({ type: "PREVIEW_BOOK_COVER_LOAD", data: "image data" });
      });

      expect(
        screen.getByRole("button", { name: "Save this cover" })
      ).toBeEnabled();
    });
  });

  describe("mount behavior", () => {
    it("fetches the rights statuses on mount", async () => {
      renderEditor();
      // The rights inputs only render after the statuses are fetched.
      expect(await screen.findByText("License")).toBeInTheDocument();
      expect(fetchSpy).toHaveBeenCalledWith(
        "/admin/rights_status",
        expect.anything()
      );
    });

    it("clears any stale preview on mount", async () => {
      const { store, container } = renderEditor((store) =>
        store.dispatch({ type: "PREVIEW_BOOK_COVER_LOAD", data: "stale" })
      );
      await awaitMounted();

      // The stale preview was cleared during mount, so it never renders.
      expect(container.querySelector(".preview-cover")).toBeNull();
      expect(store.getState().editor.bookCoverPreview.data).toBeNull();
    });
  });

  describe("behavior", () => {
    it("previews the cover when the inputs change and the button is clicked", async () => {
      const user = userEvent.setup();
      const { container } = renderEditor();
      await awaitMounted();

      await user.type(
        container.querySelector('input[name="cover_url"]'),
        "http://example.com"
      );
      await user.click(screen.getByRole("button", { name: "Preview" }));

      // The preview arrives from the store and is displayed.
      const preview = await screen.findByAltText("Preview of new cover");
      expect(preview).toHaveAttribute("src", "image data");

      // The preview was posted with the entered cover URL and title position.
      const previewCall = fetchSpy.mock.calls.find(([u]) =>
        String(u).includes("preview_book_cover")
      );
      expect(previewCall).toBeTruthy();
      expect(previewCall[1].method).toBe("POST");
      expect(previewCall[1].body.get("cover_url")).toBe("http://example.com");
      expect(previewCall[1].body.get("title_position")).toBe("none");
    });

    it("clears the preview when the inputs are emptied", async () => {
      const user = userEvent.setup();
      const { store } = renderEditor();
      await awaitMounted();
      // Seed a preview so we can observe it being cleared.
      act(() => {
        store.dispatch({ type: "PREVIEW_BOOK_COVER_LOAD", data: "image data" });
      });
      expect(screen.getByAltText("Preview of new cover")).toBeInTheDocument();

      // With no cover URL or file, submitting the preview form clears it.
      await user.click(screen.getByRole("button", { name: "Preview" }));

      await waitFor(() =>
        expect(
          screen.queryByAltText("Preview of new cover")
        ).not.toBeInTheDocument()
      );
      // No preview request was posted, since there was nothing to preview.
      expect(
        fetchSpy.mock.calls.some(([u]) =>
          String(u).includes("preview_book_cover")
        )
      ).toBe(false);
    });

    it("saves the cover with the entered values", async () => {
      const user = userEvent.setup();
      const { store, refreshCatalog } = renderEditor();
      await awaitMounted();

      // A preview must exist for the save button to be enabled.
      act(() => {
        store.dispatch({ type: "PREVIEW_BOOK_COVER_LOAD", data: "image data" });
      });

      await user.type(
        document.querySelector('input[name="cover_url"]') as HTMLElement,
        "http://example.com"
      );
      await user.selectOptions(
        document.querySelector('select[name="title_position"]') as HTMLElement,
        "center"
      );
      await user.selectOptions(
        document.querySelector('select[name="rights_status"]') as HTMLElement,
        "http://creativecommons.org/licenses/by/4.0/"
      );
      await user.type(
        document.querySelector(
          'textarea[name="rights_explanation"]'
        ) as HTMLElement,
        "explanation"
      );

      await user.click(screen.getByRole("button", { name: "Save this cover" }));

      // The edited cover is posted to the exact change-cover link with the form
      // values, and on success the catalog is refreshed.
      const editCall = fetchSpy.mock.calls.find(
        ([u]) => String(u) === bookData.changeCoverLink.href
      );
      expect(editCall).toBeTruthy();
      expect(editCall[1].method).toBe("POST");
      expect(editCall[1].body.get("cover_url")).toBe("http://example.com");
      expect(editCall[1].body.get("title_position")).toBe("center");
      expect(editCall[1].body.get("rights_status")).toBe(
        "http://creativecommons.org/licenses/by/4.0/"
      );
      expect(editCall[1].body.get("rights_explanation")).toBe("explanation");

      await waitFor(() => expect(refreshCatalog).toHaveBeenCalledTimes(1));
    });
  });
});
