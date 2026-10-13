import "server-only";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";

import type { User } from "@/lib/schema/types";

const backendUrl = "https://api.karthickprassana.in";

const serverApi = axios.create({
  baseURL: backendUrl,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export class InvalidSessionError extends Error { }

export class BackendUnavailableError extends Error { }

export async function requireAuthenticatedUser(): Promise<User> {
  const accessToken = (await cookies()).get("access_token")?.value;

  if (!accessToken) {
    throw new InvalidSessionError("No access token was provided.");
  }

  try {
    const response = await serverApi.get<User>("/auth/me", {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        throw new InvalidSessionError("The access token is not valid.");
      }

      throw new BackendUnavailableError(
        status
          ? `Authentication service returned HTTP ${status}.`
          : "The authentication service is unavailable.",
        { cause: error },
      );
    }

    throw error;
  }
}