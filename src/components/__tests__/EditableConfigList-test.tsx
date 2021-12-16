import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";
import * as PropTypes from "prop-types";

import Admin from "../../models/Admin";
import {
  EditableConfigList,
  EditFormProps,
  AdditionalContentProps,
} from "../EditableConfigList";
import ErrorMessage from "../ErrorMessage";
import EditableInput from "../EditableInput";
import { Alert } from "react-bootstrap";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";

describe("EditableConfigList", () => {
  interface Thing {
    id: number;
    label: string;
  }

  interface Things {
    things: Thing[];
  }

  class ThingEditForm extends React.Component<
    EditFormProps<Things, Thing>,
    {}
  > {
    render(): JSX.Element {
      return <div>Test</div>;
    }
  }

  class ThingEditFormWithInputs extends React.Component<
    EditFormProps<Things, Thing>,
    {}
  > {
    render(): JSX.Element {
      return (
        <div>
          <EditableInput
            elementType="input"
            type="text"
            ref="textInput"
            value="VALUE"
          />
        </div>
      );
    }
  }

  class AdditionalContent extends React.Component<
    AdditionalContentProps<Things, Thing>,
    {}
  > {
    render(): JSX.Element {
      return <div>Test Additional Content</div>;
    }
  }

  let canCreate: boolean;
  let canDelete: boolean;
  let canEdit: boolean;

  class ThingEditableConfigList extends EditableConfigList<Things, Thing> {
    EditForm = ThingEditForm;
    listDataKey = "things";
    itemTypeName = "thing";
    urlBase = "/admin/things/";
    identifierKey = "id";
    labelKey = "label";

    label(item): string {
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

  let wrapper;
  let fetchData;
  let editItem;
  let deleteItem;
  const thingData = { id: 5, label: "label" };
  const thingsData = { things: [thingData] };

  const pause = () => {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
  };

  const systemAdmin = new Admin([{ role: "system", library: "nypl" }]);
  const libraryManager = new Admin([{ role: "manager", library: "nypl" }]);
  const childContextTypes = {
    admin: PropTypes.object.isRequired,
  };

  beforeEach(() => {
    fetchData = stub();
    editItem = stub().returns(
      new Promise<void>((resolve) => resolve())
    );
    deleteItem = stub().returns(
      new Promise<void>((resolve) => resolve())
    );
    canCreate = true;
    canDelete = true;
    canEdit = true;

    wrapper = mount(
      <ThingEditableConfigList
        data={thingsData}
        fetchData={fetchData}
        editItem={editItem}
        deleteItem={deleteItem}
        csrfToken="token"
        isFetching={false}
      />,
      { context: { admin: systemAdmin } }
    );
  });

  it("shows an error message if there's a problem loading the list", () => {
    let error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);

    const fetchError = {
      status: 404,
      response: "test load error",
      url: "test url",
    };
    wrapper.setProps({ fetchError });

    error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(1);
    expect(error.text()).to.equal("Error: test load error");

    // Hide the error message when the user goes to the form
    wrapper.setProps({ editOrCreate: "create" });
    error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);
  });

  it("shows form submission error message only if the form is displayed", () => {
    let error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);

    const formError = {
      status: 400,
      response: "test submission error",
      url: "test url",
    };
    wrapper.setProps({ formError });
    error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);

    wrapper.setProps({ editOrCreate: "create" });
    error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(1);
    expect(error.text()).to.equal("Error: test submission error");

    // Hide the error message when the user goes back to the list
    wrapper.setProps({ editOrCreate: "" });
    error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);
  });

  it("shows success message on create", () => {
    let success = wrapper.find(Alert);
    expect(success.length).to.equal(0);
    wrapper.setProps({ responseBody: "itemType", editOrCreate: "create" });
    success = wrapper.find(Alert);
    expect(success.length).to.equal(1);
    expect(success.text()).to.equal("Successfully created a new thing");
  });

  it("displays edit link in success message on create", () => {
    wrapper.setProps({ responseBody: "itemType", editOrCreate: "create" });
    const success = wrapper.find(Alert);
    const link = success.find("a");
    expect(link.length).to.equal(1);
    expect(link.props().href).to.equal("/admin/things/edit/itemType");
  });

  it("shows success message on edit", () => {
    let success = wrapper.find(Alert);
    expect(success.length).to.equal(0);
    wrapper.setProps({ responseBody: "itemType", editOrCreate: "edit" });
    success = wrapper.find(Alert);
    expect(success.length).to.equal(1);
    expect(success.text()).to.equal("Successfully edited this thing");
  });

  it("does not display edit link in success message on edit", () => {
    wrapper.setProps({ responseBody: "itemType", editOrCreate: "edit" });
    const success = wrapper.find(Alert);
    const link = success.find("a");
    expect(link.length).to.equal(0);
  });

  it("correctly formats item type name for success message", () => {
    expect(wrapper.instance().formatItemType()).to.equal("thing");
    const getItemType = stub(wrapper.instance(), "getItemType").returns(
      "ALLCAPS service"
    );
    expect(wrapper.instance().formatItemType()).to.equal("ALLCAPS service");
    getItemType.returns("someCAPS");
    expect(wrapper.instance().formatItemType()).to.equal("somecaps");
    getItemType.restore();
  });

  it("shows loading indicator", () => {
    let loading = wrapper.find(LoadingIndicator);
    expect(loading.length).to.equal(0);
    wrapper.setProps({ isFetching: true });
    loading = wrapper.find(LoadingIndicator);
    expect(loading.length).to.equal(1);
  });

  it("shows thing header", () => {
    const header = wrapper.find("h2");
    expect(header.text()).to.equal("Thing configuration");
  });

  it("shows thing list", () => {
    const things = wrapper.find("li");
    expect(things.length).to.equal(1);
    expect(things.at(0).text()).to.contain("test label");
    const editLink = things.at(0).find(".edit-item").at(0);
    expect(editLink.prop("href")).to.equal("/admin/things/edit/5");
  });

  it("updates thing list", () => {
    const newThing = { id: 6, label: "another thing" };
    const newThingsData = { things: [thingData, newThing] };
    wrapper.setProps({ data: newThingsData });

    const things = wrapper.find("li");
    expect(things.length).to.equal(2);
    expect(things.at(1).text()).to.contain("test another thing");
    const editLink = things.at(1).find(".edit-item").at(0);
    expect(editLink.props().href).to.equal("/admin/things/edit/6");
  });

  it("shows create link", () => {
    const createLink = wrapper.find(".create-item").at(0);
    expect(createLink.text()).to.equal("Create new thing");
    expect(createLink.props().href).to.equal("/admin/things/create");
  });

  it("hides create link if canCreate returns false", () => {
    canCreate = false;
    wrapper = shallow(
      <ThingEditableConfigList
        data={thingsData}
        fetchData={fetchData}
        editItem={editItem}
        deleteItem={deleteItem}
        csrfToken="token"
        isFetching={false}
      />
    );
    const createLink = wrapper.find(".create-item");
    expect(createLink.length).to.equal(0);
  });

  it("hides create link if only one item is allowed and it already exists", () => {
    wrapper = shallow(
      <OneThingEditableConfigList
        data={thingsData}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
      />
    );
    let createLink = wrapper
      .find(".create-item")
      .findWhere((el) => el.text().includes("Create new"));
    expect(createLink.length).to.equal(0);

    wrapper = mount(
      <OneThingEditableConfigList
        data={{ things: [] }}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
      />
    );
    createLink = wrapper.find(".create-item");
    expect(createLink.length).to.equal(1);
    expect(createLink.text()).to.equal("Create new thing");
    expect(createLink.prop("href")).to.equal("/admin/things/create");
  });

  it("displays a view button instead of an edit button if canEdit returns false", () => {
    canEdit = false;
    const viewableThing = { id: 6, label: "View Only", level: 3 };
    wrapper = shallow(
      <ThingEditableConfigList
        data={{ things: [viewableThing] }}
        fetchData={fetchData}
        editItem={editItem}
        deleteItem={deleteItem}
        csrfToken="token"
        isFetching={false}
      />,
      { context: { admin: libraryManager } }
    );
    expect(wrapper.instance().canEdit(viewableThing)).to.be.false;
    const viewLink = wrapper.find("span");
    expect(viewLink.text()).to.contain("View");
    expect(viewLink.text()).not.to.contain("Edit");
  });

  it("hides delete button if canDelete returns false", () => {
    canDelete = false;
    wrapper = shallow(
      <ThingEditableConfigList
        data={thingsData}
        fetchData={fetchData}
        editItem={editItem}
        deleteItem={deleteItem}
        csrfToken="token"
        isFetching={false}
      />
    );

    const things = wrapper.find("li");
    expect(things.length).to.equal(1);
    const deleteButton = things.at(0).find(".delete-item");
    expect(deleteButton.length).to.equal(0);
  });

  it("deletes an item", () => {
    const confirmStub = stub(window, "confirm").returns(false);

    const things = wrapper.find("li");
    expect(things.length).to.equal(1);
    const deleteButton = things.at(0).find(".delete-item").hostNodes();
    expect(deleteButton.length).to.equal(1);
    deleteButton.simulate("click");

    expect(deleteItem.callCount).to.equal(0);

    confirmStub.returns(true);
    deleteButton.simulate("click");

    expect(deleteItem.callCount).to.equal(1);
    expect(deleteItem.args[0][0]).to.equal(5);

    confirmStub.restore();
  });

  it("shows create form", () => {
    let form = wrapper.find(ThingEditForm);
    expect(form.length).to.equal(0);
    wrapper.setProps({ editOrCreate: "create" });
    form = wrapper.find(ThingEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().data).to.deep.equal(thingsData);
    expect(form.props().item).to.be.undefined;
    expect(form.props().disabled).to.equal(false);
    expect(form.props().listDataKey).to.equal("things");
  });

  it("shows correct header on create form", () => {
    wrapper.setProps({ editOrCreate: "create" });
    const formHeader = wrapper.find("h3");
    expect(formHeader.length).to.equal(1);
    expect(formHeader.text()).to.equal("Create a new thing");
  });

  it("shows edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "5" });
    const form = wrapper.find(ThingEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().data).to.deep.equal(thingsData);
    expect(form.props().item).to.equal(thingData);
    expect(form.props().disabled).to.equal(false);
    expect(form.props().listDataKey).to.equal("things");
  });

  it("shows correct header on edit form for an item that can be edited", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "5" });
    const formHeader = wrapper.find("h3");
    expect(formHeader.length).to.equal(1);
    expect(formHeader.text()).to.equal("Edit test label");
  });

  it("shows correct header on edit form for an item that can not be edited", () => {
    canEdit = false;
    wrapper.setProps({ editOrCreate: "edit", identifier: "5" });
    const formHeader = wrapper.find("h3");
    expect(formHeader.length).to.equal(1);
    expect(formHeader.text()).to.equal("test label");
  });

  it("updates header on edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "5" });
    const formHeader = wrapper.find("h3");
    expect(formHeader.text()).to.equal("Edit test label");

    const newThingData = { id: 5, label: "new thing!" };
    const newThingsData = { things: [newThingData] };
    wrapper.setProps({ data: newThingsData });

    expect(formHeader.text()).to.equal("Edit test new thing!");
  });

  it("does not supply a save function to the edit form if canEdit returns false", () => {
    canEdit = false;
    wrapper.setProps({ editOrCreate: "edit", identifier: "5" });
    const editForm = wrapper.find(ThingEditForm);
    expect(editForm.props().save).to.equal(undefined);
  });

  it("disables the edit form if canEdit returns false", () => {
    canEdit = false;
    wrapper.setProps({ editOrCreate: "edit", identifier: "5" });
    const editForm = wrapper.find(ThingEditForm);
    expect(editForm.props().disabled).to.equal(true);
  });

  it("fetches data on mount and passes save function to form", () => {
    expect(fetchData.callCount).to.equal(1);

    wrapper.setProps({ editOrCreate: "create" });
    const form = wrapper.find(ThingEditForm);

    expect(editItem.callCount).to.equal(0);
    form.props().save();
    expect(editItem.callCount).to.equal(1);
  });

  it("fetches data again on save", async () => {
    wrapper.setProps({ editOrCreate: "create" });
    const form = wrapper.find(ThingEditForm);
    form.props().save();
    await pause();
    expect(fetchData.callCount).to.equal(2);
  });

  it("should not render the AdditionalContent component", () => {
    const additionalContent = wrapper.find(AdditionalContent);
    expect(additionalContent.length).to.equal(0);
  });

  it("should render the AdditionalContent component", () => {
    wrapper = shallow(
      <ThingAdditionalContentEditableConfigList
        data={thingsData}
        fetchData={fetchData}
        editItem={editItem}
        deleteItem={deleteItem}
        csrfToken="token"
        isFetching={false}
      />
    );

    const additionalContent = wrapper.find(AdditionalContent);
    expect(additionalContent.length).to.equal(1);
    expect(additionalContent.props().item).to.deep.equal(thingData);
    expect(additionalContent.props().csrfToken).to.equal("token");
  });

  it("should not render a troubleshooting link if there are no self-tests", () => {
    const link = wrapper.find("h5");
    expect(link.length).to.equal(0);
  });

  it("should not render an info alert if there are no self-tests", () => {
    const alert = wrapper.find(Alert);
    expect(alert.length).to.equal(0);
  });

  it("should render a troubleshooting link if there are self-tests", () => {
    wrapper = shallow(
      <ThingWithSelfTests
        data={thingsData}
        fetchData={fetchData}
        editItem={editItem}
        deleteItem={deleteItem}
        csrfToken="token"
        isFetching={false}
      />
    );
    const link = wrapper.find("p");
    expect(link.length).to.equal(1);
    expect(link.text()).to.equal(
      "Problems with your things? Please visit the troubleshooting page."
    );
    expect(link.find("a").prop("href")).to.equal(
      "/admin/web/troubleshooting/self-tests/thingServices"
    );
  });

  it("should render an info alert if there are self-tests", () => {
    wrapper = mount(
      <ThingWithSelfTests
        data={thingsData}
        fetchData={fetchData}
        editItem={editItem}
        deleteItem={deleteItem}
        csrfToken="token"
        isFetching={false}
      />
    );
    const alert = wrapper.find(".alert");
    expect(alert.length).to.equal(1);
    expect(alert.text()).to.equal(
      "Self-tests for the things have been moved to the troubleshooting page."
    );
    expect(alert.find("a").prop("href")).to.equal(
      "/admin/web/troubleshooting/self-tests/thingServices"
    );
  });

  it("figures out what level of permissions the admin has", () => {
    const libraryManager = new Admin([{ role: "manager", library: "nypl" }]);
    const librarian = new Admin([{ role: "librarian", library: "nypl" }]);
    expect(wrapper.instance().getAdminLevel()).to.equal(3);
    wrapper.setContext({ admin: libraryManager });
    expect(wrapper.instance().getAdminLevel()).to.equal(2);
    wrapper.setContext({ admin: librarian });
    expect(wrapper.instance().getAdminLevel()).to.equal(1);
  });
});
