/** Photo editor frame and shape assets (Photo Editor folder). */

export const photoFrames = {
  kodak: require('@/assets/Photo Editor/Photo Frames/Frames_Kodak Frame.png'),
  paper1: require('@/assets/Photo Editor/Photo Frames/Frames_Paper Frame 1.png'),
  paper2: require('@/assets/Photo Editor/Photo Frames/Frames_Paper Frame 2.png'),
  paper3: require('@/assets/Photo Editor/Photo Frames/Frames_Paper Frame 3.png'),
  paper4: require('@/assets/Photo Editor/Photo Frames/Frames_Paper Frame 4.png'),
  polaroid: require('@/assets/Photo Editor/Photo Frames/Frames_Polaroid.png')
} as const;

export const photoShapes = {
  arrow1: require('@/assets/Photo Editor/Shapes Bin/Shapes_Arrow 1.png'),
  arrow2: require('@/assets/Photo Editor/Shapes Bin/Shapes_Arrow 2.png'),
  arrow3: require('@/assets/Photo Editor/Shapes Bin/Shapes_Arrow 3.png'),
  checkmark: require('@/assets/Photo Editor/Shapes Bin/Shapes_Checkmark.png'),
  circle: require('@/assets/Photo Editor/Shapes Bin/Shapes_Circle.png'),
  oval: require('@/assets/Photo Editor/Shapes Bin/Shapes_Oval.png'),
  rectangle: require('@/assets/Photo Editor/Shapes Bin/Shapes_Rectangle.png'),
  tape1: require('@/assets/Photo Editor/Shapes Bin/Shapes_Tape 1.png'),
  tape2: require('@/assets/Photo Editor/Shapes Bin/Shapes_Tape 2.png'),
  underline1: require('@/assets/Photo Editor/Shapes Bin/Shapes_Underline 1.png'),
  underline2: require('@/assets/Photo Editor/Shapes Bin/Shapes_Underline 2.png')
} as const;

export type PhotoFrameKey = keyof typeof photoFrames;
export type PhotoShapeKey = keyof typeof photoShapes;

export const photoFrameLabels: Record<PhotoFrameKey, string> = {
  kodak: 'Kodak frame',
  paper1: 'Paper frame 1',
  paper2: 'Paper frame 2',
  paper3: 'Paper frame 3',
  paper4: 'Paper frame 4',
  polaroid: 'Polaroid'
};

export const photoShapeLabels: Record<PhotoShapeKey, string> = {
  arrow1: 'Arrow 1',
  arrow2: 'Arrow 2',
  arrow3: 'Arrow 3',
  checkmark: 'Checkmark',
  circle: 'Circle',
  oval: 'Oval',
  rectangle: 'Rectangle',
  tape1: 'Tape pin 1',
  tape2: 'Tape pin 2',
  underline1: 'Underline 1',
  underline2: 'Underline 2'
};

export const photoFrameKeys = Object.keys(photoFrames) as PhotoFrameKey[];
export const photoShapeKeys = Object.keys(photoShapes) as PhotoShapeKey[];

export {
  DEFAULT_PHOTO_BACKGROUND,
  photoBackgroundImageKeys,
  photoBackgroundLabels,
  photoBackgrounds,
  type PhotoBackgroundImageKey,
  type PhotoBackgroundKey
} from '@/constants/photoEditorBackgrounds';
