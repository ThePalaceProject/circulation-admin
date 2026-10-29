import {
  DEFAULT_BASE_ENDPOINT_URL,
  getInventoryReportInfo,
  requestInventoryReport,
} from "../../../src/api/admin";
import { http, HttpResponse } from "msw";
import { setupMswServer } from "../testUtils/mswServer";

const sampleInfoResponseData = { collections: [] };
const sampleGenerateResponseData = { message: "some message" };

const testAlternateBaseUrl = "/test/base/url";
const libraryKey = "short-name";

const testEndpoints = ({
  title,
  baseEndpointUrl: baseEndpointUrl = undefined,
  expectedUrl = DEFAULT_BASE_ENDPOINT_URL,
}) => {
  describe(title, () => {
    const { requests } = setupMswServer(
      http.get(expectedUrl, () => HttpResponse.json(sampleInfoResponseData)),
      http.post(expectedUrl, () =>
        HttpResponse.json(sampleGenerateResponseData, { status: 202 })
      )
    );

    it("requests inventory report information", async () => {
      const response = await getInventoryReportInfo({
        library: libraryKey,
        baseEndpointUrl,
      });
      // `toEqual`, not `toStrictEqual`: the parsed body comes from Node's
      // fetch, in a different realm, so its prototype is not the test's.
      expect(response).toEqual(sampleInfoResponseData);
      expect(requests).toHaveLength(1);
      expect(new URL(requests[0].url).pathname).toBe(expectedUrl);
      expect(requests[0].method).toBe("GET");
    });

    it("requests report generation via a post to the endpoint", async () => {
      const response = await requestInventoryReport({
        library: libraryKey,
        baseEndpointUrl,
      });
      expect(response).toEqual(sampleGenerateResponseData);
      expect(requests).toHaveLength(1);
      expect(new URL(requests[0].url).pathname).toBe(expectedUrl);
      expect(requests[0].method).toBe("POST");
    });
  });
};

describe("Inventory report API", () => {
  testEndpoints({
    title: "default endpoints",
    expectedUrl: `${DEFAULT_BASE_ENDPOINT_URL}/${libraryKey}`,
  });
  testEndpoints({
    title: "alternative test endpoints",
    baseEndpointUrl: testAlternateBaseUrl,
    expectedUrl: `${testAlternateBaseUrl}/${libraryKey}`,
  });
});
