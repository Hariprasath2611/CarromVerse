import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Header, Input, LoadingOverlay, ScreenContainer } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { validateEmail } from '@carromverse/shared-utils';
import { THEME } from '../../src/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleReset = async () => {
    clearError();
    setEmailError(null);
    setSuccessMessage(null);

    const val = validateEmail(email);
    if (!val.isValid) {
      setEmailError(val.error || 'Invalid email');
      return;
    }

    try {
      await resetPassword(email);
      setSuccessMessage('Password reset email sent! Check your inbox to proceed.');
    } catch {
      // Error is set in authStore
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <LoadingOverlay visible={isLoading} message="Sending reset link..." />
      <Header title="Reset Password" showBack />

      <Text style={styles.infoText}>
        Enter the email associated with your CarromVerse account and we'll send you instructions
        to reset your password.
      </Text>

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!!successMessage && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <Card elevated style={styles.formCard}>
        <Input
          label="Email Address"
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (emailError) setEmailError(null);
          }}
          error={emailError}
        />

        <Button
          title="Send Reset Instructions"
          variant="primary"
          onPress={handleReset}
          loading={isLoading}
          style={styles.submitButton}
        />

        <Button
          title="Back to Sign In"
          variant="outline"
          onPress={() => router.back()}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.md,
  },
  infoText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.bodySm,
    lineHeight: 20,
    marginBottom: THEME.spacing.lg,
  },
  errorBox: {
    backgroundColor: THEME.colors.errorBg,
    borderColor: THEME.colors.error,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: THEME.typography.fontSize.bodySm,
  },
  successBox: {
    backgroundColor: THEME.colors.successBg,
    borderColor: THEME.colors.success,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  successText: {
    color: THEME.colors.success,
    fontSize: THEME.typography.fontSize.bodySm,
  },
  formCard: {
    padding: THEME.spacing.lg,
  },
  submitButton: {
    marginBottom: THEME.spacing.md,
  },
});

