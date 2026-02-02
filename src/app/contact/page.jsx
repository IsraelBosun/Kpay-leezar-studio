import ContactForm from '@/components/ContactForm.jsx';
import { siteData } from '@/lib/data';

export default function ContactPage() {
  return (
    <main className="pt-32 pb-24 px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="mb-20">
          <h2 className="text-sm uppercase tracking-[0.4em] text-primary font-bold mb-4 animate-fade-in">
            Inquiries
          </h2>
          <h1 className="text-5xl md:text-7xl font-serif text-black leading-tight max-w-3xl">
            Let’s discuss your vision and create something <span className="italic">remarkable</span>.
          </h1>
          <p className="mt-8 text-lg text-neutral-gray max-w-xl font-light leading-relaxed border-l-2 border-gray-100 pl-8">
            Whether you are planning a high-profile corporate event, a private portrait session, or a global brand campaign, we are ready to bring our lens to your story.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Form Section */}
          <div className="lg:col-span-7 bg-gray-50 p-8 md:p-12">
            <h3 className="text-2xl font-serif mb-8 text-black">Booking Request</h3>
            <ContactForm />
          </div>

          {/* Details & Social Section */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6">Direct Contact</h4>
              <div className="space-y-4">
                <a href={`mailto:${siteData.contact.email}`} className="block text-2xl font-serif text-black hover:text-primary transition-colors">
                  {siteData.contact.email}
                </a>
                <a href={`tel:${siteData.contact.phone}`} className="block text-2xl font-serif text-black hover:text-primary transition-colors">
                  {siteData.contact.phone}
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6">Location</h4>
              <p className="text-xl font-serif text-black leading-relaxed">
                {siteData.contact.address}<br />
                <span className="text-sm font-sans uppercase tracking-widest text-neutral-gray italic">Available for Global Travel</span>
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6">Social Discovery</h4>
              <div className="flex flex-wrap gap-8">
                {siteData.contact.socials.map((social) => (
                  <a 
                    key={social.name} 
                    href={social.url} 
                    className="text-sm uppercase tracking-widest font-bold text-black border-b border-transparent hover:border-primary hover:text-primary transition-all pb-1"
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}