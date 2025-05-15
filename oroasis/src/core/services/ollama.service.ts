import { GenerateRequest, Ollama } from 'ollama';
import * as vscode from 'vscode';

export class OllamaApiService {
    readonly ollama: Ollama;
    templateGenerate: string | undefined;
    constructor() {
        const settings = vscode.workspace.getConfiguration("oroasisSettings");
        this.templateGenerate = settings.get('templatePromptGenerate');
        this.ollama = new Ollama({ host: settings.get('ollamaBaseUrl') });
        const models = this.listModels();
        models.then(response => {
            if(response.models.length){}
        })
    }

    listModels = () => {
        return this.ollama.list();
    };

    generate = (request: GenerateRequest) => {
        return this.ollama.generate({
            model: request.model,
            prompt: request.prompt,
            template: this.templateGenerate
        });
    };

}