import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { registerConfigCommands } from './config.commands';
import { createConfigandlers } from '../handlers/config.handler';
import { IGlobalStateRepository } from '../interfaces/global-workspace-repository-state.interface.service';
import { IProviderConfig } from '../types/provider.type';

suite('Config Commands Test Suite', () => {
    let mockPanel: vscode.WebviewPanel;
    let mockProviderRepository: IGlobalStateRepository<IProviderConfig>;
    let mockOutputChannel: vscode.OutputChannel;
    let onDidReceiveMessageStub: sinon.SinonStub;
    let createConfigHandlersStub: sinon.SinonStub;

    setup(() => {
        onDidReceiveMessageStub = sinon.stub();
        mockPanel = {
            webview: {
                onDidReceiveMessage: onDidReceiveMessageStub
            }
        } as unknown as vscode.WebviewPanel;

        mockProviderRepository = {
            findAllSync: sinon.stub(),
            save: sinon.stub(),
            clear: sinon.stub(),
            insertMany: sinon.stub()
        } as unknown as IGlobalStateRepository<IProviderConfig>;

        mockOutputChannel = {
            appendLine: sinon.stub()
        } as unknown as vscode.OutputChannel;

        createConfigHandlersStub = sinon.stub().callsFake(() => ({
            "getConfiguration:request": sinon.stub(),
            "saveConfiguration:request": sinon.stub()
        }));
    });

    teardown(() => {
        sinon.restore();
    });

    test('should register config commands and handle messages', () => {
        registerConfigCommands(mockPanel, mockProviderRepository, mockOutputChannel);

        assert.ok(onDidReceiveMessageStub.called);

        const mockHandlers = createConfigandlers(mockPanel, mockProviderRepository, mockOutputChannel);

        assert.ok((mockHandlers["getConfiguration:request"] as sinon.SinonStub).calledWith("123", {}));
    });
});