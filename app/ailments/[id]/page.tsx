import Link from 'next/link';
import { notFound } from 'next/navigation';

// This would come from your database
async function getAilment(id: string) {
  // TODO: Replace with actual Supabase query
  const mockAilments: any = {
    '1': {
      id: '1',
      name: 'Headache',
      icon: '😣',
      description: 'Headaches are one of the most common ailments affecting people worldwide. In homeopathy, we understand that headaches can have various underlying causes, from stress and tension to hormonal changes, dietary triggers, or environmental factors. Rather than simply masking the pain, homeopathic remedies work to address the root cause and restore balance to your system.',
      additional_info: 'The beauty of homeopathic treatment lies in its individualized approach. Two people with headaches may receive completely different remedies based on their unique symptoms, triggers, and constitutional type. This personalized medicine has been helping people find natural relief for over 200 years.',
      total_remedies: 112,
      top_remedies: [
        {
          id: '1',
          name: 'Belladonna',
          rating: 5,
          reviews: 324,
          description: 'Best for sudden, intense, throbbing pain that comes on rapidly and is accompanied by...',
          icon: '💊'
        },
        {
          id: '2',
          name: 'Bryonia Alba',
          rating: 5,
          reviews: 234,
          description: 'Best for headaches that worsen with any movement, particularly when accompanied by...',
          icon: '💊'
        },
        {
          id: '3',
          name: 'Nux Vomica',
          rating: 5,
          reviews: 189,
          description: 'Ideal for stress-induced headaches, especially in individuals with a busy lifestyle who...',
          icon: '💊'
        },
        {
          id: '4',
          name: 'Gelsemium',
          rating: 4,
          reviews: 156,
          description: 'Best for dull, heavy headaches, particularly at the back of the head, often accompanied...',
          icon: '💊'
        }
      ]
    },
    '2': {
      id: '2',
      name: 'Anxiety',
      icon: '😰',
      description: 'Anxiety is a natural response to stress, but when it becomes overwhelming or persistent, it can significantly impact your quality of life. In homeopathy, we recognize that anxiety manifests differently in each person.',
      additional_info: 'Homeopathic remedies can help restore emotional balance and reduce anxiety symptoms naturally, without the side effects often associated with conventional medications.',
      total_remedies: 38,
      top_remedies: [
        {
          id: '5',
          name: 'Aconitum',
          rating: 5,
          reviews: 156,
          description: 'Best for sudden, intense anxiety attacks with fear and panic...',
          icon: '💊'
        }
      ]
    }
  };

  return mockAilments[id] || null;
}

export default async function AilmentDetailPage({ params }: { params: { id: string } }) {
  const ailment = await getAilment(params.id);

  if (!ailment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#2C3E3E] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-6 h-6">
                <path d="M50 10 L50 50 M30 30 L50 50 L70 30 M20 50 L50 50 L80 50 M30 70 L50 50 L70 70" 
                      stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="50" cy="50" r="3" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-semibold">Homeopathway</span>
          </Link>
          <Link href="/login">
            <button className="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
              Login
            </button>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <Link href="/ailments" className="hover:text-gray-900">Ailments</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{ailment.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Ailment Header Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">{ailment.icon}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-serif text-gray-900 mb-3">{ailment.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="text-lg">🧪</span>
                  {ailment.total_remedies} remedies
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xl">🔖</span>
              </button>
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xl">🔗</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>{ailment.description}</p>
            <p>{ailment.additional_info}</p>
          </div>
        </div>

        {/* Top Remedies Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👍</span>
              <h2 className="text-2xl font-serif text-gray-900">Top Remedies</h2>
            </div>
            <Link href={`/ailments/${ailment.id}/remedies`}>
              <button className="text-[#6B7B5E] hover:text-[#5A6A4D] font-medium text-sm">
                See all {ailment.total_remedies} Remedies →
              </button>
            </Link>
          </div>

          {/* Remedies List */}
          <div className="space-y-4">
            {ailment.top_remedies.map((remedy: any, index: number) => (
              <Link key={remedy.id} href={`/remedies/${remedy.id}`}>
                <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-start gap-4">
                    {/* Rank Number */}
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-300 group-hover:text-[#6B7B5E] transition-colors">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Remedy Icon */}
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                      {remedy.icon}
                    </div>

                    {/* Remedy Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#6B7B5E] transition-colors">
                        {remedy.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{remedy.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < remedy.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {remedy.rating} ({remedy.reviews} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 text-gray-400 group-hover:text-[#6B7B5E] transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <button className="w-full mt-6 px-6 py-3 bg-[#6B7B5E] text-white rounded-lg font-medium hover:bg-[#5A6A4D] transition-colors">
            View All Remedies
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#3C4E4E] text-white px-6 py-12 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-8 h-8">
                    <path d="M50 10 L50 50 M30 30 L50 50 L70 30 M20 50 L50 50 L80 50 M30 70 L50 50 L70 70" 
                          stroke="white" strokeWidth="2" fill="none"/>
                    <circle cx="50" cy="50" r="3" fill="white"/>
                  </svg>
                </div>
                <span className="text-xl font-semibold">HOMEOPATHWAY</span>
              </div>
              <p className="text-gray-300 text-sm max-w-md">
                Your trusted guide to natural homeopathic healing. Find remedies, read reviews and take charge of your health.
              </p>
            </div>

            {/* About Homeopathy */}
            <div>
              <h4 className="font-semibold mb-4">About Homeopathy</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/what-is-homeopathy" className="hover:text-white">What is Homeopathy?</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">How it Works</Link></li>
                <li><Link href="/safety-research" className="hover:text-white">Safety & Research</Link></li>
                <li><Link href="/getting-started" className="hover:text-white">Getting Started</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/help-center" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/safety-guidelines" className="hover:text-white">Safety Guidelines</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Media and Copyright */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-300">© 2025 Homeopathway. All Rights Reserved.</p>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-gray-300">Follow Us:</span>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="text-sm">f</span>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="text-sm">𝕏</span>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="text-sm">in</span>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="text-sm">▶</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
