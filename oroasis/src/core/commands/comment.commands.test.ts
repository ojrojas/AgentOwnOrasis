import * as assert from 'assert';
import * as sinon from 'sinon';
import { createCommentCommand, replyCommentCommand, editCommentCommand, saveComentCommand, cancelSaveCommentCommand, deleteAllCommentsCommand, deleteCommentCommand } from './comment.commands';
import { CommentMode, CommentReply, CommentThread } from 'vscode';
import { CommentComponent } from '../../providers/comments/comment.provider';
import { createComment } from '../../providers/comments/create.comment';

suite('Comment Commands Test Suite', () => {
    let mockCommentReply: CommentReply;
    let mockComment: CommentComponent;
    let mockThread: CommentThread;
    let createCommentStub: sinon.SinonStub;

    setup(() => {
        mockThread = {
            comments: [],
            dispose: sinon.stub()
        } as unknown as CommentThread;

        mockCommentReply = {
            text: 'Test comment',
            thread: mockThread
        } as unknown as CommentReply;

        mockComment = {
            id: 'comment1',
            thread: mockThread,
            body: 'Original body',
            marked: 'Marked body',
            threadParent: mockThread
        } as unknown as CommentComponent;

        createCommentStub = sinon.stub().callsFake(() => {});
    });

    teardown(() => {
        sinon.restore();
    });

    test('should create a comment', () => {
        createCommentCommand(mockCommentReply);
        assert.ok(createCommentStub.calledWith('Test comment', 'User', mockThread, 'Comment'));
    });

    test('should reply to a comment', () => {
        replyCommentCommand(mockCommentReply);
        assert.ok(createCommentStub.calledWith('Test comment', 'User', mockThread, 'Comment'));
    });

    test('should edit a comment', () => {
        mockThread.comments = [mockComment];
        editCommentCommand(mockComment);
        assert.strictEqual(mockThread.comments[0].mode, CommentMode.Editing);
    });

    test('should save a comment', () => {
        mockThread.comments = [mockComment];
        saveComentCommand(mockComment);
        assert.strictEqual(mockThread.comments[0].mode, CommentMode.Preview);
        assert.strictEqual(mockThread.comments[0].body, 'Marked body');
    });

    test('should cancel saving a comment', () => {
        mockThread.comments = [mockComment];
        cancelSaveCommentCommand(mockComment);
        assert.strictEqual(mockThread.comments[0].mode, CommentMode.Preview);
        assert.strictEqual(mockThread.comments[0].body, 'Marked body');
    });

    test('should delete all comments in a thread', () => {
        deleteAllCommentsCommand(mockThread);
        assert.ok((mockThread.dispose as sinon.SinonStub).called);
    });

    test('should delete a specific comment', () => {
        mockThread.comments = [mockComment];
        deleteCommentCommand(mockComment);
        assert.strictEqual(mockThread.comments.length, 0);
        assert.ok((mockThread.dispose as sinon.SinonStub).called);
    });
});