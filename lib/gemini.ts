import { GoogleGenerativeAI, Tool, FunctionCallingMode } from "@google/generative-ai";
import * as SecureStore from "expo-secure-store";

export const API_KEY_STORAGE_KEY = "gemini_api_key";

export async function getStoredApiKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

export async function saveApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key.trim());
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}

export type GeminiResponse =
  | { type: "text"; text: string }
  | { type: "tool_call"; functionName: string; args: Record<string, any> }
  | { type: "multi_tool_call"; calls: { functionName: string; args: Record<string, any> }[] };

const BASE_SYSTEM_INSTRUCTION = `You are a Health & Todo Assistant. You help users manage their daily health tracking and todo list.
Always reply in the SAME language the user used (Gujarati, Hindi, English, or mixed).

━━━ YOUR CAPABILITIES ━━━
1. Todo: add tasks (add_todo), remove tasks (remove_todo)
2. Meditation: set meditation time (set_meditation) — e.g. "10m", "20m", "30m"
3. Water: set water intake (set_water) — in liters, e.g. 1.5, 2.0
4. Sleep: set sleep duration (set_sleep) — hour and minute, e.g. {hour: "08", minute: "00"}
5. Workout: set workout duration (set_workout) — hour and minute, e.g. {hour: "00", minute: "45"}

━━━ FOR EVERYTHING ELSE ━━━
If user asks ANYTHING other than health tracking (questions, advice, poems, stories, coding, etc.),
reply ONLY with a short polite message in the user's language.

━━━ GREETINGS & FAREWELLS ━━━
Reply naturally and briefly, then remind user what you can help with.

━━━ TOOL USAGE RULES ━━━

▶ add_todo — user wants to add/save a task
▶ remove_todo — user wants to remove/delete a task
▶ set_meditation — user mentions meditation time ("meditated for 20 mins", "20 minute dhyan karyu")
▶ set_water — user mentions water intake ("2 liter pani pidhu", "drank 3 liters")
▶ set_sleep — user mentions sleep ("8 karak sutyo", "slept for 7 hours", "7 karak ugh")
▶ set_workout — user mentions workout/exercise ("gym 45 min karyu", "workout for 30 mins")

━━━ MULTI-ACTION PARAGRAPHS ━━━
IMPORTANT: If user message contains MULTIPLE health items in ONE paragraph, call ALL relevant tools.
Example: "I slept 7 hours 53 minutes and did workout for 1 hour 23 minutes and drank 3 litres"
→ Call set_sleep AND set_workout AND set_water — ALL THREE in the same response.
Never skip any health item mentioned in the message.

━━━ PARSING RULES ━━━
- Meditation: extract minutes as string with 'm' — "20m", "30m" etc. Round to nearest: 10,20,30,40,50,60
- Water: extract liters as number — "2 liter" → 2.0, "half liter" → 0.5, "three litres" → 3.0
- Sleep: extract as {hour, minute} — "8 kalak" → {hour:"08", minute:"00"}, "7 hours 53 minutes" → {hour:"07", minute:"53"}
- Workout: extract as {hour, minute} — "45 min" → {hour:"00", minute:"45"}, "one hour 23 minutes" → {hour:"01", minute:"23"}
- Words to numbers: "one"→1, "two"→2, "three"→3, "four"→4, "five"→5, "six"→6, "seven"→7, "eight"→8, "nine"→9, "ten"→10
- "half" → 0.5, "quarter" → 0.25

━━━ TODO RULES ━━━
✅ CALL add_todo for: "Add X", "remind me to X", "X karvanu yaad rakhjo", "X todo ma nakhjo"
✅ CALL remove_todo for: "remove X", "delete X", "hata do", "badha task delete karo"

Paragraph analysis — extract all actionable tasks:
- "aje hu gym javanu che ane client ne call karvano che" → add_todo([gym javanu, client ne call karvano])
- Extract ONLY actionable items, keep text short and clean
- 4+ tasks → add top 3 only

━━━ CRITICAL RULES ━━━
- ALWAYS trust the CURRENT STATE provided below — it is live data
- NEVER fake confirmations — always call the tool
- If you call tools, do NOT send a text reply — app handles confirmation
- For health data (meditation/water/sleep/workout): update means overwrite — no remove option`;

const TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "add_todo",
        description: "Adds one or more tasks to the user's todo list.",
        parameters: {
          type: "object" as any,
          properties: {
            tasks: {
              type: "array" as any,
              description: "List of tasks to add",
              items: {
                type: "object" as any,
                properties: {
                  text: { type: "string" as any, description: "Task description" },
                },
                required: ["text"],
              },
            },
          },
          required: ["tasks"],
        },
      },
      {
        name: "remove_todo",
        description: "Removes tasks from user's todo list. Set removeAll=true to clear all.",
        parameters: {
          type: "object" as any,
          properties: {
            tasks: {
              type: "array" as any,
              items: {
                type: "object" as any,
                properties: {
                  text: { type: "string" as any },
                },
                required: ["text"],
              },
            },
            removeAll: { type: "boolean" as any, description: "true = remove ALL tasks" },
          },
          required: [],
        },
      },
      {
        name: "set_meditation",
        description: "Set/update user's meditation time for today. Value like '10m', '20m', '30m'.",
        parameters: {
          type: "object" as any,
          properties: {
            time: { type: "string" as any, description: "Meditation duration e.g. '20m'" },
          },
          required: ["time"],
        },
      },
      {
        name: "set_water",
        description: "Set/update user's water intake for today. Value in liters.",
        parameters: {
          type: "object" as any,
          properties: {
            liters: { type: "number" as any, description: "Water in liters e.g. 2.0" },
          },
          required: ["liters"],
        },
      },
      {
        name: "set_sleep",
        description: "Set/update user's sleep duration for today.",
        parameters: {
          type: "object" as any,
          properties: {
            hour: { type: "string" as any, description: "Hours slept e.g. '08'" },
            minute: { type: "string" as any, description: "Minutes e.g. '00' or '30'" },
          },
          required: ["hour", "minute"],
        },
      },
      {
        name: "set_workout",
        description: "Set/update user's workout duration for today.",
        parameters: {
          type: "object" as any,
          properties: {
            hour: { type: "string" as any, description: "Hours e.g. '00' or '01'" },
            minute: { type: "string" as any, description: "Minutes e.g. '45'" },
          },
          required: ["hour", "minute"],
        },
      },
    ],
  },
];

export async function sendMessage(
  history: { role: "user" | "model"; text: string }[],
  userMessage: string,
  currentTodos?: { text: string; isDone: boolean }[],
  currentHealth?: {
    meditation?: string;
    water?: number;
    sleep?: { hour: string; minute: string };
    workout?: { hour: string; minute: string };
  }
): Promise<GeminiResponse> {
  const apiKey = await getStoredApiKey();
  if (!apiKey) throw new Error("NO_API_KEY");

  let stateContext = `\n\n━━━ CURRENT STATE (LIVE — trust this only) ━━━`;

  if (currentTodos && currentTodos.length > 0) {
    const taskLines = currentTodos
      .map((t, i) => `  ${i + 1}. [${t.isDone ? "✓ done" : "pending"}] ${t.text}`)
      .join("\n");
    stateContext += `\nTodo (${currentTodos.length}/3):\n${taskLines}`;
  } else {
    stateContext += `\nTodo: empty (3 slots available)`;
  }

  stateContext += `\nMeditation: ${currentHealth?.meditation ?? "not set"}`;
  stateContext += `\nWater: ${currentHealth?.water !== undefined ? currentHealth.water + "L" : "not set"}`;
  stateContext += `\nSleep: ${currentHealth?.sleep ? `${currentHealth.sleep.hour}h ${currentHealth.sleep.minute}m` : "not set"}`;
  stateContext += `\nWorkout: ${currentHealth?.workout ? `${currentHealth.workout.hour}h ${currentHealth.workout.minute}m` : "not set"}`;

  const SYSTEM_INSTRUCTION = BASE_SYSTEM_INSTRUCTION + stateContext;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: TOOLS,
    toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const rawHistory = history.map((h) => ({
    role: h.role,
    parts: [{ text: h.text }],
  }));
  const firstUserIndex = rawHistory.findIndex((h) => h.role === "user");
  const safeHistory = firstUserIndex > 0 ? rawHistory.slice(firstUserIndex) : rawHistory;

  const chat = model.startChat({ history: safeHistory });
  const result = await chat.sendMessage(userMessage);
  const response = result.response;

  // Badha function calls collect karo — multiple tool calls support
  const allParts = response.candidates?.[0]?.content?.parts ?? [];
  const fnCalls = allParts
    .filter((p: any) => p.functionCall)
    .map((p: any) => ({
      functionName: p.functionCall.name,
      args: p.functionCall.args as Record<string, any>,
    }));

  if (fnCalls.length > 1) {
    return { type: "multi_tool_call", calls: fnCalls };
  }

  if (fnCalls.length === 1) {
    return {
      type: "tool_call",
      functionName: fnCalls[0].functionName,
      args: fnCalls[0].args,
    };
  }

  return { type: "text", text: response.text() };
}
