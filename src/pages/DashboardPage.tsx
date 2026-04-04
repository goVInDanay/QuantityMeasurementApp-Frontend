import { useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import Calculator from "../components/Calculator";

export default function DashboardPage() {
  const { user, loading } = useAuth(true);

  const handleHistoryUpdate = useCallback(() => {}, []);

  if (loading) {
    return (
      <div className="page-loader">
        <span>Loading…</span>
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <div className="page">
        <Calculator onHistoryUpdate={handleHistoryUpdate} />
      </div>
    </>
  );
}
