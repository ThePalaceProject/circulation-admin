import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import CustomListSearch from "../../../src/components/lists/CustomListSearch";
import { CustomListEditorSearchParams } from "../../../src/reducers/customListEditor";

// ── fixtures ──────────────────────────────────────────────────────────────────

const library = {
  uuid: "uuid",
  name: "name",
  short_name: "short_name",
  settings: { large_collections: ["eng", "fre", "spa"] },
};

const entryPoints = ["All", "Book", "Audio"];

const searchParams: CustomListEditorSearchParams = {
  entryPoint: "all",
  terms: "foo bar",
  sort: "title",
  language: "English",
  advanced: {
    include: { query: null, selectedQueryId: null, clearFilters: null },
    exclude: { query: null, selectedQueryId: null, clearFilters: null },
  },
};

const languages = {
  eng: ["English"],
  spa: ["Spanish", "Castilian"],
  fre: ["French"],
};

function buildProps(
  overrides: Partial<React.ComponentProps<typeof CustomListSearch>> = {}
): React.ComponentProps<typeof CustomListSearch> {
  return {
    entryPoints,
    isOwner: true,
    languages,
    library,
    listId: "123",
    search: jest.fn(),
    searchParams,
    updateAutoUpdate: jest.fn(),
    updateSearchParam: jest.fn(),
    ...overrides,
  };
}

function renderSearch(
  overrides: Partial<React.ComponentProps<typeof CustomListSearch>> = {}
) {
  const props = buildProps(overrides);
  const utils = render(<CustomListSearch {...props} />);
  return { ...utils, props };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe("CustomListSearch", () => {
  it("renders a radio button for each entry point", () => {
    const { container } = renderSearch();
    // EditableInput wraps each radio in .form-group
    const entryPointOptions = container
      .querySelector(".entry-points")!
      .querySelectorAll<HTMLElement>(".form-group");

    expect(entryPointOptions.length).toBe(3);

    const allRadio = entryPointOptions[0].querySelector<HTMLInputElement>(
      "input"
    )!;
    expect(allRadio.type).toBe("radio");
    expect(allRadio.name).toBe("entry-points-selection");
    expect(allRadio.value).toBe("All");
    expect(allRadio.disabled).toBe(false);
    expect(allRadio.checked).toBe(true);

    const bookRadio = entryPointOptions[1].querySelector<HTMLInputElement>(
      "input"
    )!;
    expect(bookRadio.type).toBe("radio");
    expect(bookRadio.name).toBe("entry-points-selection");
    expect(bookRadio.value).toBe("Book");
    expect(bookRadio.disabled).toBe(false);
    expect(bookRadio.checked).toBe(false);

    const audioRadio = entryPointOptions[2].querySelector<HTMLInputElement>(
      "input"
    )!;
    expect(audioRadio.type).toBe("radio");
    expect(audioRadio.name).toBe("entry-points-selection");
    expect(audioRadio.value).toBe("Audio");
    expect(audioRadio.disabled).toBe(false);
    expect(audioRadio.checked).toBe(false);
  });

  it("disables the entry point radio buttons when isOwner is false", () => {
    const { container } = renderSearch({ isOwner: false });
    const radios = container.querySelectorAll<HTMLInputElement>(
      "[name='entry-points-selection']"
    );
    radios.forEach((r) => expect(r).toBeDisabled());
  });

  it("calls updateSearchParam when an entry point radio button is changed", () => {
    const updateSearchParam = jest.fn();
    const { container } = renderSearch({ updateSearchParam });
    const options = container
      .querySelector(".entry-points")!
      .querySelectorAll<HTMLElement>(".form-group");
    const audioRadio = options[2].querySelector<HTMLInputElement>("input")!;
    fireEvent.click(audioRadio);
    expect(updateSearchParam).toHaveBeenCalledTimes(1);
    expect(updateSearchParam).toHaveBeenCalledWith("entryPoint", "Audio");
  });

  it("renders a radio button for each sort option", () => {
    const { container } = renderSearch();
    const sortOptions = container
      .querySelector(".search-options")!
      .querySelectorAll<HTMLElement>(".form-group");

    expect(sortOptions.length).toBe(3);

    const relevanceRadio = sortOptions[0].querySelector<HTMLInputElement>(
      "input"
    )!;
    expect(relevanceRadio.type).toBe("radio");
    expect(relevanceRadio.name).toBe("sort-selection");
    // sort null becomes "" as attribute value
    expect(relevanceRadio.value).toBe("");
    expect(relevanceRadio.disabled).toBe(false);
    expect(relevanceRadio.checked).toBe(false);

    const titleRadio = sortOptions[1].querySelector<HTMLInputElement>("input")!;
    expect(titleRadio.type).toBe("radio");
    expect(titleRadio.name).toBe("sort-selection");
    expect(titleRadio.value).toBe("title");
    expect(titleRadio.disabled).toBe(false);
    expect(titleRadio.checked).toBe(true); // searchParams.sort = "title"

    const authorRadio = sortOptions[2].querySelector<HTMLInputElement>(
      "input"
    )!;
    expect(authorRadio.type).toBe("radio");
    expect(authorRadio.name).toBe("sort-selection");
    expect(authorRadio.value).toBe("author");
    expect(authorRadio.disabled).toBe(false);
    expect(authorRadio.checked).toBe(false);
  });

  it("disables the sort option radio buttons when isOwner is false", () => {
    const { container } = renderSearch({ isOwner: false });
    const radios = container.querySelectorAll<HTMLInputElement>(
      "[name='sort-selection']"
    );
    radios.forEach((r) => expect(r).toBeDisabled());
  });

  it("calls updateSearchParam when a sort radio button is changed", () => {
    const updateSearchParam = jest.fn();
    const { container } = renderSearch({ updateSearchParam });
    const options = container
      .querySelector(".search-options")!
      .querySelectorAll<HTMLElement>(".form-group");
    const authorRadio = options[2].querySelector<HTMLInputElement>("input")!;
    fireEvent.click(authorRadio);
    expect(updateSearchParam).toHaveBeenCalledTimes(1);
    expect(updateSearchParam).toHaveBeenCalledWith("sort", "author");
  });

  it("calls addAdvSearchQuery and search when mounted if there is a startingTitle", () => {
    const addAdvSearchQuery = jest.fn();
    const search = jest.fn();
    render(
      <CustomListSearch
        entryPoints={entryPoints}
        languages={languages}
        library={library}
        listId="123"
        search={search}
        searchParams={searchParams}
        startingTitle="test"
        addAdvSearchQuery={addAdvSearchQuery}
      />
    );
    expect(addAdvSearchQuery).toHaveBeenCalledTimes(1);
    expect(addAdvSearchQuery).toHaveBeenCalledWith("include", {
      key: "title",
      op: "eq",
      value: "test",
    });
    expect(search).toHaveBeenCalledTimes(1);
  });

  describe("when showAutoUpdate is false", () => {
    it("does not render radio buttons for auto update on and off", () => {
      const { container } = renderSearch({ showAutoUpdate: false });
      const autoUpdateOptions = container
        .querySelector(".auto-update")
        ?.querySelectorAll(".form-group");
      expect(autoUpdateOptions?.length ?? 0).toBe(0);
    });
  });

  describe("when showAutoUpdate is true", () => {
    it("renders radio buttons for auto update on and off", () => {
      const { container } = render(
        <CustomListSearch
          entryPoints={entryPoints}
          isOwner={true}
          languages={languages}
          library={library}
          listId={null}
          search={jest.fn()}
          searchParams={searchParams}
          showAutoUpdate={true}
          updateAutoUpdate={jest.fn()}
          updateSearchParam={jest.fn()}
        />
      );
      const autoUpdateOptions = container
        .querySelector(".auto-update")!
        .querySelectorAll<HTMLElement>(".form-group");

      expect(autoUpdateOptions.length).toBe(2);

      const onRadio = autoUpdateOptions[0].querySelector<HTMLInputElement>(
        "input"
      )!;
      expect(onRadio.name).toBe("auto-update");
      expect(onRadio.disabled).toBe(false);

      const offRadio = autoUpdateOptions[1].querySelector<HTMLInputElement>(
        "input"
      )!;
      expect(offRadio.name).toBe("auto-update");
      expect(offRadio.disabled).toBe(false);
    });

    it("disables the radio buttons for auto update when isOwner is false", () => {
      const { container } = render(
        <CustomListSearch
          entryPoints={entryPoints}
          isOwner={false}
          languages={languages}
          library={library}
          listId={null}
          search={jest.fn()}
          searchParams={searchParams}
          showAutoUpdate={true}
          updateAutoUpdate={jest.fn()}
          updateSearchParam={jest.fn()}
        />
      );
      const radios = container.querySelectorAll<HTMLInputElement>(
        "[name='auto-update']"
      );
      radios.forEach((r) => expect(r).toBeDisabled());
    });

    it("disables the radio buttons for auto update when listId is not null", () => {
      const { container } = render(
        <CustomListSearch
          entryPoints={entryPoints}
          isOwner={false}
          languages={languages}
          library={library}
          listId="123"
          search={jest.fn()}
          searchParams={searchParams}
          showAutoUpdate={true}
          updateAutoUpdate={jest.fn()}
          updateSearchParam={jest.fn()}
        />
      );
      const radios = container.querySelectorAll<HTMLInputElement>(
        "[name='auto-update']"
      );
      radios.forEach((r) => expect(r).toBeDisabled());
    });

    it("calls updateAutoUpdate(true) when on radio is clicked", () => {
      const updateAutoUpdate = jest.fn();
      const { container } = render(
        <CustomListSearch
          entryPoints={entryPoints}
          languages={languages}
          library={library}
          listId={null}
          search={jest.fn()}
          searchParams={{ ...searchParams, sort: null }}
          showAutoUpdate={true}
          isOwner={true}
          updateAutoUpdate={updateAutoUpdate}
          updateSearchParam={jest.fn()}
        />
      );
      const radios = container.querySelectorAll<HTMLInputElement>(
        "[name='auto-update']"
      );
      // onRadio: "Automatically update" — checked={autoUpdate=undefined=false} → unchecked
      const onRadio = radios[0];
      fireEvent.click(onRadio);
      expect(updateAutoUpdate).toHaveBeenCalledWith(true);
    });

    it("calls updateAutoUpdate(false) when off radio is clicked", () => {
      const updateAutoUpdate = jest.fn();
      // Start with autoUpdate=true so offRadio is initially unchecked, allowing click to fire
      const { container } = render(
        <CustomListSearch
          entryPoints={entryPoints}
          languages={languages}
          library={library}
          listId={null}
          search={jest.fn()}
          searchParams={{ ...searchParams, sort: null }}
          showAutoUpdate={true}
          isOwner={true}
          autoUpdate={true}
          updateAutoUpdate={updateAutoUpdate}
          updateSearchParam={jest.fn()}
        />
      );
      const radios = container.querySelectorAll<HTMLInputElement>(
        "[name='auto-update']"
      );
      // offRadio: "Manually select" — checked={!autoUpdate=false} → unchecked
      const offRadio = radios[1];
      fireEvent.click(offRadio);
      expect(updateAutoUpdate).toHaveBeenCalledWith(false);
    });
  });
});
