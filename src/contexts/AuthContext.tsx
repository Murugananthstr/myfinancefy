import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  User
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

interface UserProfile {
  email?: string;
  role?: string;
  status?: string;
  displayName?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext) as AuthContextType;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create Firestore user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      displayName: email.split('@')[0], // Default to email prefix
      photoURL: null,
      role: 'user', // Default role
      status: 'active', // Default status
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return userCredential;
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Subscribe to user profile changes
        setLoading(true); // Keep loading while fetching profile
        const userDocRef = doc(db, 'users', user.uid);
        
        unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
           if (doc.exists()) {
             const data = doc.data() as UserProfile;
             if (data.status === 'disabled') {
                signOut(auth);
                alert("Your account has been disabled.");
                return;
             }
             setUserProfile(data);
           } else {
             setUserProfile(null);
           }
           setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setLoading(false);
        });
      } else {
        setUserProfile(null);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
