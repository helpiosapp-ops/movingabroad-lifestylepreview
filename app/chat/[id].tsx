
import React, { useState, useRef, useEffect } from 'react';
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
import { useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { StreamdownRN } from 'streamdown-rn';
import Constants from 'expo-constants';

const BACKEND_URL: string =
  (Constants.expoConfig?.extra?.backendUrl as string) ||
  'https://zgv9my84veuete5vdsjd6vq5uhcu7ah3.app.specular.dev';

async function fetchMessages(conversationId: string): Promise<Message[]> {
  console.log(`[API] GET /api/conversations/${conversationId}/messages`);
  const response = await fetch(`${BACKEND_URL}/api/conversations/${conversationId}/messages`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[API] GET messages failed: ${response.status}`, errorBody);
    throw new Error(`Failed to load messages: ${response.status}`);
  }
  return response.json();
}

async function postMessage(
  conversationId: string,
  message: string
): Promise<{ response: string }> {
  console.log(`[API] POST /api/conversations/${conversationId}/messages`, { message });
  const response = await fetch(`${BACKEND_URL}/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[API] POST message failed: ${response.status}`, errorBody);
    throw new Error(`Failed to send message: ${response.status}`);
  }
  return response.json();
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);

  const conversationId = params.id as string;
  const country = params.country as string;
  const topic = params.topic as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setErrorVisible(true);
  };

  useEffect(() => {
    console.log('Chat screen mounted with conversationId:', conversationId);
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    console.log('Loading messages for conversation:', conversationId);
    setInitialLoading(true);

    try {
      const existingMessages = await fetchMessages(conversationId);
      console.log(`Loaded ${existingMessages.length} messages from server`);

      if (existingMessages.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: `I'm here to help you understand what daily life is typically like in ${country}${topic ? ` with a focus on ${topic}` : ''}.\n\nFeel free to ask me about:\n\n- Daily routines and pace of life\n- Social norms and culture\n- Work culture and expectations\n- Language and communication\n- Weather and seasonal patterns\n- Common surprises expats experience\n- Who tends to thrive there\n\nWhat would you like to know?`,
          createdAt: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(existingMessages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `I'm here to help you understand what daily life is typically like in ${country}${topic ? ` with a focus on ${topic}` : ''}.\n\nWhat would you like to know?`,
        createdAt: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSend = async () => {
    const messageText = inputText.trim();
    if (!messageText || loading) {
      console.log('Cannot send: empty message or already loading');
      return;
    }

    console.log('User sending message:', messageText);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const result = await postMessage(conversationId, messageText);
      console.log('AI response received, length:', result.response.length);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      showError('Could not get a response. Please check your connection and try again.');
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setInputText(messageText);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  if (initialLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: country || 'Chat',
            headerBackTitle: 'Back',
          }}
        />
        <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
          <LinearGradient
            colors={[theme.gradientStart, theme.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.loadingIcon}
          >
            <IconSymbol
              ios_icon_name="globe"
              android_material_icon_name="public"
              size={32}
              color="#FFFFFF"
            />
          </LinearGradient>
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: spacing.md }} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Preparing your preview...
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: country || 'Chat',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  {isUser ? (
                    <LinearGradient
                      colors={[theme.gradientStart, theme.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.userBubbleGradient}
                    >
                      <Text style={styles.messageText}>
                        {message.content}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.assistantBubbleContent, { backgroundColor: theme.surface }, shadows.small]}>
                      <StreamdownRN theme={colorScheme === 'dark' ? 'dark' : 'light'}>
                        {message.content}
                      </StreamdownRN>
                    </View>
                  )}
                </View>
              );
            })}
            {loading && (
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <View style={[styles.assistantBubbleContent, { backgroundColor: theme.surface }, shadows.small]}>
                  <View style={styles.typingIndicator}>
                    <View style={[styles.typingDot, { backgroundColor: theme.primary }]} />
                    <View style={[styles.typingDot, { backgroundColor: theme.primary }]} />
                    <View style={[styles.typingDot, { backgroundColor: theme.primary }]} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Ask about daily life..."
                placeholderTextColor={theme.textTertiary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!loading}
              />
            </View>
            <TouchableOpacity
              style={styles.sendButtonWrapper}
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={inputText.trim() && !loading ? [theme.gradientStart, theme.gradientEnd] : [theme.border, theme.border]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButton}
              >
                <IconSymbol
                  ios_icon_name="arrow.up"
                  android_material_icon_name="send"
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
                style={styles.modalButtonWrapper}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: spacing.md,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  userBubbleGradient: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderBottomRightRadius: spacing.xs,
  },
  assistantBubbleContent: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: spacing.xs,
  },
  messageText: {
    fontSize: typography.body,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  input: {
    fontSize: typography.body,
    maxHeight: 100,
  },
  sendButtonWrapper: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
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
