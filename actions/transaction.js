"use server";
// import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { err } from "inngest/types";
import { revalidatePath } from "next/cache";
import { date } from "zod";
// import { request } from "@arcjet/next";

const genAi = new GoogleGenerativeAI(process.env.GEMENI_API_KEY);

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

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // // Get request data for ArcJet
    // const req = await request();

    // // Check rate limit
    // const decision = await aj.protect(req, {
    //   userId,
    //   requested: 1, // Specify how many tokens to consume
    // });

    // if (decision.isDenied()) {
    //   if (decision.reason.isRateLimit()) {
    //     const { remaining, reset } = decision.reason;
    //     console.error({
    //       code: "RATE_LIMIT_EXCEEDED",
    //       details: {
    //         remaining,
    //         resetInSeconds: reset,
    //       },
    //     });

    //     throw new Error("Too many requests. Please try again later.");
    //   }

    //   throw new Error("Request blocked");
    // }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeTransaction(transaction) };
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}

// helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setDate(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setDate(date.getFullYear + 1);
      break;
  }
  return date;
}

export async function scanRecipt(file) {
  try {
    const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

    // convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();

    // convert array buffer to base 64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
    Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.log("Error parsing json format", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Failed to scan recipt", error.message);
    throw new Error("Failed to scan recipt");
  }
}
