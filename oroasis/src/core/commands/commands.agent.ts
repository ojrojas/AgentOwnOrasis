import { CommentMode, CommentReply, MarkdownString, OutputChannel, ProgressLocation, window, workspace } from "vscode";
import { OllamaApiService } from "../services/ollama.service";
import { IOllamaApiService } from "../services/ollama.interface.service";
import { CommentComponent } from "../../providers/comments/comment.provider";
import { createComment } from "../../providers/comments/create.comment";

// Agent IA
export const updateModelsCommand = (outputChannel: OutputChannel) => {
    const ollama = new OllamaApiService();
    ollama.udpdateModels();
};

export const askAgentCommand = (commentReply: CommentReply, ollamaService: IOllamaApiService, outputChannel: OutputChannel) => {
    window.withProgress({
        location: ProgressLocation.SourceControl,
        title: "Agent Response",
        cancellable: true
    }, async () => {
        const settings = workspace.getConfiguration('oroasisSettings');
        const model = settings.get('modelDefault');
        const role = settings.get('roleAgentDefault');
        if (model === undefined || role === undefined) {
            window.showInformationMessage("Failed to request ollama, no model IA selected");
            return;
        }

        createComment(commentReply.text, 'User', commentReply, 'RequestChat');

        const roleAgent = settings.get('templatePromptGenerate');
        const response = await ollamaService.chat({
            model: model as string,
            messages: [
                {
                    role: 'user',
                    content: commentReply.text,
                }
            ]
        });
        
        createComment(response.message.content, 'Assistant', commentReply, 'ResponseChat');
    });
};

export const editAgentCommand = (outputChannel: OutputChannel) => { };

// Auxiliar functions
export const createMessage = (role: string, roleAgent: string, content: string) => {
};