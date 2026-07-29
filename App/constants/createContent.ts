export const createCopy = {
  title: 'CREATE',
  subtitle: 'Build evidence with our editing tools and templates.',
  step1: '1. Create evidence boards with photos, screenshots, shapes, and text',
  step2: '2. Crop, annotate, and frame photos — keep photo editing apps on the bench',
  step3: '3. Submit your evidence to be linked to any card, or start a discussion for Squad feedback',
  openEditor: 'OPEN CONTENT EDITOR',
  chooseLibrary: 'CHOOSE FROM PHOTO LIBRARY',
  signInRequired: 'Sign in to create evidence boards and submit content.',
  ctaTitle: 'Talk shop with the Squad.',
  ctaBody:
    'Share research and rumors, ask a question about a questionable card, or show off your collection. A place to discuss (almost) all things hobby related.'
} as const;

export const editorCopy = {
  pickTemplate: 'Choose a template',
  pickTemplateLead: 'Fixed layouts with frames and text areas — tap a slot to add a photo from your library.',
  startFromBlank: 'Start from blank',
  startFromBlankLead: 'Empty canvas — add photos, frames, and text. Drag, resize, and arrange everything yourself.',
  blankEditorLead: 'Canvas fills the screen. Drag frame/pin layers to move; use photo handles to pan, zoom, and rotate images inside frames.',
  editorLead: 'Tap a frame to add a photo, then drag the image to pan and use handles to zoom or rotate inside the frame.',
  back: '← Back',
  submit: 'SUBMIT FOR REVIEW',
  submitting: 'Uploading…',
  needPhoto: 'Add at least one photo before submitting.',
  missingTemplate: 'Template not found.',
  successTitle: 'Submitted',
  successBody: 'Your creation was sent for admin review. We will publish it to discussion or link it to a card once approved.',
  createAnother: 'Create another'
} as const;

export const editCopy = {
  title: 'REVIEW PHOTOS',
  subtitle: 'Check your shots, crop if needed, then send for review.',
  frontLabel: 'Front of card',
  backLabel: 'Back of card',
  proofLabel: 'Ownership proof',
  addProof: 'Add ownership proof (optional)',
  retake: 'Retake',
  crop: 'Crop',
  replace: 'Replace',
  notesPlaceholder: 'Notes for the reviewer (optional)',
  improveNotes: 'Improve notes with AI',
  improvingNotes: 'Improving…',
  improveNotesEmpty: 'Add a draft note or leave blank to generate a starter note.',
  improveNotesError: 'Could not improve notes. Try again.',
  send: 'SEND FOR REVIEW',
  sending: 'Uploading…',
  openCamera: 'Back to camera',
  missingFront: 'A front photo is required.',
  successTitle: 'Submitted',
  successBody: 'Your card photos were sent. We will notify you when review is complete.',
  backToAuthenticate: 'Back to Submit',
  backToCreate: 'Back to Create'
} as const;
