import {Injectable} from '@angular/core';
import {Utils} from '@/classes/utils';
import {Log} from '@/_services/log.service';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {lastValueFrom, throwError, timeout} from 'rxjs';
import {oauth2SyncType} from '@/_services/sync/oauth2pkce';
import {LangData} from '@/_model/lang-data';
import {SyncService} from '@/_services/sync/sync.service';
import {LanguageService} from '@/_services/language.service';
import {EnvironmentService} from '@/_services/environment.service';
import {MessageService} from '@/_services/message.service';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {BackendService} from '@/_services/backend.service';
import {AppData, TypeUser, UserType} from '@/_model/app-data';
import {PersonData} from '@/_model/person-data';

class CustomTimeoutError extends Error {
  constructor() {
    super('It was too slow');
    this.name = 'CustomTimeoutError';
  }
}

export let GLOBALS: GlobalsService;

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {
  version = '1.0';
  skipStorageClear = false;
  devSupport = false;
  debugFlag = 'debug';
  debugActive = 'yes';
  isConfigured = false;
  dragPos: any = {};
  themeChanged = false;
  editColors = false;
  appMode = 'standard';
  editPart: string;
  maxLogEntries = 20;
  storageVersion: string;
  currentPage: string;
  language: LangData;
  _syncType: oauth2SyncType;
  oauth2AccessToken: string = null;
  ownTheme: any;
  currentUserType: TypeUser;
  themeList: any = {
    null: GlobalsService.msgThemeAuto,
    standard: GlobalsService.msgThemeStandard,
    xmas: GlobalsService.msgThemeXmas,
    own: GlobalsService.msgThemeOwn,
  }
  titles: any = {
    settings: $localize`Settings`,
    plan: $localize`Plan`,
    dsgvo: $localize`Dataprotection`,
    help: $localize`Information`,
    impressum: $localize`Impressum`,
    welcome: $localize`Welcome to Order66`,
    whatsnew: $localize`Once upon a time...`
  };
  appData: AppData;
  sitterFetching = false;
  private flags = '';

  constructor(public http: HttpClient,
              public sync: SyncService,
              public ls: LanguageService,
              public ms: MessageService,
              public bs: BackendService,
              public env: EnvironmentService) {
    GLOBALS = this;
    this.loadWebData();
    this.loadSharedData().then(_ => {
      this.bs.loginByToken(
        (data) => {
          this.appData = new AppData();
          this.appData.fillFromBackend(data.data);
          this.appData.permissions = data.perm?.split(',');
          this.appData.usertype = data.type;
          this.currentUserType = this.usertypeList[0];
          if (this.storageVersion !== this.version) {
            this.ms.showPopup(WhatsNewComponent, 'whatsnew', {});
          } else {
            this.currentPage = 'main';
          }
        }, (_error) => {
          this.ms.showPopup(WelcomeComponent, 'welcome', {});
        });
    });
  }

  static _msgThemeOwn = $localize`:theme selection - own|:Own`;

  static get msgThemeOwn(): string {
    return GlobalsService._msgThemeOwn;
  }

  static set msgThemeOwn(value: string) {
    GlobalsService._msgThemeOwn = value;
  }

  static get msgThemeAuto(): string {
    return $localize`:theme selection - automatic|:Automatic`;
  }

  static get msgThemeStandard(): string {
    return $localize`:theme selection - standard|:Standard`;
  }

  static get msgThemeXmas(): string {
    return $localize`:theme selection - christmas|:X-Mas`;
  }

  _sitterList: PersonData[];

  get sitterList(): PersonData[] {
    if (this._sitterList == null && !this.sitterFetching) {
      this.sitterFetching = true;
      this.bs.getSitterList((data) => {
        this._sitterList = data;
        this.sitterFetching = false;
      });
    }
    return this._sitterList;
  }

  _isDebug = false;

  get isDebug(): boolean {
    return this._isDebug && Log.mayDebug;
  }

  set isDebug(value: boolean) {
    if (!Log.mayDebug) {
      value = false;
    }
    this._isDebug = value;
  }

  get mayDebug(): boolean {
    return Log.mayDebug;
  }

  get mayEdit(): boolean {
    return this.may('edit');
  }

  get isAdmin(): boolean {
    return this.may('admin');
  }

  get runsLocal(): boolean {
    return window.location.href.indexOf('/localhost:') >= 0;
  }

  _isLocal = window.location.href.indexOf('/localhost:') >= 0;

  get isLocal(): boolean {
    return this._isLocal;
  }

  set isLocal(value: boolean) {
    this._isLocal = value;
  }

  get appTitle(): string {
    return document.querySelector('head>title').innerHTML;
  }

  get themeName(): string {
    return this.themeList[this._theme];
  }

  _theme: string;

  get theme(): string {
    let ret = this.baseThemeName(this._theme);
    if (ret === 'own') {
      return GlobalsService.msgThemeOwn;
    }
    return ret;
  }

  set theme(value: string) {
    if (this.themeList[value] != null) {
      this._theme = value;
    } else {
      this._theme = 'own';
      GlobalsService.msgThemeOwn = value;
    }
  }

  get themeKey(): string {
    if (Utils.isEmpty(this._theme)) {
      const ret = this.baseThemeName(this._theme);
      if (!Utils.isEmpty(ret)) {
        return ret;
      }
    }
    if (this.themeList[this._theme] != null) {
      return this._theme;
    }
    return 'own';
  }

  get usertypeList(): TypeUser[] {
    const ret: TypeUser[] = [];
    for (const key of Object.keys(AppData.UserTypes)) {
      const type = AppData.UserTypes[key];
      if (GLOBALS.appData?.usertype & type.value) {
        ret.push(type);
      }
    }
    return ret;
  }

  get currentUsertypes(): string {
    const ret: string[] = [];
    for (const key of Object.keys(AppData.UserTypes)) {
      const type = AppData.UserTypes[key];
      if (GLOBALS.appData?.usertype & type.value) {
        ret.push(type.label);
      }
    }
    return Utils.join(ret, ', ');
  }

  get usertypes(): any[] {
    const ret: any[] = [];
    for (const key of Object.keys(AppData.UserTypes)) {
      const type = AppData.UserTypes[key];
      if (type.value !== UserType.Admin) {
        ret.push(type);
      }
    }
    return ret;
  }

  get listPeriodShift(): PeriodShift[] {
    return [
      new PeriodShift($localize`Selected Period`, 0),
      new PeriodShift($localize`One Month ago`, 1),
      new PeriodShift($localize`Two Months ago`, 2),
      new PeriodShift($localize`Three Months ago`, 3),
      new PeriodShift($localize`Six Months ago`, 6),
      new PeriodShift($localize`One Year ago`, 12)
    ];
  }

  _currPeriodShift: PeriodShift;

  get currPeriodShift(): PeriodShift {
    if (this._currPeriodShift == null) {
      this._currPeriodShift = this.listPeriodShift[0];
    }
    return this._currPeriodShift;
  }

  async loadSharedData() {
    let storage: any = {};
    try {
      storage = JSON.parse(localStorage.getItem('sharedData')) ?? {};
    } catch {
    }
    let syncData: any = await this.sync.downloadFile(this.env.settingsFilename);
    if (syncData != null) {
      try {
        if (+syncData.s0 > +storage.s0) {
          storage = syncData;
        }
      } catch {
      }
    }

    this.storageVersion = storage.s1;
    // validate values
    this.bs.token = storage.s2;
  }

  saveSharedData(): void {
    const storage: any = {
      s0: Date.now(),
      s1: this.version,
      s2: this.bs.token
    };
    const data = JSON.stringify(storage);
    localStorage.setItem('sharedData', data);
    if (this.sync.hasSync) {
      this.sync.uploadFile(this.env.settingsFilename, data);
    }
  }

  loadWebData(): void {
    let storage: any = {};
    try {
      storage = JSON.parse(localStorage.getItem('webData')) ?? {};
    } catch {
    }

    const code = storage.w0 ?? 'en-GB';
    this.language = this.ls.languageList.find((lang) => lang.code === code);
    this._syncType = storage.w1 ?? oauth2SyncType.none;
    this.oauth2AccessToken = storage.w2;
    this.theme = storage.w3 ?? 'standard';
    this.devSupport = storage.w4 ?? false;

    // validate values
    if (this.oauth2AccessToken == null) {
      this._syncType = oauth2SyncType.none;
    }
  }

  saveWebData(): void {
    const storage: any = {
      w0: this.language.code ?? 'de_DE',
      w1: this._syncType,
      w2: this.oauth2AccessToken,
      w3: this.theme,
      w4: this.devSupport
    };
    localStorage.setItem('webData', JSON.stringify(storage));
  }

  async requestJson(url: string, params?: { method?: string, options?: any, body?: any, showError?: boolean, asJson?: boolean, timeout?: number }) {
    return this.request(url, params).then(response => {
      return response?.body;
    });
  }

  async request(url: string, params?: { method?: string, options?: any, body?: any, showError?: boolean, asJson?: boolean, timeout?: number }) {
    params ??= {};
    params.method ??= 'get';
    params.showError ??= true;
    params.asJson ??= false;
    params.timeout ??= 1000;
    let response;
    const req = new HttpRequest(params.method, url,
      null,
      params.options);
    try {
      switch (params.method.toLowerCase()) {
        case 'post':
          response = await lastValueFrom(this.http.post(url, params.body, params.options).pipe(timeout({
            each: params.timeout,
            with: () => throwError(() => new CustomTimeoutError())
          })));
          break;
        default:
          response = await lastValueFrom(this.http.request(req).pipe(timeout({
            each: params.timeout,
            with: () => throwError(() => new CustomTimeoutError())
          })));
          break;
      }
    } catch (ex: any) {
      if (ex instanceof CustomTimeoutError) {
        response = $localize`There was no answer within ${params.timeout / 1000} seconds at ${url}`;
      } else if (ex?.messge != null) {
        response = ex.message;
      } else {
        response = ex;
      }
    }
    return params.asJson ? response.body : response;
  }

  baseThemeName(name: string): string {
    if (Utils.isEmpty(name)) {
      if (Utils.now.getMonth() === 11) {
        return 'xmas';
      } else {
        return 'standard';
      }
    }
    return name;
  }

  private may(key: string): boolean {
    return this.flags.indexOf(`|${key}|`) >= 0;
  }
}

export class PeriodShift {
  constructor(public title: string, public months: number) {
  }
}

