// PDF Travel Guide Service
export const generateTravelGuide = (destination, hotels = []) => {
  const guides = {
    Amman: {
      title: 'Amman Travel Guide',
      intro: 'Welcome to Amman, capital of Jordan - a vibrant blend of ancient and modern.',
      attractions: [
        { name: 'Roman Theater', description: 'Ancient amphitheater in downtown Amman', tips: 'Visit early morning' },
        { name: 'Citadel', description: 'Archaeological site with panoramic views', tips: 'Bring water & sunscreen' },
        { name: 'Dead Sea Road', description: 'Scenic route with biblical sites', tips: 'Stop at Bethany Beyond Jordan' },
      ],
      restaurants: ['Wild Jordan Cafe', 'Zalatimo', 'Hashem', 'Tazza Cafe'],
      tips: 'Use taxis late evening, Hijab modestly around old city',
      bestTime: 'March-May, September-November',
    },
    Petra: {
      title: 'Petra Travel Guide',
      intro: 'Explore the magnificent Rose City, one of the 7 Wonders of the World.',
      attractions: [
        { name: 'The Treasury', description: 'Iconic rose-red carved facade', tips: 'First morning light is best' },
        { name: 'The Monastery', description: 'Largest carved structure', tips: 'Takes 2-3 hours to reach' },
        { name: 'High Place of Sacrifice', description: 'Ancient ritual site with views', tips: 'Hire a local guide' },
      ],
      restaurants: ['Nabataean Tent Restaurant', 'Al-Waha Restaurant'],
      tips: 'Bring 3L water, wear good hiking shoes, start early',
      bestTime: 'October-April (avoid summer heat)',
    },
    'Wadi Rum': {
      title: 'Wadi Rum Adventure Guide',
      intro: 'Experience the desert like the Bedouins - vast red dunes and starry nights.',
      attractions: [
        { name: 'Sunset Drive', description: 'Jeep safari through red dunes', tips: 'Book sunrise tour' },
        { name: 'Bedouin Camp', description: 'Traditional camp with local guides', tips: 'Overnight stay recommended' },
        { name: 'Rock Formations', description: 'Climb for panoramic views', tips: 'Wear layers - hot days, cold nights' },
      ],
      restaurants: ['Bedouin camps serve traditional zarb'],
      tips: 'Protect from sun, hire licensed guide, book overnight camp',
      bestTime: 'October-April',
    },
    'Dead Sea': {
      title: 'Dead Sea Wellness Guide',
      intro: 'Therapeutic mineral waters and spa treatments at the lowest point on Earth.',
      attractions: [
        { name: 'Floating in Dead Sea', description: 'Unique buoyancy experience', tips: '10-15 mins max per session' },
        { name: 'Mud Treatment', description: 'Natural therapeutic mud therapy', tips: 'Rinse in fresh water after' },
        { name: 'Spa Resorts', description: 'World-class wellness facilities', tips: 'Book treatments ahead' },
      ],
      restaurants: ['Resort restaurants', 'Amreesh Restaurant'],
      tips: 'Dont shave before, no open cuts, rinse eyes carefully',
      bestTime: 'Year-round (hot in summer)',
    },
    Aqaba: {
      title: 'Aqaba Beach Guide',
      intro: 'Jordans only coastal city with diving, snorkeling and water sports.',
      attractions: [
        { name: 'Coral Reef Diving', description: 'Red Sea dive sites', tips: 'PADI certified centers available' },
        { name: 'Snorkeling', description: 'See tropical fish and corals', tips: 'Rent from beach clubs' },
        { name: 'Fort', description: 'Historic coastal fortress', tips: 'Visit at sunset' },
      ],
      restaurants: ['Fish restaurants on waterfront', 'Lush Interaction Cafe'],
      tips: 'Use reef-safe sunscreen, respect marine life',
      bestTime: 'May-October (warm water)',
    },
  };

  return {
    ...guides[destination],
    hotelRecommendations: hotels.slice(0, 5).map(h => h.name),
    pdfUrl: `/guides/${destination.replace(/\s+/g, '-').toLowerCase()}.pdf`,
  };
};

export const downloadGuideAsPDF = (guide) => {
  // Simple implementation - in production use jsPDF
  const content = `
${guide.title}
==================
${guide.intro}

ATTRACTIONS
-----------
${guide.attractions.map(a => `• ${a.name}: ${a.description}\n  Tip: ${a.tips}`).join('\n')}

RECOMMENDED RESTAURANTS
-----------------------
${guide.restaurants.map(r => `• ${r}`).join('\n')}

TRAVEL TIPS
-----------
${guide.tips}

BEST TIME TO VISIT
-------------------
${guide.bestTime}

HOTEL RECOMMENDATIONS
---------------------
${guide.hotelRecommendations?.join('\n')}
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${guide.title.replace(/\s+/g, '-')}.txt`;
  a.click();
};
