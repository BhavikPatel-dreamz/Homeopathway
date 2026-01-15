import LoginForm from '../../../components/LoginForm';
import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Access Your HomeoPathway Account',
  description: 'Sign in to your HomeoPathway account to access personalized remedy recommendations, save your favorite treatments, and manage your health profile.',
  keywords: [
    'login',
    'sign in',
    'homeopathway account',
    'user account',
    'access account',
    'member login'
  ],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Login - Access Your HomeoPathway Account',
    description: 'Sign in to access personalized homeopathic remedy recommendations and manage your health profile.',
    url: '/login',
  },
};

export default async function LoginPage() {
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

    if (profile?.role === 'admin' || profile?.role === 'moderator') {
      redirect('/admin');
    } else {
      redirect('/');
    }
  }

  return (
    <main >
      <LoginForm />
    </main>
  );
}
