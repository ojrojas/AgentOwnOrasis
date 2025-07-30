import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: `message.component.html`,
  styleUrl: `message.component.scss`
})
export class MessageComponent implements OnInit {
  @Input() message!: Message;
  processedContent: string = '';

  ngOnInit() {
    this.processedContent = this.processMessageContent(this.message.content);
  }

  private processMessageContent(content: string): string {
    // Detectar y procesar bloques de código
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let processedContent = content;

    processedContent = processedContent.replace(codeBlockRegex, (match, language, code) => {
      const highlightedCode = language && Prism.languages[language]
        ? Prism.highlight(code.trim(), Prism.languages[language], language)
        : code.trim();

      return `<pre class="code-block"><code class="language-${language || 'text'}">${highlightedCode}</code></pre>`;
    });

    // Procesar código inline
    processedContent = processedContent.replace(/`([^`]+)`/g, '<code style="background-color: #404040; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');

    // Procesar texto en negrita
    processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convertir saltos de línea a párrafos
    const paragraphs = processedContent.split('\n\n');
    if (paragraphs.length > 1) {
      processedContent = paragraphs.map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br>')}</p>` : '').join('');
    } else {
      processedContent = processedContent.replace(/\n/g, '<br>');
    }

    return processedContent;
  }
}
