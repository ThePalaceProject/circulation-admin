import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomListSearch from "../../../src/components/CustomListSearch";

describe("CustomListSearch", () => {
  const library = {
    uuid: "uuid",
    name: "name",
    short_name: "short_name",
    settings: {
      large_collections: ["eng", "fre", "spa"],
    },
  };

  const entryPoints = ["All", "Book", "Audio"];

  const searchParams = {
    entryPoint: "all",
    terms: "foo bar",
    sort: "title",
    language: "English",
    advanced: {
      include: {
        query: null,
        selectedQueryId: null,
        clearFilters: null,
      },
      exclude: {
        query: null,
        selectedQueryId: null,
        clearFilters: null,
      },
    },
  };

  const languages = {
    eng: ["English"],
    spa: ["Spanish", "Castilian"],
    fre: ["French"],
  };

  const renderSearch = (
    overrides: Partial<React.ComponentProps<typeof CustomListSearch>> = {}
  ) =>
    render(
      <CustomListSearch
        entryPoints={entryPoints}
        isOwner={true}
        languages={languages}
        library={library}
        listId="123"
        search={jest.fn()}
        searchParams={searchParams}
        updateAutoUpdate={jest.fn()}
        updateSearchParam={jest.fn()}
        {...overrides}
      />
    );

  it("renders a radio button for each entry point", () => {
    const { container } = renderSearch();
    const entryPointsSection =
      container.querySelector<HTMLElement>(".entry-points");

    const radios = within(entryPointsSection).getAllByRole("radio");
    expect(radios).toHaveLength(3);

    const all = within(entryPointsSection).getByRole("radio", { name: "All" });
    expect(all).toHaveAttribute("name", "entry-points-selection");
    expect(all).toHaveAttribute("value", "All");
    expect(all).toBeEnabled();
    expect(all).toBeChecked();

    const book = within(entryPointsSection).getByRole("radio", {
      name: "Book",
    });
    expect(book).toHaveAttribute("name", "entry-points-selection");
    expect(book).toHaveAttribute("value", "Book");
    expect(book).toBeEnabled();
    expect(book).not.toBeChecked();

    const audio = within(entryPointsSection).getByRole("radio", {
      name: "Audio",
    });
    expect(audio).toHaveAttribute("name", "entry-points-selection");
    expect(audio).toHaveAttribute("value", "Audio");
    expect(audio).toBeEnabled();
    expect(audio).not.toBeChecked();
  });

  it("disables the entry point radio buttons when isOwner is false", () => {
    const { container } = renderSearch({ isOwner: false });
    const entryPointsSection =
      container.querySelector<HTMLElement>(".entry-points");

    within(entryPointsSection)
      .getAllByRole("radio")
      .forEach((radio) => expect(radio).toBeDisabled());
  });

  it("calls updateSearchParam when an entry point radio button is changed", async () => {
    const user = userEvent.setup();
    const updateSearchParam = jest.fn();
    const { container } = renderSearch({ updateSearchParam });
    const entryPointsSection =
      container.querySelector<HTMLElement>(".entry-points");

    await user.click(
      within(entryPointsSection).getByRole("radio", { name: "Audio" })
    );

    expect(updateSearchParam).toHaveBeenCalledTimes(1);
    expect(updateSearchParam).toHaveBeenCalledWith("entryPoint", "Audio");
  });

  it("renders a radio button for each sort option", () => {
    const { container } = renderSearch();
    const sortSection = container.querySelector<HTMLElement>(".search-options");

    const radios = within(sortSection).getAllByRole("radio");
    expect(radios).toHaveLength(3);

    const relevance = within(sortSection).getByRole("radio", {
      name: "Relevance",
    });
    expect(relevance).toHaveAttribute("name", "sort-selection");
    expect(relevance).toHaveAttribute("value", "");
    expect(relevance).toBeEnabled();
    expect(relevance).not.toBeChecked();

    const title = within(sortSection).getByRole("radio", { name: "Title" });
    expect(title).toHaveAttribute("name", "sort-selection");
    expect(title).toHaveAttribute("value", "title");
    expect(title).toBeEnabled();
    expect(title).toBeChecked();

    const author = within(sortSection).getByRole("radio", { name: "Author" });
    expect(author).toHaveAttribute("name", "sort-selection");
    expect(author).toHaveAttribute("value", "author");
    expect(author).toBeEnabled();
    expect(author).not.toBeChecked();
  });

  it("disables the sort option radio buttons when isOwner is false", () => {
    const { container } = renderSearch({ isOwner: false });
    const sortSection = container.querySelector<HTMLElement>(".search-options");

    within(sortSection)
      .getAllByRole("radio")
      .forEach((radio) => expect(radio).toBeDisabled());
  });

  it("calls updateSearchParam when a sort radio button is changed", async () => {
    const user = userEvent.setup();
    const updateSearchParam = jest.fn();
    const { container } = renderSearch({ updateSearchParam });
    const sortSection = container.querySelector<HTMLElement>(".search-options");

    await user.click(
      within(sortSection).getByRole("radio", { name: "Author" })
    );

    expect(updateSearchParam).toHaveBeenCalledTimes(1);
    expect(updateSearchParam).toHaveBeenCalledWith("sort", "author");
  });

  it("calls addAdvSearchQuery and search when mounted if there is a startingTitle", () => {
    const addAdvSearchQuery = jest.fn();
    const search = jest.fn();

    renderSearch({ startingTitle: "test", addAdvSearchQuery, search });

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
      const { container } = renderSearch();

      expect(container.querySelector(".auto-update")).toBeNull();
    });
  });

  describe("when showAutoUpdate is true", () => {
    it("renders radio buttons for auto update on and off", () => {
      const { container } = renderSearch({
        showAutoUpdate: true,
        listId: null,
      });
      const autoSection = container.querySelector<HTMLElement>(".auto-update");

      const radios = within(autoSection).getAllByRole("radio");
      expect(radios).toHaveLength(2);

      const on = within(autoSection).getByRole("radio", {
        name: "Automatically update this list",
      });
      expect(on).toHaveAttribute("name", "auto-update");
      expect(on).toBeEnabled();

      const off = within(autoSection).getByRole("radio", {
        name: "Manually select titles",
      });
      expect(off).toHaveAttribute("name", "auto-update");
      expect(off).toBeEnabled();
    });

    it("disables the radio buttons for auto update when isOwner is false", () => {
      const { container } = renderSearch({
        showAutoUpdate: true,
        isOwner: false,
        listId: null,
      });
      const autoSection = container.querySelector<HTMLElement>(".auto-update");

      within(autoSection)
        .getAllByRole("radio")
        .forEach((radio) => expect(radio).toBeDisabled());
    });

    it("disables the radio buttons for auto update when listId is not null", () => {
      // isOwner: true keeps readOnly false, so listId is the only thing that can
      // disable the radios — otherwise readOnly alone would, masking this path.
      const { container } = renderSearch({
        showAutoUpdate: true,
        isOwner: true,
        listId: "123",
      });
      const autoSection = container.querySelector<HTMLElement>(".auto-update");

      within(autoSection)
        .getAllByRole("radio")
        .forEach((radio) => expect(radio).toBeDisabled());
    });

    it("calls updateAutoUpdate when an auto update radio button is changed", async () => {
      const user = userEvent.setup();
      // Clicking the currently-unchecked "on" radio reports true.
      const updateAutoUpdateOn = jest.fn();
      const { unmount } = renderSearch({
        showAutoUpdate: true,
        listId: null,
        autoUpdate: false,
        updateAutoUpdate: updateAutoUpdateOn,
      });
      await user.click(
        screen.getByRole("radio", { name: "Automatically update this list" })
      );
      expect(updateAutoUpdateOn).toHaveBeenCalledTimes(1);
      expect(updateAutoUpdateOn).toHaveBeenCalledWith(true);
      unmount();

      // Clicking the currently-unchecked "off" radio reports false.
      const updateAutoUpdateOff = jest.fn();
      renderSearch({
        showAutoUpdate: true,
        listId: null,
        autoUpdate: true,
        updateAutoUpdate: updateAutoUpdateOff,
      });
      await user.click(
        screen.getByRole("radio", { name: "Manually select titles" })
      );
      expect(updateAutoUpdateOff).toHaveBeenCalledTimes(1);
      expect(updateAutoUpdateOff).toHaveBeenCalledWith(false);
    });
  });
});
