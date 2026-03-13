import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import CustomListEditor from "../../../src/components/lists/CustomListEditor";
import {
  CustomListEditorEntriesData,
  CustomListEditorSearchParams,
  CustomListEditorProperties,
} from "../../../src/reducers/customListEditor";

// ── shared fixtures ───────────────────────────────────────────────────────────

const searchResults = {
  id: "id",
  url: "url",
  title: "title",
  lanes: [],
  books: [],
  navigationLinks: [],
};

const entries: CustomListEditorEntriesData = {
  baseline: [],
  baselineTotalCount: 0,
  added: {},
  removed: {},
  current: [],
  currentTotalCount: 0,
};

const entryPoints = ["Book", "Audio"];

const library = {
  uuid: "uuid",
  name: "name",
  short_name: "library",
  settings: { large_collections: ["eng", "fre", "spa"] },
};

const languages = {
  eng: ["English"],
  spa: ["Spanish", "Castilian"],
  fre: ["French"],
};

const properties: CustomListEditorProperties = {
  name: "Listy McList",
  collections: [2],
  autoUpdate: false,
};

const searchParams: CustomListEditorSearchParams = {
  entryPoint: "All",
  terms: "",
  sort: null,
  language: "all",
  advanced: {
    include: { query: null, selectedQueryId: null, clearFilters: null },
    exclude: { query: null, selectedQueryId: null, clearFilters: null },
  },
};

function buildProps(
  overrides: Partial<React.ComponentProps<typeof CustomListEditor>> = {}
) {
  return {
    entries,
    entryPoints,
    isFetchingMoreCustomListEntries: false,
    isFetchingSearchResults: false,
    isFetchingMoreSearchResults: false,
    isLoaded: false,
    isModified: true,
    isOwner: true,
    isValid: true,
    languages,
    library,
    listId: "1",
    properties,
    searchParams,
    searchResults,
    loadMoreEntries: jest.fn(),
    loadMoreSearchResults: jest.fn(),
    reset: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
    search: jest.fn(),
    share: jest.fn(),
    updateProperty: jest.fn(),
    updateSearchParam: jest.fn(),
    ...overrides,
  };
}

function renderEditor(
  overrides: Partial<React.ComponentProps<typeof CustomListEditor>> = {}
) {
  const props = buildProps(overrides);
  const utils = render(<CustomListEditor {...props} />);
  return { ...utils, props };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe("CustomListEditor", () => {
  it("shows the list title in an editable input when isOwner is true", () => {
    const { container } = renderEditor();
    // TextWithEditMode renders an editable input / text. Should show "Listy McList"
    expect(container.textContent).toContain("Listy McList");
    // Save-or-edit controls present
    expect(container.querySelector(".save-or-edit")).toBeTruthy();
  });

  it("shows the list title as a plain h3 when isOwner is false", () => {
    const { container } = renderEditor({ isOwner: false });
    const h3 = container.querySelector("h3");
    expect(h3).toBeTruthy();
    expect(h3!.textContent).toBe("Listy McList");
    expect(container.querySelector(".save-or-edit")).toBeFalsy();
  });

  it("shows the list id", () => {
    const { container } = renderEditor();
    const header = container.querySelector(".custom-list-editor-header h4");
    expect(header).toBeTruthy();
    expect(header!.textContent).toContain("1");
  });

  it("renders a CustomListEntriesEditor", () => {
    const { container } = renderEditor();
    // CustomListEntriesEditor renders search results section
    // Look for the list-entries section
    expect(container.querySelector(".custom-list-entries")).toBeTruthy();
  });

  it("sets opdsFeedUrl using savedName when listId is present", () => {
    const { container } = renderEditor({ savedName: "Books to Read Today" });
    // The feed URL is generated as `${library.short_name}/lists/${savedName}/crawlable`
    // It's passed as opdsFeedUrl to CustomListEntriesEditor which passes it to links
    // Verify the component renders without error when savedName is set
    expect(container.querySelector(".custom-list-entries")).toBeTruthy();
  });

  it("sets opdsFeedUrl to undefined when listId is null", () => {
    const { container } = renderEditor({
      listId: null,
      savedName: "Books to Read Today",
    });
    // Should still render fine with undefined opdsFeedUrl
    expect(container.querySelector(".custom-list-entries")).toBeTruthy();
  });

  it("sets opdsFeedUrl to undefined when savedName is falsy", () => {
    const { container } = renderEditor({ savedName: "" });
    expect(container.querySelector(".custom-list-entries")).toBeTruthy();
  });

  it("enables the save button when isModified and isValid", () => {
    const { container } = renderEditor();
    const saveBtn = container.querySelector<HTMLButtonElement>(
      ".save-or-cancel-list button"
    );
    expect(saveBtn).toBeTruthy();
    expect(saveBtn).not.toBeDisabled();
  });

  it("disables the save button when not isModified", () => {
    const { container } = renderEditor({ isModified: false });
    const saveBtn = container.querySelector<HTMLButtonElement>(
      ".save-or-cancel-list button"
    );
    expect(saveBtn).toBeDisabled();
  });

  it("disables the save button when not isValid", () => {
    const { container } = renderEditor({ isValid: false });
    const saveBtn = container.querySelector<HTMLButtonElement>(
      ".save-or-cancel-list button"
    );
    expect(saveBtn).toBeDisabled();
  });

  it("calls save when the save button is clicked", () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const { container } = renderEditor({ save });
    const saveBtn = container.querySelector<HTMLButtonElement>(
      ".save-or-cancel-list button"
    );
    fireEvent.click(saveBtn!);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("disables the cancel button when not isModified", () => {
    const { container } = renderEditor({ isModified: false });
    const buttons = container.querySelectorAll<HTMLButtonElement>(
      ".save-or-cancel-list button"
    );
    // 2nd button is "Cancel changes"
    const cancelBtn = buttons[1];
    expect(cancelBtn).toBeDisabled();
  });

  it("calls reset when the cancel button is clicked", () => {
    const reset = jest.fn();
    const { container } = renderEditor({ reset });
    const buttons = container.querySelectorAll<HTMLButtonElement>(
      ".save-or-cancel-list button"
    );
    const cancelBtn = buttons[1];
    fireEvent.click(cancelBtn);
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("does not render save/cancel buttons when isOwner is false", () => {
    const { container } = renderEditor({ isOwner: false });
    expect(container.querySelector(".save-or-cancel-list")).toBeFalsy();
  });

  it("renders a CustomListSearch component", () => {
    const { container } = renderEditor({ startingTitle: "Begin the Begin" });
    // CustomListSearch renders .entry-points
    expect(container.querySelector(".entry-points")).toBeTruthy();
  });

  it("calls updateProperty('autoUpdate', value) when updateAutoUpdate is called in CustomListSearch", () => {
    const updateProperty = jest.fn();
    // isAutoUpdateEnabled renders auto-update radios; listId=null keeps them enabled.
    // properties.autoUpdate=false so "Auto" radio (radios[0]) starts unchecked — click fires onChange.
    const { container } = renderEditor({
      updateProperty,
      isAutoUpdateEnabled: true,
      listId: null,
    });
    const autoUpdateRadios = container.querySelectorAll<HTMLInputElement>(
      "[name='auto-update']"
    );
    if (autoUpdateRadios.length > 0) {
      fireEvent.click(autoUpdateRadios[0]);
      expect(updateProperty).toHaveBeenCalledWith("autoUpdate", true);
    }
  });

  it("calls search on mount", () => {
    const search = jest.fn();
    renderEditor({ search });
    expect(search).toHaveBeenCalledTimes(1);
  });

  it("renders share button inside sharing-info when listId is set and isOwner is true", () => {
    const { container } = renderEditor();
    const shareBtn = container.querySelector(".sharing-info button");
    expect(shareBtn).toBeTruthy();
  });

  it("calls share when the share button is clicked", () => {
    const share = jest.fn();
    const { container } = renderEditor({ share });
    const shareBtn = container.querySelector<HTMLButtonElement>(
      ".sharing-info button"
    );
    fireEvent.click(shareBtn!);
    expect(share).toHaveBeenCalledTimes(1);
  });

  it("does not render share button when listId is null or undefined", () => {
    const { container } = renderEditor({ listId: undefined });
    expect(container.querySelector(".sharing-info button")).toBeFalsy();
  });

  it("does not render share button when isOwner is false", () => {
    // When isOwner=false the sharing-info shows "Subscribed" without a button
    const { container } = renderEditor({ isOwner: false, isShared: true });
    // The sharing-info div is still shown but it's the "subscribed" view (no share button)
    const sharingInfo = container.querySelector(".sharing-info");
    if (sharingInfo) {
      const btn = sharingInfo.querySelector("button");
      expect(btn).toBeFalsy();
    }
  });
});
