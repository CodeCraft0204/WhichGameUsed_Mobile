import { PageTemplate } from '@/components/PageTemplate';
import { primaryNav } from '@/constants/navigation';

export default function DatabaseScreen() {
  return (
    <PageTemplate
      title="Database"
      subtitle="A HISTORY OF HISTORY."
      body="Browse authenticated cards, patch examples, provenance notes, and research evidence from across the hobby."
      tabs={["ALL", "BASEBALL", "BASKETBALL", "FOOTBALL", "PLAYERS"]}
      activeTab="ALL"
      sectionTitle="FEATURED RECORDS"
      rows={[
        {
          title: '1952 Topps Mickey Mantle Relic File',
          detail: 'Featured record with verification timeline and chain-of-custody notes.',
          metric: 'A+'
        },
        {
          title: 'Michael Jordan Patch Comparison',
          detail: 'Fiber and stitching profile with authenticated reference overlays.',
          metric: 'NEW'
        },
        {
          title: 'Babe Ruth Bat Relic Archive',
          detail: 'Cross-source historical match with catalog and photo evidence.',
          metric: 'TOP'
        }
      ]}
      bannerTitle="AUTHENTICATION TAKES OBSESSION."
      bannerText="Learn how to authenticate game-used cards, contribute to the conversation, and win monthly prizes."
      navItems={primaryNav}
    />
  );
}
