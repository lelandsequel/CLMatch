import DashboardClient from "./DashboardClient";
import { AppShell } from "../../components/app-shell";
import { Section } from "../../components/section";
import { AuthProvider } from "../../components/auth/AuthProvider";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <AppShell heroMode>
      <Section className="py-16 md:py-20">
        <AuthProvider>
          <DashboardClient />
        </AuthProvider>
      </Section>
    </AppShell>
  );
}
