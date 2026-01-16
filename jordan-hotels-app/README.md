# VisitJo - Jordan Hotels Booking App

A modern React application for discovering and booking hotels across Jordan. Built with Vite, Tailwind CSS, and AWS Cognito authentication.

## Features

✨ **Modern Features**
- 🏨 Browse hotels by location with real-time search
- 🔐 Secure user authentication with AWS Cognito
- 📧 Email verification workflow
- 💳 Hotel booking system
- ⭐ Hotel ratings and detailed information
- 📱 Fully responsive design
- 🎨 Beautiful UI with Tailwind CSS
- ⚙️ Dynamic user preferences (currency, language, theme, notifications)
- 📸 Secure profile image uploads to AWS S3

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4
- **Authentication**: AWS Cognito
- **API**: AWS API Gateway
- **Database**: DynamoDB (user profiles)
- **Storage**: AWS S3 (user images)
- **Serverless**: AWS Lambda
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **Internationalization**: react-i18next

## Project Structure

```
src/
├── components/        # Reusable components
├── context/           # Auth context for state management
├── pages/             # Page components (home.jsx, signup.jsx, Login.jsx, etc.)
├── services/          # API service layer
├── utils/             # Utility functions (validators, helpers)
├── App.jsx            # Main app component with routes
├── authConfig.js      # AWS Cognito configuration
├── index.css          # Global styles
└── main.jsx           # Entry point
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- AWS Cognito User Pool configured
- AWS API Gateway set up for hotel endpoints

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   VITE_COGNITO_USER_POOL_ID=your_pool_id_here
   VITE_COGNITO_CLIENT_ID=your_client_id_here
   VITE_API_GATEWAY_URL=your_api_gateway_url_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Use `.env.example` as a reference.

3. **Start development server**
   ```bash
   npm run dev
   ```

   Open http://localhost:5173 in your browser.

### 🤖 AI Chatbot - Nashmi

This project includes an AI-powered chatbot named "Nashmi" to assist users with their travel planning. Nashmi is powered by Google's Gemini Pro model.

To enable the chatbot, you must provide a Google Gemini API key in your environment variables.

1.  **Get a Gemini API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to create an API key.
2.  **Set the Environment Variable**: Add the API key to your `.env.local` file:

    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

    The backend API will use this key to authenticate with the Gemini API.

### ⚙️ User Preferences & Profile Images

VisitJo supports dynamic user preferences that update the UI immediately and persist to AWS. Users can customize:

- **Currency**: JOD, USD, EUR, GBP
- **Language**: English, French, German, Arabic (with i18n support)
- **Theme**: Light/Dark mode (applied instantly)
- **Notifications**: Email bookings, promotions, SMS reminders, push notifications
- **Room Preferences**: Smoking/Non-smoking, bed types, accessibility

**Profile Images**: Secure uploads to AWS S3 with presigned URLs for privacy and scalability.

**Technical Implementation**:
- Preferences stored in DynamoDB via API Gateway + Lambda
- Images uploaded directly to S3 with temporary signed URLs
- Reactive UI updates using React Context
- Local storage fallback for offline functionality

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Improvements Made

### 🔒 Security
- ✅ Moved AWS credentials to environment variables
- ✅ Created `.env.local` and `.env.example` for safe credential management
- ✅ Added `.gitignore` to prevent accidental credential commits

### 🏗️ Architecture
- ✅ Created `AuthContext` for centralized authentication state management
- ✅ Built API service layer (`src/services/api.js`) for consistent API handling
- ✅ Centralized Cognito configuration management
- ✅ Implemented proper error handling across all API calls

### ✅ Form Validation
- ✅ Created comprehensive validators utility (`src/utils/validators.js`)
- ✅ Email validation with regex patterns
- ✅ Password strength requirements (8+ chars, uppercase, number)
- ✅ Real-time password confirmation matching
- ✅ User-friendly error messages with visual feedback

### 🎨 UI/UX Improvements
- ✅ Enhanced forms with password visibility toggle
- ✅ Error cards with icons and clear messaging
- ✅ Loading states on all async operations
- ✅ Success confirmations for critical actions
- ✅ Improved visual hierarchy and spacing
- ✅ Better feedback for user interactions

### 🔗 Routing & Navigation
- ✅ Added hotel details route `/hotels/:id`
- ✅ Connected "View" button to individual hotel pages
- ✅ Proper breadcrumb navigation
- ✅ Back buttons for easy navigation

### 📊 Features
- ✅ Email verification workflow with success/error states
- ✅ Check-in date picker with min date validation
- ✅ Guest count selector with booking price calculation
- ✅ Real-time API error handling with user messages
- ✅ Loading indicators for better UX

## API Integration

### Hotel Endpoints
The app expects the following API endpoints on your AWS API Gateway:

```
GET  /hotels              - Get all hotels (with optional ?location=query)
GET  /hotels/{id}         - Get hotel details by ID
POST /hotels/{id}/book    - Create a booking
```

Example response format:
```json
{
  "id": "hotel-1",
  "name": "Dead Sea Hotel",
  "location": "Dead Sea",
  "price": 120,
  "rating": 4.5,
  "image": "https://...",
  "description": "..."
}
```

## Authentication Flow

1. **Sign Up**: User creates account → receives verification email
2. **Email Verification**: User enters 6-digit code from email
3. **Login**: User logs in with credentials
4. **Authenticated Actions**: User can browse and book hotels
5. **Logout**: User session is cleared

## Development Guidelines

### Adding New Features
1. Create page components in `src/pages/`
2. Add routes in `src/App.jsx`
3. Use `useAuth()` hook for authentication state
4. Use API service methods from `src/services/api.js`

### Form Validation
- Import validators from `src/utils/validators.js`
- Show error messages on user input
- Disable submit button until form is valid

### Error Handling
- All API errors are caught and displayed to users
- Network errors show specific messages
- Use error cards with AlertCircle icon

## Future Enhancements

🚀 **Planned improvements:**
- [ ] User profile page
- [ ] Booking history
- [ ] Payment integration (Stripe/PayPal)
- [ ] Hotel reviews and ratings
- [ ] Favorite/wishlist feature
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] Image gallery modal
- [ ] Notification system
- [ ] Admin dashboard

## Deployment

### Build for Production
```bash
npm run build
```

Build output will be in the `dist/` directory. Deploy this to your hosting service (Vercel, Netlify, AWS S3, etc.).

### Environment Variables for Production
Remember to set the same environment variables on your deployment platform.

## Analytics (Visitors)

### Option A (Recommended): Amplify Hosting Web Analytics (no code)
If your site is deployed on **AWS Amplify Hosting**, you can enable visitor analytics directly in the console.

- Amplify Console → your app → **Web analytics** (or **Analytics**) → **Enable**
- Choose the suggested configuration and save.

You’ll then be able to see visitors/sessions in the Amplify console (typically backed by CloudWatch RUM/metrics, depending on the Amplify UI).

### Option B: Amplify CLI Analytics (Amazon Pinpoint)
If you want event tracking via **Amazon Pinpoint** (e.g., track bookings, logins), use the **Amplify CLI** (not the AWS CLI).

- Wrong (AWS CLI): `aws amplify ...`
- Correct (Amplify CLI): `amplify ...`

From this project root:

1. `amplify init`
2. `amplify add analytics` (choose **Amazon Pinpoint**)
3. `amplify push`

Then view metrics in Amazon Pinpoint (you can open it from the Amplify console or the Pinpoint console).

## Troubleshooting

**Build fails with "Unknown at rule @theme"**
- This is a Tailwind v4 CSS warning, not an error. The build succeeds.

**AWS Cognito errors**
- Verify User Pool ID and Client ID in `.env.local`
- Check that Client ID has "Enable sign-in API for client secret apps" disabled
- Ensure your Cognito domain is properly configured

**API calls failing**
- Check `VITE_API_GATEWAY_URL` is correct
- Verify API Gateway CORS settings allow your domain
- Check browser console for detailed error messages

## License

MIT

## Contact

For questions or support, please open an issue on the repository.
