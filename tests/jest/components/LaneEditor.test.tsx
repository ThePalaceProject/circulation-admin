import * as React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LaneData } from "../../../src/interfaces";
import LaneEditor from "../../../src/components/LaneEditor";
import * as navigate from "../../../src/utils/navigate";

// Mock the LaneCustomListsEditor so we can verify that it is or isn't rendered. This serves as an
// example of how to do something analogous to Enzyme's shallow rendering, when we don't want/need
// to render the whole component tree down to HTML elements to test something. This technique is
// useful for testing components in isolation (unit testing), instead of the integration testing
// that RTL focuses on.
//
// The mock is a class component (not a bare function) so that LaneEditor's ref to
// it resolves to an instance exposing the imperative API that `save()`/`reset()`
// call (`getCustomListIds()` / `reset()`). It also renders its `filteredCustomLists`
// and a few buttons that invoke the `changeFilter` / `onUpdate` callbacks, so tests
// can drive the parent's filtering and custom-list-selection behavior without the
// real drag-and-drop editor.

jest.mock("../../../src/components/LaneCustomListsEditor", () => ({
  __esModule: true,
  default: class MockLaneCustomListsEditor extends React.Component<any> {
    getCustomListIds() {
      return this.props.customListIds;
    }
    reset() {
      // No-op stand-in; its presence lets LaneEditor.reset() call it via the ref.
    }
    render() {
      const { filteredCustomLists = [], changeFilter, onUpdate } = this.props;
      return (
        <div data-testid="LaneCustomListsEditor">
          <ul data-testid="filtered-custom-lists">
            {filteredCustomLists.map((list: any) => (
              <li key={list.id}>{list.name}</li>
            ))}
          </ul>
          <button type="button" onClick={() => changeFilter("shared-in")}>
            filter shared-in
          </button>
          <button type="button" onClick={() => changeFilter("shared-out")}>
            filter shared-out
          </button>
          <button type="button" onClick={() => changeFilter("")}>
            filter all
          </button>
          <button type="button" onClick={() => onUpdate([1, 2])}>
            set lists 1 2
          </button>
          <button type="button" onClick={() => onUpdate([99])}>
            set lists 99
          </button>
        </div>
      );
    }
  },
}));

const customListsData = [
  { id: 1, name: "list 1", entries: [], is_owner: true, is_shared: false },
];

const editLane = jest
  .fn()
  .mockReturnValue(new Promise<void>((resolve) => resolve()));

const deleteLane = jest
  .fn()
  .mockReturnValue(new Promise<void>((resolve) => resolve()));

const toggleLaneVisibility = jest.fn();

function createLaneData(displayName: string, isAutomated: boolean): LaneData {
  return {
    id: 1,
    display_name: displayName,
    visible: true,
    count: 5,
    sublanes: [
      {
        id: 2,
        display_name: `Sublane of ${displayName}`,
        visible: true,
        count: 3,
        sublanes: [],
        custom_list_ids: [1],
        inherit_parent_restrictions: false,
      },
    ],
    // The absence/presence of custom list ids determines if a lane is automated or custom.
    custom_list_ids: isAutomated ? [] : [1],
    inherit_parent_restrictions: true,
  };
}

describe("LaneEditor", () => {
  describe("for a custom lane", () => {
    const laneData = createLaneData("Custom Lane", false);

    beforeEach(() => {
      render(
        <LaneEditor
          library="library"
          lane={laneData}
          customLists={customListsData}
          editOrCreate="edit"
          editLane={editLane}
          deleteLane={deleteLane}
          findParentOfLane={jest.fn().mockReturnValue(laneData)}
          toggleLaneVisibility={toggleLaneVisibility}
        />
      );
    });

    it("renders a delete button", () => {
      expect(screen.getByRole("button", { name: /delete/i })).not.toBeNull();
    });

    it("renders an inherit parent restrictions checkbox", () => {
      expect(
        screen.getByRole("checkbox", {
          name: /inherit restrictions from parent/i,
        })
      ).not.toBeNull();
    });

    it("renders a custom lists editor", () => {
      expect(screen.getByTestId("LaneCustomListsEditor")).not.toBeNull();
    });
  });

  describe("for an automated lane", () => {
    const laneData = createLaneData("Automated Lane", true);

    beforeEach(() => {
      render(
        <LaneEditor
          library="library"
          lane={laneData}
          customLists={customListsData}
          editOrCreate="edit"
          editLane={editLane}
          deleteLane={deleteLane}
          findParentOfLane={jest.fn().mockReturnValue(laneData)}
          toggleLaneVisibility={toggleLaneVisibility}
        />
      );
    });

    it("does not render a delete button", () => {
      expect(screen.queryByRole("button", { name: /delete/i })).toBeNull();
    });

    it("does not render an inherit parent restrictions checkbox", () => {
      expect(
        screen.queryByRole("checkbox", {
          name: /inherit restrictions from parent/i,
        })
      ).toBeNull();
    });

    it("does not render a custom lists editor", () => {
      expect(screen.queryByTestId("LaneCustomListsEditor")).toBeNull();
    });

    it("renders an explanation that the lane contents can't be edited", () => {
      expect(screen.getByText(/contents cannot be edited/i)).not.toBeNull();
    });
  });

  it("doesn't render a custom lists editor while a lane is being loaded for editing", () => {
    const laneData = null;

    render(
      <LaneEditor
        library="library"
        lane={laneData}
        customLists={customListsData}
        editOrCreate="edit"
        editLane={editLane}
        deleteLane={deleteLane}
        findParentOfLane={jest.fn().mockReturnValue(laneData)}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );

    expect(screen.queryByTestId("LaneCustomListsEditor")).toBeNull();
  });
});

// These drive the real name field and the mocked custom-lists editor's callbacks,
// asserting on the resulting DOM and on the props passed to the injected
// `editLane` / `deleteLane` / `toggleLaneVisibility` handlers. Navigation is
// asserted by spying on `navigate.navigateTo`.
describe("LaneEditor — name, list editing, and actions", () => {
  const twoLists = [
    { id: 1, name: "list 1", entries: [], is_owner: true, is_shared: false },
    { id: 2, name: "list 2", entries: [], is_owner: false, is_shared: true },
  ];

  const resolved = () => jest.fn().mockResolvedValue(undefined);

  it("shows the lane name, id, and visible status", () => {
    const lane = createLaneData("Custom Lane", false);
    render(
      <LaneEditor
        library="library"
        lane={lane}
        customLists={customListsData}
        editOrCreate="edit"
        editLane={resolved()}
        deleteLane={resolved()}
        findParentOfLane={() => null}
        toggleLaneVisibility={resolved()}
      />
    );

    expect(screen.getByText("Custom Lane")).toBeInTheDocument();
    expect(screen.getByText("ID-1")).toBeInTheDocument();
    expect(screen.getByText(/currently visible/i)).toBeInTheDocument();
  });

  it("updates the visible status when the lane prop changes", () => {
    const visibleLane = createLaneData("Lane", false);
    const hiddenLane = { ...visibleLane, visible: false };
    const shared = {
      library: "library",
      customLists: customListsData,
      editOrCreate: "edit",
      editLane: resolved(),
      deleteLane: resolved(),
      findParentOfLane: () => null,
      toggleLaneVisibility: resolved(),
    };

    const { rerender } = render(<LaneEditor {...shared} lane={visibleLane} />);
    expect(screen.getByText(/currently visible/i)).toBeInTheDocument();

    rerender(<LaneEditor {...shared} lane={hiddenLane} />);
    expect(screen.getByText(/currently hidden/i)).toBeInTheDocument();
  });

  it("shows when the lane's parent is hidden", () => {
    const hiddenLane = { ...createLaneData("Lane", false), visible: false };
    const hiddenParent = {
      ...createLaneData("Parent", false),
      id: 5,
      visible: false,
    };
    render(
      <LaneEditor
        library="library"
        lane={hiddenLane}
        customLists={customListsData}
        editOrCreate="edit"
        editLane={resolved()}
        deleteLane={resolved()}
        findParentOfLane={() => hiddenParent}
        toggleLaneVisibility={resolved()}
      />
    );

    expect(screen.getByText(/parent is currently hidden/i)).toBeInTheDocument();
  });

  it("toggles the inherit-parent-restrictions checkbox", async () => {
    const user = userEvent.setup();
    const lane = createLaneData("Custom Lane", false);
    const parent = createLaneData("Parent", false);
    render(
      <LaneEditor
        library="library"
        lane={lane}
        customLists={customListsData}
        editOrCreate="edit"
        editLane={resolved()}
        deleteLane={resolved()}
        findParentOfLane={() => parent}
        toggleLaneVisibility={resolved()}
      />
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /inherit restrictions from parent/i,
    });
    expect(checkbox).toBeChecked();
    expect(
      screen.queryByRole("button", { name: /cancel changes/i })
    ).toBeNull();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(
      screen.getByRole("button", { name: /cancel changes/i })
    ).toBeInTheDocument();
  });

  it("filters the custom lists shown in the editor", async () => {
    const user = userEvent.setup();
    const lane = createLaneData("Custom Lane", false);
    render(
      <LaneEditor
        library="library"
        lane={lane}
        customLists={twoLists}
        editOrCreate="edit"
        editLane={resolved()}
        deleteLane={resolved()}
        findParentOfLane={() => null}
        toggleLaneVisibility={resolved()}
      />
    );

    const filtered = () => within(screen.getByTestId("filtered-custom-lists"));

    // The default filter is "owned".
    expect(filtered().getByText("list 1")).toBeInTheDocument();
    expect(filtered().queryByText("list 2")).toBeNull();

    await user.click(screen.getByRole("button", { name: /filter shared-in/i }));
    expect(filtered().getByText("list 2")).toBeInTheDocument();
    expect(filtered().queryByText("list 1")).toBeNull();

    // "shared-out" keeps only owned-and-shared lists; neither qualifies.
    await user.click(
      screen.getByRole("button", { name: /filter shared-out/i })
    );
    expect(filtered().queryByText("list 1")).toBeNull();
    expect(filtered().queryByText("list 2")).toBeNull();

    await user.click(screen.getByRole("button", { name: /filter all/i }));
    expect(filtered().getByText("list 1")).toBeInTheDocument();
    expect(filtered().getByText("list 2")).toBeInTheDocument();
  });

  it("marks changes when the selected custom lists change", async () => {
    const user = userEvent.setup();
    const lane = createLaneData("Custom Lane", false);
    render(
      <LaneEditor
        library="library"
        lane={lane}
        customLists={twoLists}
        editOrCreate="edit"
        editLane={resolved()}
        deleteLane={resolved()}
        findParentOfLane={() => null}
        toggleLaneVisibility={resolved()}
      />
    );

    expect(
      screen.queryByRole("button", { name: /cancel changes/i })
    ).toBeNull();

    // Same number of lists, different contents.
    await user.click(screen.getByRole("button", { name: /set lists 99/i }));
    expect(
      screen.getByRole("button", { name: /cancel changes/i })
    ).toBeInTheDocument();

    // Different number of lists.
    await user.click(screen.getByRole("button", { name: /set lists 1 2/i }));
    expect(
      screen.getByRole("button", { name: /cancel changes/i })
    ).toBeInTheDocument();
  });

  it("deletes the lane when the delete button is clicked", async () => {
    const user = userEvent.setup();
    const lane = createLaneData("Custom Lane", false);
    const deleteLane = resolved();
    render(
      <LaneEditor
        library="library"
        lane={lane}
        customLists={customListsData}
        editOrCreate="edit"
        editLane={resolved()}
        deleteLane={deleteLane}
        findParentOfLane={() => null}
        toggleLaneVisibility={resolved()}
      />
    );

    await user.click(screen.getByRole("button", { name: /delete lane/i }));

    expect(deleteLane).toHaveBeenCalledTimes(1);
    expect(deleteLane).toHaveBeenCalledWith(lane);
  });

  it("toggles lane visibility when the hide button is clicked", async () => {
    const user = userEvent.setup();
    const lane = createLaneData("Custom Lane", false);
    const toggleLaneVisibility = resolved();
    render(
      <LaneEditor
        library="library"
        lane={lane}
        customLists={customListsData}
        editOrCreate="edit"
        editLane={resolved()}
        deleteLane={resolved()}
        findParentOfLane={() => null}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );

    await user.click(screen.getByRole("button", { name: /hide lane/i }));

    expect(toggleLaneVisibility).toHaveBeenCalledWith(lane, false);
  });

  it("saves the lane, building a FormData payload", async () => {
    const user = userEvent.setup();
    const lane = createLaneData("Custom Lane", false);
    const parent = { ...createLaneData("Parent", false), id: 7 };
    const editLane = resolved();
    render(
      <LaneEditor
        library="library"
        lane={lane}
        customLists={customListsData}
        editOrCreate="edit"
        editLane={editLane}
        deleteLane={resolved()}
        findParentOfLane={() => parent}
        toggleLaneVisibility={resolved()}
      />
    );

    await user.click(screen.getByRole("button", { name: /save lane/i }));
    await waitFor(() => expect(editLane).toHaveBeenCalledTimes(1));

    const formData = editLane.mock.calls[0][0];
    expect(formData.get("id")).toBe("1");
    expect(formData.get("parent_id")).toBe("7");
    expect(formData.get("display_name")).toBe("Custom Lane");
    expect(formData.get("custom_list_ids")).toBe(JSON.stringify([1]));
    expect(formData.get("inherit_parent_restrictions")).toBe("true");
  });

  it("navigates to the edit page after creating a new lane", async () => {
    const user = userEvent.setup();
    const editLane = resolved();
    const navSpy = jest
      .spyOn(navigate, "navigateTo")
      .mockImplementation(() => undefined);
    render(
      <LaneEditor
        library="library"
        customLists={twoLists}
        responseBody="5"
        editLane={editLane}
        deleteLane={resolved()}
        findParentOfLane={() => null}
        toggleLaneVisibility={resolved()}
      />
    );

    // A new lane's name field starts in edit mode.
    await user.type(screen.getByRole("textbox"), "new lane name");
    await user.click(screen.getByRole("button", { name: /save lane/i }));

    await waitFor(() =>
      expect(navSpy).toHaveBeenCalledWith("/admin/web/lanes/library/edit/5")
    );

    navSpy.mockRestore();
  });

  it("cancels changes, resetting the form", async () => {
    const user = userEvent.setup();
    const lane = createLaneData("Custom Lane", false);
    const parent = createLaneData("Parent", false);
    render(
      <LaneEditor
        library="library"
        lane={lane}
        customLists={customListsData}
        editOrCreate="edit"
        editLane={resolved()}
        deleteLane={resolved()}
        findParentOfLane={() => parent}
        toggleLaneVisibility={resolved()}
      />
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /inherit restrictions from parent/i,
    });
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: /cancel changes/i }));

    // reset() restores the inherited-restrictions state...
    expect(
      screen.getByRole("checkbox", {
        name: /inherit restrictions from parent/i,
      })
    ).toBeChecked();
    // ...and, with no remaining changes, hides the cancel button.
    expect(
      screen.queryByRole("button", { name: /cancel changes/i })
    ).toBeNull();
  });
});
