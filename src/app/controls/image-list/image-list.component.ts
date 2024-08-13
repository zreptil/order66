import {Component, Input} from '@angular/core';
import {TimeData} from '@/_model/time-data';
import {GlobalsService} from '@/_services/globals.service';
import {UserType} from '@/_model/app-data';
import {DayData} from '@/_model/day-data';
import {Utils} from '@/classes/utils';
import {PictureData} from '@/_model/picture-data';
import {LinkPictureComponent} from '@/components/upload-image/link-picture.component';
import {DialogResultButton} from '@/_model/dialog-data';
import {MessageService} from '@/_services/message.service';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.scss'
})
export class ImageListComponent {
  @Input() day: DayData;
  @Input() time: TimeData;
  @Input() userType: UserType;
  @Input() isSitter: boolean;

  protected readonly Utils = Utils;

  constructor(public globals: GlobalsService,
              public msg: MessageService) {

  }

  _imageList: PictureData[];

  get imageList(): PictureData[] {
    if (this._imageList == null && this.time != null && this.userType != null) {
      this._imageList = this.time.pictures.filter(e => (e.userType & this.userType) === this.userType);
    }
    return this._imageList;
  }

  get mayEditImage(): boolean {
    return this.userType === (this.isSitter ? UserType.Sitter : UserType.Owner);
  }

  get classForInfo(): string[] {
    const ret: string[] = [];
    if (this.isSitter && this.userType !== UserType.Sitter) {
      ret.push('ownerInfo');
    } else if (!this.isSitter && this.userType !== UserType.Owner) {
      ret.push('sitterInfo');
    }

    return ret;
  }

  clickImageMove(evt: MouseEvent, image: PictureData, diff: number) {
    const idx = this.time.pictures.findIndex(e => e.id === image.id);
    if (idx >= 0) {
      this.time.pictures.splice(idx, 1);
      this.time.pictures.splice(idx + diff, 0, image);
      this._imageList = null;
    }
  }

  clickEditTimeImage(evt: MouseEvent, image: PictureData) {
    this.msg.showPopup(LinkPictureComponent, 'settings', image).subscribe(result => {
      if (result?.btn === DialogResultButton.ok) {
        const idx = this.time.pictures.findIndex(e => +e.id === +image.id);
        if (idx >= 0) {
          this.time.pictures[idx].fillFromJson(result.data.asJson);
          this._imageList = null;
        }
      }
    })
  }

  clickDeleteTimeImage(evt: MouseEvent, picture: PictureData) {
    const msg = $localize`Delete the picture from ${Utils.fmtDate(this.day.date)} ${this.time.typeName}?`;
    const idx = this.time.pictures.findIndex(e => +e.id === +picture.id);
    if (idx >= 0) {
      this.msg.confirm(msg).subscribe(result => {
        if (result?.btn === DialogResultButton.yes) {
          delete (this.time.pictures[idx]);
          this.time.fillFromJson(this.time.asJson);
          this._imageList = null;
        }
      });
    }
  }

  clickAddImage(_evt: MouseEvent) {
    const data = new PictureData({c: this.userType});
    this.msg.showPopup(LinkPictureComponent, 'settings', data).subscribe(result => {
      if (result?.btn === DialogResultButton.ok) {
        if (Array.isArray(result.data)) {
          this.time.pictures.push(...result.data);
        } else {
          const picture = new PictureData(result.data.asJson);
          this.time.pictures.push(picture);
        }
        this.time.fillFromJson(this.time.asJson);
        this._imageList = null;
      }
    })
  }
}
