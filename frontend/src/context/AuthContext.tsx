import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, TOKEN_KEY, getErrorMessage } from "@/lib/api";
import type { User } from "@/types";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResult {
  user: User;
  token: string;
}

export interface RegisterResponse {
  email: string;
  delivered: boolean;
  message: string;
  fallbackOtp?: string;
}

export interface ResendOtpResponse {
  delivered: boolean;
  message: string;
  fallbackOtp?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  verificationRequired: string[];
  login: (input: LoginInput) => Promise<{ verificationRequired: string[]; user: User }>;
  register: (input: RegisterInput) => Promise<RegisterResponse>;
  verifyOtp: (email: string, code: string) => Promise<RegisterResult>;
  resendOtp: (email: string) => Promise<ResendOtpResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, "name" | "phone">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "shikha_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const persistUser = useCallback((nextUser: User | null) => {
    setUser(nextUser);

    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get<{ success: boolean; data: User }>(
        "/users/me"
      );

      persistUser(data.data);
    } catch {
      // Profile refresh failures are non-fatal
    }
  }, [persistUser]);

  useEffect(() => {
    const onUnauthorized = () => {
      persistUser(null);
    };

    window.addEventListener("auth:unauthorized", onUnauthorized);

    return () =>
      window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, [persistUser]);

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      void refreshProfile();
    }
  }, [refreshProfile]);

  const login = useCallback(
    async (input: LoginInput): Promise<{
      verificationRequired: string[];
      user: User;
    }> => {
      setIsLoading(true);

      try {
        const { data } = await api.post<{
          success: boolean;
          data: {
            token: string;
            user: User;
            verificationRequired?: string[];
          };
        }>("/auth/login", input);

        localStorage.setItem(TOKEN_KEY, data.data.token);
        persistUser(data.data.user);

        return {
          verificationRequired: data.data.verificationRequired ?? [],
          user: data.data.user,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [persistUser]
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<RegisterResponse> => {
      setIsLoading(true);

      try {
        const { data } = await api.post<{
          success: boolean;
          data: RegisterResponse;
        }>("/auth/register", input);

        // No account is created yet — the OTP must be verified first.
        return data.data;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyOtp = useCallback(
    async (email: string, code: string): Promise<RegisterResult> => {
      setIsLoading(true);

      try {
        const { data } = await api.post<{
          success: boolean;
          data: RegisterResult;
        }>("/auth/verify-otp", { email, code });

        localStorage.setItem(TOKEN_KEY, data.data.token);
        persistUser(data.data.user);

        return data.data;
      } finally {
        setIsLoading(false);
      }
    },
    [persistUser]
  );

  const resendOtp = useCallback(async (email: string): Promise<ResendOtpResponse> => {
    const { data } = await api.post<{
      success: boolean;
      data: ResendOtpResponse;
    }>("/auth/resend-otp", { email });

    return data.data;
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Pick<User, "name" | "phone">>) => {
      const { data: response } = await api.patch<{
        success: boolean;
        data: User;
      }>("/users/me", data);

      persistUser(response.data);
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    persistUser(null);
  }, [persistUser]);

  const verificationRequired = useMemo(() => {
    const required: string[] = [];

    if (user && !user.isVerified) required.push("email");
    if (user?.phone && !user.phoneVerified) required.push("phone");

    return required;
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      verificationRequired,
      login,
      register,
      verifyOtp,
      resendOtp,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [
      user,
      isLoading,
      verificationRequired,
      login,
      register,
      verifyOtp,
      resendOtp,
      logout,
      refreshProfile,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export { getErrorMessage };
