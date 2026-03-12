import { api } from "../api/apiSlice";
import {
  LibrariesData,
  CollectionsData,
  IndividualAdminsData,
  PatronAuthServicesData,
  MetadataServicesData,
  CatalogServicesData,
  DiscoveryServicesData,
  SitewideAnnouncementsData,
  LibraryRegistrationsData,
} from "../../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { RootState } from "../../store";

// ---------------------------------------------------------------------------
// Shared arg types
// ---------------------------------------------------------------------------

type EditArg = { data: FormData; csrfToken?: string };
type DeleteArg = { identifier: string | number; csrfToken?: string };

// ---------------------------------------------------------------------------
// RTK Query endpoints
// ---------------------------------------------------------------------------

/**
 * RTK Query endpoints for all config-service domains:
 * Libraries, Collections, IndividualAdmins, PatronAuthServices,
 * MetadataServices, CatalogServices, DiscoveryServices,
 * DiscoveryServiceLibraryRegistrations, and SitewideAnnouncements.
 *
 * These replace ten legacy FetchEditReducer / RegisterLibraryReducer-based
 * reducers and the corresponding ActionCreator thunks.
 */
export const configServicesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ----- Libraries -------------------------------------------------------
    getLibraries: builder.query<LibrariesData, void>({
      query: () => "/admin/libraries",
      providesTags: ["Libraries"],
    }),
    editLibrary: builder.mutation<string, EditArg>({
      query: ({ data, csrfToken }) => ({
        url: "/admin/libraries",
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        body: data,
        responseHandler: "text",
      }),
      invalidatesTags: ["Libraries"],
    }),
    deleteLibrary: builder.mutation<string, DeleteArg>({
      query: ({ identifier, csrfToken }) => ({
        url: `/admin/library/${identifier}`,
        method: "DELETE",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        responseHandler: "text",
      }),
      invalidatesTags: ["Libraries"],
    }),

    // ----- Collections -----------------------------------------------------
    getCollections: builder.query<CollectionsData, void>({
      query: () => "/admin/collections",
      providesTags: ["Collections"],
    }),
    editCollection: builder.mutation<string, EditArg>({
      query: ({ data, csrfToken }) => ({
        url: "/admin/collections",
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        body: data,
        responseHandler: "text",
      }),
      invalidatesTags: ["Collections"],
    }),
    deleteCollection: builder.mutation<string, DeleteArg>({
      query: ({ identifier, csrfToken }) => ({
        url: `/admin/collection/${identifier}`,
        method: "DELETE",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        responseHandler: "text",
      }),
      invalidatesTags: ["Collections"],
    }),
    importCollection: builder.mutation<
      string,
      { collectionId: string | number; force: boolean; csrfToken?: string }
    >({
      query: ({ collectionId, force, csrfToken }) => {
        const body = new FormData();
        body.append("force", String(force));
        return {
          url: `/admin/collection/${collectionId}/import`,
          method: "POST",
          headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
          body,
          responseHandler: "text",
        };
      },
      invalidatesTags: ["Collections"],
    }),

    // ----- Individual Admins -----------------------------------------------
    getIndividualAdmins: builder.query<IndividualAdminsData, void>({
      query: () => "/admin/individual_admins",
      providesTags: ["IndividualAdmins"],
    }),
    editIndividualAdmin: builder.mutation<string, EditArg>({
      query: ({ data, csrfToken }) => ({
        url: "/admin/individual_admins",
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        body: data,
        responseHandler: "text",
      }),
      invalidatesTags: ["IndividualAdmins"],
    }),
    deleteIndividualAdmin: builder.mutation<string, DeleteArg>({
      query: ({ identifier, csrfToken }) => ({
        url: `/admin/individual_admin/${identifier}`,
        method: "DELETE",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        responseHandler: "text",
      }),
      invalidatesTags: ["IndividualAdmins"],
    }),

    // ----- Patron Auth Services --------------------------------------------
    getPatronAuthServices: builder.query<PatronAuthServicesData, void>({
      query: () => "/admin/patron_auth_services",
      providesTags: ["PatronAuthServices"],
    }),
    editPatronAuthService: builder.mutation<string, EditArg>({
      query: ({ data, csrfToken }) => ({
        url: "/admin/patron_auth_services",
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        body: data,
        responseHandler: "text",
      }),
      invalidatesTags: ["PatronAuthServices"],
    }),
    deletePatronAuthService: builder.mutation<string, DeleteArg>({
      query: ({ identifier, csrfToken }) => ({
        url: `/admin/patron_auth_service/${identifier}`,
        method: "DELETE",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        responseHandler: "text",
      }),
      invalidatesTags: ["PatronAuthServices"],
    }),

    // ----- Metadata Services -----------------------------------------------
    getMetadataServices: builder.query<MetadataServicesData, void>({
      query: () => "/admin/metadata_services",
      providesTags: ["MetadataServices"],
    }),
    editMetadataService: builder.mutation<string, EditArg>({
      query: ({ data, csrfToken }) => ({
        url: "/admin/metadata_services",
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        body: data,
        responseHandler: "text",
      }),
      invalidatesTags: ["MetadataServices"],
    }),
    deleteMetadataService: builder.mutation<string, DeleteArg>({
      query: ({ identifier, csrfToken }) => ({
        url: `/admin/metadata_service/${identifier}`,
        method: "DELETE",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        responseHandler: "text",
      }),
      invalidatesTags: ["MetadataServices"],
    }),

    // ----- Catalog Services ------------------------------------------------
    getCatalogServices: builder.query<CatalogServicesData, void>({
      query: () => "/admin/catalog_services",
      providesTags: ["CatalogServices"],
    }),
    editCatalogService: builder.mutation<string, EditArg>({
      query: ({ data, csrfToken }) => ({
        url: "/admin/catalog_services",
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        body: data,
        responseHandler: "text",
      }),
      invalidatesTags: ["CatalogServices"],
    }),
    deleteCatalogService: builder.mutation<string, DeleteArg>({
      query: ({ identifier, csrfToken }) => ({
        url: `/admin/catalog_service/${identifier}`,
        method: "DELETE",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        responseHandler: "text",
      }),
      invalidatesTags: ["CatalogServices"],
    }),

    // ----- Discovery Services ----------------------------------------------
    getDiscoveryServices: builder.query<DiscoveryServicesData, void>({
      query: () => "/admin/discovery_services",
      providesTags: ["DiscoveryServices"],
    }),
    editDiscoveryService: builder.mutation<string, EditArg>({
      query: ({ data, csrfToken }) => ({
        url: "/admin/discovery_services",
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        body: data,
        responseHandler: "text",
      }),
      invalidatesTags: ["DiscoveryServices"],
    }),
    deleteDiscoveryService: builder.mutation<string, DeleteArg>({
      query: ({ identifier, csrfToken }) => ({
        url: `/admin/discovery_service/${identifier}`,
        method: "DELETE",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        responseHandler: "text",
      }),
      invalidatesTags: ["DiscoveryServices"],
    }),
    registerLibraryWithDiscoveryService: builder.mutation<string, EditArg>({
      query: ({ data, csrfToken }) => ({
        url: "/admin/discovery_service_library_registrations",
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        body: data,
        responseHandler: "text",
      }),
      invalidatesTags: ["DiscoveryServiceLibraryRegistrations"],
    }),
    getDiscoveryServiceLibraryRegistrations: builder.query<
      LibraryRegistrationsData,
      void
    >({
      query: () => "/admin/discovery_service_library_registrations",
      providesTags: ["DiscoveryServiceLibraryRegistrations"],
    }),

    // ----- Sitewide Announcements ------------------------------------------
    getSitewideAnnouncements: builder.query<SitewideAnnouncementsData, void>({
      query: () => "/admin/announcements",
      providesTags: ["SitewideAnnouncements"],
    }),
    editSitewideAnnouncements: builder.mutation<string, EditArg>({
      query: ({ data, csrfToken }) => ({
        url: "/admin/announcements",
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        body: data,
        responseHandler: "text",
      }),
      invalidatesTags: ["SitewideAnnouncements"],
    }),
  }),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Return true if an RTK Query selector result is in a loading/fetching state.
 * The uninitialized state does not expose `isFetching`, so we use `isLoading`
 * as the fallback which covers the initial request-in-flight case.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isResultFetching(result: any): boolean {
  return !!(result?.isFetching || result?.isLoading);
}

/**
 * Convert an RTK Query FetchBaseQueryError (or SerializedError) to the
 * FetchErrorData shape expected by ErrorMessage and the EditableConfigList
 * base class.
 *
 * When `responseHandler: "text"` is used, a non-2xx response produces:
 *   `{ status: number, data: string }` (FetchBaseQueryError)
 * A network-level failure produces:
 *   `{ status: "FETCH_ERROR", error: string }`
 */
export function rtkErrorToFetchError(error: unknown): FetchErrorData | null {
  if (!error) return null;
  const e = error as Record<string, unknown>;
  if (typeof e["status"] === "number") {
    return {
      status: e["status"] as number,
      response: String(e["data"] ?? ""),
      url: "",
    };
  }
  return {
    status: 0,
    response: String(e["error"] ?? e["message"] ?? "Unknown error"),
    url: "",
  };
}

/**
 * Return the most recently started mutation entry for the given endpoint name,
 * or null if none exists.
 *
 * This is used in `mapStateToProps` to surface `responseBody` (the text reply
 * from a successful POST) and `formError` (the error from a failed POST) without
 * adding per-component mutation-state tracking.
 *
 * Lifecycle equivalence with the old createFetchEditReducer:
 *   pending   → both responseBody and formError are null (edit in progress)
 *   fulfilled → responseBody = response text, formError = null
 *   rejected  → formError = error, responseBody = null
 *   (no mutations yet) → both null (same as initial reducer state)
 */
export function getLastMutation(
  state: RootState,
  endpointName: string
): Record<string, unknown> | null {
  const mutations = (state as Record<string, unknown>)[api.reducerPath] as
    | Record<string, Record<string, unknown>>
    | undefined;
  if (!mutations?.mutations) return null;
  const matches = Object.values(mutations.mutations).filter(
    (m) => (m as Record<string, unknown>)["endpointName"] === endpointName
  ) as Array<Record<string, unknown>>;
  if (!matches.length) return null;
  return matches.sort(
    (a, b) =>
      ((b["startedTimeStamp"] as number) ?? 0) -
      ((a["startedTimeStamp"] as number) ?? 0)
  )[0];
}

// ---------------------------------------------------------------------------
// Hook exports (for future functional-component usage)
// ---------------------------------------------------------------------------

export const {
  useGetLibrariesQuery,
  useEditLibraryMutation,
  useDeleteLibraryMutation,
  useGetCollectionsQuery,
  useEditCollectionMutation,
  useDeleteCollectionMutation,
  useImportCollectionMutation,
  useGetIndividualAdminsQuery,
  useEditIndividualAdminMutation,
  useDeleteIndividualAdminMutation,
  useGetPatronAuthServicesQuery,
  useEditPatronAuthServiceMutation,
  useDeletePatronAuthServiceMutation,
  useGetMetadataServicesQuery,
  useEditMetadataServiceMutation,
  useDeleteMetadataServiceMutation,
  useGetCatalogServicesQuery,
  useEditCatalogServiceMutation,
  useDeleteCatalogServiceMutation,
  useGetDiscoveryServicesQuery,
  useEditDiscoveryServiceMutation,
  useDeleteDiscoveryServiceMutation,
  useRegisterLibraryWithDiscoveryServiceMutation,
  useGetDiscoveryServiceLibraryRegistrationsQuery,
  useGetSitewideAnnouncementsQuery,
  useEditSitewideAnnouncementsMutation,
} = configServicesApi;
