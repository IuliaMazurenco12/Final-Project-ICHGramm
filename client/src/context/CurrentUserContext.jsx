import { createContext, useContext, useEffect, useState } from "react";
import httpClient from "../api/httpClient";

const CurrentUserContext = createContext(null);

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ichgram_token");

    if (!token) {
      setIsChecking(false);
      return;
    }

    httpClient
      .get("/auth/me")
      .then((res) => setCurrentUser(res.data.user))
      .catch(() => localStorage.removeItem("ichgram_token"))
      .finally(() => setIsChecking(false));
  }, []);

  const startSession = (token, user) => {
    localStorage.setItem("ichgram_token", token);
    setCurrentUser(user);
  };

  const endSession = () => {
    localStorage.removeItem("ichgram_token");
    setCurrentUser(null);
  };

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isChecking,
        startSession,
        endSession,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => useContext(CurrentUserContext);
