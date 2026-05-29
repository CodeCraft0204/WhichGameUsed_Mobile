import { PageTemplate } from '@/components/PageTemplate';
import { primaryNav } from '@/constants/navigation';

export default function AuthenticateScreen() {
  return (
    <PageTemplate
      title="Authenticate"
      subtitle="SUBMIT YOUR CARDS WITHOUT SUBMITTING YOUR CARDS."
      body="Scan your collection of game-used cards. If your card has been authenticated in our database, submit for authentication and receive a tamper-proof QR-linked label for free."
      tabs={["SUBMISSIONS", "IN PROGRESS", "COMPLETED"]}
      activeTab="SUBMISSIONS"
      sectionTitle="DRAFT SUBMISSIONS"
      rows={[
        {
          title: '1952 Topps Mickey Mantle Patch Review',
          detail: 'Draft submission ready with provenance notes and evidence pack.',
          metric: 'Draft'
        },
        {
          title: 'Michael Jordan Relic Comparison',
          detail: 'Scanned 3h ago with side-by-side patch texture analysis.',
          metric: '3h'
        },
        {
          title: 'Babe Ruth Bat Relic Case File',
          detail: 'Awaiting final image pass and historical source linking.',
          metric: 'Queue'
        }
      ]}
      bannerTitle="LET THE GAMES BEGIN."
      bannerText="Scan your cards, see the evidence, and submit for a free tamper-proof QR-linked label."
      navItems={primaryNav}
    />
  );
}
