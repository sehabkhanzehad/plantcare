import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { GrowthTimeline } from '@/components/growth-timeline';
import { StatusChip } from '@/components/status-chip';
import { SurfaceCard } from '@/components/ui/surface-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { findCatalogByName } from '@/constants/plant-type-catalog';
import { getPlantStatus, usePlants } from '@/context/plants';
import { addDays, dateKey, isCarePaused } from '@/lib/care';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function PlantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    plants,
    careLogs,
    growthEntries,
    addGrowthEntry,
    deleteGrowthEntry,
    waterPlant,
    logCare,
    updatePlant,
  } = usePlants();
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
  const plantGrowth = growthEntries.filter((entry) => entry.plantId === plant.id);
  const catalog = findCatalogByName(plant.type);
  const nextWatering = new Date(`${plant.lastWatered}T00:00:00`);
  nextWatering.setDate(nextWatering.getDate() + plant.wateringFrequency);
  const paused = isCarePaused(plant);

  const plantId = plant.id;

  function pauseForDays(days: number) {
    const until = addDays(dateKey(new Date()), days);
    updatePlant(plantId, { carePausedUntil: until });
  }

  function clearPause() {
    updatePlant(plantId, { carePausedUntil: undefined });
  }

  return (
    <Screen scroll padded tabBarInset>
      <View style={styles.header}>
        <ThemedText type="subtitle">{plant.name}</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          {plant.nickname ? `${plant.nickname} · ` : ''}{plant.type}
        </ThemedText>
        <StatusChip status={getPlantStatus(plant)} />
        {paused ? (
          <ThemedText type="small" style={{ color: theme.statusAttention }}>
            Reminders paused until {plant.carePausedUntil}
          </ThemedText>
        ) : null}
      </View>

      <SurfaceCard style={styles.cardGap}>
        {plant.image ? <Image source={{ uri: plant.image }} style={styles.heroImage} /> : null}
        <Info label="Last watered" value={plant.lastWatered} />
        <Info label="Next watering" value={nextWatering.toLocaleDateString()} />
        <Info label="Watering cycle" value={`${plant.wateringFrequency} days`} />
        {plant.lastFertilized ? <Info label="Last fertilized" value={plant.lastFertilized} /> : null}
        {plant.fertilizingFrequency ? (
          <Info label="Fertilizing cycle" value={`${plant.fertilizingFrequency} days`} />
        ) : null}
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
          <Button
            title="List for sale"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/shop/create',
                params: {
                  plantId: plant.id,
                  title: plant.name,
                  type: plant.type,
                  image: plant.image ?? '',
                },
              })
            }
            style={styles.actionButton}
          />
        </View>
      </SurfaceCard>

      {catalog ? (
        <SurfaceCard style={styles.cardGap}>
          <ThemedText type="smallBold">Care tip</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{catalog.careTip}</ThemedText>
        </SurfaceCard>
      ) : null}

      <SurfaceCard style={styles.cardGap}>
        <ThemedText type="smallBold">Vacation pause</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.pauseHint}>
          Pause reminders and today&apos;s tasks while you&apos;re away.
        </ThemedText>
        <View style={styles.pauseRow}>
          {[3, 7, 14].map((days) => (
            <Pressable
              key={days}
              onPress={() => pauseForDays(days)}
              style={[styles.pauseChip, { borderColor: theme.border }]}>
              <ThemedText type="smallBold">{days}d</ThemedText>
            </Pressable>
          ))}
          {paused ? (
            <Pressable onPress={clearPause} style={[styles.pauseChip, { borderColor: theme.danger }]}>
              <ThemedText type="smallBold" style={{ color: theme.danger }}>Resume</ThemedText>
            </Pressable>
          ) : null}
        </View>
      </SurfaceCard>

      <ThemedText type="smallBold" style={styles.sectionTitle}>Growth journal</ThemedText>
      <SurfaceCard>
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
        <GrowthTimeline entries={plantGrowth} onRemove={deleteGrowthEntry} />
      </SurfaceCard>

      <ThemedText type="smallBold" style={styles.sectionTitle}>Care history</ThemedText>
      <SurfaceCard>
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
      </SurfaceCard>
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
  cardGap: { marginBottom: Spacing.three },
  heroImage: { width: '100%', height: 220, borderRadius: Spacing.three },
  info: { gap: Spacing.one },
  careActions: { gap: Spacing.two, marginTop: Spacing.one },
  actionButton: { minHeight: 46 },
  sectionTitle: { marginTop: Spacing.four, marginBottom: Spacing.two },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  growthButton: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  pauseHint: { marginBottom: Spacing.two },
  pauseRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pauseChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
