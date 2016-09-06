import { expect } from "chai";
import { stub } from "sinon";

import createRouter from "../createRouter";

describe("createRouter", () => {
  describe("resulting router", () => {
    let navigate, router;

    beforeEach(() => {
      navigate = stub();
      router = createRouter(navigate);
    });

    it("handles location object", () => {
      router.push({
        pathname: "/path?collection=testcollection&book=testbook"
      });

      expect(navigate.callCount).to.equal(1);
      expect(navigate.args[0][0]).to.equal("testcollection");
      expect(navigate.args[0][1]).to.equal("testbook");
    });

    it("handles location string", () => {
      router.push("/path?collection=testcollection&book=testbook");

      expect(navigate.callCount).to.equal(1);
      expect(navigate.args[0][0]).to.equal("testcollection");
      expect(navigate.args[0][1]).to.equal("testbook");
    });
  });
});