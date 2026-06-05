import * as ImagePicker from 'expo-image-picker';

const PICKER_QUALITY = 0.88;
const CARD_ASPECT: [number, number] = [3, 4];

export async function pickCardPhotoFromLibrary(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: PICKER_QUALITY,
    allowsEditing: true,
    aspect: CARD_ASPECT
  });
  if (result.canceled || !result.assets[0]?.uri) return null;
  return result.assets[0].uri;
}

export async function retakeCardPhotoWithCamera(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: PICKER_QUALITY,
    allowsEditing: true,
    aspect: CARD_ASPECT
  });
  if (result.canceled || !result.assets[0]?.uri) return null;
  return result.assets[0].uri;
}

export async function cropCardPhoto(existingUri: string): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: PICKER_QUALITY,
    allowsEditing: true,
    aspect: CARD_ASPECT
  });
  if (result.canceled || !result.assets[0]?.uri) return existingUri;
  return result.assets[0].uri;
}
