import * as React from "react";
import { act, renderHook } from "@testing-library/react-hooks";
// import renderWithProviders from "../testUtils/renderWithProviders";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { setupServer } from "msw/node";
// import { rest } from "msw";
import {
  useGenerateReport,
  useReportInfo,
} from "../../../src/components/InventoryReportRequestModal";
import * as AdminAPI from "../../../src/api/admin";
// import { getInventoryReportInfo } from "../../../src/api/admin";

// Mock inventory apis to ensure that we're calling them appropriately
// - Ensure that information query occurs only once.
// - Ensure that info query failure results in default message.
// - Ensure that info query displays default until it is updated by the successful server response.
//
const infoPayloadSuccessObject = {
  collections: [{ id: 0, name: "Collection A" }],
};
const generateReportSuccessObject = {
  message: "We triggered report generation.",
};
const apiEndpointParams = { library: "library-short-name" };

// const server = setupServer(
//   rest.get("*/admin/reports/inventory_report/:library_short_name", async (req, res, ctx) => {
//     console.log("rest: get", req.url);
//     return res(
//       ctx.status(200),
//       ctx.json(infoPayloadSuccessObject),
//     );
//   }),
//   rest.post("*/admin/reports/generate_inventory_report/:library_short_name", async (req, res, ctx) => {
//     console.log("rest: post", req.url);
//     return res(
//       ctx.status(202),
//       ctx.json(generateReportSuccessObject),
//     );
//   }),
//   rest.all("*", async (req, res, ctx) => {
//     console.log("rest: all", req.url);
//   }),
// );

describe("InventoryReportRequestModal", () => {
  // beforeAll(() => {
  //   server.listen();
  // });
  //
  // afterAll(() => {
  //   server.close();
  // });

  describe("query hooks call correct api methods", () => {
    /* eslint-disable @typescript-eslint/no-empty-function */
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
      logger: {
        log: console.log,
        warn: console.warn,
        error: process.env.NODE_ENV === "test" ? () => {} : console.error,
      },
    });
    /* eslint-enable @typescript-eslint/no-empty-function */
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    describe("get report information", () => {
      const mock_info_api = jest.spyOn(AdminAPI, "getInventoryReportInfo");

      afterEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
      });

      it("report info query hook performs fetch, when enabled", async () => {
        const show = true;

        mock_info_api.mockResolvedValue(infoPayloadSuccessObject);
        const { result, waitFor } = renderHook(
          () => useReportInfo(show, apiEndpointParams),
          { wrapper }
        );
        await waitFor(() => result.current.fetchStatus == "idle");
        const { isSuccess, isError, error, collections } = result.current;

        expect(mock_info_api).toHaveBeenCalledWith(apiEndpointParams);

        expect(isSuccess).toBe(true);
        expect(isError).toBe(false);
        expect(error).toBeNull();
        expect(collections).toEqual(infoPayloadSuccessObject.collections);
      });

      it("report info query hook doesn't fetch, when disabled", async () => {
        const show = false;

        mock_info_api.mockResolvedValue(infoPayloadSuccessObject);
        const { result, waitFor } = renderHook(
          () => useReportInfo(show, apiEndpointParams),
          { wrapper }
        );
        await waitFor(() => result.current.fetchStatus == "idle");
        const { isSuccess, isError, error, collections } = result.current;

        expect(mock_info_api).not.toHaveBeenCalled();
        expect(isSuccess).toBe(false);
        expect(isError).toBe(false);
        expect(error).toBeNull();
        expect(collections).toEqual([]);
      });

      it("report info query hook returns no collections, when api throws error", async () => {
        const show = true;

        mock_info_api.mockImplementation(() => {
          throw new Error("an error occurred");
        });
        const { result, waitFor } = renderHook(
          () => useReportInfo(show, apiEndpointParams),
          { wrapper }
        );
        await waitFor(() => result.current.fetchStatus == "idle");
        const { isSuccess, isError, error, collections } = result.current;

        expect(mock_info_api).toHaveBeenCalledWith(apiEndpointParams);
        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
        expect((error as Error).message).toEqual("an error occurred");
        expect(collections).toEqual([]);
      });
    });

    describe("generate report", () => {
      const mock_generate_api = jest.spyOn(AdminAPI, "requestInventoryReport");

      const setResponseMessage = jest.fn();
      const setShowConfirmationModal = jest.fn();
      const setShowResponseModal = jest.fn();

      afterEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
      });

      it("handles api success", async () => {
        mock_generate_api.mockResolvedValue(generateReportSuccessObject);
        const { result, waitFor } = renderHook(
          () => {
            const reportGenerator = useGenerateReport({
              ...apiEndpointParams,
              setResponseMessage,
              setShowResponseModal,
              setShowConfirmationModal,
            });
            return { reportGenerator };
          },
          { wrapper }
        );

        expect(result.current.reportGenerator.isIdle).toBe(true);
        expect(mock_generate_api).not.toHaveBeenCalled();
        expect(setResponseMessage).not.toHaveBeenCalled();
        expect(setShowResponseModal).not.toHaveBeenCalled();
        expect(setShowConfirmationModal).not.toHaveBeenCalled();

        act(() => result.current.reportGenerator.mutate());
        await waitFor(
          () =>
            result.current.reportGenerator.isSuccess ||
            result.current.reportGenerator.isError
        );
        const { isSuccess, isError, error } = result.current.reportGenerator;

        expect(mock_generate_api).toHaveBeenCalledWith(apiEndpointParams);

        expect(isSuccess).toBe(true);
        expect(isError).toBe(false);
        expect(error).toBeNull();
        expect(setResponseMessage).toHaveBeenCalledWith(
          `✅ ${generateReportSuccessObject.message}`
        );
        expect(setShowResponseModal).toHaveBeenCalledWith(true);
        expect(setShowConfirmationModal).toHaveBeenCalledWith(false);
      });

      it("handles api success", async () => {
        mock_generate_api.mockImplementation(() => {
          throw new Error("an error occurred");
        });
        const { result, waitFor } = renderHook(
          () => {
            const reportGenerator = useGenerateReport({
              ...apiEndpointParams,
              setResponseMessage,
              setShowResponseModal,
              setShowConfirmationModal,
            });
            return { reportGenerator };
          },
          { wrapper }
        );

        expect(result.current.reportGenerator.isIdle).toBe(true);
        expect(mock_generate_api).not.toHaveBeenCalled();
        expect(setResponseMessage).not.toHaveBeenCalled();
        expect(setShowResponseModal).not.toHaveBeenCalled();
        expect(setShowConfirmationModal).not.toHaveBeenCalled();

        act(() => result.current.reportGenerator.mutate());
        await waitFor(
          () =>
            result.current.reportGenerator.isSuccess ||
            result.current.reportGenerator.isError
        );
        const { isSuccess, isError, error } = result.current.reportGenerator;

        expect(mock_generate_api).toHaveBeenCalledWith(apiEndpointParams);

        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
        expect(error).not.toBeNull();
        expect(setResponseMessage).toHaveBeenCalledWith(`❌ an error occurred`);
        expect(setShowResponseModal).toHaveBeenCalledWith(true);
        expect(setShowConfirmationModal).toHaveBeenCalledWith(false);
      });
    });
  });
});
