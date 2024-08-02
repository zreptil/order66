import {AfterViewInit, Component, Inject} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';
import {Utils} from '@/classes/utils';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {PlanData} from '@/_model/plan-data';
import {DayData} from '@/_model/day-data';
import {MessageService} from '@/_services/message.service';
import {DayComponent} from '@/components/day/day.component';
import {TimeType} from '@/_model/time-data';
import {TasksComponent} from '@/components/tasks/tasks.component';
import {SitterPlan} from '@/_services/backend.service';
import {EnumPermission} from '@/components/type-admin/type-admin.component';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})
export class PlanComponent implements AfterViewInit {

  closeData: CloseButtonData = {
    colorKey: 'plan',
    showClose: true
  };
  // period: DatepickerPeriod = new DatepickerPeriod();
  weeks: any[];
  readonly DatepickerPeriod = DatepickerPeriod;
  protected readonly Utils = Utils;
  protected readonly EnumPermission = EnumPermission;

  constructor(public globals: GlobalsService,
              public msg: MessageService,
              @Inject(MAT_DIALOG_DATA) public data: PlanData) {
    if (data.period?.start == null) {
      data.period.minDate = new Date();
      data.period.maxDate = Utils.addDateMonths(new Date(), 12);
    }
    this.onPeriodChange(data.period);
  }

  _mayEdit = false;
  get mayEdit(): boolean {
    return this._mayEdit || Utils.isAfter(this.data?.period?.end, Utils.now) || this.data?.period?.end == null;
  }

  ngAfterViewInit(): void {
  }

  onPeriodChange(period: DatepickerPeriod) {
    this.data.period = period;
    this.data.days ??= [];
    let day = period.start;
    if (day == null) {
      return;
    }
    while (Utils.isOnOrBefore(day, period.end)) {
      const date = Utils.fmtDate(day, 'yyyyMMdd');
      const found = this.data.days.find(d => Utils.fmtDate(d.date, 'yyyyMMdd') === date);
      if (!found) {
        this.data.days.push(new DayData({a: date}));
      }
      day = Utils.addDateDays(day, 1);
    }
    this.data.days = this.data.days.reduce((acc, day) => {
      if (Utils.isOnOrAfter(day.date, period.start)
        && Utils.isOnOrBefore(day.date, period.end)) {
        acc.push(day);
      }
      return acc;
    }, [] as DayData[]);
    this.data.days.sort((a, b) => a.date.getTime() - b.date.getTime());
    let i = 1;
    this.data.days = this.data.days.map(d => {
      d.id = i++;
      return d;
    });
    const weeks: any[] = [];
    let idx = Utils.getDow(period.start);
    let row: any = {key: -1, days: []};
    let key = 0;
    while (row.days.length < idx) {
      row.days.push({key: key++, day: null});
    }
    weeks.push(row);
    for (const day of this.data?.days ?? []) {
      if (idx === 0) {
        row = {key: weeks.length, days: []};
        weeks.push(row);
      }
      row.days.push({key: key++, day: day});
      idx++;
      if (idx > 6) {
        idx = 0;
      }
    }
    this.weeks = weeks;
  }

  clickDay(evt: MouseEvent, day: any) {
    evt.stopPropagation();
    const data = new DayData();
    data.fillFromJson(day.day.asJson);
    this.msg.showPopup(DayComponent, 'day', {plan: this.data, day: data}).subscribe(result => {
      if (result?.btn === 'save') {
        const idx = this.data.days.findIndex(d => d.id === result.data.day.id);
        if (idx >= 0) {
          this.data.days[idx] = result.data.day;
          this.onPeriodChange(this.data.period);
        }
        GLOBALS.saveImmediate(() => {
          const idx = GLOBALS.appData.plans.findIndex(p => p.id === this.data.id);
          if (idx >= 0) {
            GLOBALS.appData.plans[idx] = this.data;
          }
        });
      }
    });
  }

  clickTasks(evt: MouseEvent) {
    evt.stopPropagation();
    const data: SitterPlan = {ui: 0, ai: 0, pi: null, p: this.data};
    this.msg.showPopup(TasksComponent, 'tasks', data).subscribe(result => {
      if (result?.btn === 'save') {
        this.data.fillFromJson(result.data.p.asJson);
        GLOBALS.saveImmediate(() => {
          const idx = GLOBALS.appData.plans.findIndex(p => p.id === this.data.id);
          if (idx >= 0) {
            GLOBALS.appData.plans[idx] = this.data;
          }
        });
      }
    });
  }

  styleForDay(day: DayData): any {
    const ret: string[] = ['white 0%'];
    let time = day.timeRanges?.find(t => t.type === TimeType.morning && t.actions?.length > 0);
    if (time != null) {
      if (time.actions?.filter(a => a.done)?.length === time.actions?.length) {
        ret.push('green 0%');
      } else {
        ret.push('var(--bodyBack) 0%');
      }
    }
    time = day.timeRanges?.find(t => t.type === TimeType.eventually && t.actions?.length > 0);
    if (time != null) {
      if (time.actions?.filter(a => a.done)?.length === time.actions?.length) {
        ret.push('lime 33%, lime 66%');
      } else {
        ret.push('silver 33%, silver 66%');
      }
    } else {
      ret.push('white 33%, white 66%');
    }
    time = day.timeRanges?.find(t => t.type === TimeType.evening && t.actions?.length > 0);
    if (time != null) {
      if (time.actions?.filter(a => a.done)?.length === time.actions?.length) {
        ret.push('green 100%');
      } else {
        ret.push('var(--bodyBack) 100%');
      }
    }
    ret.push('white 100%');
    return {
      background: `linear-gradient(90deg, ${Utils.join(ret, ', ')})`,
      border: '1px solid rgba(0,0,0,0.3)'
    };
  }
}
