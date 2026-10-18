import type { Plant } from '@/context/plants';

export type StoredGardenEnvironment = {
  temperatureC: number;
  humidityPercent: number;
  fallbackLightLabel: string;
  fallbackZoneLabel: string;
};

export const DEFAULT_GARDEN_ENVIRONMENT: StoredGardenEnvironment = {
  temperatureC: 26,
  humidityPercent: 68,
  fallbackLightLabel: 'Low',
  fallbackZoneLabel: 'Indoor',
};

export function parseStoredGardenEnvironment(raw: string | null): StoredGardenEnvironment {
  if (!raw) return DEFAULT_GARDEN_ENVIRONMENT;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredGardenEnvironment>;
    return {
      temperatureC:
        typeof parsed.temperatureC === 'number' && Number.isFinite(parsed.temperatureC)
          ? parsed.temperatureC
          : DEFAULT_GARDEN_ENVIRONMENT.temperatureC,
      humidityPercent:
        typeof parsed.humidityPercent === 'number' && Number.isFinite(parsed.humidityPercent)
          ? Math.min(100, Math.max(0, Math.round(parsed.humidityPercent)))
          : DEFAULT_GARDEN_ENVIRONMENT.humidityPercent,
      fallbackLightLabel:
        typeof parsed.fallbackLightLabel === 'string' && parsed.fallbackLightLabel.trim()
          ? parsed.fallbackLightLabel.trim()
          : DEFAULT_GARDEN_ENVIRONMENT.fallbackLightLabel,
      fallbackZoneLabel:
        typeof parsed.fallbackZoneLabel === 'string' && parsed.fallbackZoneLabel.trim()
          ? parsed.fallbackZoneLabel.trim()
          : DEFAULT_GARDEN_ENVIRONMENT.fallbackZoneLabel,
    };
  } catch {
    return DEFAULT_GARDEN_ENVIRONMENT;
  }
}

function modeLabel(counts: { low: number; medium: number; bright: number }): string {
  const { low, medium, bright } = counts;
  const max = Math.max(low, medium, bright);
  if (max === 0) return 'Low';
  if (bright === max) return 'Bright';
  if (medium === max) return 'Med';
  return 'Low';
}

export function summarizeLightFromPlants(plants: Plant[]): string | null {
  const requirements = plants
    .map((plant) => plant.lightRequirement?.trim())
    .filter((value): value is string => Boolean(value));
  if (requirements.length === 0) return null;

  const counts = { low: 0, medium: 0, bright: 0 };
  for (const requirement of requirements) {
    const lower = requirement.toLowerCase();
    if (lower.includes('bright') || lower.includes('direct')) {
      counts.bright += 1;
    } else if (lower.includes('low') || lower.includes('shade')) {
      counts.low += 1;
    } else {
      counts.medium += 1;
    }
  }
  return modeLabel(counts);
}

export function summarizeZoneFromPlants(plants: Plant[]): string | null {
  const locations = plants
    .map((plant) => plant.location?.trim())
    .filter((value): value is string => Boolean(value));
  if (locations.length === 0) return null;

  const counts = new Map<string, number>();
  for (const location of locations) {
    counts.set(location, (counts.get(location) ?? 0) + 1);
  }

  let best = locations[0];
  let bestCount = 0;
  for (const [location, count] of counts) {
    if (count > bestCount) {
      best = location;
      bestCount = count;
    }
  }

  return best.length > 14 ? `${best.slice(0, 13)}…` : best;
}

export function buildGardenEnvironmentSnapshot(
  plants: Plant[],
  stored: StoredGardenEnvironment,
) {
  const lightLabel = summarizeLightFromPlants(plants) ?? stored.fallbackLightLabel;
  const zoneLabel = summarizeZoneFromPlants(plants) ?? stored.fallbackZoneLabel;

  return {
    temperatureValue: `${stored.temperatureC}°C`,
    humidityValue: `${stored.humidityPercent}%`,
    lightLabel,
    zoneLabel,
  };
}
