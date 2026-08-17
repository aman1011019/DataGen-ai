import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Cpu
} from "lucide-react";
import { CATEGORIES_DATA } from "@/data/categories";

export const LandingPage = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES_DATA[0]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-border/40 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation AI Synthetic Data Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1]">
            Generate Synthetic Data. <br />
            <span className="gradient-text">Built for Your Schema.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Create realistic, customizable datasets in seconds with AI-powered schema generation and intelligent field synthesis. Built for privacy, testing, and AI/ML model development.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/dashboard/generate"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create Dataset Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-secondary border border-border text-foreground font-semibold text-base hover:bg-secondary/80 transition-all"
            >
              <span>Explore Interactive Demo</span>
            </Link>
          </div>

          {/* Product Workspace Preview Mockup */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-border bg-card/80 p-3 shadow-2xl backdrop-blur-xl text-left">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border mb-3">
                <div className="flex items-center gap-2">
                  <Logo className="w-5 h-5" />
                  <span className="text-xs font-mono text-muted-foreground ml-1">DataGen Studio v2.4 • Healthcare Patient Schema</span>
                </div>
                <span className="text-xs font-semibold bg-success/10 text-success px-2.5 py-0.5 rounded-full border border-success/20">
                  98.7% Quality Score
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-3 p-2">
                <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-1">
                  <span className="text-[11px] text-muted-foreground">Category</span>
                  <p className="text-xs font-bold text-foreground">Healthcare & Medicine</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-1">
                  <span className="text-[11px] text-muted-foreground">Generated Records</span>
                  <p className="text-xs font-bold text-foreground">10,000 Records</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-1">
                  <span className="text-[11px] text-muted-foreground">Field Schema</span>
                  <p className="text-xs font-bold text-foreground">18 Intelligent Fields</p>
                </div>
              </div>

              {/* Sample Table Rows */}
              <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-black/40">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-muted-foreground">
                      <th className="py-2.5 px-3">patient_id</th>
                      <th className="py-2.5 px-3">age</th>
                      <th className="py-2.5 px-3">gender</th>
                      <th className="py-2.5 px-3">bmi</th>
                      <th className="py-2.5 px-3">glucose_level</th>
                      <th className="py-2.5 px-3">medical_condition</th>
                      <th className="py-2.5 px-3">readmission_30d</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-foreground">
                    <tr>
                      <td className="py-2 px-3">PT-001029</td>
                      <td className="py-2 px-3">48</td>
                      <td className="py-2 px-3">Female</td>
                      <td className="py-2 px-3">28.4</td>
                      <td className="py-2 px-3 text-primary font-bold">114.5</td>
                      <td className="py-2 px-3">Hypertension</td>
                      <td className="py-2 px-3 text-muted-foreground">false</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">PT-001030</td>
                      <td className="py-2 px-3">62</td>
                      <td className="py-2 px-3">Male</td>
                      <td className="py-2 px-3">34.1</td>
                      <td className="py-2 px-3 text-primary font-bold">188.0</td>
                      <td className="py-2 px-3">Diabetes Type 2</td>
                      <td className="py-2 px-3 text-success font-bold">true</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Synthetic Data Section */}
      <section className="py-20 border-b border-border/40 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Why Synthetic Data for Enterprise?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Eliminate privacy constraints, bypass data scarcity bottlenecks, and accelerate AI/ML model training safely.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Zero Privacy Risk</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate 100% anonymized datasets compliant with HIPAA, GDPR, and CCPA without exposing real customer PII.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Instant Scalability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Produce millions of balanced, edge-case synthetic records in seconds with custom statistical distributions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">AI / ML Model Training</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Train, benchmark, and evaluate machine learning models with high-fidelity realistic data distributions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              How DataGen Works
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Four simple steps from domain requirement to production dataset.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
              <span className="text-2xl font-black text-primary/40 font-mono">01</span>
              <h3 className="text-base font-bold text-foreground">Define Dataset</h3>
              <p className="text-xs text-muted-foreground">Select from 16+ enterprise categories and describe your custom needs.</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
              <span className="text-2xl font-black text-primary/40 font-mono">02</span>
              <h3 className="text-base font-bold text-foreground">Configure Schema</h3>
              <p className="text-xs text-muted-foreground">AI automatically suggests fields, data types, constraints, and distributions.</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
              <span className="text-2xl font-black text-primary/40 font-mono">03</span>
              <h3 className="text-base font-bold text-foreground">Generate Records</h3>
              <p className="text-xs text-muted-foreground">Synthesize from 100 to 100,000 records with advanced noise and outlier controls.</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
              <span className="text-2xl font-black text-primary/40 font-mono">04</span>
              <h3 className="text-base font-bold text-foreground">Analyze & Export</h3>
              <p className="text-xs text-muted-foreground">Review quality scorecards and export instantly in CSV, JSON, or Excel format.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Categories Section */}
      <section id="categories" className="py-20 border-b border-border/40 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Supported Dataset Categories
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Pre-engineered field recommendations across 16 major industry domains.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES_DATA.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  activeCategory.id === cat.id
                    ? "bg-primary/10 border-primary text-foreground shadow-md shadow-primary/10"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <span className="font-bold text-xs block text-foreground mb-1">{cat.name}</span>
                <span className="text-[11px] text-muted-foreground line-clamp-2">{cat.description}</span>
              </button>
            ))}
          </div>

          {/* Active Category Schema Display */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{activeCategory.name} Preset Schema</h3>
                <p className="text-xs text-muted-foreground">{activeCategory.recommendedFields.length} Recommended Fields</p>
              </div>
              <Link
                to="/dashboard/generate"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all"
              >
                <span>Use Category</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeCategory.recommendedFields.map((f) => (
                <div key={f.name} className="p-3 rounded-xl bg-secondary/40 border border-border/60 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-foreground">{f.name}</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px]">{f.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Build your first synthetic dataset.
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Start generating production-grade, AI-crafted datasets for your schema today.
        </p>
        <Link
          to="/dashboard/generate"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span>Launch Dataset Creator</span>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 DataGen AI Platform. Built for Enterprise Data & Machine Learning Teams.</p>
      </footer>
    </div>
  );
};

export default LandingPage;