import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle
} from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { authLayout } from '@/constants/authLayout';
import { useAuthLayout } from '@/hooks/useAuthLayout';

export type AuthFieldIcon = 'person' | 'mail' | 'lock';

type AuthTextFieldProps = TextInputProps & {
  icon: AuthFieldIcon;
  containerStyle?: StyleProp<ViewStyle>;
};

const iconMap: Record<AuthFieldIcon, keyof typeof Ionicons.glyphMap> = {
  person: 'person-outline',
  mail: 'mail-outline',
  lock: 'lock-closed-outline'
};

export function AuthTextField({
  icon,
  containerStyle,
  secureTextEntry,
  style,
  ...inputProps
}: AuthTextFieldProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={[styles.wrap, containerStyle]}>
      <Ionicons
        name={iconMap[icon]}
        size={s(authLayout.fieldIconSize)}
        color={figmaColors.gray}
        style={styles.leadingIcon}
      />
      <TextInput
        placeholderTextColor="#9A9A9A"
        secureTextEntry={isPassword && hidden}
        style={[styles.input, style]}
        {...inputProps}
      />
      {isPassword ? (
        <Pressable
          onPress={() => setHidden((v) => !v)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          style={styles.trailingBtn}
        >
          <Ionicons
            name={hidden ? 'eye-outline' : 'eye-off-outline'}
            size={s(authLayout.fieldIconSize)}
            color={figmaColors.gray}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: s(authLayout.fieldMinHeight),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: '#D4D4D4',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: s(14)
    },
    leadingIcon: {
      marginRight: s(10)
    },
    input: {
      flex: 1,
      fontFamily: 'Inter_400Regular',
      fontSize: t(authLayout.fieldFontSize),
      lineHeight: t(24),
      color: figmaColors.charcoal,
      paddingVertical: s(12)
    },
    trailingBtn: {
      marginLeft: s(8),
      padding: s(4)
    }
  });
}
