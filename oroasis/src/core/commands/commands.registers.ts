import { commands, CommentMode, CommentReply, OutputChannel, window } from 'vscode';
import { createComment } from '../../providers/comments/create.comment';
import { CommentComponent } from '../../providers/comments/comment.provider';

export const createCommand = (commandName: string, callback: (parameter: any) => void) => {
    return commands.registerCommand(commandName, callback);
};

// Examples
export const helloWorldCommand = (outputChannel: OutputChannel) => window.showInformationMessage('Hello World from Orasis!');

// Webviews
export const openPanelCommand = (outputChannel: OutputChannel) => { };

// Comments 
export const createCommentCommand = (commentReply: CommentReply) => {
    createComment(commentReply);
};

export const editCommentCommand = (comment: CommentComponent) => {
    const commentToEdit = comment.thread.comments.find(x => (x as CommentComponent).id === comment.id);
    if (commentToEdit === undefined) { return; }
    commentToEdit.mode = CommentMode.Editing;
};

export const deleteCommentCommand = () => {

};

// Agent IA

export const askAgentCommand = (outputChannel: OutputChannel) => { };

export const editAgentCommand = (outputChannel: OutputChannel) => { };