import ConsoleLayout from "../../components/ConsoleLayout";
import { InvalidSessionError, requireAuthenticatedUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function ConsoleRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAuthenticatedUser();
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      redirect("/login");
    }

    throw error;
  }

  return <ConsoleLayout>{children}</ConsoleLayout>;
}
