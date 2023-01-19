import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import { BookCoverEditor } from "../BookCoverEditor";
import EditableInput from "../EditableInput";
import ErrorMessage from "../ErrorMessage";
import { BookData, RightsStatusData } from "../../interfaces";

describe("BookCoverEditor", () => {
  const rightsStatuses: RightsStatusData = {
    "http://creativecommons.org/licenses/by/4.0/": {
      allows_derivatives: true,
      name: "Creative Commons Attribution (CC BY)",
      open_access: true,
    },
    "http://librarysimplified.org/terms/rights-status/in-copyright": {
      allows_derivatives: false,
      name: "In Copyright",
      open_access: false,
    },
    "https://creativecommons.org/licenses/by-nd/4.0": {
      allows_derivatives: false,
      name: "Creative Commons Attribution-NoDerivs (CC BY-ND)",
      open_access: true,
    },
  };

  const bookData: BookData = {
    id: "id",
    title: "title",
    coverUrl: "/cover",
    changeCoverLink: {
      href: "/change_cover",
      rel: "http://librarysimplified.org/terms/rel/change_cover",
    },
  };

  let wrapper;
  const editableInputByName = (name) => {
    const inputs = wrapper.find(EditableInput);
    return inputs.filterWhere((input) => input.props().name === name);
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
      const title = wrapper.find("h2");
      expect(title.text()).to.equal(bookData.title);
    });

    it("shows updating message", () => {
      const updatingContainer = wrapper.find(".updating-loader-container");
      let updating = wrapper.find(".updating-loader");
      expect(updatingContainer.length).to.equal(2);
      expect(updating.length).to.equal(0);

      wrapper.setProps({ isFetching: true });
      updating = wrapper.find(".updating-loader");

      // The second loader component renders based on a different prop,
      // so only one loader should be rendered.
      expect(updating.length).to.equal(1);
      expect(updating.text()).to.contain("Updating");
    });

    it("shows current cover", () => {
      const cover = wrapper.find(".current-cover");
      expect(cover.length).to.equal(1);
      expect(cover.props().src).to.equal(bookData.coverUrl);
      expect(cover.props().alt).to.equal("Current book cover");
    });

    it("shows cover URL and cover file inputs", () => {
      const coverUrl = editableInputByName("cover_url");
      expect(coverUrl.props().label).to.equal("URL for cover image");

      const coverFile = editableInputByName("cover_file");
      expect(coverFile.props().label).to.equal("Or upload cover image");
      expect(coverFile.props().type).to.equal("file");
      expect(coverFile.props().accept).to.equal("image/*");
    });

    it("shows title position input", () => {
      const input = editableInputByName("title_position");
      expect(input.props().elementType).to.equal("select");
      expect(input.props().label).to.equal("Title and Author Position");
      const options = input.find("option");
      expect(options.length).to.equal(4);
      expect(options.at(0).props().value).to.equal("none");
      expect(options.at(1).props().value).to.equal("top");
      expect(options.at(2).props().value).to.equal("center");
      expect(options.at(3).props().value).to.equal("bottom");
    });

    it("shows preview updating message", () => {
      let updatingContainer = wrapper.find(".updating-loader-container");
      let updating = wrapper.find(".updating-loader");
      expect(updatingContainer.length).to.equal(2);
      expect(updating.length).to.equal(0);

      wrapper.setProps({ isFetchingPreview: true });
      updatingContainer = wrapper.find(".updating-loader-container");
      updating = wrapper.find(".updating-loader");

      // This specific loader renders based on the `isFetchingPreview` prop.
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
      const rightsStatusInput = editableInputByName("rights_status");
      expect(rightsStatusInput.length).to.equal(1);
      expect(rightsStatusInput.props().elementType).to.equal("select");
      expect(rightsStatusInput.props().label).to.equal("License");

      const children = rightsStatusInput.find("option");
      expect(children.length).to.equal(3);
      expect(children.at(0).props().value).to.equal(
        "http://creativecommons.org/licenses/by/4.0/"
      );
      expect(children.at(0).text()).to.equal(
        "Creative Commons Attribution (CC BY)"
      );
      expect(children.at(1).props().value).to.equal(
        "http://librarysimplified.org/terms/rights-status/in-copyright"
      );
      expect(children.at(1).text()).to.equal("In Copyright");
      expect(children.at(2).props().value).to.equal(
        "http://librarysimplified.org/terms/rights-status/unknown"
      );
      expect(children.at(2).text()).to.equal("Other");

      const explanationInput = editableInputByName("rights_explanation");
      expect(explanationInput.length).to.equal(1);
      expect(explanationInput.props().label).to.equal("Explanation of rights");
    });

    it("shows fetch error", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(0);

      const errorData = { status: 500, url: "url", response: "error" };
      wrapper.setProps({ fetchError: errorData });
      error = wrapper.find(ErrorMessage);
      expect(error.props().error).to.equal(errorData);
    });

    it("shows preview fetch error", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(0);

      const errorData = { status: 500, url: "url", response: "error" };
      wrapper.setProps({ previewFetchError: errorData });
      error = wrapper.find(ErrorMessage);
      expect(error.props().error).to.equal(errorData);
    });

    it("shows save button", () => {
      const buttons = wrapper.find("button");
      // Counting the two buttons that are coming from the Panel component:
      expect(buttons.length).to.equal(4);
      let save = buttons.at(3);
      expect(save.props().disabled).to.be.ok;

      wrapper.setProps({ preview: "image data" });
      save = wrapper.find("button").at(3);
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
      editCover = stub().returns(
        new Promise<void>((resolve) => resolve())
      );
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

      const previewButton = wrapper.find("button").at(1);
      const coverUrl = editableInputByName("cover_url");
      coverUrl.setState({ value: "http://example.com" });
      previewButton.simulate("click");

      expect(fetchPreview.callCount).to.equal(1);
      expect(fetchPreview.args[0][0]).to.equal(
        "/admin/book/preview_book_cover"
      );
      let formData = fetchPreview.args[0][1];
      expect(formData.get("cover_url")).to.equal("http://example.com");
      expect(formData.get("title_position")).to.equal("none");

      const titlePosition = editableInputByName("title_position");
      titlePosition.setState({ value: "center" });
      previewButton.simulate("click");

      expect(fetchPreview.callCount).to.equal(2);
      expect(fetchPreview.args[1][0]).to.equal(
        "/admin/book/preview_book_cover"
      );
      formData = fetchPreview.args[1][1];
      expect(formData.get("cover_url")).to.equal("http://example.com");
      expect(formData.get("cover_file").name).to.equal("");
      expect(formData.get("title_position")).to.equal("center");
      coverUrl.setState({ value: "" });
      previewButton.simulate("click");

      expect(fetchPreview.callCount).to.equal(2);
      expect(clearPreview.callCount).to.equal(2);
    });

    it.skip("should fail for now - previews cover when relevant inputs change", () => {
      expect(fetchPreview.callCount).to.equal(0);
      expect(clearPreview.callCount).to.equal(1);

      const previewButton = wrapper.find("button").at(1);

      const coverFile = editableInputByName("cover_file");
      coverFile.setState({ value: "c://file.png" });
      previewButton.simulate("click");

      expect(fetchPreview.callCount).to.equal(3);
      expect(fetchPreview.args[2][0]).to.equal(
        "/admin/book/preview_book_cover"
      );
      const formData = fetchPreview.args[0][1];
      expect(formData.get("cover_url")).to.equal("");
      expect(formData.get("title_position")).to.equal("center");
    });

    it("saves", async () => {
      expect(editCover.callCount).to.equal(0);
      expect(fetchBook.callCount).to.equal(0);
      expect(refreshCatalog.callCount).to.equal(0);
      wrapper.setProps({ preview: "image data" });

      const coverUrl = editableInputByName("cover_url");
      coverUrl.at(0).setState({ value: "http://example.com" });

      const titlePosition = editableInputByName("title_position");
      titlePosition.at(0).setState({ value: "center" });

      const rightsStatus = editableInputByName("rights_status");
      rightsStatus
        .at(0)
        .setState({ value: "http://creativecommons.org/licenses/by/4.0/" });

      const rightsExplanation = editableInputByName("rights_explanation");
      rightsExplanation.at(0).setState({ value: "explanation" });

      const saveButton = wrapper.find("button").at(3);
      saveButton.simulate("click");

      expect(editCover.callCount).to.equal(1);
      expect(editCover.args[0][0]).to.equal("/change_cover");
      const formData = editCover.args[0][1];
      expect(formData.get("cover_url")).to.equal("http://example.com");
      expect(formData.get("title_position")).to.equal("center");
      expect(formData.get("rights_status")).to.equal(
        "http://creativecommons.org/licenses/by/4.0/"
      );
      expect(formData.get("rights_explanation")).to.equal("explanation");

      const pause = (): Promise<void> => {
        return new Promise<void>((resolve) => setTimeout(resolve, 0));
      };
      await pause();

      expect(fetchBook.callCount).to.equal(1);
      expect(refreshCatalog.callCount).to.equal(1);
    });
  });
});
