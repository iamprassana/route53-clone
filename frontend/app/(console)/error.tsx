"use client";

export default function ConsoleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="console-panel" role="alert">
      <h1>Unable to verify your session</h1>
      <p>
        The authentication service is unavailable. Please try again shortly.
      </p>
      <button className="button button-primary" onClick={() => reset()}>
        Try again
      </button>
    </section>
  );
}
