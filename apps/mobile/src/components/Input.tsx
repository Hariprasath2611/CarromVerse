import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { THEME } from '../constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          !!error && styles.errorBorder,
        ]}
      >
        <TextInput
          placeholderTextColor={THEME.colors.textMuted}
          style={[styles.input, style]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    color: THEME.colors.cream,
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    backgroundColor: '#0A2E22',
    borderWidth: 1.5,
    borderColor: '#1B7050',
    borderRadius: 14,
    paddingHorizontal: THEME.spacing.md,
    height: 52,
    justifyContent: 'center',
  },
  focused: {
    borderColor: THEME.colors.neonEmerald,
    backgroundColor: '#0E3A2B',
  },
  errorBorder: {
    borderColor: THEME.colors.queenRed,
  },
  input: {
    color: THEME.colors.cream,
    fontSize: THEME.typography.fontSize.body,
    height: '100%',
  },
  errorText: {
    color: THEME.colors.queenRed,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: THEME.spacing.xs,
    fontWeight: '600',
  },
});
