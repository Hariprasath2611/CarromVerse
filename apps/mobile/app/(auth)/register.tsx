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
      setPasswordError(passVal.error || 'Password must be at least 6 characters');
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
      // Error is caught and surfaced in authStore.error
    }
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <LoadingOverlay visible={isLoading} message="Creating account..." />

      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Header Box */}
      <View style={styles.headerBox}>
        <Text style={styles.title}>CREATE ACCOUNT</Text>
      </View>

      {/* Error Banner */}
      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Registration Card Form */}
      <Card style={styles.formCard}>
        <Input
          label="Username"
          placeholder="your_handle"
          autoCapitalize="none"
          value={username}
          onChangeText={(val) => {
            setUsername(val);
            if (usernameError) setUsernameError(null);
          }}
          error={usernameError}
        />

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

        <Input
          label="Confirm Password"
          placeholder="••••••••"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(val) => {
            setConfirmPassword(val);
            if (confirmPasswordError) setConfirmPasswordError(null);
          }}
          error={confirmPasswordError}
        />

        <Button
          title="SIGN UP"
          variant="primary"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.actionBtn}
        />
      </Card>

      {/* Footer Link */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} hitSlop={8}>
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>
      </View>
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
  formCard: {
    padding: 20,
    marginBottom: 24,
  },
  actionBtn: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#9FD8B8',
    fontSize: 14,
  },
  loginText: {
    color: '#2BD67B',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
