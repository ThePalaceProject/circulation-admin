jest.autoMockOff();

import * as React from "react";
import { shallow } from "enzyme";

import { Classifications } from "../Classifications";
import ErrorMessage from "../ErrorMessage";
import ClassificationsForm from "../ClassificationsForm"
import buildStore from "../../store";
import genreData from "./genreData";

describe("Classifications", () => {
  let wrapper;
  let instance;
  let bookData;
  let store;
  let refreshBrowser, fetchGenres, fetchClassifications, fetchBook, editClassifications;

  beforeEach(() => {
    bookData = {
      title: "title",
      fiction: true,
      categories: ["Space Opera"]
    };
    store = buildStore();
    refreshBrowser = jest.genMockFunction();
    fetchGenres = jest.genMockFunction();
    fetchClassifications = jest.genMockFunction();
    fetchBook = jest.genMockFunction();
    editClassifications = jest.genMockFunction();
    wrapper = shallow(
      <Classifications
        store={store}
        csrfToken="token"
        bookUrl="book url"
        book={bookData}
        genres={genreData}
        refreshBrowser={refreshBrowser}
        fetchGenres={fetchGenres}
        fetchClassifications={fetchClassifications}
        fetchBook={fetchBook}
        editClassifications={editClassifications}
        />
    );
    instance = wrapper.instance() as any;
  });

  describe("rendering", () => {
    it("shows book title", () => {
      let title = wrapper.find("h2");
      expect(title.text()).toBe(bookData.title);
    });

    it("hides/shows updating indicator", () => {
      let updating = wrapper.find("h4");
      expect(updating.length).toBe(0);

      wrapper.setProps({ isFetching: true })
      updating = wrapper.find("h4");
      expect(updating.text()).toBe("Updating");
    });

    it("shows fetchError", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).toBe(0);

      let errorData = { status: 500, url: "url", response: "error" };
      wrapper.setProps({ fetchError: errorData });
      error = wrapper.find(ErrorMessage);
      expect(error.props().error).toBe(errorData);
    });

    it("shows classification form", () => {
      let form = wrapper.find(ClassificationsForm);
      expect(form.props().book).toBe(bookData);
      expect(form.props().genres).toBe(genreData);
      expect(form.props().csrfToken).toBe("token");
      expect(form.props().editClassifications).toBe(instance.editClassifications);
    });
  });

  describe("behavior", () => {
    it("fetches genres on mount", () => {
      expect(fetchGenres.mock.calls.length).toBe(1);
      expect(fetchGenres.mock.calls[0][0]).toBe("/admin/genres");
      expect(fetchClassifications.mock.calls.length).toBe(1);
      expect(fetchClassifications.mock.calls[0][0]).toBe(instance.classificationsUrl());
    });
  });
});