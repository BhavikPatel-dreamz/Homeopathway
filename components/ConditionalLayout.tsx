import { headers } from 'next/headers';
import Header from '@/components/Header';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import { isPageCheckerSSR } from '@/lib/userUtils';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default async function ConditionalLayout({ children }: ConditionalLayoutProps) {
  // Get the current pathname from headers
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-url') || '';
  // Check if current page is an auth page
  const isAuthPage = isPageCheckerSSR(pathname, ['/login', '/register', '/forgot-password','/admin']);
  return (
    <div className="min-h-screen bg-[#2C3E3E]">
      <ScrollToTop />
      {!isAuthPage && <Header />}
      {children}
      {!isAuthPage && <Footer />}
    </div>
  );
}