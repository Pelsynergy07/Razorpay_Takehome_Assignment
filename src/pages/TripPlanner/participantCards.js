/**
 * Redesigned Participant Flow Questions (4 High-Signal Questions).
 * - No em dashes anywhere in copy per guidelines.
 * - High-resolution Unsplash photography.
 * - Icons for progress stepper circles.
 */
export const participantCards = [
  {
    key: 'destinationPick',
    field: 'destination',
    title: 'Based on your dates and budget, these are the best fits',
    subtitle: 'Swipe through and pick the one that speaks to you.',
    icon: 'MapPin',
    type: 'carousel',
    options: [
      {
        value: 'rishikesh',
        label: 'Rishikesh',
        region: 'Uttarakhand',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=700&q=80',
      },
      {
        value: 'himachal',
        label: 'Himachal',
        region: 'Manali & Kasol',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80',
      },
      {
        value: 'jammu',
        label: 'Jammu & Kashmir',
        region: 'Srinagar & Gulmarg',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=80',
      },
      {
        value: 'goa',
        label: 'Goa',
        region: 'North & South Goa',
        image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=700&q=80',
      },
      {
        value: 'kerala',
        label: 'Kerala',
        region: 'Alleppey Backwaters',
        image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=700&q=80',
      },
    ],
  },
  {
    key: 'onePhoto',
    field: 'photoVibe',
    title: 'If you could only post one photo, what is it?',
    subtitle: 'The single shot that defines the trip.',
    icon: 'Camera',
    type: 'cards',
    options: [
      {
        value: 'sunset',
        label: 'Misty mountain sunset view',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'nightlife',
        label: 'Vibrant nightlife and street lights',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'waterfall',
        label: 'Hidden waterfall & nature trail',
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'cafe',
        label: 'Cozy street café and local food',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    key: 'effort',
    field: 'travelEffort',
    title: 'How far would you go for something actually worth it?',
    subtitle: 'Drag to where you land.',
    icon: 'Navigation',
    type: 'rangeSlider',
    sliderMin: 0,
    sliderMax: 100,
    sliderDefault: 50,
    sliderStops: [
      { value: 'chill',    at: 0,   label: 'Close by',         detail: 'Under 30 min from base' },
      { value: 'moderate', at: 50,  label: 'Road trip worthy', detail: '2 to 3 hour drive' },
      { value: 'hardcore', at: 100, label: 'Full expedition',  detail: 'Deep into the wild' },
    ],
  },
  {
    key: 'regret',
    field: 'dealbreaker',
    title: 'What would ruin the trip for you?',
    subtitle: 'Your ultimate dealbreaker.',
    icon: 'ShieldAlert',
    type: 'cards',
    options: [
      {
        value: 'boredom',
        label: 'Sitting in a hotel room doing nothing',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'rushing',
        label: 'Running around on a packed, tight schedule',
        image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'badfood',
        label: 'Mediocre food and noisy stays',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      },
      {
        value: 'overpriced',
        label: 'Spending way more money than planned',
        image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];
