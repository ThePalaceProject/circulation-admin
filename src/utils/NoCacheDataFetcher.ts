import DataFetcher from "@thepalaceproject/web-opds-client/lib/DataFetcher";

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
