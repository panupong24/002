import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, ADMIN_EMAIL } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseErrors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user is the designated admin email
        const isSuperAdminEmail = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        // Also check if admin record exists in Firestore admins collection
        let hasAdminDoc = false;
        try {
          const adminRef = doc(db, 'admins', currentUser.uid);
          const adminSnap = await getDoc(adminRef);
          if (adminSnap.exists()) {
            hasAdminDoc = true;
          } else if (isSuperAdminEmail) {
            // Provision the admin document automatically for the master admin
            await setDoc(adminRef, {
              email: currentUser.email,
              role: 'admin',
              createdAt: new Date().toISOString(),
            });
            hasAdminDoc = true;
          }
        } catch {
          // If check fails or offline, fall back to email match
          hasAdminDoc = isSuperAdminEmail;
        }

        setIsAdmin(isSuperAdminEmail || hasAdminDoc);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      // Ignore user cancellation popup
      if (error?.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error('Google Sign-in failed:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
