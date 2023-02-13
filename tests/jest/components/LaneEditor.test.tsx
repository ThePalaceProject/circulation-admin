import * as React from "react";
import { render, screen } from "@testing-library/react";
import { stub } from "sinon";
import { LaneData } from "../../../src/interfaces";
import LaneEditor from "../../../src/components/LaneEditor";

// Mock the LaneCustomListsEditor so we can verify that it is or isn't rendered. This serves as an
// example of how to do something analogous to Enzyme's shallow rendering, when we don't want/need
// to render the whole component tree down to HTML elements to test something. This technique is
// useful for testing components in isolation (unit testing), instead of the integration testing
// that RTL focuses on.

jest.mock("../../../src/components/LaneCustomListsEditor", () => ({
  __esModule: true,
  default: (props) => <div data-testid="LaneCustomListsEditor" />,
}));

const customListsData = [
  { id: 1, name: "list 1", entries: [], is_owner: true, is_shared: false },
];

const editLane = stub().returns(
  new Promise<void>((resolve) => resolve())
);

const deleteLane = stub().returns(
  new Promise<void>((resolve) => resolve())
);

const toggleLaneVisibility = stub();

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
          findParentOfLane={stub().returns(laneData)}
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
          findParentOfLane={stub().returns(laneData)}
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
        findParentOfLane={stub().returns(laneData)}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );

    expect(screen.queryByTestId("LaneCustomListsEditor")).toBeNull();
  });
});
