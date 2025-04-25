import {AfterViewInit, Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {Observable, of} from 'rxjs';
import {DlgBaseComponent} from '@/classes/base/dlg-base-component';

@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
  styleUrls: ['./whats-new.component.scss'],
  standalone: false
})
export class WhatsNewComponent extends DlgBaseComponent implements AfterViewInit {

  checkId = +GLOBALS.version.replace('.', '');

  closeData: CloseButtonData = {
    viewInfo: this.name,
    colorKey: 'whatsnew',
    closeAction: (): Observable<boolean> => {
      GLOBALS.saveSharedData();
      return of(true);
    }
  }

  constructor(globals: GlobalsService) {
    super(globals, 'WhatsNew');
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
