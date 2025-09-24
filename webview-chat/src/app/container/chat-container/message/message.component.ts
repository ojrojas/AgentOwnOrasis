import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import { IMessage } from '../../../core/types/message.type';
import { CommonModule } from '@angular/common';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);

interface IMessageBlock {
  type: 'thinking' | 'content';
  html: string;
}

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [MatCardModule, MatExpansionModule, CommonModule],
  templateUrl: `message.component.html`,
  styleUrl: `message.component.scss`
})
export class MessageComponent implements OnInit {
  @Input() message!: IMessage;
  blocks: IMessageBlock[] = [];

  ngOnInit() {
    this.blocks = this.splitIntoBlocks(this.message.content);
  }

  private splitIntoBlocks(content: string): IMessageBlock[] {
    const blocks: IMessageBlock[] = [];
    const regex = /<think>([\s\S]*?)<\/think>/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: 'content',
          html: this.formatText(content.slice(lastIndex, match.index))
        });
      }
      blocks.push({
        type: 'thinking',
        html: this.formatText(match[1])
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      blocks.push({
        type: 'content',
        html: this.formatText(content.slice(lastIndex))
      });
    }

    return blocks;
  }

  private formatText(text: string): string {
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;

    let processed = text.replace(codeBlockRegex, (match, language, code) => {
      let highlighted = code.trim();

      if (language && hljs.getLanguage(language)) {
        highlighted = hljs.highlight(code.trim(), { language }).value;
      } else {
        highlighted = hljs.highlightAuto(code.trim()).value;
      }

      return `<pre class="hljs"><code class="language-${language}">${highlighted}</code></pre>`;
    });

    processed = processed.replace(/`([^`]+)`/g, `<code class="inline-code">$1</code>`);
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    const paragraphs = processed.split('\n\n');
    if (paragraphs.length > 1) {
      processed = paragraphs.map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br>')}</p>` : '').join('');
    } else {
      processed = processed.replace(/\n/g, '<br>');
    }

    return processed;
  }
}
