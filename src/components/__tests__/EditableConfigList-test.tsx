import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { EditableConfigList, EditFormProps } from "../EditableConfigList";
import ErrorMessage from "../ErrorMessage";
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
  }

  class OneThingEditableConfigList extends ThingEditableConfigList {
    limitOne = true;
  }

  let wrapper;
  let fetchData;
  let editItem;
  let thingData = { id: 5, label: "label" };
  let thingsData = { things: [thingData] };

  const pause = () => {
    return new Promise<void>(resolve => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    fetchData = stub();
    editItem = stub().returns(new Promise<void>(resolve => resolve()));

    wrapper = shallow(
      <ThingEditableConfigList
        data={thingsData}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
        />
    );
  });

  it("shows error message", () => {
    let error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);
    let fetchError = { status: 400, response: "test error", url: "test url" };
    wrapper.setProps({ fetchError });
    error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(1);
  });

  it("shows loading indicator", () => {
    let loading = wrapper.find(LoadingIndicator);
    expect(loading.length).to.equal(0);
    wrapper.setProps({ isFetching: true });
    loading = wrapper.find(LoadingIndicator);
    expect(loading.length).to.equal(1);
  });

  it("shows thing list", () => {
    let things = wrapper.find("li");
    expect(things.length).to.equal(2);
    expect(things.at(0).text()).to.contain("test label");
    let editLink = things.at(0).find("a");
    expect(editLink.props().href).to.equal("/admin/things/edit/5");
  });

  it("shows create link", () => {
    let things = wrapper.find("li");
    expect(things.length).to.equal(2);
    let createLink = things.at(1).find("a");
    expect(createLink.length).to.equal(1);
    expect(createLink.props().href).to.equal("/admin/things/create");
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
    let things = wrapper.find("li");
    expect(things.length).to.equal(1);

    wrapper = shallow(
      <OneThingEditableConfigList
        data={{ things: [] }}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
        />
    );
    things = wrapper.find("li");
    expect(things.length).to.equal(1);
    let createLink = things.find("a");
    expect(createLink.length).to.equal(1);
    expect(createLink.prop("href")).to.equal("/admin/things/create");
  });

  it("shows create form", () => {
    let form = wrapper.find(ThingEditForm);
    expect(form.length).to.equal(0);
    wrapper.setProps({ editOrCreate: "create" });
    form = wrapper.find(ThingEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().data).to.deep.equal(thingsData);
    expect(form.props().item).to.be.undefined;
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
    expect(form.props().listDataKey).to.equal("things");
  });

  it("shows edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "5" });
    let form = wrapper.find(ThingEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().data).to.deep.equal(thingsData);
    expect(form.props().item).to.equal(thingData);
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
    expect(form.props().listDataKey).to.equal("things");
  });

  it("fetches data on mount and passes edit function to form", async () => {
    expect(fetchData.callCount).to.equal(1);

    wrapper.setProps({ editOrCreate: "create" });
    let form = wrapper.find(ThingEditForm);

    expect(editItem.callCount).to.equal(0);
    form.props().editItem();
    expect(editItem.callCount).to.equal(1);

    await pause();
    expect(fetchData.callCount).to.equal(2);
  });
});