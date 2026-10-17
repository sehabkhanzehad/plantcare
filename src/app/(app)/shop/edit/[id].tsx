import { useState } from 'react';
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
  PLANTCARE_STORE_ID,
  type ListingCategory,
  type ListingCondition,
  type MarketplaceListing,
} from '@/constants/mock-marketplace';
import { CardRadius, Spacing } from '@/constants/theme';
import { useSession, type AuthUser } from '@/context/auth';
import { useMarketplace } from '@/context/marketplace';
import { useTheme } from '@/hooks/use-theme';

export default function EditShopListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const { listings } = useMarketplace();
  const listing = listings.find((item) => item.id === id);

  if (!listing || !user?.email) {
    return (
      <Screen padded>
        <ThemedText type="subtitle">Listing not found</ThemedText>
        <Button title="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  const isAdmin = user.role === 'admin';
  const canEdit =
    listing.sellerId === user.email || (listing.isOfficialStore && isAdmin);

  if (!canEdit) {
    return (
      <Screen padded>
        <ThemedText type="subtitle">Not allowed</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          You can only edit your own listings.
        </ThemedText>
        <Button title="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  return <EditListingForm listing={listing} user={user} />;
}

function EditListingForm({ listing, user }: { listing: MarketplaceListing; user: AuthUser }) {
  const theme = useTheme();
  const { updateListing, removeListing } = useMarketplace();
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [price, setPrice] = useState(String(listing.price));
  const [category, setCategory] = useState<ListingCategory>(listing.category);
  const [condition, setCondition] = useState<ListingCondition>(listing.condition);
  const [quantity, setQuantity] = useState(String(listing.quantity));
  const [imageUri, setImageUri] = useState<string | undefined>(listing.imageUris[0]);
  const [loading, setLoading] = useState(false);

  const isAdmin = user.role === 'admin';

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
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

  function onSave() {
    const priceNum = Number(price);
    if (!title.trim() || !description.trim() || Number.isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Missing info', 'Check title, description, and price.');
      return;
    }
    setLoading(true);
    const ok = updateListing(
      listing.id,
      {
        title,
        description,
        price: priceNum,
        category,
        condition,
        quantity: Math.max(0, parseInt(quantity, 10) || 0),
        imageUris: imageUri ? [imageUri] : [],
        status: listing.quantity > 0 || parseInt(quantity, 10) > 0 ? 'active' : listing.status,
      },
      user.email,
      isAdmin,
    );
    setLoading(false);
    if (!ok) {
      Alert.alert('Could not save', 'Try again later.');
      return;
    }
    router.back();
  }

  function onRemove() {
    Alert.alert('Remove listing', 'This will hide the listing from the shop.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeListing(listing.id, user.email, isAdmin);
          router.replace({ pathname: '/community', params: { segment: 'shop' } });
        },
      },
    ]);
  }

  return (
    <Screen scroll padded>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: theme.surface }]}>
          <ArrowLeft size={20} color={theme.text} strokeWidth={1.8} />
        </Pressable>
        <ThemedText type="subtitle">Edit listing</ThemedText>
      </View>

      <View style={styles.form}>
        <TextField label="Title" value={title} onChangeText={setTitle} />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          style={styles.bodyInput}
        />
        <TextField
          label="Price (BDT)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        {(listing.isOfficialStore || listing.sellerId === PLANTCARE_STORE_ID) ? (
          <TextField
            label="Quantity"
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
              <ThemedText type="smallBold" themeColor="primary">Change photo</ThemedText>
            </View>
          )}
        </Pressable>

        <Button title="Save changes" onPress={onSave} loading={loading} />
        <Button title="Remove listing" variant="danger" onPress={onRemove} />
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
  form: { gap: Spacing.three, paddingBottom: Spacing.five },
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
