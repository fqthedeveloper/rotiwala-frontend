import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../service/firebase";

const AuthContext =
  createContext();

export const AuthProvider = ({
  children,
}) => {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const loadLocalUser = () => {

    const userData =
      localStorage.getItem("user");

    const role =
      localStorage.getItem("role");

    if (userData) {

      const parsedUser =
        JSON.parse(userData);

      setUser({
        ...parsedUser,
        role,
      });

      return true;
    }

    return false;
  };

  useEffect(() => {

    loadLocalUser();

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {

          if (firebaseUser) {

            const role =
              localStorage.getItem(
                "role"
              );

            const localUser =
              JSON.parse(
                localStorage.getItem(
                  "user"
                ) || "{}"
              );

            setUser({
              ...localUser,
              uid:
                firebaseUser.uid,
              phone:
                firebaseUser.phoneNumber,
              role,
            });

          } else {

            const restored =
              loadLocalUser();

            if (!restored) {
              setUser(null);
            }
          }

          setLoading(false);
        }
      );

    const authChanged =
      () => {

        loadLocalUser();
      };

    window.addEventListener(
      "authChanged",
      authChanged
    );

    return () => {

      unsubscribe();

      window.removeEventListener(
        "authChanged",
        authChanged
      );
    };

  }, []);

  const logout = async () => {

    try {

      await signOut(auth);

    } catch {}

    localStorage.removeItem(
      "access"
    );

    localStorage.removeItem(
      "refresh"
    );

    localStorage.removeItem(
      "role"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "user_id"
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;