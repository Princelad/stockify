
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { ProductTable } from '@/components/dashboard/ProductTable';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection="Inventory" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <SummaryCards />
              {/* Inventory Overview Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6 min-h-[260px]">
                <div className="font-semibold mb-2">Inventory Overview</div>
                <div className="flex gap-4 mb-4">
                  <button className="px-3 py-1 rounded bg-blue-50 text-blue-700 font-medium">Last 7 Days</button>
                  <button className="px-3 py-1 rounded hover:bg-gray-100">Last 30 Days</button>
                  <button className="px-3 py-1 rounded hover:bg-gray-100">Last Year</button>
                </div>
                <div className="h-40 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <div>Chart Coming Soon</div>
                    <div className="text-xs text-gray-400">Analytics visualization will be implemented here</div>
                  </div>
                </div>
              </div>
            </div>
            <LowStockAlert />
          </div>
          
          {/* Product Table */}
          <ProductTable />
        </main>
      </div>
    </div>
  );
}
