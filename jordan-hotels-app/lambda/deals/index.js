/**
 * Deals Lambda Function
 * Returns deals with CORS headers enabled
 */
exports.handler = async (event) => {
  // Mock data served from backend
  const deals = [
    { 
      id: "deal-weekend-escape", 
      title: "Weekend Escape", 
      meta: "City stays • Limited time", 
      price: "From 99 JOD", 
      createdAt: new Date().toISOString() 
    },
    { 
      id: "deal-desert-combo", 
      title: "Desert + Petra Combo", 
      meta: "Curated itinerary • Best value", 
      price: "From 299 JOD", 
      createdAt: new Date().toISOString() 
    },
    { 
      id: "deal-family-discount", 
      title: "Family Stay Discount", 
      meta: "Up to 4 people • Valid all year", 
      price: "Save 20%", 
      createdAt: new Date().toISOString() 
    },
  ];

  const headers = {
    // Let API Gateway set Access-Control-Allow-* headers to avoid duplicates
    "Vary": "Origin",
    "Content-Type": "application/json",
  };

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(deals),
  };
};