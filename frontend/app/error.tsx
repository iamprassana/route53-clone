"use client";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="auth-page">
      <section className="auth-card" role="alert">
        <h1>Unable to reach the authentication service</h1>
        <p className="auth-subtitle">
          Please check that the backend is running and try again.
        </p>
        <button className="button button-primary" onClick={() => reset()}>
          Try again
        </button>
      </section>
    </main>
  );
}
