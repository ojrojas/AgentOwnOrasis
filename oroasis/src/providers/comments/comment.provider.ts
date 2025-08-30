import { Comment, CommentAuthorInformation, CommentMode, CommentThread, MarkdownString } from 'vscode';
import { CommnetType } from '../../core/types/comment.type';
import { getIdentifier } from '../../core/services/identifier.service';
export class CommentComponent implements Comment {
    public readonly id:string = getIdentifier();
    marked: string | MarkdownString;
    thread: CommentThread;
    timestamp = new Date();
    constructor(
        public threadParent: CommentThread,
        public label: CommnetType,
        public body: string | MarkdownString,
        public mode: CommentMode,
        public author: CommentAuthorInformation,
        public contextValue?: string | undefined
    ) {
        this.marked = this.body;
        this.thread = threadParent;
        this.thread.comments = [...this.thread.comments, this];
    }
}