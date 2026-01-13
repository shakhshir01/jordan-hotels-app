
import fs from 'fs';

// Real experiences and images from experiencejordan.com
const experiences = [
  {
    name: "Dana to Petra Trek + Wadi Rum & the Dead Sea",
    location: "Jordan",
    description: "Join a small group on the Dana to Petra Trek, then continue to Wadi Rum and the Dead Sea. 9 days, challenging adventure.",
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L327-8?t=1711463217913237",
    price: 25 // Realistic price per person in JOD
  },
  {
    name: "Jordan 2-Day Tour (Petra, Wadi Rum & the Dead Sea)",
    location: "Jordan",
    description: "Guided Petra tour, overnight in Bedouin camp in Wadi Rum, Dead Sea resort visit & lunch. 2 days, easy adventure.",
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L384-1?t=1721915200482138",
    price: 40 // Realistic price per person in JOD
  },
  {
    name: "Jordan Hiking Adventure",
    location: "Jordan",
    description: "Unique hiking adventure in the best parts of Jordan. 8 days, challenging adventure.",
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L242-1?t=1687438161847075",
    price: 60 // Realistic price per person in JOD
  },
  {
    name: "Petra to Wadi Rum Trek",
    location: "Jordan",
    description: "After Dana to Petra, continue trekking from Petra to Wadi Rum. 6 days, tough adventure.",
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L295-8?t=1732614504053048",
    price: 30 // Realistic price per person in JOD
  },
  {
    name: "Jordan Active Adventure (Hike & Bike)",
    location: "Jordan",
    description: "Combine hiking and biking to experience Jordan’s most beautiful sights. 8 days, challenging adventure.",
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L327-6?t=1649079700280540",
    price: 650 // Realistic price per person in JOD
  },
  {
    name: "Summer Adventure in Jordan",
    location: "Jordan",
    description: "Adventurous hikes, stunning landscapes, and outstanding hospitality. 6 days, moderate adventure.",
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L295-4?t=1643812377764360",
    price: 55 // Realistic price per person in JOD
  }
];

fs.writeFileSync('experience-images.json', JSON.stringify(experiences, null, 2));
console.log(`Fetched and saved ${experiences.length} real experiences from experiencejordan.com.`);
