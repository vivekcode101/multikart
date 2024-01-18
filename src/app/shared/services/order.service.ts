import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, catchError, map } from 'rxjs';
import { ProductService } from './product.service';
import { METHODS } from 'http';

const state = {
  checkoutItems: JSON.parse(localStorage['checkoutItems'] || '[]')
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orderUrl = environment.orderUrl;

  private cartUpdateSubject = new Subject<void>();
  cartUpdate$ = this.cartUpdateSubject.asObservable();
  private razorpayApiUrl = 'http://localhost:8084';

  constructor(private router: Router,
    private http: HttpClient,
    private toastrService: ToastrService,
    private productService: ProductService) { }

  // Get Checkout Items
  public get checkoutItems(): Observable<any> {
    const itemsStream = new Observable(observer => {
      observer.next(state.checkoutItems);
      observer.complete();
    });
    return <Observable<any>>itemsStream;
  }

  // transaction 
  razorpayTransaction(orderId: string, totalAmount: number, razorpay_payment_id ): Observable<any> {
    const amount =  Math.floor(totalAmount);
    const id = orderId.replace(" ","");
    const url = `${this.razorpayApiUrl}/payment/createOrder?orderId=${id}&amount=${amount}`;
    const dt = new Date();
    const padL = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
    const dformat = `${dt.getFullYear()}/${padL(dt.getMonth()+1)}/${padL(dt.getDate())}T${padL(dt.getHours())}:${
      padL(dt.getMinutes())}:${padL(dt.getSeconds())}.000+00:00`;
     const requestData = {
      orderId: id,
      amount: Math.floor(totalAmount)
    };
    return this.http.post<any>(url, requestData).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((error) => {
        throw error;
      })
    );
  }

  // Create order
  public createOrder(product: any, details: any, orderId: any, amount: any) {
    var item = {
        shippingDetails: details,
        product: product,
        orderId: orderId,
        totalAmount: amount
    };
    state.checkoutItems = item;
    localStorage.setItem("checkoutItems", JSON.stringify(item));
    localStorage.removeItem("cartItems");
    this.router.navigate(['/shop/checkout/success', orderId]);
  }

    getAllOrders(userId: string): Observable<any[]> {
      const url = `${this.orderUrl}/order/order?userId=${userId}`;
      return this.http.get<any[]>(url);
    }
  
  //placeOrder 08/12/2023
  public placeOrder(products, totalAmount, checkoutForm, transactionId?, paymentMode?){    
    const productArray = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const variants = product.variants;
      for (let j = 0; j < variants.length; j++) {
        const variant = variants[j];
        productArray.push({
          product_id: product.product_id,
          variant_id: variant.variant_id,
          qty: variant.variantid_qty,
          price: product.price
        });
      }
    }

    const request = {
      modeOfPayment: paymentMode,
      userId: 1234,
      totalAmount: totalAmount,
      orderStatus: "Pending",
      paymentStatus: "pending",
      billingDetails: {
        firstName: checkoutForm.value.firstname,
        lastName: checkoutForm.value.lastname,
        phoneNumber: checkoutForm.value.phone,
        email: checkoutForm.value.email,
        country: checkoutForm.value.country,
        address: checkoutForm.value.address,
        city: checkoutForm.value.town,
        state: checkoutForm.value.state,
        postalCode: checkoutForm.value.postalcode
      },
      products: productArray
    }

  this.http.post('http://localhost:8086/multikart/v1/order/create', request)
  .subscribe(
    (response: any) => {
      if (response) {
        this.cartUpdateSubject.next();
        this.productService.getCartItems(1234);
        this.toastrService.success(response.message);
        if (paymentMode == 'RAZORPAY') {
          this.razorpayTransaction(response.message.split('-')[1], totalAmount, transactionId).subscribe(data => {
          }) 
        }
        this.router.navigate(['/shop/cart']);
        return response;
      }
    },
    (error) => {
    }
  );
  }
}
