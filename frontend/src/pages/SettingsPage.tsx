import { useState } from "react";
import { getAISettings, saveAISettings } from "../services/aiProviderService";
import { getStoredAuthState, saveAuthState } from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import { AISettings, AIProvider } from "../types/dataset";
import { UserProfile } from "../types/auth";
import {
  Settings,
  Key,
  User,
  Shield,
  Sun,
  Moon,
  Check,
  Cpu,
  Save,
  Database
} from "lucide-react";


const DEFAULT_PROFILE: UserProfile = {
  id: "",
  name: "",
  email: "",
  organization: "",
  role: "",
  plan: "Normal",
  datasetsCreated: 0,
  recordsGenerated: 0,
};

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<"ai" | "profile" | "appearance">("ai");
  const { theme, toggleTheme } = useTheme();
  const [aiSettings, setAiSettings] = useState<AISettings>(getAISettings());
  const [userProfile, setUserProfile] = useState<UserProfile>(
    getStoredAuthState().user || DEFAULT_PROFILE
  );

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    saveAISettings(aiSettings);
    toast.success(`${aiSettings.provider} settings saved successfully!`);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const current = getStoredAuthState();
    saveAuthState({
      ...current,
      user: userProfile,
    });
    toast.success("User profile updated successfully!");
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Workspace Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure AI provider engines, user profile, and theme preferences.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "ai"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Cpu className="w-4 h-4" /> AI Provider & Keys
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "profile"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-4 h-4" /> Profile & Account
        </button>

        <button
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "appearance"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sun className="w-4 h-4" /> Appearance
        </button>
      </div>

      {/* AI PROVIDER TAB */}
      {activeTab === "ai" && (
        <form onSubmit={handleSaveAI} className="space-y-6 text-xs animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Select AI Schema Engine</h3>
              <p className="text-muted-foreground mt-0.5">
                Choose which underlying LLM provider synthesizes dataset schemas and field recommendations.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {(["Google Gemini", "OpenAI", "Anthropic"] as AIProvider[]).map((prov) => (
                <div
                  key={prov}
                  onClick={() => setAiSettings({ ...aiSettings, provider: prov })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    aiSettings.provider === prov
                      ? "bg-primary/10 border-primary text-foreground font-bold shadow-xs"
                      : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-xs">{prov}</span>
                  {aiSettings.provider === prov && <Check className="w-4 h-4 text-primary" />}
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC SINGLE PROVIDER KEY INPUT (ONLY 1 SHOWN AT A TIME) */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">{aiSettings.provider} Configuration</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                Active Provider
              </span>
            </div>

            {/* ONLY Gemini key input when Google Gemini selected */}
            {aiSettings.provider === "Google Gemini" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">Google Gemini API Key</label>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${aiSettings.geminiApiKey ? "bg-success/10 text-success border-success/20" : "bg-primary/10 text-primary border-primary/20"}`}>
                    {aiSettings.geminiApiKey ? "Custom Key Active" : "System Default Key Active (Hidden)"}
                  </span>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={aiSettings.geminiApiKey || ""}
                    onChange={(e) => setAiSettings({ ...aiSettings, geminiApiKey: e.target.value })}
                    placeholder="Enter your custom Gemini API key (optional)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/60 border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Leave empty to use the system default API key (limit 3 free datasets). Adding your own API key unlocks unlimited dataset generations with no cooldown.
                </p>
              </div>
            )}

            {/* ONLY OpenAI key input when OpenAI selected */}
            {aiSettings.provider === "OpenAI" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">OpenAI API Key</label>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                    {aiSettings.openaiApiKey ? "Key Configured" : "Not Configured"}
                  </span>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={aiSettings.openaiApiKey}
                    onChange={(e) => setAiSettings({ ...aiSettings, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/60 border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            )}

            {/* ONLY Anthropic key input when Anthropic selected */}
            {aiSettings.provider === "Anthropic" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">Anthropic API Key</label>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                    {aiSettings.anthropicApiKey ? "Key Configured" : "Not Configured"}
                  </span>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={aiSettings.anthropicApiKey}
                    onChange={(e) => setAiSettings({ ...aiSettings, anthropicApiKey: e.target.value })}
                    placeholder="sk-ant-..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/60 border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Save className="w-4 h-4" /> Save {aiSettings.provider} Settings
            </button>
          </div>
        </form>
      )}

      {/* PROFILE TAB (PROTECTED AGAINST BLANK SCREEN CRASHES) */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6 text-xs animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <img
                src={userProfile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={userProfile.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
              />
              <div>
                <h3 className="text-sm font-bold text-foreground">{userProfile.name || "Google user"}</h3>
                <p className="text-xs text-muted-foreground">{userProfile.email || "Not set"}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Shield className="w-3 h-3" /> {userProfile.plan || "Pro Plan"}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-foreground mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={userProfile.name || "Google user"}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Work Email</label>
                <input
                  type="email"
                  value={userProfile.email || ""}
                  onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Organization</label>
                <input
                  type="text"
                  value={userProfile.organization || "Enterprise AI Labs"}
                  onChange={(e) => setUserProfile({ ...userProfile, organization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Role</label>
                <input
                  type="text"
                  value={userProfile.role || "Lead Data Engineer"}
                  onChange={(e) => setUserProfile({ ...userProfile, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </div>
        </form>
      )}

      {/* APPEARANCE TAB */}
      {activeTab === "appearance" && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 text-xs animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-foreground">Theme & Visual Language</h3>
          <p className="text-muted-foreground">Customize UI color mode for desktop workspace.</p>

          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <span className="font-bold text-foreground block">{theme === "dark" ? "Dark Theme" : "Light Theme"}</span>
                <span className="text-[11px] text-muted-foreground">
                  {theme === "dark" ? "High contrast deep navy surface palette" : "Crisp light surface with dark text"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all"
            >
              Switch to {theme === "dark" ? "Light" : "Dark"} Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
