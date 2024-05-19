// Inventory Report API
export type InventoryReportCollectionInfo = {
  id: number;
  name: string;
};
export type InventoryReportInfo = {
  collections: InventoryReportCollectionInfo[];
};
export type InventoryReportRequestResponse = {
  message: string;
};
export type InventoryReportRequestParams = {
  library: string;
  baseEndpointUrl?: string;
};

export const DEFAULT_BASE_ENDPOINT_URL = "/admin/reports/inventory_report";

/**
 * Get information about the inventory report that would be generated for the
 * given library, if requested.
 *
 * @param library -- the library for which the report information is requested.
 * @param baseEndpointUrl -- an optional baseURL (for testing). If not provided,
 *  the `defaultBaseEndpointUrl` will be used.
 * @returns an object converted from the information JSON response, if successful.
 * @throws an error, if the request is not successful.
 */
export const getInventoryReportInfo = async ({
  library,
  baseEndpointUrl = DEFAULT_BASE_ENDPOINT_URL,
}: InventoryReportRequestParams): Promise<InventoryReportInfo> => {
  const endpointUrl = `${baseEndpointUrl}/${library}`;
  const res = await fetch(endpointUrl);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}: GET ${res.url}`);
  }
  return res.json();
};

/**
 * Request an inventory report for the given library.
 *
 * @param library -- the library for which the report information is requested.
 * @param baseEndpointUrl -- an optional baseURL (for testing). If not provided,
 *  the `defaultBaseEndpointUrl` will be used.
 * @returns an object converted from the message JSON response, if successful.
 * @throws an error, if the request is not successful.
 */
export const requestInventoryReport = async ({
  library,
  baseEndpointUrl = DEFAULT_BASE_ENDPOINT_URL,
}: InventoryReportRequestParams): Promise<InventoryReportRequestResponse> => {
  const endpointUrl = `${baseEndpointUrl}/${library}`;
  const res = await fetch(endpointUrl, { method: "POST" });
  if (!res.ok) {
    throw new Error(
      `Request failed with status ${res.status}: POST ${res.url}`
    );
  }
  return res.json();
};
