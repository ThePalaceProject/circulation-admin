import DataFetcher, {
  DataFetcherConfig,
} from "@thepalaceproject/web-opds-client/lib/DataFetcher";

export interface CustomHeaderDataFetcherConfig extends DataFetcherConfig {
  extraHeaders?: Record<string, string>;
}

export default class CustomHeaderDataFetcher extends DataFetcher {
  private readonly extraHeaders: Record<string, string>;

  constructor({
    extraHeaders = {},
    ...dataFetcherConfig
  }: CustomHeaderDataFetcherConfig = {}) {
    super(dataFetcherConfig);
    this.extraHeaders = extraHeaders;
  }

  fetch(url: string, { headers = {}, ...restOptions } = {}) {
    const customizedHeaders = Object.assign({}, this.extraHeaders, headers);
    return super.fetch(url, { headers: customizedHeaders, ...restOptions });
  }
}
