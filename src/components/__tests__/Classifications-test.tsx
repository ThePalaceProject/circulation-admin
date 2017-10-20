import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { Classifications } from "../Classifications";
import ErrorMessage from "../ErrorMessage";
import ClassificationsForm from "../ClassificationsForm";
import ClassificationsTable from "../ClassificationsTable";
import buildStore from "../../store";
import genreData from "./genreData";
import classificationsData from "./classificationsData";

describe("Classifications", () => {
  let wrapper;
  let instance;
  let bookData;
  let store;
  let refreshCatalog, fetchGenreTree, fetchClassifications, fetchBook, editClassifications;

  beforeEach(() => {
    bookData = {
      title: "title",
      fiction: true,
      categories: ["Space Opera"]
    };
    store = buildStore();
    refreshCatalog = stub();
    fetchGenreTree = stub();
    fetchClassifications = stub();
    fetchBook = stub();
    editClassifications = stub();
    wrapper = shallow(
      <Classifications
        store={store}
        csrfToken="token"
        bookUrl="book url"
        book={bookData}
        bookAdminUrl="book admin url"
        genreTree={genreData}
        classifications={classificationsData}
        refreshCatalog={refreshCatalog}
        fetchGenreTree={fetchGenreTree}
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
      expect(title.text()).to.equal(bookData.title);
    });

    it("hides/shows updating indicator", () => {
      let updating = wrapper.find("h4");
      expect(updating.length).to.equal(0);

      wrapper.setProps({ isFetching: true });
      updating = wrapper.find("h4");
      expect(updating.text()).to.equal("Updating");
    });

    it("shows fetchError", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(0);

      let errorData = { status: 500, url: "url", response: "error" };
      wrapper.setProps({ fetchError: errorData });
      error = wrapper.find(ErrorMessage);
      expect(error.props().error).to.equal(errorData);
    });

    it("shows classifications form", () => {
      let form = wrapper.find(ClassificationsForm);
      expect(form.props().book).to.equal(bookData);
      expect(form.props().genreTree).to.equal(genreData);
      expect(form.props().editClassifications).to.equal(instance.editClassifications);
    });

    it("shows classifications table", () => {
      let table = wrapper.find(ClassificationsTable);
      expect(table.props().classifications).to.equal(classificationsData);
    });
  });

  describe("behavior", () => {
    it("fetches genre tree and classifications on mount", () => {
      expect(fetchGenreTree.callCount).to.equal(1);
      expect(fetchGenreTree.args[0][0]).to.equal("/admin/genres");
      expect(fetchClassifications.callCount).to.equal(1);
      expect(fetchClassifications.args[0][0]).to.equal(instance.classificationsUrl());
    });

    it("refreshes book, classifications, and Catalog after editing classifications", (done) => {
      let formData = new (window as any).FormData();
      editClassifications.returns(new Promise((resolve, reject) => resolve()));
      instance.editClassifications(formData).then(response => {
        expect(editClassifications.callCount).to.equal(1);
        expect(editClassifications.args[0][0]).to.equal(instance.editClassificationsUrl());
        expect(editClassifications.args[0][1]).to.equal(formData);
        expect(fetchBook.callCount).to.equal(1);
        expect(fetchBook.args[0][0]).to.equal("book admin url");
        expect(fetchClassifications.callCount).to.equal(2); // already called on mount
        expect(fetchClassifications.args[1][0]).to.equal(instance.classificationsUrl());
        expect(refreshCatalog.callCount).to.equal(1);
        done();
      });
    });
  });
});