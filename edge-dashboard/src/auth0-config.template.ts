// Auth0 Configuration Template
// Copy this file to auth0-config.ts and fill in your actual values
// DO NOT COMMIT auth0-config.ts TO GIT!

export const auth0Config = {
  domain: "your-auth0-domain.auth0.com",
  clientId: "your-client-id-here",
  audience: "https://your-auth0-domain.auth0.com/api/v2/",
};

// For production deployment, uncomment the lines below and comment out the hardcoded values above:
// export const auth0Config = {
//   domain: import.meta.env.VITE_AUTH0_DOMAIN,
//   clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
//   audience: import.meta.env.VITE_AUTH0_AUDIENCE,
// };
