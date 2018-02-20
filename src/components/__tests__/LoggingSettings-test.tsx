import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { LoggingSettings } from "../LoggingSettings";

describe("LoggingSettings", () => {
  let wrapper;
  let fetchData;
  let editItem;
  let data = {
    settings: [
      { key: "test key", value: "test value" }
    ],
    all_settings: [
      {
        key: "test key",
        label: "test label",
        options: [{ key: "test inner key", label: "test inner label", value: "some value" }],
      }
    ]
  };

  const pause = () => {
    return new Promise<void>(resolve => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    fetchData = stub();
    editItem = stub().returns(new Promise<void>(resolve => resolve()));

    wrapper = shallow(
      <LoggingSettings
        data={data}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
        />
    );
  });

  it("shows sitewide setting list", () => {
    let loggingSetting = wrapper.find("li");
    expect(loggingSetting.length).to.equal(1);
    expect(loggingSetting.at(0).text()).to.contain("test label");
    let editLink = loggingSetting.at(0).find("a");
    expect(editLink.props().href).to.equal("/admin/web/config/loggingSettings/edit/test key");
  });
});
