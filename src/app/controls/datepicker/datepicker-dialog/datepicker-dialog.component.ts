import {Component, Inject, OnInit} from '@angular/core';
import {Utils} from '@/classes/utils';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DatepickerData} from '../datepicker-month/datepicker-data';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {of} from 'rxjs';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';
import {DatepickerEntry} from '@/controls/datepicker/datepicker-entry';
import {GlobalsService} from '@/_services/globals.service';
import {DlgBaseComponent} from '@/classes/base/dlg-base-component';

@Component({
  selector: 'app-datepicker-dialog',
  templateUrl: './datepicker-dialog.component.html',
  styleUrls: ['./datepicker-dialog.component.scss'],
  standalone: false
})
export class DatepickerDialogComponent extends DlgBaseComponent implements OnInit {

  closeData: CloseButtonData = {
    viewInfo: this.name,
    closeAction: () => {
      this.revertData.bind(this);
      return of(true);
    },
    colorKey: 'datepicker'
  };

  constructor(globals: GlobalsService,
              @Inject(MAT_DIALOG_DATA) public data: DatepickerData) {
    super(globals, 'DatepickerDialog');
  }

  get isMaxMonth(): boolean {
    return this.data.period != null &&
      this.data.period.maxDate != null &&
      this.data.month != null &&
      (this.data.month.getFullYear() > this.data.period.maxDate.getFullYear() ||
        (this.data.month.getFullYear() === this.data.period.maxDate.getFullYear() &&
          this.data.month.getMonth() >= this.data.period.maxDate.getMonth()));
  }

  get isMinMonth(): boolean {
    return this.data.period != null &&
      this.data.period.minDate != null &&
      this.data.month != null &&
      (this.data.month.getFullYear() < this.data.period.minDate.getFullYear() ||
        (this.data.month.getFullYear() === this.data.period.minDate.getFullYear() &&
          this.data.month.getMonth() <= this.data.period.minDate.getMonth()));
  }

  get msgStartIncorrect(): string {
    return $localize`The startdate is not correct`;
  }

  // set startDate(value: string) {
  //   const saveDate = this.period.start;
  //   try {
  //     this.period.start = Date.parse(value, period.dateFormat);
  //     this.period.entryKey = null;
  //     this.isStartValid = true;
  //   } catch (ex) {
  //     this.period.start = saveDate;
  //     this.isStartValid = false;
  //   }
  // }

  get msgEndIncorrect(): string {
    return $localize`The enddate is not correct`; // Das Enddatum ist nicht korrekt`;
  }

  get startDate(): string {
    return Utils.fmtDate(this.data.period.start);
  }

//   set endDate(value: string) {
//   try {
//   this.period.end = Date.parse(value, period.dateFormat);
//     this.period.entryKey = null;
//     this.isEndValid = true;
// } catch (ex) {
//     this.isEndValid = false;
// }
// }
  get showShift(): boolean {
    return this.data.period.entryKey != null && this.data.period.entryKey !== 'today'
  }

  get endDate(): string {
    return Utils.fmtDate(this.data.period.end);
  }

  get shiftName(): string {
    return DatepickerPeriod.shiftNames[this.data.period.shiftDate ?? 0];
  }

  get classForTitle(): string[] {
    const ret = [];
    if (this.data.period.isEmpty) {
      ret.push('empty');
    }
    return ret;
  }

  ngOnInit(): void {
    this.data.month = this.data.period.start ?? this.data.month;
  }

  revertData(): void {
    this.data.period.reset(this.data.loadedPeriod);
  }

  setMonth(value: Date) {
    if (value != null) {
      this.data.month = value;
    }
  }

  onShortcutClick(item: DatepickerEntry) {
    item.fill(this.data.period);
    this.data.month = this.data.period.end;
  }

  onShiftClick() {
    let value = this.data.period.shiftDate + 1;
    if (value < 0) {
      value = 0;
    }
    if (value >= DatepickerPeriod.shiftNames.length) {
      value = 0;
    }
    this.data.period.shiftDate = value;
    this.data.period.refresh();
  }

  addMonths(value: number) {
    this.data.month = Utils.addDateMonths(this.data.month, value);
  }

  clickClear() {
    this.data.period.entryKey = null;
    this.data.period.start = null;
  }
}
