import RegisterForm from '../../../components/RegisterForm';
import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';

export const metadata = {
  title: 'Register',
};

export default async function RegisterPage() {
  // Check if user is already logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is logged in, check their role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      redirect('/admin/dashboard');
    } else {
      redirect('/');
    }
  }

  return (
    <main className="p-8">
      <RegisterForm />
    </main>
  );
}
