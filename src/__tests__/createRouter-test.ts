jest.autoMockOff();

import createRouter from "../createRouter";

describe("createRouter", () => {
  describe("resulting router", () => {
    let navigate, router;

    beforeEach(() => {
      navigate = jest.genMockFunction();
      router = createRouter(navigate);
    });

    it("handles location object", () => {
      router.push({
        pathname: "/path?collection=testcollection&book=testbook"
      });

      expect(navigate.mock.calls.length).toBe(1);
      expect(navigate.mock.calls[0][0]).toBe("testcollection");
      expect(navigate.mock.calls[0][1]).toBe("testbook");
      expect(navigate.mock.calls[0][2]).toBe(true)
    });

    it("handles location string", () => {
      router.push("/path?collection=testcollection&book=testbook");

      expect(navigate.mock.calls.length).toBe(1);
      expect(navigate.mock.calls[0][0]).toBe("testcollection");
      expect(navigate.mock.calls[0][1]).toBe("testbook");
      expect(navigate.mock.calls[0][2]).toBe(false)
    });
  });
});