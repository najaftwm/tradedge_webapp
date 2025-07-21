import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { useStockContext } from "./StockContext"; // Un-comment and fix path as needed

// ---- UserContext Types (use TypeScript or adapt to JS propTypes/Prop checks) ----

export const UserContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [userDetailsError, setUserDetailsError] = useState("");
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userTransactions, setUserTransactions] = useState([]);
  const [transactionsError, setTransactionsError] = useState("");
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [purchasedPackagesId, setPurchasedPackagesId] = useState([]);

  const navigate = useNavigate();

  // ---- Utility: localStorage access ----
  function getStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  function setStorage(key, val) {
    try {
      window.localStorage.setItem(key, val);
    } catch {}
  }
  function removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }
  function multiRemove(keys) {
    keys.forEach(removeStorage);
  }

  // ---- Loading on first run ----
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const accessToken = getStorage("access_token");
        const userId = getStorage("user_id");
        if (accessToken && userId) {
          await Promise.all([
            getUserDetails(userId),
            getUserTransactions(userId),
          ]);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkLoginStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Get user details ----
  const getUserDetails = useCallback(async (userId) => {
    if (!userId) return;

    setUserDetailsLoading(true);
    setUserDetailsError("");

    try {
      const response = await axios.get(
        `https://gateway.twmresearchalert.com/kyc?user_id=${userId}`
      );

      if (response.data.status === "success") {
        setUserDetails(response.data.data);
        setStorage("user_details", JSON.stringify(response.data.data));
      } else {
        setUserDetailsError(response.data.message || "Failed to fetch user details");
      }
    } catch (error) {
      setUserDetailsError(
        error?.response?.data?.message ||
          "An error occurred while fetching user details"
      );
    } finally {
      setUserDetailsLoading(false);
    }
  }, []);

  // ---- Get user transactions ----
  const getUserTransactions = useCallback(async (userId) => {
    if (!userId) return;

    setTransactionsLoading(true);
    setTransactionsError("");

    try {
      const response = await axios.get(
        `https://tradedge-server.onrender.com/api/userTransactionsById?user_id=${userId}`
      );

      if (response.data.transactions.status === "success") {
        const packages = response.data.transactions.data.packages || [];
        setUserTransactions(packages);

        const packageIds = packages
          .filter(
            (pkg) =>
              parseFloat(pkg.payment_history?.[0]?.amount) ===
                parseFloat(pkg.package_details.package_price) &&
              pkg.payment_history?.[0]?.payment_status === "completed"
          )
          .map((pkg) => pkg.package_details.subtype_id);
        setPurchasedPackagesId(packageIds);
      } else {
        setTransactionsError(
          response.data.message || "Failed to fetch transactions"
        );
      }
    } catch (error) {
      setTransactionsError(
        error?.response?.data?.message ||
          "An error occurred while fetching transactions"
      );
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  // ---- Handle login ----
  const handleLogin = useCallback(
    async (loginData) => {
      setLoginLoading(true);
      setErrorMessage("");

      try {
        const userId = loginData.user_id.replace("LNUSR", "");
        setStorage("access_token", loginData.access_token);
        setStorage("user_id", userId);

        // Get user details and transactions
        await Promise.all([getUserDetails(userId), getUserTransactions(userId)]);
        setIsLoggedIn(true);

        navigate("/home", { replace: true });

        // TODO: fetch packages on login if needed
        // const stockContext = useStockContext();
        // if (stockContext) await stockContext.fetchPackages(true);

        return true;
      } catch (error) {
        const errorMsg =
          error?.response?.data?.messages?.join(", ") ||
          "Error processing login";
        setErrorMessage(errorMsg);
        setTimeout(() => setErrorMessage(""), 3000);
        return false;
      } finally {
        setLoginLoading(false);
      }
    },
    [getUserDetails, getUserTransactions, navigate]
  );

  // ---- Handle logout ----
  const logout = useCallback(async () => {
    try {
      multiRemove(["user_details", "access_token", "user_id"]);
      setUserDetails(null);
      setIsLoggedIn(false);
      // TODO: Optionally navigate to login page
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  }, []);

  // ---- Context value ----
  const value = useMemo(
    () => ({
      isLoggedIn,
      userDetails,
      userDetailsLoading,
      userDetailsError,
      loginLoading,
      errorMessage,
      isInitializing,
      userTransactions,
      transactionsLoading,
      transactionsError,
      purchasedPackagesId,
      setIsLoggedIn,
      handleLogin,
      logout,
      getUserTransactions,
    }),
    [
      isLoggedIn,
      userDetails,
      userDetailsLoading,
      userDetailsError,
      loginLoading,
      errorMessage,
      isInitializing,
      userTransactions,
      transactionsLoading,
      transactionsError,
      purchasedPackagesId,
      handleLogin,
      logout,
      getUserTransactions,
    ]
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};

// ---- Hook to use the context ----
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within an AuthProvider");
  return context;
};
