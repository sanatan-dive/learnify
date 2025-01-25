// /pages/api/saveApiResponse.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { apiType, responseData } = req.body;

    try {
      const apiResponse = await prisma.apiResponse.create({
        data: {
          apiType,
          responseData,
        },
      });

      return res.status(200).json({ apiResponse });
    } catch (error) {
      return res.status(500).json({ error: "Failed to save API response" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
