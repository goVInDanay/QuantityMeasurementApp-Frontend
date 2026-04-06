import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi, googleLoginUrl } from "../api";
import PasswordInput from "../components/PasswordInput";

type Tab = "login" | "signup";

export default function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("signup");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMsg, setLoginMsg] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [signupMsg, setSignupMsg] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  function switchTab(t: Tab) {
    setTab(t);
    setLoginMsg(null);
    setSignupMsg(null);
  }

  async function handleLogin() {
    if (!loginEmail || !loginPassword) {
      setLoginMsg({ text: "Please fill in all fields.", type: "error" });
      return;
    }
    try {
      const res = await loginApi(loginEmail, loginPassword);
      const text = await res.text();
      if (res.ok) {
        setLoginMsg({
          text: "Login successful! Redirecting…",
          type: "success",
        });
        setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
      } else {
        setLoginMsg({ text: text || "Login failed", type: "error" });
      }
    } catch {
      setLoginMsg({ text: "Error connecting to server.", type: "error" });
    }
  }

  async function handleSignup() {
    if (!regName || !regEmail || !regPassword) {
      setSignupMsg({ text: "Please fill in all the details", type: "error" });
      return;
    }
    try {
      const res = await registerApi(regName, regEmail, regPassword, regMobile);
      const text = await res.text();
      if (res.ok) {
        setSignupMsg({
          text: "Registered successfully! Redirecting…",
          type: "success",
        });
        setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
      } else {
        setSignupMsg({ text: text || "Registration failed", type: "error" });
      }
    } catch {
      setSignupMsg({ text: "Error connecting to server.", type: "error" });
    }
  }

  return (
    <div className="auth-body">
      <div className="wrapper">
        <div className="left-panel">
          <div className="brand-name">
            Quantity
            <br />
            Measurement App
          </div>
        </div>

        <div className="right-panel">
          <div className="tabs">
            <button
              className={`tab-btn${tab === "login" ? " active" : ""}`}
              onClick={() => switchTab("login")}
            >
              Login
            </button>
            <button
              className={`tab-btn${tab === "signup" ? " active" : ""}`}
              onClick={() => switchTab("signup")}
            >
              Signup
            </button>
          </div>

          <div className={`form-panel${tab === "login" ? " active" : ""}`}>
            <div className="field">
              <label htmlFor="loginEmail">Email</label>
              <input
                type="email"
                id="loginEmail"
                placeholder="Your Email"
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="loginPassword">Password</label>
              <PasswordInput
                id="loginPassword"
                placeholder="Password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={setLoginPassword}
              />
            </div>
            {loginMsg && (
              <p className={`form-message ${loginMsg.type}`}>{loginMsg.text}</p>
            )}
            <button className="btn-primary" onClick={handleLogin}>
              Login
            </button>
            <div className="divider">or</div>
            <button
              className="btn-google"
              onClick={() => {
                window.location.assign(googleLoginUrl);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className={`form-panel${tab === "signup" ? " active" : ""}`}>
            <div className="field">
              <label htmlFor="regName">Full Name</label>
              <input
                type="text"
                id="regName"
                placeholder="Your Name"
                autoComplete="name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="regEmail">Email Id</label>
              <input
                type="email"
                id="regEmail"
                placeholder="Your Email"
                autoComplete="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="regPassword">Password</label>
              <PasswordInput
                id="regPassword"
                placeholder="Min 8 characters"
                autoComplete="new-password"
                value={regPassword}
                onChange={setRegPassword}
              />
            </div>
            <div className="field">
              <label htmlFor="regMobile">Mobile Number</label>
              <input
                type="tel"
                id="regMobile"
                placeholder="+91 00000 00000"
                autoComplete="tel"
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value)}
              />
            </div>
            {signupMsg && (
              <p className={`form-message ${signupMsg.type}`}>
                {signupMsg.text}
              </p>
            )}
            <button className="btn-primary" onClick={handleSignup}>
              Signup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
