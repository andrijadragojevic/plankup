# PlankUP - Progressive Plank Trainer

Build core strength progressively with daily plank exercises. PlankUP helps you improve your plank endurance through a structured baseline assessment and progressive training program.

## Features

### Core Functionality
- **Baseline Assessment**: Complete 3 baseline sessions to establish your starting point
- **Progressive Training**: Daily target increases automatically (default: +3 seconds/day)
- **Smart Timer**: 3-2-1-Go countdown with stopwatch (baseline) or countdown (progression) modes
- **Streak Tracking**: Monitor consecutive training days and beat your personal best
- **Complete History**: View all past sessions with detailed stats and trends
- **Statistics Dashboard**: Track progress with charts and key metrics

### User Experience
- **Onboarding Flow**: Interactive introduction to the plank program
- **Guest Mode**: Try the app without creating an account (local storage)
- **Google Sign-In**: Sync progress across devices with Firebase Authentication
- **Offline Support**: Continue training without internet connection
- **Push Notifications**: Daily reminders and streak warnings
- **PWA Support**: Install on home screen for native app experience

### Customization
- **Adjustable Increment**: Change daily progression rate (1-10 seconds)
- **Sound Effects**: Toggle countdown and completion sounds
- **Haptic Feedback**: Enable/disable vibration (mobile devices)
- **Reminder Settings**: Schedule daily plank reminders
- **Program Reset**: Start fresh with new baseline assessment

### Accessibility
- **WCAG AA Compliant**: Proper color contrast and text sizing
- **Screen Reader Support**: Full ARIA labels and semantic HTML
- **Keyboard Navigation**: Complete keyboard accessibility
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Routing**: React Router v6
- **Backend**: Firebase (Auth + Firestore)
- **PWA**: Service Worker + Web App Manifest
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ and npm
- A Firebase account (free tier works)
- Modern web browser with ES6+ support

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" and follow the setup wizard
3. Enter a project name (e.g., "PlankUP")
4. Optional: Enable Google Analytics
5. Click "Create Project"

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Google** provider:
   - Click on Google
   - Toggle "Enable"
   - Add a support email
   - Click "Save"
3. Enable **Anonymous** provider (for guest mode):
   - Click on Anonymous
   - Toggle "Enable"
   - Click "Save"

### 3. Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Production mode** (we'll set custom rules)
3. Select a Cloud Firestore location (choose closest to your users)
4. Click "Enable"

### 4. Deploy Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Copy the contents of `firebase/firestore.rules` from this project
3. Paste into the Firebase rules editor
4. Click "Publish"

Alternatively, if you have Firebase CLI installed:
```bash
firebase deploy --only firestore:rules
```

### 5. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (</>)
4. Register your app with a nickname (e.g., "PlankUP Web")
5. Copy the `firebaseConfig` object

### 6. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Installation

1. **Clone or download the project**:
   ```bash
   cd plankup
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (see Firebase Setup step 6 above)

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   - Navigate to `http://localhost:5173`
   - Or scan the network QR code for mobile testing

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Project Structure

```
plankup/
├── public/
│   ├── icons/               # PWA icons (you need to add these)
│   ├── manifest.json        # PWA manifest
│   └── sw.js               # Service worker
├── firebase/
│   └── firestore.rules     # Firestore security rules
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── CountdownOverlay.tsx
│   │   ├── PlankTimer.tsx
│   │   ├── Onboarding.tsx
│   │   ├── CompletionModal.tsx
│   │   └── Layout.tsx
│   ├── pages/             # Route pages
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── History.tsx
│   │   ├── Stats.tsx
│   │   └── Settings.tsx
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── UserContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useTimer.ts
│   ├── services/          # External service integrations
│   │   ├── firebase.ts
│   │   ├── authService.ts
│   │   ├── firestoreService.ts
│   │   ├── notificationService.ts
│   │   └── serviceWorkerRegistration.ts
│   ├── utils/             # Helper functions
│   │   ├── dateUtils.ts
│   │   ├── progressionUtils.ts
│   │   └── storageUtils.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx            # Main app component with routing
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles + Tailwind
├── .env.example           # Environment variables template
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration
└── package.json           # Dependencies and scripts
```

## Adding PWA Icons

The app requires icons in various sizes for PWA support. Place PNG icons in `public/icons/`:

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

**Quick way to generate icons**:
1. Create a 512x512 PNG icon with your design
2. Use a tool like [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) or [Real Favicon Generator](https://realfavicongenerator.net/)

## Deployment

### Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. Add environment variables in Netlify dashboard:
   - Go to Site settings → Build & deploy → Environment
   - Add all `VITE_FIREBASE_*` variables

### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard

### Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login and init:
   ```bash
   firebase login
   firebase init hosting
   ```

3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Usage Guide

### First Time Setup

1. **Sign In**: Choose Google sign-in or continue as guest
2. **Onboarding**: Review the 4-step introduction (or skip)
3. **Baseline Assessment**: Complete 3 plank sessions on 3 different days
   - Hold your plank as long as you can
   - Timer will stopwatch your duration
   - App calculates your average to set initial target

### Daily Training

1. **Check Dashboard**: View today's target and your current streak
2. **Start Plank**: Tap "Start Plank" button
3. **Get Ready**: Watch the 3-2-1-Go countdown
4. **Hold Position**: Maintain plank until timer reaches zero
5. **Complete**: View completion modal with your stats
6. **Repeat Tomorrow**: Target automatically increases by 3 seconds (default)

### Tracking Progress

- **History**: View calendar of all past sessions
- **Stats**: Analyze trends with charts and metrics
- **Streaks**: Monitor consecutive training days

### Customization

- **Settings → Progression**: Adjust daily increment (1-10 seconds)
- **Settings → Notifications**: Enable daily reminders
- **Settings → Sound & Haptics**: Toggle audio and vibration
- **Settings → Reset Program**: Start over with new baseline

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with service worker support

## Security & Privacy

- User data is isolated per account (Firestore rules enforce this)
- No personal data is collected beyond email (Google sign-in)
- Guest mode data is stored locally and never synced
- Firebase security rules prevent unauthorized access
- All communication uses HTTPS

## Troubleshooting

### Firebase Connection Issues

**Error**: "Firebase not initialized properly"
- Check that `.env` file exists and contains valid Firebase credentials
- Restart dev server after adding `.env` file
- Verify Firebase project is active in Firebase Console

### Authentication Errors

**Error**: "Popup closed by user"
- This is normal if user cancels Google sign-in
- Try again or use guest mode

**Error**: "This domain is not authorized"
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your deployment domain (e.g., `yourapp.netlify.app`)

### Notifications Not Working

- Check browser notification permissions
- Safari requires HTTPS for notifications
- Some browsers block notifications in incognito/private mode

### Service Worker Issues

- Clear browser cache and hard reload (Ctrl+Shift+R or Cmd+Shift+R)
- Unregister old service workers in DevTools → Application → Service Workers
- Ensure HTTPS for production (service workers require secure context)

### Build Errors

**Error**: "Cannot find module 'firebase'"
- Run `npm install` to ensure all dependencies are installed

**Error**: Tailwind styles not applying
- Check that `tailwind.config.js` exists
- Verify `@tailwind` directives in `src/index.css`

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions

## Roadmap

Potential future enhancements:
- [ ] Social features (friends, challenges)
- [ ] Multiple exercise types (side planks, etc.)
- [ ] Form guidance videos
- [ ] Apple Health / Google Fit integration
- [ ] Achievement badges
- [ ] Export data (CSV, PDF)
- [ ] Dark mode
- [ ] Multi-language support

---

**Built with ❤️ for core strength enthusiasts**
