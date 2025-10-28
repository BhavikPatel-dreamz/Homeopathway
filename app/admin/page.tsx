import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin - Homeopathway',
};

export default async function AdminPage() {
  // Redirect to dashboard
  redirect('/admin/dashboard');
}
