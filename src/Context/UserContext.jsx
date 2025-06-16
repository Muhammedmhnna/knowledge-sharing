import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined يعني لم يتم التحقق بعد

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = localStorage.getItem("userData");
        if (!storedUser) {
          setUser(null); // لا يوجد مستخدم مسجل
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        if (parsedUser.token?.startsWith("noteApp__")) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("userData");
          setUser(null);
        }
      } catch (error) {
        console.error("Invalid user data:", error);
        localStorage.removeItem("userData");
        setUser(null);
      }
    };

    loadUserFromStorage();
  }, []);

  const updateUser = (userData) => {
    const token = userData.token.startsWith("noteApp__")
      ? userData.token
      : `noteApp__${userData.token}`;

    const updatedData = { ...userData, token };
    setUser(updatedData);
    localStorage.setItem("userData", JSON.stringify(updatedData));
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("userData");
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);