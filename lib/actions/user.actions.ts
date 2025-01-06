"use server";

import { signIn, signOut } from "@/auth";
import { signInFormSchema } from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";

//Sign in user
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);
    return { success: true, message: "User signed in successfully" };
  } catch (e) {
    if (isRedirectError(e)) {
      throw Error;
    }

    return { success: false, message: "Email or password are incorrect" };
  }
}

//Sign out user
export async function signOutUser() {
  await signOut();
}
