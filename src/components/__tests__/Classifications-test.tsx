jest.autoMockOff();

import * as React from "react";
import { shallow } from "enzyme";

import { Classifications } from "../Classifications";
import ErrorMessage from "../ErrorMessage";
import ClassificationsForm from "../ClassificationsForm"
import ClassificationsTable from "../ClassificationsTable"
import buildStore from "../../store";
import genreData from "./genreData";
import classificationsData from "./classificationsData";

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
        bookAdminUrl="book admin url"
        genres={genreData}
        classifications={classificationsData}
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

    it("shows classifications form", () => {
      let form = wrapper.find(ClassificationsForm);
      expect(form.props().book).toBe(bookData);
      expect(form.props().genres).toBe(genreData);
      expect(form.props().csrfToken).toBe("token");
      expect(form.props().editClassifications).toBe(instance.editClassifications);
    });

    it("shows classifications table", () => {
      let table = wrapper.find(ClassificationsTable);
      expect(table.props().classifications).toBe(classificationsData);
    });
  });

  describe("behavior", () => {
    it("fetches genres and classifications on mount", () => {
      expect(fetchGenres.mock.calls.length).toBe(1);
      expect(fetchGenres.mock.calls[0][0]).toBe("/admin/genres");
      expect(fetchClassifications.mock.calls.length).toBe(1);
      expect(fetchClassifications.mock.calls[0][0]).toBe(instance.classificationsUrl());
    });

    it("refreshes book, classifications, and browser after editing classifications", (done) => {
      let formData = new FormData();
      editClassifications.mockReturnValue(new Promise((resolve, reject) => resolve()));
      instance.editClassifications(formData).then(response => {
        expect(editClassifications.mock.calls.length).toBe(1);
        expect(editClassifications.mock.calls[0][0]).toBe(instance.editClassificationsUrl());
        expect(editClassifications.mock.calls[0][1]).toBe(formData);
        expect(fetchBook.mock.calls.length).toBe(1);
        expect(fetchBook.mock.calls[0][0]).toBe("book admin url");
        expect(fetchClassifications.mock.calls.length).toBe(2); // already called on mount
        expect(fetchClassifications.mock.calls[1][0]).toBe(instance.classificationsUrl());
        expect(refreshBrowser.mock.calls.length).toBe(1);
        done();
      });
    });
  });
});