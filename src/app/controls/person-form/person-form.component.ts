import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {GlobalsService} from '@/_services/globals.service';
import {MatFormFieldAppearance} from '@angular/material/form-field';
import {Validators} from '@angular/forms';
import {MessageService} from '@/_services/message.service';
import {EnvironmentService} from '@/_services/environment.service';
import {PersonData} from '@/_model/person-data';
import {ControlList, PageDef, PageService} from '@/_services/page.service';

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
  appearance: MatFormFieldAppearance = 'fill';
  page: PageDef;
  usertype: number;
  controls: ControlList = {
    person_firstname: {label: $localize`Firstname`},
    person_lastname: {label: $localize`Lastname`},
    person_email: {label: $localize`E-Mail`, validators: Validators.email},
    person_address1: {label: $localize`Address Line 1`},
    person_address2: {label: $localize`Address Line 2`},
    person_zip: {label: $localize`ZIP`},
    person_city: {label: $localize`City`},
    usertype: {label: $localize`I am`},
  };
  @Input() startFocus: string;

  constructor(public globals: GlobalsService,
              public ps: PageService,
              public env: EnvironmentService,
              public msg: MessageService) {
  }

  private _pageName: string;

  @Input()
  set pageName(value: string) {
    this.ps.deleteForm(this._pageName);
    this._pageName = value;
    this.page = this.ps.initForm(this._pageName, this.controls, this._data, this.adjustData.bind(this));
  }

  _data: PersonFormData;

  @Input() set data(value: PersonFormData) {
    this._data = value;
    this.page = this.ps.initForm(this._pageName, this.controls, this._data, this.adjustData.bind(this));
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
    this.setFocus(500);
  }

  ngOnInit() {
  }

  // submitRegister() {
  //   if (this.form.valid) {
  //     const person = new PersonData();
  //     for (const key of Object.keys(this.form.value)) {
  //       (person as any)[key] = this.form.value[key];
  //     }
  //     GLOBALS.appData ??= new AppData(1);
  //     GLOBALS.appData.person = person;
  //     this.bs.register(this.form.value.username, this.form.value.password, this.usertype, GLOBALS.appData,
  //       (data) => {
  //         GLOBALS.appData = data;
  //         GLOBALS.saveSharedData();
  //         this.msg.closePopup();
  //       },
  //       (error) => {
  //         console.error(error);
  //         if (error.status === 409) {
  //           this.msg.error($localize`The user with the name "${this.form.value.username}" already exists`);
  //         }
  //       });
  //   }
  // }

  toggleUsertype(value: number) {
    this.usertype = (+this.usertype) ^ +value;
  }
}