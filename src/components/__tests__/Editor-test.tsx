jest.autoMockOff();

import * as React from "react";
import { shallow } from "enzyme";

import { Editor } from "../Editor";
import ButtonForm from "../ButtonForm";
import EditForm from "../EditForm";
import ErrorMessage from "../ErrorMessage";

describe("Editor", () => {
  it("loads admin book url on mount", () => {
    let permalink = "works/1234";
    let fetchBook = jest.genMockFunction();

    let wrapper = shallow(
      <Editor
        bookUrl={permalink}
        fetchBook={fetchBook}
        csrfToken={"token"}
        />
    );

    expect(fetchBook.mock.calls.length).toBe(1);
    expect(fetchBook.mock.calls[0][0]).toBe("admin/works/1234");
  });

  it("loads admin book url when given a new book url", () => {
    let permalink = "works/1234";
    let newPermalink = "works/5555";
    let fetchBook = jest.genMockFunction();
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

    expect(fetchBook.mock.calls.length).toBe(2);
    expect(fetchBook.mock.calls[1][0]).toBe("admin/works/5555");
  });

  it("shows title", () => {
    let fetchBook = jest.genMockFunction();
    let wrapper = shallow(
      <Editor
        bookData={{ title: "title" }}
        bookUrl="url"
        csrfToken="token"
        fetchBook={fetchBook}
        />
    );

    let header = wrapper.find("h2");
    expect(header.text()).toContain("title");
  });

  it("shows button form for hide link", () => {
    let fetchBook = jest.genMockFunction();
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
    expect(form.props().label).toBe("Hide");
    expect(form.props().onClick).toBe(hide);
  });

  it("shows button form for restore link", () => {
    let fetchBook = jest.genMockFunction();
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
    expect(form.props().label).toBe("Restore");
    expect(form.props().onClick).toBe(restore);
  });

  it("shows button form for refresh link", () => {
    let fetchBook = jest.genMockFunction();
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
    expect(form.props().label).toBe("Refresh Metadata");
    expect(form.props().onClick).toBe(refresh);
  });

  it("shows fetch error message", () => {
    let fetchBook = jest.genMockFunction();
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
    expect(editForm.length).toEqual(0);
    let error = wrapper.find(ErrorMessage);
    expect(error.props().error).toBe(fetchError);
  });

  it("shows edit error message with form", () => {
    let fetchBook = jest.genMockFunction();
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
    expect(editForm.length).toEqual(1);
    let error = wrapper.find(ErrorMessage);
    expect(error.props().error).toBe(editError);
  });
});
