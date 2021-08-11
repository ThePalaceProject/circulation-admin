import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import Admin from "../../models/Admin";
import { LoggingServices } from "../LoggingServices";

describe("LoggingServices", () => {
  let wrapper;
  let fetchData;
  let editItem;
  const data = {
    logging_services: [
      {
        id: 1,
        label: "loggly",
        name: "loggly",
        protocol: "loggly",
        sitewide: true,
      },
    ],
    protocols: [
      {
        label: "loggly",
        name: "loggly",
        settings: [
          {
            key: "user",
            label: "Username",
          },
          {
            key: "password",
            label: "Password",
          },
          {
            key: "url",
            label: "URL",
          },
        ],
        sitewide: true,
      },
      {
        label: "sysLog",
        name: "sysLog",
        settings: [
          {
            key: "log_format",
            label: "Log Format",
            options: [
              {
                key: "json",
                label: "json",
              },
              {
                key: "text",
                label: "text",
              },
            ],
            type: "select",
          },
          {
            key: "message_template",
            label: "template",
          },
        ],
        sitewide: true,
      },
    ],
  };

  const pause = () => {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    const systemAdmin = new Admin([{ role: "system", library: "nypl" }]);

    fetchData = stub();
    editItem = stub().returns(
      new Promise<void>((resolve) => resolve())
    );

    wrapper = mount(
      <LoggingServices
        data={data}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
      />,
      { context: { admin: systemAdmin } }
    );
  });

  it("shows logging service list", () => {
    const loggingService = wrapper.find("li");
    expect(loggingService.length).to.equal(1);
    expect(loggingService.at(0).text()).to.contain(
      "Edit Pencil IconlogglyDeleteTrash Icon"
    );
    const editLink = loggingService.at(0).find("a").at(0);
    expect(editLink.props().href).to.equal("/admin/web/config/logging/edit/1");
  });
});
