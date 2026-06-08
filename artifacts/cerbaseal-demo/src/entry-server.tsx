import { renderToString } from "react-dom/server";
import { HelmetProvider, HelmetServerState } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router as WouterRouter, Switch, Route } from "wouter";
import { Nav } from "@/components/nav";
import Home from "@/pages/home";
import Assess from "@/pages/assess";
import PilotGenerator from "@/pages/pilot-generator";
import Troubleshooter from "@/pages/troubleshooter";
import Training from "@/pages/training";
import Partner from "@/pages/partner";
import Wizard from "@/pages/wizard";
import NotFound from "@/pages/not-found";

export function render(url: string, base: string) {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const queryClient = new QueryClient();

  const staticBase = base.replace(/\/$/, "");

  const routePath = url.startsWith(staticBase)
    ? url.slice(staticBase.length) || "/"
    : url;

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={staticBase} ssrPath={routePath}>
            <div className="min-h-screen bg-slate-950 text-slate-100">
              <Nav />
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/assess" component={Assess} />
                <Route path="/pilot" component={PilotGenerator} />
                <Route path="/troubleshoot" component={Troubleshooter} />
                <Route path="/training" component={Training} />
                <Route path="/partner" component={Partner} />
                <Route path="/wizard" component={Wizard} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </WouterRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;
  return { html, helmet };
}
