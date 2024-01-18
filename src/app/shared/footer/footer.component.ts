import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  @Input() class: string;
  @Input() themeLogo: string = 'assets/images/icon/logo.png'; // default Logo
  @Input() mainFooter: boolean = true; // Default true 
  @Input() subFooter: boolean = false; // Default false 
  
  public today: number = Date.now();
  
  constructor() { }

  ngOnInit(): void {
  }

}
