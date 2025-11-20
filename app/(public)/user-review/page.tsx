import Breadcrumb from '@/components/Breadcrumb'
import UserReview from '@/components/UserReview';

export default function page() {
  return (

    <div className="min-h-screen bg-[#F5F1E8]">
          {/* Header */}
          
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: "Back to home", href: "/" },
              { label: "User Reviews", isActive: true }
            ]}
          />

         <section className="main-wrapper">
            <UserReview/>
        </section>
        </div>
  )

}
