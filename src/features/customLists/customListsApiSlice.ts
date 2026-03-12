import { api } from "../api/apiSlice";
import { CustomListsData } from "../../interfaces";

export const customListsApi = api.injectEndpoints({
  endpoints: (build) => ({
    /** Fetch all custom lists for a library. */
    getCustomLists: build.query<CustomListsData, string>({
      query: (library) => `/${library}/admin/custom_lists`,
      providesTags: (_r, _e, library) => [{ type: "CustomLists", id: library }],
    }),

    /** Fetch the custom lists a specific book belongs to.
     *  Pass the fully-qualified book lists URL. */
    getCustomListsForBook: build.query<CustomListsData, string>({
      query: (url) => url,
      providesTags: (_r, _e, url) => [{ type: "CustomListsForBook", id: url }],
    }),

    /** Add / remove a book from custom lists. */
    editCustomListsForBook: build.mutation<
      void,
      { url: string; data: FormData }
    >({
      query: ({ url, data }) => ({
        url,
        method: "POST",
        body: data,
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { url }) => [
        { type: "CustomListsForBook", id: url },
      ],
    }),
  }),
});
