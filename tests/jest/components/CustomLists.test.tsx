import * as React from "react";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import CustomLists, {
  CustomLists as UnconnectedCustomLists,
} from "../../../src/components/CustomLists";
import * as CustomListEditorModule from "../../../src/components/CustomListEditor";
import * as navigate from "../../../src/utils/navigate";
import renderWithContext from "../testUtils/renderWithContext";
import buildStore from "../../../src/store";
import { ConfigurationSettings, LaneData } from "../../../src/interfaces";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";

// Render react-router's Link as a marker div so the sidebar's edit/create
// targets can be asserted via `data-to` without a Router in the test. Only
// CustomListsSidebar uses Link in this tree (CustomListEditor does not), so the
// existing connected tests are unaffected.
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  Link: (props) => (
    <div data-testid="Link" data-to={props.to} className={props.className}>
      {props.children}
    </div>
  ),
}));

describe("CustomLists", () => {
  // Stub scrollTo, since a component in the render tree will try to call it, and it is not
  // provided by JSDOM.
  Element.prototype.scrollTo = () => {};

  const server = setupServer(
    http.get("*/search", () => HttpResponse.xml("<feed />")),
    http.get("*", () => HttpResponse.json({}))
  );

  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  it("adds filters when new filter values are entered", async () => {
    const user = userEvent.setup();

    const appConfigSettings: Partial<ConfigurationSettings> = {
      csrfToken: "",
      featureFlags: {},
      roles: [{ role: "system" }],
    };

    renderWithContext(
      <CustomLists
        csrfToken=""
        editOrCreate="create"
        library="testlib"
        store={buildStore()}
      />,
      appConfigSettings
    );

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("horror{enter}");

    const items = screen.getAllByRole("treeitem");

    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent(/Genre = horror/);

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("science fiction{enter}");

    const newItems = screen.getAllByRole("treeitem");

    expect(newItems).toHaveLength(3);
    expect(newItems[0]).toHaveTextContent(
      /all of these filters must be matched/i
    );
    expect(newItems[1]).toHaveTextContent(/genre = horror/i);
    expect(newItems[2]).toHaveTextContent(/genre = science fiction/i);
  });

  it("replaces the existing filters when adding a new filter when the clear filters checkbox is checked", async () => {
    const user = userEvent.setup();

    const appConfigSettings: Partial<ConfigurationSettings> = {
      csrfToken: "",
      featureFlags: {},
      roles: [{ role: "system" }],
    };

    renderWithContext(
      <CustomLists
        csrfToken=""
        editOrCreate="create"
        library="testlib"
        store={buildStore()}
      />,
      appConfigSettings
    );

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("horror{enter}");

    let items = screen.getAllByRole("treeitem");

    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent(/Genre = horror/);

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("science fiction{enter}");

    items = screen.getAllByRole("treeitem");
    expect(items).toHaveLength(3);

    await user.click(screen.getByRole("checkbox", { name: /clear filters/i }));

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("fantasy{enter}");

    items = screen.getAllByRole("treeitem");
    expect(items).toHaveLength(1);
  });

  it("sends the language=all search parameter", async () => {
    let searchParams = null;

    server.use(
      http.get("*/search", ({ request }) => {
        const url = new URL(request.url);
        searchParams = url.searchParams;
        return HttpResponse.xml("<feed />");
      })
    );

    const user = userEvent.setup();

    const appConfigSettings: Partial<ConfigurationSettings> = {
      csrfToken: "",
      featureFlags: {},
      roles: [{ role: "system" }],
    };

    renderWithContext(
      <CustomLists
        csrfToken=""
        editOrCreate="create"
        library="testlib"
        store={buildStore()}
      />,
      appConfigSettings
    );

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("horror{enter}");

    await waitFor(() => {
      expect(searchParams.get("language")).toEqual("all");

      expect(JSON.parse(searchParams.get("q"))).toEqual({
        query: {
          key: "genre",
          value: "horror",
        },
      });
    });
  });

  it("sends the language=all search parameter when a language filter is added, and places the language filter in the q parameter", async () => {
    let searchParams = null;

    server.use(
      http.get("*/search", ({ request }) => {
        const url = new URL(request.url);
        searchParams = url.searchParams;
        return HttpResponse.xml("<feed />");
      })
    );

    const user = userEvent.setup();

    const appConfigSettings: Partial<ConfigurationSettings> = {
      csrfToken: "",
      featureFlags: {},
      roles: [{ role: "system" }],
    };

    renderWithContext(
      <CustomLists
        csrfToken=""
        editOrCreate="create"
        library="testlib"
        store={buildStore()}
      />,
      appConfigSettings
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "filter field key" }),
      screen.getByRole("option", { name: "Language" })
    );
    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("french{enter}");

    await waitFor(() => {
      expect(searchParams.get("language")).toEqual("all");

      expect(JSON.parse(searchParams.get("q"))).toEqual({
        query: {
          key: "language",
          value: "french",
        },
      });
    });
  });

  // These render the unconnected component with explicit props, drive the real
  // sidebar, and stub the heavy CustomListEditor child so the component's own
  // render/lifecycle/methods are exercised observably. Nested inside the
  // top-level describe so the MSW server and scrollTo stub apply.
  describe("unconnected component with explicit props", () => {
    const listsUrl = "/admin/web/lists/library";

    const customListEditorProperties = {
      name: "",
      collections: [],
      autoUpdate: false,
    };
    const customListEditorEntries = {
      baseline: [],
      baselineTotalCount: 0,
      added: {},
      removed: {},
      current: [],
      currentTotalCount: 0,
    };
    const customListEditorSearchParams = {
      entryPoint: "All",
      terms: "",
      sort: null,
      language: "all",
      advanced: {
        include: { query: null, selectedQueryId: null, clearFilters: null },
        exclude: { query: null, selectedQueryId: null, clearFilters: null },
      },
    };

    const listsData = [
      {
        id: 1,
        name: "a list",
        entry_count: 0,
        collections: [],
        is_owner: true,
        is_shared: false,
      },
      {
        id: 2,
        name: "z list",
        entry_count: 1,
        collections: [{ id: 3, name: "collection 3", protocol: "protocol" }],
        is_owner: true,
        is_shared: false,
      },
    ];

    const entry = { pwid: "1", title: "title", authors: [] };

    const searchResults = {
      id: "id",
      url: "url",
      title: "title",
      lanes: [],
      books: [],
      navigationLinks: [],
      nextPageUrl: "http://next.page",
    };

    const collections = [
      {
        id: 1,
        name: "collection 1",
        protocol: "protocol",
        libraries: [{ short_name: "other library" }],
      },
      {
        id: 2,
        name: "collection 2",
        protocol: "protocol",
        libraries: [{ short_name: "library" }],
      },
      {
        id: 3,
        name: "collection 3",
        protocol: "protocol",
        libraries: [{ short_name: "library" }],
      },
    ];

    const libraries = [
      {
        short_name: "library",
        settings: { enabled_entry_points: ["Book", "Audio"] },
      },
      {
        short_name: "another library",
        settings: { enabled_entry_points: ["Audio"] },
      },
    ];

    const languages = {
      eng: ["English"],
      spa: ["Spanish", "Castilian"],
      fre: ["French"],
    };

    const lane1: LaneData = {
      id: 1,
      display_name: "lane 1",
      visible: false,
      count: 1,
      sublanes: [],
      custom_list_ids: [2],
      inherit_parent_restrictions: false,
    };
    const lane2: LaneData = {
      id: 2,
      display_name: "lane 2",
      visible: false,
      count: 1,
      sublanes: [],
      custom_list_ids: [2],
      inherit_parent_restrictions: false,
    };
    const lane3: LaneData = {
      id: 3,
      display_name: "lane 3",
      visible: false,
      count: 1,
      sublanes: [],
      custom_list_ids: [],
      inherit_parent_restrictions: false,
    };
    const allLanes = [lane1, lane2, lane3];

    // Test doubles for the dispatch props.
    let fetchCustomLists: jest.Mock;
    let fetchCustomListDetails: jest.Mock;
    let deleteCustomList: jest.Mock;
    let shareCustomList: jest.Mock;
    let openCustomListEditor: jest.Mock;
    let saveCustomListEditor: jest.Mock;
    let executeCustomListEditorSearch: jest.Mock;
    let loadMoreSearchResults: jest.Mock;
    let loadMoreEntries: jest.Mock;
    let fetchCollections: jest.Mock;
    let fetchLibraries: jest.Mock;
    let fetchLanes: jest.Mock;
    let fetchLanguages: jest.Mock;
    let navigateSpy: jest.SpyInstance;

    const configWithRoles = (
      roles: Partial<ConfigurationSettings>["roles"]
    ): Partial<ConfigurationSettings> => ({
      csrfToken: "token",
      featureFlags: defaultFeatureFlags,
      roles,
    });

    const managerConfig = configWithRoles([
      { role: "manager", library: "library" },
    ]);
    const librarianConfig = configWithRoles([
      { role: "librarian", library: "library" },
    ]);

    const baseCustomListsProps = (overrides: Record<string, any> = {}) => ({
      customListEditorProperties,
      customListEditorEntries,
      customListEditorSearchParams,
      csrfToken: "token",
      library: "library",
      lists: listsData,
      searchResults,
      collections,
      isFetching: false,
      isFetchingSearchResults: false,
      isFetchingMoreSearchResults: false,
      isFetchingMoreCustomListEntries: false,
      fetchLanguages,
      fetchCustomLists,
      fetchCustomListDetails,
      saveCustomListEditor,
      deleteCustomList,
      shareCustomList,
      executeCustomListEditorSearch,
      openCustomListEditor,
      loadMoreSearchResults,
      loadMoreEntries,
      fetchCollections,
      fetchLibraries,
      fetchLanes,
      libraries,
      languages,
      ...overrides,
    });

    const renderCustomLists = (
      overrides: Record<string, any> = {},
      config: Partial<ConfigurationSettings> = managerConfig
    ) =>
      renderWithContext(
        <UnconnectedCustomLists
          {...(baseCustomListsProps(overrides) as any)}
        />,
        config
      );

    const sidebarListNames = (container: HTMLElement) =>
      Array.from(
        container.querySelectorAll(
          ".custom-lists-sidebar ul > li .custom-list-info > div:first-child"
        )
        // The name is the trailing text node; a ShareIcon (with title text) may
        // precede it for lists that are not owned by this library.
      ).map((el) => el.lastChild?.textContent);

    const lastNavigation = () =>
      navigateSpy.mock.calls[navigateSpy.mock.calls.length - 1]?.[0];

    beforeEach(() => {
      fetchCustomLists = jest.fn();
      fetchCustomListDetails = jest.fn();
      deleteCustomList = jest.fn().mockResolvedValue(undefined);
      shareCustomList = jest.fn().mockResolvedValue(undefined);
      openCustomListEditor = jest.fn();
      saveCustomListEditor = jest.fn().mockResolvedValue(undefined);
      executeCustomListEditorSearch = jest.fn();
      loadMoreSearchResults = jest.fn();
      loadMoreEntries = jest.fn();
      fetchCollections = jest.fn();
      fetchLibraries = jest.fn();
      fetchLanes = jest.fn().mockResolvedValue(undefined);
      fetchLanguages = jest.fn();

      navigateSpy = jest
        .spyOn(navigate, "navigateTo")
        .mockImplementation(() => undefined);
      jest.spyOn(navigate, "currentHref").mockReturnValue(listsUrl);

      // Stub the heavy editor child so we can assert the props CustomLists
      // hands it and drive its `save` callback without its full render tree.
      jest
        .spyOn(CustomListEditorModule, "default")
        .mockImplementation((props: any) => (
          <div data-testid="custom-list-editor">
            <span data-testid="editor-library">
              {props.library ? props.library.short_name : "none"}
            </span>
            <span data-testid="editor-listid">{props.listId ?? "none"}</span>
            <span data-testid="editor-collections">
              {(props.collections || []).map((c) => c.name).join(",")}
            </span>
            <span data-testid="editor-entrypoints">
              {(props.entryPoints || []).join(",")}
            </span>
            <button
              type="button"
              data-testid="editor-save"
              onClick={() => props.save()}
            >
              save
            </button>
            <button
              type="button"
              data-testid="editor-share"
              onClick={() => props.share()}
            >
              share
            </button>
          </div>
        ));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("fetches libraries, languages, lists, and collections on mount", () => {
      renderCustomLists();
      expect(fetchLibraries).toHaveBeenCalledTimes(1);
      expect(fetchLanguages).toHaveBeenCalledTimes(1);
      expect(fetchCustomLists).toHaveBeenCalledTimes(1);
      expect(fetchCollections).toHaveBeenCalledTimes(1);
    });

    it("renders an error message when there is a fetch error", () => {
      const { container, rerender } = renderCustomLists();
      expect(container.querySelector(".alert-danger")).toBeNull();

      rerender(
        <UnconnectedCustomLists
          {...(baseCustomListsProps({
            fetchError: { status: 500, response: "Error", url: "url" },
          }) as any)}
        />
      );
      expect(container.querySelector(".alert-danger")).not.toBeNull();
    });

    it("renders a loading indicator while fetching", () => {
      const notLoading = renderCustomLists();
      expect(notLoading.queryByRole("dialog")).toBeNull();
      notLoading.unmount();

      const loading = renderCustomLists({ isFetching: true });
      expect(loading.getByRole("dialog")).toBeInTheDocument();
    });

    it("navigates to the create or edit page on initial load", () => {
      // No lists → create page.
      const first = renderCustomLists({ lists: undefined });
      first.rerender(
        <UnconnectedCustomLists
          {...(baseCustomListsProps({ lists: [] }) as any)}
        />
      );
      expect(lastNavigation()).toEqual(`${listsUrl}/create`);
      first.unmount();

      // Owned lists → edit page for the first sorted list.
      const second = renderCustomLists({ lists: undefined });
      second.rerender(
        <UnconnectedCustomLists
          {...(baseCustomListsProps({ lists: listsData }) as any)}
        />
      );
      expect(lastNavigation()).toEqual(`${listsUrl}/edit/1`);
      second.unmount();

      // Lists that are not owned → create page (filtered out by the "owned" filter).
      const noOwnedListsData = [
        {
          id: 1,
          name: "a list",
          entry_count: 0,
          collections: [],
          is_owner: false,
          is_shared: true,
        },
      ];
      const third = renderCustomLists({ lists: undefined });
      third.rerender(
        <UnconnectedCustomLists
          {...(baseCustomListsProps({ lists: noOwnedListsData }) as any)}
        />
      );
      expect(lastNavigation()).toEqual(`${listsUrl}/create`);
    });

    it("sorts the lists when the sort order changes", async () => {
      const user = userEvent.setup();
      const { container } = renderCustomLists();
      expect(sidebarListNames(container)).toEqual(["a list", "z list"]);

      const sortSelect = container.querySelector<HTMLSelectElement>(
        'select[name="sort"]'
      );
      await user.selectOptions(sortSelect, "desc");
      expect(sidebarListNames(container)).toEqual(["z list", "a list"]);

      await user.selectOptions(sortSelect, "asc");
      expect(sidebarListNames(container)).toEqual(["a list", "z list"]);
    });

    it("filters the lists when the filter changes", async () => {
      const user = userEvent.setup();
      const sharedListsData = [
        {
          id: 1,
          name: "owned unshared",
          entry_count: 0,
          collections: [],
          is_owner: true,
          is_shared: false,
        },
        {
          id: 2,
          name: "owned shared",
          entry_count: 1,
          collections: [],
          is_owner: true,
          is_shared: true,
        },
        {
          id: 3,
          name: "not owned",
          entry_count: 1,
          collections: [],
          is_owner: false,
          is_shared: true,
        },
      ];
      const { container } = renderCustomLists({ lists: sharedListsData });
      const filterSelect = container.querySelector<HTMLSelectElement>(
        'select[name="filter"]'
      );

      // Default "owned" filter.
      expect(sidebarListNames(container)).toEqual([
        "owned shared",
        "owned unshared",
      ]);

      await user.selectOptions(filterSelect, "shared-in");
      expect(sidebarListNames(container)).toEqual(["not owned"]);

      await user.selectOptions(filterSelect, "shared-out");
      expect(sidebarListNames(container)).toEqual(["owned shared"]);

      await user.selectOptions(filterSelect, "");
      expect(sidebarListNames(container)).toEqual([
        "not owned",
        "owned shared",
        "owned unshared",
      ]);

      await user.selectOptions(filterSelect, "owned");
      expect(sidebarListNames(container)).toEqual([
        "owned shared",
        "owned unshared",
      ]);
    });

    it("renders edit links but no delete buttons for a librarian", () => {
      const { container } = renderCustomLists({}, librarianConfig);
      const items = container.querySelectorAll(".custom-lists-sidebar ul > li");
      expect(items).toHaveLength(2);

      const firstButtons = items[0].querySelector<HTMLElement>(
        ".custom-list-buttons"
      );
      const firstEdit = within(firstButtons).getByTestId("Link");
      expect(firstEdit).toHaveTextContent("Edit");
      expect(firstEdit).toHaveAttribute(
        "data-to",
        "/admin/web/lists/library/edit/1"
      );

      const secondButtons = items[1].querySelector<HTMLElement>(
        ".custom-list-buttons"
      );
      const secondEdit = within(secondButtons).getByTestId("Link");
      expect(secondEdit).toHaveAttribute(
        "data-to",
        "/admin/web/lists/library/edit/2"
      );

      expect(
        container.querySelectorAll(".custom-list-buttons button")
      ).toHaveLength(0);
    });

    it("deletes a list only after the user confirms, fetching lanes first", async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
      const { container } = renderCustomLists();

      const deleteButton = () =>
        container.querySelectorAll<HTMLButtonElement>(
          ".custom-list-buttons button"
        )[0];

      await user.click(deleteButton());
      // No lanes were supplied, so the component fetched them.
      await waitFor(() => expect(fetchLanes).toHaveBeenCalled());
      expect(deleteCustomList).toHaveBeenCalledTimes(0);

      confirmSpy.mockReturnValue(true);
      await user.click(deleteButton());
      await waitFor(() => expect(deleteCustomList).toHaveBeenCalledTimes(1));
      expect(deleteCustomList).toHaveBeenCalledWith("1");
      await waitFor(() => expect(fetchCustomLists).toHaveBeenCalledTimes(2));
    });

    it("warns which lanes will be deleted along with the list", async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
      const { container } = renderCustomLists({ lanes: allLanes });

      const deleteButtons = () =>
        container.querySelectorAll<HTMLButtonElement>(
          ".custom-list-buttons button"
        );

      // "a list" (id 1) has no lanes referencing it exclusively.
      await user.click(deleteButtons()[0]);
      await waitFor(() => expect(confirmSpy).toHaveBeenCalledTimes(1));
      expect(confirmSpy.mock.calls[0][0]).toEqual('Delete list "a list"? ');

      // "z list" (id 2) is the only list in lane 1 and lane 2.
      await user.click(deleteButtons()[1]);
      await waitFor(() => expect(confirmSpy).toHaveBeenCalledTimes(2));
      expect(confirmSpy.mock.calls[1][0]).toEqual(
        'Delete list "z list"? ' +
          "Deleting this list will delete the following lanes:\n" +
          "\nLane name: lane 1\nLane name: lane 2"
      );
      // The lanes were supplied as a prop, so no fetch was needed.
      expect(fetchLanes).not.toHaveBeenCalled();
    });

    it("renders the create form, passing the right library and collections, and saves", async () => {
      const user = userEvent.setup();
      renderCustomLists({ editOrCreate: "create" });

      expect(screen.getByTestId("editor-library")).toHaveTextContent("library");
      expect(screen.getByTestId("editor-listid")).toHaveTextContent("none");
      expect(screen.getByTestId("editor-collections")).toHaveTextContent(
        "collection 2,collection 3"
      );
      expect(fetchCustomLists).toHaveBeenCalledTimes(1);

      await user.click(screen.getByTestId("editor-save"));
      expect(saveCustomListEditor).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(fetchCustomLists).toHaveBeenCalledTimes(2));
    });

    it("renders the edit form and fetches details when the selected list changes", () => {
      const listDetails = Object.assign({}, listsData[1], { entries: [entry] });
      const { rerender } = renderCustomLists({
        editOrCreate: "edit",
        identifier: "2",
        listDetails,
      });

      expect(screen.getByTestId("editor-listid")).toHaveTextContent("2");
      expect(screen.getByTestId("editor-library")).toHaveTextContent("library");
      expect(fetchCustomListDetails).toHaveBeenCalledTimes(1);

      rerender(
        <UnconnectedCustomLists
          {...(baseCustomListsProps({
            editOrCreate: "edit",
            identifier: "1",
            listDetails,
          }) as any)}
        />
      );
      expect(fetchCustomListDetails).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId("editor-listid")).toHaveTextContent("1");
    });

    it("shares the current list through the editor's share action", async () => {
      const user = userEvent.setup();
      renderCustomLists({ editOrCreate: "edit", identifier: "2" });
      await user.click(screen.getByTestId("editor-share"));
      expect(shareCustomList).toHaveBeenCalledTimes(1);
      expect(shareCustomList).toHaveBeenCalledWith("2");
    });

    it("refetches the list details after saving in edit mode", async () => {
      const user = userEvent.setup();
      renderCustomLists({ editOrCreate: "edit", identifier: "2" });
      expect(fetchCustomListDetails).toHaveBeenCalledTimes(1);

      await user.click(screen.getByTestId("editor-save"));
      expect(saveCustomListEditor).toHaveBeenCalledTimes(1);
      await waitFor(() =>
        expect(fetchCustomListDetails).toHaveBeenCalledTimes(2)
      );
    });

    it("keeps lists with identical names in a stable order", () => {
      const sameNameLists = [
        {
          id: 1,
          name: "same name",
          entry_count: 0,
          collections: [],
          is_owner: true,
          is_shared: false,
        },
        {
          id: 2,
          name: "same name",
          entry_count: 0,
          collections: [],
          is_owner: true,
          is_shared: false,
        },
      ];
      const { container } = renderCustomLists({ lists: sameNameLists });
      expect(
        container.querySelectorAll(".custom-lists-sidebar ul > li")
      ).toHaveLength(2);
    });

    it("gets the enabled entry points for the current library", () => {
      const forLibrary = renderCustomLists({ editOrCreate: "create" });
      expect(forLibrary.getByTestId("editor-entrypoints")).toHaveTextContent(
        "Book,Audio"
      );
      forLibrary.unmount();

      const forAnotherLibrary = renderCustomLists(
        { editOrCreate: "create", library: "another library" },
        librarianConfig
      );
      expect(
        forAnotherLibrary.getByTestId("editor-entrypoints")
      ).toHaveTextContent("Audio");
    });
  });
});
