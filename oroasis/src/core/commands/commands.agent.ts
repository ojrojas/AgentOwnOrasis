import { CommentReply, CommentThread, MarkdownString, OutputChannel, ProgressLocation, window, workspace } from "vscode";
import { IOllamaApiService } from "../services/ollama.interface.service";
import { createComment } from "../../providers/comments/create.comment";
import { Message } from "ollama";

// Agent IA
export const updateModelsCommand = (outputChannel: OutputChannel, ollamaService: IOllamaApiService) => {
    outputChannel.appendLine("Updating models from ollama");
    ollamaService.udpdateModels();
    outputChannel.appendLine("Models updated");
};

export const askAgentCommand = (commentReply: CommentReply, ollamaService: IOllamaApiService, outputChannel: OutputChannel) => {
    window.withProgress({
        location: ProgressLocation.Window,
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
        outputChannel.appendLine("create comment to request");
        const roleAgent = settings.get('templatePromptGenerate');
        
        const messages: Message[] = [];

        if (commentReply.thread.comments.length === 0) {
            messages.push({
                role: 'system',
                content: roleAgent as string
            });
        }
        
        createComment(commentReply.text, 'User', commentReply, 'RequestChat');
        outputChannel.appendLine("send comment request");

        commentReply.thread.comments.map(comment => {
            messages.push({
                role: comment.author.name,
                content: (comment.body as MarkdownString).value
            });
        });

        const response = await ollamaService.chat({
            model: model as string,
            messages: messages,
            options: {
                temperature: 0,
                presence_penalty: 1,
                top_p: .6
            }
        });

        outputChannel.appendLine("Comment response finish");
        createComment(response.message.content, 'Assistant', commentReply, 'ResponseChat');
    });
};

export const editAgentCommand = (commentReply: CommentReply, ollamaService: IOllamaApiService, outputChannel: OutputChannel) => {
    window.withProgress({
        location: ProgressLocation.Window,
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
        outputChannel.appendLine("Edit to request comment");
        createComment(commentReply.text, 'User', commentReply, 'RequestChat');

        const roleAgent = settings.get('templatePromptGenerate');
        outputChannel.appendLine("send edited comment request");

       const messages: Message[] = [];

        if (commentReply.thread.comments.length === 0) {
            messages.push({
                role: 'system',
                content: roleAgent as string
            });
        }

        commentReply.thread.comments.map(comment => {
            messages.push({
                role: comment.author.name,
                content: (comment.body as MarkdownString).value
            });
        });

        const response = await ollamaService.chat({
            model: model as string,
            messages: [
                {
                    role: 'user',
                    content: commentReply.text,
                }
            ],
            options: {
                temperature: 0,
                presence_penalty: 1,
                top_p: .6
            }
        });

        outputChannel.appendLine("Comment response finish");
        createComment(response.message.content, 'Assistant', commentReply, 'ResponseChat');
    });
};

// Auxiliar functions
export const getTextCurrentDocument = async (commentThread: CommentThread) => {
    const document = await workspace.openTextDocument(commentThread.uri);
    return document.getText(commentThread.range);
};