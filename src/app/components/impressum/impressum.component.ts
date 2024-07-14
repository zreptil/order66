import {Component, OnInit} from '@angular/core';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {GlobalsService} from '@/_services/globals.service';

@Component({
  selector: 'app-impressum',
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.scss']
})
export class ImpressumComponent implements OnInit {
  closeData: CloseButtonData = {
    colorKey: 'legal'
  };

  constructor(public globals: GlobalsService) {
  }

  ngOnInit(): void {
  }

}
