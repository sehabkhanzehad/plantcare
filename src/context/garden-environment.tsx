import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type PropsWithChildren,
} from 'react';

import { usePlants } from '@/context/plants';
import { useStorageState } from '@/hooks/use-storage-state';
import {
  buildGardenEnvironmentSnapshot,
  DEFAULT_GARDEN_ENVIRONMENT,
  parseStoredGardenEnvironment,
} from '@/lib/garden-environment';

export type GardenEnvironmentSnapshot = ReturnType<typeof buildGardenEnvironmentSnapshot>;

type GardenEnvironmentValue = {
  environment: GardenEnvironmentSnapshot;
  isLoading: boolean;
};

const GardenEnvironmentContext = createContext<GardenEnvironmentValue | null>(null);

const ENV_KEY = 'plantcare_garden_environment';

export function useGardenEnvironment() {
  const value = useContext(GardenEnvironmentContext);
  if (!value) {
    throw new Error('useGardenEnvironment must be wrapped in <GardenEnvironmentProvider />');
  }
  return value;
}

export function GardenEnvironmentProvider({ children }: PropsWithChildren) {
  const { plants } = usePlants();
  const [[isLoading, raw], setRaw] = useStorageState(ENV_KEY);

  useEffect(() => {
    if (isLoading) return;
    if (raw == null) {
      setRaw(JSON.stringify(DEFAULT_GARDEN_ENVIRONMENT));
    }
  }, [isLoading, raw, setRaw]);

  const stored = useMemo(() => parseStoredGardenEnvironment(raw), [raw]);

  const environment = useMemo(
    () => buildGardenEnvironmentSnapshot(plants, stored),
    [plants, stored],
  );

  return (
    <GardenEnvironmentContext.Provider value={{ environment, isLoading }}>
      {children}
    </GardenEnvironmentContext.Provider>
  );
}
