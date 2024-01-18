import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailsMainSlider, ProductDetailsThumbSlider } from '../../../../shared/data/slider';
import { Product } from '../../../../shared/classes/product';
import { ProductService } from '../../../../shared/services/product.service';
import { SizeModalComponent } from "../../../../shared/components/modal/size-modal/size-modal.component";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/shared/services/order.service';
import { element } from 'protractor';


@Component({
  selector: 'app-product-left-sidebar',
  templateUrl: './product-left-sidebar.component.html',
  styleUrls: ['./product-left-sidebar.component.scss']
})
export class ProductLeftSidebarComponent implements OnInit {

  public product: Product = {};
  public counter: number = 1;
  public activeSlide: any = 0;
  public selectedSize: any;
  public mobileSidebar: boolean = false;
  public active = 1;
  public userRating: number = 0; 
  public reviewForm: FormGroup;
  public selectedRating: number = 0;

  @ViewChild("sizeChart") SizeChart: SizeModalComponent;

  public ProductDetailsMainSliderConfig: any = ProductDetailsMainSlider;
  public ProductDetailsThumbConfig: any = ProductDetailsThumbSlider;
  productName: any;
  selectedColor: any;
  userId = '1234';
  hasProductInOrder: boolean;
  productVariantId: any;
  orders: any;

  constructor(private route: ActivatedRoute, private router: Router, private cd: ChangeDetectorRef,
    public productService: ProductService, private fb: FormBuilder, private toastrService:ToastrService, private orderService:OrderService) {
    // this.route.data.subscribe(response => this.product = response.data);
    this.reviewForm = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      // Access the 'id' parameter from the route
      this.productName = params['slug'];
      this.productService.getProductBySlug(this.productName).subscribe(
       response => this.product = response
      )
    });

    this.reviewForm = this.fb.group({
      rating: ['', Validators.required],
      comment: ['', Validators.required]
    });

    this.getOrders();


  }

  getOrders(): void {
    this.orderService.getAllOrders(this.userId).subscribe(
      (orders) => {
        this.orders = orders;
        // Do something with the orders, e.g., update your UI
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  

  // checkProductInOrder() {
  //   this.orderService.getAllOrders(this.userId).subscribe(
  //     (orders) => {
  //       // Assuming product_id and variant_id are known, replace with actual values
  //       console.log(this.product)// 
        

  //       console.log(orders);
  //       const productId = this.product.product_id;
  //       const variantId = ;

  //       // Check if the product is in the order
  //       this.hasProductInOrder = orders.some((order) =>
  //         order.products.some(
  //           (product) =>
  //             product.product_id === productId && product.variant_id === variantId
  //         )
  //       );
  //     },
  //     (error) => {
  //       console.error('Error fetching orders:', error);
  //     }
  //   );
  // }
  

  // checkProductInOrder() {
  //   this.orderService.getAllOrders(this.userId).subscribe(
  //     (orders) => {
  //       const productId = this.product.product_id;
        
  //       let variantId: string | null = null;
  
  //       // Check if the product is in the order
  //       this.hasProductInOrder = orders.some((order) =>
  //         order.products.some((product) => {
  //           if (product.product_id === productId) {
  //             // Assuming your product has a property named 'variant_id'
  //             variantId = product.variant_id;
  //             return true; // Found the product, stop iterating
  //           }
  //           return false;
  //         })
  //       );
  
  //       if (this.hasProductInOrder) {
  //         console.log('Product found in order. Variant ID:', variantId);
  //         // Do something with the variantId if needed
  //       } else {
  //         console.log('Product not found in any order.');
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching orders:', error);
  //     }
  //   );
  // }

  // checkProductInOrder(product: any, selectedColor, selectedSize) {
  //   this.orderService.getAllOrders(this.userId).subscribe(
  //     (orders) => {
  //       const productId = this.product.product_id;
  //       product?.variants.forEach(element => {
  //         if ((element.color === selectedColor) && (element.size === selectedSize)) {
  //           this.productVariantId = element.variant_id
  //         }
  //       });
  
  //       let variantId = this.productVariantId
  
  //       // Check if the product is in the order
  //       this.hasProductInOrder = orders.find((order) =>
  //         order.products.find((product) => {
  //           if (product.product_id === productId && product.color === selectedColor && product.size === selectedSize) {
  //             // Assuming your product has a property named 'variant_id'
  //             variantId = product.variant_id;
  //             return true; // Found the product, stop iterating
  //           }
  //           return false;
  //         })
  //       );
  
  //       if (this.hasProductInOrder) {
  //         console.log('Product found in order. Variant ID:', variantId);
  //         // Do something with the variantId if needed
  //       } else {
  //         console.log('Product not found in any order.');
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching orders:', error);
  //     }
  //   );
  // }

  checkProductInOrder(product: any, selectedColor: string, selectedSize: string) {
    if (!selectedSize) {
      this.toastrService.warning('Please select the size');
      return;
    }
    this.orderService.getAllOrders(this.userId).subscribe(
      (response) => {


        const productId = product.product_id;
  
        let variantId = null;
  
        // Find the variant_id for the selected color and size
        product?.variants.forEach((element) => {
          if (element.color === selectedColor && element.size === selectedSize) {
            variantId = element.variant_id;
          }
        });
  
        // Check if the product is in the order
        this.hasProductInOrder = this.orders?.data.some((order) => order.products.some((orderedProduct: 
          { product_id: any; variant_id: any; }) => {
            if (
              orderedProduct.product_id === productId &&
              orderedProduct.variant_id == variantId 
            ) {
              return true; // Found the product, stop iterating
            }
            return false;
          })
        );
        if (!this.hasProductInOrder) {
          this.toastrService.warning('You cannot write a review');
        }
        // this.cd.detectChanges();
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }
  
  
  

  submitReview(product:any, selectedColor:any, selectedSize:any): void {
    if (this.reviewForm.valid) {
      const reviewData = {
        rating: this.reviewForm.get('rating')?.value,
        comment: this.reviewForm.get('comment')?.value,
      };
  
      let selectedVariant: any = {};
      product?.variants.forEach(element => {
        if ((element.color === selectedColor) && (element.size === selectedSize)) {
          selectedVariant = element;
        }
      });
  
      const reviewPayload = {
        ratingId: product?._id, // Generate a unique ID for the rating
        productId: product?.product_id,
        variantId: selectedVariant.variant_id,
        userId: "1234", // Replace with the actual user ID
        ...reviewData,
      };
  
      // Call the postRatingReview method from the ProductService
    this.productService.postRatingReview(reviewPayload).subscribe(
      (response) => {
        // Handle success if needed
        this.toastrService.success('Rating added successfully!');
         // Reset the review form
         this.reviewForm.reset();

         // Set the default value for the rating control (if needed)
         this.setRating(0);
 
         return response;
      },
      (error) => {
        // Handle errors
        this.toastrService.error('Error adding rating.');
        console.error('Error adding rating:', error);
      }
    );
    }
  }
  
  

  /**
   * @method setRating
   */
  public setRating(rating) {
    this.selectedRating = rating;
    this.reviewForm.get('rating').setValue(rating);
  }

  //On selecting different Colors 
  selectColor(index: number) {
    this.activeSlide = index.toString();
    this.active = 1;
    this.selectedColor = this.Color(this.product?.variants)[index];
    // this.checkProductInOrder(this.product, this.selectedColor, this.selectedSize);
  }

  // Get Product Color
  Color(variants) {
    const uniqColor = []
    if (variants) {
      for (let i = 0; i < Object?.keys(variants).length; i++) {
        if (uniqColor.indexOf(variants[i].color) === -1 && variants[i].color) {
          uniqColor.push(variants[i].color)
        }
        if (i === this.activeSlide) {
          this.selectedColor = variants[i].color;
        }
      }
    }
    return uniqColor
  }

  // Get Product Size
  Size(variants) {
    const uniqSize = []
    if (variants) {
      for (let i = 0; i < Object.keys(variants).length; i++) {
        if (uniqSize.indexOf(variants[i].size) === -1 && variants[i].size) {
          uniqSize.push(variants[i].size)
        }
      } 
    }
    return uniqSize
  }

  selectSize(size) {
    this.active = 1;
    this.selectedSize = size;
    // this.checkProductInOrder(this.product, this.selectedColor, this.selectedSize);
  }

  // Increament
  increment() {
    this.counter++;
  }

  // Decrement
  decrement() {
    if (this.counter > 1) this.counter--;
  }

  // Add to cart
  async addToCart(product: any, selectedColor, selectedSize) {
    product?.variants.forEach(element => {
      if ((element.color === selectedColor) && (element.size === selectedSize)) {
        const selectedVariant: string = 'selectedVariant'; // Replace 'someKey' with the actual key you want to use
        product[selectedVariant] = product[selectedVariant] || [];
        product[selectedVariant].push(element);
      }
    });
    product.quantity = this.counter || 1;
    const status = await this.productService.addToCart(product, selectedColor, selectedSize);
    if (status)
      this.router.navigate(['/shop/cart']);
  }

  // Buy Now
  async buyNow(product: any, selectedColor, selectedSize) {
    product?.variants.forEach(element => {
      if ((element.color === selectedColor) && (element.size === selectedSize)) {
        const selectedVariant: string = 'selectedVariant'; // Replace 'someKey' with the actual key you want to use
        product[selectedVariant] = product[selectedVariant] || [];
        product[selectedVariant].push(element);
      }
    });
    product.quantity = this.counter || 1;
    const status = await this.productService.addToCart(product, selectedColor, selectedSize);
    if (status)
      this.router.navigate(['/shop/checkout']);
  }

  // Add to Wishlist
  // async addToWishlist(product: any, selectedColor, selectedSize) {
  //   product?.variants.forEach(element => {
  //     if ((element.color === selectedColor) && (element.size === selectedSize)) {
  //       const selectedVariant: string = 'selectedVariant'; // Replace 'someKey' with the actual key you want to use
  //       product[selectedVariant] = product[selectedVariant] || [];
  //       product[selectedVariant].push(element);
  //     }
  //   });
  //   product.quantity = this.counter || 1;
  //   const status = await this.productService.addToWishlist(product);
  //   // if (status)
  //   //   this.router.navigate(['/shop/cart']);
  // }

  addToWishlist(product: any, selectedColor, selectedSize): void {
    product?.variants.forEach(element => {
      if ((element.color === selectedColor) && (element.size === selectedSize)) {
        const selectedVariant: string = 'selectedVariant'; // Replace 'someKey' with the actual key you want to use
        product[selectedVariant] = product[selectedVariant] || [];
        product[selectedVariant].push(element);
      }
    });
    // product.quantity = this.counter || 1;
    this.productService.addToWishlist(product).subscribe(
      () => {
        // Optional: Handle success, e.g., show a success message
      },
      (error) => {
        // Optional: Handle error, e.g., show an error message
      }
    );
  }

  // Toggle Mobile Sidebar
  toggleMobileSidebar() {
    this.mobileSidebar = !this.mobileSidebar;
  }

}
