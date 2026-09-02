import { Component } from "react";
import PropTypes from "prop-types";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("UI error boundary caught an exception", { error, componentStack: info.componentStack });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className="min-h-screen bg-slate-100 p-8"><div className="pos-card mx-auto max-w-xl p-8 text-center"><h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1><p className="mt-2 text-slate-500">The page could not be rendered. Reload the application to try again.</p><button className="pos-btn-primary mt-5" onClick={() => window.location.reload()}>Reload application</button>{import.meta.env.DEV && <pre className="mt-5 overflow-auto text-left text-xs text-rose-700">{this.state.error?.message}</pre>}</div></main>;
  }
}

ErrorBoundary.propTypes = { children: PropTypes.node.isRequired };
export default ErrorBoundary;
