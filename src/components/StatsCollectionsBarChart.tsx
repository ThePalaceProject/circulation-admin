import * as React from "react";
import { useDashboardCollectionsBarChartSettings } from "../context/appContext";
import { CollectionInventory } from "../interfaces";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { inventoryKeyToLabelMap } from "./LibraryStats";
import { formatNumber } from "../utils/sharedFunctions";

const stackId = "collections";
const barSize = 50;
const meteredColor = "#606060";
const unlimitedColor = "#404040";
const openAccessColor = "#202020";

type Props = {
  collections: CollectionInventory[];
  ResponsiveContainer?: any;
};

const StatsCollectionsBarChart = ({ collections }: Props) => {
  const chartItems = collections
    ?.map(({ name, inventory, inventoryByMedium }) => ({
      name,
      ...inventory,
      _by_medium: inventoryByMedium || {},
    }))
    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
  const chartWidth = useDashboardCollectionsBarChartSettings()?.width || "100%";

  return (
    <ResponsiveContainer
      height={chartItems.length * 100 + 75}
      width={chartWidth}
    >
      <BarChart
        data={chartItems}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 10, bottom: 50 }}
      >
        <YAxis
          type="category"
          dataKey="name"
          interval={0}
          tick={{ dx: -5 }}
          padding={{ top: 0, bottom: 0 }}
          height={175}
          width={125}
        />
        <XAxis type="number" />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          stackId={stackId}
          name={inventoryKeyToLabelMap.meteredLicenseTitles}
          dataKey={"meteredLicenseTitles"}
          barSize={barSize}
          fill={meteredColor}
        />
        <Bar
          stackId={stackId}
          name={inventoryKeyToLabelMap.unlimitedLicenseTitles}
          dataKey={"unlimitedLicenseTitles"}
          barSize={barSize}
          fill={unlimitedColor}
        />
        <Bar
          stackId={stackId}
          name={inventoryKeyToLabelMap.openAccessTitles}
          dataKey={"openAccessTitles"}
          barSize={barSize}
          fill={openAccessColor}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

type OneLevelStatistics = { [key: string]: number };
type TwoLevelStatistics = { [key: string]: OneLevelStatistics };
type chartTooltipData = {
  dataKey: string;
  name?: string;
  value: number | string;
  color?: string;
  perMedium?: OneLevelStatistics;
};

/* Customize the Rechart tooltip to provide additional information */
export const CustomTooltip = ({
  active,
  payload,
  label: collectionName,
}: TooltipProps<ValueType, string>) => {
  if (!active) {
    return null;
  }

  // Nab inventory data from one of the chart payload objects. This
  // corresponds to the bar chart `data` element for the current collection.
  const chartItem = payload[0].payload;

  const propertyCountsByMedium = chartItem._by_medium || {};
  const mediumCountsByProperty: TwoLevelStatistics = Object.entries(
    propertyCountsByMedium
  ).reduce((acc, [key, value]) => {
    Object.entries(value).forEach(([innerKey, innerValue]) => {
      acc[innerKey] = acc[innerKey] || {};
      acc[innerKey][key] = innerValue;
    });
    return acc;
  }, {});
  const aboveTheLineColor = "#030303";
  const belowTheLineColor = "#A0A0A0";
  const aboveTheLine: chartTooltipData[] = [
    {
      dataKey: "titles",
      name: inventoryKeyToLabelMap.titles,
      value: chartItem.titles,
      perMedium: mediumCountsByProperty["titles"],
    },
    {
      dataKey: "availableTitles",
      name: inventoryKeyToLabelMap.availableTitles,
      value: chartItem.availableTitles,
      perMedium: mediumCountsByProperty["availableTitles"],
    },
    ...payload.filter(({ value }) => (value as number) > 0),
  ].map(({ dataKey, name, value }) => {
    const key = dataKey.toString();
    const perMedium = mediumCountsByProperty[key];
    return { dataKey: key, name, value, color: aboveTheLineColor, perMedium };
  });
  const aboveTheLineKeys = [
    "name",
    ...aboveTheLine.map(({ dataKey }) => dataKey),
  ];
  const belowTheLine = Object.entries(chartItem)
    .filter(([key]) => !aboveTheLineKeys.includes(key))
    .filter(([key]) => !key.startsWith("_"))
    .map(([dataKey, value]) => {
      const key = dataKey.toString();
      const perMedium = mediumCountsByProperty[key];
      return {
        dataKey: key,
        name: inventoryKeyToLabelMap[key],
        value:
          typeof value === "number"
            ? value
            : typeof value === "string"
            ? value
            : "",
        color: belowTheLineColor,
        perMedium,
      };
    });

  // Render our custom tooltip.
  return (
    <div className="customTooltip">
      <div className="customTooltipDetail">
        <h1 className="customTooltipHeading">{collectionName}</h1>
        {renderChartTooltipPayload(aboveTheLine)}
        <hr style={{ margin: "0.5em 0.5em" }} />
        {renderChartTooltipPayload(belowTheLine)}
      </div>
    </div>
  );
};

const renderChartTooltipPayload = (payload: Partial<chartTooltipData>[]) => {
  return payload.map(
    ({ dataKey = "", name = "", value = "", color, perMedium = {} }) => (
      <p key={dataKey} style={{ color }} className="customTooltipItem">
        {!!name && <span>{name}:</span>}
        <span> {formatNumber(value)}</span>
        {perMediumBreakdown(perMedium)}
      </p>
    )
  );
};

const perMediumBreakdown = (perMedium: OneLevelStatistics) => {
  const perMediumLabels = Object.entries(perMedium)
    .filter(([, count]) => count > 0)
    .map(([medium, count]) => `${medium}: ${formatNumber(count)}`);
  return (
    !!perMediumLabels.length && (
      <span className="customTooltipMediumBreakdown">
        {` (${perMediumLabels.join(", ")})`}
      </span>
    )
  );
};

export default StatsCollectionsBarChart;
