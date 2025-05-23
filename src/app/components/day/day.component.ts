import {AfterViewInit, Component, Inject} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';
import {Utils} from '@/classes/utils';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DayData} from '@/_model/day-data';
import {TimeData} from '@/_model/time-data';
import {ActionData} from '@/_model/action-data';
import {MessageService} from '@/_services/message.service';
import {DialogResultButton} from '@/_model/dialog-data';
import {PlanData} from '@/_model/plan-data';
import {DlgBaseComponent} from '@/classes/base/dlg-base-component';

@Component({
  selector: 'app-plan',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss'],
  standalone: false
})
export class DayComponent extends DlgBaseComponent implements AfterViewInit {

  closeData: CloseButtonData = {
    viewInfo: this.name,
    colorKey: 'settings',
    showClose: true
  };
  readonly DatepickerPeriod = DatepickerPeriod;
  edit = {action: -1, time: -1};
  protected readonly Utils = Utils;

  constructor(globals: GlobalsService,
              public msg: MessageService,
              @Inject(MAT_DIALOG_DATA) public data: { plan: PlanData, day: DayData }) {
    super(globals, 'Day');
  }

  get msgCopy(): string {
    if (this.data?.day?.id > 1) {
      return $localize`Copy from previous Day`;
    }
    return $localize`Copy from previous Plan`;
  }

  get mayEdit(): boolean {
    return Utils.isAfter(this.data?.day?.date ?? Utils.now, Utils.now);
  }

  ngAfterViewInit(): void {
  }

  clickAddTimerange(evt: MouseEvent) {
    evt.stopPropagation();
    this.data.day.timeRanges ??= [];
    const time = new TimeData({
      0: this.data.day.timeRanges.length + 1,
      a: this.data.day.timeRanges.length < 2 ? this.data.day.timeRanges.length : 2
    });
    this.clickAddAction(evt, time);
    this.data.day.timeRanges.push(time);
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

  timeDescription(time: TimeData) {
    return Utils.plural(time.actions?.length ?? 0, {
      0: $localize`No Instructions`,
      1: $localize`1 Instruction`,
      other: $localize`${time.actions?.length} Instructions`,
    });
  }

  clickDeleteAction(evt: MouseEvent, action: ActionData, time: TimeData) {
    evt.stopPropagation();
    let msg = $localize`Do you want to delete this Instruction?`;
    this.msg.confirm(msg).subscribe(result => {
      if (result?.btn === DialogResultButton.yes) {
        time.actions.splice(time.actions.findIndex(a => a.id === action.id), 1);
        GLOBALS.saveImmediate(() => {
          const plan = GLOBALS.appData.plans.find(p => p.id === this.data.plan.id);
          if (plan != null) {
            const idx = plan.days.findIndex(d => d.id === this.data.day.id);
            if (idx >= 0) {
              plan.days[idx] = this.data.day;
            }
          }
        });
      }
    });
  }

  clickEditAction(evt: MouseEvent, action: ActionData, time: TimeData) {
    evt.stopPropagation();
    if (this.edit.action === action.id && this.edit.time === time.id) {
      this.edit.action = -1;
    } else {
      this.edit = {action: action.id, time: time.id};
    }
  }

  clickCopyAction(evt: MouseEvent, time: TimeData) {
    evt.stopPropagation();
    if (this.data.day.id > 1) {
      const yesterday = this.data.plan.days.find(d => d.id === this.data.day.id - 1);
      if (yesterday != null) {
        time.actions = yesterday.timeRanges.find(t => t.type === time.type)?.actions?.map(a => {
          const ret = new ActionData();
          ret.fillFromJson(a.asJson);
          ret.done = false;
          return ret;
        });
      }
    } else if (this.data.plan.id > 1) {
      const lastPlan = GLOBALS.appData.plans.find(p => p.id === this.data.plan.id - 1);
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
