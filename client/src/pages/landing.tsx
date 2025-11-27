import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Shield, 
  Brain, 
  Link2, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2,
  Building2,
  AlertTriangle,
  Layers
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl tracking-tight">SupplyShield</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="/api/login">
              <Button data-testid="button-login">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-primary/20" />
        <div className="max-w-screen-2xl mx-auto px-6 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Brain className="h-4 w-4" />
              AI-Powered Risk Intelligence
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Supply Chain Risk Assessment
              <span className="text-primary block mt-2">Beyond Generic Scores</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              Context-aware vendor risk intelligence that analyzes the specific products and services you use from each supplier. Stop relying on general security scores that don't reflect your actual risk exposure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/api/login">
                <Button size="lg" className="text-base gap-2 w-full sm:w-auto" data-testid="button-get-started">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
              <Button variant="outline" size="lg" className="text-base gap-2 w-full sm:w-auto" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/50">
        <div className="max-w-screen-2xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold font-mono text-primary">54%</p>
              <p className="text-sm text-muted-foreground mt-1">Face supply chain challenges</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold font-mono text-primary">97%</p>
              <p className="text-sm text-muted-foreground mt-1">Experienced vendor incidents</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold font-mono text-primary">4.8M</p>
              <p className="text-sm text-muted-foreground mt-1">Cybersecurity skills gap</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold font-mono text-primary">27%</p>
              <p className="text-sm text-muted-foreground mt-1">Increase in threats YoY</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              What Makes Us Different
            </h2>
            <p className="text-lg text-muted-foreground">
              We go beyond surface-level vendor scores to provide context-aware risk intelligence that matters to your organization.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Product-Specific Analysis</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Assess risk based on the specific products and services you actually use from each vendor, not just their overall security posture.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Intelligence</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Leverage advanced AI to analyze vendor risk, identify patterns, and generate actionable recommendations automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Dynamic Risk Tiering</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Automatically tier vendors based on actual data access levels and business impact, not just contract value.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-Time Threat Intel</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Stay informed with CVE database integration and security feeds that alert you to new vulnerabilities affecting your vendors.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Easy Integration</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Designed to complement your existing TPRM tools, adding the intelligence layer they're missing.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Enterprise Ready</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Built for security teams at large organizations who need to manage complex vendor ecosystems efficiently.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Stop Managing Risk Blind
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Current TPRM tools classify 30-50% of suppliers as "critical" - making the label meaningless. Our platform provides the context you need to make informed decisions.
              </p>
              
              <div className="space-y-4">
                {[
                  "Map specific products/services from each vendor",
                  "Understand actual data access and cascading impact",
                  "Get predictive risk modeling for dependencies",
                  "Receive AI-generated recommendations",
                  "Track vulnerabilities affecting your specific stack",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="font-bold text-red-500 text-sm">AC</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Acme Cloud</p>
                      <p className="text-xs text-muted-foreground">Cloud Infrastructure</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-red-500">87</p>
                    <p className="text-xs text-muted-foreground">Critical</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <span className="font-bold text-orange-500 text-sm">DS</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">DataSync Pro</p>
                      <p className="text-xs text-muted-foreground">Data Integration</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-orange-500">72</p>
                    <p className="text-xs text-muted-foreground">High</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="font-bold text-green-500 text-sm">SS</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">SecureSign</p>
                      <p className="text-xs text-muted-foreground">Document Signing</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-green-500">24</p>
                    <p className="text-xs text-muted-foreground">Low</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to Transform Your Vendor Risk Management?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join security teams who are moving beyond generic scores to context-aware risk intelligence.
            </p>
            <a href="/api/login">
              <Button size="lg" className="text-base gap-2" data-testid="button-cta-start">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">SupplyShield</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-Powered Supply Chain Risk Intelligence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
