import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BookCoverEditor } from "../../../src/components/book/BookCoverEditor";
import { BookData, RightsStatusData } from "../../../src/interfaces";

// ── Fixtures ─────────────────────────────────────────────────────────────────
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

function renderEditor(
  overrides: Partial<React.ComponentProps<typeof BookCoverEditor>> = {}
) {
  const clearPreview = jest.fn();
  const fetchPreview = jest.fn();
  const editCover = jest.fn().mockResolvedValue({});
  const fetchRightsStatuses = jest.fn();
  const fetchBook = jest.fn();
  const refreshCatalog = jest.fn();

  const defaultProps: React.ComponentProps<typeof BookCoverEditor> = {
    csrfToken: "token",
    bookUrl: "/book",
    book: bookData,
    refreshCatalog,
    bookAdminUrl: "/admin/book",
    preview: null,
    rightsStatuses,
    isFetching: false,
    fetchError: null,
    isFetchingPreview: false,
    previewFetchError: null,
    fetchBook,
    fetchPreview,
    clearPreview,
    editCover,
    fetchRightsStatuses,
    ...overrides,
  };

  const result = render(<BookCoverEditor {...defaultProps} />);
  return {
    clearPreview,
    fetchPreview,
    editCover,
    fetchRightsStatuses,
    fetchBook,
    refreshCatalog,
    ...result,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("BookCoverEditor", () => {
  describe("rendering", () => {
    it("shows book title", () => {
      renderEditor();
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
        "title"
      );
    });

    it("shows the current cover image", () => {
      renderEditor();
      const coverImg = document.querySelector(
        "img.current-cover"
      ) as HTMLImageElement;
      expect(coverImg).toBeTruthy();
      expect(coverImg.src).toContain("/cover");
      expect(coverImg.alt).toBe("Current book cover");
    });

    it("shows cover URL and cover file inputs", () => {
      renderEditor();
      const urlInput = document.querySelector(
        "input[name='cover_url']"
      ) as HTMLInputElement;
      const fileInput = document.querySelector(
        "input[name='cover_file']"
      ) as HTMLInputElement;
      expect(urlInput).toBeTruthy();
      expect(urlInput.type).toBe("text");
      expect(fileInput).toBeTruthy();
      expect(fileInput.type).toBe("file");
      expect(fileInput.accept).toBe("image/*");
    });

    it("shows title position select with None/Top/Center/Bottom options", () => {
      renderEditor();
      const select = document.querySelector(
        "select[name='title_position']"
      ) as HTMLSelectElement;
      expect(select).toBeTruthy();
      const options = select.querySelectorAll("option");
      expect(options.length).toBe(4);
      expect(options[0].value).toBe("none");
      expect(options[1].value).toBe("top");
      expect(options[2].value).toBe("center");
      expect(options[3].value).toBe("bottom");
    });

    it("does not show preview image when preview prop is null", () => {
      renderEditor();
      expect(document.querySelector("img.preview-cover")).toBeNull();
    });

    it("shows preview image when preview prop is set", () => {
      renderEditor({ preview: "data:image/png;base64,abc" });
      const preview = document.querySelector(
        "img.preview-cover"
      ) as HTMLImageElement;
      expect(preview).toBeTruthy();
      expect(preview.src).toContain("data:image/png;base64,abc");
      expect(preview.alt).toBe("Preview of new cover");
    });

    it("shows rights status select with 3 options", () => {
      renderEditor();
      const select = document.querySelector(
        "select[name='rights_status']"
      ) as HTMLSelectElement;
      expect(select).toBeTruthy();

      const options = select.querySelectorAll("option");
      expect(options.length).toBe(3);
      // CC BY (allows_derivatives: true) → rendered first
      expect(options[0].value).toBe(
        "http://creativecommons.org/licenses/by/4.0/"
      );
      expect(options[0].textContent).toContain(
        "Creative Commons Attribution (CC BY)"
      );
      // Hardcoded In Copyright
      expect(options[1].value).toBe(
        "http://librarysimplified.org/terms/rights-status/in-copyright"
      );
      expect(options[1].textContent).toBe("In Copyright");
      // Hardcoded Other
      expect(options[2].value).toBe(
        "http://librarysimplified.org/terms/rights-status/unknown"
      );
      expect(options[2].textContent).toBe("Other");
    });

    it("shows rights explanation textarea", () => {
      renderEditor();
      const textarea = document.querySelector(
        "textarea[name='rights_explanation']"
      );
      expect(textarea).toBeTruthy();
    });

    it("shows fetch error when fetchError prop is set", () => {
      renderEditor({
        fetchError: { status: 500, url: "url", response: "error" },
      });
      expect(
        document.querySelector(".alert-danger, [role='alert'], .error-message")
      ).toBeTruthy();
    });

    it("shows preview fetch error when previewFetchError prop is set", () => {
      renderEditor({
        previewFetchError: { status: 500, url: "url", response: "error" },
      });
      expect(
        document.querySelector(".alert-danger, [role='alert'], .error-message")
      ).toBeTruthy();
    });

    it("save button is disabled when there is no preview", () => {
      renderEditor({ preview: null });
      const saveButton = screen.getByRole("button", {
        name: /save this cover/i,
      });
      expect(saveButton).toBeDisabled();
    });

    it("save button is enabled when preview is set", () => {
      renderEditor({ preview: "image data" });
      const saveButton = screen.getByRole("button", {
        name: /save this cover/i,
      });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe("lifecycle", () => {
    it("calls clearPreview on mount", () => {
      const { clearPreview } = renderEditor();
      expect(clearPreview).toHaveBeenCalledTimes(1);
    });

    it("calls fetchRightsStatuses on mount", () => {
      const { fetchRightsStatuses } = renderEditor();
      expect(fetchRightsStatuses).toHaveBeenCalledTimes(1);
    });
  });

  describe("preview behavior", () => {
    it("calls fetchPreview with the preview URL and FormData when cover URL is entered", async () => {
      const { fetchPreview } = renderEditor();

      const urlInput = document.querySelector(
        "input[name='cover_url']"
      ) as HTMLInputElement;
      fireEvent.change(urlInput, { target: { value: "http://example.com" } });

      const previewButton = screen.getByRole("button", { name: /Preview/i });
      await act(async () => {
        fireEvent.click(previewButton);
      });

      expect(fetchPreview).toHaveBeenCalledTimes(1);
      expect(fetchPreview.mock.calls[0][0]).toBe(
        "/admin/book/preview_book_cover"
      );

      const formData: FormData = fetchPreview.mock.calls[0][1];
      expect(formData.get("cover_url")).toBe("http://example.com");
    });

    it("calls clearPreview instead of fetchPreview when cover URL is empty", async () => {
      const { fetchPreview, clearPreview } = renderEditor();
      // clear any call from mount
      clearPreview.mockClear();

      const previewButton = screen.getByRole("button", { name: /Preview/i });
      await act(async () => {
        fireEvent.click(previewButton);
      });

      expect(fetchPreview).not.toHaveBeenCalled();
      expect(clearPreview).toHaveBeenCalledTimes(1);
    });
  });

  describe("save behavior", () => {
    it("calls editCover with the changeCoverLink href and FormData when save is clicked", async () => {
      const { editCover } = renderEditor({ preview: "image data" });

      // Set a value for cover_url so FormData has it
      const urlInput = document.querySelector(
        "input[name='cover_url']"
      ) as HTMLInputElement;
      fireEvent.change(urlInput, { target: { value: "http://example.com" } });

      // Set title position
      const titlePosSelect = document.querySelector(
        "select[name='title_position']"
      ) as HTMLSelectElement;
      fireEvent.change(titlePosSelect, { target: { value: "center" } });

      const saveButton = screen.getByRole("button", {
        name: /save this cover/i,
      });
      await act(async () => {
        fireEvent.click(saveButton);
      });

      expect(editCover).toHaveBeenCalledTimes(1);
      expect(editCover.mock.calls[0][0]).toBe("/change_cover");

      const formData: FormData = editCover.mock.calls[0][1];
      expect(formData.get("cover_url")).toBe("http://example.com");
      expect(formData.get("title_position")).toBe("center");
    });

    it("calls fetchBook and refreshCatalog after a successful save", async () => {
      const { editCover, fetchBook, refreshCatalog } = renderEditor({
        preview: "image data",
      });

      const saveButton = screen.getByRole("button", {
        name: /save this cover/i,
      });
      await act(async () => {
        fireEvent.click(saveButton);
        await Promise.resolve(); // flush microtasks
      });

      expect(editCover).toHaveBeenCalledTimes(1);
      expect(fetchBook).toHaveBeenCalledTimes(1);
      expect(fetchBook).toHaveBeenCalledWith("/admin/book");
      expect(refreshCatalog).toHaveBeenCalledTimes(1);
    });
  });
});
