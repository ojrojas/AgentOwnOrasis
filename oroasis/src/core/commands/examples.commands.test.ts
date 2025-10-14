import * as assert from 'assert';
import * as sinon from 'sinon';
import { helloWorldCommand } from './examples.commands';
import { OutputChannel, window } from 'vscode';

suite('Examples Commands Test Suite', () => {
    let mockOutputChannel: OutputChannel;
    let showInformationMessageStub: sinon.SinonStub;

    setup(() => {
        mockOutputChannel = {
            appendLine: () => {}
        } as unknown as OutputChannel;

        showInformationMessageStub = sinon.stub(window, 'showInformationMessage');
        sinon.stub(mockOutputChannel, 'appendLine');
    });

    teardown(() => {
        sinon.restore();
    });

    test('should log and display Hello World message', () => {
        helloWorldCommand(mockOutputChannel);

        assert.ok((mockOutputChannel.appendLine as sinon.SinonStub).calledWith('Hello World from Orasis!'));
        assert.ok(showInformationMessageStub.calledWith('Hello World from Orasis!'));
    });
});