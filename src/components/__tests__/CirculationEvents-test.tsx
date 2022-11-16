import { expect } from "chai";
import { stub, spy, useFakeTimers } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { CirculationEvents } from "../CirculationEvents";
import CirculationEventsDownloadForm from "../CirculationEventsDownloadForm";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import CatalogLink from "@thepalaceproject/web-opds-client/lib/components/CatalogLink";
import { Button } from "library-simplified-reusable-components";
import { CirculationEventData } from "../../interfaces";

describe("CirculationEvents", () => {
  const eventsData: CirculationEventData[] = [
    {
      id: 1,
      type: "check_in",
      patron_id: "patron id",
      time: "Wed, 01 Jun 2016 16:49:17 GMT",
      book: {
        title: "book 1 title",
        url: "book 1 url",
      },
    },
    {
      id: 2,
      type: "check_out",
      patron_id: null,
      time: "Wed, 01 Jun 2016 12:00:00 GMT",
      book: {
        title: "book 2 title",
        url: "book 2 url",
      },
    },
  ];

  describe("rendering", () => {
    let wrapper;
    const fetchError = { status: 401, response: "test", url: "test url" };
    let fetchCirculationEvents;
    const context = { showCircEventsDownload: true };

    beforeEach(() => {
      fetchCirculationEvents = stub().returns(
        new Promise<void>((resolve, reject) => resolve())
      );

      wrapper = shallow(
        <CirculationEvents
          events={eventsData}
          fetchCirculationEvents={fetchCirculationEvents}
          isLoaded={false}
        />,
        { context }
      );
    });

    afterEach(() => {
      wrapper.instance().componentWillUnmount();
    });

    it("shows header", () => {
      const header = wrapper.find("h2");
      expect(header.text()).to.equal("Circulation Events");
    });

    it("shows CirculationEventsDownloadForm", () => {
      const form = wrapper.find(CirculationEventsDownloadForm);
      expect(form.length).to.equal(1);
      expect(form.prop("show")).to.equal(false);
      expect(form.prop("hide")).to.equal(wrapper.instance().hideDownloadForm);
    });

    it("shows error message", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(0);
      wrapper.setProps({ fetchError });
      error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(1);
    });

    it("shows table data since there is no library", () => {
      const instance = wrapper.instance();
      const table = wrapper.find("table").find("tbody");
      const rows = table.find("tr");

      rows.forEach((row, i) => {
        const data = eventsData[i];
        const link = row.find(CatalogLink);
        expect(link.prop("bookUrl")).to.equal(data.book.url);
        expect(link.children().text()).to.equal(data.book.title);
        const type = row.find("td").at(1);
        expect(type.text()).to.equal(instance.formatType(data.type));
        const time = row.find("td").at(2);
        expect(time.text()).to.equal(instance.formatTime(data.time));
      });
    });

    it("shows/hides loading indicator", () => {
      let loading = wrapper.find(LoadingIndicator);
      expect(loading.length).to.equal(1);
      wrapper.setProps({ isLoaded: true });
      loading = wrapper.find(LoadingIndicator);
      expect(loading.length).to.equal(0);
    });

    it("does not show the table data since there is library", () => {
      // The previous instance needs to be unmounted due to the timer.
      wrapper.instance().componentWillUnmount();

      fetchCirculationEvents = stub().returns(
        new Promise<void>((resolve, reject) => resolve())
      );
      // Not making a real request so isLoaded is true.
      wrapper = shallow(
        <CirculationEvents
          events={eventsData}
          fetchCirculationEvents={fetchCirculationEvents}
          isLoaded={false}
          library="NYPL"
        />,
        { context }
      );

      const table = wrapper.find("table");
      expect(table.length).to.equal(0);

      wrapper.instance().componentWillUnmount();
    });
  });

  describe("behavior", () => {
    let wrapper;
    let fetchCirculationEvents;
    const context = { showCircEventsDownload: true };

    beforeEach(() => {
      fetchCirculationEvents = stub().returns(
        new Promise<void>((resolve, reject) => resolve())
      );

      wrapper = shallow(
        <CirculationEvents
          events={eventsData}
          fetchCirculationEvents={fetchCirculationEvents}
          wait={1}
        />,
        { context }
      );
    });

    afterEach(() => {
      wrapper.instance().componentWillUnmount();
    });

    it("fetches and queues on mount", () => {
      const fetchAndQueue = stub(wrapper.instance(), "fetchAndQueue");
      wrapper.instance().UNSAFE_componentWillMount();
      expect(fetchAndQueue.callCount).to.equal(1);
      fetchAndQueue.restore();
    });

    it("does not fetch and queues on mount if there is a library", () => {
      wrapper.instance().componentWillUnmount();

      fetchCirculationEvents = stub().returns(
        new Promise<void>((resolve, reject) => resolve())
      );

      wrapper = shallow(
        <CirculationEvents
          events={eventsData}
          fetchCirculationEvents={fetchCirculationEvents}
          wait={1}
          library="NYPL"
        />,
        { context }
      );

      const fetchAndQueue = stub(wrapper.instance(), "fetchAndQueue");
      expect(fetchAndQueue.callCount).to.equal(0);
      fetchAndQueue.restore();
      wrapper.instance().UNSAFE_componentWillMount();
    });

    describe("fetchAndQueue", () => {
      let fakeTimer;
      let fetchAndQueueSpy;

      beforeEach(() => {
        fetchAndQueueSpy = spy(wrapper.instance(), "fetchAndQueue");
        fakeTimer = useFakeTimers();
      });

      afterEach(() => {
        fakeTimer.restore();
      });

      it("sets timeout for fetches", async () => {
        await wrapper.instance().fetchAndQueue();
        expect(fetchAndQueueSpy.callCount).to.equal(1);
        fakeTimer.tick(1000);
        expect(fetchAndQueueSpy.callCount).to.equal(2);
      });
    });
    it("shows download form when download button is clicked", async () => {
      wrapper = mount(
        <CirculationEvents
          events={[]}
          fetchCirculationEvents={fetchCirculationEvents}
          wait={0}
        />,
        { context }
      );
      const fakeTimer = useFakeTimers();
      await wrapper.instance().fetchAndQueue();
      const button = wrapper.find(Button);
      expect(button.length).to.equal(1);
      expect(button.prop("content")).to.equal("Download CSV");
      expect(wrapper.state("showDownloadForm")).to.equal(false);
      button.simulate("click");
      expect(wrapper.state("showDownloadForm")).to.equal(true);
      const form = wrapper.find(CirculationEventsDownloadForm);
      expect(form.prop("show")).to.equal(true);
      fakeTimer.restore();
    });

    it("hides download form", () => {
      wrapper.setState({ showDownloadForm: true });
      const form = wrapper.find(CirculationEventsDownloadForm);
      form.prop("hide")();
      expect(wrapper.state("showDownloadForm")).to.equal(false);
    });
  });
});
