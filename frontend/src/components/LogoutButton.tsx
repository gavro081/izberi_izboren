import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
    >
      Одлогирај се
    </button>
  );
};
export default LogoutButton;
