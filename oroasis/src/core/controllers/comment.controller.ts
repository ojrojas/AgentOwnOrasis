import { CancellationToken, CommentController, CommentingRanges, comments, Position, Range, TextDocument } from "vscode";

export const createCommentController = (): CommentController => {
    const commentController = comments.createCommentController('oroasisCommentController', 'Oroasis Comment Controller');
    commentController.options = {
        prompt: 'How can I help you?',
        placeHolder: 'Write a question or request help on any topic'
    };

    commentController.commentingRangeProvider = {
        provideCommentingRanges: (document: TextDocument, cancellationToken: CancellationToken) => {
            const count = document.lineCount;
            return [new Range(0, 0, count - 1, 0)];
        }
    };

    return commentController;
};