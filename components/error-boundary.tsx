import { AlertTriangle, RefreshCw } from "lucide-react";
import type React from "react";
import {
  type FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";

// Fallback component shown when an error occurs
const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => (
  <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/30 dark:bg-red-500/10">
    <AlertTriangle className="mb-4 text-red-500" size={48} />
    <h2 className="mb-2 font-bold text-gray-900 text-xl dark:text-gray-100">
      Something went wrong
    </h2>
    <p className="mb-4 max-w-md text-gray-600 text-sm dark:text-gray-400">
      {error.message || "An unexpected error occurred. Please try again."}
    </p>
    <button
      className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-red-700"
      onClick={resetErrorBoundary}
      type="button"
    >
      <RefreshCw size={16} />
      Try Again
    </button>
  </div>
);

// Full page error fallback for app-level errors
const FullPageErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 text-center dark:bg-gray-900">
      <AlertTriangle className="mb-6 text-red-500" size={64} />
      <h1 className="mb-3 font-bold text-3xl text-gray-900 dark:text-gray-100">
        Oops! Something went wrong
      </h1>
      <p className="mb-6 max-w-lg text-gray-600 dark:text-gray-400">
        We're sorry, but something unexpected happened. Please try refreshing
        the page or click the button below.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="mb-6 max-w-lg overflow-auto rounded-lg bg-gray-100 p-4 text-left text-red-600 text-sm dark:bg-gray-800 dark:text-red-400">
          {error.message}
        </pre>
      )}
      <div className="flex gap-3">
        <button
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-700"
          onClick={resetErrorBoundary}
          type="button"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
        <button
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          onClick={goHome}
          type="button"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

// Log errors (in production, send to error tracking service like Sentry)
const logError = (error: Error, info: React.ErrorInfo) => {
  console.error("Error caught by boundary:", error);
  console.error("Component stack:", info.componentStack);
};

// Wrapper component for app-level error boundary
export const AppErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ReactErrorBoundary
    FallbackComponent={FullPageErrorFallback}
    onError={logError}
  >
    {children}
  </ReactErrorBoundary>
);

// Wrapper component for section/component-level error boundary
export const SectionErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <ReactErrorBoundary
    FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
    onError={logError}
  >
    {children}
  </ReactErrorBoundary>
);

export { ErrorFallback, FullPageErrorFallback };
