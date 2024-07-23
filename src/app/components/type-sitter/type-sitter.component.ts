import {AfterViewInit, Component} from '@angular/core';
import {GlobalsService} from '@/_services/globals.service';

@Component({
  selector: 'app-type-sitter',
  templateUrl: './type-sitter.component.html',
  styleUrls: ['./type-sitter.component.scss']
})
export class TypeSitterComponent implements AfterViewInit {

  constructor(public globals: GlobalsService) {
  }

  ngAfterViewInit(): void {
  }
}
