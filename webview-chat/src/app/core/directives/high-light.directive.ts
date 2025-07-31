import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import hljs from 'highlight.js';

@Directive({
  selector: '[appHighLight]'
})
export class HighLightDirective implements AfterViewInit {

  @Input('appHighlight') language?: string;

  constructor(private el: ElementRef<HTMLElement>) { }

  ngAfterViewInit(): void {
    const element = this.el.nativeElement;

    if (this.language) {
      element.classList.add(this.language);
    }

    hljs.highlightElement(element);
  }
}
