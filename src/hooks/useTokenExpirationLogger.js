import { useEffect } from "react";
import {jwtDecode} from "jwt-decode";

export const useTokenExpirationLogger = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const exp = decoded.exp * 1000; // convert to ms
      const now = Date.now();

      if (now >= exp) {
        console.log("Token is expired.");
        return;
      }

      const timeUntilExpiry = exp - now;

      const timer = setTimeout(() => {
        console.log("Token is expired.");
      }, timeUntilExpiry);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }, []);
};
