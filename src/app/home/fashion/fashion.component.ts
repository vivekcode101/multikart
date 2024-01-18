import { Component, OnInit } from '@angular/core';
import { HomeSlider } from '../../shared/data/slider';
import { Product } from '../../shared/classes/product';
import { ProductService } from '../../shared/services/product.service';
import { NavigationExtras, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-fashion',
  templateUrl: './fashion.component.html',
  styleUrls: ['./fashion.component.scss'],
  providers: [DatePipe]
})
export class FashionComponent implements OnInit {

  public themeLogo: string = 'assets/images/icon/logo-5.png'; // Change Logo

  public products: Product[] = [];
  public productCollections: any[] = [];
  active;
  public category: string;
  public categories: any;
  public request: string;
  currentDate: Date = new Date();

  constructor(public productService: ProductService, private router: Router, private datePipe: DatePipe) {
    this.productService.getProducts.subscribe(response => {
      this.products = response.filter(item => item.type == 'fashion');
      // Get Product Collection
      this.products.filter((item, i) => {
        item.collection.filter((collection) => {
          const index = this.productCollections.indexOf(collection);
          if (index === -1) this.productCollections.push(collection);
        })
      })
    });
    // this.productService.getAllProducts().subscribe(response => {
    //   this.products = response.data.filter(item => item.type == 'fashion');
    //   // Get Product Collection
    //   this.products.filter((item, i) => {
    //     item.collection.filter((collection) => {
    //       const index = this.productCollections.indexOf(collection);
    //       if (index === -1) this.productCollections.push(collection);
    //     })
    //   })
    // });
    this.productService.getCategory().subscribe((resp: any) => {
      this.categories = resp;
    })
  }

  ngOnInit(): void {
  }

  getCurrentYear(): number {
    return this.currentDate.getFullYear();
  }

  onShopNow(subCategory:any){
    subCategory === 'Men' ? this.request = 'Men' : this.request ='Women';
    let navigationExtras: NavigationExtras = {
      queryParams: { 'category': this.request },
      fragment: 'anchor'};
      this.router.navigate(['/shop/collection/left/sidebar/'], navigationExtras);
}

  // Product Tab collection
  getCollectionProducts(collection) {
    return this.products.filter((item) => {
      if (item.collection.find(i => i === collection)) {
        return item
      }
    })
  }

}
