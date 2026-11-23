import ChartCard from "./components/ChartCard";
import BarChart from "./components/charts/BarChart";
import DonutChart from "./components/charts/DonutChart";
import LineChart from "./components/charts/LineChart";
import ScatterPlot from "./components/charts/ScatterPlot";
import TidyTree from "./components/charts/TidyTree";
import {
  campaigns,
  companyStructure,
  monthlyRevenue,
  salesByCategory,
  trafficSources,
} from "./data";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold">Business Dashboard</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2">
        <ChartCard title="Monthly revenue">
          <LineChart data={monthlyRevenue} />
        </ChartCard>

        <ChartCard title="Website traffic sources">
          <DonutChart data={trafficSources} />
        </ChartCard>

        <ChartCard title="Sales by product category" className="lg:col-span-2">
          <BarChart data={salesByCategory} />
        </ChartCard>

        <ChartCard title="Company structure">
          <TidyTree data={companyStructure} />
        </ChartCard>

        <ChartCard title="Advertising spend vs revenue">
          <ScatterPlot data={campaigns} />
        </ChartCard>
      </main>
    </div>
  );
}
