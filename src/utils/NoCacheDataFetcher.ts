import DataFetcher from "@thepalaceproject/web-opds-client/lib/DataFetcher";

/**
 * A specialized DataFetcher that prevents caching of HTTP requests.
 *
 * This class extends the base DataFetcher and overrides the fetch method to add
 * no-cache headers and set the cache option to "no-cache". This ensures that
 * all requests made using this fetcher will not be cached.
 *
 * We use this to make sure that admin users always see the latest data when
 * they are making changes to the system.
 */
export default class NoCacheDataFetcher extends DataFetcher {
  fetch(
    url: string,
    { headers = {}, ...otherOptions }: RequestInit = {}
  ): Promise<Response> {
    const customizedHeaders = Object.assign(
      { "Cache-Control": "no-cache" },
      headers
    );
    return super.fetch(url, {
      headers: customizedHeaders,
      cache: "no-cache",
      ...otherOptions,
    });
  }
}
