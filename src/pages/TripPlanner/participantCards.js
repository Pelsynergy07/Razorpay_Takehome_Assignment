/**
 * Screens 2.3-2.5 — participant preference cards.
 * Updated with conversational tone, subtitles, and high-resolution Unsplash photography backgrounds.
 */
export const participantCards = [
  {
    key: 'vibe',
    field: 'vibe',
    title: 'What are we vibing with?',
    subtitle: "Pick whatever feels most 'you' right now.",
    options: [
      {
        value: 'mountains',
        label: 'Mountains',
        icon: 'Mountain',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'beach',
        label: 'Beach',
        icon: 'Waves',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'party',
        label: 'Party',
        icon: 'PartyPopper',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'offbeat',
        label: 'Offbeat & relaxed',
        icon: 'Feather',
        image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    key: 'accommodation',
    field: 'accommodation',
    title: 'Where would you like to stay?',
    subtitle: 'From boutique villas to budget-friendly stays.',
    options: [
      {
        value: 'boutique-villa',
        label: 'Boutique villa',
        icon: 'Home',
        image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'hotel',
        label: 'Hotel',
        icon: 'Building2',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'hostel',
        label: 'Hostel',
        icon: 'Users',
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    key: 'pace',
    field: 'pace',
    title: 'How do you like to do trips?',
    subtitle: 'Squeeze it all in, or take it slow?',
    options: [
      {
        value: 'packed',
        label: 'Packed & active',
        icon: 'Zap',
        image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'chill',
        label: 'Chill & unwind',
        icon: 'Coffee',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];
