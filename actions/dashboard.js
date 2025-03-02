"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const searialized = { ...obj };

  if (obj.balance) {
    searialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    searialized.amount = obj.amount.toNumber();
  }
  return searialized;
};

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    //convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // check if this is the user first account

    const existingAccount = await db.account.findMany({
      where: { userId: user.id },
    });

    const shouldBeDefault =
      existingAccount.length === 0 ? true : data.isDefault;

    //   if this account is default then unset other default account

    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // create account

    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    const searializedAccount = serializeTransaction(account);
    revalidatePath("/dashboard");
    return {
      success: true,
      data: searializedAccount,
    };
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getUserAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // find account
    const account = await db.account.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
    const searializedAccount = account.map(serializeTransaction);
    return searializedAccount;
  } catch (err) {
    throw new Error(err.message);
  }
}
