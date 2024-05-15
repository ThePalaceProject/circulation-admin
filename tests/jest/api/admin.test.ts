import {
  defaultBaseEndpointUrl,
  getInventoryReportInfo,
  requestInventoryReport,
} from "../../../src/api/admin";
import * as fetchMock from "fetch-mock-jest";

const sampleInfoResponseData = { collections: [] };
const sampleGenerateResponseData = { message: "some message" };

const testAlternateBaseUrl = "/test/base/url";
const libraryKey = "short-name";

const testEndpoints = ({
  title,
  baseEndpointUrl: baseEndpointUrl = undefined,
  expectedUrl = defaultBaseEndpointUrl,
}) => {
  describe(title, () => {
    beforeEach(() => {
      fetchMock
        .get("*", { body: sampleInfoResponseData, status: 200 })
        .post("*", { body: sampleGenerateResponseData, status: 202 });
    });

    afterEach(() => {
      fetchMock.mockReset();
    });

    it("requests inventory report information", async () => {
      const response = await getInventoryReportInfo({
        library: libraryKey,
        baseEndpointUrl,
      });
      expect(response).toStrictEqual(sampleInfoResponseData);
      expect(fetchMock).toHaveBeenCalledWith(expectedUrl);
    });

    it("requests report generation via a post to the endpoint", async () => {
      const response = await requestInventoryReport({
        library: libraryKey,
        baseEndpointUrl,
      });
      expect(response).toStrictEqual(sampleGenerateResponseData);
      expect(fetchMock).toHaveBeenCalledWith(expectedUrl, { method: "POST" });
    });
  });
};

describe("Inventory report API", () => {
  testEndpoints({
    title: "default endpoints",
    expectedUrl: `${defaultBaseEndpointUrl}/${libraryKey}`,
  });
  testEndpoints({
    title: "alternative test endpoints",
    baseEndpointUrl: testAlternateBaseUrl,
    expectedUrl: `${testAlternateBaseUrl}/${libraryKey}`,
  });
});
