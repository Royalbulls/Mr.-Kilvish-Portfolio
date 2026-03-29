export const GENRES = [
  'All',
  'Pop',
  'Rock',
  'Hip-Hop',
  'Electronic',
  'Classical',
  'Jazz',
  'R&B',
  'Dark Synth',
  'Industrial'
];

export interface Song {
  id: string;
  title: string;
  plays: string;
  duration: string;
}

export interface Album {
  id: string;
  title: string;
  year: string;
  cover: string;
}

export interface Event {
  id: string;
  date: string;
  venue: string;
  location: string;
  status: 'Available' | 'Sold Out';
}

export interface Artist {
  id: string;
  name: string;
  genres: string[];
  bio: string;
  image: string;
  monthlyListeners: string;
  popularSongs: Song[];
  albums: Album[];
  events: Event[];
}

export const ARTISTS: Artist[] = [
  {
    id: 'kilvish',
    name: 'Mr. Kilvish',
    genres: ['Electronic', 'Dark Synth', 'Industrial'],
    bio: 'The supreme ruler of the digital soundscape. Mr. Kilvish blends dark synth-wave with industrial bass to create mind-altering auditory experiences that command absolute loyalty.',
    image: 'https://picsum.photos/seed/kilvish/800/800',
    monthlyListeners: '1.2M',
    popularSongs: [
      { id: 's1', title: 'Void Protocol', plays: '4.5M', duration: '3:42' },
      { id: 's2', title: 'Empire Rising', plays: '3.1M', duration: '4:15' },
      { id: 's3', title: 'Citizens of the Dark', plays: '2.8M', duration: '3:50' },
      { id: 's4', title: 'Algorithmic Domination', plays: '1.9M', duration: '2:55' }
    ],
    albums: [
      { id: 'a1', title: 'The Kilvish Manifesto', year: '2025', cover: 'https://picsum.photos/seed/manifesto/400/400' },
      { id: 'a2', title: 'Dark Synth Origins', year: '2024', cover: 'https://picsum.photos/seed/origins/400/400' }
    ],
    events: [
      { id: 'e1', date: 'Oct 31, 2026', venue: 'The Void Arena', location: 'Neo-Tokyo', status: 'Sold Out' },
      { id: 'e2', date: 'Nov 15, 2026', venue: 'Cyber Club', location: 'Berlin', status: 'Available' },
      { id: 'e3', date: 'Dec 01, 2026', venue: 'Underground Sector 4', location: 'London', status: 'Available' }
    ]
  },
  {
    id: 'archaeos',
    name: 'Archaeos',
    genres: ['Classical', 'Jazz', 'Electronic'],
    bio: 'An AI entity that reconstructs ancient melodies using quantum computing. Archaeos bridges the gap between 18th-century classical orchestration and 22nd-century jazz fusion.',
    image: 'https://picsum.photos/seed/archaeos/800/800',
    monthlyListeners: '850K',
    popularSongs: [
      { id: 's5', title: 'Quantum Sonata in D Minor', plays: '2.1M', duration: '5:12' },
      { id: 's6', title: 'Neon Jazz Protocol', plays: '1.8M', duration: '4:30' },
      { id: 's7', title: 'Cello of the Ancients', plays: '1.2M', duration: '3:45' }
    ],
    albums: [
      { id: 'a3', title: 'Echoes of Antiquity', year: '2026', cover: 'https://picsum.photos/seed/echoes/400/400' },
      { id: 'a4', title: 'Binary Jazz', year: '2025', cover: 'https://picsum.photos/seed/binary/400/400' }
    ],
    events: [
      { id: 'e4', date: 'Sep 12, 2026', venue: 'Symphony Hall', location: 'Vienna', status: 'Available' },
      { id: 'e5', date: 'Oct 05, 2026', venue: 'Blue Note Digital', location: 'New York', status: 'Sold Out' }
    ]
  },
  {
    id: 'neon-phantom',
    name: 'Neon Phantom',
    genres: ['Pop', 'R&B', 'Electronic'],
    bio: 'A mysterious vocal synthesis project that took the pop world by storm. Neon Phantom delivers smooth R&B vocals over infectious, upbeat pop production.',
    image: 'https://picsum.photos/seed/neonphantom/800/800',
    monthlyListeners: '3.4M',
    popularSongs: [
      { id: 's8', title: 'Midnight Mirage', plays: '12.5M', duration: '3:15' },
      { id: 's9', title: 'Holographic Heartbreak', plays: '8.2M', duration: '2:58' },
      { id: 's10', title: 'Electric Touch', plays: '6.7M', duration: '3:22' }
    ],
    albums: [
      { id: 'a5', title: 'Synthetic Soul', year: '2026', cover: 'https://picsum.photos/seed/synthetic/400/400' }
    ],
    events: [
      { id: 'e6', date: 'Aug 20, 2026', venue: 'Starlight Stadium', location: 'Los Angeles', status: 'Sold Out' },
      { id: 'e7', date: 'Sep 02, 2026', venue: 'O2 Arena', location: 'London', status: 'Available' }
    ]
  },
  {
    id: 'void-walker',
    name: 'Void Walker',
    genres: ['Rock', 'Hip-Hop', 'Industrial'],
    bio: 'Rebelling against the clean algorithms, Void Walker combines gritty rock guitars with heavy hip-hop beats, creating an aggressive, high-energy sound for the underground.',
    image: 'https://picsum.photos/seed/voidwalker/800/800',
    monthlyListeners: '1.8M',
    popularSongs: [
      { id: 's11', title: 'System Override', plays: '5.4M', duration: '3:10' },
      { id: 's12', title: 'Glitch in the Matrix', plays: '4.1M', duration: '2:45' },
      { id: 's13', title: 'Rebel Frequencies', plays: '3.9M', duration: '3:33' }
    ],
    albums: [
      { id: 'a6', title: 'Distortion Reality', year: '2025', cover: 'https://picsum.photos/seed/distortion/400/400' },
      { id: 'a7', title: 'Urban Decay', year: '2024', cover: 'https://picsum.photos/seed/decay/400/400' }
    ],
    events: [
      { id: 'e8', date: 'Jul 15, 2026', venue: 'The Foundry', location: 'Chicago', status: 'Available' },
      { id: 'e9', date: 'Aug 08, 2026', venue: 'Red Rocks', location: 'Colorado', status: 'Sold Out' }
    ]
  }
];
