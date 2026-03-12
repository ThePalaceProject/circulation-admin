import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "", credentials: "same-origin" }),
  tagTypes: [
    "Libraries",
    "Collections",
    "IndividualAdmins",
    "PatronAuthServices",
    "MetadataServices",
    "CatalogServices",
    "DiscoveryServices",
    "DiscoveryServiceLibraryRegistrations",
    "SitewideAnnouncements",
    "Complaints",
    "Classifications",
    "Lanes",
  ],
  endpoints: () => ({}),
});
