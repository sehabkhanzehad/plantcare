import { useState, type ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { usePlants, type Plant } from '@/context/plants';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function PlantsScreen() {
  const { plants, deletePlant, updatePlant } = usePlants();
  const theme = useTheme();
  const [editingId, setEditingId] = useState<string>();
  const [deletingId, setDeletingId] = useState<string>();
  const editingPlant = plants.find((plant) => plant.id === editingId);
  const deletingPlant = plants.find((plant) => plant.id === deletingId);

  return (
    <Screen scroll tabBarInset>
      <View style={styles.header}>
        <ThemedText type="subtitle">My Plants</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          {plants.length} plant{plants.length !== 1 ? 's' : ''} in your garden
        </ThemedText>
      </View>

      <View style={styles.list}>
        {plants.length === 0 ? (
          <Empty />
        ) : (
          plants.map((plant) => (
            <ThemedView key={plant.id} type="backgroundElement" style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardText}>
                  <ThemedText type="smallBold">{plant.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {plant.type} · {plant.wateringFrequency} days watering cycle
                  </ThemedText>
                </View>
                <View style={styles.cardTopRight}>
                  <StatusChip status={plant.status} />
                  <View style={styles.actions}>
                    <Pressable
                      accessibilityLabel={`Edit ${plant.name}`}
                      onPress={() => setEditingId(plant.id)}
                      style={[styles.iconButton, { backgroundColor: `${theme.primary}18` }]}>
                      <SymbolView
                        name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                        tintColor={theme.primary}
                        size={18}
                      />
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Delete ${plant.name}`}
                      onPress={() => setDeletingId(plant.id)}
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
              <View style={styles.cardBottom}>
                <View style={styles.cardDetails}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Last watered {plant.lastWatered}
                  </ThemedText>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    Added {new Date(plant.createdAt).toLocaleDateString()}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
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
  list: {
    gap: Spacing.two,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTopRight: {
    alignItems: 'flex-end',
    gap: Spacing.two,
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
    borderRadius: Spacing.four,
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
  confirmCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Spacing.four,
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
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
});
