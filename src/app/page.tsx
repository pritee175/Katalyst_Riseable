import HeroSection from "@/components/ui/HeroSection";
import FeaturesSection from "@/components/ui/FeaturesSection";
import TestimonialsSection from "@/components/ui/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />

      {/* Inspiring Image Banner */}
      <section className="relative h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1920&q=80"
          alt="People working together and achieving success"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-indigo-900/70 to-blue-900/80" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-3xl animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Journey to Success Starts Here
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of learners building skills and finding meaningful careers
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md">
                <p className="text-3xl font-bold text-white">9+</p>
                <p className="text-sm text-white/80">Courses</p>
              </div>
              <div className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md">
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-sm text-white/80">Job Opportunities</p>
              </div>
              <div className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md">
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-sm text-white/80">Accessible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />
    </>
  );
}
