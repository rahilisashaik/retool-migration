export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Internal Engineering Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Unified platform for KYC, Refunds, and Feature Flags
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">KYC Review Queue</h3>
              <p className="text-gray-600">Manage customer identity verification cases</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Refunds Dashboard</h3>
              <p className="text-gray-600">Process and track refund requests</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Feature Flags</h3>
              <p className="text-gray-600">Manage feature rollouts and experiments</p>
            </div>
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">API Endpoints</h2>
            <div className="bg-white p-6 rounded-lg shadow text-left">
              <ul className="space-y-2">
                <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/kyc</code> - List KYC cases</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/kyc/[id]</code> - Get KYC case details</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/kyc/[id]/transition</code> - Update KYC status</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/refunds</code> - List refund requests</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/refunds/[id]</code> - Get refund details</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/refunds/[id]/transition</code> - Update refund status</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/feature-flags</code> - List feature flags</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/feature-flags</code> - Create feature flag</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/audit</code> - Get audit log</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
