const API_BASE = "http://localhost:8080/api";

async function loadUser() {
  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      window.location.href = "../index.html";
      return;
    }

    const user = await res.json();

    document.getElementById("user").innerHTML = `
    <p>Name: ${user.name}</p>
    <p>Email: ${user.email}</p>
    ${
      user.pictureUrl
        ? `<img src="${user.pictureUrl}" width="100"/>`
        : `<p>No profile picture</p>`
    }
`;
  } catch (err) {
    console.error(err);
    window.location.href = "../index.html";
  }
}

async function logout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  window.location.href = "../index.html";
}

loadUser();
