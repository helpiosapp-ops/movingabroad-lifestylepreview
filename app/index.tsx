
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import Constants from 'expo-constants';

const BACKEND_URL: string =
  (Constants.expoConfig?.extra?.backendUrl as string) ||
  'https://zgv9my84veuete5vdsjd6vq5uhcu7ah3.app.specular.dev';

async function createConversation(
  country: string,
  topic?: string
): Promise<{ conversationId: string; country: string; topic: string | null; createdAt: string }> {
  console.log('[API] POST /api/conversations', { country, topic });
  const response = await fetch(`${BACKEND_URL}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country, topic: topic || undefined }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[API] POST /api/conversations failed:', response.status, errorBody);
    throw new Error(`Failed to create conversation: ${response.status}`);
  }
  return response.json();
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;
  const router = useRouter();

  const [country, setCountry] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setErrorVisible(true);
  };

  const handleStartConversation = async () => {
    console.log('User tapped Start Preview button', { country, topic });

    if (!country.trim()) {
      console.log('Country field is empty, not starting conversation');
      return;
    }

    setLoading(true);
    try {
      const conversation = await createConversation(country.trim(), topic.trim() || undefined);
      console.log('Conversation created:', conversation.conversationId);
      router.push(
        `/chat/${conversation.conversationId}?country=${encodeURIComponent(conversation.country)}&topic=${encodeURIComponent(conversation.topic || '')}`
      );
    } catch (err) {
      console.error('Failed to start conversation:', err);
      showError('Could not start the preview. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const popularCountries = [
    'Portugal',
    'Spain',
    'Japan',
    'Germany',
    'Canada',
    'Australia',
    'Netherlands',
    'Thailand',
  ];

  const handleCountrySelect = (selectedCountry: string) => {
    console.log('User selected country:', selectedCountry);
    setCountry(selectedCountry);
  };

  const isButtonEnabled = country.trim() && !loading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section with Gradient */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientIcon}
            >
              <IconSymbol
                ios_icon_name="globe"
                android_material_icon_name="public"
                size={40}
                color="#FFFFFF"
              />
            </LinearGradient>
            
            <Text style={[styles.title, { color: theme.text }]}>
              Moving Abroad
            </Text>
            <Text style={[styles.subtitle, { color: theme.primary }]}>
              Lifestyle Preview
            </Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Get a realistic preview of daily life in another country. No hype, just honest insights to help you think clearly.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: theme.surface }, shadows.medium]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Which country are you considering?
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.inputBorder,
                },
              ]}
              placeholder="e.g., Portugal, Japan, Germany"
              placeholderTextColor={theme.textTertiary}
              value={country}
              onChangeText={setCountry}
              autoCapitalize="words"
            />

            <View style={styles.popularContainer}>
              <Text style={[styles.popularLabel, { color: theme.textSecondary }]}>
                Popular destinations
              </Text>
              <View style={styles.chipsContainer}>
                {popularCountries.map((item, index) => {
                  const isSelected = country === item;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.inputBackground,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => handleCountrySelect(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>
              Any specific topic?
            </Text>
            <Text style={[styles.optionalLabel, { color: theme.textTertiary }]}>
              Optional
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.inputBorder,
                },
              ]}
              placeholder="e.g., work culture, social life, weather"
              placeholderTextColor={theme.textTertiary}
              value={topic}
              onChangeText={setTopic}
              autoCapitalize="sentences"
            />

            <TouchableOpacity
              style={[styles.buttonWrapper]}
              onPress={handleStartConversation}
              disabled={!isButtonEnabled}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={isButtonEnabled ? [theme.gradientStart, theme.gradientEnd] : [theme.border, theme.border]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Start Preview</Text>
                    <IconSymbol
                      ios_icon_name="arrow.right"
                      android_material_icon_name="arrow-forward"
                      size={20}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={[styles.disclaimerCard, { backgroundColor: theme.surfaceElevated }]}>
              <IconSymbol
                ios_icon_name="info.circle"
                android_material_icon_name="info"
                size={20}
                color={theme.textTertiary}
              />
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                This app provides general lifestyle information only. It does not offer legal, immigration, tax, or financial advice.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <Modal
        visible={errorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }, shadows.large]}>
            <View style={[styles.modalIconContainer, { backgroundColor: theme.accentLight }]}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle"
                android_material_icon_name="warning"
                size={32}
                color={theme.accent}
              />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Something went wrong</Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>{errorMessage}</Text>
            <TouchableOpacity
              style={[styles.modalButtonWrapper]}
              onPress={() => setErrorVisible(false)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.gradientStart, theme.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Got it</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  gradientIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    marginTop: spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    marginTop: spacing.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: typography.body,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  formCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  optionalLabel: {
    fontSize: typography.caption,
    marginBottom: spacing.sm,
    fontWeight: typography.medium,
  },
  input: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.body,
    borderWidth: 1,
  },
  popularContainer: {
    marginTop: spacing.lg,
  },
  popularLabel: {
    fontSize: typography.bodySmall,
    marginBottom: spacing.sm,
    fontWeight: typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: typography.bodySmall,
    fontWeight: typography.semibold,
  },
  buttonWrapper: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    padding: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.body + 1,
    fontWeight: typography.bold,
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: spacing.md,
  },
  disclaimerCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  footerText: {
    flex: 1,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.light.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.h4,
    fontWeight: typography.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  modalButtonWrapper: {
    width: '100%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  modalButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
});
