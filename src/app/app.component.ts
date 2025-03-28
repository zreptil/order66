import {ChangeDetectorRef, Component} from '@angular/core';
import {SyncService} from '@/_services/sync/sync.service';
import {EnvironmentService} from '@/_services/environment.service';
import {GLOBALS} from '@/_services/globals.service';
import {LogService} from '@/_services/log.service';
import {ThemeService} from '@/_services/theme.service';
import {StorageService} from '@/_services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  constructor(ss: StorageService,
              cr: ChangeDetectorRef,
              sync: SyncService,
              ts: ThemeService,
              public env: EnvironmentService) {
    LogService.cr = cr;
    sync.onSetCredentialsToStorage = (value, _isRefreshing) => {
      GLOBALS.oauth2AccessToken = value;
      GLOBALS.saveWebData();
    };
    sync.onGetCredentialsFromStorage = (): string => {
      GLOBALS.loadWebData();
      ts.setTheme(GLOBALS.theme, false, false);
      ts.restoreTheme();
      return GLOBALS.oauth2AccessToken;
    };
    sync.init();
    GLOBALS.loadSharedData();
  }
}
