import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ratelimit } from "@/lib/redis";
import { getClientID } from "@/lib/utils/get-client-id";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const client_id = await getClientID();
    const identifier = `api/ai/alt:${client_id}`;
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

    const { caption, draft } = await request.json();
    // Ask OpenAI for a streaming completion given the prompt
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI content creation assistant that generates alt text for pictures. " +
            "You will receive a AI generated caption for the picture and the draft written by a user. " +
            "To generate the alt text, improve the caption using details you infere from the draft. " +
            "Be as accesible as possible. " +
            "Limit your response to no more than 280 characters, but make sure to construct complete sentences. ",
        },
        {
          role: "user",
          content: "Caption: " + caption + "\nDraft: " + draft,
        },
      ],
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
      n: 1,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream, {
      headers: {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
