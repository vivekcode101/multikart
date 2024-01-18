import { Component, OnInit } from '@angular/core';
import { NavService, Menu } from '../../services/nav.service';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public menuItems: Menu[];
  request: string;

  constructor(private router: Router, public navServices: NavService) {
    this.navServices.items.subscribe(menuItems => this.menuItems = menuItems );
    this.router.events.subscribe((event) => {
      this.navServices.mainMenuToggle = false;
    });
  }

  ngOnInit(): void {
  }

  onSubMenu(subCategory:any){
    let navigationExtras: NavigationExtras = {
      queryParams: { 'category': subCategory },
      fragment: 'anchor'};
      this.router.navigate(['/shop/collection/left/sidebar/'], navigationExtras);
}

  mainMenuToggle(): void {
    this.navServices.mainMenuToggle = !this.navServices.mainMenuToggle;
  }

  // Click Toggle menu (Mobile)
  toggletNavActive(item) {
    item.active = !item.active;
  }

}
