
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

// For translating category names - import this function in components that need translated categories
export const getTranslatedCategory = (category: string, t: (key: string) => string) => {
  const categoryKeyMap: Record<string, string> = {
    'Stolár': 'carpentry',
    'Elektrikár': 'electrician',
    'Murár': 'mason',
    'Inštalatér': 'plumber',
    'Maliar': 'painter',
    'Podlahár': 'flooring',
    'Klampiar': 'tinsmiths',
    'Zámočník': 'locksmith',
    'Tesár': 'carpenter',
    'Záhradník': 'gardener',
    'Kúrenár': 'heating',
    'Sklenár': 'glazier',
    'Sádrokartonista': 'drywaller',
    'Obkladač': 'tiler',
    'Tapetár': 'wallpaper',
    'Kominár': 'chimney',
    'TV/SAT Technik': 'tv_tech',
    'Chladiar/Klimatizér': 'ac_tech',
    'Montér nábytku': 'furniture',
    'Autoelektrikár / Automechanik': 'auto',
    'Kovovýroba': 'metalwork',
    'Servis domácich spotrebičov': 'appliance',
    'IT technik': 'it',
    'Zvárač': 'welder',
    'Upratovacie služby': 'cleaning',
    'Drevorezbár / Umelecký stolár': 'woodcarving',
    'Záhradný architekt': 'garden_architect',
    'Okenár / Montáž okien a dverí': 'window',
    'Montér solárnych panelov': 'solar',
    'Lešenár': 'scaffolder',
    'Masér / Masérka': 'masseur',
    'Kozmetička': 'cosmetician',
    'Nechtový dizajnér / Manikérka': 'nail',
    'Pedikér / Pedikérka': 'pedicure',
    'Vizážistka / Make-up artist': 'makeup',
    'Kaderník / Kaderníčka': 'hairdresser',
    'Barber': 'barber',
    'Lash & Brow artist': 'lash',
    'Tetovanie / Permanentný make-up': 'tattoo',
    'Wellness terapeut': 'wellness',
    [allCategoriesOption]: 'all_categories'
  };
  
  const key = categoryKeyMap[category];
  return key ? t(key) : category;
};
