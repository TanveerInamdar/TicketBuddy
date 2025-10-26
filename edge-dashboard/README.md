# TicketBuddy - Space Cowboy Edition

A cosmic ticket management system with Auth0 authentication.

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Auth0 Configuration
1. Copy `src/auth0-config.template.ts` to `src/auth0-config.ts`:
   ```bash
   cp src/auth0-config.template.ts src/auth0-config.ts
   ```

2. Fill in your Auth0 credentials in `src/auth0-config.ts`:
   ```typescript
   export const auth0Config = {
     domain: "your-auth0-domain.auth0.com",
     clientId: "your-client-id-here",
     audience: "https://your-auth0-domain.auth0.com/api/v2/",
   };
   ```

### 3. Run Development Server
```bash
npm run dev
```

## 🔒 Security Notes

- **Never commit `src/auth0-config.ts` to Git**
- The `src/auth0-config.template.ts` file shows the required configuration
- All sensitive credentials are stored in the config file

## 🌟 Features

- Space cowboy themed authentication UI
- Animated star field background
- Floating cowboy character
- Glassmorphism design
- Auth0 integration
- Responsive design

## 🛠️ Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Auth0 React SDK
- React Router DOM