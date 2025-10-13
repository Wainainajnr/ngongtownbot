import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🔧 Environment in API:");
  console.log("Model:", process.env.HUGGINGFACE_MODEL);
  console.log("API Key exists:", !!process.env.HUGGINGFACE_API_KEY);
  console.log("API Key length:", process.env.HUGGINGFACE_API_KEY?.length);
  
  res.status(200).json({
    model: process.env.HUGGINGFACE_MODEL,
    apiKeyExists: !!process.env.HUGGINGFACE_API_KEY,
    apiKeyLength: process.env.HUGGINGFACE_API_KEY?.length,
    apiKeyStartsWithHf: process.env.HUGGINGFACE_API_KEY?.startsWith('hf_')
  });
}