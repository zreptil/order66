import {Component, OnInit} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {SyncService} from '@/_services/sync/sync.service';
import {MessageService} from '@/_services/message.service';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {ImpressumComponent} from '@/components/impressum/impressum.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {BackendService} from '@/_services/backend.service';
import {SettingsComponent} from '@/components/settings/settings.component';
import {TypeUser, UserType} from '@/_model/app-data';
import {Utils} from '@/classes/utils';
import {DsgvoComponent} from '@/components/dsgvo/dsgvo.component';
import {EnvironmentService} from '@/_services/environment.service';
import {ImgurService} from '@/_services/oauth2/imgur.service';
import {GoogleService} from '@/_services/oauth2/google.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: false
})
export class MainComponent implements OnInit {
  closeData: CloseButtonData = {
    colorKey: 'main',
    showClose: false
  };
  readonly UserType = UserType;
  user: any;
  protected readonly Utils = Utils;

  constructor(public globals: GlobalsService,
              public msg: MessageService,
              public bs: BackendService,
              public sync: SyncService,
              public imgur: ImgurService,
              public google: GoogleService,
              public env: EnvironmentService) {
  }

  get classForHeader(): string[] {
    const ret = ['mat-elevation-z4'];
    if (GLOBALS.isDebug) {
      ret.push('debug');
    }
    return ret;
  }

  ngOnInit(): void {
    // this.google.login();
  }

  clickLocalTitle() {
    GLOBALS.isLocal = !GLOBALS.isLocal;
  }

  onClick(key: string) {
    switch (key) {
      case 'password':
        this.msg.changePassword();
        break;
      case 'whatsnew':
        this.msg.showPopup(WhatsNewComponent, 'whatsnew', {});
        break;
      case 'impressum':
        this.msg.showPopup(ImpressumComponent, 'impressum', {});
        break;
      case 'dsgvo':
        this.msg.showPopup(DsgvoComponent, 'dsgvo', {});
        break;
      case 'welcome':
        this.msg.showPopup(WelcomeComponent, 'welcome', {});
        break;
      case 'settings':
        this.msg.showPopup(SettingsComponent, 'settings', {});
        break;
      case 'logout':
        this.bs.logout(() => {
          GLOBALS.saveSharedData();
          this.msg.showPopup(WelcomeComponent, 'welcome', {});
        });
        break;
    }
  }

  clickType(type: TypeUser) {
    GLOBALS.currentUserType = type;
  }

  classForType(type: TypeUser): string[] {
    const ret: string[] = [];
    if (type.value === GLOBALS.currentUserType?.value) {
      ret.push('current');
    }
    return ret;
  }
}
