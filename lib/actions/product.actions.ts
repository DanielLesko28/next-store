"use server";
import { convertToPlainObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { insertProductSchema, updateProductSchema } from "../validators";

//Get latest products
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}

//Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
}) {
  const data = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

//Get single product by slug
export async function getSingleProduct(slug: string) {
  return await prisma.product.findFirst({
    where: {
      slug: slug,
    },
  });
}

//Get single product by ID
export async function getSingleProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: {
      id: productId,
    },
  });

  return convertToPlainObject(data);
}

//Create new product
export async function createNewProduct(
  data: z.infer<typeof insertProductSchema>
) {
  try {
    //Here I evaluate the data
    const product = insertProductSchema.parse(data);

    await prisma.product.create({
      data: product,
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (e) {
    return {
      success: false,
      message: formatError(e),
    };
  }
}

//Update product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    //Here I evaluate the data
    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: { id: product.id },
    });

    if (!productExists) throw new Error("Product not found");

    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (e) {
    return {
      success: false,
      message: formatError(e),
    };
  }
}

//Delete single product
export async function deleteProduct(productId: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!productExists) throw new Error("Product not found");

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (e) {
    return {
      success: false,
      message: formatError(e),
    };
  }
}
