import { CommentMode, CommentReply, MarkdownString, Uri } from 'vscode';
import { CommentComponent } from './comment.provider';

export const createComment = (commentReply: CommentReply) => {
    const thread = commentReply.thread;
    const comment = new CommentComponent(
        thread,
        new MarkdownString(commentReply.text),
        CommentMode.Preview,
        {
            name: 'Oroasis Agent',
            iconPath: Uri.file('../assets/oroasisBotLight.ico')
        },
        thread.comments.length > 1 ? 'canBeDeleteComment' : undefined
    );
};