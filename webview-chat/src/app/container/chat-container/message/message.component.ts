import { Component, Input, OnInit, SecurityContext } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Registra solo los lenguajes necesarios
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: `message.component.html`,
  styleUrl: `message.component.scss`
})
export class MessageComponent implements OnInit {
  @Input() message!: Message;
  processedContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.processedContent = this.processMessageContent(this.message.content);
  }

  private processMessageContent(content: string): SafeHtml {
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;

    let processedContent = content.replace(codeBlockRegex, (match, language, code) => {
      let highlighted = code.trim();

      if (language && hljs.getLanguage(language)) {
        highlighted = hljs.highlight(code.trim(), { language }).value;
      } else {
        highlighted = hljs.highlightAuto(code.trim()).value;
      }

      return `<pre class="hljs"><code class="language-${language}">${highlighted}</code></pre>`;
    });

    // Código inline
    processedContent = processedContent.replace(/`([^`]+)`/g, `<code class="inline-code">$1</code>`);

    // Negrita
    processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Párrafos
    const paragraphs = processedContent.split('\n\n');
    if (paragraphs.length > 1) {
      processedContent = paragraphs.map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br>')}</p>` : '').join('');
    } else {
      processedContent = processedContent.replace(/\n/g, '<br>');
    }

    return this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(processedContent)) || '';
  }
}
