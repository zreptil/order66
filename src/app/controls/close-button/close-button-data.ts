import {Observable} from 'rxjs';

export class CloseButtonData {
  viewInfo: string;
  closeAction?: () => Observable<boolean>;
  dialogClose?: any = 'ok';
  colorKey?: string;
  showClose?: boolean = true;
}
