"use client";

import Link from "next/link";
import { getDashboardCounts } from "@/lib/review"

interface DashboardHomeProps {
  remediesCount?: number;
  ailmentsCount?: number;
  usersCount?: number;
  averageRating?: number;
}

export default function DashboardHome({
  remediesCount = 0, ailmentsCount = 0, usersCount = 0, averageRating = 0
}: DashboardHomeProps) {
  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <img src="/top-remedies.svg" alt="" />
            </div>
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <div className="text-2xl font-normal text-gray-900">{remediesCount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Remedies</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <img src="/ailments-icon.svg" alt="" />
            </div>
            <span className="text-xs text-gray-500">Categories</span>
          </div>
          <div className="text-2xl font-normal text-gray-900">{ailmentsCount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Ailments</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-xs text-gray-500">Total Users</span>
          </div>
          <div className="text-2xl font-normal text-gray-900">{usersCount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Users</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <span className="text-xs text-gray-500">Average</span>
          </div>
          <div className="text-2xl font-normal text-gray-900">{averageRating}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/ailments/add"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <img className="text-3xl mb-3" src="/ailments-icon.svg" alt="" />
          <h3 className="text-lg font-normal mb-1">Add Ailment</h3>
          <p className="text-sm text-blue-100">Create a new ailment category</p>
        </Link>

        <Link
          href="/admin/remedies/add"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <img className="text-3xl mb-3" src="/top-remedies.svg" alt="" />
          <h3 className="text-lg font-normal mb-1">Add Remedy</h3>
          <p className="text-sm text-green-100">Add a new homeopathic remedy</p>
        </Link>

        <Link
          href="/admin/users"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">👥</div>
          <h3 className="text-lg font-normal mb-1">Manage Users</h3>
          <p className="text-sm text-purple-100">View and manage user accounts</p>
        </Link>
      </div>
    </div>
  );
}
