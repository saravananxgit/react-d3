import type {
  Campaign,
  RevenuePoint,
  SalesItem,
  TrafficItem,
  TreeNodeData,
} from "../models/charts";

import monthlyRevenueJson from "./monthlyRevenue.json";
import salesByCategoryJson from "./salesByCategory.json";
import trafficSourcesJson from "./trafficSources.json";
import companyStructureJson from "./companyStructure.json";
import campaignsJson from "./campaigns.json";

export const monthlyRevenue: RevenuePoint[] = monthlyRevenueJson;
export const salesByCategory: SalesItem[] = salesByCategoryJson;
export const trafficSources: TrafficItem[] = trafficSourcesJson;
export const companyStructure: TreeNodeData = companyStructureJson;
export const campaigns: Campaign[] = campaignsJson;
