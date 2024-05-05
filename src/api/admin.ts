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

const defaultBaseInformationEndpointUrl = "/admin/reports/inventory_report";
const defaultBaseGenerateEndpointUrl =
  "/admin/reports/generate_inventory_report";

export const getInventoryReportInfo = async ({
  library,
  baseEndpointUrl = defaultBaseInformationEndpointUrl,
}: InventoryReportRequestParams): Promise<InventoryReportInfo> => {
  const endpointUrl = `${baseEndpointUrl}/${library}`;
  const res = await fetch(endpointUrl);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}: GET ${res.url}`);
  }
  return res.json();
};

export const requestInventoryReport = async ({
  library,
  baseEndpointUrl = defaultBaseGenerateEndpointUrl,
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
