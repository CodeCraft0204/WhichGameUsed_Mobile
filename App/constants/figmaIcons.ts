import { remoteAsset } from '@/constants/remoteAssets';
/**
 * Canonical icon set — sourced from assets/figma/Icon (Which Game Used icon sheet).
 * @see assets/figma/Icon/ChatGPT Image Jun 10, 2026, 02_57_15 AM.png
 */
export const figmaIcons = {
  // Primary bottom navigation (database shell)
  navDatabase: remoteAsset('figma/Icon/nav_database.png'),
  navAuthenticate: remoteAsset('figma/Icon/nav_authenticate.png'),
  navCreate: remoteAsset('figma/Icon/nav_create.png'),
  navDiscussion: remoteAsset('figma/Icon/nav_discussion.png'),
  navMore: remoteAsset('figma/Icon/nav_more.png'),

  // Hub bottom navigation (advocacy / more section)
  navReturn: remoteAsset('figma/Icon/nav_return.png'),
  navEducation: remoteAsset('figma/Icon/nav_education.png'),
  navMostWanted: remoteAsset('figma/Icon/nav_mostwanted.png'),
  navLeaderboard: remoteAsset('figma/Icon/nav_leaderboard.png'),
  navAdvocacy: remoteAsset('figma/Icon/nav_advocacy.png'),

  // Header utility rail
  utilitySearch: remoteAsset('figma/Icon/utility_search.png'),
  utilityProfile: remoteAsset('figma/Icon/utility_profile.png'),
  utilitySettings: remoteAsset('figma/Icon/utility_settings.png'),
  utilityNotifications: remoteAsset('figma/Icon/utility_notifications.png'),
  msgIcon: remoteAsset('figma/Icon/MsgIcon.png'),
  msgIconBadge: remoteAsset('figma/Icon/MsgIconBadge.png'),

  // Record card meta row
  metaPerson: remoteAsset('figma/Icon/meta_person.png'),
  metaShield: remoteAsset('figma/Icon/meta_shield.png'),
  metaCalendar: remoteAsset('figma/Icon/meta_calendar.png'),
  metaSupporters: remoteAsset('figma/Icon/meta_supporters.png'),

  // Status & feature glyphs
  sealApproved: remoteAsset('figma/Icon/seal_approved.png'),
  sealRejected: remoteAsset('figma/Icon/seal_rejected.png'),
  hourglassPending: remoteAsset('figma/Icon/hourglass_pending.png'),
  featuredDisplay: remoteAsset('figma/Icon/featured_display.png'),
  stampRecent: remoteAsset('figma/Icon/stamp_recent.png'),
  researchBook: remoteAsset('figma/Icon/research_book.png'),
  replyBubble: remoteAsset('figma/Icon/reply_bubble.png'),
  thumbsUp: remoteAsset('figma/Icon/thumbs_up.png'),
  bookmark: remoteAsset('figma/Icon/bookmark.png'),
  scrollQuestion: remoteAsset('figma/Icon/scroll_question.png'),
  topicNotepad: remoteAsset('figma/Icon/topic_notepad.png'),
  evidencePinned: remoteAsset('figma/Icon/evidence_pinned.png'),
  openBook: remoteAsset('figma/Icon/open_book.png'),
  collectionChest: remoteAsset('figma/Icon/collection_chest.png'),
  guidesBook: remoteAsset('figma/Icon/guides_book.png'),
  filmReel: remoteAsset('figma/Icon/film_reel.png'),
  sourcesBooks: remoteAsset('figma/Icon/sources_books.png'),
  wantedPoster: remoteAsset('figma/Icon/wanted_poster.png'),
  medalStar: remoteAsset('figma/Icon/medal_star.png'),
  evidenceFolder: remoteAsset('figma/Icon/evidence_folder.png'),
  treasureChest: remoteAsset('figma/Icon/treasure_chest.png'),
  trophyRanking: remoteAsset('figma/Icon/trophy_ranking.png'),
  expertMedal: remoteAsset('figma/Icon/expert_medal.png'),
  goldCoins: remoteAsset('figma/Icon/gold_coins.png'),
  statsChart: remoteAsset('figma/Icon/stats_chart.png'),
  megaphone: remoteAsset('figma/Icon/megaphone.png'),
  handshake: remoteAsset('figma/Icon/handshake.png'),
  starImportant: remoteAsset('figma/Icon/star_important.png'),
  watchEye: remoteAsset('figma/Icon/watch_eye.png')
} as const;
