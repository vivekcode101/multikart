import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Input, HostListener, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() class: string;
  @Input() themeLogo: string = 'assets/images/icon/logo.png'; // Default Logo
  @Input() topbar: boolean = true; // Default True
  @Input() sticky: boolean = false; // Default false

  public stick: boolean = false;

  constructor(@Inject(DOCUMENT) public document: Document,
    public auth: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  // @HostListener Decorator
  @HostListener("window:scroll", [])
  onWindowScroll() {
    let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (number >= 150 && window.innerWidth > 400) {
      this.stick = true;
    } else {
      this.stick = false;
    }
  }

  login() {
    this.auth.loginWithRedirect()
  }

  // Logout
  logout() {
    this.auth.logout({ 
      logoutParams: {
        returnTo: this.document.location.origin 
      }
    });
  }

  // Check authentication status
  isAuthenticated() {
    return this.auth.isAuthenticated$;
  }

}
