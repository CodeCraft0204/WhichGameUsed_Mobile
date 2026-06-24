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
