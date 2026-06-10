export const createCopy = {
  title: 'CREATE',
  subtitle: 'Photograph your game-used card and submit it for authentication.',
  step1: '1. Take clear front (and back) photos',
  step2: '2. Review and crop if needed',
  step3: '3. Send to our review team',
  openCamera: 'OPEN CAMERA',
  chooseLibrary: 'Choose from photo library',
  signInRequired: 'Sign in to submit card photos.'
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
