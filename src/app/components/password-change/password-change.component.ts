import {Component, OnInit} from '@angular/core';
import {GlobalsService} from '@/_services/globals.service';
import {BackendService} from '@/_services/backend.service';
import {MessageService} from '@/_services/message.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {EnvironmentService} from '@/_services/environment.service';
import {PageDef, PageService} from '@/_services/page.service';
import {Utils} from '@/classes/utils';
import {DlgBaseComponent} from '@/classes/base/dlg-base-component';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrl: './password-change.component.scss',
  standalone: false
})
export class PasswordChangeComponent extends DlgBaseComponent implements OnInit {

  hide = true;
  controls: any = {
    pwdOld: {label: $localize`Old Password`},
    pwdNew: {label: $localize`New Password`},
    pwdRep: {label: $localize`Repeat Password`},
  };
  closeData: CloseButtonData = {
    viewInfo: this.name,
    colorKey: 'password',
    showClose: true
  };
  page: PageDef;

  constructor(globals: GlobalsService,
              public bs: BackendService,
              public env: EnvironmentService,
              public ps: PageService,
              public msg: MessageService) {
    super(globals, 'PasswordChange');
  }

  ngOnInit() {
    this.page = this.ps.initForm('password', this.controls);
  }

  clickSave() {
    this.ps.writeData('password');
    console.log(this.page.data);
    let msg: string;
    if (Utils.isEmpty(this.page.data.pwdOld)
      || Utils.isEmpty(this.page.data.pwdNew)
      || Utils.isEmpty(this.page.data.pwdRep)) {
      msg = $localize`You have to enter something in every field`;
    } else if (this.page.data.pwdNew !== this.page.data.pwdRep) {
      msg = $localize`The password repetition does not match`;
    }
    if (msg != null) {
      this.msg.error(msg);
      return;
    }
    this.bs.changePassword(this.page.data.pwdOld, this.page.data.pwdNew,
      () => {
        this.msg.info($localize`The password was changed successfully`);
        this.msg.closePopup();
      }, (error: string) => {
        this.msg.error(error);
      });
  }
}
