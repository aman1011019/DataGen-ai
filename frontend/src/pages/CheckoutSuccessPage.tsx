import { Link } from "react-router-dom";
import { CheckCircle, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useSubscription } from "../hooks/useSubscription";

export const CheckoutSuccessPage = () => {
  const { plan, planConfig, subscription } = useSubscription();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-8 sm:p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-success/10 border border-success/30 flex items-center justify-center text-success mx-auto shadow-lg shadow-success/10">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Payment Verified
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your <span className="font-bold text-foreground">{planConfig.name} Plan</span> is now active. All plan features and row limits have been unlocked!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/40 border border-border text-xs text-left space-y-2.5">
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground">Activated Plan</span>
            <span className="font-bold text-primary">{planConfig.name} Plan</span>
          </div>

          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground">Row Limit Capacity</span>
            <span className="font-bold text-success font-mono">Unlimited Rows</span>
          </div>

          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground">Dataset Limit</span>
            <span className="font-bold text-success font-mono">Unlimited Datasets</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Next Billing Date</span>
            <span className="font-bold text-foreground">
              {subscription.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                : "30 days from now"}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            to="/dashboard"
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            <span>Continue to DataGen Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
