export type CareStatus = 'Healthy' | 'Needs Attention' | 'Overdue';

export type MockPlant = {
  id: string;
  name: string;
  type: string;
  status: CareStatus;
  lastWatered: string;
};

export type MockTask = {
  id: string;
  plantName: string;
  action: string;
  due: string;
};

export const MOCK_PLANTS: MockPlant[] = [
  {
    id: '1',
    name: 'Monstera',
    type: 'Tropical',
    status: 'Needs Attention',
    lastWatered: '5 days ago',
  },
  {
    id: '2',
    name: 'Snake Plant',
    type: 'Succulent',
    status: 'Healthy',
    lastWatered: '12 days ago',
  },
  {
    id: '3',
    name: 'Peace Lily',
    type: 'Flowering',
    status: 'Overdue',
    lastWatered: '9 days ago',
  },
];

export const MOCK_TODAY_TASKS: MockTask[] = [
  { id: 't1', plantName: 'Monstera', action: 'Water', due: 'Today' },
  { id: 't2', plantName: 'Snake Plant', action: 'Fertilize', due: 'Today' },
  { id: 't3', plantName: 'Peace Lily', action: 'Check soil', due: 'Today' },
];

export function plantsNeedingAttention(plants: MockPlant[] = MOCK_PLANTS) {
  return plants.filter((p) => p.status !== 'Healthy');
}
