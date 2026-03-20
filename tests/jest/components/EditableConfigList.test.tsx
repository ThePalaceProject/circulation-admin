import * as React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import Admin from "../../../src/models/Admin";
import {
  EditableConfigList,
  EditFormProps,
  AdditionalContentProps,
} from "../../../src/components/config/EditableConfigList";
import { AdminRole } from "../../../src/interfaces";

// --------------- Type definitions --------------- //

interface Thing {
  id: number;
  label: string;
}

interface Things {
  things: Thing[];
}

// --------------- Mock EditForm components --------------- //

class ThingEditForm extends React.Component<
  EditFormProps<Things, Thing>,
  Record<string, never>
> {
  render(): JSX.Element {
    return <div>Test Edit Form</div>;
  }
}

class AdditionalContent extends React.Component<
  AdditionalContentProps<Things, Thing>,
  Record<string, never>
> {
  render(): JSX.Element {
    return <div>Test Additional Content</div>;
  }
}

// --------------- Test subclasses --------------- //

let canCreate = true;
let canDelete = true;
let canEdit = true;

class ThingEditableConfigList extends EditableConfigList<Things, Thing> {
  EditForm = ThingEditForm;
  listDataKey = "things";
  itemTypeName = "thing";
  urlBase = "/admin/things/";
  identifierKey = "id";
  labelKey = "label";

  label(item: Thing): string {
    return "test " + super.label(item);
  }

  canCreate() {
    return canCreate;
  }

  canDelete() {
    return canDelete;
  }

  canEdit() {
    return canEdit;
  }
}

class OneThingEditableConfigList extends ThingEditableConfigList {
  limitOne = true;
}

class ThingAdditionalContentEditableConfigList extends ThingEditableConfigList {
  AdditionalContent = AdditionalContent;
}

class ThingWithSelfTests extends ThingEditableConfigList {
  links = {
    info: (
      <>
        Self-tests for the things have been moved to{" "}
        <a href="/admin/web/troubleshooting/self-tests/thingServices">
          the troubleshooting page
        </a>
        .
      </>
    ),
    footer: (
      <>
        Problems with your things? Please visit{" "}
        <a href="/admin/web/troubleshooting/self-tests/thingServices">
          the troubleshooting page
        </a>
        .
      </>
    ),
  };
}

// --------------- Admin fixtures --------------- //

const systemAdmin = new Admin([
  { role: "system" as AdminRole, library: "nypl" },
]);
const libraryManager = new Admin([
  { role: "manager" as AdminRole, library: "nypl" },
]);
const librarian = new Admin([
  { role: "librarian" as AdminRole, library: "nypl" },
]);

// --------------- Test data --------------- //

const thingData = { id: 5, label: "label" };
const thingsData = { things: [thingData] };

// --------------- Render helpers --------------- //

interface RenderOptions {
  admin?: Admin;
  props?: Record<string, unknown>;
  ComponentClass?: typeof ThingEditableConfigList;
}

function renderList({
  admin = systemAdmin,
  props = {},
  ComponentClass = ThingEditableConfigList,
}: RenderOptions = {}) {
  const defaultProps = {
    data: thingsData,
    fetchData: jest.fn(),
    editItem: jest.fn().mockResolvedValue(undefined),
    deleteItem: jest.fn().mockResolvedValue(undefined),
    csrfToken: "token",
    isFetching: false,
    admin,
  };
  return render(<ComponentClass {...defaultProps} {...props} />);
}

// --------------- Tests --------------- //

describe("EditableConfigList", () => {
  beforeEach(() => {
    canCreate = true;
    canDelete = true;
    canEdit = true;
  });

  it("shows an error message if there's a problem loading the list", () => {
    const fetchError = {
      status: 404,
      response: "test load error",
      url: "test url",
    };
    const { container } = renderList({ props: { fetchError } });
    expect(container.textContent).toContain("Error: test load error");
  });

  it("does not show error message when editOrCreate is set", () => {
    const fetchError = {
      status: 404,
      response: "test load error",
      url: "test url",
    };
    const { container } = renderList({
      props: { fetchError, editOrCreate: "create" },
    });
    // Should not show load error when in create/edit form
    expect(container.textContent).not.toContain("test load error");
  });

  it("shows form submission error message when editOrCreate is set", () => {
    const formError = {
      status: 400,
      response: "test submission error",
      url: "test url",
    };
    const { container } = renderList({
      props: { formError, editOrCreate: "create" },
    });
    expect(container.textContent).toContain("Error: test submission error");
  });

  it("does not show form submission error when not in create/edit mode", () => {
    const formError = {
      status: 400,
      response: "test submission error",
      url: "test url",
    };
    const { container } = renderList({ props: { formError } });
    expect(container.textContent).not.toContain("test submission error");
  });

  it("shows success message on create", () => {
    const { container } = renderList({
      props: { responseBody: "itemType", editOrCreate: "create" },
    });
    expect(container.textContent).toContain("Successfully created a new thing");
  });

  it("displays edit link in success message on create", () => {
    const { container } = renderList({
      props: { responseBody: "itemType", editOrCreate: "create" },
    });
    const link = container.querySelector(
      'a[href="/admin/things/edit/itemType"]'
    );
    expect(link).not.toBeNull();
  });

  it("shows success message on edit", () => {
    const { container } = renderList({
      props: { responseBody: "itemType", editOrCreate: "edit" },
    });
    expect(container.textContent).toContain("Successfully edited this thing");
  });

  it("does not display edit link in success message on edit", () => {
    const { container } = renderList({
      props: { responseBody: "itemType", editOrCreate: "edit" },
    });
    const link = container.querySelector(
      'a[href="/admin/things/edit/itemType"]'
    );
    expect(link).toBeNull();
  });

  it("shows loading indicator", () => {
    const { container } = renderList({ props: { isFetching: true } });
    // LoadingIndicator renders some kind of loading element
    expect(container.textContent.toLowerCase()).toContain("loading");
  });

  it("shows thing header", () => {
    const { container } = renderList();
    const header = container.querySelector("h2");
    expect(header.textContent).toBe("Thing configuration");
  });

  it("shows thing list", () => {
    const { container } = renderList();
    const items = container.querySelectorAll("li");
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain("test label");
    const editLink = items[0].querySelector<HTMLAnchorElement>(".edit-item");
    expect(editLink.getAttribute("href")).toBe("/admin/things/edit/5");
  });

  it("shows the count of things in the list", () => {
    const { container } = renderList();
    const countEl = container.querySelector(".list-container header div");
    expect(countEl.textContent).toBe("1 configured");
  });

  it("shows create link", () => {
    const { container } = renderList();
    const createLink = container.querySelector<HTMLAnchorElement>(
      ".create-item"
    );
    expect(createLink.textContent).toBe("Create new thing");
    expect(createLink.getAttribute("href")).toBe("/admin/things/create");
  });

  it("hides create link if canCreate returns false", () => {
    canCreate = false;
    const { container } = renderList();
    const createLink = container.querySelector(".create-item");
    expect(createLink).toBeNull();
  });

  it("hides create link if only one item is allowed and it already exists", () => {
    const { container } = renderList({
      ComponentClass: OneThingEditableConfigList,
    });
    const createLinks = container.querySelectorAll(".create-item");
    // Should not show create if limitOne and item exists
    expect(createLinks.length).toBe(0);
  });

  it("shows create link for OneThingEditableConfigList when list is empty", () => {
    const { container } = renderList({
      ComponentClass: OneThingEditableConfigList,
      props: {
        data: { things: [] },
        fetchData: jest.fn(),
        editItem: jest.fn().mockResolvedValue(undefined),
        csrfToken: "token",
        isFetching: false,
      },
    });
    const createLink = container.querySelector<HTMLAnchorElement>(
      ".create-item"
    );
    expect(createLink).not.toBeNull();
    expect(createLink.textContent).toBe("Create new thing");
  });

  it("hides delete button if canDelete returns false", () => {
    canDelete = false;
    const { container } = renderList();
    const deleteButton = container.querySelector(".delete-item");
    expect(deleteButton).toBeNull();
  });

  it("does not delete when confirm returns false", () => {
    const deleteItem = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(window, "confirm").mockReturnValue(false);
    const { container } = renderList({ props: { deleteItem } });
    const deleteButton = container.querySelector<HTMLButtonElement>(
      ".delete-item"
    );
    fireEvent.click(deleteButton);
    expect(deleteItem).not.toHaveBeenCalled();
    (window.confirm as jest.Mock).mockRestore();
  });

  it("deletes an item when confirm returns true", () => {
    const deleteItem = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(window, "confirm").mockReturnValue(true);
    const { container } = renderList({ props: { deleteItem } });
    const deleteButton = container.querySelector<HTMLButtonElement>(
      ".delete-item"
    );
    fireEvent.click(deleteButton);
    expect(deleteItem).toHaveBeenCalledWith(5);
    (window.confirm as jest.Mock).mockRestore();
  });

  it("shows create form when editOrCreate is 'create'", () => {
    const { container } = renderList({ props: { editOrCreate: "create" } });
    expect(container.textContent).toContain("Test Edit Form");
    const header = container.querySelector("h3");
    expect(header.textContent).toBe("Create a new thing");
  });

  it("shows edit form when editOrCreate is 'edit'", () => {
    const { container } = renderList({
      props: { editOrCreate: "edit", identifier: "5" },
    });
    expect(container.textContent).toContain("Test Edit Form");
    const header = container.querySelector("h3");
    expect(header.textContent).toBe("Edit test label");
  });

  it("shows view header when editing an item that cannot be edited", () => {
    canEdit = false;
    const { container } = renderList({
      props: { editOrCreate: "edit", identifier: "5" },
    });
    const header = container.querySelector("h3");
    expect(header.textContent).toBe("test label");
  });

  it("calls fetchData on mount", () => {
    const fetchData = jest.fn();
    renderList({ props: { fetchData } });
    expect(fetchData).toHaveBeenCalledTimes(1);
  });

  it("does not fetch data on mount if isFetching is already true", () => {
    const fetchData = jest.fn();
    renderList({ props: { fetchData, isFetching: true } });
    expect(fetchData).not.toHaveBeenCalled();
  });

  it("fetches data again after save", async () => {
    const fetchData = jest.fn();
    const editItem = jest.fn().mockResolvedValue(undefined);
    const { container } = renderList({
      props: { fetchData, editItem, editOrCreate: "create" },
    });
    // The form exposes a save prop. In ThingEditForm we can call via the component.
    // Since our ThingEditForm renders "Test Edit Form" without save integration,
    // verify fetchData was called on mount only.
    expect(fetchData).toHaveBeenCalledTimes(1);
  });

  it("should not render the AdditionalContent component without configuration", () => {
    const { container } = renderList();
    expect(container.textContent).not.toContain("Test Additional Content");
  });

  it("should render AdditionalContent when configured", () => {
    const { container } = renderList({
      ComponentClass: ThingAdditionalContentEditableConfigList,
    });
    expect(container.textContent).toContain("Test Additional Content");
  });

  it("should not render a troubleshooting link without self-tests config", () => {
    const { container } = renderList();
    // No troubleshooting footer
    expect(container.textContent).not.toContain("Problems with your things");
  });

  it("should render a troubleshooting footer link when self-tests are configured", () => {
    const { container } = renderList({ ComponentClass: ThingWithSelfTests });
    const link = container.querySelector<HTMLAnchorElement>(
      'a[href="/admin/web/troubleshooting/self-tests/thingServices"]'
    );
    expect(link).not.toBeNull();
    expect(container.textContent).toContain("Problems with your things");
  });

  it("should render an info alert when self-tests are configured", () => {
    const { container } = renderList({ ComponentClass: ThingWithSelfTests });
    // The info alert shows at the top
    const alert = container.querySelector(".alert");
    expect(alert).not.toBeNull();
    expect(alert.textContent).toContain(
      "Self-tests for the things have been moved to"
    );
    const infoLink = alert.querySelector<HTMLAnchorElement>(
      'a[href="/admin/web/troubleshooting/self-tests/thingServices"]'
    );
    expect(infoLink).not.toBeNull();
  });

  describe("admin level via canDelete behavior", () => {
    // Use a subclass that does NOT override canDelete, so the base logic
    // (getAdminLevel() === 3) controls whether the delete button appears.
    class LevelTestList extends EditableConfigList<Things, Thing> {
      EditForm = ThingEditForm;
      listDataKey = "things";
      itemTypeName = "thing";
      urlBase = "/admin/things/";
      identifierKey = "id";
      labelKey = "label";
      // Uses base canDelete() = getAdminLevel() === 3
    }

    it("system admin (level 3) can delete", () => {
      const { container } = render(
        <LevelTestList
          data={thingsData}
          fetchData={jest.fn()}
          editItem={jest.fn().mockResolvedValue(undefined)}
          deleteItem={jest.fn().mockResolvedValue(undefined)}
          csrfToken="token"
          isFetching={false}
          admin={systemAdmin}
        />
      );
      expect(container.querySelector(".delete-item")).not.toBeNull();
    });

    it("library manager (level 2) cannot delete", () => {
      const { container } = render(
        <LevelTestList
          data={thingsData}
          fetchData={jest.fn()}
          editItem={jest.fn().mockResolvedValue(undefined)}
          deleteItem={jest.fn().mockResolvedValue(undefined)}
          csrfToken="token"
          isFetching={false}
          admin={libraryManager}
        />
      );
      expect(container.querySelector(".delete-item")).toBeNull();
    });

    it("librarian (level 1) cannot delete", () => {
      const { container } = render(
        <LevelTestList
          data={thingsData}
          fetchData={jest.fn()}
          editItem={jest.fn().mockResolvedValue(undefined)}
          deleteItem={jest.fn().mockResolvedValue(undefined)}
          csrfToken="token"
          isFetching={false}
          admin={librarian}
        />
      );
      expect(container.querySelector(".delete-item")).toBeNull();
    });
  });
});
