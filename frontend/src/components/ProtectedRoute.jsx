import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";
import { Loading } from "./ui";

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Loading text="Checking your session..." />;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}
