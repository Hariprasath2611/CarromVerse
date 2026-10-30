import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Input, LoadingOverlay, ScreenContainer } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { validateEmail, validatePassword } from '@carromverse/shared-utils';
import { THEME } from '../../src/constants/theme';
import { APP_CONFIG } from '../../src/constants/config';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleLogin = async () => {
    clearError();
    setEmailError(null);
    setPasswordError(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }

    const passValidation = validatePassword(password);
    if (!passValidation.isValid) {
      setPasswordError(passValidation.error || 'Invalid password');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      // Error displayed in UI
    }
  };

  const handleGuestPlay = () => {
    // Allows instant offline gameplay without Firebase account
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <LoadingOverlay visible={isLoading} message="Signing in..." />

      <View style={styles.headerBox}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to sync your match history and stats</Text>
      </View>

      {!APP_CONFIG.isFirebaseConfigured && (
        <Card style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>⚠️ Offline Demo Mode Active</Text>
          <Text style={styles.noticeText}>
            Firebase credentials are not configured yet in .env. You can play all offline modes
            immediately as a Guest!
          </Text>
        </Card>
      )}

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
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

        <Input
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (passwordError) setPasswordError(null);
          }}
          error={passwordError}
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgotLink}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title="Sign In"
          variant="primary"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.signInButton}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="Play Offline as Guest"
          variant="secondary"
          onPress={handleGuestPlay}
        />
      </Card>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.signUpText}>Sign Up</Text>
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
  noticeCard: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
    borderColor: THEME.colors.warning,
    marginBottom: THEME.spacing.md,
  },
  noticeTitle: {
    color: THEME.colors.warning,
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.bold,
    marginBottom: 4,
  },
  noticeText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.caption,
    lineHeight: 18,
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
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: THEME.spacing.md,
  },
  forgotText: {
    color: THEME.colors.goldPrimary,
    fontSize: THEME.typography.fontSize.bodySm,
  },
  signInButton: {
    marginBottom: THEME.spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: THEME.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.surfaceBorder,
  },
  dividerText: {
    color: THEME.colors.textMuted,
    marginHorizontal: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.caption,
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
  signUpText: {
    color: THEME.colors.goldBright,
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.bold,
  },
});

