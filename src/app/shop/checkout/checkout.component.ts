import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
// import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { environment } from '../../../environments/environment';
import { Product } from "../../shared/classes/product";
import { ProductService } from "../../shared/services/product.service";
import { OrderService } from "../../shared/services/order.service";
import { ToastrService } from 'ngx-toastr';

declare var Razorpay:any;
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  public checkoutForm: UntypedFormGroup;
  public products: Product[] = [];
  // public payPalConfig ? : IPayPalConfig;
  public payment: string = 'COD';
  public amount: any;
  public userId = 1234;
  totalAmountSubscription: Subscription;
  totalAmount: number;
  private cartUpdateSubscription: Subscription;
  public razorpay_payment_id:any;
  paymentMode: any;

  constructor(private fb: UntypedFormBuilder,
    public productService: ProductService,
    private orderService: OrderService, public toastrService:ToastrService) {
    this.checkoutForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      lastname: ['', [Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      phone: ['', [Validators.required, Validators.pattern('[0-9]+'), Validators.maxLength(10), , Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.maxLength(50)]],
      country: ['', Validators.required],
      town: ['', Validators.required],
      state: ['', Validators.required],
      postalcode: ['', [Validators.required, Validators.maxLength(6), , Validators.minLength(6)]]
    })

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

  getCartData() {
    // Check if there is an existing subscription
    this.cartUpdateSubscription = this.productService.getCartItems(this.userId).subscribe(response => {
      this.products = response;
      this.products.forEach(element => {
        element['selectedImages'] = [];
        element.images.forEach(ele => {
          if (ele.image_id === element.variants[0].image_id) {
            element['selectedImages'].push({ src: ele.src, alt: ele.alt })
          }
        });
      });
    });
  }


  public get getTotal(): Observable<number> {
    return this.productService.cartTotalAmount();
  }

  //CODCheckout 08/12/2023
   placeOrder(modeOfPayment) {
    this.paymentMode = modeOfPayment; 
    if (modeOfPayment === 'RAZORPAY') {
    this.razorpayModal(this.totalAmount, this.checkoutForm, this.products);
    } else {
    this.orderService.placeOrder(this.products, this.totalAmount, this.checkoutForm, this.paymentMode);
    }
  }



  razorpayModal(totalAmount, checkoutForm, products){
    let options = {
      "description": "Online Fashion Store",
      "currency": "USD",
      "amount": Math.round(totalAmount * 100),
      "name": "MultiKart",
      "key": "rzp_test_Ft0nb7vJtmhwh8", // Enter the Key ID generated from the Dashboard
      "image": "https://angular.pixelstrap.com/multikart/assets/images/icon/logo.png",
      handler: (response:any)=>{
        if(response!= null && response.razorpay_payment_id != null){
          this.razorpay_payment_id = response.razorpay_payment_id
          this.processResponse(response);
        } else {
          alert("Payment failed..!!")
        }
        
      },
      "prefill": {
          "name": "",
          "email": "",
          "contact": ""
      },
      "theme": {
          "color": "#ff4c3b"
      },
      modal:{
        ondismiss: ()=>{
          this.toastrService.error("Payment cancelled..!!");
        }
      }
  
  };


  Razorpay.open(options)

}
  processResponse(resp:any){
      this.orderService.placeOrder(this.products, this.totalAmount, this.checkoutForm, this.razorpay_payment_id, this.paymentMode);
  }

}
