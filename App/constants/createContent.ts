export const createCopy = {
  title: 'CREATE',
  subtitle: 'Build research posts with templates, or photograph cards for authentication.',
  step1: '1. Pick a template and add your photos',
  step2: '2. Arrange evidence with frames and captions',
  step3: '3. Submit for review — post to discussion or link to a card',
  openCamera: 'OPEN CAMERA',
  openEditor: 'OPEN CONTENT EDITOR',
  chooseLibrary: 'Choose from photo library (authenticate)',
  signInRequired: 'Sign in to submit card photos or create content.'
} as const;

export const editorCopy = {
  pickTemplate: 'Choose a template',
  pickTemplateLead: 'Fixed layouts with frames and text areas — tap a slot to add a photo from your library.',
  startFromBlank: 'Start from blank',
  startFromBlankLead: 'Empty canvas — add photos, frames, and text. Drag, resize, and arrange everything yourself.',
  blankEditorLead: 'Canvas fills the screen. Use the library for frames, pins, and backgrounds. Drag to move; corner handle to resize.',
  editorLead: 'Tap any frame to insert a photo. Photos resize to fit inside the frame.',
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
  backToAuthenticate: 'Back to Authenticate',
  backToCreate: 'Create another'
} as const;

export { cameraCopy } from '@/constants/cameraCopy';
