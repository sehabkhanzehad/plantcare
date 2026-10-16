import { createContext, useContext, useCallback, useMemo, type PropsWithChildren } from 'react';

import { useStorageState } from '@/hooks/use-storage-state';
import type { CareStatus } from '@/constants/mock-data';

export type Plant = {
  id: string;
  name: string;
  type: string;
  status: CareStatus;
  lastWatered: string;
  wateringFrequency: number;
  image?: string;
  notes?: string;
  createdAt: string;
};

type PlantsContextValue = {
  plants: Plant[];
  addPlant: (plant: Omit<Plant, 'id' | 'createdAt'>) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  deletePlant: (id: string) => void;
  waterPlant: (id: string) => void;
  isLoading: boolean;
};

const PlantsContext = createContext<PlantsContextValue | null>(null);

const PLANTS_KEY = 'plantcare_plants';

function nowISO() {
  return new Date().toISOString();
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
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

  const plants: Plant[] = useMemo(() => {
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, [raw]);

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
      setPlants(plants.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    },
    [plants, setPlants],
  );

  const deletePlant = useCallback(
    (id: string) => {
      setPlants(plants.filter((p) => p.id !== id));
    },
    [plants, setPlants],
  );

  const waterPlant = useCallback(
    (id: string) => {
      setPlants(
        plants.map((p) =>
          p.id === id ? { ...p, lastWatered: todayISO(), status: 'Healthy' } : p,
        ),
      );
    },
    [plants, setPlants],
  );

  return (
    <PlantsContext.Provider
      value={{ plants, addPlant, updatePlant, deletePlant, waterPlant, isLoading }}>
      {children}
    </PlantsContext.Provider>
  );
}
