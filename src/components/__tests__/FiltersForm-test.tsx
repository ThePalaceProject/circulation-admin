import { expect } from "chai";
import { stub } from "sinon";
import { Panel } from "library-simplified-reusable-components";
import * as React from "react";
import { mount } from "enzyme";
import ProtocolFormField from "../ProtocolFormField";
import EditableInput from "../EditableInput";
import FiltersForm from "../FiltersForm";

describe("FiltersForm", () => {
  let wrapper;
  beforeEach(() => {
    let submit = stub();
    let content = [
      {
        category: "Lanes & Filters",
        default: ["Book"],
        description: "Patrons will see the selected entry points at the top level and in search results. <p>Currently supported audiobook vendors: Bibliotheca, Axis 360",
        key: "enabled_entry_points",
        label: "Enabled entry points",
        options: [
          {key: "All", label: "All"},
          {key: "Book", label: "eBooks"},
          {key: "Audio", label: "Audiobooks"},
        ],
        type: "list"
      },
      {
        category: "Lanes & Filters",
        default: 15,
        key: "featured_lane_size",
        label: "Maximum number of books in the 'featured' lanes",
        type: "number"
      },
      {
        category: "Lanes & Filters",
        default: 0.65,
        description: "Between 0 and 1.",
        key: "minimum_featured_quality",
        label: "Minimum quality for books that show up in 'featured' lanes",
        max: 1,
        type: "number"
      },
      {
        category: "Lanes & Filters",
        default: ["now", "all", "always"],
        key: "facets_enabled_available",
        label: "Allow patrons to filter availability to",
        options: [
          {key: "now", label: "Available now"},
          {key: "all", label: "All"},
          {key: "always", label: "Yours to keep"}
        ],
        type: "list"
      },
      {
        category: "Lanes & Filters",
        default: ["title", "author", "added", "random"],
        key: "facets_enabled_order",
        label: "Allow patrons to sort by",
        options: [
          {key: "title", label: "Title"},
          {key: "author", label: "Author"},
          {key: "added", label: "Recently Added"},
          {key: "random", label: "Random"}
        ],
        type: "list"
      },
      {
        category: "Lanes & Filters",
        default: ["full", "featured"],
        key: "facets_enabled_collection",
        label: "Allow patrons to filter collection to",
        options: [
          {key: "full", label: "Everything"},
          {key: "featured", label: "Popular Books"}
        ],
        type: "list"
      },
      {
        category: "Lanes & Filters",
        default: "all",
        key: "facets_default_available",
        label: "Default Availability",
        options: [
          {key: "now", label: "Available now"},
          {key: "all", label: "All"},
          {key: "always", label: "Yours to keep"}
        ],
        type: "select"
      },
      {
        category: "Lanes & Filters",
        default: "author",
        key: "facets_default_order",
        label: "Default Sort by",
        options: [
          {key: "title", label: "Title"},
          {key: "author", label: "Author"},
          {key: "added", label: "Recently Added"},
          {key: "random", label: "Random"}
        ],
        type: "select"
      },
      {
        category: "Lanes & Filters",
        default: "full",
        key: "facets_default_collection",
        label: "Default Collection",
        options: [
          {key: "full", label: "Everything"},
          {key: "featured", label: "Popular Books"}
        ],
        type: "select"
      }
    ];

    let item = {
      uuid: "uuid",
      name: "Library",
      short_name: "lib",
      settings: {
        enabled_entry_points: ["Book"],
        facets_default_available: "all",
        facets_default_collection: "featured",
        facets_default_order: "title",
        facets_enabled_available: ["all", "always"],
        facets_enabled_collection: ["featured"],
        facets_enabled_order: ["title", "author"],
        featured_lane_size: "20",
        minimum_featured_quality: "0.8"
      }
    };

    wrapper = mount(
      <FiltersForm
        submit={submit}
        content={(content as any)}
        disabled={false}
        item={item}
      />
    );
  });

  it("renders a panel", () => {
    let panel = wrapper.find(Panel);
    expect(panel.length).to.equal(1);
    expect(panel.prop("headerText")).to.equal("Lanes & Filters (Optional)");
    expect(panel.prop("onEnter")).to.equal(wrapper.prop("submit"));
  });
  it("renders number fields", () => {
    let fields = wrapper.find(ProtocolFormField);
    let featuredNumber = fields.at(1);
    let featuredQuality = fields.at(2);

    expect(featuredNumber.prop("setting").key).to.equal("featured_lane_size");
    expect(featuredNumber.prop("setting").type).to.equal("number");
    expect(featuredNumber.prop("setting").default).to.equal(15);
    expect(featuredNumber.prop("value")).to.equal("20");
    expect(featuredNumber.find("label").text()).to.equal("Maximum number of books in the 'featured' lanes");

    expect(featuredQuality.prop("setting").key).to.equal("minimum_featured_quality");
    expect(featuredQuality.prop("setting").type).to.equal("number");
    expect(featuredQuality.prop("setting").default).to.equal(0.65);
    expect(featuredQuality.prop("value")).to.equal("0.8");
    expect(featuredQuality.find("label").text()).to.equal("Minimum quality for books that show up in 'featured' lanes");
  });
  it("renders checkboxes for the enabled entry points", () => {
    let entryPoints = wrapper.find(ProtocolFormField).at(0);
    expect(entryPoints.prop("setting").key).to.equal("enabled_entry_points");
    expect(entryPoints.prop("setting").type).to.equal("list");
    expect(entryPoints.prop("setting").default).to.eql(["Book"]);
    expect(entryPoints.prop("value")).to.eql(["Book"]);
    expect(entryPoints.find("label").at(0).text()).to.equal("Enabled entry points");

    let inputs = entryPoints.find(EditableInput);
    expect(inputs.length).to.equal(3);
    inputs.forEach(x => { expect(x.prop("type")).to.equal("checkbox"); });
    expect(inputs.at(0).prop("name")).to.equal("enabled_entry_points_All");
    expect(inputs.at(0).find("label").text()).to.equal("All");
    expect(inputs.at(0).find("input").prop("checked")).to.be.false;

    expect(inputs.at(1).prop("name")).to.equal("enabled_entry_points_Book");
    expect(inputs.at(1).find("label").text()).to.equal("eBooks");
    expect(inputs.at(1).find("input").prop("checked")).to.be.true;

    expect(inputs.at(2).prop("name")).to.equal("enabled_entry_points_Audio");
    expect(inputs.at(2).find("label").text()).to.equal("Audiobooks");
    expect(inputs.at(2).find("input").prop("checked")).to.be.false;
  });
  it("renders checkboxes for the availablity filters", () => {
    let available = wrapper.find(ProtocolFormField).at(3);
    expect(available.prop("setting").key).to.equal("facets_enabled_available");
    expect(available.prop("setting").type).to.equal("list");
    expect(available.prop("setting").default).to.eql(["now", "all", "always"]);
    expect(available.prop("value")).to.eql(["all", "always"]);
    expect(available.find("label").at(0).text()).to.equal("Allow patrons to filter availability to");

    let inputs = available.find(EditableInput);
    expect(inputs.length).to.equal(3);
    inputs.forEach(x => { expect(x.prop("type")).to.equal("checkbox"); });
    expect(inputs.at(0).prop("name")).to.equal("facets_enabled_available_now");
    expect(inputs.at(0).find("label").text()).to.equal("Available now");
    expect(inputs.at(0).find("input").prop("checked")).to.be.false;

    expect(inputs.at(1).prop("name")).to.equal("facets_enabled_available_all");
    expect(inputs.at(1).find("label").text()).to.equal("All");
    expect(inputs.at(1).find("input").prop("checked")).to.be.true;

    expect(inputs.at(2).prop("name")).to.equal("facets_enabled_available_always");
    expect(inputs.at(2).find("label").text()).to.equal("Yours to keep");
    expect(inputs.at(2).find("input").prop("checked")).to.be.true;
  });
  it("renders checkboxes for the sorting keys", () => {
    let sorting = wrapper.find(ProtocolFormField).at(4);
    expect(sorting.prop("setting").key).to.equal("facets_enabled_order");
    expect(sorting.prop("setting").type).to.equal("list");
    expect(sorting.prop("setting").default).to.eql(["title", "author", "added", "random"]);
    expect(sorting.prop("value")).to.eql(["title", "author"]);
    expect(sorting.find("label").at(0).text()).to.equal("Allow patrons to sort by");

    let inputs = sorting.find(EditableInput);
    expect(inputs.length).to.equal(4);
    inputs.forEach(x => { expect(x.prop("type")).to.equal("checkbox"); });
    expect(inputs.at(0).prop("name")).to.equal("facets_enabled_order_title");
    expect(inputs.at(0).find("label").text()).to.equal("Title");
    expect(inputs.at(0).find("input").prop("checked")).to.be.true;

    expect(inputs.at(1).prop("name")).to.equal("facets_enabled_order_author");
    expect(inputs.at(1).find("label").text()).to.equal("Author");
    expect(inputs.at(1).find("input").prop("checked")).to.be.true;

    expect(inputs.at(2).prop("name")).to.equal("facets_enabled_order_added");
    expect(inputs.at(2).find("label").text()).to.equal("Recently Added");
    expect(inputs.at(2).find("input").prop("checked")).to.be.false;

    expect(inputs.at(3).prop("name")).to.equal("facets_enabled_order_random");
    expect(inputs.at(3).find("label").text()).to.equal("Random");
    expect(inputs.at(3).find("input").prop("checked")).to.be.false;
  });
  it("renders checkboxes for the filters", () => {
    let filters = wrapper.find(ProtocolFormField).at(5);
    expect(filters.prop("setting").key).to.equal("facets_enabled_collection");
    expect(filters.prop("setting").type).to.equal("list");
    expect(filters.prop("setting").default).to.eql(["full", "featured"]);
    expect(filters.prop("value")).to.eql(["featured"]);
    expect(filters.find("label").at(0).text()).to.equal("Allow patrons to filter collection to");

    let inputs = filters.find(EditableInput);
    expect(inputs.length).to.equal(2);
    inputs.forEach(x => { expect(x.prop("type")).to.equal("checkbox"); });
    expect(inputs.at(0).prop("name")).to.equal("facets_enabled_collection_full");
    expect(inputs.at(0).find("label").text()).to.equal("Everything");
    expect(inputs.at(0).find("input").prop("checked")).to.be.false;

    expect(inputs.at(1).prop("name")).to.equal("facets_enabled_collection_featured");
    expect(inputs.at(1).find("label").text()).to.equal("Popular Books");
    expect(inputs.at(1).find("input").prop("checked")).to.be.true;
  });
  it("renders a dropdown menu for the default availability", () => {
    let defaultAvailable = wrapper.find(ProtocolFormField).at(6);
    expect(defaultAvailable.prop("setting").key).to.equal("facets_default_available");
    expect(defaultAvailable.prop("setting").type).to.equal("select");
    expect(defaultAvailable.prop("setting").default).to.equal("all");
    expect(defaultAvailable.prop("value")).to.equal("all");
    expect(defaultAvailable.find("label").text()).to.contain("Default Availability");

    let options = defaultAvailable.find("option");
    // Only the checked options from the corresponding checkbox set show up in the select menu.
    expect(options.length).to.equal(2);
    expect(options.at(0).text()).to.equal("All");
    expect(options.at(1).text()).to.equal("Yours to keep");
  });
  it("renders a dropdown menu for the default sorting", () => {
    let defaultSorting = wrapper.find(ProtocolFormField).at(7);
    expect(defaultSorting.prop("setting").key).to.equal("facets_default_order");
    expect(defaultSorting.prop("setting").type).to.equal("select");
    expect(defaultSorting.prop("setting").default).to.equal("author");
    expect(defaultSorting.prop("value")).to.equal("title");
    expect(defaultSorting.find("label").text()).to.contain("Default Sort by");

    let options = defaultSorting.find("option");
    // Only the checked options from the corresponding checkbox set show up in the select menu.
    expect(options.length).to.equal(2);
    expect(options.at(0).text()).to.equal("Title");
    expect(options.at(1).text()).to.equal("Author");
  });
  it("renders a dropdown menu for the default filters", () => {
    let defaultFilters = wrapper.find(ProtocolFormField).at(8);
    expect(defaultFilters.prop("setting").key).to.equal("facets_default_collection");
    expect(defaultFilters.prop("setting").type).to.equal("select");
    expect(defaultFilters.prop("setting").default).to.equal("full");
    expect(defaultFilters.prop("value")).to.equal("featured");
    expect(defaultFilters.find("label").text()).to.contain("Default Collection");

    let options = defaultFilters.find("option");
    // Only the checked options from the corresponding checkbox set show up in the select menu.
    expect(options.length).to.equal(1);
    expect(options.at(0).text()).to.equal("Popular Books");
  });
  it("understands the relationships between the checkboxes and the dropdowns", () => {
    expect(wrapper.instance().findCorresponding(wrapper.prop("content")[3])).to.eql(["all", "always"]);
    expect(wrapper.instance().findCorresponding(wrapper.prop("content")[4])).to.eql(["title", "author"]);
    expect(wrapper.instance().findCorresponding(wrapper.prop("content")[5])).to.eql(["featured"]);
  });
});
