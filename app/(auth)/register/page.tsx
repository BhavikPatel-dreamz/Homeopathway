import RegisterForm from '../../../components/RegisterForm';
import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Join the Homeopathway Community',
  description: 'Create your free Homeopathway account to access personalized homeopathic remedy recommendations, save favorites, write reviews, and connect with our wellness community.',
  keywords: [
    'register',
    'sign up',
    'create account',
    'join homeopathway',
    'free account',
    'homeopathy community',
    'wellness account'
  ],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Register - Join the Homeopathway Community',
    description: 'Create your free account to access personalized homeopathic recommendations and join our wellness community.',
    url: '/register',
  },
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
    <main >
      <RegisterForm />
    </main>
  );
}
