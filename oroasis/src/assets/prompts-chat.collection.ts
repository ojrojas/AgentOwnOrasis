import { Prompt } from "../core/types/prompt.type";

export const PromptsChats: Prompt[] = [
    {
        type: "editFiles",
        prompt: `When proposing changes to workspace files, respond ONLY with a JSON object inside a fenced code block \`\`\`json ... \`\`\` and NOTHING else. The object must follow this schema:

{
  "action": "editFiles",
  "changes": [
    {
      "path": "/absolute/path/to/file.ts",
      "newContent": "<the complete new file content, replacing the old one>"
    }
  ]
}

If there are no changes, respond with:
\`\`\`json
{ "action": "none" }
\`\`\`

Do not add explanations or extra text outside the JSON block. Use relative workspace paths whenever possible.`
    },
    {
        type: "summarizeFile",
        prompt: `Given the content of a file, generate a concise summary of what it does. Limit the response to 3-5 clear sentences. Do not return code, only natural language text.`
    },
    {
        type: "findBugs",
        prompt: `Analyze the file content for potential errors, bad practices, or performance issues. Return a JSON object following this structure:
{
  "action": "reportBugs",
  "issues": [
    {"line": 10, "description": "Possible division by zero"},
    {"line": 25, "description": "Unused variable"}
  ]
}`
    }
];