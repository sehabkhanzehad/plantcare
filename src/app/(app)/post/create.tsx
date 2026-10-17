import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, ImagePlus } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { POST_CATEGORIES, type PostCategory } from '@/constants/mock-community';
import { CardRadius, Spacing } from '@/constants/theme';
import { useSession } from '@/context/auth';
import { useCommunity } from '@/context/community';
import { useTheme } from '@/hooks/use-theme';

export default function CreateCommunityPostScreen() {
  const theme = useTheme();
  const { user } = useSession();
  const { createPost } = useCommunity();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<PostCategory>('Question');
  const [imageUri, setImageUri] = useState<string>();
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!body.trim()) next.body = 'Write a short description';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  function onSubmit() {
    if (!user?.email) {
      Alert.alert('Sign in required', 'You need an account to post.');
      return;
    }
    if (!validate()) return;
    setLoading(true);
    const id = createPost({
      authorId: user.email,
      authorName: user.name || user.email.split('@')[0],
      title,
      body,
      category,
      imageUri,
    });
    setLoading(false);
    router.replace({ pathname: '/post/[id]', params: { id } });
  }

  return (
    <Screen scroll padded>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={[styles.back, { backgroundColor: theme.surface }]}>
          <ArrowLeft size={20} color={theme.text} strokeWidth={1.8} />
        </Pressable>
        <View style={styles.headerCopy}>
          <ThemedText type="subtitle">New post</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Share a plant problem, tip, or question
          </ThemedText>
        </View>
      </View>

      <View style={styles.form}>
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Yellow spots on Monstera"
          error={errors.title}
        />
        <TextField
          label="Details"
          value={body}
          onChangeText={setBody}
          placeholder="Describe what you see and what you’ve tried"
          multiline
          numberOfLines={5}
          style={styles.bodyInput}
          error={errors.body}
        />

        <ThemedText type="smallBold" themeColor="textSecondary">
          Category
        </ThemedText>
        <View style={styles.categories}>
          {POST_CATEGORIES.map((item) => {
            const active = category === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: active ? theme.primary : theme.surface,
                    borderColor: theme.border,
                  },
                ]}>
                <ThemedText type="small" style={{ color: active ? theme.onPrimary : theme.textSecondary }}>
                  {item}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={pickImage}
          style={[styles.imagePicker, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <ImagePlus size={22} color={theme.primary} strokeWidth={1.8} />
              <ThemedText type="smallBold" themeColor="primary">
                Add photo (optional)
              </ThemedText>
            </View>
          )}
        </Pressable>

        <Button title="Publish post" onPress={onSubmit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  form: {
    gap: Spacing.three,
    paddingBottom: Spacing.five,
  },
  bodyInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: Spacing.three,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  imagePicker: {
    borderWidth: 1,
    borderRadius: CardRadius,
    overflow: 'hidden',
    minHeight: 120,
  },
  imagePlaceholder: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  preview: {
    width: '100%',
    height: 180,
  },
});
