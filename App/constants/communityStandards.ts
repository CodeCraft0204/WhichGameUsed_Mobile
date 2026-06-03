export type CommunityStandardsSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export const COMMUNITY_STANDARDS_VERSION = '2026-06-01';

export const communityStandardsSections: CommunityStandardsSection[] = [
  {
    id: 'purpose',
    title: 'Our community',
    paragraphs: [
      'Which Game Used brings collectors together to document, verify, and celebrate authentic game-used memorabilia.',
      'These standards keep the community trustworthy, respectful, and focused on the hobby we share.'
    ]
  },
  {
    id: 'respect',
    title: 'Respectful conduct',
    paragraphs: [
      'Treat other members with courtesy. Harassment, hate speech, threats, and personal attacks are not allowed.',
      'Do not impersonate individuals, teams, or brands. Use your real identity where the app asks for account details.'
    ]
  },
  {
    id: 'authenticity',
    title: 'Authenticity & submissions',
    paragraphs: [
      'Submit information you believe to be accurate. Do not knowingly post misleading claims about provenance, condition, or game use.',
      'Community verification and moderation may remove content that appears fraudulent, spam, or off-topic.'
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy & safety',
    paragraphs: [
      'Do not share other people’s private information without consent. Protect your own account credentials.',
      'Report suspicious activity through Contact Support so our team can review it promptly.'
    ]
  },
  {
    id: 'enforcement',
    title: 'Enforcement',
    paragraphs: [
      'We may warn, restrict, or suspend accounts that violate these standards or applicable law.',
      'Repeated or severe violations can result in permanent removal from the platform.'
    ]
  },
  {
    id: 'updates',
    title: 'Updates',
    paragraphs: [
      'We may update these standards as the product evolves. Continued use of the app after changes constitutes acceptance of the updated terms.',
      // `Effective version: ${COMMUNITY_STANDARDS_VERSION}.`
    ]
  }
];
