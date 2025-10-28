import RegisterForm from '../../../components/RegisterForm';
import { redirect } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'Register',
};

export default async function RegisterPage() {
  // Check if user is already logged in
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Look for Supabase auth cookies
  const hasAuthCookie = allCookies.some(cookie => 
    cookie.name.includes('sb-') && cookie.name.includes('auth-token')
  );

  if (hasAuthCookie) {
    // Try to get user session
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
  }

  return (
    <main className="p-8">
      <RegisterForm />
    </main>
  );
}
