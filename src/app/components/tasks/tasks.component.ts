import {AfterViewInit, Component, Inject} from '@angular/core';
import {GlobalsService} from '@/_services/globals.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';
import {Utils} from '@/classes/utils';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MessageService} from '@/_services/message.service';
import {SitterPlan} from '@/_services/backend.service';
import {TimeData, TimeType} from '@/_model/time-data';

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
  protected readonly Utils = Utils;

  constructor(public globals: GlobalsService,
              public msg: MessageService,
              @Inject(MAT_DIALOG_DATA) public data: SitterPlan) {
  }

  ngAfterViewInit(): void {
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
}
