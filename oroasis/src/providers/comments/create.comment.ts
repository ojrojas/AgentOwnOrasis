import { CommentMode, CommentThread, MarkdownString, Uri } from 'vscode';
import { CommentComponent } from './comment.provider';
import { ActorType, CommnetType } from './comment.types';

export const createComment = (data: string, actor: ActorType, commentThread: CommentThread, commentType: CommnetType, isToUpdate: boolean = false) => {
    if (isToUpdate) {
        const lastIndex = commentThread.comments.length - 1;
        const commentToUpdate = commentThread.comments[lastIndex];
        commentToUpdate.mode = CommentMode.Preview;
        commentToUpdate.body = new MarkdownString(data);
        commentThread.comments =  [...commentThread.comments.slice(0, -1), commentToUpdate];
    } else {
        const comment = new CommentComponent(
            commentThread,
            commentType,
            new MarkdownString(data),
            CommentMode.Preview,
            {
                name: actor as string,
                iconPath: Uri.parse("../../assets/icons/oroasisBotDark.ico")
            },
            commentThread.comments.length ? 'canBeDeleteComment' : undefined
        );
    }
};
