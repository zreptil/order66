import {Injectable} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn} from '@angular/forms';
import {Utils} from '@/classes/utils';

export type ControlList = { [key: string]: ControlDef };

export class ControlDef {
  label: string;
  value?: any;
  validators?: ValidatorFn | ValidatorFn[];
}

export class PageDef {
  form: FormGroup;
  data: any;
  controls: { [key: string]: ControlDef };
  adjustData?: (data: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private pages: { [key: string]: PageDef } = {};

  constructor() {
  }

  writeData(key: string) {
    const page = this.pages[key];
    if (page != null) {
      for (const subkey of Object.keys(page.controls)) {
        const parts = subkey.split('_');
        const value = page.form.controls[subkey].value;
        if (parts.length === 1) {
          page.data[subkey] = value;
        } else {
          page.data[parts[0]][parts[1]] = value;
        }
      }
      page.adjustData?.(page.data);
    }
  }

  initForm(key: string, src: ControlList, data: any, adjustData?: (data: any) => void): PageDef {
    if (Utils.isEmpty(key)) {
      return null;
    }
    const page = new PageDef();
    page.data = data ?? {};
    page.controls = {};
    page.adjustData = adjustData;
    const dst: { [key: string]: FormControl } = {};
    for (const subkey of Object.keys(src)) {
      const ctrl = src[subkey];
      page.controls[subkey] = ctrl;
      const parts = subkey.split('_');
      let value: any;
      if (parts.length === 1) {
        value = page.data[subkey];
      } else {
        value = page.data[parts[0]][parts[1]];
      }
      src[subkey].value = value;
      dst[subkey] = new FormControl(value, ctrl.validators);
    }
    page.form = new FormGroup(dst);
    this.pages[key] = page;
    return page;
  }

  deleteForm(key: string) {
    delete this.pages[key];
  }
}
