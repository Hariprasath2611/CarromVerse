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
import { validateEmail, validatePassword } from '@carromverse/shared-utils';
import { THEME } from '../../src/constants/theme';

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
    } catch {
      // Error handled and shown via authStore
    }
  };

  const handleGuestPlay = () => {
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <LoadingOverlay visible={isLoading} message="Signing in..." />

      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Title */}
      <View style={styles.headerBox}>
        <Text style={styles.title}>WELCOME BACK</Text>
      </View>

      {/* Error Banner */}
      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
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

        <View style={styles.forgotRow}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            hitSlop={8}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="LOGIN"
          variant="primary"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.actionBtn}
        />

        <Button
          title="PLAY AS GUEST"
          variant="secondary"
          onPress={handleGuestPlay}
          style={styles.actionBtn}
        />
      </Card>

      {/* Footer Registration Link */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>New here? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')} hitSlop={8}>
          <Text style={styles.signUpText}>Create account</Text>
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
    top: 60,
    right: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 90, 62, 0.25)',
  },
  bokehBottom: {
    position: 'absolute',
    bottom: 80,
    left: 20,
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
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 18,
    marginTop: -4,
  },
  forgotText: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtn: {
    marginBottom: 12,
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
  signUpText: {
    color: '#2BD67B',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
