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
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent",
    "Vary": "Origin",
    "Content-Type": "application/json",
  };

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(deals),
  };
};
