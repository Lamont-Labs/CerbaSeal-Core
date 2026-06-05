import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Nav } from "@/components/nav";
import Home from "@/pages/home";
import Assess from "@/pages/assess";
import PilotGenerator from "@/pages/pilot-generator";
import Troubleshooter from "@/pages/troubleshooter";
import Training from "@/pages/training";
import Partner from "@/pages/partner";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Nav />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/assess" component={Assess} />
        <Route path="/pilot" component={PilotGenerator} />
        <Route path="/troubleshoot" component={Troubleshooter} />
        <Route path="/training" component={Training} />
        <Route path="/partner" component={Partner} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
