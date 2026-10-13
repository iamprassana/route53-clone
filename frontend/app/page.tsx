import { redirect } from "next/navigation";
import {
  InvalidSessionError,
  requireAuthenticatedUser,
} from "@/lib/auth/server";

export default async function Home() {
  try {
    await requireAuthenticatedUser();
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      redirect("/login");
    }

    throw error;
  }
}