import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App'
import store from './store'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'


// Strict Mode helps with debugging in development mode in several ways:
    // 1. RUNS EVERYTHING TWICE (in development mode only)
          // Meant to stress-test things?
    // 2. Will give console warnings if something is deprecated
    // 3. WARNS ABOUT POTENTIAL SIDE EFFECTS
          // (LIKE THE RACE CONDITION WE ENCOUNTERED WITH THE TOKEN CHECK (see useCheckAuth.js))
  <React.StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleReCaptchaProvider>
  </React.StrictMode>

