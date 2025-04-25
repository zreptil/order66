import {Component, OnInit} from '@angular/core';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {GlobalsService} from '@/_services/globals.service';
import {DlgBaseComponent} from '@/classes/base/dlg-base-component';

@Component({
  selector: 'app-dsgvo',
  templateUrl: './dsgvo.component.html',
  styleUrls: ['./dsgvo.component.scss'],
  standalone: false
})
export class DsgvoComponent extends DlgBaseComponent implements OnInit {

  closeData: CloseButtonData = {
    viewInfo: this.name,
    colorKey: 'legal'
  };

  constructor(globals: GlobalsService) {
    super(globals, 'DSGVO');
  }

  ngOnInit(): void {
  }

}
