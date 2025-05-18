import { CommentMode, CommentReply, MarkdownString, Uri } from 'vscode';
import { CommentComponent } from './comment.provider';
import { ActorType, CommnetType } from './comment.types';

export const createComment = (data: string,actor: ActorType, commentReply: CommentReply, commentType: CommnetType) => {
    const thread = commentReply.thread;
    const comment = new CommentComponent(
        thread,
        commentType,
        new MarkdownString(data),
        CommentMode.Preview,
        {
            name: actor as string,
            iconPath: Uri.parse("../../assets/icons/oroasisBotDark.ico")
        },
        thread.comments.length ? 'canBeDeleteComment' : undefined
    );
};
