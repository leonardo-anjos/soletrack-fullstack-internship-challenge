// src/routes/PrivateRoutes.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MainLayout from "../components/MainLayout";

interface Props {
  roles?: ("ADMIN" | "OPERATOR")[];
}

const PrivateRoutes: React.FC<Props> = ({ roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: "2rem" }}>Carregando sistema...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🔥 Controle de roles
  if (roles && !roles.includes(user.role?.toUpperCase() as any)) {
    return <Navigate to="/home" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default PrivateRoutes;
