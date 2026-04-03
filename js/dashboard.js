const API_BASE = "http://localhost:8080/api";

const ARITHMETIC_BLOCKED_TYPES = ["TemperatureUnit"];

let isLoggedIn = false;

async function loadUser() {
  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      document.getElementById("profileName").innerText = "Guest";
      document.getElementById("profileEmail").innerText = "-";
      document.getElementById("userName").innerText = "Guest";
      document.getElementById("avatarInitial").innerText = "G";
      return;
    }

    isLoggedIn = true;

    const user = await res.json();

    document.getElementById("profileName").innerText = user.name || "-";
    document.getElementById("profileEmail").innerText = user.email || "-";
    document.getElementById("userName").innerText = user.name || user.email;

    const initials = (user.name || user.email || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    document.getElementById("avatarInitial").innerText = initials;
  } catch (err) {
    isLoggedIn = false;
    console.error(err);
  }
}

async function logout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  window.location.href = "index.html";
}

const unitMap = {
  LengthUnit: ["FEET", "INCHES", "YARDS", "CENTIMETERS"],
  VolumeUnit: ["LITRE", "MILLILITRE", "GALLON"],
  WeightUnit: ["GRAM", "KILOGRAM", "POUND"],
  TemperatureUnit: ["CELSIUS", "FAHRENHEIT", "KELVIN"],
};

function handleAuth() {
  if (isLoggedIn) {
    logout();
  } else {
    window.location.href = "index.html";
  }
}

function selectType(value) {
  document
    .querySelectorAll(".type-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.value == value));

  document.getElementById("measurementType").value = value;
  populateUnits(value);
  updateArithmeticButtons(value);
}

function updateArithmeticButtons(type) {
  const isBlocked = ARITHMETIC_BLOCKED_TYPES.includes(type);

  const arithmeticBtns = [
    { selector: ".btn-add", label: "Add" },
    { selector: ".btn-subtract", label: "Subtract" },
    { selector: ".btn-divide", label: "Divide" },
  ];

  arithmeticBtns.forEach(({ selector, label }) => {
    const btn = document.querySelector(selector);
    if (!btn) return;
    btn.disabled = isBlocked;
    btn.title = isBlocked ? `${label} is not supported for Temperature` : "";
  });

  const banner = document.getElementById("tempWarningBanner");
  if (banner) banner.style.display = isBlocked ? "flex" : "none";
}

function populateUnits(type) {
  const unit1 = document.getElementById("unit1");
  const unit2 = document.getElementById("unit2");

  unit1.innerHTML = "";
  unit2.innerHTML = "";

  if (!type || !unitMap[type]) return;

  unitMap[type].forEach((unit, i) => {
    unit1.appendChild(
      Object.assign(document.createElement("option"), {
        value: unit,
        text: unit,
      }),
    );

    const o2 = Object.assign(document.createElement("option"), {
      value: unit,
      text: unit,
    });

    if (i === 1) o2.selected = true;
    unit2.appendChild(o2);
  });

  convert();
}

function validateInput(value, unit) {
  if (value === "" || isNaN(value)) return "Enter valid number";
  if (!unit) return "Select a unit";
  return null;
}

function showResult(text, type = "default") {
  const banner = document.getElementById("resultBanner");
  const e1 = document.getElementById("result");

  banner.className = "result-banner";
  e1.className = "";

  if (type === "success") {
    banner.classList.add("has-result");
    e1.className = "success";
  } else if (type === "error") {
    banner.classList.add("error-result");
    e1.className = "error";
  }

  e1.innerText = text;
}

function swapUnits() {
  const unit1 = document.getElementById("unit1");
  const unit2 = document.getElementById("unit2");
  const value1 = document.getElementById("value1");
  const value2 = document.getElementById("value2");
  const tempUnit = unit1.value;
  unit1.value = unit2.value;
  unit2.value = tempUnit;
  const tempValue = value1.value;
  value1.value = value2.value;
  value2.value = tempValue;
  convert();
}

async function convert() {
  const value = parseFloat(document.getElementById("value1").value);
  const sourceUnit = document.getElementById("unit1").value;
  const targetUnit = document.getElementById("unit2").value;
  const type = document.getElementById("measurementType").value;

  if (!type) return;

  const error = validateInput(value, sourceUnit);
  if (error) {
    showResult(error, "error");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/quantity/convert?targetUnit=${targetUnit}`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: value,
          unit: sourceUnit,
          measurementType: type,
        }),
      },
    );

    if (!res.ok) {
      showResult("Conversion failed", "error");
      return;
    }

    const data = await res.json();
    showResult(
      `${value} ${sourceUnit} = ${data.value} ${data.unit}`,
      "success",
    );

    document.getElementById("value2").value = data.value;
    loadHistory();
  } catch {
    showResult("Server error", "error");
  }
}

async function compare() {
  const v1 = parseFloat(document.getElementById("value1").value);
  const v2 = parseFloat(document.getElementById("value2").value);
  const unit1 = document.getElementById("unit1").value;
  const unit2 = document.getElementById("unit2").value;
  const type = document.getElementById("measurementType").value;

  if (!type) return;

  const error = validateInput(v1, unit1);
  if (error) {
    showResult(error, "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/quantity/compare`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thisQuantity: { value: v1, unit: unit1, measurementType: type },
        thatQuantity: { value: v2, unit: unit2, measurementType: type },
      }),
    });

    const isEqual = await res.json();

    showResult(
      isEqual
        ? `Equal — both quantities are the same`
        : `Not equal — the quantities differ`,
      "success",
    );

    loadHistory();
  } catch {
    showResult("Server error", "error");
  }
}

function guardArithmetic(operationName) {
  const type = document.getElementById("measurementType").value;

  if (ARITHMETIC_BLOCKED_TYPES.includes(type)) {
    showResult(
      `${operationName} is not allowed for Temperature units`,
      "error",
    );
    return false;
  }

  return true;
}

async function add() {
  if (!guardArithmetic("Add")) return;

  const v1 = parseFloat(document.getElementById("value1").value);
  const v2 = parseFloat(document.getElementById("value2").value);
  const unit1 = document.getElementById("unit1").value;
  const unit2 = document.getElementById("unit2").value;
  const type = document.getElementById("measurementType").value;

  try {
    const res = await fetch(`${API_BASE}/quantity/add`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thisQuantity: { value: v1, unit: unit1, measurementType: type },
        thatQuantity: { value: v2, unit: unit2, measurementType: type },
      }),
    });

    const data = await res.json();
    showResult(`Result: ${data.value} ${data.unit}`, "success");
    loadHistory();
  } catch {
    showResult("Server error", "error");
  }
}

async function subtract() {
  if (!guardArithmetic("Subtract")) return;

  const v1 = parseFloat(document.getElementById("value1").value);
  const v2 = parseFloat(document.getElementById("value2").value);
  const unit1 = document.getElementById("unit1").value;
  const unit2 = document.getElementById("unit2").value;
  const type = document.getElementById("measurementType").value;

  try {
    const res = await fetch(`${API_BASE}/quantity/subtract`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thisQuantity: { value: v1, unit: unit1, measurementType: type },
        thatQuantity: { value: v2, unit: unit2, measurementType: type },
      }),
    });

    const data = await res.json();
    showResult(`Result: ${data.value} ${data.unit}`, "success");
    loadHistory();
  } catch {
    showResult("Server error", "error");
  }
}

async function divide() {
  if (!guardArithmetic("Divide")) return;

  const v1 = parseFloat(document.getElementById("value1").value);
  const v2 = parseFloat(document.getElementById("value2").value);
  const unit1 = document.getElementById("unit1").value;
  const unit2 = document.getElementById("unit2").value;
  const type = document.getElementById("measurementType").value;

  if (v2 === 0) {
    showResult("Cannot divide by zero", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/quantity/divide`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thisQuantity: { value: v1, unit: unit1, measurementType: type },
        thatQuantity: { value: v2, unit: unit2, measurementType: type },
      }),
    });

    const data = await res.json();
    showResult(`Result: ${data}`, "success");
    loadHistory();
  } catch {
    showResult("Server error", "error");
  }
}

async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE}/history`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) return;

    const data = await res.json();
    const list = document.getElementById("historyList");

    if (!data.length) {
      list.innerHTML = '<li class="empty-history">No history yet</li>';
      return;
    }

    list.innerHTML = "";

    data
      .slice()
      .reverse()
      .forEach((item) => {
        const li = document.createElement("li");
        li.className = "history-item" + (item.error ? " error-item" : "");

        li.innerHTML = `
          <span class="history-dot"></span>
          <span>${
            item.error
              ? "❌ " + item.errorMessage
              : item.input + " = " + item.result
          }</span>
        `;

        list.appendChild(li);
      });
  } catch (e) {
    console.error(e);
  }
}

document.getElementById("value1").addEventListener("input", convert);
document.getElementById("unit1").addEventListener("change", convert);
document.getElementById("unit2").addEventListener("change", convert);

loadUser();
loadHistory();
