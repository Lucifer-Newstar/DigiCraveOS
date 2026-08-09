import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu, Dashboard } from "./pages";
import Header from "./components/shared/Header";
import Sidebar from "./components/shared/Sidebar";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";
import CustomerApp from "./CustomerApp";

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();
  const hideChromeRoutes = ["/auth"];
  const showChrome = !hideChromeRoutes.includes(location.pathname);
  const { isAuth } = useSelector((state) => state.user);

  if (isLoading) return <FullScreenLoader />;

  const routes = (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        }
      />
      <Route path="/auth" element={isAuth ? <Navigate to="/" /> : <Auth />} />
      <Route
        path="/orders"
        element={
          <ProtectedRoutes>
            <Orders />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/tables"
        element={
          <ProtectedRoutes>
            <Tables />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/menu"
        element={
          <ProtectedRoutes>
            <Menu />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoutes roles={["Admin"]}>
            <Dashboard />
          </ProtectedRoutes>
        }
      />
      <Route path="*" element={<div className="p-8 text-slate-500">Not Found</div>} />
    </Routes>
  );

  // Auth screen renders full-bleed without the app chrome.
  if (!showChrome) return routes;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 min-h-0">{routes}</main>
      </div>
    </div>
  );
}

function ProtectedRoutes({ children, roles }) {
  const { isAuth, role } = useSelector((state) => state.user);
  if (!isAuth) {
    return <Navigate to="/auth" />;
  }

  // Role-restricted route: send unauthorized users back home.
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
}

// Decides which "app" to render based on the URL, so the staff session loader
// (useLoadData) never runs on the customer storefront and vice versa.
function Root() {
  const location = useLocation();
  const isCustomer = location.pathname.startsWith("/customer");
  return isCustomer ? (
    <Routes>
      <Route path="/customer/*" element={<CustomerApp />} />
    </Routes>
  ) : (
    <Layout />
  );
}

function App() {
  return (
    <Router>
      <Root />
    </Router>
  );
}

export default App;
