import { expect } from "chai";

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
      expect(header.length).to.equal(1);
    });

    it("should show column headers", () => {
      let headers = wrapper.find("th");
      let headerNames = headers.map(header => header.text());
      expect(headerNames).to.deep.equal(["Type", "Name", "Source", "Weight"]);
    });

    it("should show one row for each classification", () => {
      let readableType = (wrapper.instance() as any).readableType;
      let rows = wrapper.find("tbody").find("tr");
      rows.forEach((row, i) => {
        let cells = row.find("td");
        let c = classificationsData[i];
        expect(cells.at(0).text()).to.equal(readableType(c.type));
        expect(cells.at(1).text()).to.equal(c.name);
        expect(cells.at(2).text()).to.equal(c.source);
        expect(parseInt(cells.at(3).text(), 10)).to.equal(c.weight);
      });
    });
  });
});