import {Component, OnInit} from '@angular/core';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {GlobalsService} from '@/_services/globals.service';

@Component({
  selector: 'app-dsgvo',
  templateUrl: './dsgvo.component.html',
  styleUrls: ['./dsgvo.component.scss'],
  standalone: false
})
export class DsgvoComponent implements OnInit {

  closeData: CloseButtonData = {
    colorKey: 'legal'
  };

  constructor(public globals: GlobalsService) {
  }

  ngOnInit(): void {
  }

}
