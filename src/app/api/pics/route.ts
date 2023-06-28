import { z } from "zod";

import { ratelimit } from "@/lib/redis";
import { getClientID } from "@/lib/utils/get-client-id";

import { NextResponse } from "next/server";
import { getXataClient } from "@/lib/xata";

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || "",
});

const schema = z.object({
  aspect_ratio: z.number(),
  url: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const client_id = await getClientID();
    const identifier = `api/pics:${client_id}`;
    const result = await ratelimit.limit(identifier);

    if (!result.success) {
      return new Response("Exceeded maximum api calls quote", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
        },
      });
    }

    const { url, aspect_ratio } = await request.json();

    const data = schema.parse({
      url,
      aspect_ratio,
    });

    const output = await replicate.run(
      "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
      {
        input: {
          image: data.url
        },
      }
    );

    const pic = await getXataClient().db.pic.create({
      url,
      caption: String(output),
      aspect_ratio,
    });

    const id = pic.id.split("_")[1];

    return NextResponse.json(
      {
        id,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
        },
      }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}
