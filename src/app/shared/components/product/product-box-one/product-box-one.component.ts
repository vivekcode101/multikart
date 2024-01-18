import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { CartModalComponent } from "../../modal/cart-modal/cart-modal.component";
import { Product } from "../../../classes/product";
import { ProductService } from "../../../services/product.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-box-one',
  templateUrl: './product-box-one.component.html',
  styleUrls: ['./product-box-one.component.scss']
})
export class ProductBoxOneComponent implements OnInit {

  @Input() product: Product;
  @Input() currency: any = this.productService.Currency; // Default Currency 
  @Input() thumbnail: boolean = false; // Default False 
  @Input() onHowerChangeImage: boolean = false; // Default False
  @Input() cartModal: boolean = false; // Default False
  @Input() loader: boolean = false;
  
  @ViewChild("quickView") QuickView: QuickViewComponent;
  @ViewChild("cartModal") CartModal: CartModalComponent;

  public ImageSrc : string;
  public productRating: number;



  constructor(private productService: ProductService, private toastrService:ToastrService) { }

  ngOnInit(): void {
    if (this.loader) {
      setTimeout(() => { this.loader = false; }, 2000); // Skeleton Loader
    }

   // Fetch product ratings
   if (this.product && this.product.product_id && this.product.variants && this.product.variants.length > 0) {
    const productId = this.product.product_id;
    const variantId = this.product.variants[0].variant_id;

    this.productService.getProductRatings(productId, variantId).subscribe(
      (response) => {
        if (response && response.data && response.data.length > 0) {
          const ratings = response.data.map((item) => parseFloat(item.rating));
          const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
          this.productRating = averageRating;
        }
      },
      (error) => {
      }
    );
  }

  }

  // Get Product Color
  Color(variants) {
    const uniqColor = [];
    for (let i = 0; i < Object.keys(variants).length; i++) {
      if (uniqColor.indexOf(variants[i].color) === -1 && variants[i].color) {
        uniqColor.push(variants[i].color)
      }
    }
    return uniqColor
  }

  // Change Variants
  ChangeVariants(color, product) {
    product.variants.map((item) => {
      if (item.color === color) {
        product.images.map((img) => {
          if (img.image_id === item.image_id) {
            this.ImageSrc = img.src;
          }
        })
      }
    })
  }

  // Change Variants Image
  ChangeVariantsImage(src) {
    this.ImageSrc = src;
  }

  addToCart(product: any) {
    this.productService.addToCart(product);
  }


  onAddToWishlist(product: any): void {
    this.productService.addToWishlist(product).subscribe(
      () => {
        // Optional: Handle success, e.g., show a success message
      },
      (error) => {
        // Optional: Handle error, e.g., show an error message
      }
    );
  }

  // addToWishlist(product: any) {
  //   this.productService.addToWishlist(product);
  // }

  // addToCompare(product: Product): void {
  //   this.productService.addToCompare(product);
  // }

  addToCompare(product: any): void {
    this.productService.addToCompare(product).subscribe(
      () => {
        this.toastrService.success('Product has been added to compare.');
      },
      (error) => {
        this.toastrService.error('Failed to add product to compare. Please try again.');
      }
    );
  }


}
