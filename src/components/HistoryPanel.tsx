import type { HistoryItem } from "../types";

interface Props {
  items: HistoryItem[];
}

export default function HistoryPanel({ items }: Props) {
  return (
    <div className="card history-card">
      <div className="card-header">
        <div className="card-icon">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <span className="card-title">History</span>
      </div>
      <div className="card-body">
        <ul className="history-list">
          {items.length === 0 ? (
            <li className="empty-history">No history yet</li>
          ) : (
            [...items].reverse().map((item, i) => (
              <li key={i} className={`history-item${item.error ? " error-item" : ""}`}>
                <span className="history-dot" />
                <span>
                  {item.error
                    ? `❌ ${item.errorMessage}`
                    : `${item.input} = ${item.result}`}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
