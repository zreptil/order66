import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {SyncService} from '@/_services/sync/sync.service';
import {MessageService} from '@/_services/message.service';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {ImpressumComponent} from '@/components/impressum/impressum.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {BackendService} from '@/_services/backend.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  closeData: CloseButtonData = {
    colorKey: 'main',
    showClose: false
  };

  constructor(public globals: GlobalsService,
              public msg: MessageService,
              public bs: BackendService,
              public sync: SyncService) {
  }

  get classForHeader(): string[] {
    const ret = ['mat-elevation-z4'];
    if (GLOBALS.isDebug) {
      ret.push('debug');
    }
    return ret;
  }

  clickLocalTitle() {
    GLOBALS.isLocal = !GLOBALS.isLocal;
  }

  onClick(key: string) {
    switch (key) {
      case 'whatsnew':
        this.msg.showPopup(WhatsNewComponent, 'whatsnew', {});
        break;
      case 'impressum':
        this.msg.showPopup(ImpressumComponent, 'impressum', {});
        break;
      case 'welcome':
        this.msg.showPopup(WelcomeComponent, 'welcome', {});
        break;
      case 'logout':
        this.bs.logout();
        GLOBALS.saveSharedData();
        this.msg.showPopup(WelcomeComponent, 'welcome', {});
        break;
    }
  }
}
