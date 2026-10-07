"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  getApiErrorMessage,
  signUpUser,
} from "../../../lib/api/client";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    field: "username" | "email" | "password",
    value: string
  ) {
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
      await signUpUser(form);
      router.replace("/login");
    } catch (cause) {
      setError(
        getApiErrorMessage(
          cause,
          "Unable to create your account. Please try again."
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

        <h1>Create an AWS account</h1>

        <p className="auth-subtitle">
          Create an account to manage your hosted zones.
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Username</span>
            <input
              type="text"
              required
              value={form.username}
              onChange={(event) =>
                handleChange("username", event.target.value)
              }
              autoComplete="username"
            />
          </label>

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
              minLength={8}
              value={form.password}
              onChange={(event) =>
                handleChange("password", event.target.value)
              }
              autoComplete="new-password"
            />
            <small>Password must be at least 8 characters.</small>
          </label>

          <button
            type="submit"
            className="button button-primary auth-submit"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}