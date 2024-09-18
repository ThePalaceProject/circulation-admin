import { useAppAdmin, useAppFeatureFlags } from "../context/appContext";

// Not all methods taking this type will use the specified properties.
// The type is here to ensure that the call site provides the right
// properties, in case the rules change in the future.
type HasLibraryKeyProps = {
  library: string; // library "key" or "short name"
  [key: string]: unknown;
};

// If the `quicksightOnlyForSysadmins` feature flag is set, only system
// admins should see the QuickSight link.
export const useMaySeeQuickSightLink = (_: HasLibraryKeyProps): boolean => {
  const admin = useAppAdmin();
  const onlyForSysAdmins = useAppFeatureFlags().quicksightOnlyForSysadmins;
  return !onlyForSysAdmins || admin.isSystemAdmin();
};

// If the `reportsOnlyForSysadmins` feature flag is set, only system admins
// may request inventory reports.
export const useMayRequestInventoryReports = (
  _: HasLibraryKeyProps
): boolean => {
  const admin = useAppAdmin();
  const onlyForSysAdmins = useAppFeatureFlags().reportsOnlyForSysadmins;
  return !onlyForSysAdmins || admin.isSystemAdmin();
};

// Only system admins may view the collection statistics barchart.
export const useMayViewCollectionBarChart = (
  _: HasLibraryKeyProps
): boolean => {
  const admin = useAppAdmin();
  return admin.isSystemAdmin();
};
