import { useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import Calculator from "../components/Calculator";

export default function DashboardPage() {
  const { user, loading, setUser } = useAuth(false);

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
      <Navbar user={user} setUser={setUser} />
      <div className="page">
        <Calculator onHistoryUpdate={handleHistoryUpdate} />
      </div>
    </>
  );
}
