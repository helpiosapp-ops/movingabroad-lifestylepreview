
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
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
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
        // New conversation – show a contextual welcome message from the AI
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
      // Show a welcome message even if loading fails
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
      // Remove the optimistically added user message on failure
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
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Preparing your preview...
        </Text>
      </View>
    );
  }

  return (
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
                  {
                    backgroundColor: isUser ? theme.primary : theme.surface,
                  },
                ]}
              >
                {isUser ? (
                  <Text style={[styles.messageText, { color: '#FFFFFF' }]}>
                    {message.content}
                  </Text>
                ) : (
                  <StreamdownRN theme={colorScheme === 'dark' ? 'dark' : 'light'}>
                    {message.content}
                  </StreamdownRN>
                )}
              </View>
            );
          })}
          {loading && (
            <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: theme.surface }]}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Ask about daily life..."
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() && !loading ? theme.primary : theme.border,
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <IconSymbol
              ios_icon_name="arrow.up"
              android_material_icon_name="send"
              size={20}
              color="#FFFFFF"
            />
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
