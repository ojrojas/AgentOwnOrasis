import * as assert from 'assert';
import * as sinon from 'sinon';
import { WebviewPanel } from 'vscode';
import { newHeaderButtonCommand, historyHeaderButtonCommand, settingsHeaderButtonCommand, closeHeaderButtonCommand } from './headers.commands';
import { sendToWebview } from '../../shared/utils/chat.utils';
import { v4 as uuidv4 } from 'uuid';

suite('Header Commands Test Suite', () => {
    let mockPanel: WebviewPanel;
    let sendToWebviewStub: sinon.SinonStub;
    let uuidStub: sinon.SinonStub;

    setup(() => {
        mockPanel = {
            dispose: () => {}
        } as unknown as WebviewPanel;

        sendToWebviewStub = sinon.stub().callsFake(sendToWebview);
        uuidStub = sinon.stub().returns('mock-uuid');
    });

    teardown(() => {
        sinon.restore();
    });

    test('should send new header message', () => {
        newHeaderButtonCommand(mockPanel);
        assert.ok(sendToWebviewStub.calledWith(mockPanel, 'headerMessage', 'mock-uuid', { type: 'new' }));
    });

    test('should send history header message', () => {
        historyHeaderButtonCommand(mockPanel);
        assert.ok(sendToWebviewStub.calledWith(mockPanel, 'headerMessage', 'mock-uuid', { type: 'history' }));
    });

    test('should send settings header message', () => {
        settingsHeaderButtonCommand(mockPanel);
        assert.ok(sendToWebviewStub.calledWith(mockPanel, 'headerMessage', 'mock-uuid', { type: 'settings' }));
    });

    test('should close the panel', () => {
        const disposeSpy = sinon.spy(mockPanel, 'dispose');
        closeHeaderButtonCommand(mockPanel);
        assert.ok(disposeSpy.calledOnce);
    });
});