const API_BASE = "quantitymeasurmentapp-production.up.railway.app/api";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.text();
    if (res.ok) {
      document.getElementById("message").innerText = "Login Successful!";
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("message").innerText = data;
    }
  } catch (err) {
    console.log(err);
    document.getElementById("message").innerText = "Error logging in";
  }
});

function googleLogin() {
  window.location.href =
    "quantitymeasurmentapp-production.up.railway.app/oauth2/authorization/google";
}

function goToRegister() {
  window.location.href = "register.html";
}
