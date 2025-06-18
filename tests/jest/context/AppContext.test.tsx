import { renderHook } from "@testing-library/react-hooks";
import {
  useAppAdmin,
  useAppContext,
  useAppEmail,
  useAppFeatureFlags,
  useCsrfToken,
  useTermsOfService,
} from "../../../src/context/appContext";
import { componentWithProviders } from "../testUtils/withProviders";
import { ContextProviderProps } from "../../../src/components/ContextProvider";
import { FeatureFlags } from "../../../src/interfaces";

// TODO: These tests may need to be adjusted in the future.
//  Currently, an AppContext.Provider is injected into the component tree
//  by the ContextProvider, which itself uses a legacy context API. (See
//    https://legacy.reactjs.org/docs/legacy-context.html)
//  but that will change once uses of that API have been removed.

describe("AppContext", () => {
  const expectedCsrfToken = "token";
  const expectedEmail = "email";
  const expectedFeatureFlags: FeatureFlags = {
    // @ts-expect-error - "testTrue" & "testFalse" aren't valid feature flags
    testTrue: true,
    testFalse: false,
  };
  const expectedRoles = [{ role: "system" }];
  const expectedTermsOfService = {
    text: "Terms of Service",
    href: "/terms-of-service",
  };

  const contextProviderProps: ContextProviderProps = {
    csrfToken: expectedCsrfToken,
    featureFlags: expectedFeatureFlags,
    roles: expectedRoles,
    email: expectedEmail,
    tos_link_text: expectedTermsOfService.text,
    tos_link_href: expectedTermsOfService.href,
  };
  const wrapper = componentWithProviders({ contextProviderProps });

  it("provides useAppContext context hook", () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    const value = result.current;
    expect(value.csrfToken).toEqual(expectedCsrfToken);
    expect(value.admin.email).toEqual(expectedEmail);
    expect(value.admin.roles).toEqual(expectedRoles);
    expect(value.featureFlags).toEqual(expectedFeatureFlags);
  });

  it("provides useAppAdmin context hook", () => {
    const { result } = renderHook(() => useAppAdmin(), { wrapper });
    const admin = result.current;
    expect(admin.email).toEqual(expectedEmail);
    expect(admin.roles).toEqual(expectedRoles);
  });

  it("provides useAppEmail context hook", () => {
    const { result } = renderHook(() => useAppEmail(), { wrapper });
    const email = result.current;
    expect(email).toEqual(expectedEmail);
  });

  it("provides useCsrfToken context hook", () => {
    const { result } = renderHook(() => useCsrfToken(), { wrapper });
    const token = result.current;
    expect(token).toEqual(expectedCsrfToken);
  });

  it("provides useAppFeatureFlags context hook", () => {
    const { result } = renderHook(() => useAppFeatureFlags(), {
      wrapper,
    });
    const flags = result.current;
    expect(flags).toEqual(expectedFeatureFlags);
  });

  it("provides useTermsOfService context hook", () => {
    const { result } = renderHook(() => useTermsOfService(), {
      wrapper,
    });
    const tosLink = result.current;
    const { text, href } = tosLink;
    expect(tosLink).toEqual(expectedTermsOfService);
    expect(text).toEqual(expectedTermsOfService.text);
    expect(href).toEqual(expectedTermsOfService.href);
  });
});
