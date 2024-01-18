import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { ToastrModule } from 'ngx-toastr';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ShopComponent } from './shop/shop.component';
import { PagesComponent } from './pages/pages.component';
import { ElementsComponent } from './elements/elements.component';
import { AuthModule } from '@auth0/auth0-angular';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    ShopComponent,
    PagesComponent,
    ElementsComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    HttpClientModule,
    NgbModule,
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      progressBar: false,
      enableHtml: true,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SharedModule,
    AppRoutingModule,
    // AuthModule.forRoot({
    //   domain: 'dev-s12jdu7qc05nil8e.us.auth0.com',
    //   clientId: 'UR1TE2jOEHx2SSxQQpKCDMbK66tpjXCZ',
    //   authorizationParams: {
    //     redirect_uri: window.location.origin
    //   }
    //   // redirectUri: 'http://localhost:4200/home/fashion',
    // }),
    AuthModule.forRoot({
      domain: 'dev-s12jdu7qc05nil8e.us.auth0.com',
      clientId: 'WaDUk0JZDvFNmZF2hn8o3LWOkkWtHNTY',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    }),
    // AuthModule.forRoot({
    //   domain: '{dev-s12jdu7qc05nil8e.us.auth0.com}',
    //   clientId: '{UR1TE2jOEHx2SSxQQpKCDMbK66tpjXCZ}',
    //   authorizationParams: {
    //     redirect_uri: window.location.origin
    //   }
    // }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
