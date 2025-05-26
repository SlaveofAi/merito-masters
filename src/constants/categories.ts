// All craft categories available in the application
export const craftCategories = [
  'Stolár',
  'Elektrikár',
  'Murár',
  'Inštalatér',
  'Maliar',
  'Podlahár',
  'Klampiar',
  'Zámočník',
  'Tesár',
  'Záhradník',
  'Kúrenár',
  'Sklenár',
  // New categories
  'Sádrokartonista',
  'Obkladač',
  'Tapetár',
  'Kominár',
  'TV/SAT Technik',
  'Chladiar/Klimatizér',
  'Montér nábytku',
  'Autoelektrikár / Automechanik',
  'Kovovýroba',
  'Servis domácich spotrebičov',
  'IT technik',
  'Zvárač',
  'Upratovacie služby',
  'Drevorezbár / Umelecký stolár',
  'Záhradný architekt',
  'Okenár / Montáž okien a dverí',
  'Montér solárnych panelov',
  'Lešenár',
  'Masér / Masérka',
  'Kozmetička',
  'Nechtový dizajnér / Manikérka',
  'Pedikér / Pedikérka',
  'Vizážistka / Make-up artist',
  'Kaderník / Kaderníčka',
  'Barber',
  'Lash & Brow artist',
  'Tetovanie / Permanentný make-up',
  'Wellness terapeut'
];

// Export as TRADE_CATEGORIES for compatibility
export const TRADE_CATEGORIES = craftCategories;

// Map trade categories to appropriate icons
export const categoryIcons: Record<string, string> = {
  'Zámočník': 'hammer',
  'Autoelektrikár / Automechanik': 'wrench',
  'IT technik': 'wrench',
  'Tapetár': 'paint-roller',
  'Upratovacie služby': 'droplet',
  'Záhradný architekt': 'leaf',
  'Okenár / Montáž okien a dverí': 'window',
  'Montér solárnych panelov': 'sun',
  'Kaderník / Kaderníčka': 'scissors',
  'Barber': 'scissors',
  'Nechtový dizajnér / Manikérka': 'nail',
  'Vizážistka / Make-up artist': 'eye',
  'Masér / Masérka': 'massage',
  'Kozmetička': 'face',
  'Lash & Brow artist': 'hair',
  'Tetovanie / Permanentný make-up': 'tattoo',
  'Wellness terapeut': 'spa',
  'Obkladač': 'paint-roller',
  'Sklenár': 'glass-water',
  'Kominár': 'fire-extinguisher',
  'TV/SAT Technik': 'tv',
  'Chladiar/Klimatizér': 'air-vent',
  'Montér nábytku': 'sofa',
  'Kovovýroba': 'factory',
  'Servis domácich spotrebičov': 'microchip',
  'Zvárač': 'zap',
  'Drevorezbár / Umelecký stolár': 'axe',
  'Pedikér / Pedikérka': 'footprints'
};

// Add the "All categories" option for filtering purposes
export const allCategoriesOption = 'Všetky kategórie';

// Get all categories including the "All categories" option for filtering
export const getAllCategories = () => [allCategoriesOption, ...craftCategories];
