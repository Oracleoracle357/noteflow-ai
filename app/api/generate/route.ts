import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MeetingNotesSchema = z.object({
  summary: z.string(),
  keyDecisions: z.array(z.string()),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string(),
      priority: z.string(),
    })
  ),
  followUpEmail: z.string(),
});

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return Response.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const result = await generateObject({
      model: google('gemini-3.8-flash'),
      schema: MeetingNotesSchema,
      prompt: `You are an expert meeting notes assistant. Analyze the following meeting transcript and extract a concise summary, key decisions, action items (with specific tasks, owners, and priorities like High/Medium/Low), and draft a professional follow-up email:\n\n${transcript}`,
    });

    const data = result.object;

    // Save the generated notes to Supabase
    const { error: dbError } = await supabase.from('notes').insert([
      {
        summary: data.summary,
        key_decisions: data.keyDecisions,
        action_items: data.actionItems,
        follow_up_email: data.followUpEmail,
      },
    ]);

    if (dbError) {
      console.error('Failed to save to Supabase:', dbError);
    } else {
      console.log('Successfully saved note to Supabase!');
    }

    // Return data to the frontend
    return Response.json({
      summary: data.summary,
      keyDecisions: data.keyDecisions,
      key_decisions: data.keyDecisions,
      actionItems: data.actionItems,
      action_items: data.actionItems,
      followUpEmail: data.followUpEmail,
      follow_up_email: data.followUpEmail,
    });
  } catch (error) {
    console.error('API Error Details:', error);
    return Response.json({ error: 'Failed to generate notes' }, { status: 500 });
  }
}