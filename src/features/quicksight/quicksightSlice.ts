import { api } from "../api/apiSlice";
import { QuickSightEmbeddedURLData } from "../../interfaces";

export const quicksightApi = api.injectEndpoints({
  endpoints: (build) => ({
    /** Fetch a Quicksight embed URL. Pass the fully-constructed URL including
     *  any `?libraryUuids=...` query string. */
    getQuicksightEmbedUrl: build.query<QuickSightEmbeddedURLData, string>({
      query: (url) => url,
    }),
  }),
});
