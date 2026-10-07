"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getApiErrorMessage, getUserData, logoutUser } from "../../../lib/api/client";
import type { User } from "../../../lib/schema/types";

export default function ProfilesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;

    getUserData()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((reason) => {
        if (active) setError(getApiErrorMessage(reason, "Unable to load your profile."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function signOut() {
    setSigningOut(true);
    setError("");

    try {
      await logoutUser();
      router.replace("/login");
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Unable to sign out."));
      setSigningOut(false);
    }
  }

  return (
    <section className="console-panel profile-panel">
      <h1>Profile</h1>
      {loading && <p>Loading your profile...</p>}
      {!loading && error && <p className="profile-error">{error}</p>}
      {!loading && !error && user && (
        <>
          <dl className="profile-details">
            <div>
              <dt>Username</dt>
              <dd>{user.username}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>
          <button className="blue-button" onClick={signOut} disabled={signingOut}>
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </>
      )}
    </section>
  );
}
