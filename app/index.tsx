
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
import { colors } from '@/styles/commonStyles';
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <IconSymbol
              ios_icon_name="globe"
              android_material_icon_name="public"
              size={48}
              color={theme.primary}
            />
            <Text style={[styles.title, { color: theme.text }]}>
              Moving Abroad
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Lifestyle Preview
            </Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Get a realistic preview of daily life in another country. No hype, just honest insights to help you think clearly.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.text }]}>
              Which country are you considering?
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="e.g., Portugal, Japan, Germany"
              placeholderTextColor={theme.textSecondary}
              value={country}
              onChangeText={setCountry}
              autoCapitalize="words"
            />

            <View style={styles.popularContainer}>
              <Text style={[styles.popularLabel, { color: theme.textSecondary }]}>
                Popular destinations:
              </Text>
              <View style={styles.chipsContainer}>
                {popularCountries.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: country === item ? theme.primary : theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => handleCountrySelect(item)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: country === item ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>
              Any specific topic? (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="e.g., work culture, social life, weather"
              placeholderTextColor={theme.textSecondary}
              value={topic}
              onChangeText={setTopic}
              autoCapitalize="sentences"
            />

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: country.trim() && !loading ? theme.primary : theme.border,
                },
              ]}
              onPress={handleStartConversation}
              disabled={!country.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Start Preview</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              This app provides general lifestyle information only. It does not offer legal, immigration, tax, or financial advice.
            </Text>
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
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Something went wrong</Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>{errorMessage}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => setErrorVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  popularContainer: {
    marginTop: 16,
  },
  popularLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
