import { PageTemplate } from '@/components/PageTemplate';
import { primaryNav } from '@/constants/navigation';

export default function DiscussionScreen() {
  return (
    <PageTemplate
      title="Discussion"
      subtitle="HOBBY TALK WITHOUT THE DRAMA."
      body="Engage with the newest evidence, discuss past and future research findings, and align yourself with the hobby's best and brightest."
      tabs={["NEWEST", "ALL-TIME GREATS", "HOTTEST"]}
      activeTab="NEWEST"
      sectionTitle="TOPICS"
      rows={[
        {
          title: 'NEWLY AUTHENTICATED',
          detail: 'Live breakdowns of fresh approvals and supporting evidence.',
          metric: '42'
        },
        {
          title: 'THREE DOLLAR BILLS (COUNTERFEITS)',
          detail: 'Community-led counterfeit tracking and pattern alerts.',
          metric: '18'
        },
        {
          title: 'ASK (ALMOST) ANYTHING',
          detail: 'Open questions with expert responses from top contributors.',
          metric: '76'
        }
      ]}
      bannerTitle="THREADING THE NEEDLE."
      bannerText="Share what you know, question what you don't, and help the hobby get smarter."
      navItems={primaryNav}
    />
  );
}
