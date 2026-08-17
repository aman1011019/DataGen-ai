import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          backgroundColor: "#081021",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "40px",
            maxWidth: "500px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
          }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#f87171" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "20px" }}>
              The application encountered an unexpected runtime error.
            </p>
            <div style={{
              background: "#030712",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "monospace",
              color: "#ef4444",
              overflowX: "auto",
              textAlign: "left",
              marginBottom: "24px"
            }}>
              {this.state.error?.toString() || "Unknown error"}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: "#6366f1",
                color: "#ffffff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

