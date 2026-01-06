# VisitJo API Endpoints Guide

##  Do You Need Lambdas? What Type of APIs Are They?

### **Simple Answer:**
Yes, you need Lambdas. They're **serverless functions** that run in the cloud. When your app asks "show me all hotels," a Lambda function wakes up, grabs data from the database, and sends it back. No servers to manage, you just pay per request.

### **What are REST APIs?**
REST APIs are like a menu at a restaurant:
- **GET** = "Give me a list" (read data)
- **POST** = "Create something" (add new data)
- **PUT/PATCH** = "Update something" (modify data)
- **DELETE** = "Remove something" (delete data)

Example: When you click "Search Hotels," your app sends: `GET /search?q=amman`  Lambda receives it  searches database  returns matching hotels.

---

##  All API Endpoints (17 Total)

### **HOTELS** - Getting hotel info
``
GET /hotels
 Purpose: Get all hotels
 Lambda: getHotels
 Status:  READY
 Example: https://api.visitjo.com/hotels?location=Dead%20Sea

GET /hotels/{id}
 Purpose: Get ONE hotel by ID
 Lambda: getHotelById
 Status:  READY
 Example: https://api.visitjo.com/hotels/12345

POST /hotels/{id}/book
 Purpose: Create a booking
 Lambda: bookings
 Status:  READY
 Send: { checkInDate: "2026-02-01", numberOfGuests: 2, totalPrice: 500 }
``

---

### **SEARCH** - Finding things
``
GET /search
 Purpose: Search everything (hotels, deals, experiences)
 Lambda: search
 Status:  READY
 Example: https://api.visitjo.com/search?q=petra
``

---

### **DESTINATIONS** - Tourist locations
``
GET /destinations
 Purpose: Get all destinations
 Lambda: destinations
 Status:  READY
 Returns: Petra, Wadi Rum, Dead Sea, Amman, etc.

GET /destinations/{id}
 Purpose: Get ONE destination with its hotels
 Lambda: destinations
 Status:  READY
 Example: https://api.visitjo.com/destinations/petra
``

---

### **DEALS** - Offers & discounts
``
GET /deals
 Purpose: Get all travel deals
 Lambda: deals
 Status:  READY
 Returns: Weekend escapes, family bundles, etc.

GET /deals/{id}
 Purpose: Get ONE deal details
 Lambda: deals
 Status:  READY
 Example: https://api.visitjo.com/deals/weekend-escape
``

---

### **EXPERIENCES** - Tours & activities
``
GET /experiences
 Purpose: Get all experiences (tours, activities)
 Lambda: experiences
 Status:  READY
 Returns: Petra night tour, Wadi Rum jeep, Dead Sea spa, etc.

GET /experiences/{id}
 Purpose: Get ONE experience details
 Lambda: experiences
 Status:  READY
 Example: https://api.visitjo.com/experiences/petra-night-tour
``

---

### **PAYMENTS** - Checkout
``
POST /payments/create-checkout-session
 Purpose: Create Stripe checkout (for booking)
 Lambda: createCheckoutSession
 Status:  READY
 Send: { hotelId: "123", amount: 500, booking: {...} }
``

---

### **UPLOADS** - Image uploads
``
POST /uploads/signed-url
 Purpose: Get secure upload link for S3
 Lambda: getSignedUrl
 Status:  READY
 Send: { filename: "hotel-photo.jpg", contentType: "image/jpeg" }
``

---

### **BLOG** - Articles  NOT READY YET
``
GET /blog
 Purpose: Get all blog posts
 Lambda: blog (NEEDS TO BE CREATED)
 Status:  TODO
 Returns: List of articles about Jordan travel

GET /blog/{slug}
 Purpose: Get ONE blog post
 Lambda: blog (NEEDS TO BE CREATED)
 Status:  TODO
 Example: https://api.visitjo.com/blog/best-time-to-visit-petra
``

---

### **USER PROFILE** - Account info  NOT READY YET
``
GET /user/profile
 Purpose: Get logged-in user info
 Lambda: user (NEEDS TO BE CREATED)
 Status:  TODO
 Returns: { name, email, phone, location }

GET /user/bookings
 Purpose: Get user's booking history
 Lambda: user (NEEDS TO BE CREATED)
 Status:  TODO
 Returns: List of past and upcoming bookings
``

---

### **FLIGHTS & CARS** - Future features
``
POST /flights/search
 Status:  NOT YET (optional)
 For searching flights

POST /cars/search
 Status:  NOT YET (optional)
 For searching car rentals
``

---

##  What's Ready NOW (11 Lambdas)
1. **getHotels** - Shows all hotels 
2. **getHotelById** - Shows one hotel 
3. **bookings** - Creates bookings 
4. **search** - Searches everything 
5. **destinations** - Gets destinations 
6. **deals** - Gets travel deals 
7. **experiences** - Gets tours & activities 
8. **createCheckoutSession** - Payment checkout 
9. **getSignedUrl** - Image uploads to S3 

##  What's Missing (Need to create)
1. **user** - User profile & booking history (PRIORITY #1)
2. **blog** - Blog posts (PRIORITY #2)

---

##  How It Works (Architecture)

``
Your React App (Frontend)
        
   Sends Request (GET /hotels)
        
  API Gateway (AWS)
        
  Lambda Function (getHotels)
        
  DynamoDB Database
        
Lambda sends back data
        
App shows data on screen
``

---

##  Quick Checklist

| Feature | Done? | Lambda Count |
|---------|-------|--------------|
| Browse Hotels |  | 1 (getHotels) |
| Hotel Details |  | 1 (getHotelById) |
| Book Hotel |  | 1 (bookings) |
| Search |  | 1 (search) |
| Destinations |  | 1 (destinations) |
| Deals |  | 1 (deals) |
| Experiences |  | 1 (experiences) |
| Payments |  | 1 (createCheckoutSession) |
| Image Uploads |  | 1 (getSignedUrl) |
| **User Profile** |  | 1 (needs creating) |
| **Blog** |  | 1 (needs creating) |
| Flights |  | 1 (optional, future) |
| Cars |  | 1 (optional, future) |

---

##  Next Steps

### **Step 1: Create 2 Missing Lambdas** (30 mins)
- Create `user/index.js` - handles profile & booking history
- Create `blog/index.js` - handles blog posts

### **Step 2: Deploy to AWS** (20 mins)
- Run: `npm run deploy:aws` (Windows)
- Follow prompts
- Done!

### **Step 3: Test** (10 mins)
- Open app in browser
- Switch to "LIVE" mode in navbar
- Click around and check it works

---

##  Key Terms Explained

| Term | Meaning |
|------|---------|
| **Lambda** | Serverless function that runs code when triggered |
| **REST API** | Way for app to communicate with server |
| **GET** | Request to READ data |
| **POST** | Request to CREATE new data |
| **DynamoDB** | Database (stores hotels, bookings, etc.) |
| **S3** | Cloud storage (stores images) |
| **API Gateway** | Doorway between app and Lambda functions |
| **Serverless** | No servers to manage; AWS handles everything |
| **Endpoint** | URL address like `/hotels` or `/search` |
