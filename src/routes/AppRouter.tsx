import { useCallback, useEffect, useState } from "react";
import App from "../App";
import { AboutPage } from "../pages/AboutPage";

export default function AppRouter() {
  const [path, setPath] = useState(window.location.pathname === "/about" ? "/about" : "/");

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname === "/about" ? "/about" : "/");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((nextPath: "/" | "/about") => {
    if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return path === "/about" ? <AboutPage onNavigate={navigate} /> : <App onNavigate={navigate} />;
}
