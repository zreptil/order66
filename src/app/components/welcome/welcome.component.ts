import {Component, OnInit} from '@angular/core';
import {DropboxService} from '@/_services/sync/dropbox.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {GlobalsService} from '@/_services/globals.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  closeData: CloseButtonData = {
    colorKey: 'whatsnew'
  };

  constructor(public globals: GlobalsService,
              public dbs: DropboxService) {
  }

  ngOnInit(): void {
  }

  doSync() {
    this.dbs.connect();
  }
}
