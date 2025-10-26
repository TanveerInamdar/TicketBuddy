import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { auth0Config } from "./auth0-config";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        ...(auth0Config.audience ? { audience: auth0Config.audience } : null),
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

