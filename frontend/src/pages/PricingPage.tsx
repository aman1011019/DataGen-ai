import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { PLANS, COMPARISON_CATEGORIES, PlanId } from "../config/pricing";
import { useSubscription } from "../hooks/useSubscription";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Building2,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowRight
} from "lucide-react";
import Logo from "@/components/Logo";

export const PricingPage = () => {
  const navigate = useNavigate();
  const { plan: currentPlanId, upgradePlan, isPro, isBusiness } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("month");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes. You can cancel your subscription at any time under Settings -> Billing. You will retain full access until the end of your current billing period.",
    },
    {
      q: "What happens when I reach the Normal plan limits?",
      a: "The Normal plan includes 1 dataset with a maximum of 500 rows. When you attempt to create a 2nd dataset or request 501+ rows, you will be prompted to upgrade to Pro for unlimited datasets and rows.",
    },
    {
      q: "Are Pro and Business really unlimited?",
      a: "Yes! Pro and Business plans offer unlimited dataset creations and unlimited rows per dataset subject only to infrastructure safety limits (up to 100,000 rows per job).",
    },
    {
      q: "What export formats are supported?",
      a: "Normal plan supports CSV and JSON exports. Pro and Business plans support CSV, JSON, and Microsoft Excel (.xlsx) exports.",
    },
    {
      q: "How does payment processing work?",
      a: "All payments are processed securely via Razorpay with server-side HMAC signature verification. We never store raw credit card details.",
    },
    {
      q: "Is there a discount for annual billing?",
      a: "Yes! Selecting Annual billing gives you 2 months free (over 20% savings) on Pro and Business plans.",
    },
  ];

  const handleSelectPlan = async (targetPlan: PlanId) => {
    if (targetPlan === currentPlanId) {
      navigate("/dashboard");
      return;
    }
    await upgradePlan(targetPlan, billingPeriod);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-20 pb-12 text-center max-w-4xl mx-auto px-4 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Flexible Plans for Developers & Enterprise Teams</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Choose the plan that fits your data workflow.
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Start small. Scale when your datasets grow.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span className={`text-xs font-semibold ${billingPeriod === "month" ? "text-foreground font-bold" : "text-muted-foreground"}`}>
            Monthly Billing
          </span>

          <button
            onClick={() => setBillingPeriod(billingPeriod === "month" ? "year" : "month")}
            className="w-12 h-6.5 rounded-full bg-secondary border border-border p-1 relative transition-colors focus:outline-none"
          >
            <div
              className={`w-4.5 h-4.5 rounded-full bg-primary transition-transform shadow-md ${
                billingPeriod === "year" ? "translate-x-5.5" : "translate-x-0"
              }`}
            />
          </button>

          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${billingPeriod === "year" ? "text-foreground font-bold" : "text-muted-foreground"}`}>
              Yearly Billing
            </span>
            <span className="text-[10px] bg-success/10 text-success border border-success/20 font-bold px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </div>
        </div>
      </section>

      {/* PRICING CARDS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {Object.values(PLANS).map((p) => {
            const isCurrent = currentPlanId === p.id;
            const price = billingPeriod === "year" ? p.priceYearly : p.priceMonthly;

            return (
              <div
                key={p.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  p.popular
                    ? "bg-card border-2 border-primary shadow-2xl shadow-primary/10 ring-1 ring-primary/30"
                    : p.enterprise
                    ? "bg-card border border-purple-500/40 shadow-xl"
                    : "bg-card border border-border hover:border-primary/40"
                }`}
              >
                {/* Popular / Enterprise Badge */}
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider shadow-md">
                    {p.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground flex items-center justify-between">
                      {p.name}
                      {isCurrent && (
                        <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 font-bold px-2.5 py-0.5 rounded-full">
                          Current Plan
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 min-h-[36px]">{p.tagline}</p>
                  </div>

                  {/* Price Display */}
                  <div className="border-y border-border/60 py-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-foreground tracking-tight">
                      {p.currency}{price.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      /{billingPeriod === "year" ? "year" : "month"}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 text-xs">
                    <span className="font-bold text-foreground uppercase text-[10px] tracking-wider block text-muted-foreground">
                      Included Features
                    </span>
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-foreground">
                        <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}

                    {p.unavailableFeatures && p.unavailableFeatures.length > 0 && (
                      <div className="pt-2 space-y-2 text-muted-foreground/60 opacity-60">
                        {p.unavailableFeatures.map((ufeat, uidx) => (
                          <div key={uidx} className="flex items-start gap-2">
                            <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="line-through">{ufeat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Call to Action Button */}
                <div className="pt-8">
                  <button
                    onClick={() => handleSelectPlan(p.id as PlanId)}
                    disabled={isCurrent}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                      isCurrent
                        ? "bg-secondary text-muted-foreground border border-border cursor-default"
                        : p.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 hover:scale-[1.02]"
                        : "bg-secondary border border-border text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <span>{isCurrent ? "Active Plan" : p.ctaText}</span>
                    {!isCurrent && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DETAILED PLAN COMPARISON MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Detailed Plan Feature Comparison
          </h2>
          <p className="text-xs text-muted-foreground">Comprehensive capabilities across all DataGen subscription tiers.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50 font-bold text-foreground">
                <th className="py-4 px-6 text-sm">Feature Name</th>
                <th className="py-4 px-6 text-center w-36">Normal (₹0)</th>
                <th className="py-4 px-6 text-center w-36 bg-primary/5 text-primary">Pro (₹499)</th>
                <th className="py-4 px-6 text-center w-36">Business (₹1,499)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {COMPARISON_CATEGORIES.map((cat, catIdx) => (
                <>
                  <tr key={cat.category} className="bg-secondary/30">
                    <td colSpan={4} className="py-3 px-6 font-extrabold text-primary uppercase tracking-wider text-[11px]">
                      {cat.category}
                    </td>
                  </tr>
                  {cat.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-foreground">{item.name}</td>
                      <td className="py-3.5 px-6 text-center">
                        {typeof item.normal === "boolean" ? (
                          item.normal ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        ) : (
                          <span className="font-semibold text-muted-foreground">{item.normal}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center bg-primary/5">
                        {typeof item.pro === "boolean" ? (
                          item.pro ? <Check className="w-4 h-4 text-primary font-bold mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        ) : (
                          <span className="font-bold text-primary font-mono">{item.pro}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        {typeof item.business === "boolean" ? (
                          item.business ? <Check className="w-4 h-4 text-purple-400 font-bold mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        ) : (
                          <span className="font-bold text-foreground font-mono">{item.business}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-16 bg-card/40 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Built for serious data workflows.</h2>
            <p className="text-xs text-muted-foreground">Commercial security and verified server-side dataset synthesis.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-xs text-left">
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-foreground">Server-Side Limits</h3>
              <p className="text-muted-foreground text-[11px]">Subscription access rules enforced server-side before execution.</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <Lock className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-foreground">Razorpay Payment HMAC</h3>
              <p className="text-muted-foreground text-[11px]">Server verification using Razorpay signature validation.</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-foreground">Protected API Keys</h3>
              <p className="text-muted-foreground text-[11px]">LLM credentials protected on server infrastructure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 py-20 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Frequently Asked Questions</h2>
          <p className="text-xs text-muted-foreground">Everything you need to know about DataGen billing and plans.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="rounded-2xl border border-border bg-card overflow-hidden transition-all">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-xs text-foreground flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-muted-foreground border-t border-border/50 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
