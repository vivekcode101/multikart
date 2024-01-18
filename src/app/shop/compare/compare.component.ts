import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { Product } from "../../shared/classes/product";
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit {

  public products: Product[] = [];
  compareItems: Product[] = [];
  private compareUpdateSubscription: Subscription;
  public userId = '1234';
  public counter: number = 1;

  constructor(private router: Router, 
    public productService: ProductService, private toastrService:ToastrService) {
    // this.productService.compareItems.subscribe(response => this.products = response);
    this.productService.compareItems.subscribe((response: Product[]) => {
      if(response.length >0){
        this.products = response}
      });
  }

  ngOnInit(): void {
    this.productService.compareItems.subscribe(items => {
      this.compareItems = items;
    });

    this.getCompareData();
    this.compareUpdateSubscription = this.productService.compareUpdate$.subscribe(() => {
      this.getCompareData();
    });
  }
  ngOnDestroy(): void {
    this.compareUpdateSubscription.unsubscribe();
  }

  async getCompareData() {
    await this.productService.getCompareItems(this.userId).subscribe(response => {
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

  async addToCartFromCompare(product: Product): Promise<void> {
    this.productService.removeCompareItem(product, false).subscribe(
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
        // this.productService.removeWishlistItem(product, false);
        this.toastrService.success( `${product.title} is added to cart`);
      }
    }
  })
  }

  async addToCart(product: any) {
    const status = await this.productService.addToCart(product);
    if(status) {
      this.router.navigate(['/shop/cart']);
    }
  }

  // removeItem(product: any) {
  //   this.productService.removeCompareItem(product);
  // }

  removeItem(product: Product) {
    this.productService.removeCompareItem(product).subscribe(
      (response) => {
        // Assuming the response indicates a successful removal from the wishlist
        // You can update the local products array if needed
        this.products = this.products.filter(item => item !== product);
      },
      (error) => {
      }
    );
  }


}
