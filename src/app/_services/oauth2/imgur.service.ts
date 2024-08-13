import {Injectable} from '@angular/core';
import {EnvironmentService} from '@/_services/environment.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Oauth2pkce} from '@/_services/sync/oauth2pkce';
import {map, Observable} from 'rxjs';
import {MessageService} from '@/_services/message.service';
import {DialogParams, DialogResultButton} from '@/_model/dialog-data';
import {GLOBALS} from '@/_services/globals.service';
import {ImgurData} from '@/_model/imgur-data';

export enum oauthStatus {
  none,
  accessDenied,
  accessToken,
  hasAccessToken
}

export enum imgurStatus {
  ok,
  error,
  info
}

export class ImgurStatus {
  constructor(public status?: imgurStatus,
              public text?: string) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class ImgurService {
  // the status is used to enable or disable methods
  // depending on the work that has to be done
  // during oauth-workflow
  status: oauthStatus = oauthStatus.none;
  lastStatus: ImgurStatus = new ImgurStatus();

  /**
   * is called when the credentials are set to storage.
   */
  onSetCredentialsToStorage: (value: string, isRefreshing: boolean) => void;

  /**
   * is called when the credentials should be retrieved from storage.
   *
   * @return credentials read from storage
   */
  onGetCredentialsFromStorage: () => string;
  storageKey: 'imgur';

  constructor(public env: EnvironmentService,
              public msg: MessageService,
              public http: HttpClient) {
  }

  get msgOauth2Workflow(): string {
    return $localize`To connect to Imgur, you need to confirm that Order66
is allowed to access the images. This confirmation is requested by
Imgur using special dialogs. Everything that needs to be confirmed there is
beyond the control of Order66. Should the confirmation process be started?`;
  }

  init(): void {
    this.checkUrlParams();
  }

  getImages(): Observable<any> {
    const url = 'https://api.imgur.com/3/account/me/images';
    const headers = this.requestHeader();
    return this.http.get(url, {headers});
  }

  requestHeader(headers?: any): HttpHeaders {
    return new HttpHeaders({
      authorization: `Bearer ${this.loadCredentials().at}`,
      ...(headers ?? {})
    });
  }

  disconnect(): void {
    GLOBALS.appData.person.imgur = new ImgurData();
    GLOBALS.saveImmediate();
  }

  connect(): void {
    const params = [
      `client_id=${this.env.IMGUR_APP_KEY}`,
      'response_type=token'
    ];
    const url = `https://api.imgur.com/oauth2/authorize?${params.join('&')}`;
    this.startOauth2Workflow().subscribe(oauth2 => {
      if (oauth2.doSignin) {
        location.href = url;
      }
    });
  }

  /**
   * get information for the start of the oauth2 workflow.
   */
  startOauth2Workflow(): Observable<Oauth2pkce> {
    return this.msg.confirm(this.msgOauth2Workflow,
      new DialogParams({image: 'https://imgur.com/images/favicon.png'})).pipe(map(result => {
      const ret = new Oauth2pkce();
      ret.doSignin = result?.btn === DialogResultButton.yes;
      ret.isDebug = GLOBALS.mayDebug;
      return ret;
    }));
  }

  /**
   * reads the credentials from storage.
   */
  private getCredentialsFromStorage(): string {
    if (this.onGetCredentialsFromStorage != null) {
      return this.onGetCredentialsFromStorage();
    }
    return localStorage.getItem(this.storageKey);
  }

  /**
   * writes the credentials to storage.
   *
   * @param value the value to write to storage
   * @param isRefreshing if true, then a refrehtoken is being written
   */
  // private setCredentialsToStorage(value: string, isRefreshing = false): void {
  //   if (this.onSetCredentialsToStorage != null) {
  //     this.onSetCredentialsToStorage(value === 'null' ? null : value, isRefreshing);
  //     return;
  //   }
  //   if (value == null || value === 'null') {
  //     localStorage.removeItem(this.storageKey);
  //   } else {
  //     localStorage.setItem(this.storageKey, value);
  //   }
  // }

  /**
   * loads the credentials from storage and converts them
   * to a datastructure that can be used internal by this
   * component.
   *
   * @private
   */
  private loadCredentials(): any {
    return GLOBALS.appData?.person?.imgur ?? {};
  }

  /**
   * converts the credentials from the internal structure
   * to a string and saves them to storage.
   *
   * @param value credentials in datastructure
   * @param _isRefreshing if true, then a refrehtoken is being written
   * @private
   */
  private saveCredentials(value: any, _isRefreshing = false): void {
    GLOBALS.appData.person.imgur.fillFromJson({
      a: value.access_token,
      b: value.account_id,
      c: value.account_username,
      d: value.expires_in,
      e: value.refresh_token,
      f: value.token_type,
    });
    GLOBALS.saveImmediate(null, () => {
      location.href = location.origin;
    });
  }

  // private reverse(value: string): string {
  //   let ret = '';
  //   for (let i = value?.length - 1; i >= 0; i--) {
  //     ret += value[i];
  //   }
  //   return ret;
  // }

  /**
   * Checks the url-params to work with the redirects from
   * oauth2-workflow.
   */
  private checkUrlParams(): void {
    // https://order66.zreptil.de/?imgur#access_token=2e2e92f9bd52f703d60140b82e05c37f8b3b5789&expires_in=315360000&token_type=bearer&refresh_token=c55b9ceed87d5d4d730c39d89aff059ec85991ed&account_username=zreptil&account_id=183846117
    if (this.env.urlParams.error === 'access_denied') {
      this.status = oauthStatus.accessDenied;
      location.href = location.origin;
    } else if (this.env.hashParams.access_token != null) {
      this.saveCredentials(this.env.hashParams);
    } else if (this.getCredentialsFromStorage() != null) {
      this.status = oauthStatus.hasAccessToken;
    }
  }
}
