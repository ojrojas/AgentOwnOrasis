import { CancellationToken, CommentController, CommentingRanges, comments, Position, Range, TextDocument } from "vscode";

export const createCommentController = (): CommentController =>{
    const commentController = comments.createCommentController('oroasisCommentController', 'Oroasis Comment Controller');
    commentController.options = {
        prompt: 'How can I help you?',
        placeHolder: 'Write a question or request help on any topic'
    };

    commentController.commentingRangeProvider = {
        provideCommentingRanges: (document: TextDocument, cancellationToken: CancellationToken ) =>{
            const count = document.lineCount;
            const characters = document.getText();
            const range = new Range(0,0, count -1, characters.length -1);
            return [range];
        }
    };

    return commentController;
};