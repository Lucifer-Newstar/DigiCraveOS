import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { SnackbarProvider } from "notistack";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { reportQueryError } from "./observability/queryTelemetry.js";
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (error, query) => reportQueryError({ error, query }) }),
  defaultOptions: {
    queries: {
      staleTime : 30000,
    }
  }
})

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
    <Provider store={store}>
      <SnackbarProvider autoHideDuration={3000}>
        <QueryClientProvider client={queryClient} >
          <App />
        </QueryClientProvider>
      </SnackbarProvider>
    </Provider>
    </ErrorBoundary>
  </StrictMode>
);
