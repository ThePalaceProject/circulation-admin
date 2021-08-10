import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { BookDetailsEditor } from "../BookDetailsEditor";
import { Button } from "library-simplified-reusable-components";
import BookEditForm from "../BookEditForm";
import ErrorMessage from "../ErrorMessage";

describe("BookDetailsEditor", () => {
  let fetchBook;
  let fetchRoles;
  let fetchMedia;
  let fetchLanguages;
  let editBook;
  let dispatchProps;

  beforeEach(() => {
    fetchBook = stub();
    fetchRoles = stub();
    fetchMedia = stub();
    fetchLanguages = stub();
    editBook = stub();
    dispatchProps = {
      fetchBook,
      fetchRoles,
      fetchMedia,
      fetchLanguages,
      editBook,
    };
  });

  it("loads admin book url, roles, languages, and media on mount", () => {
    const permalink = "works/1234";
    const wrapper = shallow(
      <BookDetailsEditor
        bookUrl={permalink}
        {...dispatchProps}
        csrfToken={"token"}
      />
    );

    expect(fetchBook.callCount).to.equal(1);
    expect(fetchBook.args[0][0]).to.equal("admin/works/1234");
    expect(fetchRoles.callCount).to.equal(1);
    expect(fetchMedia.callCount).to.equal(1);
    expect(fetchLanguages.callCount).to.equal(1);
  });

  it("loads admin book url when given a new book url", () => {
    const permalink = "works/1234";
    const newPermalink = "works/5555";
    const element = document.createElement("div");
    const wrapper = shallow(
      <BookDetailsEditor
        bookUrl={permalink}
        {...dispatchProps}
        csrfToken={"token"}
      />
    );
    wrapper.setProps({ bookUrl: newPermalink });
    wrapper.update();

    expect(fetchBook.callCount).to.equal(2);
    expect(fetchBook.args[1][0]).to.equal("admin/works/5555");
  });

  it("shows title", () => {
    const wrapper = shallow(
      <BookDetailsEditor
        bookData={{ id: "id", title: "title" }}
        bookUrl="url"
        csrfToken="token"
        {...dispatchProps}
      />
    );

    const header = wrapper.find("h2");
    expect(header.text()).to.contain("title");
  });

  it("shows button form for hide link", () => {
    const hideLink = {
      href: "href",
      rel: "http://librarysimplified.org/terms/rel/hide",
    };
    const wrapper = shallow(
      <BookDetailsEditor
        bookData={{ id: "id", title: "title", hideLink: hideLink }}
        bookUrl="url"
        csrfToken="token"
        {...dispatchProps}
      />
    );
    const hide = (wrapper.instance() as any).hide;

    const hideButton = wrapper.find(Button);
    expect(hideButton.prop("content")).to.equal("Hide");
    expect(hideButton.prop("callback")).to.equal(hide);
  });

  it("shows button form for restore link", () => {
    const restoreLink = {
      href: "href",
      rel: "http://librarysimplified.org/terms/rel/restore",
    };
    const wrapper = shallow(
      <BookDetailsEditor
        bookData={{ id: "id", title: "title", restoreLink: restoreLink }}
        bookUrl="url"
        csrfToken="token"
        {...dispatchProps}
      />
    );
    const restore = (wrapper.instance() as any).restore;

    const restoreButton = wrapper.find(Button);
    expect(restoreButton.prop("content")).to.equal("Restore");
    expect(restoreButton.prop("callback")).to.equal(restore);
  });

  it("shows button form for refresh link", () => {
    const refreshLink = {
      href: "href",
      rel: "http://librarysimplified/terms/rel/refresh",
    };
    const wrapper = shallow(
      <BookDetailsEditor
        bookData={{ id: "id", title: "title", refreshLink: refreshLink }}
        bookUrl="url"
        csrfToken="token"
        {...dispatchProps}
      />
    );
    const refresh = (wrapper.instance() as any).refreshMetadata;

    const refreshButton = wrapper.find(Button);
    expect(refreshButton.prop("content")).to.equal("Refresh Metadata");
    expect(refreshButton.prop("callback")).to.equal(refresh);
  });

  it("shows fetch error message", () => {
    const fetchError = {
      status: 500,
      response: "response",
      url: "",
    };
    const wrapper = shallow(
      <BookDetailsEditor
        bookData={{ id: "id", title: "title" }}
        bookUrl="url"
        csrfToken="token"
        fetchError={fetchError}
        {...dispatchProps}
      />
    );

    const editForm = wrapper.find(BookEditForm);
    expect(editForm.length).to.equal(0);
    const error = wrapper.find(ErrorMessage);
    expect(error.prop("error")).to.equal(fetchError);
  });

  it("shows edit error message with form", () => {
    const editError = {
      status: 500,
      response: "response",
      url: "",
    };
    const editLink = {
      href: "href",
      rel: "http://librarysimplified.org/terms/rel/edit",
    };
    const wrapper = shallow(
      <BookDetailsEditor
        bookData={{ id: "id", title: "title", editLink: editLink }}
        bookUrl="url"
        csrfToken="token"
        editError={editError}
        {...dispatchProps}
      />
    );

    const editForm = wrapper.find(BookEditForm);
    expect(editForm.length).to.equal(1);
    const error = wrapper.find(ErrorMessage);
    expect(error.prop("error")).to.equal(editError);
  });

  it("shows book edit form", () => {
    const roles = {
      aut: "Author",
      nar: "Narrator",
    };
    const media = {
      "http://schema.org/AudioObject": "Audio",
      "http://schema.org/Book": "Book",
    };
    const languages = {
      eng: ["English"],
      spa: ["Spanish", "Castilian"],
    };
    const editLink = {
      href: "href",
      rel: "http://librarysimplified.org/terms/rel/edit",
    };
    const wrapper = shallow(
      <BookDetailsEditor
        bookData={{ id: "id", title: "title", editLink }}
        bookUrl="url"
        csrfToken="token"
        {...dispatchProps}
        roles={roles}
        media={media}
        languages={languages}
      />
    );

    const editForm = wrapper.find(BookEditForm);
    expect(editForm.length).to.equal(1);
    expect(editForm.prop("title")).to.equal("title");
    expect(editForm.prop("roles")).to.equal(roles);
    expect(editForm.prop("media")).to.equal(media);
    expect(editForm.prop("languages")).to.equal(languages);
  });
});
