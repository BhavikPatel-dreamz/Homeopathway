import Footer from "@/components/Footer";
import Header from "./Header";
import Breadcrumb from "./Breadcrumb";
import TopRemedies from "./TopRemedies";

interface Remedy {
  id: string;
  name: string;
  indication: string;
  rating: number; 
  review_count: number;
  description: string;
  key_symptoms?: string[];
}

interface Ailment {
  id: string;
  name: string;
  icon: string;
  remedies_count: number;
  description: string;
  personalized_approach: string;
}

interface AilmentDetailPageProps {
  ailment: Ailment;
  remedies: Remedy[];
}

export default function 
AilmentDetailPage({ ailment, remedies }: AilmentDetailPageProps) {
  const [sortBy, setSortBy] = useState("Overall Rating");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Ailments", href: "/ailments" },
    { label: ailment.name, isActive: true }
  ];

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < fullStars ? 'text-yellow-400' : i === fullStars && hasHalfStar ? 'text-yellow-400' : 'text-gray-300'}>
            {i < fullStars ? '★' : i === fullStars && hasHalfStar ? '⯨' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
     <Header />

      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-10">
        {/* Ailment Header */}
        <div className="bg-white rounded-[8px]  pl-4 pr-4 pt-6 pb-6 lg:p-6 mb-6 lg:mb-10 flex-row lg:flex-col">
          <div className="flex justify-between items-start lg:items-center mb-6 flex-col lg:flex-row">
            <div className="text-7xl flex items-start lg:items-center flex-col lg:flex-row">
              <div className="text-[40px] md:text-[50px] lg:text-[60px] mr-4 mb-2 lg:mb-0">{ailment.icon}</div>              
              <h1 className="text-[32px] lg:text-[40px] mt-2 font-serif text-[#0B0C0A] mb-2 lg:mb-0">{ailment.name}</h1>
            </div>
            <div className="flex-1 ">
              <p className="text-[#7D5C4E] text-[12px] font-[500] flex items-center justify-end">
                <img className="mr-1" src="/remedies.svg" alt="" /> {ailment.remedies_count} remedies
              </p>            
            </div>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className=" text-[16px] font-[500] text-[#41463B]">{ailment.description}</p>
            <p className=" text-[16px] font-[500] text-[#41463B]">{ailment.personalized_approach}</p>
          </div>
        </div>

        {/* Top Remedies Section */}
        <TopRemedies remedies={remedies}/>
      </main>

      {/* Footer */}
            <Footer/>
    </div>
  );
}