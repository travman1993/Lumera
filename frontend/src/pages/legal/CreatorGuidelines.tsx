import { Link } from "react-router-dom"

export default function CreatorGuidelines() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="mb-10">
          <p className="label-overline text-lumera-gold mb-3">Legal</p>
          <h1 className="font-display text-4xl text-white mb-3">Creator Guidelines</h1>
          <p className="text-lumera-muted text-sm">Effective date: June 1, 2026</p>
          <p className="text-lumera-muted text-sm mt-3 leading-relaxed">
            Lumera is a professional platform for filmmakers. These guidelines exist to keep the platform
            a high-quality, respectful space for serious creative work.
          </p>
        </div>

        <div className="flex flex-col gap-10 text-lumera-muted text-sm leading-relaxed">

          <Section title="What Belongs on Lumera">
            <p>Lumera is for original filmmaking. This includes:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>Short films, documentaries, commercials, music videos, fashion films, sports content, and experimental work</li>
              <li>Projects you directed, shot, or produced</li>
              <li>Collaborative work where all contributors have given permission</li>
              <li>Portfolio pieces representing your professional creative work</li>
            </ul>
          </Section>

          <Section title="Copyright and Ownership">
            <p>You must own or have explicit written permission for everything in your film:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li><span className="text-white">Footage</span> — you shot it, or you licensed it from a stock platform with a license that covers redistribution</li>
              <li><span className="text-white">Music</span> — you composed it, or you hold a sync license that explicitly covers streaming platforms. A YouTube license does not cover Lumera.</li>
              <li><span className="text-white">Images and graphics</span> — original, licensed, or in the public domain</li>
              <li><span className="text-white">Trademarks and logos</span> — incidental appearance is usually fine; prominent placement requires permission</li>
            </ul>
            <p className="mt-2">If you're unsure whether you have the right to use something, don't use it.</p>
          </Section>

          <Section title="Music Licensing">
            <p>This is the most common source of copyright issues. Be specific:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>Music you composed and recorded yourself — allowed</li>
              <li>Creative Commons music — check the specific license; CC-BY and CC0 are fine; NC licenses may restrict commercial use</li>
              <li>Music from platforms like Artgrid, Musicbed, or Epidemic Sound — check your plan; some plans do not cover streaming distribution</li>
              <li>Music licensed for YouTube via Content ID — does NOT cover Lumera</li>
              <li>Music purchased on iTunes or Spotify — you have a listening license, not a sync license. Not allowed.</li>
            </ul>
          </Section>

          <Section title="AI-Generated Content">
            <p>AI-assisted work is permitted on Lumera with these rules:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>You must own the outputs under your AI tool's license terms</li>
              <li>Clearly label AI-generated content in your film description</li>
              <li>Do not present AI-generated work as fully human-created</li>
              <li>AI-generated deepfakes of real people without consent are prohibited</li>
            </ul>
          </Section>

          <Section title="Prohibited Content">
            <div className="flex flex-col gap-4">
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-xs font-medium uppercase tracking-wide mb-2">Zero Tolerance — Immediate Permanent Ban</p>
                <ul className="list-disc list-inside flex flex-col gap-1 text-lumera-muted text-xs">
                  <li>Child sexual abuse material (CSAM) — reported to NCMEC and law enforcement</li>
                  <li>Non-consensual intimate imagery</li>
                  <li>Content glorifying or inciting terrorism or mass violence</li>
                  <li>Threats against real individuals</li>
                  <li>Doxxing — publishing private personal information without consent</li>
                </ul>
              </div>

              <div className="px-4 py-3 bg-lumera-surface border border-lumera-border rounded-lg">
                <p className="text-lumera-muted text-xs font-medium uppercase tracking-wide mb-2">Policy Violations — Strikes System</p>
                <ul className="list-disc list-inside flex flex-col gap-1 text-lumera-muted text-xs">
                  <li>Explicit pornographic content</li>
                  <li>Graphic violence with no artistic or journalistic context</li>
                  <li>Hate speech or slurs targeting protected groups</li>
                  <li>Harassment targeting specific individuals</li>
                  <li>Impersonating another filmmaker, studio, or brand</li>
                  <li>Misleading titles or thumbnails designed to deceive</li>
                  <li>Spam or repetitive content uploads</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Strikes and Enforcement">
            <p>Violations are handled with a progressive strikes system:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li><span className="text-white">1st strike</span> — content removed + warning email</li>
              <li><span className="text-white">2nd strike</span> — content removed + 30-day upload suspension</li>
              <li><span className="text-white">3rd strike</span> — permanent account termination</li>
              <li><span className="text-white">Zero tolerance violations</span> — immediate permanent ban, no warning</li>
            </ul>
            <p>Copyright strikes are tracked separately. Three copyright strikes result in permanent termination.</p>
          </Section>

          <Section title="Professional Conduct">
            <p>Lumera is a professional creative platform. We expect creators to:</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2 ml-2">
              <li>Represent themselves and their work honestly</li>
              <li>Credit collaborators accurately</li>
              <li>Not file false or bad-faith copyright reports against other creators</li>
              <li>Not attempt to manipulate view counts or likes through automated means</li>
            </ul>
          </Section>

          <Section title="Reporting Violations">
            <p>If you see content that violates these guidelines, use the Report button on any film or creator profile. We review all reports.</p>
            <p>For urgent issues or DMCA claims: <span className="text-white">dmca@watchlumera.com</span></p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-lumera-border flex gap-6 text-xs text-lumera-muted">
          <Link to="/legal/terms" className="hover:text-lumera-gold transition-colors">Terms of Service</Link>
          <Link to="/legal/privacy" className="hover:text-lumera-gold transition-colors">Privacy Policy</Link>
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
