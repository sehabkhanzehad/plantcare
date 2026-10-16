import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { usePlants } from '@/context/plants';
import { Spacing } from '@/constants/theme';

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
  const { addPlant, plants, updatePlant } = usePlants();
  const editingPlant = editId ? plants.find((plant) => plant.id === editId) : undefined;
  const initialName = editingPlant?.name ?? '';
  const initialType = editingPlant?.type ?? '';
  const initialFrequency = editingPlant ? String(editingPlant.wateringFrequency) : '';
  const initialNotes = editingPlant?.notes ?? '';
  const [name, setName] = useState(initialName);
  const [type, setType] = useState(initialType);
  const [frequency, setFrequency] = useState(initialFrequency);
  const [notes, setNotes] = useState(initialNotes);
  const [errors, setErrors] = useState<{ name?: string; type?: string; frequency?: string }>({});
  const [loading, setLoading] = useState(false);

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
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const updates = {
        name: name.trim(),
        type: type.trim(),
        wateringFrequency: Number(frequency),
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
    <Screen scroll padded tabBarInset>
      <View style={styles.header}>
        <ThemedText type="subtitle">{editId ? 'Edit plant' : 'Add a plant'}</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          {editId ? 'Update your plant details' : 'Tell us about your new plant friend'}
        </ThemedText>
      </View>

      <ThemedView type="backgroundElement" style={styles.form}>
        <TextField
          label="Plant name"
          placeholder="e.g. Monstera"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          error={errors.name}
        />
        <TextField
          label="Plant type"
          placeholder="e.g. Tropical"
          value={type}
          onChangeText={setType}
          autoCapitalize="words"
          error={errors.type}
        />
        <TextField
          label="Water every (days)"
          placeholder="e.g. 7"
          value={frequency}
          onChangeText={setFrequency}
          keyboardType="numeric"
          error={errors.frequency}
        />
        <TextField
          label="Notes (optional)"
          placeholder="Any care notes?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
        <Button
          title={editId ? 'Save changes' : 'Add plant'}
          onPress={onSubmit}
          loading={loading}
          style={styles.cta}
        />
      </ThemedView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  form: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
  cta: {
    minHeight: 52,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
});
