import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Switch, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { usePlants } from '@/context/plants';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AddPlantScreen() {
  const { isLoading } = usePlants();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editId = typeof id === 'string' ? id : undefined;

  if (isLoading) {
    return (
      <Screen padded>
        <ThemedText type="default" themeColor="textSecondary">
          Loading plant details...
        </ThemedText>
      </Screen>
    );
  }

  return <PlantForm key={editId ?? 'new'} editId={editId} />;
}

function PlantForm({ editId }: { editId?: string }) {
  const theme = useTheme();
  const { addPlant, plants, updatePlant } = usePlants();
  const editingPlant = editId ? plants.find((plant) => plant.id === editId) : undefined;
  const initialName = editingPlant?.name ?? '';
  const initialType = editingPlant?.type ?? '';
  const initialFrequency = editingPlant ? String(editingPlant.wateringFrequency) : '';
  const initialNotes = editingPlant?.notes ?? '';
  const [imageUri, setImageUri] = useState(editingPlant?.image ?? '');
  const [nickname, setNickname] = useState(editingPlant?.nickname ?? '');
  const [light, setLight] = useState(editingPlant?.lightRequirement ?? '');
  const [location, setLocation] = useState(editingPlant?.location ?? '');
  const [age, setAge] = useState(editingPlant?.age ?? '');
  const [soilType, setSoilType] = useState(editingPlant?.soilType ?? '');
  const [potSize, setPotSize] = useState(editingPlant?.potSize ?? '');
  const [acquisitionDate, setAcquisitionDate] = useState(editingPlant?.acquisitionDate ?? '');
  const [petSafe, setPetSafe] = useState(editingPlant?.petSafe ?? false);
  const [reminderEnabled, setReminderEnabled] = useState(editingPlant?.reminderEnabled ?? false);
  const [fertilizingFrequency, setFertilizingFrequency] = useState(
    editingPlant?.fertilizingFrequency ? String(editingPlant.fertilizingFrequency) : '',
  );
  const [name, setName] = useState(initialName);
  const [type, setType] = useState(initialType);
  const [frequency, setFrequency] = useState(initialFrequency);
  const [notes, setNotes] = useState(initialNotes);
  const [errors, setErrors] = useState<{ name?: string; type?: string; frequency?: string }>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useFocusEffect(
    useCallback(() => {
      if (editId) return;
      setImageUri('');
      setNickname('');
      setLight('');
      setLocation('');
      setAge('');
      setSoilType('');
      setPotSize('');
      setAcquisitionDate('');
      setPetSafe(false);
      setReminderEnabled(false);
      setFertilizingFrequency('');
      setName('');
      setType('');
      setFrequency('');
      setNotes('');
      setErrors({});
      setLoading(false);
      setStep(1);
    }, [editId]),
  );

  function validate() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Plant name is required';
    if (!type.trim()) next.type = 'Plant type is required';
    if (!frequency.trim()) next.frequency = 'Watering frequency is required';
    else if (isNaN(Number(frequency)) || Number(frequency) < 1) {
      next.frequency = 'Enter a valid number of days';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit() {
    if (!validate()) {
      setStep(1);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const updates = {
        name: name.trim(),
        type: type.trim(),
        wateringFrequency: Number(frequency),
        fertilizingFrequency: fertilizingFrequency ? Number(fertilizingFrequency) : undefined,
        nickname: nickname.trim() || undefined,
        image: imageUri || undefined,
        lightRequirement: light.trim() || undefined,
        location: location.trim() || undefined,
        age: age.trim() || undefined,
        soilType: soilType.trim() || undefined,
        potSize: potSize.trim() || undefined,
        acquisitionDate: acquisitionDate.trim() || undefined,
        petSafe,
        reminderEnabled,
        notes: notes.trim() || undefined,
      };
      if (editId) {
        updatePlant(editId, updates);
      } else {
        addPlant({
          ...updates,
          status: 'Healthy',
          lastWatered: new Date().toISOString().split('T')[0],
        });
      }
      setLoading(false);
      router.replace('/plants');
    }, 400);
  }

  return (
    <Screen padded tabBarInset>
      <View style={styles.header}>
        <ThemedText type="subtitle">{editId ? 'Edit plant' : 'Add a plant'}</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          {editId ? 'Update plant details' : `Step ${step} of 3 · Plant details`}
        </ThemedText>
        {!editId ? (
          <View style={styles.progressRow}>
            {[1, 2, 3].map((item) => (
              <View
                key={item}
                style={[
                  styles.progressTrack,
                  { backgroundColor: item <= step ? theme.primary : theme.border },
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>

      <ThemedView type="backgroundElement" style={styles.form}>
        {step === 1 ? <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose plant photo"
          onPress={async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) return;
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled) setImageUri(result.assets[0].uri);
          }}
          style={[styles.photoPicker, { borderColor: theme.border }]}>
          <View style={[styles.photoThumb, { backgroundColor: `${theme.primary}18` }]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photoPreview} />
            ) : (
              <SymbolView
                name={{ ios: 'photo', android: 'add_a_photo', web: 'add_a_photo' }}
                tintColor={theme.primary}
                size={20}
              />
            )}
          </View>
          <View style={styles.photoCopy}>
            <ThemedText type="smallBold">
              {imageUri ? 'Change plant photo' : 'Add plant photo'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Optional · JPG or PNG
            </ThemedText>
          </View>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'arrow_forward', web: 'arrow_forward' }}
            tintColor={theme.textSecondary}
            size={18}
          />
        </Pressable> : null}
        {step === 1 ? <View style={styles.stepSection}>
        <TextField
          label="Name"
          placeholder="e.g. Monstera"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          error={errors.name}
        />
        <TextField
          label="Type"
          placeholder="e.g. Tropical"
          value={type}
          onChangeText={setType}
          autoCapitalize="words"
          error={errors.type}
        />
        <TextField
          label="Nickname"
          placeholder="e.g. Mona"
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize="words"
        />
        <TextField
          label="Watering (days)"
          placeholder="e.g. 7"
          value={frequency}
          onChangeText={setFrequency}
          keyboardType="numeric"
          error={errors.frequency}
        />
        <TextField
          label="Age"
          placeholder="e.g. 2 years"
          value={age}
          onChangeText={setAge}
        />
        </View> : null}
        {step === 2 ? <View style={styles.stepSection}>
        <TextField
          label="Fertilizing (days)"
          placeholder="e.g. 30"
          value={fertilizingFrequency}
          onChangeText={setFertilizingFrequency}
          keyboardType="numeric"
        />
        <TextField
          label="Light"
          placeholder="e.g. Bright indirect light"
          value={light}
          onChangeText={setLight}
        />
        <TextField
          label="Location"
          placeholder="e.g. Living room"
          value={location}
          onChangeText={setLocation}
        />
        <TextField
          label="Soil"
          placeholder="e.g. Well-draining potting mix"
          value={soilType}
          onChangeText={setSoilType}
        />
        <TextField
          label="Pot size"
          placeholder="e.g. 8 inch"
          value={potSize}
          onChangeText={setPotSize}
        />
        </View> : null}
        {step === 3 ? <View style={styles.stepSection}>
        <TextField
          label="Acquired"
          placeholder="e.g. 2026-10-16"
          value={acquisitionDate}
          onChangeText={setAcquisitionDate}
        />
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <ThemedText type="smallBold">Pet safe</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Mark this plant as safe around pets
            </ThemedText>
          </View>
          <Switch value={petSafe} onValueChange={setPetSafe} />
        </View>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <ThemedText type="smallBold">Care reminder</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Remind me when this plant needs watering
            </ThemedText>
          </View>
          <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
        </View>
        <TextField
          label="Notes"
          placeholder="Any care notes?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
        </View> : null}
        <View style={styles.stepActions}>
          {step > 1 ? <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} style={styles.stepButton} /> : null}
          {step < 3 ? (
            <Button title="Continue" onPress={() => { if (step === 1 && !validate()) return; setStep(step + 1); }} style={styles.stepButton} />
          ) : (
        <Button
          title={editId ? 'Save changes' : 'Add plant'}
          onPress={onSubmit}
          loading={loading}
          style={styles.cta}
        />
          )}
        </View>
      </ThemedView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },
  form: {
    padding: Spacing.two,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  stepSection: {
    gap: Spacing.two,
  },
  stepActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  stepButton: {
    flex: 1,
  },
  cta: {
    minHeight: 48,
    borderRadius: Spacing.three,
    marginTop: Spacing.one,
  },
  photoPicker: {
    minHeight: 72,
    borderRadius: Spacing.two,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
  },
  photoThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoCopy: {
    flex: 1,
    gap: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  switchText: {
    flex: 1,
    gap: Spacing.one,
  },
});
