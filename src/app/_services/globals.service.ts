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
import {BackendService, SitterPlan} from '@/_services/backend.service';
import {AppData, TypeUser, UserType} from '@/_model/app-data';
import {PersonData} from '@/_model/person-data';
import {MatFormFieldAppearance} from '@angular/material/form-field';
import {ImgurService} from '@/_services/oauth2/imgur.service';
import {PlanData, PlanStatus} from '@/_model/plan-data';
import {DayData} from '@/_model/day-data';
import {FormConfig} from '@/forms/form-config';

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
  version = '1.1.3';
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
  listConfig: FormConfig[] = [];
  listConfigOrg: FormConfig[] = [];
  ownTheme: any;
  appearance: MatFormFieldAppearance = 'fill';
  currentUserType: TypeUser;
  themeList: any = {
    null: GlobalsService.msgThemeAuto,
    standard: GlobalsService.msgThemeStandard,
    xmas: GlobalsService.msgThemeXmas,
    own: GlobalsService.msgThemeOwn,
  }
  titles: any = {
    settings: $localize`Settings`,
    password: $localize`Passwordchange`,
    plan: $localize`Plan`,
    tasks: $localize`Tasks`,
    day: $localize`Daily Schedule`,
    dsgvo: $localize`Dataprotection`,
    help: $localize`Information`,
    impressum: $localize`Impressum`,
    welcome: $localize`Welcome to Order66`,
    whatsnew: $localize`Once upon a time...`,
    linkPicture: $localize`Link Picture`,
    imgurSelector: $localize`Imgur Picture Selector`,
  };
  urlPlayground = 'http://pdf.zreptil.de/playground.php';
  appData: AppData;
  sitterFetching = false;
  ownerFetching = false;
  saveImmediately = true;
  showCompleted = false;
  _styleForPanels: any = {};
  siteConfig: any = {
    gridColumns: 4,
    showPrimeNumbers: false,
    rubikView: 'three-d',
    rubikMode: '',
    rubikRotx: -30,
    rubikRoty: 30,
    rubikRotz: 0,
    rubikTurnSpeed: 0.2,
    rubikRecorded: '',
    pdfTarget: '',
    pdfData: null,
    ppPdfSameWindow: false
  }
  formListParams: any;
  private flags = '';

  constructor(public http: HttpClient,
              public sync: SyncService,
              public ls: LanguageService,
              public msg: MessageService,
              public bs: BackendService,
              public imgur: ImgurService,
              public env: EnvironmentService) {
    GLOBALS = this;
    this.loadWebData();
    const elem = document.querySelector('head>title');
    if (elem != null && this.isLocal) {
      elem.innerHTML = `${elem.innerHTML} (local)`;
    }
    this.loadSharedData().then(_ => {
      this.bs.loginByToken(
        (data) => {
          const ut = GLOBALS.currentUserType?.value;
          this.appData = new AppData();
          this.appData.fillFromBackend(data.data);
          this.appData.permissions = data.perm?.split(',').map((entry: string) => +entry);
          this.appData.usertype = data.type;
          this.currentUserType = GLOBALS.usertypeList.find(e => e.value === ut) ?? GLOBALS.usertypeList[0];
          if (this.storageVersion !== this.version) {
            this.msg.showPopup(WhatsNewComponent, 'whatsnew', {});
          } else {
            this.currentPage = 'main';
          }
          this.imgur.init();
        }, (_error) => {
          this.msg.showPopup(WelcomeComponent, 'welcome', {});
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
      this.bs.getPersonList(UserType.Sitter, (data) => {
        this._sitterList = data;
        this._sitterList.push(new PersonData({a: $localize`Toby`, b: $localize`Named`}));
        this.sitterFetching = false;
      });
    }
    return this._sitterList;
  }

  _ownerList: PersonData[];

  get ownerList(): PersonData[] {
    if (this._ownerList == null && !this.ownerFetching) {
      this.ownerFetching = true;
      this.bs.getPersonList(UserType.Owner, (data) => {
        this._ownerList = data;
        this._ownerList.push(new PersonData({a: $localize`Toby`, b: $localize`Named`}));
        this.ownerFetching = false;
      });
    }
    return this._ownerList;
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

  ownerData(plan: SitterPlan): string {
    const data = GLOBALS.ownerList?.find(
      (owner) => owner.fkUser === plan.ui);
    if (data?.phone != null) {
      return `${data.fullname} (${data.phone})`;
    }
    if (data?.city != null) {
      return `${data.fullname} (${data.address})`;
    }
    return `${data?.fullname}`;
  }

  owner(plan: SitterPlan): PersonData {
    return GLOBALS.ownerList?.find(
      (owner) => owner.fkUser === plan.ui);
  }

  ownerName(plan: SitterPlan): string {
    const data = GLOBALS.ownerList?.find(
      (owner) => owner.fkUser === plan.ui);
    return `${data?.fullname}`;
  }

  ownerInfo(plan: SitterPlan): string {
    const data = GLOBALS.ownerList?.find(
      (owner) => owner.fkUser === plan.ui);
    if (data?.phone != null) {
      return `${data.phone}`;
    }
    if (data?.city != null) {
      return `${data.address}`;
    }
    return '';
  }

  loadAppData() {
    this.bs.loadAppData((data) => {
      const ut = GLOBALS.currentUserType?.value;
      this.appData.fillFromJson(data.asJson);
      this.currentUserType = GLOBALS.usertypeList.find(e => e.value === ut) ?? GLOBALS.usertypeList[0];
    });
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

  saveImmediate(saveToAppData?: () => void, onDone?: () => void) {
    if (this.saveImmediately) {
      saveToAppData?.();
      this.bs.saveAppData(GLOBALS.appData,
        (data) => {
          const ut = GLOBALS.currentUserType?.value;
          GLOBALS.appData.fillFromJson(data.asJson);
          GLOBALS.appData.usertype = data.usertype;
          GLOBALS.currentUserType = GLOBALS.usertypeList.find(e => e.value === ut) ?? GLOBALS.usertypeList[0];
          GLOBALS.saveSharedData();
          onDone?.();
        },
        (error) => {
          console.error(error);
          this.msg.error($localize`Error when saving data - ${error}`);
        });
    }
  }

  openLink(url: string) {
    window.open(url, '_blank');
  }

  styleForPlan(plan: SitterPlan): any {
    if (this._styleForPanels[plan.ui] == null) {
      this._styleForPanels[plan.ui] = {};
      const owner = this.appData?.person?.owners?.[plan.ui];
      this._styleForPanels[plan.ui].backgroundColor = owner?.colorBack?.display ?? 'white';
      this._styleForPanels[plan.ui].color = owner?.colorFore?.display ?? 'black';
      this._styleForPanels[plan.ui]['--foreColor'] = this._styleForPanels[plan.ui].color;
      this._styleForPanels[plan.ui]['--backColor'] = this._styleForPanels[plan.ui].backgroundColor;
    }
    return this._styleForPanels[plan.ui];
  }

  statusIcon(plan: PlanData) {
    const icons: any = {
      0: 'thumb_down',
      1: 'thumb_up'
    };
    return icons[plan.status ?? 0];
  }

  statusInfo(plan: PlanData) {
    if (Utils.isEmpty(plan.statusInfo)) {
      plan.statusInfo = null;
    }
    switch (plan.status) {
      case PlanStatus.accepted:
        return plan.statusInfo ?? $localize`${plan.sitterPerson?.firstname} accepted the plan`;
      case PlanStatus.denied:
        return plan.statusInfo ?? $localize`${plan.sitterPerson?.firstname} denied the plan`;
    }
  }

  hasActions(day: DayData) {
    return day.timeRanges.some(e => e.actions?.length > 0);
  }

  loadFormListParams(): void {
    if (this.formListParams != null) {
      for (const cfg of this.listConfig) {
        cfg.fillFromString(this.formListParams[cfg.form.dataId] ?? {});
      }
      for (const cfg of this.listConfigOrg) {
        cfg.fillFromString(this.formListParams[cfg.form.dataId] ?? {});
      }
    }
  }

  private may(key: string): boolean {
    return this.flags.indexOf(`|${key}|`) >= 0;
  }
}

export class PeriodShift {
  constructor(public title: string, public months: number) {
  }
}

