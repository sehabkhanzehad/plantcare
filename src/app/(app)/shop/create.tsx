import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, ImagePlus } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  PLANTCARE_STORE_NAME,
  type ListingCategory,
  type ListingCondition,
} from '@/constants/mock-marketplace';
import { CardRadius, Spacing } from '@/constants/theme';
import { useSession } from '@/context/auth';
import { useMarketplace } from '@/context/marketplace';
import { usePlants } from '@/context/plants';
import { useTheme } from '@/hooks/use-theme';

export default function CreateShopListingScreen() {
  const theme = useTheme();
  const { user } = useSession();
  const { createListing } = useMarketplace();
  const { plants } = usePlants();
  const params = useLocalSearchParams<{
    plantId?: string;
    title?: string;
    type?: string;
    image?: string;
  }>();

  const plant = useMemo(
    () => (params.plantId ? plants.find((item) => item.id === params.plantId) : undefined),
    [params.plantId, plants],
  );

  const isAdmin = user?.role === 'admin';
  const [title, setTitle] = useState(params.title ?? plant?.name ?? '');
  const [description, setDescription] = useState(
    plant ? `Selling my ${plant.type}. ${plant.notes ?? ''}`.trim() : '',
  );
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ListingCategory>('Indoor');
  const [condition, setCondition] = useState<ListingCondition>(isAdmin ? 'New' : 'Healthy');
  const [quantity, setQuantity] = useState(isAdmin ? '5' : '1');
  const [imageUri, setImageUri] = useState<string | undefined>(params.image ?? plant?.image);
  const [officialStore, setOfficialStore] = useState(isAdmin);
  const [errors, setErrors] = useState<{ title?: string; description?: string; price?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!description.trim()) next.description = 'Add a short description';
    const priceNum = Number(price);
    if (!price.trim() || Number.isNaN(priceNum) || priceNum <= 0) next.price = 'Enter a valid price';
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
      Alert.alert('Sign in required', 'You need an account to sell.');
      return;
    }
    if (!validate()) return;
    setLoading(true);
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const id = createListing({
      title,
      description,
      price: Number(price),
      category,
      condition,
      imageUris: imageUri ? [imageUri] : [],
      sellerId: user.email,
      sellerName: user.name || user.email.split('@')[0],
      sellerType: officialStore ? 'store' : 'user',
      isOfficialStore: officialStore,
      plantId: params.plantId ?? plant?.id,
      quantity: qty,
    });
    setLoading(false);
    router.replace({ pathname: '/shop/[id]', params: { id } });
  }

  return (
    <Screen scroll padded>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={[styles.back, { backgroundColor: theme.surface }]}>
          <ArrowLeft size={20} color={theme.text} strokeWidth={1.8} />
        </Pressable>
        <View style={styles.headerCopy}>
          <ThemedText type="subtitle">Sell a plant</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {officialStore ? `Listing as ${PLANTCARE_STORE_NAME}` : 'Create a community listing'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.form}>
        {isAdmin ? (
          <Pressable
            onPress={() => setOfficialStore((value) => !value)}
            style={[styles.officialToggle, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <ThemedText type="smallBold">
              {officialStore ? 'Official PlantCare Store listing' : 'Personal seller listing'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Tap to switch listing type
            </ThemedText>
          </Pressable>
        ) : null}

        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Monstera cutting"
          error={errors.title}
        />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Condition, size, pickup or delivery notes"
          multiline
          numberOfLines={5}
          style={styles.bodyInput}
          error={errors.description}
        />
        <TextField
          label="Price (BDT)"
          value={price}
          onChangeText={setPrice}
          placeholder="500"
          keyboardType="numeric"
          error={errors.price}
        />
        {officialStore ? (
          <TextField
            label="Quantity in stock"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        ) : null}

        <ThemedText type="smallBold" themeColor="textSecondary">Category</ThemedText>
        <View style={styles.categories}>
          {LISTING_CATEGORIES.map((item) => {
            const active = category === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.categoryChip,
                  { backgroundColor: active ? theme.primary : theme.surface, borderColor: theme.border },
                ]}>
                <ThemedText type="small" style={{ color: active ? theme.onPrimary : theme.textSecondary }}>
                  {item}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText type="smallBold" themeColor="textSecondary">Condition</ThemedText>
        <View style={styles.categories}>
          {LISTING_CONDITIONS.map((item) => {
            const active = condition === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCondition(item)}
                style={[
                  styles.categoryChip,
                  { backgroundColor: active ? theme.primary : theme.surface, borderColor: theme.border },
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
              <ThemedText type="smallBold" themeColor="primary">Add photo (optional)</ThemedText>
            </View>
          )}
        </Pressable>

        <Button title="Publish listing" onPress={onSubmit} loading={loading} />
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
  headerCopy: { flex: 1, gap: 4 },
  form: { gap: Spacing.three, paddingBottom: Spacing.five },
  officialToggle: {
    borderWidth: 1,
    borderRadius: CardRadius,
    padding: Spacing.three,
    gap: 4,
  },
  bodyInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: Spacing.three,
  },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
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
  preview: { width: '100%', height: 180 },
});
