import { FeatureFlags } from "../interfaces";

/**
 * Apply default values to each of the feature flags that we know about.
 */
export const featureFlagsWithDefaults = ({
  enableAutoList = true,
  ...rest
}: Partial<FeatureFlags> = {}): FeatureFlags => ({
  enableAutoList,
  ...rest,
});
