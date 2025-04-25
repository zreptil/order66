import {Component, Inject} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {ControlList, PageService} from '@/_services/page.service';
import {DialogResult, DialogResultButton} from '@/_model/dialog-data';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {PictureData} from '@/_model/picture-data';
import {ImgurService} from '@/_services/oauth2/imgur.service';
import {Utils} from '@/classes/utils';
import {MessageService} from '@/_services/message.service';
import {Log} from '@/_services/log.service';
import {EnvironmentService} from '@/_services/environment.service';
import {DlgBaseComponent} from '@/classes/base/dlg-base-component';

@Component({
  selector: 'app-upload-image',
  templateUrl: './link-picture.component.html',
  styleUrl: './link-picture.component.scss',
  standalone: false
})
export class LinkPictureComponent extends DlgBaseComponent {
  imgurImages: any[] = [];
  imgurSelected: number[] = [];
  closeData: CloseButtonData = {
    viewInfo: this.name,
    colorKey: 'settings',
    showClose: true
  };

  controls: ControlList = {
    url: {label: $localize`Pictureurl`},
    info: {label: $localize`Information`},
  };

  pageName = 'uploadPicture';
  data: PictureData | PictureData[] = new PictureData();
  protected readonly Utils = Utils;

  constructor(globals: GlobalsService,
              public env: EnvironmentService,
              public ps: PageService,
              public imgur: ImgurService,
              public msg: MessageService,
              @Inject(MAT_DIALOG_DATA) public srcData: PictureData) {
    super(globals, 'LinkPicture');
    this.data = new PictureData(srcData.asJson);
    this.ps.initForm(this.pageName, this.controls, this.data);
  }

  get dialogResult(): DialogResult {
    if (this.isImgurSelector) {
      this.data = this.imgurImages.filter(e => this.imgurSelected.indexOf(e.id) >= 0)
        .map(e => new PictureData({a: e.link, c: this.srcData.userType}));
    } else {
      (this.data as PictureData).fillFromJson(this.srcData.asJson);
      this.ps.writeData(this.pageName);
    }
    return {btn: DialogResultButton.ok, data: this.data};
  }

  get imageSrc(): string {
    const ret = (this.data as PictureData)?.url;
    if (ret == null) {
      return null;
    }
    return ret;
  }

  get isImgurSelector(): boolean {
    return !Utils.isEmpty(this.imgurImages);
  }

  clickImgur(_evt: MouseEvent) {
    if (Utils.isEmpty(GLOBALS.appData?.person?.imgur?.at)) {
      if (GLOBALS.isLocal) {
        this.imgurImages = this.env.imgurPictures;
      } else {
        this.imgur.connect();
      }
    } else {
      this.imgur.getImages().subscribe({
        next: result => {
          console.log(result);
          if (result?.success) {
            this.imgurImages = result.data;
          }
        }, error: error => {
          if (GLOBALS.isLocal) {
            this.imgurImages = this.env.imgurPictures;
          }
          console.log(error);
          Log.error(error?.error?.data?.error);
        }
      });
    }
  }

  clickPaste(_evt: MouseEvent) {
    if (navigator?.clipboard != null) {
      navigator.clipboard.readText().then(text => {
        this.ps.writeFormValue(this.pageName, 'url', text);
      });
    }
  }

  selectImage(image: any): void {
    const idx = this.imgurSelected.indexOf(image.id);
    if (idx >= 0) {
      this.imgurSelected.splice(idx, 1);
    } else {
      this.imgurSelected.push(image.id);
    }
  }

  classForImage(image: any): string[] {
    const ret: string[] = ['image'];
    if (this.imgurSelected.indexOf(image.id) >= 0) {
      ret.push('selected');
    }
    return ret;
  }

  imageInfo(image: any): string[] {
    const ret: string[] = [];
    ret.push(Utils.fmtDateTime(new Date(+image.datetime * 1000)));
    if (!Utils.isEmpty(image.description)) {
      ret.push(image.description);
    }
    return ret;
  }

  clickSave(evt: MouseEvent) {
    evt.stopPropagation();
    this.msg.closePopup(this.dialogResult);
  }

  clickImportImgur(evt: MouseEvent) {
    evt.stopPropagation();
    const result = this.dialogResult;
    if (!Array.isArray(result.data) || result.data.length === 1) {
      this.data = new PictureData(this.srcData.asJson);
      (this.data as PictureData).url = (result.data as PictureData[])[0].url;
      this.ps.initForm(this.pageName, this.controls, this.data);
      this.imgurImages = null;
      this.imgurSelected = [];
    } else {
      this.clickSave(evt);
    }
  }

  clickCancel(evt: MouseEvent) {
    evt.stopPropagation();
    this.imgurImages = null;
    this.imgurSelected = [];
  }
}
