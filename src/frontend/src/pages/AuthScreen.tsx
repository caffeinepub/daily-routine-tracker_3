import { Button } from "@/components/ui/button";
import { Award, Loader2, Target, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  { icon: Target, label: "Track daily habits" },
  { icon: Zap, label: "Earn gold coins" },
  { icon: TrendingUp, label: "Build streaks" },
  { icon: Award, label: "Unlock achievements" },
];

export default function AuthScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-10%] w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-20 h-20 rounded-3xl gold-gradient flex items-center justify-center shadow-gold-md relative"
          >
            <span className="text-3xl">🏆</span>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center shadow-card">
              <Zap className="w-3 h-3 text-gold" />
            </div>
          </motion.div>

          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
              DailyQuest
            </h1>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Turn your habits into an adventure.
              <br />
              Earn coins. Level up. Win the day.
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
              className="flex items-center gap-2.5 bg-card border border-border rounded-xl p-3 shadow-card"
            >
              <div className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center shrink-0">
                <f.icon className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground leading-tight">
                {f.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Login button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="w-full"
        >
          <Button
            data-ocid="auth.submit_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 gold-gradient text-primary-foreground font-semibold text-base rounded-xl shadow-gold-sm hover:shadow-gold-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-0"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <span className="mr-2">🔐</span>
                Login with Internet Identity
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-3">
            Secure, decentralized authentication on the Internet Computer
          </p>
        </motion.div>

        {/* Stats preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-6 text-center"
        >
          {[
            { value: "∞", label: "Daily tasks" },
            { value: "🔥", label: "Streak tracking" },
            { value: "🏅", label: "Achievements" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="font-display font-bold text-lg text-foreground">
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-6 text-xs text-muted-foreground"
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-gold transition-colors"
        >
          Built with love using caffeine.ai
        </a>
      </motion.p>
    </div>
  );
}
