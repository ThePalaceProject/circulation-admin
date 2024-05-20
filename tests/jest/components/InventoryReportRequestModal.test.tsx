import * as React from "react";
import { act, renderHook } from "@testing-library/react-hooks";
import { within } from "@testing-library/react";
import {
  componentWithProviders,
  renderWithProviders,
} from "../testUtils/withProviders";
import { QueryClient } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { rest } from "msw";
import {
  ACK_RESPONSE_BUTTON_CONTENT,
  ACK_RESPONSE_HEADING,
  CANCEL_BUTTON_CONTENT,
  CONFIRM_BUTTON_CONTENT,
  CONFIRMATION_MODAL_HEADING,
  useGenerateReport,
  useReportInfo,
} from "../../../src/components/InventoryReportRequestModal";
import * as AdminAPI from "../../../src/api/admin";
import InventoryReportRequestModal, {
  NO_COLLECTIONS_MESSAGE,
  SOME_COLLECTIONS_MESSAGE,
  UNKNOWN_COLLECTIONS_MESSAGE,
  reportDestinationText,
} from "../../../src/components/InventoryReportRequestModal";
import userEvent from "@testing-library/user-event";
import { InventoryReportInfo } from "../../../src/api/admin";

const MODAL_HEADING_LEVEL = 4;
const COLLECTION_NAME = "Collection A";
const INFO_SUCCESS_SOME_COLLECTIONS: InventoryReportInfo = Object.freeze({
  collections: [{ id: 0, name: COLLECTION_NAME }],
});
const INFO_SUCCESS_NO_COLLECTIONS: InventoryReportInfo = Object.freeze({
  collections: [],
});
const GENERATE_REPORT_SUCCESS = {
  message: "We triggered report generation.",
};
const MOCK_SERVER_API_ENDPOINT_PATH =
  "/admin/reports/inventory_report/:library_short_name";
const API_ENDPOINT_PARAMS: AdminAPI.InventoryReportRequestParams = {
  library: "library-short-name",
};

const setupMockServer = () => {
  return setupServer(
    rest.get(MOCK_SERVER_API_ENDPOINT_PATH, async (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(INFO_SUCCESS_SOME_COLLECTIONS));
    }),
    rest.post(MOCK_SERVER_API_ENDPOINT_PATH, async (req, res, ctx) => {
      return res(ctx.status(202), ctx.json(GENERATE_REPORT_SUCCESS));
    })
  );
};

describe("InventoryReportRequestModal", () => {
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

  describe("query hooks call correct api methods", () => {
    const wrapper = componentWithProviders({ queryClient });

    describe("get report information", () => {
      const mock_info_api = jest.spyOn(AdminAPI, "getInventoryReportInfo");

      afterEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
      });
      afterAll(() => mock_info_api.mockRestore());

      it("report info query hook performs fetch, when enabled", async () => {
        const show = true;

        mock_info_api.mockResolvedValue(INFO_SUCCESS_SOME_COLLECTIONS);
        const { result, waitFor } = renderHook(
          () => useReportInfo(show, API_ENDPOINT_PARAMS),
          { wrapper }
        );
        await waitFor(() => result.current.fetchStatus == "idle");
        const { isSuccess, isError, error, collections } = result.current;

        expect(mock_info_api).toHaveBeenCalledWith(API_ENDPOINT_PARAMS);

        expect(isSuccess).toBe(true);
        expect(isError).toBe(false);
        expect(error).toBeNull();
        expect(collections).toEqual(INFO_SUCCESS_SOME_COLLECTIONS.collections);
      });

      it("report info query hook doesn't fetch, when disabled", async () => {
        const show = false;

        mock_info_api.mockResolvedValue(INFO_SUCCESS_SOME_COLLECTIONS);
        const { result, waitFor } = renderHook(
          () => useReportInfo(show, API_ENDPOINT_PARAMS),
          { wrapper }
        );
        await waitFor(() => result.current.fetchStatus == "idle");
        const { isSuccess, isError, error, collections } = result.current;

        expect(mock_info_api).not.toHaveBeenCalled();
        expect(isSuccess).toBe(false);
        expect(isError).toBe(false);
        expect(error).toBeNull();
        expect(collections).not.toBeDefined();
      });

      it("report info query hook returns no collections, when api throws error", async () => {
        const show = true;

        mock_info_api.mockImplementation(() => {
          throw new Error("an error occurred");
        });
        const { result, waitFor } = renderHook(
          () => useReportInfo(show, API_ENDPOINT_PARAMS),
          { wrapper }
        );
        await waitFor(() => result.current.fetchStatus == "idle");
        const { isSuccess, isError, error, collections } = result.current;

        expect(mock_info_api).toHaveBeenCalledWith(API_ENDPOINT_PARAMS);
        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
        expect((error as Error).message).toEqual("an error occurred");
        expect(collections).not.toBeDefined();
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
      afterAll(() => mock_generate_api.mockRestore());

      it("handles api success", async () => {
        mock_generate_api.mockResolvedValue(GENERATE_REPORT_SUCCESS);
        const { result, waitFor } = renderHook(
          () => {
            const reportGenerator = useGenerateReport({
              ...API_ENDPOINT_PARAMS,
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

        expect(mock_generate_api).toHaveBeenCalledWith(API_ENDPOINT_PARAMS);

        expect(isSuccess).toBe(true);
        expect(isError).toBe(false);
        expect(error).toBeNull();
        expect(setResponseMessage).toHaveBeenCalledWith(
          `✅ ${GENERATE_REPORT_SUCCESS.message}`
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
              ...API_ENDPOINT_PARAMS,
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

        expect(mock_generate_api).toHaveBeenCalledWith(API_ENDPOINT_PARAMS);

        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
        expect(error).not.toBeNull();
        expect(setResponseMessage).toHaveBeenCalledWith(`❌ an error occurred`);
        expect(setShowResponseModal).toHaveBeenCalledWith(true);
        expect(setShowConfirmationModal).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("mock server functionality", () => {
    const server = setupMockServer();
    beforeAll(() => server.listen());
    afterAll(() => server.close());
    afterEach(() => {
      server.resetHandlers();
      server.restoreHandlers();
    });

    it("returns the success value for successful report info (get) requests", async () => {
      const result = await AdminAPI.getInventoryReportInfo(API_ENDPOINT_PARAMS);
      expect(result).toEqual(INFO_SUCCESS_SOME_COLLECTIONS);
    });
    it("returns an error value for unsuccessful report info (get) requests", async () => {
      server.use(
        rest.get(MOCK_SERVER_API_ENDPOINT_PATH, (req, res, ctx) =>
          res(ctx.status(404))
        )
      );
      let error = undefined;
      try {
        await AdminAPI.getInventoryReportInfo(API_ENDPOINT_PARAMS);
      } catch (e) {
        error = await e;
      }
      expect(error?.message).toMatch("Request failed with status 404: GET ");
    });

    it("returns the expected value for generate report (post) requests", async () => {
      const result = await AdminAPI.requestInventoryReport(API_ENDPOINT_PARAMS);
      expect(result).toEqual(GENERATE_REPORT_SUCCESS);
    });
    it("returns an error value for unsuccessful generate report (post) requests", async () => {
      server.use(
        rest.post(MOCK_SERVER_API_ENDPOINT_PATH, (req, res, ctx) =>
          res(ctx.status(404))
        )
      );
      let error = undefined;
      try {
        await AdminAPI.requestInventoryReport(API_ENDPOINT_PARAMS);
      } catch (e) {
        error = await e;
      }
      expect(error?.message).toMatch("Request failed with status 404: POST ");
    });
  });

  describe("component rendering", () => {
    const onHide = jest.fn();
    const server = setupMockServer();

    beforeAll(() => server.listen());
    afterAll(() => server.close());
    afterEach(() => {
      server.resetHandlers();
      server.restoreHandlers();
      onHide.mockReset();
      queryClient.clear();
    });

    const LIBRARY = "library-short-name";
    const email = "librarian@example.com";
    const EMAIL_CONTEXT_PROVIDER_PROPS = { email };
    const NO_EMAIL_CONTEXT_PROVIDER_PROPS = { email: undefined };

    it("hides the modal when `show` is false", async () => {
      const {
        container,
        queryAllByRole,
      } = renderWithProviders(
        <InventoryReportRequestModal
          show={false}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient }
      );
      expect(container.querySelectorAll(".modal-content")).toHaveLength(0);
      expect(
        queryAllByRole("button", { name: CONFIRM_BUTTON_CONTENT })
      ).toHaveLength(0);
      expect(
        queryAllByRole("button", { name: CANCEL_BUTTON_CONTENT })
      ).toHaveLength(0);
    });

    it("displays the modal when `show` is true", async () => {
      const {
        container,
        getByRole,
      } = renderWithProviders(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient }
      );
      container.querySelector(".modal-content");
      const modalContent = getByRole("document");
      const heading = within(modalContent).getByRole("heading", {
        level: MODAL_HEADING_LEVEL,
      });
      expect(heading).toHaveTextContent(CONFIRMATION_MODAL_HEADING);
    });

    it("initially shows a request confirmation", () => {
      const {
        container,
        getByRole,
      } = renderWithProviders(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient }
      );
      container.querySelector(".modal-content");
      const modalContent = getByRole("document");
      const heading = within(modalContent).getByRole("heading", {
        level: MODAL_HEADING_LEVEL,
      });
      const modalBody = modalContent.querySelector(".modal-body");

      getByRole("button", { name: CONFIRM_BUTTON_CONTENT });
      getByRole("button", { name: CANCEL_BUTTON_CONTENT });

      expect(heading).toHaveTextContent(CONFIRMATION_MODAL_HEADING);
      expect(modalBody).toHaveTextContent("inventory report will be generated");
    });

    it("shows admin email, when present, in request confirmation", () => {
      let { getByRole } = renderWithProviders(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient, contextProviderProps: EMAIL_CONTEXT_PROVIDER_PROPS }
      );
      let modalBody = getByRole("document").querySelector(".modal-body");
      expect(modalBody).toHaveTextContent(
        "will be generated in the background and emailed to you at"
      );
      expect(modalBody).toHaveTextContent(email);

      ({ getByRole } = renderWithProviders(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient, contextProviderProps: NO_EMAIL_CONTEXT_PROVIDER_PROPS }
      ));
      modalBody = getByRole("document").querySelector(".modal-body");
      expect(modalBody).toHaveTextContent(
        "will be generated in the background and emailed to you"
      );
      expect(modalBody).not.toHaveTextContent(email);
    });

    it("clicking 'cancel' hides the component", async () => {
      const user = userEvent.setup();
      let show = true;
      onHide.mockImplementation(() => (show = false));

      const {
        container,
        getByRole,
        queryAllByRole,
        rerender,
      } = renderWithProviders(
        <InventoryReportRequestModal
          show={show}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient }
      );
      expect(show).toBe(true);
      expect(onHide).not.toHaveBeenCalled();

      const cancelButton = getByRole("button", { name: CANCEL_BUTTON_CONTENT });
      await user.click(cancelButton);

      // `onHide` was called and modal elements are gone on the next render.
      expect(onHide).toHaveBeenCalled();
      expect(show).toBe(false);

      rerender(
        <InventoryReportRequestModal
          show={show}
          onHide={onHide}
          library={LIBRARY}
        />
      );
      expect(container.querySelectorAll(".modal-content")).toHaveLength(0);
      expect(
        queryAllByRole("button", { name: CONFIRM_BUTTON_CONTENT })
      ).toHaveLength(0);
      expect(
        queryAllByRole("button", { name: CANCEL_BUTTON_CONTENT })
      ).toHaveLength(0);
    });

    it("updates confirmation message, if report info request arrives in time", async () => {
      const {
        getByRole,
        rerender,
      } = renderWithProviders(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient }
      );

      let modalBody = getByRole("document").querySelector(".modal-body");
      expect(modalBody).toHaveTextContent(UNKNOWN_COLLECTIONS_MESSAGE);
      expect(modalBody).not.toHaveTextContent(COLLECTION_NAME);

      await new Promise(process.nextTick);
      rerender(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />
      );

      modalBody = getByRole("document").querySelector(".modal-body");
      expect(modalBody).toHaveTextContent(SOME_COLLECTIONS_MESSAGE);
      expect(modalBody).toHaveTextContent(COLLECTION_NAME);
    });

    it("disables report generation, if info indicates no collections", async () => {
      server.use(
        rest.get(MOCK_SERVER_API_ENDPOINT_PATH, async (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(INFO_SUCCESS_NO_COLLECTIONS));
        })
      );

      const {
        getByRole,
        rerender,
      } = renderWithProviders(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient }
      );

      let modalBody = getByRole("document").querySelector(".modal-body");
      expect(modalBody).toHaveTextContent(UNKNOWN_COLLECTIONS_MESSAGE);
      expect(modalBody).not.toHaveTextContent(COLLECTION_NAME);

      let requestButton = getByRole("button", { name: CONFIRM_BUTTON_CONTENT });
      let cancelButton = getByRole("button", { name: CANCEL_BUTTON_CONTENT });
      expect(requestButton).toBeEnabled();
      expect(cancelButton).toBeEnabled();

      await new Promise(process.nextTick);
      rerender(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />
      );

      modalBody = getByRole("document").querySelector(".modal-body");
      expect(modalBody).toHaveTextContent(NO_COLLECTIONS_MESSAGE);
      expect(modalBody).not.toHaveTextContent(COLLECTION_NAME);

      requestButton = getByRole("button", { name: CONFIRM_BUTTON_CONTENT });
      cancelButton = getByRole("button", { name: CANCEL_BUTTON_CONTENT });
      expect(requestButton).not.toBeEnabled();
      expect(cancelButton).toBeEnabled();
    });

    it("displays minimal confirmation message, if report info request unsuccessful", async () => {
      server.use(
        rest.get(MOCK_SERVER_API_ENDPOINT_PATH, (req, res, ctx) =>
          res.once(ctx.status(404))
        )
      );

      const {
        getByRole,
        rerender,
      } = renderWithProviders(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient }
      );

      let modalBody = getByRole("document").querySelector(".modal-body");
      expect(modalBody).toHaveTextContent(UNKNOWN_COLLECTIONS_MESSAGE);
      expect(modalBody).not.toHaveTextContent(COLLECTION_NAME);

      await new Promise(process.nextTick);
      rerender(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />
      );

      modalBody = getByRole("document").querySelector(".modal-body");
      expect(modalBody).toHaveTextContent(UNKNOWN_COLLECTIONS_MESSAGE);
      expect(modalBody).not.toHaveTextContent(COLLECTION_NAME);
    });

    it("requests report generation, if request confirmed", async () => {
      const user = userEvent.setup();

      const {
        getByRole,
        rerender,
      } = renderWithProviders(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient }
      );

      const confirmationButton = getByRole("button", {
        name: CONFIRM_BUTTON_CONTENT,
      });
      let modalHeading = getByRole("heading", { level: MODAL_HEADING_LEVEL });
      expect(modalHeading).toHaveTextContent(CONFIRMATION_MODAL_HEADING);

      await user.click(confirmationButton);

      rerender(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />
      );

      getByRole("button", { name: ACK_RESPONSE_BUTTON_CONTENT });
      modalHeading = getByRole("heading", { level: MODAL_HEADING_LEVEL });
      expect(modalHeading).toHaveTextContent(ACK_RESPONSE_HEADING);
    });

    it("displays success message, when request is successful", async () => {
      const user = userEvent.setup();

      const {
        getByRole,
        rerender,
      } = renderWithProviders(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient }
      );

      const confirmationButton = getByRole("button", {
        name: CONFIRM_BUTTON_CONTENT,
      });
      await user.click(confirmationButton);

      rerender(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />
      );

      getByRole("button", { name: ACK_RESPONSE_BUTTON_CONTENT });
      const modalBody = getByRole("document").querySelector(".modal-body");
      expect(modalBody).toHaveTextContent(
        `✅ ${GENERATE_REPORT_SUCCESS.message}`
      );
    });

    it("displays error message, when request is unsuccessful", async () => {
      server.use(
        rest.post(MOCK_SERVER_API_ENDPOINT_PATH, (req, res, ctx) =>
          res(ctx.status(404))
        )
      );
      const user = userEvent.setup();

      const {
        getByRole,
        rerender,
      } = renderWithProviders(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />,
        { queryClient }
      );

      const confirmationButton = getByRole("button", {
        name: CONFIRM_BUTTON_CONTENT,
      });
      await user.click(confirmationButton);

      rerender(
        <InventoryReportRequestModal
          show={true}
          onHide={onHide}
          library={LIBRARY}
        />
      );

      getByRole("button", { name: ACK_RESPONSE_BUTTON_CONTENT });
      const modalBody = getByRole("document").querySelector(".modal-body");
      expect(modalBody).toHaveTextContent(
        "❌ Request failed with status 404: POST"
      );
    });
  });
});
