import { createContext, useContext, ReactNode } from "react";
import { PLANS, PlanConfig, PlanLimits } from "../config/pricing";

export type PlanId = "pro";

export interface UserUsageState {
  datasetsCreated: number;
  maxDatasets: number;
  rowsGenerated: number;
  maxRowsPerDataset: number;
}

interface SubscriptionContextType {
  plan: PlanId;
  planConfig: PlanConfig;
  status: string;
  limits: PlanLimits;
  usage: UserUsageState;
  isNormal: boolean;
  isPro: boolean;
  isBusiness: boolean;
  canCreateDataset: () => { allowed: boolean; message?: string };
  canGenerateRows: (requestedRows: number) => { allowed: boolean; message?: string };
  hasFeature: (featureKey: keyof PlanLimits) => boolean;
  upgradePlan: (targetPlan: any) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refreshSubscription: () => void;
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: (open: boolean) => void;
  upgradeModalReason: string;
  setUpgradeModalReason: (reason: string) => void;
}

const UNLIMITED_LIMITS: PlanLimits = {
  datasets: Infinity,
  rowsPerDataset: Infinity,
  fieldsPerDataset: Infinity,
  teamMembers: Infinity,
  apiAccess: true,
  excelExport: true,
  qualityAnalysis: true,
  priorityGeneration: true,
};

const UNLIMITED_CONFIG: PlanConfig = {
  id: "pro",
  name: "Unlimited Pro",
  tagline: "Full unlimited access to all dataset generation features.",
  priceMonthly: 0,
  priceYearly: 0,
  currency: "₹",
  interval: "month",
  limits: UNLIMITED_LIMITS,
  features: ["Unlimited Datasets", "Unlimited Rows", "CSV, JSON & Excel Exports"],
  ctaText: "Full Access Active",
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SubscriptionContext.Provider
      value={{
        plan: "pro",
        planConfig: UNLIMITED_CONFIG,
        status: "active",
        limits: UNLIMITED_LIMITS,
        usage: {
          datasetsCreated: 0,
          maxDatasets: Infinity,
          rowsGenerated: 0,
          maxRowsPerDataset: Infinity,
        },
        isNormal: false,
        isPro: true,
        isBusiness: true,
        canCreateDataset: () => ({ allowed: true }),
        canGenerateRows: () => ({ allowed: true }),
        hasFeature: () => true,
        upgradePlan: async () => {},
        cancelSubscription: async () => {},
        refreshSubscription: () => {},
        isUpgradeModalOpen: false,
        setIsUpgradeModalOpen: () => {},
        upgradeModalReason: "",
        setUpgradeModalReason: () => {},
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    return {
      plan: "pro",
      planConfig: UNLIMITED_CONFIG,
      status: "active",
      limits: UNLIMITED_LIMITS,
      usage: {
        datasetsCreated: 0,
        maxDatasets: Infinity,
        rowsGenerated: 0,
        maxRowsPerDataset: Infinity,
      },
      isNormal: false,
      isPro: true,
      isBusiness: true,
      canCreateDataset: () => ({ allowed: true }),
      canGenerateRows: () => ({ allowed: true }),
      hasFeature: () => true,
      upgradePlan: async () => {},
      cancelSubscription: async () => {},
      refreshSubscription: () => {},
      isUpgradeModalOpen: false,
      setIsUpgradeModalOpen: () => {},
      upgradeModalReason: "",
      setUpgradeModalReason: () => {},
    };
  }
  return context;
};
