import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  type CognitoUserSession,
} from "amazon-cognito-identity-js";

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_USER_POOL_ID,
  ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
});

export interface LoginResult {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  idToken: string | null;
  unverifiedEmail: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  setUnverifiedEmail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const user = userPool.getCurrentUser();
    if (user) {
      user.getSession(
        (err: Error | null, session: CognitoUserSession | null) => {
          if (!err && session?.isValid()) {
            setIdToken(session.getIdToken().getJwtToken());
          }
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  // Refresh token before expiry (every 45 min; Cognito tokens last ~60 min)
  useEffect(() => {
    if (!idToken) return;

    const interval = setInterval(
      () => {
        const user = userPool.getCurrentUser();
        if (user) {
          user.getSession(
            (err: Error | null, session: CognitoUserSession | null) => {
              if (!err && session?.isValid()) {
                setIdToken(session.getIdToken().getJwtToken());
              } else {
                setIdToken(null);
              }
            }
          );
        }
      },
      45 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [idToken]);

  const login = useCallback(async (email: string, password: string) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    return new Promise<LoginResult>((resolve, reject) => {
      user.authenticateUser(authDetails, {
        onSuccess(session) {
          setIdToken(session.getIdToken().getJwtToken());
          resolve({
            idToken: session.getIdToken().getJwtToken(),
            accessToken: session.getAccessToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
            expiresAt: session.getIdToken().getExpiration() * 1000,
          });
        },
        onFailure(err) {
          if (err.name === "UserNotConfirmedException") {
            setUnverifiedEmail(email);
          }
          reject(err);
        },
      });
    });
  }, []);

  const logout = useCallback(() => {
    const user = userPool.getCurrentUser();
    if (user) user.signOut();
    setIdToken(null);
    setUnverifiedEmail(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: idToken !== null,
        isLoading,
        idToken,
        unverifiedEmail,
        login,
        logout,
        setUnverifiedEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
