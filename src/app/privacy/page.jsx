import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — photostudio.ng',
  description: 'How photostudio.ng collects, uses, and protects your information.',
};

const AMBER = '#F0940A';

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="font-bold text-lg text-zinc-900 mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-20">

        <div className="mb-12">
          <Link href="/" className="inline-flex items-baseline gap-0.5 mb-10 block">
            <span className="font-bold text-base text-zinc-900 tracking-tight">photostudio</span>
            <span className="text-sm font-bold" style={{ color: AMBER }}>.ng</span>
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: AMBER }}>Legal</p>
          <h1 className="font-bold text-4xl text-zinc-900 mb-3">Privacy Policy</h1>
          <p className="text-sm text-zinc-400">Last updated: April 2025</p>
        </div>

        <p className="text-sm text-zinc-600 leading-relaxed mb-10">
          photostudio.ng ("we", "our", or "us") is a SaaS platform for photography studios in Nigeria. This policy explains what data we collect, how we use it, and your rights. By using our platform, you agree to this policy.
        </p>

        <Section title="1. Information We Collect">
          <p><strong className="text-zinc-800">Studio accounts:</strong> When you sign up, we collect your name, email address, and studio details (bio, services, pricing, location). You may also upload a profile photo and logo.</p>
          <p><strong className="text-zinc-800">Client galleries:</strong> Photographers upload photos to galleries. Clients who access galleries enter their name (and optionally a role) to identify themselves when selecting photos. We store these selections against the name provided.</p>
          <p><strong className="text-zinc-800">Bookings and payments:</strong> We collect booking details (name, date, session type, notes) and payment information. Payment transactions are processed by Paystack — we do not store card numbers or bank details.</p>
          <p><strong className="text-zinc-800">Usage data:</strong> We may collect basic usage logs (page visits, uploads, errors) to keep the platform running reliably.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and operate the photostudio.ng platform</li>
            <li>Process bookings and payments on your behalf</li>
            <li>Deliver client galleries and photo selections to the right people</li>
            <li>Send transactional emails (booking confirmations, gallery-ready notifications)</li>
            <li>Improve the platform and fix issues</li>
            <li>Respond to support requests</li>
          </ul>
          <p>We do not sell your data to third parties. We do not use your photos or client data for advertising.</p>
        </Section>

        <Section title="3. Photo Storage">
          <p>Photos uploaded to the platform are stored on Cloudflare R2 (object storage). We store two versions: a compressed thumbnail for display, and the original file for download. Photos are served only to authorised recipients — clients with the gallery link (and password, if set).</p>
          <p>You own your photos. We do not claim any rights to images uploaded to the platform.</p>
        </Section>

        <Section title="4. Data Sharing">
          <p>We share data only with the services required to operate the platform:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-zinc-800">Supabase</strong> — database and authentication</li>
            <li><strong className="text-zinc-800">Cloudflare R2</strong> — photo storage</li>
            <li><strong className="text-zinc-800">Paystack</strong> — payment processing</li>
            <li><strong className="text-zinc-800">Vercel</strong> — hosting and deployment</li>
          </ul>
          <p>Each provider is bound by their own privacy and security policies. We do not share your data with any other third parties.</p>
        </Section>

        <Section title="5. Client Data and Gallery Access">
          <p>When a photographer shares a gallery link with their client, the client enters their name to access the gallery. This name is used only to track that person's photo selections within that gallery. Client names and selections are visible to the photographer who owns the gallery.</p>
          <p>Gallery access can be restricted with a password. Only people with both the link and password can view the gallery.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>We retain your studio account and all associated data (galleries, photos, bookings) for as long as your account is active. If you delete your account, we will remove your data from our systems within 30 days, except where we are required to retain it by law.</p>
        </Section>

        <Section title="7. Security">
          <p>We use industry-standard security practices including encrypted connections (HTTPS), secure credential storage, and access controls on all data. However, no system is completely secure — we encourage you to use a strong password and keep your login details private.</p>
        </Section>

        <Section title="8. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your data</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:photostudios@gmail.com" className="underline hover:text-zinc-900" style={{ color: AMBER }}>photostudios@gmail.com</a>.</p>
        </Section>

        <Section title="9. Cookies">
          <p>We use cookies and local storage only for essential platform functionality — keeping you logged in and remembering your session. We do not use tracking or advertising cookies.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this policy from time to time. If we make significant changes, we will notify studio account holders by email. Continued use of the platform after changes means you accept the updated policy.</p>
        </Section>

        <Section title="11. Contact">
          <p>For privacy questions or data requests, reach us at:</p>
          <p>
            <a href="mailto:photostudios@gmail.com" className="font-medium hover:text-zinc-900 transition-colors" style={{ color: AMBER }}>photostudios@gmail.com</a>
            {' · '}
            <a href="https://wa.me/2349133105794" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-zinc-900 transition-colors" style={{ color: AMBER }}>WhatsApp: +234 913 310 5794</a>
          </p>
        </Section>

        <div className="pt-6 border-t border-zinc-200">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors">← Back to photostudio.ng</Link>
        </div>

      </div>
    </div>
  );
}
