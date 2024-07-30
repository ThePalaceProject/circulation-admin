import { api } from "../api/apiSlice";
import { StatisticsData } from "../../interfaces";
import { normalizeStatistics } from "./normalizeStatistics";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

export const STATS_API_ENDPOINT = "/admin/stats";

export const statsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<StatisticsData, void>({
      query: (arg: void) => STATS_API_ENDPOINT,
      transformResponse: (responseBody: StatisticsData) =>
        normalizeStatistics(responseBody),
      transformErrorResponse: (
        responseBody,
        { request, response }
      ): FetchErrorData => {
        return {
          url: request.url,
          status: response.status,
          response: response.statusText,
        };
      },
    }),
  }),
});

export const { useGetStatsQuery } = statsApi;
