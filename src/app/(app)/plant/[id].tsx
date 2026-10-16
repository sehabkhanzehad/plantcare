import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getPlantStatus, usePlants } from '@/context/plants';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function PlantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plants, careLogs, growthEntries, addGrowthEntry, deleteGrowthEntry, waterPlant, logCare } = usePlants();
  const theme = useTheme();
  const plant = plants.find((item) => item.id === id);

  if (!plant) {
    return (
      <Screen padded>
        <ThemedText type="subtitle">Plant not found</ThemedText>
        <Button title="Back to plants" onPress={() => router.replace('/plants')} />
      </Screen>
    );
  }

  const logs = careLogs.filter((log) => log.plantId === plant.id).slice(0, 8);
  const nextWatering = new Date(`${plant.lastWatered}T00:00:00`);
  nextWatering.setDate(nextWatering.getDate() + plant.wateringFrequency);

  return (
    <Screen scroll padded tabBarInset>
      <View style={styles.header}>
        <ThemedText type="subtitle">{plant.name}</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          {plant.nickname ? `${plant.nickname} · ` : ''}{plant.type}
        </ThemedText>
        <StatusChip status={getPlantStatus(plant)} />
      </View>
      <ThemedView type="backgroundElement" style={styles.card}>
        {plant.image ? <Image source={{ uri: plant.image }} style={styles.heroImage} /> : null}
        <Info label="Last watered" value={plant.lastWatered} />
        <Info label="Next watering" value={nextWatering.toLocaleDateString()} />
        <Info label="Watering cycle" value={`${plant.wateringFrequency} days`} />
        {plant.lightRequirement ? <Info label="Light" value={plant.lightRequirement} /> : null}
        {plant.location ? <Info label="Location" value={plant.location} /> : null}
        {plant.notes ? <Info label="Notes" value={plant.notes} /> : null}
        <View style={styles.careActions}>
          <Button title="Mark as watered" onPress={() => waterPlant(plant.id)} style={styles.actionButton} />
          <Button
            title="Log fertilizer"
            variant="secondary"
            onPress={() => logCare(plant.id, 'fertilized')}
            style={styles.actionButton}
          />
        </View>
      </ThemedView>
      <ThemedText type="smallBold" style={styles.sectionTitle}>Growth journal</ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        <Pressable
          onPress={async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) return;
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled) {
              addGrowthEntry({ plantId: plant.id, imageUri: result.assets[0].uri });
            }
          }}
          style={[styles.growthButton, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="primary">Add growth photo</ThemedText>
        </Pressable>
        {growthEntries.filter((entry) => entry.plantId === plant.id).map((entry) => (
          <View key={entry.id} style={styles.growthEntry}>
            {entry.imageUri ? <Image source={{ uri: entry.imageUri }} style={styles.growthImage} /> : null}
            <View style={styles.growthMeta}>
              <ThemedText type="small" themeColor="textSecondary">
                {new Date(entry.recordedAt).toLocaleDateString()}
              </ThemedText>
              <Pressable onPress={() => deleteGrowthEntry(entry.id)}>
                <ThemedText type="smallBold" style={{ color: theme.danger }}>Remove</ThemedText>
              </Pressable>
            </View>
          </View>
        ))}
      </ThemedView>
      <ThemedText type="smallBold" style={styles.sectionTitle}>Care history</ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        {logs.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">No care activity recorded yet.</ThemedText>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <ThemedText type="smallBold">{log.action}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {new Date(log.completedAt).toLocaleDateString()}
              </ThemedText>
            </View>
          ))
        )}
      </ThemedView>
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two, marginBottom: Spacing.four },
  card: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.three },
  heroImage: { width: '100%', height: 220, borderRadius: Spacing.three },
  info: { gap: Spacing.one },
  careActions: { gap: Spacing.two, marginTop: Spacing.one },
  actionButton: { minHeight: 46 },
  sectionTitle: { marginTop: Spacing.four, marginBottom: Spacing.two },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  growthButton: { minHeight: 46, borderWidth: 1, borderRadius: Spacing.two, alignItems: 'center', justifyContent: 'center' },
  growthEntry: { gap: Spacing.two },
  growthImage: { width: '100%', height: 180, borderRadius: Spacing.two },
  growthMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
