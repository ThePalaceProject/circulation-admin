import * as React from "react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { QueryClient } from "@tanstack/react-query";
import { renderWithProviders } from "../testUtils/withProviders";
import DebugAuthentication from "../../../src/components/DebugAuthentication";
import {
  AuthMethodsResponse,
  PatronDebugResponse,
} from "../../../src/api/patronDebug";
import { waitFor, fireEvent } from "@testing-library/react";

const LIBRARY = "test-library";
const SECOND_LIBRARY = "another-library";
const AUTH_METHODS_PATH = `/${LIBRARY}/admin/manage_patrons/auth_methods`;
const DEBUG_AUTH_PATH = `/${LIBRARY}/admin/manage_patrons/debug_auth`;
const SECOND_AUTH_METHODS_PATH = `/${SECOND_LIBRARY}/admin/manage_patrons/auth_methods`;

const MOCK_AUTH_METHODS: AuthMethodsResponse = {
  authMethods: [
    {
      id: 1,
      name: "Test SIP2",
      protocol: "api.sip",
      supportsDebug: true,
      supportsPassword: true,
      identifierLabel: "Barcode",
      passwordLabel: "PIN",
    },
    {
      id: 2,
      name: "SAML Provider",
      protocol: "api.saml.provider",
      supportsDebug: false,
      supportsPassword: false,
      identifierLabel: "Username",
      passwordLabel: "Password",
    },
  ],
};

const MOCK_DEBUG_RESULTS: PatronDebugResponse = {
  results: [
    { label: "Server-Side Validation", success: true, details: "ok" },
    {
      label: "SIP2 Connection",
      success: true,
      details: "sip.example.com:6001",
    },
    {
      label: "Password Validation",
      success: false,
      details: "valid_patron_password=N",
    },
  ],
};

describe("DebugAuthentication", () => {
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

  const server = setupServer(
    http.get(AUTH_METHODS_PATH, () =>
      HttpResponse.json(MOCK_AUTH_METHODS, { status: 200 })
    ),
    http.post(DEBUG_AUTH_PATH, () =>
      HttpResponse.json(MOCK_DEBUG_RESULTS, { status: 200 })
    )
  );

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
  });
  afterAll(() => server.close());

  const renderComponent = () => {
    return renderWithProviders(
      <DebugAuthentication library={LIBRARY} csrfToken="test-csrf-token" />,
      { queryClient }
    );
  };

  it("displays loading state initially", () => {
    const { getByText } = renderComponent();
    expect(getByText("Loading authentication methods...")).toBeInTheDocument();
  });

  it("renders auth method dropdown after loading", async () => {
    const { getByLabelText, getByText } = renderComponent();
    await waitFor(() => {
      expect(getByLabelText("Authentication Method")).toBeInTheDocument();
    });
    expect(getByText("Test SIP2 (api.sip)")).toBeInTheDocument();
    expect(getByText("SAML Provider (api.saml.provider)")).toBeInTheDocument();
  });

  it("shows 'not supported' message for non-debug methods", async () => {
    const { getByLabelText, getByText } = renderComponent();
    await waitFor(() => {
      expect(getByLabelText("Authentication Method")).toBeInTheDocument();
    });

    fireEvent.change(getByLabelText("Authentication Method"), {
      target: { value: "2" },
    });

    expect(
      getByText(
        "Debug authentication is not supported for this authentication method."
      )
    ).toBeInTheDocument();
  });

  it("shows form fields for debug-capable method", async () => {
    const { getByLabelText, getByText } = renderComponent();
    await waitFor(() => {
      expect(getByLabelText("Authentication Method")).toBeInTheDocument();
    });

    fireEvent.change(getByLabelText("Authentication Method"), {
      target: { value: "1" },
    });

    // Should show fields with the method's labels
    expect(getByLabelText("Barcode")).toBeInTheDocument();
    expect(getByLabelText("PIN")).toBeInTheDocument();
    expect(getByText("Run Debug")).toBeInTheDocument();
  });

  it("runs debug and displays results", async () => {
    const { getByLabelText, getByText } = renderComponent();
    await waitFor(() => {
      expect(getByLabelText("Authentication Method")).toBeInTheDocument();
    });

    // Select the SIP2 method
    fireEvent.change(getByLabelText("Authentication Method"), {
      target: { value: "1" },
    });

    // Fill in the form
    fireEvent.change(getByLabelText("Barcode"), {
      target: { value: "12345" },
    });
    fireEvent.change(getByLabelText("PIN"), {
      target: { value: "1111" },
    });

    // Submit
    fireEvent.click(getByText("Run Debug"));

    // Wait for results
    await waitFor(() => {
      expect(getByText("Server-Side Validation")).toBeInTheDocument();
    });
    expect(getByText("SIP2 Connection")).toBeInTheDocument();
    expect(getByText("Password Validation")).toBeInTheDocument();
  });

  it("auto-selects and hides dropdown when there is only one method", async () => {
    const singleMethod: AuthMethodsResponse = {
      authMethods: [MOCK_AUTH_METHODS.authMethods[0]],
    };
    server.use(
      http.get(AUTH_METHODS_PATH, () =>
        HttpResponse.json(singleMethod, { status: 200 })
      )
    );

    const { getByLabelText, queryByLabelText } = renderComponent();

    // The form fields should appear automatically without selecting a method.
    await waitFor(() => {
      expect(getByLabelText("Barcode")).toBeInTheDocument();
    });
    expect(getByLabelText("PIN")).toBeInTheDocument();

    // The dropdown should not be rendered.
    expect(queryByLabelText("Authentication Method")).not.toBeInTheDocument();
  });

  it("reconciles selected method when switching to a different library", async () => {
    const singleMethodForSecondLibrary: AuthMethodsResponse = {
      authMethods: [
        {
          id: 99,
          name: "Second Library API",
          protocol: "api.second",
          supportsDebug: true,
          supportsPassword: false,
          identifierLabel: "Email",
          passwordLabel: "Password",
        },
      ],
    };

    server.use(
      http.get(SECOND_AUTH_METHODS_PATH, () =>
        HttpResponse.json(singleMethodForSecondLibrary, { status: 200 })
      )
    );

    const {
      getByLabelText,
      queryByLabelText,
      rerender,
    } = renderWithProviders(
      <DebugAuthentication library={LIBRARY} csrfToken="test-csrf-token" />,
      { queryClient }
    );

    await waitFor(() => {
      expect(getByLabelText("Authentication Method")).toBeInTheDocument();
    });

    fireEvent.change(getByLabelText("Authentication Method"), {
      target: { value: "1" },
    });
    expect(getByLabelText("Barcode")).toBeInTheDocument();

    rerender(
      <DebugAuthentication
        library={SECOND_LIBRARY}
        csrfToken="test-csrf-token"
      />
    );

    await waitFor(() => {
      expect(getByLabelText("Email")).toBeInTheDocument();
    });
    expect(queryByLabelText("Authentication Method")).not.toBeInTheDocument();
  });

  it("shows warning when library has no auth methods", async () => {
    server.use(
      http.get(AUTH_METHODS_PATH, () =>
        HttpResponse.json({ authMethods: [] }, { status: 200 })
      )
    );

    const { getByText, queryByLabelText } = renderComponent();
    await waitFor(() => {
      expect(
        getByText(
          "This library has no patron authentication integrations configured."
        )
      ).toBeInTheDocument();
    });
    expect(queryByLabelText("Authentication Method")).not.toBeInTheDocument();
  });

  it("handles API error on fetching auth methods", async () => {
    server.use(
      http.get(AUTH_METHODS_PATH, () => new HttpResponse(null, { status: 500 }))
    );

    const { getByText } = renderComponent();
    await waitFor(
      () => {
        expect(
          getByText(/Error loading authentication methods/)
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
