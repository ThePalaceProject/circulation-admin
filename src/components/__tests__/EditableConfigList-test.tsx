import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { EditableConfigList, EditFormProps, AdditionalContentProps } from "../EditableConfigList";
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

  class ThingEditForm extends React.Component<EditFormProps<Things, Thing>, void> {
    render(): JSX.Element {
      return <div>Test</div>;
    }
  }

  class ThingEditFormWithInputs extends React.Component<EditFormProps<Things, Thing>, void> {
    render(): JSX.Element {
      return (<div>
                <EditableInput
                  elementType="input"
                  type="text"
                  ref="textInput"
                  value="VALUE"
                />
              </div>);
    }
  }

  class AdditionalContent extends React.Component<AdditionalContentProps<Things, Thing>, void> {
    render(): JSX.Element {
      return <div>Test Additional Content</div>;
    }
  }

  let canCreate: boolean;
  let canDelete: boolean;

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

    canDelete(item) {
      return canDelete;
    }
  }

  class OneThingEditableConfigList extends ThingEditableConfigList {
    limitOne = true;
  }

  class ThingAdditionalContentEditableConfigList extends ThingEditableConfigList {
    AdditionalContent = AdditionalContent;
  }

  class ThingListWithInputs extends ThingEditableConfigList {
    EditForm = ThingEditFormWithInputs;
  }

  let wrapper;
  let fetchData;
  let editItem;
  let deleteItem;
  let thingData = { id: 5, label: "label" };
  let thingsData = { things: [thingData] };

  const pause = () => {
    return new Promise<void>(resolve => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    fetchData = stub();
    editItem = stub().returns(new Promise<void>(resolve => resolve()));
    deleteItem = stub().returns(new Promise<void>(resolve => resolve()));
    canCreate = true;
    canDelete = true;

    wrapper = mount(
      <ThingEditableConfigList
        data={thingsData}
        fetchData={fetchData}
        editItem={editItem}
        deleteItem={deleteItem}
        csrfToken="token"
        isFetching={false}
        />
    );
  });

  it("shows an error message if there's a problem loading the list", () => {
    let error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);

    let fetchError = { status: 404, response: "test load error", url: "test url" };
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

    let formError = { status: 400, response: "test submission error", url: "test url" };
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
    wrapper.setProps({ responseBody: "itemType", editOrCreate: "create"});
    let success = wrapper.find(Alert);
    let link = success.find("a");
    expect(link.length).to.equal(1);
    expect(link.props().href).to.equal("/admin/things/edit/itemType");
  });

  it("shows success message on edit", () => {
    let success = wrapper.find(Alert);
    expect(success.length).to.equal(0);
    wrapper.setProps({ responseBody: "itemType", editOrCreate: "edit"});
    success = wrapper.find(Alert);
    expect(success.length).to.equal(1);
    expect(success.text()).to.equal("Successfully edited this thing");
  });

  it("does not display edit link in success message on edit", () => {
    wrapper.setProps({ responseBody: "itemType", editOrCreate: "edit"});
    let success = wrapper.find(Alert);
    let link = success.find("a");
    expect(link.length).to.equal(0);
  });

  it("correctly formats item type name for success message", () => {
    expect(wrapper.instance().formatItemType()).to.equal("thing");
    let getItemType = stub(wrapper.instance(), "getItemType").returns("ALLCAPS service");
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
    let header = wrapper.find("h2");
    expect(header.text()).to.equal("Thing configuration");
  });

  it("shows thing list", () => {
    let things = wrapper.find("li");
    expect(things.length).to.equal(1);
    expect(things.at(0).text()).to.contain("test label");
    let editLink = things.at(0).find("a");
    expect(editLink.props().href).to.equal("/admin/things/edit/5");
  });

  it("updates thing list", () => {
    let newThing = { id: 6, label: "another thing" };
    let newThingsData = { things: [thingData, newThing] };
    wrapper.setProps({ data: newThingsData });

    let things = wrapper.find("li");
    expect(things.length).to.equal(2);
    expect(things.at(1).text()).to.contain("test another thing");
    let editLink = things.at(1).find("a");
    expect(editLink.props().href).to.equal("/admin/things/edit/6");
  });

  it("shows create link", () => {
    let createLink = wrapper.find(".create-item");
    expect(createLink.length).to.equal(1);
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
    let createLink = wrapper.find(".create-item");
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
    let createLink = wrapper.find(".create-item");
    expect(createLink.length).to.equal(0);

    wrapper = shallow(
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
    expect(createLink.prop("href")).to.equal("/admin/things/create");
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

    let things = wrapper.find("li");
    expect(things.length).to.equal(1);
    let deleteButton = things.at(0).find(".delete-item");
    expect(deleteButton.length).to.equal(0);
  });

  it("deletes an item", () => {
    let confirmStub = stub(window, "confirm").returns(false);

    let things = wrapper.find("li");
    expect(things.length).to.equal(1);
    let deleteButton = things.at(0).find(".delete-item");
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
    let formHeader = wrapper.find("h3");
    expect(formHeader.length).to.equal(1);
    expect(formHeader.text()).to.equal("Create a new thing");
  });

  it("shows edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "5" });
    let form = wrapper.find(ThingEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().data).to.deep.equal(thingsData);
    expect(form.props().item).to.equal(thingData);
    expect(form.props().disabled).to.equal(false);
    expect(form.props().listDataKey).to.equal("things");
  });

  it("shows correct header on edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "5" });
    let formHeader = wrapper.find("h3");
    expect(formHeader.length).to.equal(1);
    expect(formHeader.text()).to.equal("Edit test label");
  });

  it("updates header on edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "5" });
    let formHeader = wrapper.find("h3");
    expect(formHeader.text()).to.equal("Edit test label");

    let newThingData = { id: 5, label: "new thing!" };
    let newThingsData = { things: [newThingData] };
    wrapper.setProps({ data: newThingsData });

    expect(formHeader.text()).to.equal("Edit test new thing!");
  });

  it("fetches data on mount and passes save function to form", () => {
    expect(fetchData.callCount).to.equal(1);

    wrapper.setProps({ editOrCreate: "create" });
    let form = wrapper.find(ThingEditForm);

    expect(editItem.callCount).to.equal(0);
    form.props().save();
    expect(editItem.callCount).to.equal(1);
  });

  it("fetches data again on save", async() => {
    wrapper.setProps({ editOrCreate: "create" });
    let form = wrapper.find(ThingEditForm);
    form.props().save();
    await pause();
    expect(fetchData.callCount).to.equal(2);
  });

  it("should not render the AdditionalContent component", () => {
    let additionalContent = wrapper.find(AdditionalContent);
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

    let additionalContent = wrapper.find(AdditionalContent);
    expect(additionalContent.length).to.equal(1);
    expect(additionalContent.props().item).to.deep.equal(thingData);
    expect(additionalContent.props().csrfToken).to.equal("token");
  });
});
