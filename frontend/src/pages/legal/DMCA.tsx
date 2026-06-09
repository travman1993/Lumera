import { Link } from "react-router-dom"

export default function DMCA() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="mb-10">
          <p className="label-overline text-lumera-gold mb-3">Legal</p>
          <h1 className="font-display text-4xl text-white mb-3">Copyright & DMCA Policy</h1>
          <p className="text-lumera-muted text-sm">Effective date: June 9, 2026 · Version 1.0</p>
        </div>

        <div className="flex flex-col gap-10 text-lumera-muted text-sm leading-relaxed">

          <Section title="Overview">
            <p>
              Lumera respects the intellectual property rights of creators and rights holders. We comply with the
              Digital Millennium Copyright Act (DMCA) and respond to valid notices of alleged copyright infringement.
            </p>
            <p>
              If you believe that content hosted on Lumera infringes your copyright, you may submit a takedown
              notice to our Designated Copyright Agent using the process described below.
            </p>
          </Section>

          <Section title="Designated Copyright Agent">
            <p>Lumera's Designated Copyright Agent — registered with the U.S. Copyright Office — is:</p>
            <div className="mt-4 px-5 py-4 bg-white/5 border border-lumera-border rounded-lg flex flex-col gap-1.5">
              <p className="text-white font-medium">Travis Rodriguez</p>
              <p>Lumera — watchlumera.com</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:travisgolembiewski@gmail.com"
                  className="text-lumera-gold hover:underline"
                >
                  travisgolembiewski@gmail.com
                </a>
              </p>
              <p>
                Phone:{" "}
                <a href="tel:+14046494654" className="text-lumera-gold hover:underline">
                  (404) 649-4654
                </a>
              </p>
            </div>
            <p className="mt-3">
              Email is the preferred method of contact for DMCA notices. Please use "DMCA Takedown Notice" as
              your subject line so it is processed promptly.
            </p>
          </Section>

          <Section title="How to Submit a Takedown Notice">
            <p>
              To submit a valid DMCA takedown notice, your message must include all of the following:
            </p>
            <ol className="list-decimal list-inside flex flex-col gap-2 mt-2 ml-2">
              <li>Your full legal name, address, phone number, and email address.</li>
              <li>
                A description of the copyrighted work you claim has been infringed, including any registration
                number if applicable.
              </li>
              <li>
                The specific URL(s) on watchlumera.com where the allegedly infringing content appears.
              </li>
              <li>
                A statement that you have a good-faith belief that the use of the content is not authorized
                by the copyright owner, its agent, or the law.
              </li>
              <li>
                A statement, made under penalty of perjury, that the information in your notice is accurate
                and that you are the copyright owner or authorized to act on their behalf.
              </li>
              <li>Your physical or electronic signature.</li>
            </ol>
            <p className="mt-3">
              Incomplete notices may not be acted upon. We are not responsible for notices that are misdirected
              or contain insufficient information.
            </p>
          </Section>

          <Section title="What Happens After a Notice is Received">
            <p>
              Upon receiving a complete and valid DMCA notice, we will:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>Promptly remove or disable access to the reported content.</li>
              <li>Notify the user who uploaded the content that it has been removed.</li>
              <li>Provide the user with a copy of the takedown notice (with your personal contact info redacted where possible).</li>
              <li>Inform the user of their right to submit a counter-notice.</li>
            </ul>
          </Section>

          <Section title="Counter-Notice Process">
            <p>
              If you believe content was removed from Lumera by mistake or misidentification, you may submit
              a counter-notice to our Designated Copyright Agent. Your counter-notice must include:
            </p>
            <ol className="list-decimal list-inside flex flex-col gap-2 mt-2 ml-2">
              <li>Your full legal name, address, phone number, and email address.</li>
              <li>Identification of the specific content that was removed and its former location on Lumera.</li>
              <li>
                A statement, under penalty of perjury, that you have a good-faith belief the content was
                removed as a result of mistake or misidentification.
              </li>
              <li>
                A statement that you consent to the jurisdiction of the federal district court for your
                location (or, if outside the U.S., to the jurisdiction of any U.S. federal district court),
                and that you will accept service of process from the person who submitted the original notice.
              </li>
              <li>Your physical or electronic signature.</li>
            </ol>
            <p className="mt-3">
              Upon receiving a valid counter-notice, we will forward it to the original complainant. If the
              complainant does not file a court action within 10–14 business days, the content may be restored.
            </p>
          </Section>

          <Section title="Repeat Infringer Policy">
            <p>
              In accordance with the DMCA, Lumera maintains a policy of terminating accounts of users who are
              repeat copyright infringers. A user who receives multiple valid DMCA takedown notices may have
              their account suspended or permanently terminated at our discretion.
            </p>
          </Section>

          <Section title="Misuse & False Claims">
            <p>
              Submitting a DMCA notice with materially false information is a violation of federal law and
              may expose you to liability including damages, attorney's fees, and costs. If you are unsure
              whether content infringes your copyright, consult an attorney before submitting a notice.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              For copyright-related questions, contact our Designated Agent at{" "}
              <a
                href="mailto:travisgolembiewski@gmail.com"
                className="text-lumera-gold hover:underline"
              >
                travisgolembiewski@gmail.com
              </a>.
            </p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-lumera-border flex gap-6 text-xs text-lumera-muted">
          <Link to="/legal/terms" className="hover:text-lumera-gold transition-colors">Terms of Service</Link>
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
