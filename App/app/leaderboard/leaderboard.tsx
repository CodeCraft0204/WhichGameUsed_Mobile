import { PageTemplate } from '@/components/PageTemplate';
import { primaryNav } from '@/constants/navigation';

export default function LeaderboardScreen() {
  return (
    <PageTemplate
      title="Leaderboard"
      subtitle="THE HOBBY'S LEADING EXPERTS IN RABBIT HOLES."
      body="Track the top 20 users each month. Rankings reward strong authentication work, helpful participation, and research contributions."
      tabs={["THIS MONTH", "THIS YEAR", "ALL-TIME"]}
      activeTab="THIS MONTH"
      sectionTitle="TOP RANKINGS"
      rows={[
        {
          title: '#1 PatchProof - Patch specialist',
          detail: 'Strong verification streak and highest-impact archive submissions.',
          metric: '12,840'
        },
        {
          title: '#2 RuthArchive - Photo match researcher',
          detail: 'Deep source-trail analysis with multiple accepted evidence packs.',
          metric: '10,615'
        },
        {
          title: '#3 CardDetective - Authentication investigator',
          detail: 'Counterfeit detection and forensic comparisons across cases.',
          metric: '9,432'
        }
      ]}
      bannerTitle="LEARN, PARTICIPATE, EARN."
      bannerText="Each month, 1st place earns sealed product, classic game-used cards, and cash."
      navItems={primaryNav}
    />
  );
}
