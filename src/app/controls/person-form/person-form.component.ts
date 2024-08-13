import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {Validators} from '@angular/forms';
import {MessageService} from '@/_services/message.service';
import {EnvironmentService} from '@/_services/environment.service';
import {PersonData} from '@/_model/person-data';
import {ControlList, PageService} from '@/_services/page.service';
import {Utils} from '@/classes/utils';
import {DialogResultButton} from '@/_model/dialog-data';
import {ImgurService} from '@/_services/oauth2/imgur.service';

export class PersonFormData {
  person: PersonData;
  usertype: number;
}

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss']
})
export class PersonFormComponent implements OnInit, AfterViewInit {
  usertype: number;
  controls: ControlList = {
    person_firstname: {label: $localize`Firstname`},
    person_lastname: {label: $localize`Lastname`},
    person_email: {label: $localize`E-Mail`, validators: Validators.email},
    person_address1: {label: $localize`Address Line 1`},
    person_address2: {label: $localize`Address Line 2`},
    person_zip: {label: $localize`ZIP`},
    person_city: {label: $localize`City`},
    person_phone: {label: $localize`Phone`},
    person_imgurUsername: {label: $localize`Username on imgur`},
    usertype: {label: $localize`I am`},
  };
  @Input() startFocus: string;
  protected readonly Utils = Utils;

  constructor(public globals: GlobalsService,
              public ps: PageService,
              public imgur: ImgurService,
              public env: EnvironmentService,
              public msg: MessageService) {
  }

  private _pageName: string;

  get pageName(): string {
    return this._pageName;
  }

  @Input()
  set pageName(value: string) {
    this.ps.deleteForm(this._pageName);
    this._pageName = value;
    this.ps.initForm(this._pageName, this.controls, this._data, this.adjustData.bind(this));
  }

  _data: PersonFormData;

  @Input() set data(value: PersonFormData) {
    this._data = value;
    this.ps.initForm(this._pageName, this.controls, this._data, this.adjustData.bind(this));
  }

  adjustData(data: any): void {
    data.usertype = this.usertype;
  }

  hasUsertype(type: number): boolean {
    return (+this.controls['usertype'].value & type) === type;
  }

  setFocus(timeout = 0): void {
    setTimeout(() => {
      (document.querySelector(`#${this.startFocus}`) as HTMLInputElement)?.focus();
    }, timeout);
  }

  ngAfterViewInit() {
    this.setFocus(100);
  }

  ngOnInit() {
  }

  toggleUsertype(value: number) {
    this.usertype = (+this.usertype) ^ +value;
  }

  clickImgur(_evt: MouseEvent) {
    if (Utils.isEmpty(this._data.person.imgur.at)) {
      this.imgur.connect();
    } else {
      this.msg.confirm($localize`Do you really want to disconnect from Imgur?`).subscribe({
        next: (result) => {
          if (result?.btn === DialogResultButton.yes) {
            this.imgur.disconnect();
            this._data.person.fillFromJson(GLOBALS.appData.person);
          }
        }
      });
    }
  }
}
