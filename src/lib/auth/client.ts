import { createAuthClient } from "better-auth/react";

/** Better Auth client for SOKO's own account system. */
export const authClient = createAuthClient({});

export const authEnabled = true;

export async function signIn(
  email: string,
  password: string,
  callbackURL = "/",
): Promise<void> {
  const { error } = await authClient.signIn.email({
    email,
    password,
    callbackURL,
  });
  if (error) throw new Error(error.message ?? "Imeshindikana kuingia");
  if (typeof window !== "undefined") window.location.href = callbackURL;
}

export async function signUp(
  name: string,
  email: string,
  password: string,
  callbackURL = "/",
): Promise<void> {
  const { error } = await authClient.signUp.email({
    name,
    email,
    password,
    callbackURL,
  });
  if (error) throw new Error(error.message ?? "Imeshindikana kufungua akaunti");
  if (typeof window !== "undefined") window.location.href = callbackURL;
}

export async function signOut(redirectTo = "/"): Promise<void> {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message ?? "Imeshindikana kutoka");
  if (typeof window !== "undefined") window.location.href = redirectTo;
}
