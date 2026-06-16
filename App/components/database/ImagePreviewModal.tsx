import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';

type Props = {
  visible: boolean;
  uri: string;
  label: string;
  onClose: () => void;
};

export function ImagePreviewModal({ visible, uri, label, onClose }: Props) {
  const { width, height } = useWindowDimensions();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {label}
          </Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close preview">
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
        </View>
        <Pressable style={styles.body} onPress={onClose}>
          <Image
            source={{ uri }}
            style={{ width: width - 32, height: height * 0.7 }}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12
  },
  title: {
    flex: 1,
    marginRight: 12,
    fontFamily: appFonts.body,
    fontSize: 16,
    color: '#fff'
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  }
});
