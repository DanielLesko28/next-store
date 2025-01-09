export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "NEXT-STORE";

export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const LATEST_PRODUCTS_LIMIT = 4;

export const signInDefaultValues = {
  email: "",
  password: "",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 4;

export const USER_ROLES = ["admin", "user"];
