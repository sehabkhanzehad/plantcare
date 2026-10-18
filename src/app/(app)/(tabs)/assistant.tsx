import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Leaf, Send, Sparkles } from 'lucide-react-native';
import {
  useFonts,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import type { ChatMessage } from '@/hooks/use-assistant-chat';
import { useAssistantChat } from '@/hooks/use-assistant-chat';
import { useTypewriter } from '@/hooks/use-typewriter';
import { TAB_BAR_BOTTOM_INSET, TAB_BAR_HEIGHT } from '@/constants/tab-bar';
import { CardRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const H_PAD = Spacing.three;
/** Space above floating tab bar (room for raised center tab). */
const COMPOSER_CLEARANCE = TAB_BAR_BOTTOM_INSET + TAB_BAR_HEIGHT - Spacing.one;

export default function AssistantScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { messages, typing, sendUserMessage } = useAssistantChat();
  const [draft, setDraft] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_800ExtraBold,
  });

  async function onSend() {
    const text = draft;
    setDraft('');
    await sendUserMessage(text);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }

  if (!fontsLoaded) {
    return (
      <Screen padded={false} tabBarInset>
        <ThemedText themeColor="textSecondary" style={{ paddingHorizontal: H_PAD }}>
          Loading…
        </ThemedText>
      </Screen>
    );
  }

  const composerBottomPad = keyboardVisible
    ? Spacing.one
    : COMPOSER_CLEARANCE + Math.max(insets.bottom - Spacing.one, 0);

  return (
    <Screen padded={false} style={{ backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={insets.top}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={[styles.headerIcon, { backgroundColor: theme.primary }]}>
            <Sparkles size={20} color={theme.onPrimary} strokeWidth={2} />
          </View>
          <View style={styles.headerCopy}>
            <View style={styles.nameRow}>
              <ThemedText style={[styles.title, { color: theme.text }]}>AI Assistant</ThemedText>
              <View style={[styles.previewPill, { backgroundColor: `${theme.primary}14` }]}>
                <Leaf size={11} color={theme.primary} strokeWidth={2} />
                <ThemedText style={[styles.previewText, { color: theme.primary }]}>Preview</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
              Garden tips and shortcuts
            </ThemedText>
          </View>
        </View>

        <FlatList
          ref={listRef}
          style={styles.list}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: Spacing.four }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              onOpenRoute={(route) => router.push(route as never)}
              onContentGrow={() => listRef.current?.scrollToEnd({ animated: true })}
            />
          )}
          ListFooterComponent={
            typing ? (
              <View style={[styles.row, styles.rowAssistant]}>
                <View style={[styles.bubble, styles.assistantBubble, theme.card]}>
                  <ThemedText style={[styles.typing, { color: theme.textSecondary }]}>
                    AI Assistant is typing…
                  </ThemedText>
                </View>
              </View>
            ) : null
          }
        />

        <View
          style={[
            styles.composerWrap,
            { borderTopColor: theme.border, paddingBottom: composerBottomPad },
          ]}>
          <View style={[styles.composer, theme.card]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask AI Assistant…"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => void onSend()}
              onFocus={() => {
                requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
              }}
            />
            <Pressable
              onPress={() => void onSend()}
              disabled={!draft.trim()}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              style={[
                styles.send,
                { backgroundColor: draft.trim() ? theme.primary : theme.primaryMuted },
              ]}>
              <Send size={18} color={theme.onPrimary} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function MessageBubble({
  message,
  onOpenRoute,
  onContentGrow,
}: {
  message: ChatMessage;
  onOpenRoute: (route: NonNullable<ChatMessage['route']>) => void;
  onContentGrow: () => void;
}) {
  const theme = useTheme();
  const isUser = message.role === 'user';
  const stream = !isUser && message.stream !== false;
  const { displayed, done } = useTypewriter(message.text, stream);

  useEffect(() => {
    if (stream) onContentGrow();
  }, [displayed, onContentGrow, stream]);

  const body = isUser ? message.text : displayed;

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser ? (
        <View style={[styles.avatar, { backgroundColor: `${theme.primary}18` }]}>
          <Sparkles size={14} color={theme.primary} strokeWidth={2} />
        </View>
      ) : null}
      <Pressable
        disabled={!message.route}
        onPress={() => message.route && onOpenRoute(message.route)}
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: theme.primary }]
            : [styles.assistantBubble, theme.card],
        ]}>
        <ThemedText
          style={[styles.bubbleText, { color: isUser ? theme.onPrimary : theme.text }]}>
          {body}
          {stream && !done ? (
            <ThemedText style={[styles.cursor, { color: theme.primary }]}>|</ThemedText>
          ) : null}
        </ThemedText>
        {message.route && (!stream || done) ? (
          <ThemedText style={[styles.chip, { color: isUser ? theme.onPrimary : theme.primary }]}>
            Open →
          </ThemedText>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    lineHeight: 26,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  previewText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '100%',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    flexShrink: 1,
    maxWidth: '82%',
    borderRadius: CardRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    lineHeight: 21,
  },
  cursor: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
    lineHeight: 21,
  },
  chip: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
  },
  typing: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
  },
  composerWrap: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 8,
    borderRadius: CardRadius,
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    maxHeight: 96,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  send: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
