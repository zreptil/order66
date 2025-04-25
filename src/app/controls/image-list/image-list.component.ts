import {Component, Input} from '@angular/core';
import {TimeData} from '@/_model/time-data';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {UserType} from '@/_model/app-data';
import {DayData} from '@/_model/day-data';
import {Utils} from '@/classes/utils';
import {PictureData} from '@/_model/picture-data';
import {LinkPictureComponent} from '@/components/link-picture/link-picture.component';
import {DialogResultButton} from '@/_model/dialog-data';
import {MessageService} from '@/_services/message.service';
import {DlgBaseComponent} from '@/classes/base/dlg-base-component';
import {PlanData} from '@/_model/plan-data';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.scss',
  standalone: false
})
export class ImageListComponent extends DlgBaseComponent {
  @Input() day: DayData;
  @Input() time: TimeData;
  @Input() plan: PlanData;
  @Input() userType: UserType;
  @Input() isSitter: boolean;
  @Input() mayEdit: boolean;

  protected readonly Utils = Utils;

  constructor(globals: GlobalsService,
              public msg: MessageService) {
    super(globals, 'ImageList');
  }

  _imageList: PictureData[];

  get imageList(): PictureData[] {
    if (this._imageList == null && this.userType != null) {
      this._imageList = this.pictures.filter(e => (e.userType & this.userType) === this.userType);
    }
    return this._imageList;
  }

  get pictures(): PictureData[] {
    if (this.plan != null) {
      return this.plan.pictures;
    }
    if (this.time != null) {
      return this.time.pictures;
    }
    return null;
  }

  get mayEditImage(): boolean {
    return this.mayEdit && this.userType === (this.isSitter ? UserType.Sitter : UserType.Owner);
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
    evt.stopPropagation();
    const idx = this.time.pictures.findIndex(e => e.id === image.id);
    if (idx >= 0) {
      this.pictures.splice(idx, 1);
      this.pictures.splice(idx + diff, 0, image);
      this._imageList = null;
    }
  }

  clickEditTimeImage(evt: MouseEvent, image: PictureData) {
    evt.stopPropagation();
    this.msg.showPopup(LinkPictureComponent, 'settings', image).subscribe(result => {
      if (result?.btn === DialogResultButton.ok) {
        const idx = this.pictures.findIndex(e => +e.id === +image.id);
        if (idx >= 0) {
          this.pictures[idx].fillFromJson(result.data.asJson);
          this._imageList = null;
        }
      }
    })
  }

  clickDeleteTimeImage(evt: MouseEvent, picture: PictureData) {
    evt.stopPropagation();
    let name = '';
    if (this.plan == null) {
      name = ` ${$localize`from`} ${Utils.fmtDate(this.day?.date ?? new Date())} ${this.time?.typeName}`;
    }
    const msg = $localize`Delete the picture${name}?`;
    const idx = this.pictures.findIndex(e => +e.id === +picture.id);
    if (idx >= 0) {
      this.msg.confirm(msg).subscribe(result => {
        if (result?.btn === DialogResultButton.yes) {
          delete (this.pictures[idx]);
          this.reloadFromJson();
          this._imageList = null;
        }
      });
    }
  }

  reloadFromJson() {
    if (this.plan != null) {
      this.plan.fillFromJson(this.plan.asJson);
    } else if (this.time != null) {
      this.time.fillFromJson(this.time.asJson);
    }
  }

  clickAddImage(evt: MouseEvent) {
    evt.stopPropagation();
    const data = new PictureData({c: this.userType});
    this.msg.showPopup(LinkPictureComponent, 'settings', data).subscribe(result => {
      if (result?.btn === DialogResultButton.ok) {
        if (Array.isArray(result.data)) {
          this.pictures.push(...result.data);
        } else {
          const picture = new PictureData(result.data.asJson);
          this.pictures.push(picture);
        }
        this.reloadFromJson();
        this._imageList = null;
      }
    })
  }

  clickOpenImage(evt: MouseEvent, picture: PictureData) {
    evt.stopPropagation();
    GLOBALS.openLink(picture.url)
  }
}
