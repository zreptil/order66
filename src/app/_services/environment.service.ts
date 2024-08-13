import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {GLOBALS} from '@/_services/globals.service';
import {Utils} from '@/classes/utils';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  isProduction: boolean = false;
  OAUTH2_CLIENT_ID: string = null;
  DROPBOX_APP_KEY: string = null;
  IMGUR_APP_KEY: string = null;
  backendUrl: string = null;
  settingsFilename: string = null;
  defaultLogin: any = null;

  urlParams: any = {};
  hashParams: any = {};

  appType: string;
  appParams: any = {};
  imgurPictures: any[];

  constructor() {
    for (const key of Object.keys(environment)) {
      (this as any)[key] = (environment as any)[key];
    }
    for (let scan of [
      {src: location.search.replace(/^\?/, '').split('&'), dst: this.urlParams},
      {src: location.hash.replace(/^#/, '').split('&'), dst: this.hashParams}
    ]) {
      for (const p of scan.src) {
        const parts = p.split('=');
        if (!Utils.isEmpty(parts[0])) {
          scan.dst[parts[0]] = parts[1];
        }
      }
    }
    setTimeout(() => {
      if (this.urlParams['enableDebug'] === 'true') {
        localStorage.setItem(GLOBALS.debugFlag, GLOBALS.debugActive);
        location.href = location.origin;
      } else if (this.urlParams['enableDebug'] === 'false') {
        localStorage.removeItem(GLOBALS.debugFlag);
        location.href = location.origin;
      }
    }, 1000);
    const temp = window.location.hash?.substring(1);
    this.appType = temp;
    const pos = this.appType.indexOf('?');
    if (pos > 0) {
      this.appType = temp.substring(0, pos);
      const parts = temp.substring(pos + 1).split('&');
      for (const part of parts) {
        const p = part.split('=');
        if (p.length === 1) {
          this.appParams[p[0]] = true;
        } else if (p.length === 2) {
          this.appParams[p[0]] = decodeURIComponent(p[1]);
        }
      }
    }
  }
}
