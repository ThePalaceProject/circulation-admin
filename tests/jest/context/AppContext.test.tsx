import { renderHook } from "@testing-library/react-hooks";
import {
  useAppAdmin,
  useAppContext,
  useAppEmail,
  useAppFeatureFlags,
  useCsrfToken,
  useTermsOfService,
  useSupportContact,
  SupportContactLink,
} from "../../../src/context/appContext";
import { componentWithProviders } from "../testUtils/withProviders";
import {
  AdminRoleData,
  ConfigurationSettings,
  FeatureFlags,
} from "../../../src/interfaces";

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
  const expectedRoles: AdminRoleData[] = [{ role: "system" }];
  const expectedTermsOfService = {
    text: "Terms of Service",
    href: "/terms-of-service",
  };
  const emailAddress = "helpdesk@example.com";
  const expectedSupportContact: SupportContactLink = {
    href: `mailto:${emailAddress}?subject=Support+request`,
    text: `Email ${emailAddress}.`,
  };

  const appConfigSettings: Partial<ConfigurationSettings> = {
    csrfToken: expectedCsrfToken,
    featureFlags: expectedFeatureFlags,
    roles: expectedRoles,
    email: expectedEmail,
    tos_link_text: expectedTermsOfService.text,
    tos_link_href: expectedTermsOfService.href,
    support_contact_url: "deprecated and should be overridden",
    supportContactUrl: expectedSupportContact.href,
  };
  const wrapper = componentWithProviders({ appConfigSettings });

  it("provides useAppContext context hook", () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    const value = result.current;
    expect(value.csrfToken).toEqual(expectedCsrfToken);
    expect(value.admin.email).toEqual(expectedEmail);
    expect(value.admin.roles).toEqual(expectedRoles);
    expect(value.featureFlags).toEqual(expectedFeatureFlags);
    expect(value.supportContact).toEqual(expectedSupportContact);
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
  it("provides useSupportContact context hook", () => {
    const { result } = renderHook(() => useSupportContact(), {
      wrapper,
    });
    const supportContact = result.current;
    expect(supportContact).toBeDefined();
    const { href, text } = supportContact;
    expect(href).toEqual(expectedSupportContact.href);
    expect(text).toEqual(expectedSupportContact.text);
  });
});
