import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    const { text } = await generateText({
      model: google('gemini-1.5-flash-001'),
      prompt: `
        Analyze the following meeting transcript and generate structured meeting notes containing:
        1. Summary
        2. Key Decisions
        3. Action Items

        CRITICAL FORMATTING INSTRUCTIONS FOR ACTION ITEMS:
        - DO NOT output raw JSON, brackets, or code blocks.
        - Format Action Items as a clean bulleted list using plain text.
        - Example format:
          * **Task**: [Description] | **Owner**: [Name] | **Priority**: [High/Medium/Low]

        Transcript:
        ${transcript}
      `,
    });

    return Response.json({ success: true, notes: text });
  } catch (error: any) {
    console.error('API Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}