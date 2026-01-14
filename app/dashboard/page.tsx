import DashboardClient from "./DashboardClient";
import { AppShell } from "../../components/app-shell";
import { Section } from "../../components/section";
import { AuthProvider } from "../../components/auth/AuthProvider";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <AppShell>
      <Section className="relative py-16 md:py-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-radial from-gold/6 via-gold/2 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-gradient-radial from-amber/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <AuthProvider>
          <DashboardClient />
        </AuthProvider>
      </Section>
    </AppShell>
  );
}
