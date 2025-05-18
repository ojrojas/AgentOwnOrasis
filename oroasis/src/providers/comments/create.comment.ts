import { CommentMode, CommentReply, MarkdownString, Uri } from 'vscode';
import { CommentComponent } from './comment.provider';
import { CommnetType } from './comment.types';

export const createComment = (data: string,actor: string, commentReply: CommentReply, commentType: CommnetType) => {
    const thread = commentReply.thread;
    const comment = new CommentComponent(
        thread,
        commentType,
        new MarkdownString(data),
        CommentMode.Preview,
        {
            name: actor,
        },
        thread.comments.length ? 'canBeDeleteComment' : undefined
    );
};
