import {AfterViewInit, Component, Inject} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';
import {Utils} from '@/classes/utils';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MessageService} from '@/_services/message.service';
import {SitterPlan} from '@/_services/backend.service';
import {TimeData, TimeType} from '@/_model/time-data';
import {DayData} from '@/_model/day-data';
import {ActionData} from '@/_model/action-data';
import {DialogResultButton} from '@/_model/dialog-data';
import {EnumPermission} from '@/components/type-admin/type-admin.component';
import {LinkPictureComponent} from '@/components/upload-image/link-picture.component';
import {PictureData} from '@/_model/picture-data';

@Component({
  selector: 'app-plan',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements AfterViewInit {

  closeData: CloseButtonData = {
    colorKey: 'plan',
    showClose: true
  };
  // period: DatepickerPeriod = new DatepickerPeriod();
  weeks: any[];
  readonly DatepickerPeriod = DatepickerPeriod;
  edit = {action: -1, time: -1};
  _mayEdit = false;
  protected readonly Utils = Utils;
  protected readonly EnumPermission = EnumPermission;

  constructor(public globals: GlobalsService,
              public msg: MessageService,
              @Inject(MAT_DIALOG_DATA) public data: SitterPlan) {
  }

  get isSitter(): boolean {
    return this.data.pi != null;
  }

  isToday(date: Date): boolean {
    return Utils.isToday(date);
  }

  ngAfterViewInit(): void {
  }

  mayEdit(day?: DayData): boolean {
    if (this._mayEdit) {
      return true;
    }
    if (day == null) {
      return Utils.isOnOrAfter(this.data?.p?.period?.end ?? Utils.now, Utils.now);
    }
    return Utils.isOnOrAfter(day?.date ?? Utils.now, Utils.now);
  }

  timeDescription(time: TimeData) {
    return Utils.plural(time.actions?.length ?? 0, {
      0: $localize`No Instructions`,
      1: $localize`1 Instruction`,
      other: $localize`${time.actions?.length} Instructions`,
    });
  }

  clickAddAction(evt: MouseEvent, time: TimeData) {
    evt.stopPropagation();
    time.actions ??= [];
    const action = new ActionData({
      0: time.actions.length + 1
    });
    time.actions.push(action);
    this.edit = {action: action.id, time: time.id};
  }

  clickEditAction(evt: MouseEvent, action: ActionData, time: TimeData) {
    evt.stopPropagation();
    if (this.edit.action === action.id && this.edit.time === time.id) {
      this.edit.action = -1;
    } else {
      this.edit = {action: action.id, time: time.id};
    }
  }

  saveImmediate(day: DayData): void {
    GLOBALS.saveImmediate(() => {
      const plan = GLOBALS.appData.plans.find(p => p.id === this.data.p.id);
      if (plan != null) {
        const idx = plan.days.findIndex(d => d.id === day.id);
        if (idx >= 0) {
          plan.days[idx] = day;
        }
      }
    });
  }

  clickDeleteTimeActions(evt: MouseEvent, day: DayData, time: TimeData) {
    evt.stopPropagation();
    const msg = $localize`Do you want to delete all Instructions from ${Utils.fmtDate(day.date)} ${time.typeName}?`;
    this.msg.confirm(msg).subscribe(result => {
      if (result?.btn === DialogResultButton.yes) {
        time.actions = [];
        this.saveImmediate(day);
      }
    });
  }

  clickDeleteAction(evt: MouseEvent, day: DayData, action: ActionData, time: TimeData) {
    evt.stopPropagation();
    const msg = $localize`Do you want to delete this Instruction?`;
    this.msg.confirm(msg).subscribe(result => {
      if (result?.btn === DialogResultButton.yes) {
        time.actions.splice(time.actions.findIndex(a => a.id === action.id), 1);
        this.saveImmediate(day);
      }
    });
  }

  clickCopyAction(evt: MouseEvent, day: DayData, time: TimeData) {
    evt.stopPropagation();
    if (day.id > 1) {
      const yesterday = this.data.p.days.find(d => d.id === day.id - 1);
      if (yesterday != null) {
        time.actions = yesterday.timeRanges.find(t => t.type === time.type)?.actions?.map(a => {
          const ret = new ActionData();
          ret.fillFromJson(a.asJson);
          ret.done = false;
          return ret;
        });
      }
    } else if (this.data.p.id > 1) {
      const lastPlan = GLOBALS.appData.plans.find(p => p.id === this.data.p.id - 1);
      if (lastPlan != null) {
        const lastDay = lastPlan.days.reverse().find(d => d.timeRanges.some(t => t.type === time.type));
        if (lastDay != null) {
          time.actions = lastDay.timeRanges
            .find(t => t.type === time.type)?.actions?.map(a => {
              const ret = new ActionData();
              ret.fillFromJson(a.asJson);
              ret.done = false;
              return ret;
            });
        }
      }
    }
  }

  classForDone(action: ActionData, day: DayData): string[] {
    const ret: string[] = ['check'];
    if (action.done) {
      ret.push('done');
    } else if (!this.isToday(day.date)) {
      ret.push('notdone');
    }
    return ret;
  }

  msgCopy(day: DayData): string {
    if (day?.id > 1) {
      return $localize`Copy from previous Day`;
    }
    return $localize`Copy from previous Plan`;
  }

  isDayExpanded(day: DayData): boolean {
    return !this.isSitter || Utils.isSameDay(day.date, Utils.now);
  }

  isTimeExpanded(day: DayData, time: TimeData) {
    const now = Utils.now;
    if ((day as any).forceOpen) {
      return true;
    }
    if (Utils.isBefore(day.date, now)) {
      return true;
    } else if (Utils.isSameDay(day.date, now)) {
      switch (time.type) {
        case TimeType.morning:
          return now.getHours() < 12;
        case TimeType.evening:
          return now.getHours() >= 12;
        case TimeType.eventually:
          return true;
      }
    }
    return !this.isSitter;
  }

  expandDay(isOpen: boolean, day: DayData) {
    (day as any).forceOpen = isOpen;
  }

  clickAddImage(evt: MouseEvent, day: DayData, time: TimeData) {
    const data = new PictureData();
    this.msg.showPopup(LinkPictureComponent, 'settings', data).subscribe(result => {
      if (result?.btn === DialogResultButton.ok) {
        const picture = new PictureData(result.data.asJson);
        time.pictures.push(picture);
        time.fillFromJson(time.asJson);
      }
    })
  }

  clickDeleteTimeImage(evt: MouseEvent, day: DayData, time: TimeData, picture: PictureData) {
    const msg = $localize`Delete the picture from ${Utils.fmtDate(day.date)} ${time.typeName}?`;
    const idx = time.pictures.findIndex(e => +e.id === +picture.id);
    if (idx >= 0) {
      this.msg.confirm(msg).subscribe(result => {
        if (result?.btn === DialogResultButton.yes) {
          delete (time.pictures[idx]);
          time.fillFromJson(time.asJson);
        }
      });
    }
  }

  iconForDone(action: ActionData, day: DayData) {
    if (action.done) {
      return 'done';
    }
    if (this.isToday(day?.date)) {
      return 'check_box_outline_blank';
    }
    return 'close';
  }

  clickEditTimeImage(evt: MouseEvent, day: DayData, time: TimeData, image: PictureData) {
    this.msg.showPopup(LinkPictureComponent, 'settings', image).subscribe(result => {
      if (result?.btn === DialogResultButton.ok) {
        const idx = time.pictures.findIndex(e => +e.id === +image.id);
        if (idx >= 0) {
          time.pictures[idx].fillFromJson(result.data.asJson);
        }
      }
    })
  }
}
