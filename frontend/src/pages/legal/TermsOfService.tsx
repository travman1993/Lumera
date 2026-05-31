import { Link } from "react-router-dom"

export default function TermsOfService() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="mb-10">
          <p className="label-overline text-lumera-gold mb-3">Legal</p>
          <h1 className="font-display text-4xl text-white mb-3">Terms of Service</h1>
          <p className="text-lumera-muted text-sm">Effective date: June 1, 2026 · Version 1.0</p>
          <div className="mt-4 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-xs">
              This document is a draft pending final legal review. By using Lumera you agree to these terms.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-10 text-lumera-muted text-sm leading-relaxed">

          <Section title="1. Acceptance of Terms">
            <p>By creating an account or using Lumera ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
            <p>You must be at least 13 years old to create an account. By registering, you confirm that you meet this requirement.</p>
            <p>We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes acceptance of the updated Terms.</p>
          </Section>

          <Section title="2. User Accounts">
            <p>You are responsible for maintaining the confidentiality of your account credentials. You may not share, sell, or transfer your account to another person.</p>
            <p>You may only create one account per person. Duplicate accounts may be removed.</p>
            <p>You are responsible for all activity that occurs under your account.</p>
          </Section>

          <Section title="3. Creator Content">
            <p>You retain ownership of all content you upload to Lumera ("Creator Content").</p>
            <p>By uploading content, you grant Lumera a non-exclusive, royalty-free, worldwide license to display, stream, and distribute your content on the Platform for as long as it remains published.</p>
            <p>You warrant that you own or have all necessary rights, licenses, and permissions to upload and publish your content, including rights to all footage, music, images, and any trademarks shown.</p>
            <p>You are solely responsible for your Creator Content and for any claims arising from it, including copyright infringement claims.</p>
          </Section>

          <Section title="4. Prohibited Content">
            <p>You may not upload or publish content that:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>Infringes any third-party copyright, trademark, or other intellectual property right</li>
              <li>Contains child sexual abuse material (CSAM) — violations will be reported to NCMEC and law enforcement</li>
              <li>Depicts or promotes terrorism, mass violence, or genocide</li>
              <li>Contains hate speech targeting race, religion, gender, sexual orientation, disability, or national origin</li>
              <li>Constitutes harassment, threats, or doxxing of any individual</li>
              <li>Contains explicit pornographic or non-consensual intimate imagery</li>
              <li>Is spam, misleading, or deceptive</li>
              <li>Impersonates another creator, brand, or public figure</li>
              <li>Violates any applicable law</li>
            </ul>
          </Section>

          <Section title="5. Copyright Policy">
            <p>Lumera respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA).</p>
            <p>If you believe content on Lumera infringes your copyright, you may submit a takedown request to: <span className="text-white">dmca@watchlumera.com</span></p>
            <p>Users who repeatedly infringe copyright will have their accounts terminated. Lumera has registered a DMCA agent with the U.S. Copyright Office.</p>
          </Section>

          <Section title="6. Platform Rights">
            <p>Lumera reserves the right to remove any content at any time, with or without notice, if it violates these Terms or our Creator Guidelines.</p>
            <p>Lumera reserves the right to suspend or permanently terminate any account that violates these Terms.</p>
            <p>Lumera has no obligation to host any particular content or maintain any particular account.</p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>Lumera is provided "as is" without warranties of any kind. We do not guarantee uninterrupted availability or that the Platform will be free of errors.</p>
            <p>Lumera is not responsible for any Creator Content uploaded by users. You use the Platform at your own risk.</p>
            <p>To the fullest extent permitted by law, Lumera's liability to you for any claims arising from use of the Platform is limited to the amount you paid us in the twelve months preceding the claim.</p>
            <p>You agree to indemnify and hold Lumera harmless from any claims, damages, or expenses arising from your use of the Platform or your Creator Content.</p>
          </Section>

          <Section title="8. Account Termination">
            <p>You may delete your account at any time from your Dashboard settings.</p>
            <p>Lumera may terminate or suspend your account at any time for violations of these Terms.</p>
            <p>Upon termination, your right to use the Platform ceases. Content may be retained for legal compliance purposes.</p>
          </Section>

          <Section title="9. Governing Law">
            <p>These Terms are governed by the laws of the State of [State], United States, without regard to conflict of law provisions.</p>
            <p>Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>
          </Section>

          <Section title="10. Contact">
            <p>For legal matters: <span className="text-white">legal@watchlumera.com</span></p>
            <p>For copyright claims: <span className="text-white">dmca@watchlumera.com</span></p>
            <p>For privacy concerns: <span className="text-white">privacy@watchlumera.com</span></p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-lumera-border flex gap-6 text-xs text-lumera-muted">
          <Link to="/legal/privacy" className="hover:text-lumera-gold transition-colors">Privacy Policy</Link>
          <Link to="/legal/guidelines" className="hover:text-lumera-gold transition-colors">Creator Guidelines</Link>
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
