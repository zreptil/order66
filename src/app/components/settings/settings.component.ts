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
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  closeData: CloseButtonData = {
    colorKey: 'settings',
    showClose: true
  };
  hash: string;
  username: string;
  password: string;
  hide = true;
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

  constructor(public globals: GlobalsService,
              public bs: BackendService,
              public env: EnvironmentService,
              public dbs: DropboxService,
              public msg: MessageService) {
  }

  ngOnInit() {
    Utils.hash('zugang').then(result => {
      this.hash = result;
    });
    const controls: any = {};
    for (const key of Object.keys(this.controls)) {
      const ctrl = this.controls[key];
      controls[key] = new FormControl((GLOBALS.appData.person as any)?.[key] ?? '', ctrl.validators);
    }
    this.form = new FormGroup(controls);
  }

  clickSave() {
    if (this.form.valid) {
      const person = new PersonData();
      for (const key of Object.keys(this.form.value)) {
        (person as any)[key] = this.form.value[key];
      }
      GLOBALS.appData ??= new AppData();
      GLOBALS.appData.person = person;
      this.bs.saveAppData(GLOBALS.appData,
        (data) => {
          GLOBALS.appData = data;
          GLOBALS.saveSharedData();
          this.msg.closePopup();
        },
        (error) => {
          console.error(error);
          this.msg.error($localize`Error when saving data - ${error}`);
        });
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    evt.stopPropagation();
    if (evt.key === 'Enter') {
      this.clickSave();
    }
  }
}
