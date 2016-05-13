jest.dontMock("../ClassificationsTable");

import * as React from "react";
import { shallow } from "enzyme";

import ClassificationsTable from "../ClassificationsTable";

describe("ClassificationsTable", () => {
  describe("rendering", () => {
    let wrapper;
    let classifications = [
      { name: "Science Fiction", source: "staff", type: "http://librarysimplified.org/terms/genres/Simplified/", weight: "2" },
      { name: "Romance", source: "staff", type: "http://librarysimplified.org/terms/genres/Simplified/", weight: "2" },
      { name: "sci-fi", source: "other", type: "other", weight: "1" },
      { name: "romance", source: "other", type: "other", weight: "1" }
    ];

    beforeEach(() => {
      wrapper = shallow(
        <ClassificationsTable classifications={classifications} />
      );
    });

    it("should show header", () => {
      let header = wrapper.find("h3");
      expect(header.length).toBe(1);
    });

    it("should show column headers", () => {
      let headers = wrapper.find("th");
      let headerNames = headers.map(header => header.text());
      expect(headerNames).toEqual(["Type", "Name", "Source", "Weight"]);
    });

    it("should show one row for each classification", () => {
      let readableType = (wrapper.instance() as any).readableType;
      let rows = wrapper.find("tbody").find("tr");
      rows.forEach((row, i) => {
        let cells = row.find("td");
        let cellTexts = cells.map(cell => cell.text());
        let c = classifications[i];
        expect(cellTexts).toEqual([readableType(c.type), c.name, c.source, c.weight]);
      });
    });
  });
});