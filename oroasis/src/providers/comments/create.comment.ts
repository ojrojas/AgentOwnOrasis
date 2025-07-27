import { CommentMode, CommentReply, CommentThread, MarkdownString, Uri } from 'vscode';
import { CommentComponent } from './comment.provider';
import { ActorType, CommnetType } from './comment.types';

export const createComment = (data: string, actor: ActorType, commentThread: CommentThread, commentType: CommnetType) => {
    const thread = commentThread;
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
