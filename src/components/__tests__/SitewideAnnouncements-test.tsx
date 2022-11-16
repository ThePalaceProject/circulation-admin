import * as React from "react";
import { expect } from "chai";
import { stub } from "sinon";
import { mount } from "enzyme";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import AnnouncementsSection from "../AnnouncementsSection";
import { SitewideAnnouncements } from "../SitewideAnnouncements";

describe("SitewideAnnouncements", () => {
  const fetchData = stub();

  const data = {
    announcements: [
      {
        id: "dcf036d9-106b-426c-838f-ce7c57d53801",
        content: "There is nothing to see here.",
        start: "2022-08-31",
        finish: "2022-10-31",
      },
    ],
    settings: [
      {
        category: "Announcements",
        description:
          "Announcements will be displayed to authenticated patrons.",
        key: "global_announcements",
        label: "Scheduled announcements",
        level: 3,
        type: "announcements",
      },
    ],
  };

  it("renders a Form containing an AnnouncementsSection", () => {
    const wrapper = mount(
      <SitewideAnnouncements
        data={data}
        csrfToken="token"
        fetchData={fetchData}
        isFetching={false}
      />,
      {
        context: {
          admin: {
            isSystemAdmin: () => true,
            isLibraryManagerOfSomeLibrary: () => true,
          },
        },
      }
    );

    const form = wrapper.find("form");

    expect(form.length).to.equal(1);

    const announcementsSection = form.find(AnnouncementsSection);

    expect(announcementsSection.length).to.equal(1);
    expect(announcementsSection.prop("value")).to.deep.equal(
      data.announcements
    );
    expect(announcementsSection.prop("setting")).to.deep.equal(
      data.settings[0]
    );
  });

  it("renders a loading indicator instead of a form when the data is loading", () => {
    const wrapper = mount(
      <SitewideAnnouncements
        data={data}
        csrfToken="token"
        fetchData={fetchData}
        isFetching={true}
      />,
      {
        context: {
          admin: {
            isSystemAdmin: () => true,
            isLibraryManagerOfSomeLibrary: () => true,
          },
        },
      }
    );

    const form = wrapper.find("form");

    expect(form.length).to.equal(0);

    const loadingIndicator = wrapper.find(LoadingIndicator);

    expect(loadingIndicator.length).to.equal(1);
  });

  it("calls editItem when the form is submitted", () => {
    const editItem = stub().returns(
      new Promise<void>((resolve) => resolve())
    );

    const wrapper = mount(
      <SitewideAnnouncements
        data={data}
        csrfToken="token"
        editItem={editItem}
        fetchData={fetchData}
        isFetching={false}
      />,
      {
        context: {
          admin: {
            isSystemAdmin: () => true,
            isLibraryManagerOfSomeLibrary: () => true,
          },
        },
      }
    );

    const form = wrapper.find("form");
    const submitButton = form.find('button[type="submit"]');

    submitButton.last().simulate("click");

    expect(editItem.callCount).to.equal(1);
    expect(editItem.args[0]).to.have.length(1);

    const formData = editItem.args[0][0];

    expect(formData).to.be.an.instanceof(window.FormData);
    expect(formData.get("announcements")).to.equal(
      '[{"id":"dcf036d9-106b-426c-838f-ce7c57d53801","content":"There is nothing to see here.","start":"2022-08-31","finish":"2022-10-31"}]'
    );
  });

  it("disables the submit button when the user does not have the permission level specified in the settings", () => {
    const wrapper = mount(
      <SitewideAnnouncements
        data={data}
        csrfToken="token"
        fetchData={fetchData}
        isFetching={false}
      />,
      {
        context: {
          admin: {
            isSystemAdmin: () => false,
            isLibraryManagerOfSomeLibrary: () => false,
          },
        },
      }
    );

    const form = wrapper.find("form");
    const submitButton = form.find('button[type="submit"]');

    expect(submitButton.last().prop("disabled")).to.equal(true);
  });
});
