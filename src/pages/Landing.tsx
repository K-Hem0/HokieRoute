import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Users, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "AI Safety Scores",
    description: "Real-time safety analysis powered by local crime data and community insights.",
  },
  {
    icon: Users,
    title: "Community Reports",
    description: "Crowdsourced updates on hazards, lighting issues, and route conditions.",
  },
  {
    icon: Bell,
    title: "Real-time Alerts",
    description: "Instant notifications about incidents and changing conditions on your route.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background dark overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-4">
            Walk safer.{" "}
            <span className="text-primary">Ride smarter.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
            AI-powered route planning with real-time safety insights for walkers and cyclists.
          </p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Button
              size="lg"
              onClick={() => navigate("/map")}
              className="group px-8 py-6 text-lg font-semibold rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105"
            >
              Start Safe Route
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Mocked Map Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 w-full max-w-md mx-auto"
        >
          <div className="relative aspect-[4/3] rounded-2xl border border-border bg-card/50 overflow-hidden shadow-2xl">
            {/* Mock map grid */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Grid lines */}
                {[...Array(10)].map((_, i) => (
                  <g key={i}>
                    <line
                      x1={i * 10}
                      y1="0"
                      x2={i * 10}
                      y2="100"
                      stroke="currentColor"
                      strokeWidth="0.3"
                      className="text-muted-foreground"
                    />
                    <line
                      x1="0"
                      y1={i * 10}
                      x2="100"
                      y2={i * 10}
                      stroke="currentColor"
                      strokeWidth="0.3"
                      className="text-muted-foreground"
                    />
                  </g>
                ))}
                {/* Mock route */}
                <path
                  d="M 20 80 Q 30 60 45 55 T 70 40 T 80 25"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                {/* Start point */}
                <circle cx="20" cy="80" r="3" fill="hsl(var(--safe))" />
                {/* End point */}
                <circle cx="80" cy="25" r="3" fill="hsl(var(--primary))" />
              </svg>
            </div>
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold text-foreground">SafeRoute</span>
          <span className="text-xs text-muted-foreground">Made with care</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
