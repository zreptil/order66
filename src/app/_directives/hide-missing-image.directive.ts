import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[hideMissingImage]'
})
export class HideMissingImageDirective {
  constructor(private el: ElementRef) {
  }

  @HostListener('error')
  private onError() {
    setTimeout(() => this.el.nativeElement.style.display = 'none');
  }

  @HostListener('load')
  private onLoad() {
    setTimeout(() => this.el.nativeElement.style.display = 'initial');
  }
}
