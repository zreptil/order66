import {DialogData, DialogParams, DialogResult, DialogResultButton, DialogType, IDialogDef} from '@/_model/dialog-data';
import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {map, Observable, of} from 'rxjs';
import {DialogComponent} from '@/components/dialog/dialog.component';
import {ComponentType} from '@angular/cdk/overlay';
import {PasswordChangeComponent} from '@/components/password-change/password-change.component';
import {GLOBALS} from '@/_services/globals.service';
import {DlgBaseComponent} from '@/classes/base/dlg-base-component';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private dlgRef: MatDialogRef<any>;
  private popupDlgRef: MatDialogRef<any>;

  constructor(private dialog: MatDialog) {
  }

  closePopup(result?: DialogResult): void {
    this.popupDlgRef?.close(result);
  }

  info(content: string | string[], params?: DialogParams): Observable<DialogResult> {
    return this.showDialog(DialogType.info, content, false, params);
  }

  error(content: string | string[], params?: DialogParams): Observable<DialogResult> {
    return this.showDialog(DialogType.error, content, false, params);
  }

  confirm(content: string | string[], params?: DialogParams): Observable<DialogResult> {
    return this.showDialog(DialogType.confirm, content, false, params);
  }

  ask(content: string | string[], type: IDialogDef, params?: DialogParams): Observable<DialogResult> {
    return this.showDialog(type, content, false, params);
  }

  showPopup(dlg: ComponentType<DlgBaseComponent>, id: string, data: any): Observable<DialogResult> {
    GLOBALS.removeFocus();
    this.popupDlgRef = this.dialog.open(dlg, {
      data: data,
      panelClass: ['dialog-box', id],
      disableClose: true
    });
    return this.popupDlgRef.afterClosed().pipe(map(data => {
      return data;
    }));
  }

  showDialog(type: DialogType | IDialogDef, content: string | string[], disableClose = false, params?: DialogParams): Observable<DialogResult> {
    params ??= new DialogParams();
    // console.error(content);
    if (content == null || content === '' || content.length === 0) {
      const ret = new DialogResult();
      ret.btn = DialogResultButton.cancel;
      console.error('Es soll ein leerer Dialog angezeigt werden');
      return of(ret);
    }
    if (this.dlgRef?.componentInstance == null) {
      const cls = ['dialog-box', 'dialog'];
      if (typeof type === 'number') {
        cls.push(DialogType[type]);
      } else {
        cls.push(DialogType[type.type]);
      }
      GLOBALS.removeFocus();
      this.dlgRef = this.dialog.open(DialogComponent, {
        panelClass: cls,
        data: new DialogData(type, content, params, null),
        disableClose
      });
      this.dlgRef.keydownEvents().subscribe(event => {
        if (event.code === 'Escape') {
          this.dlgRef.close({btn: DialogResultButton.abort});
          this.dlgRef = null;
        }
      });
      if (!disableClose) {
        this.dlgRef.backdropClick().subscribe(_ => {
          this.dlgRef.close({btn: DialogResultButton.abort});
          this.dlgRef = null;
        });
      }
    } else {
      (this.dlgRef.componentInstance as DialogComponent).update(content);
    }

    return this.dlgRef.afterClosed();
  }

  changePassword() {
    this.showPopup(PasswordChangeComponent, 'password', null).subscribe(_result => {

    });
  }
}
