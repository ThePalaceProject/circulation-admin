import { renderHook } from "@testing-library/react-hooks";
import { componentWithProviders } from "../testUtils/withProviders";
import { ContextProviderProps } from "../../../src/components/ContextProvider";
import { ConfigurationSettings, FeatureFlags } from "../../../src/interfaces";
import {
  useMayRequestInventoryReports,
  useMayViewCollectionBarChart,
} from "../../../src/businessRules/roleBasedAccess";

const setupWrapper = ({
  roles,
  featureFlags,
}: Partial<ConfigurationSettings>) => {
  const contextProviderProps: ContextProviderProps = {
    featureFlags,
    roles,
    email: "email",
    csrfToken: "token",
  };
  return componentWithProviders({ contextProviderProps });
};

describe("Business rules for role-based access", () => {
  const libraryMatch = "match";
  const libraryMismatch = "mismatch";

  describe("controls access to inventory reports", () => {
    const testAccess = (
      expectedResult: boolean,
      config: Partial<ConfigurationSettings>
    ) => {
      const wrapper = setupWrapper(config);
      const { result } = renderHook(
        () => useMayRequestInventoryReports({ library: libraryMatch }),
        { wrapper }
      );
      expect(result.current).toBe(expectedResult);
    };

    it("restricts access to only sysadmins, if the restriction feature flag is true", () => {
      const featureFlags: FeatureFlags = { reportsOnlyForSysadmins: true };

      testAccess(true, { roles: [{ role: "system" }], featureFlags });

      testAccess(false, { roles: [{ role: "manager-all" }], featureFlags });
      testAccess(false, { roles: [{ role: "librarian-all" }], featureFlags });

      testAccess(false, {
        roles: [{ role: "manager", library: libraryMatch }],
        featureFlags,
      });
      testAccess(false, {
        roles: [{ role: "manager", library: libraryMismatch }],
        featureFlags,
      });
      testAccess(false, {
        roles: [{ role: "librarian", library: libraryMatch }],
        featureFlags,
      });
      testAccess(false, {
        roles: [{ role: "librarian", library: libraryMismatch }],
        featureFlags,
      });
    });

    it("allows all users, if the restriction feature flag is is false", () => {
      const featureFlags: FeatureFlags = { reportsOnlyForSysadmins: false };

      testAccess(true, { roles: [{ role: "system" }], featureFlags });

      testAccess(true, { roles: [{ role: "manager-all" }], featureFlags });
      testAccess(true, { roles: [{ role: "librarian-all" }], featureFlags });

      testAccess(true, {
        roles: [{ role: "manager", library: libraryMatch }],
        featureFlags,
      });
      testAccess(true, {
        roles: [{ role: "manager", library: libraryMismatch }],
        featureFlags,
      });
      testAccess(true, {
        roles: [{ role: "librarian", library: libraryMatch }],
        featureFlags,
      });
      testAccess(true, {
        roles: [{ role: "librarian", library: libraryMismatch }],
        featureFlags,
      });
    });

    it("allows all users, if the restriction feature flag is not set", () => {
      const featureFlags: FeatureFlags = {};

      testAccess(true, { roles: [{ role: "system" }], featureFlags });

      testAccess(true, { roles: [{ role: "manager-all" }], featureFlags });
      testAccess(true, { roles: [{ role: "librarian-all" }], featureFlags });

      testAccess(true, {
        roles: [{ role: "manager", library: libraryMatch }],
        featureFlags,
      });
      testAccess(true, {
        roles: [{ role: "manager", library: libraryMismatch }],
        featureFlags,
      });
      testAccess(true, {
        roles: [{ role: "librarian", library: libraryMatch }],
        featureFlags,
      });
      testAccess(true, {
        roles: [{ role: "librarian", library: libraryMismatch }],
        featureFlags,
      });
    });
  });

  describe("controls access to the collection statistics barchart", () => {
    const testAccess = (
      expectedResult: boolean,
      config: Partial<ConfigurationSettings>
    ) => {
      const wrapper = setupWrapper(config);
      const { result } = renderHook(
        () => useMayViewCollectionBarChart({ library: libraryMatch }),
        { wrapper }
      );
      expect(result.current).toBe(expectedResult);
    };

    it("restricts access to sysadmins", () => {
      const featureFlags: FeatureFlags = {};

      testAccess(true, { roles: [{ role: "system" }], featureFlags });

      testAccess(false, { roles: [{ role: "manager-all" }], featureFlags });
      testAccess(false, { roles: [{ role: "librarian-all" }], featureFlags });

      testAccess(false, {
        roles: [{ role: "manager", library: libraryMatch }],
        featureFlags,
      });
      testAccess(false, {
        roles: [{ role: "manager", library: libraryMismatch }],
        featureFlags,
      });
      testAccess(false, {
        roles: [{ role: "librarian", library: libraryMatch }],
        featureFlags,
      });
      testAccess(false, {
        roles: [{ role: "librarian", library: libraryMismatch }],
        featureFlags,
      });
    });
  });
});
