import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { getHistory } from "../api";
import type { HistoryPage } from "../api";
import Navbar from "../components/Navbar";

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const { user, loading, setUser } = useAuth(true);

  const [historyPage, setHistoryPage] = useState<HistoryPage>({
    items: [],
    page: 0,
    size: PAGE_SIZE,
    totalElements: 0,
    isLast: true,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPage = useCallback(async (page: number) => {
    setFetching(true);
    try {
      const result = await getHistory(page, PAGE_SIZE);
      setHistoryPage(result);
      setCurrentPage(page);
    } catch (e) {
      console.error("History fetch failed:", e);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchPage(0);
  }, [user, fetchPage]);

  if (loading) {
    return (
      <div className="page-loader">
        <span>Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <div>Please login</div>;
  }

  const formatText = (item: any) => {
    if (item.error) return item.errorMessage;
    const first = `${item.thisValue ?? ""} ${item.thisUnit ?? ""}`;
    const second =
      item.thatValue != null
        ? ` → ${item.thatValue} ${item.thatUnit ?? ""}`
        : "";
    return first + second;
  };

  const displayed = historyPage.items.filter((item) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return formatText(item).toLowerCase().includes(q);
  });

  const successCount = historyPage.items.filter((h) => !h.error).length;
  const errorCount = historyPage.items.filter((h) => h.error).length;
  const totalPages = Math.ceil(historyPage.totalElements / PAGE_SIZE);
  const showingFrom =
    historyPage.totalElements === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const showingTo = Math.min(
    (currentPage + 1) * PAGE_SIZE,
    historyPage.totalElements,
  );

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="history-page">
        <div className="history-page-header">
          <div>
            <h1 className="history-page-title">History</h1>
            <p className="history-page-subtitle">All your past calculations</p>
          </div>
          <button
            className="btn-refresh"
            onClick={() => fetchPage(currentPage)}
            title="Refresh"
          >
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

        {/* Stats — shows TOTAL across all pages */}
        <div className="history-stats">
          <div className="stat-card">
            <span className="stat-number">{historyPage.totalElements}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card stat-success">
            <span className="stat-number">{successCount}</span>
            <span className="stat-label">Successful (this page)</span>
          </div>
          <div className="stat-card stat-error">
            <span className="stat-number">{errorCount}</span>
            <span className="stat-label">Errors (this page)</span>
          </div>
        </div>

        {/* Search */}
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
            placeholder="Search this page…"
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

        {/* List */}
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
                    className={`history-full-item${item.error ? " error-item" : ""}`}
                  >
                    <span className="history-dot" />
                    <span className="history-full-text">
                      {formatText(item)}
                    </span>
                    <span
                      className={`history-badge ${item.error ? "badge-error" : "badge-success"}`}
                    >
                      {item.error ? "Error" : "OK"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Pagination */}
        {historyPage.totalElements > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "16px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span
              style={{ fontSize: "13px", color: "var(--text-muted, #888)" }}
            >
              Showing {showingFrom}–{showingTo} of {historyPage.totalElements}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn-action"
                onClick={() => fetchPage(currentPage - 1)}
                disabled={currentPage === 0 || fetching}
                style={{ padding: "6px 14px", fontSize: "13px" }}
              >
                ← Prev
              </button>
              <span
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Page {currentPage + 1}
                {totalPages > 0 ? ` / ${totalPages}` : ""}
              </span>
              <button
                className="btn-action"
                onClick={() => fetchPage(currentPage + 1)}
                disabled={historyPage.isLast || fetching}
                style={{ padding: "6px 14px", fontSize: "13px" }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
