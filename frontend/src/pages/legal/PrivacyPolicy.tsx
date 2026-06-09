import { Link } from "react-router-dom"

export default function PrivacyPolicy() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="mb-10">
          <p className="label-overline text-lumera-gold mb-3">Legal</p>
          <h1 className="font-display text-4xl text-white mb-3">Privacy Policy</h1>
          <p className="text-lumera-muted text-sm">Effective date: June 1, 2026 · Version 1.0</p>
          <div className="mt-4 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-xs">
              This document is a draft pending final legal review.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-10 text-lumera-muted text-sm leading-relaxed">

          <Section title="1. Information We Collect">
            <p>When you create an account, we collect:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>Your email address and username</li>
              <li>Your hashed password (we never store plain-text passwords)</li>
              <li>The date and time your account was created</li>
              <li>Your age confirmation and Terms of Service acceptance timestamp and IP address</li>
            </ul>
            <p className="mt-3">When you create a creator profile, we collect:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>Display name, bio, location, and social links you provide</li>
              <li>Profile photos and avatar images you upload</li>
            </ul>
            <p className="mt-3">When you upload a film, we collect:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>The film file, poster image, and banner image</li>
              <li>Film metadata: title, description, category, duration, gear used, contributors</li>
              <li>Your copyright acknowledgement timestamp and IP address</li>
            </ul>
            <p className="mt-3">When you use the Platform, we automatically collect:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>View counts and like activity</li>
              <li>IP addresses (used for abuse prevention and legal compliance)</li>
              <li>Browser type and device information via Cloudflare</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>Operate and provide the Lumera platform</li>
              <li>Send account-related emails (verification, notifications)</li>
              <li>Detect and prevent abuse, spam, and policy violations</li>
              <li>Respond to copyright claims and legal requests</li>
              <li>Analyze usage to improve the platform</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </Section>

          <Section title="3. How We Store Your Data">
            <p>Your account data is stored in a PostgreSQL database hosted on Railway in the United States.</p>
            <p>Media files (films, images) are stored on Cloudflare R2 and Cloudflare Stream.</p>
            <p>We use industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and access controls.</p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>We use the following third-party services to operate Lumera:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li><span className="text-white">Railway</span> — backend hosting and database</li>
              <li><span className="text-white">Cloudflare</span> — CDN, DNS, security, media storage and streaming</li>
              <li><span className="text-white">Resend</span> — transactional email delivery</li>
            </ul>
            <p>Each of these services has their own privacy policy governing their handling of data.</p>
          </Section>

          <Section title="5. Cookies">
            <p>Lumera uses session tokens stored in your browser's local storage to keep you logged in. We do not use tracking or advertising cookies.</p>
            <p>Cloudflare may set security cookies as part of its DDoS protection and bot detection services.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>Your account data is retained for as long as your account is active.</p>
            <p>When you delete your account, your personal information (email, password) is anonymized immediately. Content you uploaded may be retained for up to 30 days before permanent deletion.</p>
            <p>IP addresses and copyright acknowledgement records are retained for legal compliance purposes even after account deletion.</p>
            <p>Server logs are retained for 90 days.</p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate information in your account</li>
              <li>Delete your account and associated personal data</li>
              <li>Export your data (contact us at privacy@watchlumera.com)</li>
            </ul>
            <p>If you are located in the European Union, you may have additional rights under the GDPR. Contact us at privacy@watchlumera.com to exercise these rights.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>Lumera is not directed at children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
            <p>If we become aware that a user is under 13, we will terminate their account and delete their data.</p>
          </Section>

          <Section title="9. Legal Requests">
            <p>We may disclose your information if required to do so by law, court order, or governmental authority. We will notify you of such requests where legally permitted to do so.</p>
          </Section>

          <Section title="10. Contact">
            <p>For privacy questions or data requests: <span className="text-white">privacy@watchlumera.com</span></p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-lumera-border flex gap-6 text-xs text-lumera-muted">
          <Link to="/legal/terms" className="hover:text-lumera-gold transition-colors">Terms of Service</Link>
          <Link to="/legal/guidelines" className="hover:text-lumera-gold transition-colors">Creator Guidelines</Link>
          <Link to="/legal/dmca" className="hover:text-lumera-gold transition-colors">DMCA</Link>
          <Link to="/" className="hover:text-white transition-colors ml-auto">Back to Lumera</Link>
        </div>

      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-white font-semibold text-base">{title}</h2>
      {children}
    </section>
  )
}
