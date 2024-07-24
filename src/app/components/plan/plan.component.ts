import {AfterViewInit, Component, Inject} from '@angular/core';
import {GlobalsService} from '@/_services/globals.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';
import {Utils} from '@/classes/utils';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {PlanData} from '@/_model/plan-data';
import {DayData} from '@/_model/day-data';

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

  constructor(public globals: GlobalsService,
              @Inject(MAT_DIALOG_DATA) public data: PlanData) {
    if (data.period?.start == null) {
      data.period.minDate = new Date();
      data.period.maxDate = Utils.addDateMonths(new Date(), 12);
    }
    this.onPeriodChange(data.period);
  }

  ngAfterViewInit(): void {
  }

  onPeriodChange(period: DatepickerPeriod) {
    this.data.period = period;
    this.data.days = [];
    let day = period.start;
    if (day == null) {
      return;
    }
    while (Utils.isOnOrBefore(day, period.end)) {
      this.data.days.push(new DayData({a: Utils.fmtDate(day, 'yyyyMMdd')}));
      day = Utils.addDateDays(day, 1);
    }
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
}
