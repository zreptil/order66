import {OAuthService} from 'angular-oauth2-oidc';
import {Injectable} from '@angular/core';
import {oauthStatus} from '@/_services/oauth2/imgur.service';
import {EnvironmentService} from '@/_services/environment.service';
import {GLOBALS} from '@/_services/globals.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleService {
  // the status is used to enable or disable methods
  // depending on the work that has to be done
  // during oauth-workflow
  status: oauthStatus = oauthStatus.none;
  storageKey: 'google';

  /**
   * is called when the credentials should be retrieved from storage.
   *
   * @return credentials read from storage
   */
  onGetCredentialsFromStorage: () => string;

  constructor(private oauthService: OAuthService,
              public env: EnvironmentService) {
    this.oauthService.configure({
      issuer: 'https://accounts.google.com',
      clientId: '827251449717-5kjddmpbke6ars2bft8j30vdh639g1em',
      scope: 'openid profile email https://www.googleapis.com/auth/userinfo.profile',
      redirectUri: location.origin,
      strictDiscoveryDocumentValidation: false
    });
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  login() {
    const user = this.oauthService.getIdentityClaims();
    if (user == null) {
      this.oauthService.initLoginFlow();
    }
    console.log('so schauts aus', this.oauthService.getIdentityClaims());
  }

  callGoogleApi() {
    const accessToken = this.oauthService.getAccessToken();
    // Verwenden Sie accessToken für autorisierte API-Aufrufe
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
   * converts the credentials from the internal structure
   * to a string and saves them to storage.
   *
   * @param value credentials in datastructure
   * @param _isRefreshing if true, then a refrehtoken is being written
   * @private
   */
  private saveCredentials(value: any, _isRefreshing = false): void {
    // GLOBALS.appData.person.google.fillFromJson({
    //   a: value.access_token,
    //   b: value.account_id,
    //   c: value.account_username,
    //   d: value.expires_in,
    //   e: value.refresh_token,
    //   f: value.token_type,
    // });
    GLOBALS.saveImmediate(null, () => {
      location.href = location.origin;
    });
  }

  /**
   * Checks the url-params to work with the redirects from
   * oauth2-workflow.
   */
  private checkUrlParams(): void {
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
