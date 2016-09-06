import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { Editor } from "../Editor";
import ButtonForm from "../ButtonForm";
import EditForm from "../EditForm";
import ErrorMessage from "../ErrorMessage";

describe("Editor", () => {
  it("loads admin book url on mount", () => {
    let permalink = "works/1234";
    let fetchBook = stub();

    let wrapper = shallow(
      <Editor
        bookUrl={permalink}
        fetchBook={fetchBook}
        csrfToken={"token"}
        />
    );

    expect(fetchBook.callCount).to.equal(1);
    expect(fetchBook.args[0][0]).to.equal("admin/works/1234");
  });

  it("loads admin book url when given a new book url", () => {
    let permalink = "works/1234";
    let newPermalink = "works/5555";
    let fetchBook = stub();
    let element = document.createElement("div");
    let wrapper = shallow(
      <Editor
        bookUrl={permalink}
        fetchBook={fetchBook}
        csrfToken={"token"}
        />
    );
    wrapper.setProps({ bookUrl: newPermalink });
    wrapper.update();

    expect(fetchBook.callCount).to.equal(2);
    expect(fetchBook.args[1][0]).to.equal("admin/works/5555");
  });

  it("shows title", () => {
    let fetchBook = stub();
    let wrapper = shallow(
      <Editor
        bookData={{ title: "title" }}
        bookUrl="url"
        csrfToken="token"
        fetchBook={fetchBook}
        />
    );

    let header = wrapper.find("h2");
    expect(header.text()).to.contain("title");
  });

  it("shows button form for hide link", () => {
    let fetchBook = stub();
    let hideLink = {
      href: "href", rel: "http://librarysimplified.org/terms/rel/hide"
    };
    let wrapper = shallow(
      <Editor
        bookData={{ title: "title", hideLink: hideLink }}
        bookUrl="url"
        csrfToken="token"
        fetchBook={fetchBook}
        />
    );
    let hide = (wrapper.instance() as any).hide;

    let form = wrapper.find(ButtonForm);
    expect(form.prop("label")).to.equal("Hide");
    expect(form.prop("onClick")).to.equal(hide);
  });

  it("shows button form for restore link", () => {
    let fetchBook = stub();
    let restoreLink = {
      href: "href", rel: "http://librarysimplified.org/terms/rel/restore"
    };
    let wrapper = shallow(
      <Editor
        bookData={{ title: "title", restoreLink: restoreLink }}
        bookUrl="url"
        csrfToken="token"
        fetchBook={fetchBook}
        />
    );
    let restore = (wrapper.instance() as any).restore;

    let form = wrapper.find(ButtonForm);
    expect(form.prop("label")).to.equal("Restore");
    expect(form.prop("onClick")).to.equal(restore);
  });

  it("shows button form for refresh link", () => {
    let fetchBook = stub();
    let refreshLink = {
      href: "href", rel: "http://librarysimplified/terms/rel/refresh"
    };
    let wrapper = shallow(
      <Editor
        bookData={{ title: "title", refreshLink: refreshLink }}
        bookUrl="url"
        csrfToken="token"
        fetchBook={fetchBook}
        />
    );
    let refresh = (wrapper.instance() as any).refreshMetadata;

    let form = wrapper.find(ButtonForm);
    expect(form.prop("label")).to.equal("Refresh Metadata");
    expect(form.prop("onClick")).to.equal(refresh);
  });

  it("shows fetch error message", () => {
    let fetchBook = stub();
    let fetchError = {
      status: 500,
      response: "response",
      url: ""
    };
    let wrapper = shallow(
      <Editor
        bookData={{ title: "title" }}
        bookUrl="url" csrfToken="token"
        fetchError={fetchError}
        fetchBook={fetchBook}
        />
    );

    let editForm = wrapper.find(EditForm);
    expect(editForm.length).to.equal(0);
    let error = wrapper.find(ErrorMessage);
    expect(error.prop("error")).to.equal(fetchError);
  });

  it("shows edit error message with form", () => {
    let fetchBook = stub();
    let editError = {
      status: 500,
      response: "response",
      url: ""
    };
    let editLink = {
      href: "href", rel: "http://librarysimplified.org/terms/rel/edit"
    };
    let wrapper = shallow(
      <Editor
        bookData={{ title: "title", editLink: editLink }}
        bookUrl="url"
        csrfToken="token"
        editError={editError}
        fetchBook={fetchBook}
        />
    );

    let editForm = wrapper.find(EditForm);
    expect(editForm.length).to.equal(1);
    let error = wrapper.find(ErrorMessage);
    expect(error.prop("error")).to.equal(editError);
  });
});
