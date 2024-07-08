import { api } from "./apiSlice";

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLanguages: builder.query({
      query: (arg: void) => "/admin/languages",
    }),
    getMedia: builder.query({
      query: (arg: void) => "/admin/media",
    }),
    getRoles: builder.query({
      query: (arg: void) => "/admin/roles",
    }),
  }),
});
