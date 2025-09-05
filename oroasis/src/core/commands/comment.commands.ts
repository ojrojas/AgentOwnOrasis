import { CommentMode, CommentReply, CommentThread } from "vscode";
import { createComment } from "../../providers/comments/create.comment";
import { CommentComponent } from "../../providers/comments/comment.provider";

// Comments 
export const createCommentCommand = (commentReply: CommentReply) => {
    createComment(
        commentReply.text,
        'User',
        commentReply.thread,
        'Comment'
    );
};

export const replyCommentCommand = (commentReply: CommentReply) => {
    createComment(
        commentReply.text,
        'User',
        commentReply.thread,
        'Comment'
    );
};

export const editCommentCommand = (comment: CommentComponent) => {
    if (!comment.thread) {
        return;
    }

    comment.thread.comments = comment.thread.comments.map(x => {
        if ((x as CommentComponent).id === comment.id) {
            x.mode = CommentMode.Editing;
        }
        return x;
    });
};

export const saveComentCommand = (comment: CommentComponent) => {
    if (!comment.thread) {
        return;
    }

    comment.thread.comments = comment.thread.comments.map(x => {
        if ((x as CommentComponent).id === comment.id) {
            (x as CommentComponent).marked = comment.body;
            x.mode = CommentMode.Preview;
        }
        return x;
    });
};

export const cancelSaveCommentCommand = (comment: CommentComponent) => {
    if (!comment.thread) {
        return;
    }

    comment.thread.comments = comment.thread.comments.map(x => {
        if ((x as CommentComponent).id === comment.id) {
            x.body = (x as CommentComponent).marked;
            x.mode = CommentMode.Preview;
        }
        return x;
    });
};

export const deleteAllCommentsCommand = (thread: CommentThread) => {
    thread.dispose();
};


export const deleteCommentCommand = (comment: CommentComponent) => {
    const thread = comment.threadParent;
    if (!thread) {
        return;
    }

    thread.comments = thread.comments.filter(x => (x as CommentComponent).id !== comment.id);

    if (thread.comments.length === 0) {
        thread.dispose();
    }
};
