import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { LoggingServices } from "../LoggingServices";

describe("LoggingServices", () => {
  let wrapper;
  let fetchData;
  let editItem;
  let data = {
    "logging_services": [
      {
        id: 1,
        "label": "loggly",
        "name": "loggly",
        "protocol": "loggly",
        "sitewide": true
      }
    ],
    "protocols": [
      {
        "label": "loggly",
        "name": "loggly",
        "settings": [
          {
            "key": "user",
            "label": "Username"
          },
          {
            "key": "password",
            "label": "Password"
          },
          {
            "key": "url",
            "label": "URL"
          }
        ],
        "sitewide": true
      },
      {
        "label": "sysLog",
        "name": "sysLog",
        "settings": [
          {
            "key": "log_format",
            "label": "Log Format",
            "options": [
              {
                "key": "json",
                "label": "json"
              },
              {
                "key": "text",
                "label": "text"
              }
            ],
            "type": "select"
          },
          {
            "key": "message_template",
            "label": "template"
          }
        ],
        "sitewide": true
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
      <LoggingServices
        data={data}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
        />
    );
  });

  it("shows logging service list", () => {
    let loggingService = wrapper.find("li");
    expect(loggingService.length).to.equal(1);
    expect(loggingService.at(0).text()).to.contain("Edit<PencilIcon />logglyDelete<TrashIcon />");
    let editLink = loggingService.at(0).find("a");
    expect(editLink.props().href).to.equal("/admin/web/config/logging/edit/1");
  });
});
