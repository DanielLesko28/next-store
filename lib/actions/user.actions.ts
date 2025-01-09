"use server";

import { signIn, signOut } from "@/auth";
import {
  signInFormSchema,
  signUpFormSchema,
  updateUserSchema,
} from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

//Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;

    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "User registered successfully" };
  } catch (e) {
    if (isRedirectError(e)) {
      throw Error;
    }

    return { success: false, message: formatError(e) };
  }
}

//Sign out user
export async function signOutUser() {
  await signOut();
}

//Get all users
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const data = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count();
  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

//Get user by ID
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (e) {
    return {
      success: false,
      message: formatError(e),
    };
  }
}

//Update user
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//Delete user
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (e) {
    return {
      success: false,
      message: formatError(e),
    };
  }
}
