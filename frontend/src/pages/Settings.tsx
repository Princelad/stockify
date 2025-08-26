import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';

export default function Settings() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection="Settings" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600">Settings page is under construction...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
