import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { EnumListTool } from '../../shared/enums/tool';
import { WorkspaceController } from '../controllers/workspace.controller';

const execAsync = promisify(exec);

export class ToolExecutorService {
    constructor(private workspaceController: WorkspaceController, private outputChannel: vscode.OutputChannel) { }

    async execute(toolName: string, parameters: any): Promise<string> {
        this.outputChannel.appendLine(`Executing tool: ${toolName} with params: ${JSON.stringify(parameters)}`);
        
        try {
            switch (toolName) {
                case EnumListTool.read_file:
                    return await this.readFile(parameters.path);
                case EnumListTool.write_file:
                    return await this.writeFile(parameters.path, parameters.content);
                case EnumListTool.list_files:
                case 'workspace_files':
                    return await this.listFiles(parameters.workspace_files || parameters.path);
                case EnumListTool.replace_in_file:
                    return await this.replaceInFile(parameters.path, parameters);
                case EnumListTool.execute_command:
                    return await this.executeCommand(parameters.command);
                case EnumListTool.search_files:
                    return await this.searchFiles(parameters.query, parameters.path);
                default:
                    return `Error: Tool ${toolName} not implemented.`;
            }
        } catch (error) {
            const msg = `Error executing ${toolName}: ${(error as Error).message}`;
            this.outputChannel.appendLine(msg);
            return msg;
        }
    }

    public parseToolCalls(text: string): { tool: string, parameters: any }[] {
        const toolCalls: { tool: string, parameters: any }[] = [];
        
        // XML-like tags parser (as defined in basicPromptsV1_1)
        const xmlRegex = /<(\w+)>([\s\S]*?)<\/\1>/g;
        let match;
        while ((match = xmlRegex.exec(text)) !== null) {
            const toolName = match[1];
            const content = match[2];
            const parameters: any = {};
            
            // Basic parameter extraction from XML content
            const paramRegex = /<(\w+)>([\s\S]*?)<\/\1>/g;
            let paramMatch;
            let hasParams = false;
            while ((paramMatch = paramRegex.exec(content)) !== null) {
                parameters[paramMatch[1]] = paramMatch[2].trim();
                hasParams = true;
            }
            
            if (!hasParams) {
                // If no sub-tags, maybe the content itself is the parameter (e.g. for simple tools)
                parameters.content = content.trim();
            }
            
            toolCalls.push({ tool: toolName, parameters });
        }

        // JSON parser (as defined in PromptsChats or for use_tool action)
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
        while ((match = jsonRegex.exec(text)) !== null) {
            try {
                const parsed = JSON.parse(match[1]);
                if (parsed.action === "editFiles" && parsed.changes) {
                    for (const change of parsed.changes) {
                        toolCalls.push({ 
                            tool: EnumListTool.write_file, 
                            parameters: { path: change.path, content: change.newContent } 
                        });
                    }
                } else if (parsed.action === "use_tool") {
                    toolCalls.push({ tool: parsed.tool, parameters: parsed.parameters });
                }
            } catch (e) {
                // Ignore invalid JSON
            }
        }

        return toolCalls;
    }

    private async readFile(filePath: string): Promise<string> {
        const content = await this.workspaceController.readFile(filePath);
        return `Content of ${filePath}:\n${content}`;
    }

    private async writeFile(filePath: string, content: string): Promise<string> {
        await this.workspaceController.writeFile(filePath, content);
        return `Successfully wrote to ${filePath}`;
    }

    private async listFiles(path?: string): Promise<string> {
        const files = await this.workspaceController.listFiles(path ? `${path}/**/*` : undefined);
        return `Files in ${path || 'root'}:\n${files.join('\n')}`;
    }

    private async replaceInFile(filePath: string, parameters: any): Promise<string> {
        const search = parameters.search;
        const replace = parameters.replace;
        
        if (!search || !replace) {
            return "Error: replace_in_file requires both <search> and <replace> parameters.";
        }

        const content = await this.workspaceController.readFile(filePath);
        if (!content.includes(search)) {
            return `Error: Could not find the search text in ${filePath}. Make sure the search text matches exactly, including whitespace.`;
        }

        const newContent = content.replace(search, replace);
        await this.workspaceController.writeFile(filePath, newContent);
        return `Successfully replaced text in ${filePath}`;
    }

    private async executeCommand(command: string): Promise<string> {
        const folders = vscode.workspace.workspaceFolders;
        const cwd = folders ? folders[0].uri.fsPath : undefined;

        try {
            const { stdout, stderr } = await execAsync(command, { cwd });
            return `Command output:\n${stdout}${stderr ? `\nErrors:\n${stderr}` : ''}`;
        } catch (error: any) {
            return `Command failed with error: ${error.message}\n${error.stdout}\n${error.stderr}`;
        }
    }

    private async searchFiles(query: string, path?: string): Promise<string> {
        const results = await vscode.workspace.findFiles(path ? `${path}/**` : '**/*', '**/node_modules/**');
        // This is a very basic search, ideally we'd grep the contents.
        return `Search for "${query}" in ${path || 'workspace'} found ${results.length} files. (Full content search not implemented)`;
    }
}
