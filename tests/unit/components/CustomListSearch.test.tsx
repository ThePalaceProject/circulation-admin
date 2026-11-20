import * as React from "react";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomListSearch from "../../../src/components/CustomListSearch";
import { FeatureFlags } from "../../../src/interfaces";
import { renderWithProviders } from "../testUtils/withProviders";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";

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
    overrides: Partial<React.ComponentProps<typeof CustomListSearch>> = {},
    featureFlags: FeatureFlags = defaultFeatureFlags
  ) =>
    renderWithProviders(
      <CustomListSearch
        entryPoints={entryPoints}
        isOwner={true}
        languages={languages}
        library={library}
        listId="123"
        search={vi.fn()}
        searchParams={searchParams}
        updateAutoUpdate={vi.fn()}
        updateSearchParam={vi.fn()}
        {...overrides}
      />,
      { appConfigSettings: { featureFlags } }
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
    const updateSearchParam = vi.fn();
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
    const updateSearchParam = vi.fn();
    const { container } = renderSearch({ updateSearchParam });
    const sortSection = container.querySelector<HTMLElement>(".search-options");

    await user.click(
      within(sortSection).getByRole("radio", { name: "Author" })
    );

    expect(updateSearchParam).toHaveBeenCalledTimes(1);
    expect(updateSearchParam).toHaveBeenCalledWith("sort", "author");
  });

  it("calls addAdvSearchQuery and search when mounted if there is a startingTitle", () => {
    const addAdvSearchQuery = vi.fn();
    const search = vi.fn();

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
      const updateAutoUpdateOn = vi.fn();
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
      const updateAutoUpdateOff = vi.fn();
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
  describe("the periodicals entry point", () => {
    const withPeriodicals = ["All", "Book", "Audio", "Periodical"];

    const entryPointNames = (container: HTMLElement) =>
      within(container.querySelector<HTMLElement>(".entry-points"))
        .getAllByRole("radio")
        .map((radio) => radio.getAttribute("value"));

    it("is hidden when the showPeriodicals flag is off", () => {
      const { container } = renderSearch(
        { entryPoints: withPeriodicals },
        { ...defaultFeatureFlags, showPeriodicals: false }
      );

      expect(entryPointNames(container)).toEqual(["All", "Book", "Audio"]);
    });

    it("is hidden when the circulation manager sends no showPeriodicals flag", () => {
      // This is what the client sees against every circulation manager
      // running today, since PP-5642 has not added the field yet.
      const { showPeriodicals, ...flagsWithoutPeriodicals } = {
        ...defaultFeatureFlags,
        showPeriodicals: false,
      };

      const { container } = renderSearch(
        { entryPoints: withPeriodicals },
        flagsWithoutPeriodicals
      );

      expect(entryPointNames(container)).toEqual(["All", "Book", "Audio"]);
    });

    it("is shown when the showPeriodicals flag is on", () => {
      const { container } = renderSearch(
        { entryPoints: withPeriodicals },
        { ...defaultFeatureFlags, showPeriodicals: true }
      );

      expect(entryPointNames(container)).toEqual([
        "All",
        "Book",
        "Audio",
        "Periodical",
      ]);
    });

    it("can be selected when it is shown", async () => {
      const user = userEvent.setup();
      const updateSearchParam = vi.fn();

      const { container } = renderSearch(
        { entryPoints: withPeriodicals, updateSearchParam },
        { ...defaultFeatureFlags, showPeriodicals: true }
      );

      await user.click(
        within(container.querySelector<HTMLElement>(".entry-points")).getByRole(
          "radio",
          { name: "Periodical" }
        )
      );

      expect(updateSearchParam).toHaveBeenCalledWith(
        "entryPoint",
        "Periodical"
      );
    });

    it("leaves the other entry points alone in either state", async () => {
      const user = userEvent.setup();

      for (const showPeriodicals of [false, true]) {
        const updateSearchParam = vi.fn();
        const { container, unmount } = renderSearch(
          { entryPoints: withPeriodicals, updateSearchParam },
          { ...defaultFeatureFlags, showPeriodicals }
        );
        const entryPointsSection =
          container.querySelector<HTMLElement>(".entry-points");

        const book = within(entryPointsSection).getByRole("radio", {
          name: "Book",
        });
        const audio = within(entryPointsSection).getByRole("radio", {
          name: "Audio",
        });

        expect(book).toBeEnabled();
        expect(audio).toBeEnabled();

        await user.click(audio);
        expect(updateSearchParam).toHaveBeenCalledTimes(1);
        expect(updateSearchParam).toHaveBeenCalledWith("entryPoint", "Audio");

        unmount();
      }
    });
  });
});
