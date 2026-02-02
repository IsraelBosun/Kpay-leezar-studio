import HeroSection from '@/components/HeroSection';
import PortfolioPreview from '@/components/PortfolioPreview';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import CTASection from '@/components/CTASection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <PortfolioPreview />
      {/* Add the IDs here */}
      <div id="about">
        <AboutSection />
      </div>
      <div id="services">
        <ServicesSection />
      </div>
      <CTASection />
    </main>
  );
}