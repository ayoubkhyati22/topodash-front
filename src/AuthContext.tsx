import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  username: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
  token: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      console.log("Stored user from localStorage:", storedUser); // Debug log
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed user:", parsedUser); // Debug log
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      localStorage.removeItem("user"); // Clean up corrupted data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    console.log("Login function called with:", userData); // Debug log
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    console.log("User set in context:", userData); // Debug log
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading,
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);