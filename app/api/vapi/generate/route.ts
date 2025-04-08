import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { type, role, level, techstack, amount, userid } = await request.json();

    // Add validation to ensure required fields are present
    if (!role || !level || !amount || !userid) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle techstack safely - use empty array if undefined
    const techstackArray = techstack ? techstack.split(",").filter(Boolean) : [];

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack || "Not specified"}.
        The focus between behavioural and technical questions should lean towards: ${type || "balanced"}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    // Safely parse the questions with error handling
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Expected array of questions");
      }
    } catch (parseError) {
      console.error("Failed to parse questions:", parseError);
      return Response.json(
        { success: false, error: "Failed to parse questions" },
        { status: 500 }
      );
    }

    const interview = {
      role: role,
      type: type || "balanced",
      level: level,
      techstack: techstackArray,
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);

    return Response.json(
      { success: true, interviewId: docRef.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating interview:", error);
    
    // Provide a safe error response
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // This handles the favicon.ico request that was causing an error
  if (request.url.includes('favicon.ico')) {
    return new Response(null, { status: 204 }); // No content response for favicon
  }
  
  return Response.json({ success: true, message: "API is running" }, { status: 200 });
}