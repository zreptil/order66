import {Component, Inject} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {ControlList, PageService} from '@/_services/page.service';
import {DialogResultButton} from '@/_model/dialog-data';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {PictureData} from '@/_model/picture-data';

@Component({
  selector: 'app-upload-image',
  templateUrl: './link-picture.component.html',
  styleUrl: './link-picture.component.scss'
})
export class LinkPictureComponent {
  closeData: CloseButtonData = {
    colorKey: 'settings',
    showClose: true
  };

  controls: ControlList = {
    url: {label: $localize`Pictureurl`},
    info: {label: $localize`Information`},
  };

  pageName = 'uploadPicture';
  data = new PictureData();

  constructor(public globals: GlobalsService,
              public ps: PageService,
              @Inject(MAT_DIALOG_DATA) public srcData: PictureData) {
    this.data.fillFromJson(srcData.asJson);
    this.ps.initForm(this.pageName, this.controls, this.data);
  }

  get dialogResult(): any {
    this.ps.writeData(this.pageName);
    return {btn: DialogResultButton.ok, data: this.data};
  }

  get imageSrc(): string {
    const ret = this.data?.url;
    if (ret == null) {
      return null;
    }
    return ret;
  }

  clickImgur(_evt: MouseEvent) {
    let url = `https://${GLOBALS.appData.person.imgurUsername}.imgur.com/all`;
    if (GLOBALS.appData.person?.imgurUsername == null) {
      url = 'https://imgur.com';
    }
    GLOBALS.openLink(url);
  }

  clickPaste(_evt: MouseEvent) {
    if (navigator?.clipboard != null) {
      navigator.clipboard.readText().then(text => {
        this.ps.writeFormValue(this.pageName, 'url', text);
      });
    }
  }
}
