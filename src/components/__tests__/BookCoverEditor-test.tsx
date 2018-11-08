import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { BookCoverEditor } from "../BookCoverEditor";
import EditableInput from "../EditableInput";
import ErrorMessage from "../ErrorMessage";
import { BookData, RightsStatusData } from "../../interfaces";

describe("BookCoverEditor", () => {
  let rightsStatuses: RightsStatusData = {
    "http://creativecommons.org/licenses/by/4.0/": {
      "allows_derivatives": true,
      "name": "Creative Commons Attribution (CC BY)",
      "open_access": true
    },
    "http://librarysimplified.org/terms/rights-status/in-copyright": {
      "allows_derivatives": false,
      "name": "In Copyright",
      "open_access": false
    },
    "https://creativecommons.org/licenses/by-nd/4.0": {
      "allows_derivatives": false,
      "name": "Creative Commons Attribution-NoDerivs (CC BY-ND)",
      "open_access": true
    }
  };

  let bookData: BookData = {
    id: "id",
    title: "title",
    coverUrl: "/cover",
    changeCoverLink: {
      href: "/change_cover",
      rel: "http://librarysimplified.org/terms/rel/change_cover"
    }
  };

  let wrapper;
  let editableInputByName = (name) => {
    let inputs = wrapper.find(EditableInput);
    return inputs.filterWhere(input => input.props().name === name);
  };

  describe("rendering", () => {
    beforeEach(() => {
      wrapper = mount(
        <BookCoverEditor
          bookAdminUrl="/admin/book"
          rightsStatuses={rightsStatuses}
          bookUrl="/book"
          book={bookData}
          refreshCatalog={stub()}
          csrfToken="token"
        />
      );
    });

    it("shows book title", () => {
      let title = wrapper.find("h2");
      expect(title.text()).to.equal(bookData.title);
    });

    it("shows updating message", () => {
      let updating = wrapper.find(".cover-fetching-container");
      expect(updating.length).to.equal(0);

      wrapper.setProps({ isFetching: true });
      updating = wrapper.find(".cover-fetching-container");
      expect(updating.length).to.equal(1);
      expect(updating.text()).to.contain("Updating");
    });

    it("shows current cover", () => {
      let cover = wrapper.find(".current-cover");
      expect(cover.length).to.equal(1);
      expect(cover.props().src).to.equal(bookData.coverUrl);
      expect(cover.props().alt).to.equal("Current book cover");
    });

    it("shows cover URL and cover file inputs", () => {
      let coverUrl = editableInputByName("cover_url");
      expect(coverUrl.props().label).to.equal("URL for cover image");

      let coverFile = editableInputByName("cover_file");
      expect(coverFile.props().label).to.equal("Or upload cover image");
      expect(coverFile.props().type).to.equal("file");
      expect(coverFile.props().accept).to.equal("image/*");
    });

    it("shows title position input", () => {
      let input = editableInputByName("title_position");
      expect(input.props().elementType).to.equal("select");
      expect(input.props().label).to.equal("Title and Author Position");
      let options = input.find("option");
      expect(options.length).to.equal(4);
      expect(options.at(0).props().value).to.equal("none");
      expect(options.at(1).props().value).to.equal("top");
      expect(options.at(2).props().value).to.equal("center");
      expect(options.at(3).props().value).to.equal("bottom");
    });

    it("shows preview updating message", () => {
      let updating = wrapper.find(".cover-fetching-preview-container");
      expect(updating.length).to.equal(0);

      wrapper.setProps({ isFetchingPreview: true });
      updating = wrapper.find(".cover-fetching-preview-container");
      expect(updating.length).to.equal(1);
      expect(updating.text()).to.contain("Updating Preview");
    });

    it("shows preview", () => {
      let preview = wrapper.find(".preview-cover");
      expect(preview.length).to.equal(0);

      wrapper.setProps({ preview: "image data" });
      preview = wrapper.find(".preview-cover");
      expect(preview.length).to.equal(1);
      expect(preview.props().src).to.equal("image data");
      expect(preview.props().alt).to.equal("Preview of new cover");
    });

    it("shows rights inputs", () => {
      let rightsStatusInput = editableInputByName("rights_status");
      expect(rightsStatusInput.length).to.equal(1);
      expect(rightsStatusInput.props().elementType).to.equal("select");
      expect(rightsStatusInput.props().label).to.equal("License");

      let children = rightsStatusInput.find("option");
      expect(children.length).to.equal(3);
      expect(children.at(0).props().value).to.equal("http://creativecommons.org/licenses/by/4.0/");
      expect(children.at(0).text()).to.equal("Creative Commons Attribution (CC BY)");
      expect(children.at(1).props().value).to.equal("http://librarysimplified.org/terms/rights-status/in-copyright");
      expect(children.at(1).text()).to.equal("In Copyright");
      expect(children.at(2).props().value).to.equal("http://librarysimplified.org/terms/rights-status/unknown");
      expect(children.at(2).text()).to.equal("Other");

      let explanationInput = editableInputByName("rights_explanation");
      expect(explanationInput.length).to.equal(1);
      expect(explanationInput.props().label).to.equal("Explanation of rights");
    });

    it("shows fetch error", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(0);

      let errorData = { status: 500, url: "url", response: "error" };
      wrapper.setProps({ fetchError: errorData });
      error = wrapper.find(ErrorMessage);
      expect(error.props().error).to.equal(errorData);
    });

    it("shows preview fetch error", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(0);

      let errorData = { status: 500, url: "url", response: "error" };
      wrapper.setProps({ previewFetchError: errorData });
      error = wrapper.find(ErrorMessage);
      expect(error.props().error).to.equal(errorData);
    });

    it("shows save button", () => {
      let buttons = wrapper.find("button");
      // Counting the two buttons that are coming from the Collapsible component:
      expect(buttons.length).to.equal(3);
      let save = buttons.at(2);
      expect(save.props().disabled).to.be.ok;

      wrapper.setProps({ preview: "image data" });
      save = wrapper.find("button").at(2);
      expect(save.props().disabled).not.to.be.ok;
    });
  });

  describe("behavior", () => {
    let fetchBook;
    let fetchPreview;
    let clearPreview;
    let editCover;
    let fetchRightsStatuses;
    let refreshCatalog;

    beforeEach(() => {
      fetchBook = stub();
      fetchPreview = stub();
      clearPreview = stub();
      editCover = stub().returns(new Promise<void>(resolve => resolve()));
      fetchRightsStatuses = stub();
      refreshCatalog = stub();
      wrapper = mount(
        <BookCoverEditor
          bookAdminUrl="/admin/book"
          rightsStatuses={rightsStatuses}
          bookUrl="/book"
          book={bookData}
          csrfToken="token"
          fetchBook={fetchBook}
          fetchPreview={fetchPreview}
          clearPreview={clearPreview}
          editCover={editCover}
          fetchRightsStatuses={fetchRightsStatuses}
          refreshCatalog={refreshCatalog}
        />
      );
    });

    it("clears preview on mount", () => {
      expect(clearPreview.callCount).to.equal(1);
    });

    it("fetches rights status on mount", () => {
      expect(fetchRightsStatuses.callCount).to.equal(1);
    });

    it("previews cover when relevant inputs change", () => {
      expect(fetchPreview.callCount).to.equal(0);
      expect(clearPreview.callCount).to.equal(1);

      let coverUrl = editableInputByName("cover_url");
      coverUrl.get(0).setState({ value: "http://example.com" });
      coverUrl.props().onChange();

      expect(fetchPreview.callCount).to.equal(1);
      expect(fetchPreview.args[0][0]).to.equal("/admin/book/preview_book_cover");
      let formData = fetchPreview.args[0][1];
      expect(formData.get("cover_url")).to.equal("http://example.com");
      expect(formData.get("title_position")).to.equal("none");

      let titlePosition = editableInputByName("title_position");
      titlePosition.get(0).setState({ value: "center" });
      titlePosition.props().onChange();

      expect(fetchPreview.callCount).to.equal(2);
      expect(fetchPreview.args[1][0]).to.equal("/admin/book/preview_book_cover");
      formData = fetchPreview.args[1][1];
      expect(formData.get("cover_url")).to.equal("http://example.com");
      expect(formData.get("cover_file")).to.equal("");
      expect(formData.get("title_position")).to.equal("center");

      coverUrl.get(0).setState({ value: "" });
      coverUrl.props().onChange();
      expect(fetchPreview.callCount).to.equal(2);
      expect(clearPreview.callCount).to.equal(2);

      let coverFile = editableInputByName("cover_file");
      coverFile.get(0).setState({ value: "c://file.png" });
      coverFile.props().onChange();

      expect(fetchPreview.callCount).to.equal(3);
      expect(fetchPreview.args[2][0]).to.equal("/admin/book/preview_book_cover");
      formData = fetchPreview.args[2][1];
      expect(formData.get("cover_url")).to.equal("");
      expect(formData.get("title_position")).to.equal("center");
    });

    it("saves", async () => {
      expect(editCover.callCount).to.equal(0);
      expect(fetchBook.callCount).to.equal(0);
      expect(refreshCatalog.callCount).to.equal(0);
      wrapper.setProps({ preview: "image data" });

      let coverUrl = editableInputByName("cover_url");
      coverUrl.get(0).setState({ value: "http://example.com" });

      let titlePosition = editableInputByName("title_position");
      titlePosition.get(0).setState({ value: "center" });

      let rightsStatus = editableInputByName("rights_status");
      rightsStatus.get(0).setState({ value: "http://creativecommons.org/licenses/by/4.0/" });

      let rightsExplanation = editableInputByName("rights_explanation");
      rightsExplanation.get(0).setState({ value: "explanation" });

      let saveButton = wrapper.find("button").at(2);
      saveButton.simulate("click");

      expect(editCover.callCount).to.equal(1);
      expect(editCover.args[0][0]).to.equal("/change_cover");
      let formData = editCover.args[0][1];
      expect(formData.get("cover_url")).to.equal("http://example.com");
      expect(formData.get("title_position")).to.equal("center");
      expect(formData.get("rights_status")).to.equal("http://creativecommons.org/licenses/by/4.0/");
      expect(formData.get("rights_explanation")).to.equal("explanation");

      const pause = (): Promise<void> => {
        return new Promise<void>(resolve => setTimeout(resolve, 0));
      };
      await pause();

      expect(fetchBook.callCount).to.equal(1);
      expect(refreshCatalog.callCount).to.equal(1);
   });
  });
});
