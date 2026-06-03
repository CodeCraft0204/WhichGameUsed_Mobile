import AsyncStorage from '@react-native-async-storage/async-storage';
import { COMMUNITY_STANDARDS_VERSION } from '@/constants/communityStandards';

const STORAGE_KEY = `wgu_community_standards_accepted_${COMMUNITY_STANDARDS_VERSION}`;

export async function hasAcceptedCommunityStandards(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value === 'true';
}

export async function markCommunityStandardsAccepted(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, 'true');
}

export async function clearCommunityStandardsAcceptance(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
