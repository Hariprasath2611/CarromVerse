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
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.medium,
    marginBottom: THEME.spacing.xs,
    letterSpacing: 0.3,
  },
  inputContainer: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    height: 48,
    justifyContent: 'center',
  },
  focused: {
    borderColor: THEME.colors.goldPrimary,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  errorBorder: {
    borderColor: THEME.colors.error,
  },
  input: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.body,
    height: '100%',
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: THEME.spacing.xs,
  },
});
