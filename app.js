/* =========================================================
   ModernNest Furniture — app.js
   Plain, dependency-free JavaScript.

   Sections:
   1. Product data + rendering
   2. Product details modal
   3. Login modal (placeholder — see TODO for OAuth/OIDC)
   4. Mobile navigation toggle
   5. Genesys chat button (placeholder — see TODO for Genesys)
   6. Misc (footer year)
   ========================================================= */

(function () {
  "use strict";

  /* -----------------------------------------------------
     1. Product data + rendering
     ----------------------------------------------------- */
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

  /* -----------------------------------------------------
     2. Product details modal
     ----------------------------------------------------- */
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

  /* -----------------------------------------------------
     Generic modal helpers (shared by both modals)
     ----------------------------------------------------- */
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
  [productModalOverlay, document.getElementById("loginModalOverlay")].forEach((overlay) => {
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

  /* -----------------------------------------------------
     3. Login modal (placeholder)
     ----------------------------------------------------- */
  const loginBtn = document.getElementById("loginBtn");
  const loginModalOverlay = document.getElementById("loginModalOverlay");
  const loginModalClose = document.getElementById("loginModalClose");
  const loginForm = document.getElementById("loginForm");
  const loginFormNote = document.getElementById("loginFormNote");

  loginBtn.addEventListener("click", () => openModal(loginModalOverlay));
  loginModalClose.addEventListener("click", () => closeModal(loginModalOverlay));

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // ---------------------------------------------------------------
    // TODO: Replace with OAuth 2.0 / OpenID Connect authentication.
    //
    // This form currently does nothing with the values entered — it
    // never stores, transmits, or validates the Customer ID / password.
    // It exists only to hold the UI's place until the real flow (an
    // OAuth 2.0 / OIDC redirect to an identity provider) is wired in.
    //
    // When implementing the real flow:
    //   1. Replace this submit handler with a redirect to the IdP's
    //      /authorize endpoint (or use an OIDC client library).
    //   2. Handle the callback/token exchange in a dedicated page or
    //      route — never store client secrets in this static frontend.
    //   3. Persist only the resulting ID token / session, not raw
    //      credentials, and use it to populate Genesys participant
    //      attributes (see the TODO in the chat button handler below).
    // ---------------------------------------------------------------

    loginFormNote.textContent =
      "This is a placeholder — real sign-in will use OAuth 2.0 / OIDC.";

    window.setTimeout(() => {
      closeModal(loginModalOverlay);
      loginForm.reset();
      loginFormNote.textContent = "";
    }, 1200);
  });

  /* -----------------------------------------------------
     4. Mobile navigation toggle
     ----------------------------------------------------- */
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

  /* -----------------------------------------------------
     5. Genesys chat button (placeholder)
     ----------------------------------------------------- */
  const chatFab = document.getElementById("chatFab");
  const chatToast = document.getElementById("chatToast");
  let chatToastTimer = null;

  // ---------------------------------------------------------------
  // TODO: Initialize Genesys Cloud Web Messenger.
  // TODO: Authenticate customer before starting authenticated messaging.
  //
  // In the target architecture, this button will:
  //   1. Load the Genesys Cloud Web Messenger deployment script.
  //   2. Pass the authenticated customer's identity (from the OAuth /
  //      OIDC flow above) into the messenger as participant attributes,
  //      so Genesys Architect can route/personalize the conversation.
  //   3. Open the Genesys messaging window in place of this toast.
  //
  // Until that's wired in, clicking the button just shows a short
  // placeholder message so the UI affordance is easy to demo and test.
  // ---------------------------------------------------------------
  function openGenesysChatPlaceholder() {
    chatToast.hidden = false;
    window.clearTimeout(chatToastTimer);
    chatToastTimer = window.setTimeout(() => {
      chatToast.hidden = true;
    }, 4000);
  }

  chatFab.addEventListener("click", openGenesysChatPlaceholder);

  /* -----------------------------------------------------
     6. Misc
     ----------------------------------------------------- */
  document.getElementById("footerYear").textContent = new Date().getFullYear();
})();
