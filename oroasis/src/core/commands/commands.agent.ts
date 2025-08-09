import { CommentReply, CommentThread, MarkdownString, OutputChannel, ProgressLocation, window, workspace } from "vscode";
import { IOllamaApiService } from "../interfaces/ollama.interface.service";
import { createComment } from "../../providers/comments/create.comment";
import { Message } from "ollama";
import { CommentComponent } from "../../providers/comments/comment.provider";
import { editCommentCommand } from "./commands.comment";

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

        const textHighlighted = await getTextCurrentDocument(commentReply.thread);
        commentReply.text += textHighlighted;

        createComment(commentReply.text, 'User', commentReply.thread, 'RequestChat');
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
                temperature: 0.3,
                presence_penalty: 1,
                top_p: .3
            }
        });

        try {
            let accumulated = '';
            createComment('', 'Assistant', commentReply.thread, 'ResponseChat', false);
            for await (const chunk of response) {
                if (chunk.done) {
                    break;
                }
                const token = chunk.message.content || '';
                accumulated += token;
                createComment(accumulated, 'Assistant', commentReply.thread, 'ResponseChat', true);
            }

        } catch (error) {
            console.error(error);
        }

        outputChannel.appendLine("Comment response finish");
    });
};

export const editAgentCommand = (commentReply: CommentComponent, ollamaService: IOllamaApiService, outputChannel: OutputChannel) => {
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
        editCommentCommand(commentReply);

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

        messages.forEach(message => outputChannel.appendLine(message.content));
        const m = (commentReply.body as MarkdownString);
        console.log("esto es m: ", m.value);

        const response = await ollamaService.chat({
            model: model as string,
            messages: [
                {
                    role: 'user',
                    content: (commentReply.body as MarkdownString).value,
                }
            ],
            options: {
                temperature: 0,
                presence_penalty: 1,
                top_p: .3
            }
        });

        try {
            let accumulated = '';
            createComment('', 'Assistant', commentReply.thread, 'ResponseChat', false);
            for await (const chunk of response) {
                if (chunk.done) {
                    break;
                }
                const token = chunk.message.content || '';
                accumulated += token;
                createComment(accumulated, 'Assistant', commentReply.thread, 'ResponseChat', true);
            }
        } catch (error) {
            console.error(error);
        }

        outputChannel.appendLine("Comment response finish");
    });
};

// Auxiliar functions
export const getTextCurrentDocument = async (commentThread: CommentThread) => {
    const document = await workspace.openTextDocument(commentThread.uri);
    let spaceWhite: string = ": ";
    return spaceWhite += document.getText(commentThread.range).trim();
};