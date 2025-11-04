"use client";

export default function DashboardHome() {
  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💊</span>
            </div>
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">245</div>
          <div className="text-sm text-gray-600">Remedies</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🤒</span>
            </div>
            <span className="text-xs text-gray-500">Categories</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">48</div>
          <div className="text-sm text-gray-600">Ailments</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">1,234</div>
          <div className="text-sm text-gray-600">Users</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <span className="text-xs text-gray-500">Average</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">4.8</div>
          <div className="text-sm text-gray-600">Rating</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { icon: '💊', text: 'New remedy "Arnica Montana" added', time: '2 hours ago' },
            { icon: '✏️', text: 'Ailment "Headache" updated', time: '5 hours ago' },
            { icon: '⭐', text: 'New review for "Belladonna"', time: '1 day ago' },
            { icon: '👤', text: 'New user registered', time: '2 days ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="text-2xl">{activity.icon}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          href="/admin/ailments/add"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">🤒</div>
          <h3 className="text-lg font-semibold mb-1">Add Ailment</h3>
          <p className="text-sm text-blue-100">Create a new ailment category</p>
        </a>

        <a
          href="/admin/remedies/add"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">💊</div>
          <h3 className="text-lg font-semibold mb-1">Add Remedy</h3>
          <p className="text-sm text-green-100">Add a new homeopathic remedy</p>
        </a>

        <a
          href="/admin/users"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">👥</div>
          <h3 className="text-lg font-semibold mb-1">Manage Users</h3>
          <p className="text-sm text-purple-100">View and manage user accounts</p>
        </a>
      </div>
    </div>
  );
}
