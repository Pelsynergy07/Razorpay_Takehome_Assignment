/**
 * Screens 2.3-2.5 — one card per preference, options only (no step counter
 * shown anywhere in the UI, per spec).
 */
export const participantCards = [
  {
    key: 'vibe',
    field: 'vibe',
    title: "What's the vibe?",
    options: [
      { value: 'mountains', label: 'Mountains', icon: 'Mountain', gradient: 'var(--gradient-hero)' },
      { value: 'beach', label: 'Beach', icon: 'Waves', gradient: 'linear-gradient(160deg, #003b95 0%, #008cff 100%)' },
      { value: 'party', label: 'Party', icon: 'PartyPopper', gradient: 'var(--gradient-myra)' },
      { value: 'offbeat', label: 'Offbeat & relaxed', icon: 'Feather', gradient: 'linear-gradient(160deg, var(--mmt-red-dark) 0%, var(--mmt-red) 100%)' },
    ],
  },
  {
    key: 'accommodation',
    field: 'accommodation',
    title: 'Where would you like to stay?',
    options: [
      { value: 'boutique-villa', label: 'Boutique villa', icon: 'Home' },
      { value: 'hotel', label: 'Hotel', icon: 'Building2' },
      { value: 'hostel', label: 'Hostel', icon: 'Users' },
    ],
  },
  {
    key: 'pace',
    field: 'pace',
    title: 'What pace works for you?',
    options: [
      { value: 'packed', label: 'Packed & active', icon: 'Zap' },
      { value: 'chill', label: 'Chill & unwind', icon: 'Coffee' },
    ],
  },
];
