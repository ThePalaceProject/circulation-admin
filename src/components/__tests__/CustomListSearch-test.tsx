import { expect } from "chai";
import { spy, stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import CustomListSearch from "../CustomListSearch";


describe.only("CustomListSearch", () => {
  let wrapper;
  let search;
  beforeEach(() => {
    search = stub();
    wrapper = mount(
      <CustomListSearch search={search} />
    );
  });
  it("searches", () => {
    let input = wrapper.find(".form-control") as any;
    input.getDOMNode().value = "test";
    let searchForm = wrapper.find("form");
    searchForm.simulate("submit");

    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal("test");
    expect(search.args[0][1]).to.equal("_score");
  });
  it("sorts", () => {
    let spySort = spy(wrapper.instance(), "sort");
    wrapper.setProps({ sort: spySort });
    expect(wrapper.state().sortBy).to.equal("_score");
    let sortOptions = wrapper.find(".search-options").find(".form-group");
    expect(sortOptions.length).to.equal(3);

    let relevance = sortOptions.at(0);
    expect(relevance.text()).to.equal("Relevance (default)");
    let relevanceRadio = relevance.find("input");
    expect(relevanceRadio.props().type).to.equal("radio");
    expect(relevanceRadio.props().name).to.equal("_score");
    expect(relevanceRadio.props().value).to.equal("_score");
    expect(relevanceRadio.props().checked).to.be.true;

    let title = sortOptions.at(1);
    expect(title.text()).to.equal("Title");
    let titleRadio = title.find("input");
    expect(titleRadio.props().type).to.equal("radio");
    expect(titleRadio.props().name).to.equal("title");
    expect(titleRadio.props().value).to.equal("title");
    expect(titleRadio.props().checked).to.be.false;

    let author = sortOptions.at(2);
    expect(author.text()).to.equal("Author");
    let authorRadio = author.find("input");
    expect(authorRadio.props().type).to.equal("radio");
    expect(authorRadio.props().name).to.equal("author");
    expect(authorRadio.props().value).to.equal("author");
    expect(authorRadio.props().checked).to.be.false;

    titleRadio.simulate("change");
    expect(spySort.callCount).to.equal(1);
    expect(spySort.args[0][0]).to.equal("title");
    expect(wrapper.state().sortBy).to.equal("title");

    authorRadio.simulate("change");
    expect(spySort.callCount).to.equal(2);
    expect(spySort.args[1][0]).to.equal("author");
    expect(wrapper.state().sortBy).to.equal("author");

    relevanceRadio.simulate("change");
    expect(spySort.callCount).to.equal(3);
    expect(spySort.args[2][0]).to.equal("_score");
    expect(wrapper.state().sortBy).to.equal("_score");

    spySort.restore();
  });
  it("automatically searches if there is a startingTitle prop", () => {
    let search = stub();
    wrapper = mount(
      <CustomListSearch startingTitle="test" search={search} />
    );
    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal("test");
    expect(search.args[0][1]).to.equal("_score");
  });
});
