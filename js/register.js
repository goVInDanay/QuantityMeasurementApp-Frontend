const API_BASE = "http://localhost:8080/api";

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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
        document.getElementById("message").innerText =
          "Registered successfully!";
        window.location.href = "dashboard.html";
      } else {
        document.getElementById("message").innerText = data;
      }
    } catch (err) {
      console.error(err);
      document.getElementById("message").innerText = "Error registering";
    }
  });

function goToLogin() {
  window.location.href = "index.html";
}
