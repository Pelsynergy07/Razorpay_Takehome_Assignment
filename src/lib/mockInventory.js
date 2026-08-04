/**
 * Fixed, hardcoded inventory the mock synthesizer picks from — never
 * invents a destination or price. Stands in for the "~20-30 mock
 * destination/hotel options" the doc says the real Edge Function loads.
 */
export const mockInventory = [
  { id: 1, destination: 'Goa', hotel: 'Taj Holiday Village', vibe: 'beach', pace: 'chill', accommodation: 'boutique-villa', costPerPerson: 12000, dates: 'Dec 18-21', evidence: '4.5★ rated, 2,800+ reviews for beachfront value stays' },
  { id: 2, destination: 'Goa', hotel: 'Zostel Goa', vibe: 'party', pace: 'packed', accommodation: 'hostel', costPerPerson: 6000, dates: 'Dec 18-21', evidence: 'Top-rated hostel for group nightlife and beach parties' },
  { id: 3, destination: 'Manali', hotel: 'The Himalayan', vibe: 'mountains', pace: 'chill', accommodation: 'hotel', costPerPerson: 9500, dates: 'Dec 20-24', evidence: 'Consistently rated for mountain views and calm pace',
    riskFlag: 'Seasonal road closure risk on the Manali approach during this window.',
    riskEvidence: { platform: 'Himachal Tourism Advisory', platformType: 'advisory', quote: '"The Rohtang/Atal Tunnel corridor into Manali sees intermittent snow closures through late December, sometimes stranding groups for 1-2 days. Confirm pass status before locking travel dates."', author: 'Himachal Pradesh Tourism Dept.' } },
  { id: 4, destination: 'Manali', hotel: 'Zostel Manali', vibe: 'mountains', pace: 'packed', accommodation: 'hostel', costPerPerson: 5500, dates: 'Dec 20-24', evidence: 'Popular with groups for trekking and adventure activities',
    riskFlag: 'Seasonal road closure risk on the Manali approach during this window.',
    riskEvidence: { platform: 'Himachal Tourism Advisory', platformType: 'advisory', quote: '"The Rohtang/Atal Tunnel corridor into Manali sees intermittent snow closures through late December, sometimes stranding groups for 1-2 days. Confirm pass status before locking travel dates."', author: 'Himachal Pradesh Tourism Dept.' } },
  { id: 5, destination: 'Rishikesh', hotel: 'Ganga Kinare', vibe: 'offbeat', pace: 'chill', accommodation: 'hotel', costPerPerson: 7000, dates: 'Dec 19-22', evidence: 'Riverside stays known for yoga and slow mornings' },
  { id: 6, destination: 'Rishikesh', hotel: 'Backpanchers Hostel', vibe: 'offbeat', pace: 'packed', accommodation: 'hostel', costPerPerson: 4500, dates: 'Dec 19-22', evidence: 'Rafting and camping packages bundled with stay' },
  { id: 7, destination: 'Thailand', hotel: 'Phuket Marina', vibe: 'beach', pace: 'packed', accommodation: 'hotel', costPerPerson: 28000, dates: 'Dec 20-25', evidence: 'Best value international beach + nightlife combo' },
  { id: 8, destination: 'Bali', hotel: 'Ubud Boutique Villas', vibe: 'offbeat', pace: 'chill', accommodation: 'boutique-villa', costPerPerson: 32000, dates: 'Dec 20-25', evidence: 'Highly rated for relaxed, nature-led group trips' },
  { id: 9, destination: 'Goa', hotel: 'W Goa', vibe: 'party', pace: 'packed', accommodation: 'hotel', costPerPerson: 18000, dates: 'Dec 18-21', evidence: 'Known nightlife circuit, walkable to major clubs' },
  { id: 10, destination: 'Coorg', hotel: 'The Tamara', vibe: 'mountains', pace: 'chill', accommodation: 'boutique-villa', costPerPerson: 14000, dates: 'Dec 19-22', evidence: 'Coffee-estate villas rated well for quiet groups' },
  { id: 11, destination: 'Andaman', hotel: 'Havelock Beach Resort', vibe: 'beach', pace: 'chill', accommodation: 'hotel', costPerPerson: 22000, dates: 'Dec 20-24', evidence: 'Snorkeling and calm beaches, strong review base' },
  { id: 12, destination: 'Ladakh', hotel: 'Pangong Camps', vibe: 'mountains', pace: 'packed', accommodation: 'hostel', costPerPerson: 16000, dates: 'Dec 15-20', evidence: 'Bikepacking-friendly, popular with active groups' },
  { id: 13, destination: 'Pondicherry', hotel: 'Le Dupleix', vibe: 'offbeat', pace: 'chill', accommodation: 'boutique-villa', costPerPerson: 8500, dates: 'Dec 19-22', evidence: 'French-quarter boutique stays, quiet and walkable' },
  { id: 14, destination: 'Jaipur', hotel: 'Alsisar Haveli', vibe: 'offbeat', pace: 'packed', accommodation: 'hotel', costPerPerson: 7500, dates: 'Dec 19-22', evidence: 'Heritage stay with full sightseeing circuit nearby' },
  { id: 15, destination: 'Gokarna', hotel: 'Kudle Beach Hostel', vibe: 'beach', pace: 'packed', accommodation: 'hostel', costPerPerson: 5000, dates: 'Dec 18-21', evidence: 'Budget beach hostel, popular with young groups' },
  { id: 16, destination: 'Munnar', hotel: 'Windermere Estate', vibe: 'mountains', pace: 'chill', accommodation: 'boutique-villa', costPerPerson: 11000, dates: 'Dec 20-23', evidence: 'Tea-estate stays rated highly for slow travel' },
  { id: 17, destination: 'Vietnam', hotel: 'Hoi An Riverside', vibe: 'offbeat', pace: 'chill', accommodation: 'hotel', costPerPerson: 26000, dates: 'Dec 20-25', evidence: 'Well-reviewed for culture-led group itineraries' },
  { id: 18, destination: 'Vagator', hotel: 'Vagator Beach Hostel', vibe: 'party', pace: 'packed', accommodation: 'hostel', costPerPerson: 5800, dates: 'Dec 18-21', evidence: 'Sunset party circuit, walking distance to clubs' },
  { id: 19, destination: 'Dharamshala', hotel: 'Norbulingka Retreat', vibe: 'mountains', pace: 'chill', accommodation: 'boutique-villa', costPerPerson: 10000, dates: 'Dec 19-22', evidence: 'Quiet monastery-adjacent stays, well reviewed' },
  { id: 20, destination: 'Alibaug', hotel: 'Vega Beach Resort', vibe: 'beach', pace: 'chill', accommodation: 'hotel', costPerPerson: 9000, dates: 'Dec 19-21', evidence: 'Close getaway, consistently booked for weekend groups' },
  { id: 21, destination: 'Malaysia', hotel: 'Langkawi Beach Villas', vibe: 'beach', pace: 'chill', accommodation: 'boutique-villa', costPerPerson: 24000, dates: 'Dec 20-24', evidence: 'Island resort with strong group-package reviews' },
  { id: 22, destination: 'Hampi', hotel: 'Hampi Boulders', vibe: 'offbeat', pace: 'packed', accommodation: 'hostel', costPerPerson: 4800, dates: 'Dec 19-22', evidence: 'Bouldering and ruins circuit, popular with active groups' },
  { id: 23, destination: 'Sri Lanka', hotel: 'Mirissa Beach Huts', vibe: 'beach', pace: 'packed', accommodation: 'hostel', costPerPerson: 15000, dates: 'Dec 20-24', evidence: 'Surf town with strong backpacker group reviews' },
  { id: 24, destination: 'Spiti Valley', hotel: 'Spiti Homestays', vibe: 'mountains', pace: 'packed', accommodation: 'hostel', costPerPerson: 13000, dates: 'Dec 15-21', evidence: 'High-altitude circuit, rated for adventure-focused groups' },
];
