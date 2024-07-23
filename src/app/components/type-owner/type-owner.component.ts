import {AfterViewInit, Component} from '@angular/core';
import {GlobalsService} from '@/_services/globals.service';

@Component({
  selector: 'app-type-owner',
  templateUrl: './type-owner.component.html',
  styleUrls: ['./type-owner.component.scss']
})
export class TypeOwnerComponent implements AfterViewInit {

  constructor(public globals: GlobalsService) {
  }

  ngAfterViewInit(): void {
  }
}
