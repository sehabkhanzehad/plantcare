import { createContext, useContext, useCallback, useMemo, type PropsWithChildren } from 'react';

import { useStorageState } from '@/hooks/use-storage-state';
import type { CareStatus } from '@/constants/mock-data';
import { cancelPlantNotifications } from '@/lib/care-notifications';
import { getCareStatus } from '@/lib/care';

export type Plant = {
  id: string;
  name: string;
  type: string;
  status: CareStatus;
  lastWatered: string;
  wateringFrequency: number;
  nickname?: string;
  lastFertilized?: string;
  fertilizingFrequency?: number;
  lightRequirement?: string;
  location?: string;
  soilType?: string;
  age?: string;
  potSize?: string;
  acquisitionDate?: string;
  petSafe?: boolean;
  reminderEnabled?: boolean;
  carePausedUntil?: string;
  image?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CareLog = {
  id: string;
  plantId: string;
  action: 'watered' | 'fertilized' | 'repotted' | 'pruned';
  completedAt: string;
  note?: string;
};

export type GrowthEntry = {
  id: string;
  plantId: string;
  imageUri?: string;
  note?: string;
  recordedAt: string;
};

type PlantsContextValue = {
  plants: Plant[];
  careLogs: CareLog[];
  growthEntries: GrowthEntry[];
  addPlant: (plant: Omit<Plant, 'id' | 'createdAt'>) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  deletePlant: (id: string) => void;
  waterPlant: (id: string) => void;
  logCare: (id: string, action: CareLog['action'], note?: string) => void;
  addGrowthEntry: (entry: Omit<GrowthEntry, 'id' | 'recordedAt'>) => void;
  deleteGrowthEntry: (id: string) => void;
  isLoading: boolean;
};

const PlantsContext = createContext<PlantsContextValue | null>(null);

const PLANTS_KEY = 'plantcare_plants';
const CARE_LOGS_KEY = 'plantcare_care_logs';
const GROWTH_KEY = 'plantcare_growth_entries';

function nowISO() {
  return new Date().toISOString();
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function getPlantStatus(plant: Plant): CareStatus {
  return getCareStatus(plant);
}

export function usePlants() {
  const value = useContext(PlantsContext);
  if (!value) {
    throw new Error('usePlants must be wrapped in a <PlantsProvider />');
  }
  return value;
}

export function PlantsProvider({ children }: PropsWithChildren) {
  const [[isLoading, raw], setRaw] = useStorageState(PLANTS_KEY);
  const [[isLogsLoading, logsRaw], setLogsRaw] = useStorageState(CARE_LOGS_KEY);
  const [[isGrowthLoading, growthRaw], setGrowthRaw] = useStorageState(GROWTH_KEY);

  const plants: Plant[] = useMemo(() => {
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, [raw]);
  const careLogs: CareLog[] = useMemo(() => {
    if (!logsRaw) return [];
    try {
      return JSON.parse(logsRaw);
    } catch {
      return [];
    }
  }, [logsRaw]);
  const growthEntries: GrowthEntry[] = useMemo(() => {
    if (!growthRaw) return [];
    try {
      return JSON.parse(growthRaw);
    } catch {
      return [];
    }
  }, [growthRaw]);

  const setPlants = useCallback(
    (next: Plant[]) => {
      setRaw(JSON.stringify(next));
    },
    [setRaw],
  );

  const addPlant = useCallback(
    (input: Omit<Plant, 'id' | 'createdAt'>) => {
      const next: Plant = {
        ...input,
        id: `plant-${Date.now()}`,
        createdAt: nowISO(),
      };
      setPlants([...plants, next]);
    },
    [plants, setPlants],
  );

  const updatePlant = useCallback(
    (id: string, updates: Partial<Plant>) => {
      const nextPlants = plants.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: nowISO() } : p));
      setPlants(nextPlants);
    },
    [plants, setPlants],
  );

  const deletePlant = useCallback(
    (id: string) => {
      cancelPlantNotifications(id).catch(() => undefined);
      setPlants(plants.filter((p) => p.id !== id));
      setLogsRaw(JSON.stringify(careLogs.filter((log) => log.plantId !== id)));
      setGrowthRaw(JSON.stringify(growthEntries.filter((entry) => entry.plantId !== id)));
    },
    [careLogs, growthEntries, plants, setGrowthRaw, setLogsRaw, setPlants],
  );

  const waterPlant = useCallback(
    (id: string) => {
      const completedAt = nowISO();
      setPlants(
        plants.map((p) =>
          p.id === id
            ? { ...p, lastWatered: todayISO(), status: 'Healthy', updatedAt: nowISO() }
            : p,
        ),
      );
      const log: CareLog = { id: `care-${Date.now()}`, plantId: id, action: 'watered', completedAt };
      setLogsRaw(JSON.stringify([log, ...careLogs]));
    },
    [careLogs, plants, setLogsRaw, setPlants],
  );

  const logCare = useCallback(
    (id: string, action: CareLog['action'], note?: string) => {
      const completedAt = nowISO();
      const log: CareLog = {
        id: `care-${Date.now()}`,
        plantId: id,
        action,
        completedAt,
        note,
      };
      setLogsRaw(JSON.stringify([log, ...careLogs]));
      if (action === 'watered') {
        setPlants(plants.map((p) => (p.id === id ? { ...p, lastWatered: todayISO(), status: 'Healthy', updatedAt: nowISO() } : p)));
      } else if (action === 'fertilized') {
        setPlants(plants.map((p) => (p.id === id ? { ...p, lastFertilized: todayISO(), updatedAt: nowISO() } : p)));
      }
    },
    [careLogs, plants, setLogsRaw, setPlants],
  );

  const addGrowthEntry = useCallback(
    (entry: Omit<GrowthEntry, 'id' | 'recordedAt'>) => {
      const next: GrowthEntry = { ...entry, id: `growth-${Date.now()}`, recordedAt: nowISO() };
      setGrowthRaw(JSON.stringify([next, ...growthEntries]));
    },
    [growthEntries, setGrowthRaw],
  );

  const deleteGrowthEntry = useCallback(
    (id: string) => {
      setGrowthRaw(JSON.stringify(growthEntries.filter((entry) => entry.id !== id)));
    },
    [growthEntries, setGrowthRaw],
  );

  return (
    <PlantsContext.Provider
      value={{
        plants: plants.map((plant) => ({ ...plant, status: getPlantStatus(plant) })),
        careLogs,
        growthEntries,
        addPlant,
        updatePlant,
        deletePlant,
        waterPlant,
        logCare,
        addGrowthEntry,
        deleteGrowthEntry,
        isLoading: isLoading || isLogsLoading || isGrowthLoading,
      }}>
      {children}
    </PlantsContext.Provider>
  );
}
