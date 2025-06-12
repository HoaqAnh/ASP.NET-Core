import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { loginUser, registerUser } from "@features/auth/services/authService";
import type { User, LoginPayload, RegisterPayload, AuthResponse } from "../types/auth.types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<any>;
  completeAdminLogin: (authResponse: AuthResponse) => void;
  logout: () => void;
  register: (data: RegisterPayload) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("authUser");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginPayload) => {
    const response = await loginUser(data);

    if (response.token) {
      const { token, email, fullName, role } = response;
      const userData: User = { email, fullName, role };
      
      setToken(token);
      setUser(userData);
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(userData));
    }
    
    return response;
  };

  const completeAdminLogin = (authResponse: AuthResponse) => {
    const { token, email, fullName, role } = authResponse;
    const userData: User = { email, fullName, role };
      
    setToken(token);
    setUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const register = async (data: RegisterPayload) => {
    return await registerUser(data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    completeAdminLogin,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
