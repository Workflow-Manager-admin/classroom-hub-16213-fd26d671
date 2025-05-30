import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  auth 
} from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  Unsubscribe,
} from "firebase/auth";

// PUBLIC_INTERFACE
/**
 * Types for AuthContext state and methods.
 */
export interface AuthContextProps {
  currentUser: User | null;
  signUp: (email: string, password: string) => Promise<User | null>;
  logIn: (email: string, password: string) => Promise<User | null>;
  logOut: () => Promise<void>;
}

// Create a Context with default empty implementation for autocomplete.
const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  signUp: async () => null,
  logIn: async () => null,
  logOut: async () => {},
});

/**
 * AuthProviderProps: children must be ReactNode.
 */
interface AuthProviderProps {
  children: ReactNode;
}

// PUBLIC_INTERFACE
/**
 * AuthProvider: React Context Provider for Auth.
 * - Manages currentUser state
 * - Exposes signUp, logIn, logOut using Firebase Auth
 *
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Observe Firebase Auth user state
  useEffect(() => {
    let unsubscribe: Unsubscribe = () => {};
    unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Create an account with email and password
   */
  const signUp = async (email: string, password: string) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    setCurrentUser(userCred.user);
    return userCred.user;
  };

  // PUBLIC_INTERFACE
  /**
   * Log in with email and password
   */
  const logIn = async (email: string, password: string) => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    setCurrentUser(userCred.user);
    return userCred.user;
  };

  // PUBLIC_INTERFACE
  /**
   * Log the current user out
   */
  const logOut = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        signUp,
        logIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// PUBLIC_INTERFACE
/**
 * Hook to access AuthContext from React components.
 */
export const useAuth = (): AuthContextProps => useContext(AuthContext);

// PUBLIC_INTERFACE
/**
 * Type guard for extracting the User's UID in a typesafe way.
 */
export const getCurrentUserUID = (): string | null =>
  auth.currentUser ? auth.currentUser.uid : null;
