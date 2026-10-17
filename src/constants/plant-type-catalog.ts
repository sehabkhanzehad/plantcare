export type PlantTypeCatalogEntry = {
  id: string;
  name: string;
  category: string;
  wateringFrequencyDays: number;
  fertilizingFrequencyDays: number;
  lightRequirement: string;
  petSafe: boolean;
  careTip: string;
};

export const PLANT_TYPE_CATALOG: PlantTypeCatalogEntry[] = [
  {
    id: 'monstera',
    name: 'Monstera',
    category: 'Tropical',
    wateringFrequencyDays: 7,
    fertilizingFrequencyDays: 30,
    lightRequirement: 'Bright indirect',
    petSafe: false,
    careTip: 'Let the top inch of soil dry between waterings. Wipe leaves monthly for better light absorption.',
  },
  {
    id: 'snake-plant',
    name: 'Snake Plant',
    category: 'Succulent',
    wateringFrequencyDays: 14,
    fertilizingFrequencyDays: 60,
    lightRequirement: 'Low to bright indirect',
    petSafe: false,
    careTip: 'Very drought tolerant. Water only when soil is completely dry.',
  },
  {
    id: 'pothos',
    name: 'Pothos',
    category: 'Tropical',
    wateringFrequencyDays: 7,
    fertilizingFrequencyDays: 30,
    lightRequirement: 'Medium indirect',
    petSafe: false,
    careTip: 'Yellow leaves often mean overwatering. Trim leggy vines to encourage bushier growth.',
  },
  {
    id: 'peace-lily',
    name: 'Peace Lily',
    category: 'Flowering',
    wateringFrequencyDays: 5,
    fertilizingFrequencyDays: 30,
    lightRequirement: 'Low to medium indirect',
    petSafe: false,
    careTip: 'Drooping leaves usually mean it needs water. Avoid direct sun on leaves.',
  },
  {
    id: 'fiddle-leaf',
    name: 'Fiddle Leaf Fig',
    category: 'Tropical',
    wateringFrequencyDays: 10,
    fertilizingFrequencyDays: 30,
    lightRequirement: 'Bright indirect',
    petSafe: false,
    careTip: 'Keep away from drafts and heating vents. Rotate the pot weekly for even growth.',
  },
  {
    id: 'zz-plant',
    name: 'ZZ Plant',
    category: 'Succulent',
    wateringFrequencyDays: 14,
    fertilizingFrequencyDays: 60,
    lightRequirement: 'Low to bright indirect',
    petSafe: false,
    careTip: 'Thrives on neglect. Use a pot with drainage and water sparingly.',
  },
  {
    id: 'spider-plant',
    name: 'Spider Plant',
    category: 'Tropical',
    wateringFrequencyDays: 7,
    fertilizingFrequencyDays: 30,
    lightRequirement: 'Bright indirect',
    petSafe: true,
    careTip: 'Brown tips can mean fluoride in tap water. Try filtered water occasionally.',
  },
  {
    id: 'rubber-plant',
    name: 'Rubber Plant',
    category: 'Tropical',
    wateringFrequencyDays: 10,
    fertilizingFrequencyDays: 30,
    lightRequirement: 'Bright indirect',
    petSafe: false,
    careTip: 'Dust the large leaves gently. Allow top soil to dry before watering.',
  },
  {
    id: 'aloe-vera',
    name: 'Aloe Vera',
    category: 'Succulent',
    wateringFrequencyDays: 14,
    fertilizingFrequencyDays: 90,
    lightRequirement: 'Bright direct',
    petSafe: true,
    careTip: 'Plant in cactus mix. Overwatering is the most common cause of rot.',
  },
  {
    id: 'fern',
    name: 'Boston Fern',
    category: 'Fern',
    wateringFrequencyDays: 4,
    fertilizingFrequencyDays: 30,
    lightRequirement: 'Medium indirect',
    petSafe: true,
    careTip: 'Loves humidity. Mist leaves or use a pebble tray if tips turn brown.',
  },
  {
    id: 'philodendron',
    name: 'Philodendron',
    category: 'Tropical',
    wateringFrequencyDays: 7,
    fertilizingFrequencyDays: 30,
    lightRequirement: 'Medium indirect',
    petSafe: false,
    careTip: 'Vining types appreciate a moss pole. Water when top 2 cm of soil is dry.',
  },
  {
    id: 'succulent-mix',
    name: 'Succulent (mixed)',
    category: 'Succulent',
    wateringFrequencyDays: 14,
    fertilizingFrequencyDays: 60,
    lightRequirement: 'Bright direct',
    petSafe: true,
    careTip: 'Soak and dry method works well. Ensure excellent drainage.',
  },
  {
    id: 'orchid',
    name: 'Phalaenopsis Orchid',
    category: 'Flowering',
    wateringFrequencyDays: 10,
    fertilizingFrequencyDays: 30,
    lightRequirement: 'Bright indirect',
    petSafe: true,
    careTip: 'Water weekly with lukewarm water. Let roots turn silvery before soaking again.',
  },
  {
    id: 'calathea',
    name: 'Calathea',
    category: 'Tropical',
    wateringFrequencyDays: 5,
    fertilizingFrequencyDays: 30,
    lightRequirement: 'Low to medium indirect',
    petSafe: true,
    careTip: 'Sensitive to tap water minerals. Use filtered or rainwater when possible.',
  },
  {
    id: 'jade',
    name: 'Jade Plant',
    category: 'Succulent',
    wateringFrequencyDays: 14,
    fertilizingFrequencyDays: 60,
    lightRequirement: 'Bright direct',
    petSafe: true,
    careTip: 'Leaves should feel firm. Soft leaves mean it needs water; mushy means too much.',
  },
];

export function findCatalogByName(name: string): PlantTypeCatalogEntry | undefined {
  const normalized = name.trim().toLowerCase();
  return PLANT_TYPE_CATALOG.find((entry) => entry.name.toLowerCase() === normalized);
}

export function searchCatalog(query: string): PlantTypeCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return PLANT_TYPE_CATALOG;
  return PLANT_TYPE_CATALOG.filter(
    (entry) =>
      entry.name.toLowerCase().includes(q) ||
      entry.category.toLowerCase().includes(q),
  );
}
