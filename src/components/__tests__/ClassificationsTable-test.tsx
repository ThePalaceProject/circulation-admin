jest.dontMock("../ClassificationsTable");

import * as React from "react";
import { shallow } from "enzyme";

import ClassificationsTable from "../ClassificationsTable";
import classificationsData from "./classificationsData";

describe("ClassificationsTable", () => {
  describe("rendering", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(
        <ClassificationsTable classifications={classificationsData} />
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
        let c = classificationsData[i];
        expect(cellTexts).toEqual([readableType(c.type), c.name, c.source, c.weight]);
      });
    });
  });
});