export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(d: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(d))
}

export function formatDateShort(d: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(d))
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function verticalLabel(v: string): string {
  const map: Record<string, string> = {
    cleaning: 'Commercial Cleaning',
    landscaping: 'Landscaping',
    snow_removal: 'Snow & Ice Removal',
    pressure_washing: 'Pressure Washing',
    commercial_kitchen: 'Commercial Kitchen',
  }
  return map[v] ?? v
}

export const DEFAULT_AREAS: Record<string, string[]> = {
  cleaning: ['Lobby', 'Men\'s Restroom', 'Women\'s Restroom', 'Kitchen / Break Room', 'Main Office', 'Conference Room', 'Hallways'],
  landscaping: ['Front Lawn', 'Side Beds', 'Common Area', 'Parking Lot Edge', 'Entranceway'],
  snow_removal: ['Main Parking Lot', 'Secondary Lot', 'Front Sidewalk', 'Building Entrance', 'Loading Dock'],
  pressure_washing: ['Front Facade', 'Parking Lot', 'Sidewalks', 'Dumpster Area', 'Loading Dock'],
  commercial_kitchen: ['Hood / Exhaust', 'Grill / Cook Line', 'Prep Surfaces', 'Floor Drains', 'Walk-in / Coolers'],
}

export const AREA_TYPE_MAP: Record<string, Record<string, string>> = {
  cleaning: {
    'Lobby': 'lobby', 'Men\'s Restroom': 'bathroom', 'Women\'s Restroom': 'bathroom',
    'Kitchen / Break Room': 'kitchen', 'Main Office': 'office', 'Conference Room': 'office', 'Hallways': 'lobby',
  },
  landscaping: {
    'Front Lawn': 'lawn', 'Side Beds': 'beds', 'Common Area': 'common_area',
    'Parking Lot Edge': 'common_area', 'Entranceway': 'common_area',
  },
  snow_removal: {
    'Main Parking Lot': 'parking_lot', 'Secondary Lot': 'parking_lot',
    'Front Sidewalk': 'sidewalk', 'Building Entrance': 'entrance', 'Loading Dock': 'parking_lot',
  },
  pressure_washing: {
    'Front Facade': 'facade', 'Parking Lot': 'parking_lot',
    'Sidewalks': 'sidewalk', 'Dumpster Area': 'dumpster_area', 'Loading Dock': 'loading_dock',
  },
  commercial_kitchen: {
    'Hood / Exhaust': 'hood', 'Grill / Cook Line': 'cook_line',
    'Prep Surfaces': 'prep_surfaces', 'Floor Drains': 'floor', 'Walk-in / Coolers': 'storage',
  },
}
