import { PageTemplate } from '@/components/PageTemplate';
import { primaryNav } from '@/constants/navigation';

export default function MostWantedScreen() {
  return (
    <PageTemplate
      title="MostWanted"
      subtitle="THE COMMUNITY'S MOST WANTED CARDS."
      body="Track the cards the community most wants authenticated, including likes, dislikes, comments, and bounty-backed evidence requests."
      tabs={["ALL", "BASEBALL", "BASKETBALL", "FOOTBALL", "ALL-TIME"]}
      activeTab="ALL"
      sectionTitle="MOST WANTED"
      rows={[
        {
          title: '#1 Michael Jordan - Game-Used Patch Card',
          detail: 'Highest bounty and strongest community interest this cycle.',
          metric: '1,890'
        },
        {
          title: '#2 Babe Ruth - Bat Relic Card',
          detail: 'Legacy target with extensive source leads under review.',
          metric: '1,374'
        },
        {
          title: '#3 Kobe Bryant - Patch Auto Card',
          detail: 'New evidence submissions added from archival photo matching.',
          metric: '1,122'
        }
      ]}
      bannerTitle="WE REWARD REAL RESEARCH."
      bannerText="Your evidence can earn sealed product, classic game-used cards, and cash."
      navItems={primaryNav}
    />
  );
}
