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

  // ✅ LOGIN
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

        // ✅ NO setUser
        navigate("/dashboard", { replace: true });
      } else {
        setLoginMsg({ text: text || "Login failed", type: "error" });
      }
    } catch (err) {
      console.log(err);
      setLoginMsg({ text: "Error connecting to server.", type: "error" });
    }
  }

  // ✅ SIGNUP
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

        // ✅ NO setUser
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);
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

          {/* LOGIN */}
          <div className={`form-panel${tab === "login" ? " active" : ""}`}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Your Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Password</label>
              <PasswordInput
                id="loginPassword"
                placeholder="Password"
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
              onClick={() => window.location.assign(googleLoginUrl)}
            >
              Continue with Google
            </button>
          </div>

          {/* SIGNUP */}
          <div className={`form-panel${tab === "signup" ? " active" : ""}`}>
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Your Email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Password</label>
              <PasswordInput
                id="regPassword"
                placeholder="Min 8 characters"
                value={regPassword}
                onChange={setRegPassword}
              />
            </div>

            <div className="field">
              <label>Mobile</label>
              <input
                type="tel"
                placeholder="+91..."
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
