import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { getHistory } from "../api";
import Navbar from "../components/Navbar";
import type { HistoryItem } from "../types";

export default function HistoryPage() {
  const { user, loading, setUser } = useAuth(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ Fetch history safely
  const refresh = useCallback(async () => {
    try {
      setFetching(true);
      const items = await getHistory();
      setHistory(items || []);
    } catch (e) {
      console.error("History fetch failed:", e);
      setHistory([]);
    } finally {
      setFetching(false);
    }
  }, []);

  // ✅ Only fetch AFTER user is loaded
  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user, refresh]);

  // ✅ Loading screen
  if (loading) {
    return (
      <div className="page-loader">
        <span>Loading…</span>
      </div>
    );
  }

  // ✅ Unauthorized protection
  if (!user) {
    return <div>Please login</div>;
  }

  // ✅ Format history text (FIXED CORE ISSUE)
  const formatText = (item: any) => {
    if (item.error) return item.errorMessage;

    const first = `${item.thisValue ?? ""} ${item.thisUnit ?? ""}`;
    const second =
      item.thatValue != null
        ? ` → ${item.thatValue} ${item.thatUnit ?? ""}`
        : "";

    return first + second;
  };

  // ✅ Search fix
  const displayed = [...history].reverse().filter((item) => {
    const q = search.toLowerCase();
    if (!q) return true;

    const text = formatText(item);
    return text.toLowerCase().includes(q);
  });

  const successCount = history.filter((h) => !h.error).length;
  const errorCount = history.filter((h) => h.error).length;

  return (
    <>
      <Navbar user={user} setUser={setUser} />

      <div className="history-page">
        <div className="history-page-header">
          <div>
            <h1 className="history-page-title">History</h1>
            <p className="history-page-subtitle">All your past calculations</p>
          </div>

          <button className="btn-refresh" onClick={refresh} title="Refresh">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.62" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="history-stats">
          <div className="stat-card">
            <span className="stat-number">{history.length}</span>
            <span className="stat-label">Total</span>
          </div>

          <div className="stat-card stat-success">
            <span className="stat-number">{successCount}</span>
            <span className="stat-label">Successful</span>
          </div>

          <div className="stat-card stat-error">
            <span className="stat-number">{errorCount}</span>
            <span className="stat-label">Errors</span>
          </div>
        </div>

        <div className="history-search-wrap">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            className="history-search"
            type="text"
            placeholder="Search history…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="card history-page-card">
          <div className="card-body" style={{ padding: "16px 24px" }}>
            {fetching ? (
              <p className="empty-history">Loading…</p>
            ) : displayed.length === 0 ? (
              <p className="empty-history">
                {search
                  ? "No results match your search."
                  : "No history yet — start calculating!"}
              </p>
            ) : (
              <ul className="history-full-list">
                {displayed.map((item, i) => (
                  <li
                    key={i}
                    className={`history-full-item${
                      item.error ? " error-item" : ""
                    }`}
                  >
                    <span className="history-dot" />

                    <span className="history-full-text">
                      {formatText(item)}
                    </span>

                    <span
                      className={`history-badge ${
                        item.error ? "badge-error" : "badge-success"
                      }`}
                    >
                      {item.error ? "Error" : "OK"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
