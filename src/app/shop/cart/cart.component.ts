import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ProductService } from "../../shared/services/product.service";
import { Product } from "../../shared/classes/product";
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  public products: Product[] = [];
  public userId = 1234;
  totalAmount: number;
  totalAmountSubscription: Subscription;
  request: string;
  // images: any = [];
  private cartUpdateSubscription: Subscription;

  constructor(public productService: ProductService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.getCartData();
    this.totalAmountSubscription = this.productService.cartTotalAmount().subscribe((total: number) => {
      this.totalAmount = total;
    });
    this.cartUpdateSubscription = this.productService.cartUpdate$.subscribe(() => {
      this.getCartData();
      this.totalAmountSubscription = this.productService.cartTotalAmount().subscribe((total: number) => {
        this.totalAmount = total;
      });
    });
  }

  ngOnDestroy(): void {
    if (this.totalAmountSubscription) {
      this.totalAmountSubscription.unsubscribe();
    }
    this.cartUpdateSubscription.unsubscribe();
  }

  async getCartData() {
    await this.productService.getCartItems(this.userId).subscribe(response => {
      this.products = response;
      this.products.forEach(element => {
        element['selectedImages'] = [];
        element.images.forEach(ele => {
          if (ele.image_id === element.variants[0].image_id) {
            // this.images.push({src : ele.src, alt : ele.alt});
            element['selectedImages'].push({ src: ele.src, alt: ele.alt })
          }
        });
      });
    });
  }

  // Increment quantity off product
  async increment(product, qty = 1, deleteType = 'increase_1') {
    await this.productService.updateCartQuantity(product, qty, deleteType, this.userId);
    await this.productService.getCartItems(this.userId).subscribe(response => {
      this.products = response;
      this.products.forEach(element => {
        element['selectedImages'] = [];
        element.images.forEach(ele => {
          if (ele.image_id === element.variants[0].image_id) {
            // this.images.push({src : ele.src, alt : ele.alt});
            element['selectedImages'].push({ src: ele.src, alt: ele.alt })
          }
        });
      });
    })
  }

  // Decrement quantity off product
  async decrement(product, qty = -1, deleteType = 'decrease_1') {
    await this.productService.updateCartQuantity(product, qty, deleteType, this.userId);
    await this.productService.getCartItems(this.userId).subscribe(response => {
      this.products = response;
      this.products.forEach(element => {
        element['selectedImages'] = [];
        element.images.forEach(ele => {
          if (ele.image_id === element.variants[0].image_id) {
            // this.images.push({src : ele.src, alt : ele.alt});
            element['selectedImages'].push({ src: ele.src, alt: ele.alt })
          }
        });
      });
    })
  }

  //Remove product from cart
  async removeItem(product: any, deleteType = 'remove_all') {
    await this.productService.removeCartItem(product, deleteType, this.userId);
    await this.productService.getCartItems(this.userId).subscribe(response => {
      this.products = response;
      this.products.forEach(element => {
        element['selectedImages'] = [];
        element.images.forEach(ele => {
          if (ele.image_id === element.variants[0].image_id) {
            // this.images.push({src : ele.src, alt : ele.alt});
            element['selectedImages'].push({ src: ele.src, alt: ele.alt })
          }
        });
      });
    })
  }

  //Continue Shopping
  onContinueShopping() {
    const lastProduct = this.products[this.products.length - 1];
    (lastProduct.category === 'men') || (lastProduct.category === 'Men') ? this.request = 'Men' : this.request = 'Women';
    let navigationExtras: NavigationExtras = {
      queryParams: { 'category': this.request },
      fragment: 'anchor'
    };
    this.router.navigate(['/shop/collection/left/sidebar/'], navigationExtras);
  }

  //Checkout Cart item to order
  onCheckout() {
     this.router.navigate(['/shop/checkout/']);
  }

}
