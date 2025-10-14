import * as assert from 'assert';
import { createCommentController } from './comment.controller';
import { CommentController, Range } from 'vscode';

suite('createCommentController Test Suite', () => {
	let controller: CommentController;

	setup(() => {
		controller = createCommentController();
	});

	test('should create a comment controller', () => {
		assert.ok(controller);
		assert.strictEqual(controller.id, 'oroasisCommentController');
		assert.strictEqual(controller.label, 'Oroasis Comment Controller');
	});

	test('should provide commenting ranges for a document', async () => {
		const mockDocument = { lineCount: 10 } as any;
		const ranges = await controller.commentingRangeProvider?.provideCommentingRanges(mockDocument, {} as any);

		assert.ok(ranges);
		if (Array.isArray(ranges)) {
			assert.strictEqual(ranges[0].start.line, 0);
			assert.strictEqual(ranges[0].end.line, 9);
		}
	});
});