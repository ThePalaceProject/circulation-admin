import { api } from "../api/apiSlice";
import {
  RolesData,
  MediaData,
  LanguagesData,
  RightsStatusData,
} from "../../interfaces";

/**
 * RTK Query endpoints for static reference data that is fetched once and
 * cached for the lifetime of the session: roles, media types, language codes,
 * and rights statuses.
 *
 * These replace four legacy FetchEditReducer-based reducers
 * (roles, media, languages, rightsStatuses) and the corresponding
 * ActionCreator thunks (fetchRoles, fetchMedia, fetchLanguages,
 * fetchRightsStatuses).
 */
export const referenceDataApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<RolesData, void>({
      query: () => "/admin/roles",
    }),
    getMedia: builder.query<MediaData, void>({
      query: () => "/admin/media",
    }),
    getLanguages: builder.query<LanguagesData, void>({
      query: () => "/admin/languages",
    }),
    getRightsStatuses: builder.query<RightsStatusData, void>({
      query: () => "/admin/rights_status",
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetMediaQuery,
  useGetLanguagesQuery,
  useGetRightsStatusesQuery,
} = referenceDataApi;
