import { getDashboardCounts } from '@/lib/review';
import DashboardHome from '../../components/admin/DashboardHome';

export const metadata = {
  title: 'Admin Dashboard - HomeoPathway',
};

export default async function AdminDashboardPage() {
  const { data: counts, error } = await getDashboardCounts();

  if (error) {
    console.error("Failed to fetch dashboard counts:", error);
    // You could return an error component here
  }

  return <DashboardHome
    remediesCount={counts?.totalRemedies}
    ailmentsCount={counts?.totalAilment || 0}
    usersCount={counts?.totalUsers}
    averageRating={counts?.totalReviews}
  />;
}
