import { useNavigate, useLocation, Link } from "react-router-dom";
import { logoutApi } from "../api";
import type { User } from "../types";

interface Props {
  user: User | null;
}

export default function Navbar({ user }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initials = user
    ? (user.name || user.email)
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  async function handleLogout() {
    await logoutApi();
    navigate("/", { replace: true });
  }

  async function handleLogin() {
    navigate("/", { replace: true });
  }

  return (
    <nav>
      <div className="nav-brand">
        <span className="nav-title">Quantity Measurement</span>
      </div>
      <div className="nav-links">
        <Link
          to="/dashboard"
          className={`nav-link${pathname === "/dashboard" ? " nav-link-active" : ""}`}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="12" y2="14" />
          </svg>
          Calculator
        </Link>
        <Link
          to="/history"
          className={`nav-link${pathname === "/history" ? " nav-link-active" : ""}`}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          History
        </Link>
      </div>

      <div className="nav-right">
        <div className="user-chip">
          <div className="avatar">{initials}</div>
          <span id="userName">{user?.name || user?.email || "User"}</span>
        </div>
        <button
          className="btn-logout"
          onClick={user?.name || user?.email ? handleLogout : handleLogin}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {user?.name || user?.email ? "Logout" : "Login"}
        </button>
      </div>
    </nav>
  );
}
