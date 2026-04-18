const API_BASE = "quantitymeasurmentapp-production.up.railway.app/api";

function switchTab(tab) {
  const isLogin = tab === "login";
  document.getElementById("tabLogin").classList.toggle("active", isLogin);
  document.getElementById("tabSignup").classList.toggle("active", !isLogin);
  document.getElementById("panelLogin").classList.toggle("active", isLogin);
  document.getElementById("panelSignup").classList.toggle("active", !isLogin);
  document.getElementById("message").innerText = "";
  document.getElementById("loginMessage").innerText = "";
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  btn.innerHTML = isHidden
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
       </svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
       </svg>`;
}

async function handleSignup() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const msg = document.getElementById("message");

  if (!name || !email || !password) {
    msg.className = "error";
    msg.innerText = "Please fill in all the details";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.text();

    if (res.ok) {
      msg.className = "success";
      msg.innerText = "Registered successfully! Redirecting...";
      setTimeout(() => (window.location.href = "dashboard.html"), 1200);
    } else {
      msg.className = "error";
      msg.innerText = data;
    }
  } catch (err) {
    console.log(err);
    msg.className = "error";
    msg.innerText = "Error connecting to server";
  }
}

async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMessage");

  if (!email || !password) {
    msg.className = "error";
    msg.innerText = "Please fill in all fields.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.text();

    if (res.ok) {
      msg.className = "success";
      msg.innerText = "Login successful! Redirecting…";
      setTimeout(() => (window.location.href = "dashboard.html"), 1200);
    } else {
      msg.className = "error";
      msg.innerText = data;
    }
  } catch (err) {
    console.error(err);
    msg.className = "error";
    msg.innerText = "Error connecting to server.";
  }
}

function googleLogin() {
  window.location.href =
    "quantitymeasurmentapp-production.up.railway.app/oauth2/authorization/google";
}
