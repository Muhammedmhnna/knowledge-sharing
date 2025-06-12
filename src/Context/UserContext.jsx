import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const UserContext = createContext();

// Context provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user data from localStorage on initial render
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = localStorage.getItem("userData"); // ✅ use consistent key
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);

        // Validate token format
        if (parsedUser.token?.startsWith("noteApp__")) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("userData");
        }
      } catch (error) {
        console.error("Invalid user data in localStorage:", error);
        localStorage.removeItem("userData");
      }
    };

    loadUserFromStorage();
  }, []);

  // Update user state and store in localStorage
  const updateUser = (userData) => {
    const token = userData.token.startsWith("noteApp__")
      ? userData.token
      : `noteApp__${userData.token}`;

    const updatedData = {
      ...userData, // ← should contain _id and other info
      token,
    };

    setUser(updatedData);
    localStorage.setItem("userData", JSON.stringify(updatedData)); // ✅ same key
  };

  // Clear user state and localStorage
  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("userData"); // ✅ same key
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use user context
export const useUser = () => useContext(UserContext);
