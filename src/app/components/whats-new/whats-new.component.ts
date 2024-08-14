import {AfterViewInit, Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {Observable, of} from 'rxjs';

@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
  styleUrls: ['./whats-new.component.scss']
})
export class WhatsNewComponent implements AfterViewInit {

  checkId = +GLOBALS.version.replace('.', '');

  closeData: CloseButtonData = {
    colorKey: 'whatsnew',
    closeAction: (): Observable<boolean> => {
      GLOBALS.saveSharedData();
      return of(true);
    }
  }

  constructor(public globals: GlobalsService) {
  }

  get originUrl(): string {
    return location.origin.replace(/\/$/, '');
  }

  classFor(id: number): string[] {
    const ret: string[] = [];
    if (id !== +this.checkId) {
      // ret.push('hidden');
    }
    return ret;
  }

  ngAfterViewInit(): void {
  }

  click(id: number): void {
    this.checkId = id;
  }
}
