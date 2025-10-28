import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReviewsWithFilter from '../../../components/ReviewsWithFilter';

// This would come from your database
async function getRemedy(id: string) {
  // TODO: Replace with actual Supabase query
  const mockRemedies: any = {
    '1': {
      id: '1',
      name: 'Belladonna',
      scientific_name: 'Atropa belladonna',
      common_name: 'Deadly Nightshade',
      origin: 'Europe',
      description: 'Belladonna is one of the most powerful and commonly used remedies in homeopathy. It is particularly known for its effectiveness in treating sudden, intense symptoms that come on rapidly.',
      key_symptoms: [
        'Sudden onset of symptoms',
        'High fever with hot, red face',
        'Throbbing headaches',
        'Sensitivity to light and noise',
        'Dilated pupils',
        'Dry mouth and throat',
        'Restlessness and delirium'
      ],
      constitutional_type: 'Best suited for individuals experiencing hot, intense, sudden conditions. Often used for those with a tendency towards inflammation and rapid onset of symptoms.',
      dosage_forms: ['Pellets (6C, 30C, 200C)', 'Tablets', 'Liquid dilutions'],
      safety_precautions: 'Use only as directed by a qualified homeopathic practitioner. Not recommended during pregnancy without professional guidance. Keep out of reach of children.',
      average_rating: 4.8,
      total_reviews: 324,
      rating_distribution: {
        5: 250,
        4: 50,
        3: 15,
        2: 5,
        1: 4
      },
      reviews: [
        {
          id: '1',
          user: 'Sarah M.',
          rating: 5,
          verified: true,
          date: '2 days ago',
          comment: 'I will try and keep my review short. I took this remedy after being seen by a homeopath. It has helped me greatly. My main issue was a headache with throbbing pain and sensitivity to light. Within hours I felt relief. Highly recommend!'
        },
        {
          id: '2',
          user: 'John D.',
          rating: 5,
          verified: false,
          date: '1 week ago',
          comment: 'Effective for sudden fever! My daughter had a high fever that came on suddenly, and after taking Belladonna (as recommended by our homeopath), her fever broke within a few hours. Amazing!'
        },
        {
          id: '3',
          user: 'Mary L.',
          rating: 4,
          verified: true,
          date: '2 weeks ago',
          comment: 'Homeopathy has completely changed my life. My migraines that started to get horrible were gone within 15 minutes of using this remedy. Such a wonderful feeling to be pain-free. Still using it when necessary. Love Homeopathy.'
        }
      ],
      related_remedies: [
        { id: '2', name: 'Bryonia Alba', icon: '💊', rating: 5, reviews: 324 },
        { id: '3', name: 'Coffea Cruda', icon: '💊', rating: 4, reviews: 143 },
        { id: '4', name: 'Gelsemium Sempervirens', icon: '💊', rating: 4, reviews: 247 }
      ]
    }
  };

  return mockRemedies[id] || null;
}

export default async function RemedyDetailPage({ params }: { params: { id: string } }) {
  const remedy = await getRemedy(params.id);

  if (!remedy) {
    notFound();
  }

  const ratingPercentage = (remedy.average_rating / 5) * 100;

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
            <Link href="/remedies" className="hover:text-gray-900">Remedies</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{remedy.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-4xl">🧪</span>
              </div>
              <div>
                <h1 className="text-4xl font-serif text-gray-900 mb-2">{remedy.name}</h1>
                <p className="text-lg italic text-gray-600 mb-1">{remedy.scientific_name}</p>
                <p className="text-sm text-gray-500">Common Name: {remedy.common_name}</p>
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

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-8">
            <div>
              <p className="text-sm text-gray-600 mb-1">Origin</p>
              <p className="font-medium text-gray-900">{remedy.origin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Available Forms</p>
              <p className="font-medium text-gray-900">{remedy.dosage_forms.length} forms</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Common Potencies</p>
              <p className="font-medium text-gray-900">6C, 30C, 200C</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-6">
              <button className="pb-3 border-b-2 border-[#6B7B5E] text-[#6B7B5E] font-medium">Overview</button>
              <button className="pb-3 text-gray-600 hover:text-gray-900">Usage</button>
              <button className="pb-3 text-gray-600 hover:text-gray-900">Research</button>
              <button className="pb-3 text-gray-600 hover:text-gray-900">Related Ailments</button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif text-gray-900 mb-4">{remedy.name}</h2>
            <p className="text-gray-700 leading-relaxed">{remedy.description}</p>
          </div>

          {/* Key Symptoms */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Symptoms for {remedy.name}:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {remedy.key_symptoms.map((symptom: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{symptom}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Constitutional Type */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Constitutional Type:</h3>
            <p className="text-gray-700 leading-relaxed">{remedy.constitutional_type}</p>
          </div>

          {/* Dosage Forms */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Available Dosage Forms:</h3>
            <div className="flex flex-wrap gap-3">
              {remedy.dosage_forms.map((form: string, index: number) => (
                <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {form}
                </span>
              ))}
            </div>
          </div>

          {/* Safety Precautions */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Safety & Precautions:
            </h3>
            <p className="text-gray-700">{remedy.safety_precautions}</p>
          </div>
        </div>

        {/* Reviews Section - Now with Filters */}
        <ReviewsWithFilter
          reviews={remedy.reviews}
          averageRating={remedy.average_rating}
          totalReviews={remedy.total_reviews}
          ratingDistribution={remedy.rating_distribution}
        />

        {/* Related Remedies */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">Related Remedies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {remedy.related_remedies.map((related: any) => (
              <Link key={related.id} href={`/remedies/${related.id}`}>
                <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                      {related.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{related.name}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{related.rating} ({related.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Best for conditions similar to {remedy.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#3C4E4E] text-white px-6 py-12 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-300">© 2025 Homeopathway. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
