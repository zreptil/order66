import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {DropboxService} from '@/_services/sync/dropbox.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {Utils} from '@/classes/utils';
import {MatFormFieldAppearance} from '@angular/material/form-field';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PersonData} from '@/_model/person-data';
import {BackendService} from '@/_services/backend.service';
import {MessageService} from '@/_services/message.service';
import {EnvironmentService} from '@/_services/environment.service';
import {AppData} from '@/_model/app-data';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  closeData: CloseButtonData = {
    colorKey: 'welcome',
    showClose: false
  };
  hash: string;
  username: string;
  password: string;
  hide = true;
  @ViewChild('userName') userName!: ElementRef;
  appearance: MatFormFieldAppearance = 'fill';
  form?: FormGroup;
  controls: any = {
    username: {label: $localize`Username`},
    password: {label: $localize`Password`},
    firstname: {label: $localize`Firstname`},
    lastname: {label: $localize`Lastname`},
    email: {label: $localize`E-Mail`, validators: Validators.email},
    address1: {label: $localize`Address Line 1`},
    address2: {label: $localize`Address Line 2`},
    zip: {label: $localize`ZIP`},
    city: {label: $localize`City`},
  };

  constructor(public globals: GlobalsService,
              public bs: BackendService,
              public env: EnvironmentService,
              public dbs: DropboxService,
              public msg: MessageService) {
  }

  private _mode = 'login';

  get mode(): string {
    return this._mode;
  }

  set mode(value: string) {
    this._mode = value;
    setTimeout(() => this.userName?.nativeElement?.focus());
  }

  get btnSendTitle(): string {
    const titles: any = {
      login: $localize`Login`,
      register: $localize`Register`
    };
    return titles[this._mode] ?? 'doit';
  }

  get classForLogin(): string[] {
    const ret: string[] = [];
    if (this._mode === 'login') {
      ret.push('current');
    }
    return ret;
  };

  get classForRegister(): string[] {
    const ret: string[] = [];
    if (this._mode === 'register') {
      ret.push('current');
    }
    return ret;
  };

  ngOnInit() {
    Utils.hash('zugang').then(result => {
      this.hash = result;
    });
    const controls: any = {};
    for (const key of Object.keys(this.controls)) {
      const ctrl = this.controls[key];
      controls[key] = new FormControl(this.env.defaultLogin?.[key] ?? '', ctrl.validators);
    }
    this.form = new FormGroup(controls);
  }

  doSync() {
    this.dbs.connect();
  }

  clickHide(_evt: MouseEvent) {
    this.hide = !this.hide;
  }

  classForArea(mode: string): string[] {
    const ret: string[] = []
    if (this.mode !== mode) {
      ret.push('hidden');
    }
    return ret;
  }

  onSend() {
    switch (this.mode) {
      case 'login':
        this.submitLogin();
        break;
      case 'register':
        this.submitRegister();
        break;
    }
  }

  submitLogin() {
    if (this.form.get('username').errors == null
      && this.form.get('password').errors == null) {
      this.bs.login(this.form.value.username, this.form.value.password,
        (data) => {
          GLOBALS.appData = data.data;
          GLOBALS.appData.permissions = data.perm.split(',');
          GLOBALS.appData.usertype = data.type;
          GLOBALS.saveSharedData();
          this.msg.closePopup();
        },
        (error) => {
          console.error(error);
          this.msg.error($localize`Wrong username or password`);
        });
    }
  }

  submitRegister() {
    if (this.form.valid) {
      const person = new PersonData();
      for (const key of Object.keys(this.form.value)) {
        (person as any)[key] = this.form.value[key];
      }
      GLOBALS.appData ??= new AppData();
      GLOBALS.appData.person = person;
      this.bs.register(this.form.value.username, this.form.value.password, GLOBALS.appData,
        (data) => {
          GLOBALS.appData = data;
          GLOBALS.saveSharedData();
          this.msg.closePopup();
        },
        (error) => {
          console.error(error);
          if (error.status === 409) {
            this.msg.error($localize`The user with the name "${this.form.value.username}" already exists`);
          }
        });
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    evt.stopPropagation();
    if (evt.key === 'Enter') {
      this.submitLogin();
    }
  }
}
