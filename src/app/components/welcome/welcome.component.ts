import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  closeData: CloseButtonData = {
    colorKey: 'welcome'
  };
  hash: string;
  username: string;
  password: string;
  hide = true;
  @ViewChild('userName') userName!: ElementRef;
  appearance: MatFormFieldAppearance = 'fill';
  form?: FormGroup;
  controls: any = {
    username: {label: $localize`Username`, validators: Validators.required},
    password: {label: $localize`Password`, validators: Validators.required},
    firstname: {label: $localize`Firstname`, validators: Validators.required},
    lastname: {label: $localize`Lastname`, validators: Validators.required},
    email: {label: $localize`E-Mail`, validators: Validators.email},
    street: {label: $localize`Street`, validators: Validators.required},
    streetNo: {label: $localize`Street-No.`, validators: Validators.required},
    zip: {label: $localize`ZIP`, validators: Validators.required},
    city: {label: $localize`City`, validators: Validators.required},
  };
  protected readonly onsubmit = onsubmit;

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

  onSubmit() {
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
      Utils.hash(this.form.value.password).then((hash: string) => {
        // request a login at the backend
        this.bs.query({}, `auth|${this.form.value.username}|${hash}`)
          .subscribe({
            next: response => {
              // save token for future requests without login-data
              this.bs.token = response.u.token;
              this.bs.loadPerson((data) => {
                GLOBALS.saveSharedData();
                this.msg.closePopup();
              });
            },
            // request to login was rejected
            error: err => {
              console.error(err);
              this.msg.error($localize`Wrong username or password`);
            }
          })
      });
    }
  }

  submitRegister() {
    if (this.form.valid) {
      Utils.hash(this.form.value.password).then((hash: string) => {
        const user = new PersonData();
        user.firstname = this.form.value.firstname;
        user.lastname = this.form.value.lastname;
        user.email = this.form.value.email;
        user.street = this.form.value.street;
        user.streetNo = this.form.value.streetNo;
        user.zip = this.form.value.zip;
        user.city = this.form.value.city;
        console.log(user.asJson);
        const base64 = Utils.encodeBase64(user.asString);
        console.log(base64);
        console.log(Utils.decodeBase64(base64));
        console.log(hash);
        const u = new PersonData();
        u.fillFromString(Utils.decodeBase64(base64));
        console.log(u);
        GLOBALS.saveSharedData();
      });
    }
  }
}
