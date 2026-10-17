import type { CareStatus } from '@/constants/mock-data';
import type { CareLog, Plant } from '@/context/plants';

export type CareTaskKind = 'water' | 'fertilize';

export type CareTask = {
  id: string;
  plantId: string;
  kind: CareTaskKind;
  title: string;
  subtitle: string;
};

export type DayScheduleItem = {
  plant: Plant;
  waterDue: boolean;
  fertilizeDue: boolean;
};

const STATUS_RANK: Record<CareStatus, number> = {
  Healthy: 0,
  'Needs Attention': 1,
  Overdue: 2,
};

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysBetween(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00`).getTime();
  const end = new Date(`${to}T00:00:00`).getTime();
  return Math.floor((end - start) / 86400000);
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export function isCarePaused(plant: Plant, onDate = dateKey(new Date())): boolean {
  if (!plant.carePausedUntil) return false;
  return onDate <= plant.carePausedUntil;
}

function lastFertilizedDate(plant: Plant): string {
  if (plant.lastFertilized) return plant.lastFertilized;
  return plant.createdAt.split('T')[0];
}

export function getWaterStatus(plant: Plant, onDate = dateKey(new Date())): CareStatus {
  const elapsed = daysBetween(plant.lastWatered, onDate);
  if (elapsed > plant.wateringFrequency + 2) return 'Overdue';
  if (elapsed > plant.wateringFrequency) return 'Needs Attention';
  return 'Healthy';
}

export function getFertilizerStatus(plant: Plant, onDate = dateKey(new Date())): CareStatus {
  if (!plant.fertilizingFrequency || plant.fertilizingFrequency < 1) return 'Healthy';
  const last = lastFertilizedDate(plant);
  const elapsed = daysBetween(last, onDate);
  const freq = plant.fertilizingFrequency;
  if (elapsed > freq + 2) return 'Overdue';
  if (elapsed > freq) return 'Needs Attention';
  return 'Healthy';
}

export function getCareStatus(plant: Plant, onDate = dateKey(new Date())): CareStatus {
  if (isCarePaused(plant, onDate)) return 'Healthy';
  const water = getWaterStatus(plant, onDate);
  const feed = getFertilizerStatus(plant, onDate);
  return STATUS_RANK[water] >= STATUS_RANK[feed] ? water : feed;
}

export function isWaterDueOn(plant: Plant, date: string): boolean {
  if (isCarePaused(plant, date)) return false;
  const elapsed = daysBetween(plant.lastWatered, date);
  return elapsed >= plant.wateringFrequency && elapsed % plant.wateringFrequency === 0;
}

export function isFertilizeDueOn(plant: Plant, date: string): boolean {
  if (isCarePaused(plant, date)) return false;
  if (!plant.fertilizingFrequency || plant.fertilizingFrequency < 1) return false;
  const last = lastFertilizedDate(plant);
  const elapsed = daysBetween(last, date);
  const freq = plant.fertilizingFrequency;
  return elapsed >= freq && elapsed % freq === 0;
}

export function getScheduleForDate(plants: Plant[], date: string): DayScheduleItem[] {
  return plants
    .map((plant) => ({
      plant,
      waterDue: isWaterDueOn(plant, date),
      fertilizeDue: isFertilizeDueOn(plant, date),
    }))
    .filter((item) => item.waterDue || item.fertilizeDue);
}

export function countDueOnDate(plants: Plant[], date: string): number {
  return getScheduleForDate(plants, date).length;
}

function taskNeedsAction(status: CareStatus): boolean {
  return status !== 'Healthy';
}

export function buildTodayTasks(plants: Plant[], onDate = dateKey(new Date())): CareTask[] {
  const tasks: CareTask[] = [];
  for (const plant of plants) {
    if (isCarePaused(plant, onDate)) continue;
    const waterStatus = getWaterStatus(plant, onDate);
    if (taskNeedsAction(waterStatus)) {
      tasks.push({
        id: `water-${plant.id}`,
        plantId: plant.id,
        kind: 'water',
        title: `Water ${plant.name}`,
        subtitle: waterStatus === 'Overdue' ? 'Overdue · tap when done' : 'Due today',
      });
    }
    const feedStatus = getFertilizerStatus(plant, onDate);
    if (taskNeedsAction(feedStatus)) {
      tasks.push({
        id: `feed-${plant.id}`,
        plantId: plant.id,
        kind: 'fertilize',
        title: `Feed ${plant.name}`,
        subtitle: feedStatus === 'Overdue' ? 'Overdue · tap when done' : 'Due today',
      });
    }
  }
  return tasks;
}

export function wateringStreak(careLogs: CareLog[]): { current: number; best: number } {
  const wateredDays = new Set<string>();
  for (const log of careLogs) {
    if (log.action === 'watered') {
      wateredDays.add(log.completedAt.split('T')[0]);
    }
  }
  if (wateredDays.size === 0) return { current: 0, best: 0 };

  const sorted = [...wateredDays].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i - 1], sorted[i]) === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  const today = dateKey(new Date());
  let current = 0;
  let cursor = today;
  while (wateredDays.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, best };
}

export type WeeklyBar = { day: string; count: number; isToday: boolean };

export function weeklyCareChart(careLogs: CareLog[], reference = new Date()): WeeklyBar[] {
  const days: WeeklyBar[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date(reference);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = dateKey(date);
    const count = careLogs.filter((log) => log.completedAt.startsWith(key)).length;
    days.push({
      day: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3),
      count,
      isToday: offset === 0,
    });
  }
  return days;
}

export function weeklyLogDelta(careLogs: CareLog[]): number | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisWeekStart = addDays(dateKey(today), -6);
  const lastWeekStart = addDays(thisWeekStart, -7);
  const lastWeekEnd = addDays(thisWeekStart, -1);

  const thisWeek = careLogs.filter((log) => {
    const d = log.completedAt.split('T')[0];
    return d >= thisWeekStart;
  }).length;

  const lastWeek = careLogs.filter((log) => {
    const d = log.completedAt.split('T')[0];
    return d >= lastWeekStart && d <= lastWeekEnd;
  }).length;

  if (lastWeek === 0 && thisWeek === 0) return null;
  if (lastWeek === 0) return 100;
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
}

export function weeklyCareTotal(careLogs: CareLog[]): number {
  const today = dateKey(new Date());
  const weekStart = addDays(today, -6);
  return careLogs.filter((log) => log.completedAt.split('T')[0] >= weekStart).length;
}

export type CareTip = { title: string; body: string };

export function getCareTip(plants: Plant[]): CareTip {
  const today = dateKey(new Date());
  const overdue = plants.filter((p) => !isCarePaused(p, today) && getCareStatus(p, today) === 'Overdue');
  const needsWater = plants.filter((p) => !isCarePaused(p, today) && getWaterStatus(p, today) !== 'Healthy');
  const needsFeed = plants.filter(
    (p) => !isCarePaused(p, today) && getFertilizerStatus(p, today) !== 'Healthy',
  );

  if (overdue.length > 0) {
    return {
      title: 'Catch up on watering',
      body: `${overdue.length} plant${overdue.length === 1 ? '' : 's'} ${overdue.length === 1 ? 'is' : 'are'} overdue. Water in the morning so leaves dry before night.`,
    };
  }
  if (needsFeed.length > 0 && needsWater.length === 0) {
    return {
      title: 'Feeding time',
      body: 'Use a diluted liquid fertilizer on damp soil. Less is better than too much for houseplants.',
    };
  }
  if (plants.length === 0) {
    return {
      title: 'Start your garden',
      body: 'Add your first plant to get personalized watering reminders and care tips.',
    };
  }
  return {
    title: 'Smart tip',
    body: 'Plants absorb more water in the morning. Try to finish watering before 10 AM.',
  };
}

/** Re-export for compatibility */
export function getPlantStatus(plant: Plant): CareStatus {
  return getCareStatus(plant);
}
