/* =========================================================
   ModernNest Furniture — app.js
   Plain, dependency-free JavaScript.

   Sections:
   1. Authentication configuration (AUTH_MODE, OIDC / Genesys placeholders)
   2. Product data + rendering
   3. Product details modal
   4. Generic modal helpers (shared by product + login/register modal)
   5. Authentication state — AuthManager (Phase 1 demo + Phase 2 OIDC)
   6. Authentication UI (tabs, login/register forms, header button)
   7. Mobile navigation toggle
   8. Genesys chat button (Phase 3 — gated on authentication)
   9. Misc (footer year)
   10. App init
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     1. AUTHENTICATION CONFIGURATION
     ======================================================= */

  // Phase switch. "DEMO" = Phase 1 localStorage auth (current).
  // "OIDC" = Phase 2 real OAuth 2.0 / OpenID Connect (future).
  const AUTH_MODE = "DEMO";

  // Phase 3 switch. Must stay false until Genesys Cloud Authenticated
  // Web Messaging has been configured. When false, no Genesys script
  // or widget is loaded or initialized anywhere in this file.
  const GENESYS_MESSAGING_ENABLED = false;

  // ---------------------------------------------------------------
  // PHASE 2 CONFIGURATION (placeholders only — do not invent values)
  // These will be supplied once a real Identity Provider is chosen.
  // This app is a public client (static site on GitHub Pages), so it
  // must NEVER hold a client secret — only Authorization Code + PKCE
  // is appropriate here.
  // ---------------------------------------------------------------
  const OIDC_ISSUER = ""; // e.g. "https://YOUR-IDP/.well-known/openid-configuration" issuer origin
  const OIDC_CLIENT_ID = ""; // public client ID registered with the IdP
  const OIDC_REDIRECT_URI = window.location.origin + window.location.pathname; // this page, post-login
  const OIDC_SCOPES = "openid profile email";

  // ---------------------------------------------------------------
  // PHASE 3 CONFIGURATION (placeholders only — do not invent values)
  // Genesys Cloud Authenticated Web Messaging deployment details.
  // No Genesys client secret or private credential belongs here —
  // only public deployment identifiers.
  // ---------------------------------------------------------------
  const GENESYS_ENVIRONMENT = ""; // e.g. "mypurecloud.com" / your Genesys Cloud region
  const GENESYS_DEPLOYMENT_ID = ""; // Web Messenger deployment ID
  const GENESYS_ORG_ID = ""; // Genesys Cloud org ID
  const GENESYS_MESSAGING_CONFIGURATION = null; // full config object, supplied later

  /* =======================================================
     2. Product data + rendering
     ======================================================= */
  const products = [
    {
      id: "sofa",
      name: "Modern Sofa",
      price: 500,
      image: "images/sofa.svg",
      shortDescription: "A low-profile three-seater in brushed sage upholstery.",
      description:
        "A low-profile three-seater built on a solid hardwood frame, upholstered in brushed sage fabric. Deep seats and a relaxed back cushion make it as comfortable for a nap as it is for hosting.",
    },
    {
      id: "chair",
      name: "Lounge Chair",
      price: 200,
      image: "images/chair.svg",
      shortDescription: "A curved reading chair in warm burnt-clay leather.",
      description:
        "A curved reading chair finished in warm burnt-clay leather over a bent-wood frame. Sized for one, with a gentle recline that suits a corner by the window as much as a living room.",
    },
    {
      id: "table",
      name: "Dining Table",
      price: 350,
      image: "images/table.svg",
      shortDescription: "An oval dining table in solid oiled walnut.",
      description:
        "An oval dining table in solid, oiled walnut, seating up to six. The rounded edges are shaped by hand, and the finish is food-safe and simple to maintain with regular oiling.",
    },
    {
      id: "bed",
      name: "King Bed",
      price: 700,
      image: "images/bed.svg",
      shortDescription: "A king-size platform bed with an upholstered headboard.",
      description:
        "A king-size platform bed with a channel-tufted upholstered headboard and a slatted hardwood base — no box spring required. Built to be quiet, sturdy, and to last well beyond a decade of daily use.",
    },
    {
      id: "cabinet",
      name: "Storage Cabinet",
      price: 300,
      image: "images/cabinet.svg",
      shortDescription: "A two-door cabinet in solid ash with brass pulls.",
      description:
        "A two-door storage cabinet in solid ash, with a single adjustable interior shelf and brass pulls. Compact enough for an entryway, roomy enough for a media console.",
    },
    {
      id: "desk",
      name: "Work Desk",
      price: 250,
      image: "images/desk.svg",
      shortDescription: "A compact writing desk with a single storage drawer.",
      description:
        "A compact writing desk in solid maple with a single soft-close storage drawer. Sized to fit in a home-office corner without overwhelming the room.",
    },
  ];

  const productGrid = document.getElementById("productGrid");

  function renderProducts() {
    const cardsHtml = products
      .map(
        (product) => `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy" width="400" height="300">
        <div class="product-card-body">
          <h3>${product.name}</h3>
          <p>${product.shortDescription}</p>
          <div class="product-card-footer">
            <span class="product-price">$${product.price}</span>
            <button class="btn btn-outline" type="button" data-view-details="${product.id}">
              View details
            </button>
          </div>
        </div>
      </article>
    `
      )
      .join("");

    productGrid.innerHTML = cardsHtml;
  }

  renderProducts();

  /* =======================================================
     3. Product details modal
     ======================================================= */
  const productModalOverlay = document.getElementById("productModalOverlay");
  const productModalImage = document.getElementById("productModalImage");
  const productModalTitle = document.getElementById("productModalTitle");
  const productModalDescription = document.getElementById("productModalDescription");
  const productModalPrice = document.getElementById("productModalPrice");
  const productModalClose = document.getElementById("productModalClose");
  const productModalCloseBtn = document.getElementById("productModalCloseBtn");

  function openProductModal(productId) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    productModalImage.src = product.image;
    productModalImage.alt = product.name;
    productModalTitle.textContent = product.name;
    productModalDescription.textContent = product.description;
    productModalPrice.textContent = `$${product.price}`;

    openModal(productModalOverlay);
  }

  productGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-view-details]");
    if (!trigger) return;
    openProductModal(trigger.getAttribute("data-view-details"));
  });

  productModalClose.addEventListener("click", () => closeModal(productModalOverlay));
  productModalCloseBtn.addEventListener("click", () => closeModal(productModalOverlay));

  /* =======================================================
     4. Generic modal helpers (shared by product + login/register modal)
     ======================================================= */
  const loginModalOverlay = document.getElementById("loginModalOverlay");
  const loginModalClose = document.getElementById("loginModalClose");

  let lastFocusedElement = null;

  function openModal(overlayEl) {
    lastFocusedElement = document.activeElement;
    overlayEl.hidden = false;
    document.body.style.overflow = "hidden";

    const focusable = overlayEl.querySelector("button, input, [href]");
    if (focusable) focusable.focus();
  }

  function closeModal(overlayEl) {
    overlayEl.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  // Close on overlay click (but not when clicking inside the modal box)
  [productModalOverlay, loginModalOverlay].forEach((overlay) => {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeModal(overlay);
    });
  });

  // Close on Escape
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!productModalOverlay.hidden) closeModal(productModalOverlay);
    if (!loginModalOverlay.hidden) closeModal(loginModalOverlay);
  });

  loginModalClose.addEventListener("click", () => closeModal(loginModalOverlay));

  /* =======================================================
     5. AUTHENTICATION STATE — AuthManager
     =======================================================

     AuthManager is the single interface the rest of the app talks to.
     It delegates to one of two implementations depending on AUTH_MODE:

       AUTH_MODE = "DEMO" -> DemoAuth   (Phase 1, localStorage only)
       AUTH_MODE = "OIDC" -> OidcAuth   (Phase 2, real IdP)

     Swapping AUTH_MODE from "DEMO" to "OIDC" once Phase 2 is configured
     should not require changing any UI code below — only the OIDC_*
     configuration values above and the OidcAuth implementation.
  */

  // -----------------------------------------------------------------
  // ⚠ PHASE 1 SECURITY WARNING ⚠
  //
  //   - This is DEMO authentication only, meant for trying out the UX
  //     before a real Identity Provider is connected.
  //   - Accounts (including the plain-text password) are stored in the
  //     browser's localStorage under "modernNestDemoAccount".
  //   - The active session is stored separately under
  //     "modernNestDemoSession".
  //   - This is NOT secure storage and must NEVER be used for real
  //     customer accounts or in a production deployment.
  //   - No password is ever sent to a server or any API in Phase 1 —
  //     everything happens client-side in this browser only.
  //   - Phase 2 will replace this entirely with a real OAuth 2.0 /
  //     OpenID Connect Identity Provider (Authorization Code + PKCE).
  // -----------------------------------------------------------------
  const DemoAuth = {
    ACCOUNT_KEY: "modernNestDemoAccount",
    SESSION_KEY: "modernNestDemoSession",

    initialize() {
      // Nothing to bootstrap for the demo — session state is read
      // directly from localStorage on demand (see _getSession below).
    },

    isAuthenticated() {
      return this._getSession() !== null;
    },

    getUser() {
      const session = this._getSession();
      if (!session) return null;
      return {
        customerId: session.customerId,
        name: session.name,
        email: session.email,
      };
    },

    getAccessToken() {
      // Phase 1 has no real token — there is nothing to authorize an
      // API call with. This exists only so the AuthManager interface
      // matches what Phase 2 (OIDC) will expose.
      return null;
    },

    login(identifier, password) {
      const account = this._getAccount();
      if (!account) {
        return {
          success: false,
          message: "No demo account found yet — create one first.",
        };
      }

      const enteredIdentifier = (identifier || "").trim();
      const matchesCustomerId = enteredIdentifier === account.customerId;
      const matchesEmail =
        enteredIdentifier.toLowerCase() === (account.email || "").toLowerCase();

      if (!matchesCustomerId && !matchesEmail) {
        return {
          success: false,
          message: "No account matches that Customer ID or email.",
        };
      }

      // NOTE: password is intentionally NOT trimmed. Whitespace can
      // technically be part of a password — do not add .trim() here.
      if (password !== account.password) {
        return { success: false, message: "Incorrect password." };
      }

      const session = {
        customerId: account.customerId,
        name: account.name,
        email: account.email,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      return {
        success: true,
        user: { customerId: session.customerId, name: session.name, email: session.email },
      };
    },

    // Phase-1-only: account creation. In Phase 2, "creating an account"
    // happens at the Identity Provider itself, not in this app.
    register(name, email, password) {
      const customerId = generateDemoCustomerId();

      // Demo account, stored as-is in localStorage. See the security
      // warning above — this is never appropriate for production.
      const account = { customerId, name, email, password };
      localStorage.setItem(this.ACCOUNT_KEY, JSON.stringify(account));

      const session = {
        customerId,
        name,
        email,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      return {
        success: true,
        customerId,
        user: { customerId, name, email },
      };
    },

    logout() {
      localStorage.removeItem(this.SESSION_KEY);
    },

    handleCallback() {
      // No-op in demo mode — there is no redirect-based callback.
    },

    _getAccount() {
      try {
        return JSON.parse(localStorage.getItem(this.ACCOUNT_KEY));
      } catch (err) {
        return null;
      }
    },

    _getSession() {
      try {
        return JSON.parse(localStorage.getItem(this.SESSION_KEY));
      } catch (err) {
        return null;
      }
    },
  };

  function generateDemoCustomerId() {
    const sixDigits = Math.floor(100000 + Math.random() * 900000);
    return `CUS-${sixDigits}`;
  }

  // -----------------------------------------------------------------
  // PHASE 2 — OIDC PLACEHOLDER IMPLEMENTATION
  //
  // This is intentionally NOT a working authentication system. It must
  // not fabricate tokens, sessions, or "fake OAuth" behavior of any
  // kind. It exists purely as the seam where a real implementation
  // (e.g. an Authorization Code + PKCE flow against OIDC_ISSUER, either
  // hand-rolled or via an OIDC client library) will be added later.
  //
  // CLAIM MAPPING (finalize once the IdP is configured):
  //   user.sub   -> Customer ID  (subject claim from the ID token)
  //   user.name  -> Customer Name
  //   user.email -> Email
  // The exact claim names depend on the IdP and are not assumed here.
  // -----------------------------------------------------------------
  const OidcAuth = {
    initialize() {
      // TODO (Phase 2): if the current URL contains an authorization
      // code / state (i.e. we just landed back from the IdP redirect),
      // call handleCallback() to complete the token exchange.
      console.warn(
        "[ModernNest] AUTH_MODE is \"OIDC\" but no Identity Provider is configured yet. " +
          "Set OIDC_ISSUER / OIDC_CLIENT_ID and implement OidcAuth before using this mode."
      );
    },

    isAuthenticated() {
      // TODO (Phase 2): return true if a valid, non-expired ID token
      // is present (e.g. in memory or session storage — never store
      // tokens in a way that survives longer than necessary).
      return false;
    },

    getUser() {
      // TODO (Phase 2): map ID token claims to { customerId, name, email }
      // using the claim mapping documented above.
      return null;
    },

    getAccessToken() {
      // TODO (Phase 2): return the current access token, if the IdP
      // issues one and it's needed for downstream API calls.
      return null;
    },

    login() {
      // TODO (Phase 2): redirect the browser to the IdP's /authorize
      // endpoint using Authorization Code Flow with PKCE:
      //   - generate a code_verifier / code_challenge pair
      //   - build the /authorize URL from OIDC_ISSUER, OIDC_CLIENT_ID,
      //     OIDC_REDIRECT_URI, and OIDC_SCOPES
      //   - persist code_verifier + state for use in handleCallback()
      //   - window.location.assign(authorizeUrl)
      throw new Error(
        "OIDC login is not configured yet. Set OIDC_ISSUER / OIDC_CLIENT_ID first."
      );
    },

    logout() {
      // TODO (Phase 2): clear any local token state, then redirect to
      // the IdP's end-session endpoint if one is available.
    },

    handleCallback() {
      // TODO (Phase 2): read ?code and ?state from OIDC_REDIRECT_URI,
      // validate state, exchange the code (+ code_verifier) for tokens
      // at the IdP's token endpoint, then store the resulting ID token
      // (and access token, if needed) for isAuthenticated()/getUser().
    },
  };

  // -----------------------------------------------------------------
  // AuthManager — the single interface the rest of the app uses.
  // Dispatches to DemoAuth or OidcAuth based on AUTH_MODE.
  // -----------------------------------------------------------------
  const AuthManager = {
    _impl: AUTH_MODE === "OIDC" ? OidcAuth : DemoAuth,

    initialize() {
      this._impl.initialize();
    },
    isAuthenticated() {
      return this._impl.isAuthenticated();
    },
    getUser() {
      return this._impl.getUser();
    },
    getAccessToken() {
      return this._impl.getAccessToken();
    },
    login(identifier, password) {
      // Phase 1 (DemoAuth.login) validates credentials locally and
      // returns { success, user | message }. Phase 2 (OidcAuth.login)
      // instead redirects the browser and does not return normally.
      return this._impl.login(identifier, password);
    },
    register(name, email, password) {
      if (typeof this._impl.register !== "function") {
        return {
          success: false,
          message: "Account creation isn't available in this authentication mode.",
        };
      }
      return this._impl.register(name, email, password);
    },
    logout() {
      this._impl.logout();
    },
    handleCallback() {
      return this._impl.handleCallback();
    },
  };

  // Public facade functions — thin wrappers over AuthManager, named to
  // match the interface described for this project so other code (and
  // future Phase 2/3 work) has stable, obvious entry points.
  function initializeAuthentication() {
    AuthManager.initialize();
  }
  function isUserAuthenticated() {
    return AuthManager.isAuthenticated();
  }
  function startLogin(identifier, password) {
    return AuthManager.login(identifier, password);
  }
  function handleAuthenticationCallback() {
    return AuthManager.handleCallback();
  }
  function getCurrentUser() {
    return AuthManager.getUser();
  }
  function logoutUser() {
    AuthManager.logout();
  }

  /* =======================================================
     6. AUTHENTICATION UI
     ======================================================= */
  const loginBtn = document.getElementById("loginBtn");
  const loginModalTitle = document.getElementById("loginModalTitle");

  const tabLoginBtn = document.getElementById("tabLoginBtn");
  const tabRegisterBtn = document.getElementById("tabRegisterBtn");

  const loginForm = document.getElementById("loginForm");
  const customerIdInput = document.getElementById("customerId");
  const customerPasswordInput = document.getElementById("customerPassword");
  const loginFormNote = document.getElementById("loginFormNote");

  const registerForm = document.getElementById("registerForm");
  const registerNameInput = document.getElementById("registerName");
  const registerEmailInput = document.getElementById("registerEmail");
  const registerPasswordInput = document.getElementById("registerPassword");
  const registerFormNote = document.getElementById("registerFormNote");

  function switchAuthTab(tab) {
    const showLogin = tab === "login";

    loginForm.hidden = !showLogin;
    registerForm.hidden = showLogin;

    tabLoginBtn.setAttribute("aria-selected", String(showLogin));
    tabRegisterBtn.setAttribute("aria-selected", String(!showLogin));

    tabLoginBtn.classList.toggle("btn-primary", showLogin);
    tabLoginBtn.classList.toggle("btn-outline", !showLogin);
    tabRegisterBtn.classList.toggle("btn-primary", !showLogin);
    tabRegisterBtn.classList.toggle("btn-outline", showLogin);

    loginFormNote.textContent = "";
    registerFormNote.textContent = "";
    loginModalTitle.textContent = showLogin ? "Log in to your account" : "Create your account";
  }

  tabLoginBtn.addEventListener("click", () => switchAuthTab("login"));
  tabRegisterBtn.addEventListener("click", () => switchAuthTab("register"));

  function updateAuthUI() {
    const authenticated = isUserAuthenticated();
    const user = getCurrentUser();

    if (authenticated && user) {
      loginBtn.textContent = `Logout (${user.name})`;
    } else {
      loginBtn.textContent = "Login";
    }
  }

  loginBtn.addEventListener("click", () => {
    if (isUserAuthenticated()) {
      logoutUser();
      updateAuthUI();
      loginForm.reset();
      registerForm.reset();
      switchAuthTab("login");
      openModal(loginModalOverlay);
      return;
    }

    if (AUTH_MODE === "OIDC") {
      // Phase 2: this redirects the browser to the IdP and does not
      // return — there is no local modal to open in that mode.
      startLogin();
      return;
    }

    switchAuthTab("login");
    openModal(loginModalOverlay);
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const identifier = customerIdInput.value;
    const password = customerPasswordInput.value; // never trimmed — see Phase 1 warning above

    const result = startLogin(identifier, password);

    if (result && result.success) {
      loginFormNote.textContent = "";
      updateAuthUI();
      closeModal(loginModalOverlay);
      loginForm.reset();
    } else {
      loginFormNote.textContent =
        (result && result.message) || "Invalid Customer ID/Email or password.";
    }
  });

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = registerNameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value; // never trimmed — see Phase 1 warning above

    if (!name || !email || !password) {
      registerFormNote.textContent = "Please fill in all fields.";
      return;
    }

    const result = AuthManager.register(name, email, password);

    if (result && result.success) {
      registerFormNote.textContent = `Success! Your Customer ID is ${result.customerId}`;
      updateAuthUI();

      window.setTimeout(() => {
        closeModal(loginModalOverlay);
        registerForm.reset();
        registerFormNote.textContent = "";
        switchAuthTab("login");
      }, 1600);
    } else {
      registerFormNote.textContent =
        (result && result.message) || "Could not create an account.";
    }
  });

  /* =======================================================
     7. Mobile navigation toggle
     ======================================================= */
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");

  navToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the mobile menu after choosing a nav link
  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      primaryNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* =======================================================
     8. Genesys chat button (Phase 3 — gated on authentication)
     ======================================================= */
  const chatFab = document.getElementById("chatFab");
  const chatToast = document.getElementById("chatToast");
  let chatToastTimer = null;

  function showChatToast(message) {
    chatToast.textContent = message;
    chatToast.hidden = false;
    window.clearTimeout(chatToastTimer);
    chatToastTimer = window.setTimeout(() => {
      chatToast.hidden = true;
    }, 4000);
  }

  // Builds the (non-secret) identity data this app would hand to
  // Genesys once Phase 3 is wired in. Never includes a password or any
  // authentication secret — only identity fields Genesys Architect can
  // use for routing/personalization.
  function getGenesysParticipantData() {
    const user = getCurrentUser();
    if (!user) return null;

    return {
      customerId: user.customerId,
      customerName: user.name,
      customerEmail: user.email,
      authenticated: true,
      // NOTE: this is a conceptual shape only. The final participant
      // attribute mechanism must follow whatever the Genesys
      // Authenticated Web Messaging implementation/configuration
      // actually requires once it's set up.
    };
  }

  // TODO (Phase 3): Initialize Genesys Cloud Authenticated Web Messaging.
  // Only ever called when GENESYS_MESSAGING_ENABLED is true.
  function initializeGenesysMessaging() {
    if (!GENESYS_MESSAGING_ENABLED) return;

    // TODO: load the Genesys Cloud Web Messenger deployment script,
    // configure it with GENESYS_ENVIRONMENT / GENESYS_DEPLOYMENT_ID /
    // GENESYS_ORG_ID / GENESYS_MESSAGING_CONFIGURATION, and register the
    // authenticated user (see getGenesysParticipantData()) so Genesys
    // Architect can access customer identity. Do not put any Genesys
    // client secret or private credential in this file — Authenticated
    // Web Messaging is designed to work from a public browser client.
  }

  function openGenesysChat() {
    // TODO (Phase 3): Authenticate customer before starting authenticated
    // messaging — this gate is exactly that check.
    if (!isUserAuthenticated()) {
      showChatToast("Please log in first to chat with us.");
      switchAuthTab("login");
      openModal(loginModalOverlay);
      return;
    }

    if (!GENESYS_MESSAGING_ENABLED) {
      showChatToast(
        "You're logged in. Genesys authenticated messaging will be enabled after Phase 2/3 configuration."
      );
      return;
    }

    // TODO (Phase 3): open the real Genesys Web Messenger widget here,
    // passing getGenesysParticipantData() as participant attributes,
    // instead of showing this placeholder toast.
    showChatToast("Genesys Web Messenger integration will be added here.");
  }

  chatFab.addEventListener("click", openGenesysChat);

  /* =======================================================
     9. Misc
     ======================================================= */
  document.getElementById("footerYear").textContent = new Date().getFullYear();

  /* =======================================================
     10. App init
     ======================================================= */
  initializeAuthentication();
  updateAuthUI();

  if (!isUserAuthenticated()) {
    if (AUTH_MODE === "OIDC") {
      // Phase 2: once OidcAuth.login() is fully implemented, uncomment
      // the line below to automatically redirect unauthenticated
      // visitors to the Identity Provider on page load.
      // startLogin();
    } else {
      // Phase 1: automatically prompt for login/registration — the
      // user should not have to click "Login" first.
      switchAuthTab("login");
      openModal(loginModalOverlay);
    }
  }

  if (GENESYS_MESSAGING_ENABLED) {
    initializeGenesysMessaging();
  }
})();
