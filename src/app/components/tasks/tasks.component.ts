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
  protected readonly Utils = Utils;

  constructor(public globals: GlobalsService,
              public msg: MessageService,
              @Inject(MAT_DIALOG_DATA) public data: SitterPlan) {
  }

  get isSitter(): boolean {
    return this.data.pi != null;
  }

  ngAfterViewInit(): void {
  }

  mayEdit(day?: DayData): boolean {
    if (day == null) {
      return Utils.isAfter(this.data?.p?.period?.end ?? Utils.now, Utils.now);
    }
    return Utils.isAfter(day?.date ?? Utils.now, Utils.now);
  }

  timeDescription(time: TimeData) {
    return Utils.plural(time.actions?.length ?? 0, {
      0: $localize`No Instructions`,
      1: $localize`1 Instruction`,
      other: $localize`${time.actions?.length} Instructions`,
    });
  }

  isCurrentTimeRange(date: Date, time: TimeData) {
    const now = Utils.now;
    if (Utils.isBefore(date, now)) {
      return true;
    } else if (Utils.isSameDay(date, now)) {
      switch (time.type) {
        case TimeType.morning:
          return now.getHours() < 12;
        case TimeType.evening:
          return now.getHours() >= 12;
        case TimeType.eventually:
          return true;
      }
    }
    return false;
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

  clickDeleteAction(evt: MouseEvent, day: DayData, action: ActionData, time: TimeData) {
    evt.stopPropagation();
    let msg = $localize`Do you want to delete this Instruction?`;
    this.msg.confirm(msg).subscribe(result => {
      if (result?.btn === DialogResultButton.yes) {
        time.actions.splice(time.actions.findIndex(a => a.id === action.id), 1);
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
          time.actions = lastDay.timeRanges.find(t => t.type === time.type)?.actions?.map(a => {
            const ret = new ActionData();
            ret.fillFromJson(a.asJson);
            ret.done = false;
            return ret;
          });
        }
      }
    }
  }

  classForDone(action: ActionData): string[] {
    const ret: string[] = ['check'];
    if (action.done) {
      ret.push('done');
    }
    return ret;
  }
}
