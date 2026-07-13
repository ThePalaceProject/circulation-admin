import * as React from "react";
import { installFormDataShim } from "../testUtils/formDataShim";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Collections } from "../../../src/components/Collections";
import CollectionsConnected from "../../../src/components/Collections";
import renderWithContext from "../testUtils/renderWithContext";
import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
import {
  CollectionsData,
  ConfigurationSettings,
} from "../../../src/interfaces";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";

describe("Collections - associated library disclosure", () => {
  // ── Shared fixtures ───────────────────────────────────────────────────────

  const allLibraries = [
    { short_name: "gamma", name: "Gamma Library", uuid: "uuid-gamma" },
    { short_name: "alpha", name: "Alpha Library", uuid: "uuid-alpha" },
    { short_name: "beta", name: "Beta Library", uuid: "uuid-beta" },
    { short_name: "delta", name: "Delta Library" }, // no uuid
  ];

  const sysAdminConfig: Partial<ConfigurationSettings> = {
    csrfToken: "",
    featureFlags: defaultFeatureFlags,
    roles: [{ role: "system" }],
  };

  const renderCollections = (data: Partial<CollectionsData>) =>
    renderWithContext(
      <Collections
        data={
          {
            collections: [],
            protocols: [],
            allLibraries,
            ...data,
          } as CollectionsData
        }
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        deleteItem={jest.fn().mockResolvedValue(undefined)}
        registerLibrary={jest.fn().mockResolvedValue(undefined)}
        importCollection={jest.fn().mockResolvedValue(undefined)}
        reapCollection={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />,
      sysAdminConfig
    );

  // ── Toggle visibility ─────────────────────────────────────────────────────

  it("shows no toggle for a collection without a libraries field", () => {
    const { container } = renderCollections({
      collections: [{ id: 1, protocol: "p", name: "My Collection" } as any],
    });
    expect(container.querySelector(".association-toggle")).toBeNull();
    expect(container.querySelector(".library-count")).toBeNull();
  });

  it("shows a disabled toggle and 'no libraries' for a collection with an empty libraries array", () => {
    const { container } = renderCollections({
      collections: [
        { id: 1, protocol: "p", name: "My Collection", libraries: [] } as any,
      ],
    });
    const toggle = container.querySelector<HTMLButtonElement>(
      ".association-toggle"
    );
    expect(toggle).not.toBeNull();
    expect(toggle.disabled).toBe(true);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (no libraries)"
    );
  });

  it("shows '1 library' for a collection with one associated library", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "alpha" }],
        } as any,
      ],
    });
    const toggle = container.querySelector<HTMLButtonElement>(
      ".association-toggle"
    );
    expect(toggle.disabled).toBe(false);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (1 library)"
    );
  });

  it("shows 'N libraries' for a collection with multiple associated libraries", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [
            { short_name: "alpha" },
            { short_name: "beta" },
            { short_name: "gamma" },
          ],
        } as any,
      ],
    });
    expect(container.querySelector(".library-count").textContent).toBe(
      " (3 libraries)"
    );
  });

  // ── Expand / collapse ─────────────────────────────────────────────────────

  it("expands the library list on toggle click and collapses on a second click", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "alpha" }, { short_name: "beta" }],
        } as any,
      ],
    });
    const toggle = container.querySelector(".association-toggle");
    expect(container.querySelector(".associated-items")).toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector(".associated-items")).not.toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector(".associated-items")).toBeNull();
  });

  // ── allLibraries injection from mapStateToProps ───────────────────────────

  it("resolves library display names from allLibraries", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "alpha" }, { short_name: "beta" }],
        } as any,
      ],
    });
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    // Sorted alphabetically: Alpha, Beta
    expect(items[0].textContent).toBe("Alpha Library");
    expect(items[1].textContent).toBe("Beta Library");
  });

  it("links a library name to its config page when a uuid is available", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "alpha" }],
        } as any,
      ],
    });
    fireEvent.click(container.querySelector(".association-toggle"));

    const link = container.querySelector<HTMLAnchorElement>(
      ".associated-items a"
    );
    expect(link).not.toBeNull();
    expect(link.textContent).toBe("Alpha Library");
    expect(link.href).toContain("/admin/web/config/libraries/edit/uuid-alpha");
  });

  it("renders a library without a uuid as plain text", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "delta" }],
        } as any,
      ],
    });
    fireEvent.click(container.querySelector(".association-toggle"));

    expect(container.querySelector(".associated-items a")).toBeNull();
    expect(container.querySelector(".associated-items li").textContent).toBe(
      "Delta Library"
    );
  });

  it("falls back to short_name when the library is not in allLibraries", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "unknown" }],
        } as any,
      ],
    });
    fireEvent.click(container.querySelector(".association-toggle"));

    expect(container.querySelector(".associated-items li").textContent).toBe(
      "unknown"
    );
  });
});

// These exercise behavior the disclosure tests above do not: the connect()
// wiring (mapStateToProps / mapDispatchToProps, which only run when the CONNECTED
// default export mounts), the marked-for-deletion list item, the
// confirm-before-disassociating-libraries behavior, the
// getChildContext().registerLibrary closure, the on-mount registrations fetch,
// and the delete flow.

describe("Collections - connected wiring, deletion, and registration", () => {
  const allLibraries = [
    { short_name: "nypl", name: "NYPL", uuid: "uuid-nypl" },
  ];

  const sysAdminConfig: Partial<ConfigurationSettings> = {
    csrfToken: "",
    featureFlags: defaultFeatureFlags,
    roles: [{ role: "system" }],
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("connected default export", () => {
    // A loaded `libraries` slice persists through the on-mount collections fetch
    // (the libraries reducer ignores that action), so mapStateToProps takes its
    // `data.allLibraries` branch on every render.
    const loadedLibrariesState = {
      data: { libraries: allLibraries },
      isFetching: false,
      isEditing: false,
      fetchError: null,
      formError: null,
      isLoaded: true,
      responseBody: null,
      successMessage: null,
    };

    const stubFetch = (body: unknown) =>
      jest.spyOn(globalThis, "fetch").mockImplementation(
        async () =>
          new Response(JSON.stringify(body), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
      );

    it("wires mapStateToProps/mapDispatchToProps and marks a collection for deletion", async () => {
      const listData = {
        collections: [
          { id: 2, protocol: "test protocol", name: "ODL" },
          {
            id: 3,
            protocol: "test protocol",
            name: "Enki",
            marked_for_deletion: true,
          },
        ],
        protocols: [{ name: "test protocol", label: "TP", settings: [] }],
      };
      stubFetch(listData);
      const store = buildStore({
        editor: { libraries: loadedLibrariesState },
      } as any);

      const { container } = renderWithProviders(
        <CollectionsConnected csrfToken="token" />,
        {
          reduxProviderProps: { store },
          appConfigSettings: sysAdminConfig,
        }
      );

      // The list appears once the connected component's on-mount fetch resolves
      // and mapStateToProps feeds the fetched data back in as props.
      expect(
        await screen.findByRole("heading", { level: 3, name: "ODL" })
      ).toBeInTheDocument();

      // The non-deleted collection has edit and delete controls.
      const editLink = container.querySelector("a.edit-item");
      expect(editLink.getAttribute("href")).toBe(
        "/admin/web/config/collections/edit/2"
      );

      // The deleted collection renders a special item with no edit/delete
      // controls and an explanatory message.
      const deleted = container.querySelector(".deleted-collection");
      expect(deleted).not.toBeNull();
      expect(deleted).toHaveTextContent("Enki");
      expect(deleted).toHaveTextContent(/cannot be edited/);
      expect(deleted.querySelector("a.edit-item")).toBeNull();
      expect(deleted.querySelector("button.delete-item")).toBeNull();
    });
  });

  describe("edit mode: registration and additional content", () => {
    // The reusable-components `Form` builds `new FormData(formElement)` on
    // submit, which the unit jsdom env's undici FormData rejects; install the
    // shared shim that reads the form's successful controls.
    installFormDataShim();
    it("fetches registrations on mount, renders task controls, and registers a library on click", async () => {
      const user = userEvent.setup();
      const registerLibrary = jest.fn().mockResolvedValue(undefined);
      const fetchLibraryRegistrations = jest.fn().mockResolvedValue(undefined);
      renderWithContext(
        <Collections
          data={
            {
              collections: [
                {
                  id: 7,
                  protocol: "OPDS Import",
                  name: "An OPDS Collection",
                  libraries: [],
                },
              ],
              protocols: [
                {
                  name: "OPDS Import",
                  supports_registration: true,
                  supports_import: true,
                  settings: [],
                  library_settings: [],
                },
              ],
              allLibraries,
            } as any
          }
          editOrCreate="edit"
          identifier="7"
          fetchData={jest.fn()}
          editItem={jest.fn().mockResolvedValue(undefined)}
          deleteItem={jest.fn().mockResolvedValue(undefined)}
          registerLibrary={registerLibrary}
          fetchLibraryRegistrations={fetchLibraryRegistrations}
          importCollection={jest.fn().mockResolvedValue(undefined)}
          reapCollection={jest.fn().mockResolvedValue(undefined)}
          csrfToken="token"
          isFetching={false}
        />,
        sysAdminConfig
      );

      // componentDidMount fetches the registrations once. (CollectionEditForm's
      // renderAdditionalContent also runs here, since the edited collection has
      // an id, injecting the import/reap task panels into the form.)
      expect(fetchLibraryRegistrations).toHaveBeenCalledTimes(1);

      // Registering a library goes through getChildContext().registerLibrary.
      expect(registerLibrary).not.toHaveBeenCalled();
      await user.click(screen.getByRole("button", { name: "Register" }));

      expect(registerLibrary).toHaveBeenCalledTimes(1);
      const formData = registerLibrary.mock.calls[0][0];
      expect(formData.get("library_short_name")).toBe("nypl");
      expect(formData.get("collection_id")).toBe("7");

      // After a successful registration, the child context refetches.
      await waitFor(() =>
        expect(fetchLibraryRegistrations).toHaveBeenCalledTimes(2)
      );
    });
  });

  describe("confirm before disassociating libraries", () => {
    const initialLibraries = [
      { short_name: "palace", name: "Palace" },
      { short_name: "another-library", name: "Another Library" },
    ];

    const renderEditForm = (
      libraries: Array<{ short_name: string }>,
      libraryMeta: Array<{ short_name: string; name?: string }>
    ) =>
      renderWithContext(
        <Collections
          data={
            {
              collections: [
                {
                  id: 7,
                  protocol: "OPDS Import",
                  name: "An OPDS Collection",
                  libraries,
                },
              ],
              protocols: [
                { name: "OPDS Import", settings: [], library_settings: [] },
              ],
              allLibraries: libraryMeta,
            } as any
          }
          editOrCreate="edit"
          identifier="7"
          fetchData={jest.fn()}
          editItem={jest.fn().mockResolvedValue(undefined)}
          deleteItem={jest.fn().mockResolvedValue(undefined)}
          registerLibrary={jest.fn().mockResolvedValue(undefined)}
          importCollection={jest.fn().mockResolvedValue(undefined)}
          reapCollection={jest.fn().mockResolvedValue(undefined)}
          csrfToken="token"
          isFetching={false}
        />,
        sysAdminConfig
      );

    it("removes the library when the confirmation is accepted", () => {
      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
      const { container } = renderEditForm(
        [...initialLibraries],
        [...initialLibraries]
      );

      // One remove button per associated library.
      expect(container.querySelectorAll("button.remove-btn")).toHaveLength(2);

      fireEvent.click(container.querySelectorAll("button.remove-btn")[0]);

      // The prompt names the (full) library being removed.
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(confirmSpy.mock.calls[0][0]).toBe(
        'Disassociating library "Palace" from this collection will ' +
          "remove all loans and holds for its patrons. Do you wish to continue?"
      );

      // The association (and its remove button) is gone.
      expect(container.querySelectorAll("button.remove-btn")).toHaveLength(1);
    });

    it("keeps the library when the confirmation is canceled", () => {
      jest.spyOn(window, "confirm").mockReturnValue(false);
      const { container } = renderEditForm(
        [...initialLibraries],
        [...initialLibraries]
      );

      expect(container.querySelectorAll("button.remove-btn")).toHaveLength(2);
      fireEvent.click(container.querySelectorAll("button.remove-btn")[0]);
      // Nothing was removed.
      expect(container.querySelectorAll("button.remove-btn")).toHaveLength(2);
    });

    it("uses the library short_name in the prompt when the full name is unavailable", () => {
      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
      // The library is not present in allLibraries, so getLibrary() returns null.
      const { container } = renderEditForm([{ short_name: "orphan" }], []);

      fireEvent.click(container.querySelector("button.remove-btn"));

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(confirmSpy.mock.calls[0][0]).toBe(
        'Disassociating library "orphan" from this collection will ' +
          "remove all loans and holds for its patrons. Do you wish to continue?"
      );
    });
  });

  describe("create mode", () => {
    it("renders the create form without import/reap task panels", () => {
      // In create mode there is no saved collection, so CollectionEditForm's
      // renderAdditionalContent short-circuits and injects no task panels.
      renderWithContext(
        <Collections
          data={
            {
              collections: [],
              protocols: [
                { name: "OPDS Import", settings: [], library_settings: [] },
              ],
              allLibraries,
            } as any
          }
          editOrCreate="create"
          fetchData={jest.fn()}
          editItem={jest.fn().mockResolvedValue(undefined)}
          deleteItem={jest.fn().mockResolvedValue(undefined)}
          registerLibrary={jest.fn().mockResolvedValue(undefined)}
          importCollection={jest.fn().mockResolvedValue(undefined)}
          reapCollection={jest.fn().mockResolvedValue(undefined)}
          csrfToken="token"
          isFetching={false}
        />,
        sysAdminConfig
      );

      expect(
        screen.getByRole("heading", { name: "Create a new collection" })
      ).toBeInTheDocument();
    });
  });

  describe("deletion", () => {
    it("deletes a collection and refetches after confirmation", async () => {
      const deleteItem = jest.fn().mockResolvedValue(undefined);
      const fetchData = jest.fn();
      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

      const { container } = renderWithContext(
        <Collections
          data={
            {
              collections: [{ id: 1, protocol: "p", name: "My Collection" }],
              protocols: [],
              allLibraries,
            } as any
          }
          fetchData={fetchData}
          editItem={jest.fn().mockResolvedValue(undefined)}
          deleteItem={deleteItem}
          registerLibrary={jest.fn().mockResolvedValue(undefined)}
          importCollection={jest.fn().mockResolvedValue(undefined)}
          reapCollection={jest.fn().mockResolvedValue(undefined)}
          csrfToken="token"
          isFetching={false}
        />,
        sysAdminConfig
      );

      fireEvent.click(container.querySelector("button.delete-item"));

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(deleteItem).toHaveBeenCalledWith(1));
      // fetchData is called once on mount; the post-delete refetch is the second
      // call, so assert the count rather than mere invocation.
      await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(2));
    });
  });
});
