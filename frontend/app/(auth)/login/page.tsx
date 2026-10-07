"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { getApiErrorMessage, loginUser } from "../../../lib/api/client";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field: "email" | "password", value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await loginUser(form.email, form.password);
      router.replace("/dashboard");
    } catch (cause) {
      setError(
        getApiErrorMessage(
          cause,
          "Unable to sign in. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Image
          className="aws-logo"
          src="/aws.svg"
          alt="AWS"
          width={92}
          height={92}
          priority
        />

        <h1>Log in to AWS</h1>

        <p className="auth-subtitle">
          Sign in to manage your hosted zones.
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) =>
                handleChange("email", event.target.value)
              }
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) =>
                handleChange("password", event.target.value)
              }
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            className="button button-primary auth-submit"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          New to the console?{" "}
          <Link href="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}