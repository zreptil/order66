import {Injectable} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn} from '@angular/forms';
import {Utils} from '@/classes/utils';
import {MatFormFieldAppearance} from '@angular/material/form-field';

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
  appearance: MatFormFieldAppearance = 'fill';
  private pages: { [key: string]: PageDef } = {};

  constructor() {
  }

  page(key: string): PageDef {
    return this.pages[key];
  }

  writeFormValue(pageKey: string, ctrlKey: string, value: any) {
    const page = this.page(pageKey);
    if (page != null) {
      page.form?.controls[ctrlKey]?.setValue(value);
      this._writeValue(pageKey, ctrlKey, value);
    }
  }

  writeData(key: string) {
    const page = this.pages[key];
    if (page != null) {
      for (const ctrlKey of Object.keys(page.controls)) {
        this._writeValue(key, ctrlKey, page.form.controls[ctrlKey]?.value);
      }
      page.adjustData?.(page.data);
    }
  }

  initForm(key: string, src: ControlList, data?: any, adjustData?: (data: any) => void): PageDef {
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

  private _writeValue(pageKey: string, ctrlKey: string, value: any) {
    const page = this.page(pageKey);
    if (page != null) {
      page.data ??= {};
      const parts = ctrlKey.split('_');
      if (parts.length === 1) {
        page.data[ctrlKey] = value;
      } else {
        page.data[parts[0]][parts[1]] = value;
      }
    }
  }
}
