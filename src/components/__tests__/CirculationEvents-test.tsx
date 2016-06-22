jest.autoMockOff();

import * as React from "react";
import { shallow } from "enzyme";

import { CirculationEvents } from "../CirculationEvents";
import CirculationEventsDownloadForm from "../CirculationEventsDownloadForm";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { CirculationEventData } from "../../interfaces";

describe("CirculationEvents", () => {
  let eventsData: CirculationEventData[] = [
    {
      id: 1,
      type: "check_in",
      patron_id: "patron id",
      time: "Wed, 01 Jun 2016 16:49:17 GMT",
      book: {
        title: "book 1 title",
        url: "book 1 url"
      }
    },
    {
      id: 2,
      type: "check_out",
      patron_id: null,
      time: "Wed, 01 Jun 2016 12:00:00 GMT",
      book: {
        title: "book 2 title",
        url: "book 2 url"
      }
    },
  ];

  describe("rendering", () => {
    let wrapper;
    let fetchError = { status: 401, response: "test", url: "test url" };
    let fetchCirculationEvents;
    let context = { showCircEventsDownload: true };

    beforeEach(() => {
      fetchCirculationEvents = jest.genMockFunction();
      fetchCirculationEvents.mockReturnValue(
        new Promise((resolve, reject) => resolve())
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

    it("shows header", () => {
      let header = wrapper.find("h3");
      expect(header.text()).toBe("Circulation Events");
    });

    it("shows CirculationEventsDownloadForm", () => {
      let form = wrapper.find(CirculationEventsDownloadForm);
      expect(form.length).toBe(1);
      expect(form.prop("show")).toBe(false);
      expect(form.prop("hide")).toBe(wrapper.instance().hideDownloadForm);
    });

    it("shows error message", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).toBe(0);
      wrapper.setProps({ fetchError });
      error = wrapper.find(ErrorMessage);
      expect(error.length).toBe(1);
    });

    it("shows table data", () => {
      let instance = wrapper.instance();
      let table = wrapper.find("table").find("tbody");
      let rows = table.find("tr");

      rows.forEach((row, i) => {
        let data = eventsData[i];
        let link = row.find(CatalogLink);
        expect(link.prop("bookUrl")).toBe(data.book.url);
        expect(link.children().text()).toBe(data.book.title);
        let type = row.find("td").at(1);
        expect(type.text()).toBe(instance.formatType(data.type));
        let time = row.find("td").at(2);
        expect(time.text()).toBe(instance.formatTime(data.time));
      });
    });

    it("shows/hides loading indicator", () => {
      let loading = wrapper.find(LoadingIndicator);
      expect(loading.length).toBe(1);
      wrapper.setProps({ isLoaded: true });
      loading = wrapper.find(LoadingIndicator);
      expect(loading.length).toBe(0);
    });
  });

  describe("behavior", () => {
    let wrapper;
    let fetchCirculationEvents;
    let context = { showCircEventsDownload: true };

    beforeEach(() => {
      fetchCirculationEvents = jest.genMockFunction();
      fetchCirculationEvents.mockReturnValue(
        new Promise((resolve, reject) => resolve())
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

    it("fetches events data on mount", () => {
      expect(fetchCirculationEvents.mock.calls.length).toBe(1);
    });

    it("sets interval for fetches", () => {
      expect((setInterval as any).mock.calls.length).toBe(1);
      expect((setInterval as any).mock.calls[0][0]).toBe(fetchCirculationEvents);
      expect((setInterval as any).mock.calls[0][1]).toBe(1000);
    });

    it("shows download form when download button is clicked", () => {
      let button = wrapper.find("button")
        .filterWhere(button => button.text() === "Download CSV");
      expect(button.length).toBe(1);
      expect(wrapper.state("showDownloadForm")).toBe(false);
      button.simulate("click");
      expect(wrapper.state("showDownloadForm")).toBe(true);
      let form = wrapper.find(CirculationEventsDownloadForm);
      expect(form.prop("show")).toBe(true);
    });

    it("hides download form", () => {
      wrapper.setState({ showDownloadForm: true });
      let form = wrapper.find(CirculationEventsDownloadForm);
      form.prop("hide")();
      expect(wrapper.state("showDownloadForm")).toBe(false);
    });
  });
});
