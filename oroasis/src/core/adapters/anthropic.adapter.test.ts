import * as sinon from 'sinon';
import * as assert from 'assert';
import { IProviderConfig } from '../types/provider.type';
import { IChatRequest, IGenerateRequest } from '../types/chat-message.type';
import { AnthropicAdapter } from './anthropic.adapter';
import { HttpService } from '../services/http.service';

describe('AnthropicAdapter', () => {
    let adapter: AnthropicAdapter;
    let mockHttpService: sinon.SinonStubbedInstance<HttpService>;
    const mockConfig: IProviderConfig = {
        id: 'test-id',
        isSelected: true,
        apiKey: 'test-api-key',
        baseUrl: 'https://api.anthropic.com'
    };

    beforeEach(() => {
        mockHttpService = sinon.createStubInstance(HttpService);
        adapter = new AnthropicAdapter(mockConfig);
        (adapter as any).http = mockHttpService;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should list models', async () => {
        const mockResponse = { models: ['model1', 'model2'] };
        mockHttpService.get.resolves(mockResponse);

        const result = await adapter.listModels();

        assert.ok(mockHttpService.get.calledWith(`${mockConfig.baseUrl}/v1/models`, {
            'X-API-Key': mockConfig.apiKey!,
            'Content-Type': 'application/json'
        }));
        assert.deepStrictEqual(result, mockResponse);
    });

    it('should generate a message', async () => {
        const mockRequest: IGenerateRequest = {
            model: 'test-model',
            prompt: 'Hello'
        };
        const mockResponse = { id: '123', completion: 'Hi there!' };
        mockHttpService.post.resolves(mockResponse);

        const result = await adapter.generate(mockRequest);

        assert.ok(mockHttpService.post.calledWith(`${mockConfig.baseUrl}/v1/complete`, mockRequest, {
            'X-API-Key': mockConfig.apiKey!,
            'Content-Type': 'application/json'
        }));
        assert.deepStrictEqual(result, {
            id: '123',
            role: 'assistant',
            content: 'Hi there!',
            timestamp: sinon.match.date,
            model: 'test-model'
        });
    });

    it('should handle chat requests', async () => {
        const mockRequest: IChatRequest = {
            model: 'test-model',
            messages: []
        };
        const mockResponse = {
            id: '123',
            choices: [
                {
                    id: 'choice1',
                    message: { content: 'Hello!', tool_calls: [], images: [] }
                }
            ]
        };
        mockHttpService.post.resolves(mockResponse);

        const result = await adapter.chat(mockRequest);

        assert.ok(mockHttpService.post.calledWith(`${mockConfig.baseUrl}/v1/chat/completions`, mockRequest, {
            'X-API-Key': mockConfig.apiKey!,
            'Content-Type': 'application/json'
        }));
        assert.deepStrictEqual(result, {
            id: '123',
            messages: [
                {
                    id: 'choice1',
                    role: 'assistant',
                    content: 'Hello!',
                    timestamp: sinon.match.date,
                    model: 'test-model',
                    tool_calls: [],
                    images: []
                }
            ]
        });
    });
});