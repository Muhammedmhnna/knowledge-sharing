import React, { createContext, useContext, useState, useEffect } from "react";
const AdminContext = createContext();
export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminData");
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        if (parsedAdmin?.token) {
          setAdmin(parsedAdmin);
        }
      } catch (error) {
        console.error("Failed to parse admin data", error);
        localStorage.removeItem("adminData");
      }
    }
  }, []);

  const updateAdmin = (adminData) => {
    const token = adminData.token?.startsWith("noteApp__")
      ? adminData.token
      : `noteApp__${adminData.token || ""}`;

    const updatedAdmin = { ...adminData, token };
    setAdmin(updatedAdmin);
    localStorage.setItem("adminData", JSON.stringify(updatedAdmin));
  };

  const clearAdmin = () => {
    setAdmin(null);
    localStorage.removeItem("adminData");
  };

  const isAuthenticated = !!admin?.token;

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAdminAuthenticated: isAuthenticated,
        updateAdmin,
        clearAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
