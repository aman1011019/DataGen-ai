import { Link } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export const CheckoutCancelledPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-8 sm:p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto shadow-lg shadow-amber-500/10">
          <XCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Payment Cancelled
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your payment checkout was cancelled. Your current subscription plan remains unchanged.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/pricing"
            className="w-full sm:w-1/2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Return to Pricing</span>
          </Link>

          <Link
            to="/dashboard"
            className="w-full sm:w-1/2 py-3.5 rounded-xl bg-secondary border border-border text-foreground font-semibold text-xs flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancelledPage;
