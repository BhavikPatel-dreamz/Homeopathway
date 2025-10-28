import Link from "next/link";

export default function Home() {
  const ailments = [
    { name: "Headache", icon: "😣", remedies: 45 },
    { name: "Anxiety", icon: "😰", remedies: 38 },
    { name: "Insomnia", icon: "😴", remedies: 42 },
    { name: "Cold & Flu", icon: "🤧", remedies: 52 },
    { name: "Allergies", icon: "🤧", remedies: 47 },
    { name: "Joint Pain", icon: "🦴", remedies: 35 },
    { name: "Digestion", icon: "💊", remedies: 41 },
    { name: "Cough", icon: "😷", remedies: 44 },
    { name: "Muscle Soreness", icon: "💪", remedies: 29 },
    { name: "Nidal polyps", icon: "👃", remedies: 18 },
    { name: "Sunburn", icon: "☀️", remedies: 22 },
    { name: "Back pain", icon: "🧍", remedies: 33 },
    { name: "High blood pressure", icon: "🩸", remedies: 31 },
    { name: "Urinary tract infection", icon: "💧", remedies: 26 },
    { name: "Kidney stones", icon: "🪨", remedies: 19 },
    { name: "Cuts, bruises, and burns", icon: "🔥", remedies: 28 },
    { name: "Swelling", icon: "🟡", remedies: 24 },
  ];

  const topRemedies = [
    { 
      name: "Nux Vomica", 
      rating: 5, 
      reviews: 234,
      description: "Best for nausea and acidity, especially after..."
    },
    { 
      name: "Belladonna", 
      rating: 5, 
      reviews: 324,
      description: "Best for sudden, intense, throbbing pain that..."
    },
    { 
      name: "Bryonia Alba", 
      rating: 5, 
      reviews: 324,
      description: "Best for dry coughs that worsen with movement."
    },
    { 
      name: "Coffea Cruda", 
      rating: 5, 
      reviews: 143,
      description: "Best for sleeplessness due to an overactive..."
    },
    { 
      name: "Gelsemium Sempervirens", 
      rating: 4, 
      reviews: 247,
      description: "Best for flu-like symptoms with weakness, achi..."
    },
  ];

  return (
    <div className="min-h-screen bg-[#2C3E3E]">
      {/* Header */}
      <header className="px-6 py-4 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Home</h1>
          <Link href="/login">
            <button className="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
              Login
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-teal-700/80 to-gray-700/60 rounded-3xl overflow-hidden">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23456'/%3E%3C/svg%3E')"}}></div>
            
            <div className="relative z-10 px-12 py-16 text-center text-white">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-12 h-12">
                    <path d="M50 10 L50 50 M30 30 L50 50 L70 30 M20 50 L50 50 L80 50 M30 70 L50 50 L70 70" 
                          stroke="white" strokeWidth="2" fill="none"/>
                    <circle cx="50" cy="50" r="3" fill="white"/>
                    <circle cx="30" cy="30" r="2" fill="white"/>
                    <circle cx="70" cy="30" r="2" fill="white"/>
                    <circle cx="30" cy="70" r="2" fill="white"/>
                    <circle cx="70" cy="70" r="2" fill="white"/>
                  </svg>
                </div>
              </div>

              <h2 className="text-4xl font-serif mb-3">Your Path to Healing</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto">
                Find trusted homeopathic solutions for your health concerns,<br />
                backed by community reviews and expert guidance.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for ailments like headache or anxiety, or search for remedies like arnica or belladonna"
                    className="w-full px-6 py-4 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#2C3E3E] text-white rounded-full hover:bg-[#3C4E4E] transition-colors">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Ailments Section */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">💊</span>
            <h3 className="text-3xl font-serif">Popular Ailments</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ailments.slice(0, 17).map((ailment, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="text-3xl mb-2">{ailment.icon}</div>
                <h4 className="font-medium text-sm mb-1">{ailment.name}</h4>
                <p className="text-xs text-gray-500">🔬 {ailment.remedies} remedies</p>
              </div>
            ))}
            
            <div className="bg-[#5A6A5A] text-white rounded-xl p-4 flex items-center justify-center hover:bg-[#4A5A4A] transition-colors cursor-pointer">
              <span className="font-medium">View all Ailments</span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Remedies Section */}
      <section className="px-6 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">👍</span>
            <h3 className="text-3xl font-serif">Top Rated Remedies</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRemedies.map((remedy, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                    💊
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{remedy.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">5 ({remedy.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{remedy.description}</p>
              </div>
            ))}
            
            <div className="bg-[#5A6A5A] text-white rounded-xl p-6 flex items-center justify-center hover:bg-[#4A5A4A] transition-colors cursor-pointer">
              <span className="font-medium text-lg">View all Remedies</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3C4E4E] text-white px-6 py-12">
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
            <div className="flex gap-4">
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
