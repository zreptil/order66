import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MatFormFieldAppearance} from '@angular/material/form-field';
import {FormGroup, Validators} from '@angular/forms';
import {PersonData} from '@/_model/person-data';
import {BackendService} from '@/_services/backend.service';
import {MessageService} from '@/_services/message.service';
import {EnvironmentService} from '@/_services/environment.service';
import {PersonFormData} from '@/controls/person-form/person-form.component';
import {PageService} from '@/_services/page.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  closeData: CloseButtonData = {
    colorKey: 'settings',
    showClose: true
  };
  username: string;
  password: string;
  @ViewChild('userName') userName!: ElementRef;
  appearance: MatFormFieldAppearance = 'fill';
  form?: FormGroup;
  controls: any = {
    firstname: {label: $localize`Firstname`},
    lastname: {label: $localize`Lastname`},
    email: {label: $localize`E-Mail`, validators: Validators.email},
    address1: {label: $localize`Address Line 1`},
    address2: {label: $localize`Address Line 2`},
    zip: {label: $localize`ZIP`},
    city: {label: $localize`City`},
  };
  personData: PersonFormData;
  pageKeyPerson = 'person';

  constructor(public globals: GlobalsService,
              public bs: BackendService,
              public ps: PageService,
              public env: EnvironmentService,
              public msg: MessageService) {
  }

  ngOnInit() {
    this.personData = {
      person: new PersonData(GLOBALS.appData.person.asJson),
      usertype: GLOBALS.appData.usertype
    };
  }

  clickSave() {
    this.ps.writeData(this.pageKeyPerson);
    GLOBALS.appData.person.fillFromJson(this.personData.person.asJson);
    GLOBALS.appData.usertype = this.personData.usertype;
    this.bs.saveAppData(GLOBALS.appData,
      (data) => {
        GLOBALS.appData.fillFromJson(data.asJson);
        GLOBALS.appData.usertype = data.usertype;
        GLOBALS.currentUserType = GLOBALS.usertypeList[0];
        GLOBALS.saveSharedData();
        this.msg.closePopup();
      },
      (error) => {
        console.error(error);
        this.msg.error($localize`Error when saving data - ${error}`);
      });
    return;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    evt.stopPropagation();
    if (evt.key === 'Enter') {
      this.clickSave();
    }
  }
}
