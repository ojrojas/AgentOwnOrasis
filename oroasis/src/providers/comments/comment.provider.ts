import { Comment, CommentAuthorInformation, CommentMode, CommentReaction, MarkdownString } from 'vscode'
import { CommnetType } from './comment.types';
export class CommentComponent implements Comment {
    id = 0;
    type: CommnetType = 'Markdown';
    marked: string | MarkdownString;
    constructor(
        public body: string | MarkdownString,
        public mode: CommentMode,
        public author: CommentAuthorInformation,
        public contextValue?: string | undefined,
        public reactions?: CommentReaction[] | undefined,
        public timestamp?: Date | undefined) {
        ++this.id;
        this.marked = this.body;
    }
}