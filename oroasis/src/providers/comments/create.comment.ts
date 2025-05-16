import { CommentMode, CommentReply, MarkdownString, Uri } from 'vscode';
import { CommentComponent } from './comment.provider';

export const createComment = (commentReply: CommentReply) => {
    const thread = commentReply.thread;
    const comment = new CommentComponent(
        thread,
        'Comment',
        new MarkdownString(commentReply.text),
        CommentMode.Preview,
        {
            name: 'User',
        },
        thread.comments.length ? 'canBeDeleteComment' : undefined
    );
};
