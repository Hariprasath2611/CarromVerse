import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Input, LoadingOverlay, ScreenContainer } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { validateEmail, validatePassword, validateUsername } from '@carromverse/shared-utils';
import { THEME } from '../../src/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const handleRegister = async () => {
    clearError();
    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    const userVal = validateUsername(username);
    if (!userVal.isValid) {
      setUsernameError(userVal.error || 'Invalid username');
      return;
    }

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setEmailError(emailVal.error || 'Invalid email');
      return;
    }

    const passVal = validatePassword(password);
    if (!passVal.isValid) {
      setPasswordError(passVal.error || 'Invalid password');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    try {
      await register(email, password, username);
      router.replace('/(tabs)');
    } catch {
      // Error is stored in authStore and displayed
    }
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <LoadingOverlay visible={isLoading} message="Creating account..." />

      <View style={styles.headerBox}>
        <Text style={styles.title}>Join CarromVerse</Text>
        <Text style={styles.subtitle}>Create your profile to compete and track stats</Text>
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Card elevated style={styles.formCard}>
        <Input
          label="Username"
          placeholder="StrikerKing"
          autoCapitalize="none"
          value={username}
          onChangeText={(val) => {
            setUsername(val);
            if (usernameError) setUsernameError(null);
          }}
          error={usernameError}
        />

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

        <Input
          label="Password"
          placeholder="At least 6 characters"
          secureTextEntry
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (passwordError) setPasswordError(null);
          }}
          error={passwordError}
        />

        <Input
          label="Confirm Password"
          placeholder="Repeat password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(val) => {
            setConfirmPassword(val);
            if (confirmPasswordError) setConfirmPasswordError(null);
          }}
          error={confirmPasswordError}
        />

        <Button
          title="Create Account"
          variant="primary"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.registerButton}
        />
      </Card>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingVertical: THEME.spacing.xl,
  },
  headerBox: {
    marginBottom: THEME.spacing.lg,
    alignItems: 'center',
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.headline,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.bodySm,
    marginTop: THEME.spacing.xs,
    textAlign: 'center',
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
  formCard: {
    padding: THEME.spacing.lg,
  },
  registerButton: {
    marginTop: THEME.spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: THEME.spacing.xl,
  },
  footerText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.bodySm,
  },
  signInText: {
    color: THEME.colors.goldBright,
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.bold,
  },
});
