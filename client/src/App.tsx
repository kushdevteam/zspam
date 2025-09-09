import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/layout/sidebar";
import SessionsPage from "@/pages/sessions";
import CreateCampaignPage from "@/pages/create-campaign";
import EmailSenderPage from "@/pages/email-sender";
import StatisticsPage from "@/pages/statistics";
import ConfigurationPage from "@/pages/configuration";
import CoinbaseLoginPage from "@/pages/coinbase-login";
import BarclaysLoginPage from "@/pages/barclays-login";
import HSBCLoginPage from "@/pages/hsbc-login";
import LloydsLoginPage from "@/pages/lloyds-login";
import NatWestLoginPage from "@/pages/natwest-login";
import SantanderLoginPage from "@/pages/santander-login";
import EnhancedStatisticsPage from "@/pages/enhanced-statistics";
import AlertSettingsPage from "@/pages/alert-settings";
import CampaignScheduler from "@/pages/campaign-scheduler";
import TestDashboard from "@/pages/test-dashboard";
import AdvancedReports from "@/pages/advanced-reports";
import UserManagement from "@/pages/user-management";
import ABTesting from "@/pages/ab-testing";
import Personalization from "@/pages/personalization";
import Webhooks from "@/pages/webhooks";
import ProductionSetup from "@/pages/production-setup";
import AITargeting from "@/pages/ai-targeting";
import ThreatIntelligence from "@/pages/threat-intelligence";
import BehavioralAnalysis from "@/pages/behavioral-analysis";
import AIContentGenerator from "@/pages/ai-content-generator";
import SMSCampaigns from "@/pages/sms-campaigns";
import MobileSimulations from "@/pages/mobile-simulations";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden bg-background">
        <Switch>
          <Route path="/" component={SessionsPage} />
          <Route path="/sessions" component={SessionsPage} />
          <Route path="/create-campaign" component={CreateCampaignPage} />
          <Route path="/email-sender" component={EmailSenderPage} />
          <Route path="/statistics" component={StatisticsPage} />
          <Route path="/configuration" component={ConfigurationPage} />
          <Route path="/coinbase" component={CoinbaseLoginPage} />
          <Route path="/login" component={CoinbaseLoginPage} />
          <Route path="/barclays" component={BarclaysLoginPage} />
          <Route path="/hsbc" component={HSBCLoginPage} />
          <Route path="/lloyds" component={LloydsLoginPage} />
          <Route path="/natwest" component={NatWestLoginPage} />
          <Route path="/santander" component={SantanderLoginPage} />
          <Route path="/enhanced-statistics" component={EnhancedStatisticsPage} />
          <Route path="/alert-settings" component={AlertSettingsPage} />
          <Route path="/campaign-scheduler" component={CampaignScheduler} />
          <Route path="/test-dashboard" component={TestDashboard} />
          <Route path="/advanced-reports" component={AdvancedReports} />
          <Route path="/user-management" component={UserManagement} />
          <Route path="/ab-testing" component={ABTesting} />
          <Route path="/personalization" component={Personalization} />
          <Route path="/webhooks" component={Webhooks} />
          <Route path="/production-setup" component={ProductionSetup} />
          <Route path="/ai-targeting" component={AITargeting} />
          <Route path="/threat-intelligence" component={ThreatIntelligence} />
          <Route path="/behavioral-analysis" component={BehavioralAnalysis} />
          <Route path="/ai-content-generator" component={AIContentGenerator} />
          <Route path="/sms-campaigns" component={SMSCampaigns} />
          <Route path="/mobile-simulations" component={MobileSimulations} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
