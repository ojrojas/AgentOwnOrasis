import { CommentReply, CommentThread, MarkdownString, OutputChannel, ProgressLocation, window, workspace } from "vscode";
import { createComment } from "../../providers/comments/create.comment";
import { CommentComponent } from "../../providers/comments/comment.provider";
import { editCommentCommand } from "./comment.commands";
import { IChatRequest, IMessage } from "../types/chat-message.type";
import { IProviderFactory } from "../services/provider.factory.service";
import { ProvidersMap } from "../types/provider.type";

export const updateModelsCommand = (outputChannel: OutputChannel, providersMap: ProvidersMap, providerName: string) => {
    outputChannel.appendLine(`Updating models from provider: ${providerName}`);
    const factory = new IProviderFactory(providersMap);
    const adapter = factory.getAdapter(providerName);
    adapter.listModels().then(models => outputChannel.appendLine(`Models updated: ${models.models.join(', ')}`));
};

export const askAgentCommand = (commentReply: CommentReply, providersMap: ProvidersMap, providerName: string, outputChannel: OutputChannel) => {
    window.withProgress({
        location: ProgressLocation.Window,
        title: "Agent Response",
        cancellable: true
    }, async () => {
        const settings = workspace.getConfiguration('oroasisSettings');
        const model = settings.get<string>('modelDefault');
        const roleAgent = settings.get('templatePromptGenerate') as string;

        if (!model) {
            window.showInformationMessage("Failed to request agent, no model selected");
            return;
        }

        outputChannel.appendLine("Create comment request");

        const textHighlighted = await getTextCurrentDocument(commentReply.thread);
        commentReply.text += textHighlighted;
        createComment(commentReply.text, 'User', commentReply.thread, 'RequestChat');

        // Construir mensajes
        const messages: IMessage[] = [];
        if (commentReply.thread.comments.length === 0) {
            messages.push({
                id: crypto.randomUUID(),
                role: 'system',
                content: roleAgent,
                timestamp: new Date(),
                model: model 
            });
        }

        commentReply.thread.comments.forEach(comment => {
            messages.push({
                id: crypto.randomUUID(),
                role: 'user',
                content: (comment.body as MarkdownString).value,
                timestamp: new Date(),
                model
            });
        });

        const factory = new IProviderFactory(providersMap);
        const adapter = factory.getAdapter(providerName);

        try {
            let accumulated = '';
            createComment('', 'Assistant', commentReply.thread, 'ResponseChat', false);

            // Stream del chat
            const chatStream = adapter.chatStream?.({ model, messages } as IChatRequest);
            if (chatStream) {
                for await (const chunk of chatStream) {
                    accumulated += chunk.content;
                    createComment(accumulated, 'Assistant', commentReply.thread, 'ResponseChat', true);
                }
            }

        } catch (error) {
            console.error(error);
        }

        outputChannel.appendLine("Comment response finish");
    });
};

// Comando para editar comentario y re-enviar al agente
export const editAgentCommand = (commentReply: CommentComponent, providersMap: ProvidersMap, providerName: string, outputChannel: OutputChannel) => {
    window.withProgress({
        location: ProgressLocation.Window,
        title: "Agent Response",
        cancellable: true
    }, async () => {
        const settings = workspace.getConfiguration('oroasisSettings');
        const model = settings.get<string>('modelDefault');
        const roleAgent = settings.get('templatePromptGenerate') as string;

        if (!model) {
            window.showInformationMessage("Failed to request agent, no model selected");
            return;
        }

        outputChannel.appendLine("Edit to request comment");
        editCommentCommand(commentReply);

        const messages: IMessage[] = [];
        if (commentReply.thread.comments.length === 0) {
            messages.push({
                id: crypto.randomUUID(),
                role: 'system',
                content: roleAgent,
                timestamp: new Date(),
                model
            });
        }

        commentReply.thread.comments.forEach(comment => {
            messages.push({
                id: crypto.randomUUID(),
                role: 'user',
                content: (comment.body as MarkdownString).value,
                timestamp: new Date(),
                model
            });
        });

        const factory = new IProviderFactory(providersMap);
        const adapter = factory.getAdapter(providerName);

        try {
            let accumulated = '';
            createComment('', 'Assistant', commentReply.thread, 'ResponseChat', false);

            const chatStream = adapter.chatStream?.({ model, messages } as IChatRequest);
            if (chatStream) {
                for await (const chunk of chatStream) {
                    accumulated += chunk.content;
                    createComment(accumulated, 'Assistant', commentReply.thread, 'ResponseChat', true);
                }
            }

        } catch (error) {
            console.error(error);
        }

        outputChannel.appendLine("Comment response finish");
    });
};

export const getTextCurrentDocument = async (commentThread: CommentThread) => {
    const document = await workspace.openTextDocument(commentThread.uri);
    let spaceWhite: string = ": ";
    return spaceWhite += document.getText(commentThread.range).trim();
};