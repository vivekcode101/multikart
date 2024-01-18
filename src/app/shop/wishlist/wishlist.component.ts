import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { Product } from "../../shared/classes/product";
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {

  public products: Product[] = [];
  request: string;
  selectedColor: any;
selectedSize: any;
public userId = '1234';
private wishlistUpdateSubscription: Subscription;
public counter: number = 1;
// private cartUpdateSubject: Subject<void> = new Subject<void>();

  constructor(private router: Router, 
    public productService: ProductService, private toastrService: ToastrService) {
    // this.productService.wishlistItems.subscribe((response: Product[]) => {
    //   if(response.length >0){
    //     this.products = response}
    //   });
  }

  ngOnInit(): void {
    this.getWishlistData();
    this.wishlistUpdateSubscription = this.productService.wishlistUpdate$.subscribe(() => {
      this.getWishlistData();
    });
  }
  ngOnDestroy(): void {
    this.wishlistUpdateSubscription.unsubscribe();
  }

  // async addToCart(product: any) {
  //   const status = await this.productService.addToCart(product);
  //   if(status) {
  //     this.router.navigate(['/shop/cart']);
  //     this.removeItem(product);
  //   }
  // }
  async getWishlistData() {
    await this.productService.getWishItems(this.userId).subscribe(response => {
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

  async addToCartFromWishlist(product: Product): Promise<void> {
    this.productService.removeWishlistItem(product, false).subscribe(
      (response) => {
    // Check if the product has variants
    if (product.variants && product.variants.length > 0) {
      // For simplicity, let's assume we are adding the first variant to the cart
      const selectedVariant = product.variants[0];
  
      // Set the quantity to 1 (you can modify this as needed)
      // const quantity = 1;
      // Call the addToCart method in the ProductService
      product.quantity = this.counter || 1;
      const status = this.productService.addToCart(product, selectedVariant.color, selectedVariant.size);
  
      // If the addToCart operation is successful, remove the product from the wishlist
      if (status) {
        this.productService.removeWishlistItem(product, false);
        this.toastrService.success( `${product.title} is added to cart`);
      }
    }
  })
  }
  
  async showToastMessage(message: string): Promise<void> {
    // You can implement your toast message logic here
    // Example: You might want to use a library like Toastr or Angular Material Snackbar to display the message
  }
  

  removeItem(product: Product) {
    this.productService.removeWishlistItem(product).subscribe(
      (response) => {
        // Assuming the response indicates a successful removal from the wishlist
        // You can update the local products array if needed
        this.products = this.products.filter(item => item !== product);
      },
      (error) => {
      }
    );
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

    //  Checkout Cart item to order
    onCheckout() {
      this.productService.addAllWishlistItemsToCart().subscribe(
        (response) => {
          // The HTTP request was successful
          this.toastrService.success('All products are added to cart');
          // this.cartUpdateSubject.next(); // Trigger cart update
          this.router.navigate(['/shop/checkout/']);
        },
        (error) => {
          // Handle errors
          console.error('Error adding wishlist items to cart', error);
          // You can show an error message or handle it as needed
        }
      );
    }

}
