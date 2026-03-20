import * as React from "react";
import { CollectionInventory, InventoryStatistics } from "../../interfaces";
import { inventoryKeyToLabelMap } from "./LibraryStats";
import { formatNumber } from "../../utils/sharedFunctions";

const inventoryColumns: Array<keyof InventoryStatistics> = [
  "titles",
  "availableTitles",
  "licensedTitles",
  "meteredLicenseTitles",
  "unlimitedLicenseTitles",
  "openAccessTitles",
  "meteredLicensesOwned",
  "meteredLicensesAvailable",
  "selfHostedTitles",
];

type Props = {
  collections: CollectionInventory[];
};

const sortByName = (a: CollectionInventory, b: CollectionInventory) =>
  a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;

const StatsCollectionsTable = ({ collections }: Props) => {
  const sortedCollections = [...collections].sort(sortByName);

  return (
    <div className="collections-table-wrapper">
      <table className="collections-inventory-table">
        <thead>
          <tr>
            <th scope="col">Collection</th>
            {inventoryColumns.map((column) => (
              <th scope="col" key={column}>
                {inventoryKeyToLabelMap[column]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedCollections.map(({ id, name, inventory }) => (
            <tr key={id}>
              <th scope="row">{name}</th>
              {inventoryColumns.map((column) => (
                <td key={column}>{formatNumber(inventory[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsCollectionsTable;
