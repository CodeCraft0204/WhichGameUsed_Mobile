import { PageTemplate } from '@/components/PageTemplate';
import { primaryNav } from '@/constants/navigation';

export default function EducationScreen() {
  return (
    <PageTemplate
      title="Education"
      subtitle="LEARN THE METHODS. APPLY THE EVIDENCE."
      body="Study authentication fundamentals, photo matching workflows, fake patch detection, and archival source research."
      tabs={["ALL", "AUTHENTICATION", "PHOTO MATCHING", "IDENTIFYING FAKES", "SOURCES"]}
      activeTab="ALL"
      sectionTitle="FEATURED GUIDES"
      rows={[
        {
          title: 'Guide: Identifying Fake Patches',
          detail: 'Spot stitch anomalies, edge cuts, and artificial wear patterns.',
          metric: '12m'
        },
        {
          title: 'Video: Building Source Trails',
          detail: 'Use auction catalogs and publications to validate provenance.',
          metric: '18m'
        },
        {
          title: 'Lesson: Photo Matching Basics',
          detail: 'Align stripe shape, texture, and orientation with game photos.',
          metric: '8m'
        }
      ]}
      bannerTitle="KNOWLEDGE COMPOUNDS."
      bannerText="Learn the process, contribute better evidence, and strengthen hobby trust."
      navItems={primaryNav}
    />
  );
}
