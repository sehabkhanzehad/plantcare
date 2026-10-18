import { useState, type ComponentProps } from 'react';
import { Image, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Grid2X2, List, Search, SlidersHorizontal } from 'lucide-react-native';

import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { usePlants, type Plant } from '@/context/plants';
import { CardRadius, Spacing } from '@/constants/theme';
import { usePlantsUiPrefs } from '@/hooks/use-plants-ui-prefs';
import { useTheme } from '@/hooks/use-theme';

export default function PlantsScreen() {
  const { plants, deletePlant, updatePlant } = usePlants();
  const theme = useTheme();
  const [editingId, setEditingId] = useState<string>();
  const [deletingId, setDeletingId] = useState<string>();
  const [query, setQuery] = useState('');
  const { viewMode, setViewMode } = usePlantsUiPrefs();
  const [filter, setFilter] = useState<'All' | 'Healthy' | 'Needs Attention' | 'Overdue'>('All');
  const editingPlant = plants.find((plant) => plant.id === editingId);
  const deletingPlant = plants.find((plant) => plant.id === deletingId);
  const filteredPlants = plants.filter((plant) => {
    const matchesQuery = `${plant.name} ${plant.type} ${plant.nickname ?? ''}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return matchesQuery && (filter === 'All' || plant.status === filter);
  });

  return (
    <Screen scroll tabBarInset>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <ThemedText style={styles.title}>My plants</ThemedText>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              {plants.length} plant{plants.length !== 1 ? 's' : ''} in your garden
            </ThemedText>
          </View>
          <View style={[styles.countBadge, { backgroundColor: `${theme.primary}18` }]}>
            <ThemedText style={[styles.countText, { color: theme.primary }]}>{plants.length}</ThemedText>
          </View>
        </View>
        <View style={[styles.searchBar, theme.card]}>
          <Search size={19} color={theme.textSecondary} strokeWidth={1.8} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search your plants"
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
          />
          <Pressable accessibilityLabel="Filter plants" style={styles.searchAction}>
            <SlidersHorizontal size={18} color={theme.primary} strokeWidth={1.8} />
          </Pressable>
        </View>
        <View style={styles.toolbar}>
          <View style={styles.filters}>
            {(['All', 'Healthy', 'Needs Attention', 'Overdue'] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filter,
                  {
                    backgroundColor: filter === item ? theme.primary : theme.surface,
                    borderColor: filter === item ? theme.primary : theme.border,
                  },
                ]}>
                <ThemedText type="small" style={{ color: filter === item ? theme.onPrimary : theme.textSecondary }}>
                  {item === 'Needs Attention' ? 'Needs care' : item}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          <View style={[styles.viewToggle, theme.cardElevated]}>
            <Pressable onPress={() => setViewMode('grid')} accessibilityLabel="Grid view" style={[styles.viewButton, viewMode === 'grid' && { backgroundColor: theme.primary }]}>
              <Grid2X2 size={17} color={viewMode === 'grid' ? theme.onPrimary : theme.textSecondary} />
            </Pressable>
            <Pressable onPress={() => setViewMode('list')} accessibilityLabel="List view" style={[styles.viewButton, viewMode === 'list' && { backgroundColor: theme.primary }]}>
              <List size={18} color={viewMode === 'list' ? theme.onPrimary : theme.textSecondary} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.list, viewMode === 'grid' && styles.grid]}>
        {filteredPlants.length === 0 ? (
          <Empty />
        ) : (
          filteredPlants.map((plant) => (
            <Pressable
              key={plant.id}
              onPress={() =>
                router.push({ pathname: '/plant/[id]', params: { id: plant.id } })
              }
              style={[styles.cardPressable, viewMode === 'grid' && styles.gridCardPressable]}>
              <ThemedView
                type="backgroundElement"
                style={[styles.card, viewMode === 'grid' && styles.gridCard]}>
                <View style={[styles.cardTop, viewMode === 'grid' && styles.gridCardTop]}>
                  <View style={[
                    styles.thumbnail,
                    viewMode === 'grid' && styles.gridThumbnail,
                    { backgroundColor: `${theme.primary}18` },
                  ]}>
                    {plant.image ? (
                      <Image
                        source={{ uri: plant.image }}
                        style={styles.thumbnailImage}
                        accessibilityLabel={`${plant.name} photo`}
                      />
                    ) : (
                      <SymbolView
                        name={{ ios: 'leaf', android: 'eco', web: 'eco' }}
                        tintColor={theme.primary}
                        size={24}
                      />
                    )}
                  </View>
                  <View style={[styles.cardText, viewMode === 'grid' && styles.gridCardText]}>
                    <ThemedText type="smallBold" numberOfLines={1}>{plant.name}</ThemedText>
                    {viewMode === 'list' ? (
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                        {plant.type} · Every {plant.wateringFrequency} days
                      </ThemedText>
                    ) : null}
                  </View>
                  <View style={[styles.cardTopRight, viewMode === 'grid' && styles.gridCardTopRight]}>
                    {viewMode === 'list' ? <StatusChip status={plant.status} /> : null}
                    <View style={[styles.actions, viewMode === 'grid' && styles.gridActions]}>
                      <Pressable
                        accessibilityLabel={`Edit ${plant.name}`}
                        onPress={(event) => {
                          event.stopPropagation();
                          setEditingId(plant.id);
                        }}
                        style={[styles.iconButton, { backgroundColor: `${theme.primary}18` }]}>
                        <SymbolView
                          name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                          tintColor={theme.primary}
                          size={18}
                        />
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`Delete ${plant.name}`}
                        onPress={(event) => {
                          event.stopPropagation();
                          setDeletingId(plant.id);
                        }}
                        style={[styles.iconButton, { backgroundColor: `${theme.danger}18` }]}>
                        <SymbolView
                          name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                          tintColor={theme.danger}
                          size={18}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
                {viewMode === 'list' ? (
                  <View style={styles.cardBottom}>
                    <View style={styles.cardDetails}>
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                        Last watered {plant.lastWatered}
                      </ThemedText>
                    </View>
                  </View>
                ) : null}
              </ThemedView>
            </Pressable>
          ))
        )}
      </View>

      <EditPlantModal
        key={editingId ?? 'edit'}
        plant={editingPlant}
        visible={Boolean(editingPlant)}
        onClose={() => setEditingId(undefined)}
        onSave={(updates) => {
          if (editingId) updatePlant(editingId, updates);
          setEditingId(undefined);
        }}
      />
      <DeletePlantModal
        plantName={deletingPlant?.name}
        visible={Boolean(deletingPlant)}
        onCancel={() => setDeletingId(undefined)}
        onConfirm={() => {
          if (deletingId) deletePlant(deletingId);
          setDeletingId(undefined);
        }}
      />
    </Screen>
  );
}

function EditPlantModal({
  plant,
  visible,
  onClose,
  onSave,
}: {
  plant?: Plant;
  visible: boolean;
  onClose: () => void;
  onSave: (updates: { name: string; type: string; wateringFrequency: number; notes?: string }) => void;
}) {
  const theme = useTheme();
  const [name, setName] = useState(plant?.name ?? '');
  const [type, setType] = useState(plant?.type ?? '');
  const [frequency, setFrequency] = useState(
    plant ? String(plant.wateringFrequency) : '',
  );
  const [notes, setNotes] = useState(plant?.notes ?? '');

  if (!plant) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <View>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Edit plant
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Update your plant details
              </ThemedText>
            </View>
            <Pressable onPress={onClose} accessibilityLabel="Close edit modal">
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                tintColor={theme.textSecondary}
                size={20}
              />
            </Pressable>
          </View>
          <ModalField label="Plant name" value={name} onChangeText={setName} />
          <ModalField label="Plant type" value={type} onChangeText={setType} />
          <ModalField
            label="Water every (days)"
            value={frequency}
            onChangeText={setFrequency}
            keyboardType="numeric"
          />
          <ModalField label="Notes" value={notes} onChangeText={setNotes} multiline />
          <View style={styles.modalActions}>
            <Button title="Cancel" variant="secondary" onPress={onClose} style={styles.modalButton} />
            <Button
              title="Save"
              onPress={() => {
                const days = Number(frequency);
                if (!name.trim() || !type.trim() || !Number.isFinite(days) || days < 1) return;
                onSave({
                  name: name.trim(),
                  type: type.trim(),
                  wateringFrequency: days,
                  notes: notes.trim() || undefined,
                });
              }}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ModalField({
  label,
  ...props
}: { label: string } & ComponentProps<typeof TextInput>) {
  const theme = useTheme();
  return (
    <View style={styles.modalField}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        {...props}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.modalInput,
          { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      />
    </View>
  );
}

function DeletePlantModal({
  plantName,
  visible,
  onCancel,
  onConfirm,
}: {
  plantName?: string;
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const theme = useTheme();
  if (!plantName) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.confirmCard, { backgroundColor: theme.background }]}>
          <View style={[styles.deleteIcon, { backgroundColor: `${theme.danger}18` }]}>
            <SymbolView
              name={{ ios: 'trash', android: 'delete', web: 'delete' }}
              tintColor={theme.danger}
              size={24}
            />
          </View>
          <ThemedText type="subtitle" style={styles.confirmTitle}>
            Delete plant?
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.confirmText}>
            Remove {plantName} permanently from your garden?
          </ThemedText>
          <View style={styles.modalActions}>
            <Button title="Cancel" variant="secondary" onPress={onCancel} style={styles.modalButton} />
            <Button title="Delete" variant="danger" onPress={onConfirm} style={styles.modalButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Empty() {
  return (
    <ThemedView type="backgroundElement" style={styles.empty}>
      <ThemedText type="small" themeColor="textSecondary">
        No plants yet. Add your first plant to get started.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 3,
  },
  countBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 18,
    fontWeight: '800',
  },
  searchBar: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: CardRadius,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  searchInput: {
    flex: 1,
    minHeight: 46,
    fontSize: 14,
  },
  searchAction: { padding: 5 },
  toolbar: { gap: Spacing.two },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  filter: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  viewToggle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    gap: 2,
  },
  viewButton: {
    width: 34,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    padding: Spacing.three,
    borderRadius: CardRadius,
    gap: Spacing.two,
  },
  gridCard: {
    padding: 10,
    gap: 9,
  },
  cardPressable: {
    width: '100%',
  },
  gridCardPressable: {
    width: '48.5%',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  gridCardTop: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  gridCardText: {
    width: '100%',
    paddingTop: 0,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    paddingTop: Spacing.one,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  gridThumbnail: {
    width: '100%',
    height: 118,
    borderRadius: 15,
  },
  cardTopRight: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  gridCardTopRight: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cardBottom: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  gridActions: {
    gap: 6,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 22, 17, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: CardRadius,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  modalTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  modalField: {
    gap: Spacing.one,
  },
  modalInput: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: Spacing.two,
  },
  gridCardBottom: {
    marginTop: 0,
  },
  gridCardDetails: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: CardRadius,
    padding: Spacing.four,
    alignItems: 'center',
  },
  deleteIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  confirmTitle: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
  },
  confirmText: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  empty: {
    padding: Spacing.three,
    borderRadius: CardRadius,
    alignItems: 'center',
  },
});
