import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  Card,
  Input,
  LoadingOverlay,
  ScreenContainer,
} from '../../src/components';
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
      setEmailError(val.error || 'Invalid email address');
      return;
    }

    try {
      await resetPassword(email);
      setSuccessMessage('Password reset link sent! Check your inbox.');
    } catch {
      // Error handled via authStore.error
    }
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <LoadingOverlay visible={isLoading} message="Sending reset link..." />

      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Header */}
      <View style={styles.headerBox}>
        <Text style={styles.title}>RESET PASSWORD</Text>
        <Text style={styles.subtitle}>Enter your email to receive a recovery link</Text>
      </View>

      {/* Messages */}
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

      {/* Form Card */}
      <Card style={styles.formCard}>
        <Input
          label="Email"
          placeholder="your@email.com"
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
          title="SEND RESET LINK"
          variant="primary"
          onPress={handleReset}
          loading={isLoading}
          style={styles.actionBtn}
        />

        <Button
          title="BACK TO LOGIN"
          variant="secondary"
          onPress={() => router.back()}
          style={styles.actionBtn}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  bokehTop: {
    position: 'absolute',
    top: 40,
    right: 10,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 90, 62, 0.25)',
  },
  bokehBottom: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(15, 90, 62, 0.2)',
  },
  headerBox: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    color: '#F5ECD2',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9FD8B8',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(226, 59, 90, 0.18)',
    borderColor: '#E23B5A',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#E23B5A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: 'rgba(43, 214, 123, 0.18)',
    borderColor: '#2BD67B',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#2BD67B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  formCard: {
    padding: 20,
    marginBottom: 24,
  },
  actionBtn: {
    marginBottom: 12,
  },
});
