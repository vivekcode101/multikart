import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, forkJoin, of, throwError } from 'rxjs';
import { map, startWith, delay, catchError, tap, mergeMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../classes/product';
import { environment } from 'src/environments/environment';

const state = {
  products: JSON.parse(localStorage['products'] || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

interface Compare {
  _id: string;
  userId: string;
  compareItems: { productId: string; variantId: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  submitReview(ratingDetails: { rating: any; comment: any; ratingId: string; productId: any; variantId: any; userId: string; orderStatus: 'Delivered' }) {
  }

  public Currency = { name: 'Dollar', currency: 'USD', price: 1 } // Default Currency
  public OpenCart: boolean = false;
  public Products: any;
  public productRecords = new BehaviorSubject<any[]>([]);
  private apiUrl = environment.apiUrl;
  private cartUrl = environment.cartUrl;
  private wishlistApiUrl = 'http://localhost:8087/multikart/product/wishlist';
  private addCompareApiUrl = 'http://localhost:8082/multikart/compare';
  private ratingsApiUrl = 'http://localhost:8083/ratings';
  private addRatingUrl = 'http://localhost:8083/ratings/add';
  variantid: any;
  private cartUpdateSubject = new Subject<void>();
  private wishlistUpdateSubject = new Subject<void>();
  private compareUpdateSubject = new Subject<void>();
  cartUpdate$ = this.cartUpdateSubject.asObservable();
  wishlistUpdate$ = this.wishlistUpdateSubject.asObservable();
  compareUpdate$ = this.compareUpdateSubject.asObservable();
  

  constructor(private http: HttpClient,
    private toastrService: ToastrService) {
  }

  /*
    ---------------------------------------------
    ---------------  Product  -------------------
    ---------------------------------------------
  */

      /**
* @method searchProducts
* @description Search products by Brand, Title, Description
*/
    searchProducts(searchTerm: string): any {
      const url = `http://localhost:8085/multikart/v1/product/search?keyword=${searchTerm}`;
      return this.http.get(url);
    }

  /**
* @method getCategory
*/
  public getCategory() {
    const url = this.apiUrl + '/product/allcategories';
    return this.http.get(url).pipe(
      map((resp: any) => {
        return resp.data;
      }),
      catchError((err, caught) => {
        throw err;
      })
    );
  }

  // // Product
  // private get products(): Observable<Product[]> {
  //   this.Products = this.http.get<Product[]>('assets/data/products.json').pipe(map(data => data));
  //   this.Products.subscribe(next => { localStorage['products'] = JSON.stringify(next) });
  //   return this.Products = this.Products.pipe(startWith(JSON.parse(localStorage['products'] || '[]')));
  // }

  // Product
  private get products(): Observable<Product[]> {
    this.Products = this.http.get<Product[]>(this.apiUrl + '/product/all').pipe(map((response: any) => {
      this.productRecords.next(response?.data);
      return response;
    }));

    return this.Products;
  }

  // Get Products
  public get getProducts(): Observable<Product[]> {
    return this.products;
  }

  //  Get All Products
  public get getAllProducts(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/product/all');
  }

  // Get Products by category
  public getProductsByCategory(category: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/product/bycategories?category=' + category);
    // return this.http.get<any>(this.apiUrl + '/product/all');
  }

  // Get Products By Slug
  public getProductBySlug(slug: string): Observable<Product> {
    return this.getAllProducts.pipe(map(items => {
      return items.find((item: any) => {
        return item.title.replace(' ', '-') === slug;
      });
    }));
  }


    /*
    ---------------------------------------------
    ---------------  Product Rating  -----------------
    ---------------------------------------------
  */


   /**
   * @method getProductRatings
   * @description Get product ratings by productId and variantId
   */
   public getProductRatings(productId: string, variantId: number): Observable<any> {
    const url = `${this.ratingsApiUrl}/byproduct?productId=${productId}&variantId=${variantId}`;
    return this.http.get(url);
  }

   /**
   * Add review and rating for a product variant.
   * @param postRatingReview The details of the rating to be added.
   * @returns Observable<any>
   */
   public postRatingReview(ratingDetails: any): Observable<any> {
    return this.http.post(this.addRatingUrl, ratingDetails);
  }

  /*
    ---------------------------------------------
    ---------------  Wish List  -----------------
    ---------------------------------------------
  */

    // Get Cart Items
    public getWishItems(userId: any): Observable<Product[]> {
      return this.http.get<Product[]>(this.wishlistApiUrl + '?userId=' + userId).pipe(
        map((response: any) => response?.data[0])
      );
    }


  // Get Wishlist Items

  public get wishlistItems(): Observable<Product[]> {
    const itemsStream = new Observable(observer => {
      observer.next(state.wishlist);
      observer.complete();
    });
    return <Observable<Product[]>>itemsStream;
  }

  public addToWishlist(product: { variants: any[]; product_id: any; quantity: any; }, selectedColor?: undefined, selectedSize?: undefined): Observable<any> {
    let isAlreadyAdded = false;

    product?.variants.forEach((element: { color: any; size: any; variant_id: any; }) => {
          if (selectedColor === element.color && selectedSize === element.size) {
            this.variantid = element.variant_id;
          }
        });

    // Check if the product is already in the wishlist
    state.wishlist.forEach((item: { product_id: any; }) => {
        if (item.product_id === product.product_id) {
            isAlreadyAdded = true;
        }
    });

    // If the product is not already in the wishlist, add it
    if (!isAlreadyAdded) {
        state.wishlist.push({
            ...product
        });
    }

    // Show a success message
    this.toastrService.success('Product has been added to the wishlist.');

    // Update the local storage with the updated wishlist
    // localStorage.setItem('wishlistItems', JSON.stringify(state.wishlist));

    // Add API call to the wishlist
    const request =
    {
      "wishlistItems": [
        {
          "variantid_qty": 1,
          "variantId": product.variants[0].variant_id,
          "productId": product.product_id
        }
      ],
      "userId": "1234"
    }

    // Make a POST request to the wishlist API
    return this.http.post(`${this.wishlistApiUrl}/add`, request);
}

  // Remove Wishlist items
  // public removeWishlistItem(product: Product): any {
  //   const index = state.wishlist.indexOf(product);
  //   state.wishlist.splice(index, 1);
  //   localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist));
  //   return true
  // }
    // Remove Cart items


  // public removeWishlistItem(product: Product, showToast:boolean= true): Observable<any> {
  //   const index = state.wishlist.indexOf(product);
  //   state.wishlist.splice(index, 1);
  //   localStorage.setItem('wishlistItems', JSON.stringify(state.wishlist));

  //   if (showToast){
  //     this.toastrService.success( `${product.title} has been removed from the wishlist.`);
  //   } 
  //   localStorage.setItem('wishlistItems', JSON.stringify(state.wishlist));

  //   // Remove API call to the wishlist
  //   const request = {
  //     userId: '1234', // Replace with actual user ID
  //     productId: product.product_id,
  //     variantId: product.variants[0].variant_id
  //   };
  //   return this.http.delete(`${this.wishlistApiUrl}/remove?userId=${request.userId}&productId=${request.productId}&variantId=${request.variantId}`);
  // }

  addAllWishlistItemsToCart(): Observable<any> {
    const userId = 1234;
    const url = `${this.wishlistApiUrl}/addAll`;
    const params = { userId };

    return this.http.post(url, null, { params }).pipe(
      tap(() => {
        // Trigger the cartUpdateSubject on a successful response
        this.cartUpdateSubject.next();
      })
    );
  }

  public removeWishlistItem(product: Product, showToast: boolean = true): Observable<any> {
    const index = state.wishlist.indexOf(product);
    state.wishlist.splice(index, 1);
    localStorage.setItem('wishlistItems', JSON.stringify(state.wishlist));
  
    if (showToast) {
      this.toastrService.success(`${product.title} has been removed from the wishlist.`);
    }
  
    // Remove API call to the wishlist
    const request = {
      userId: '1234', // Replace with actual user ID
      productId: product.product_id,
      variantId: product.variants[0].variant_id
    };
  
    // Make the DELETE request to the wishlist API
    const deleteObservable = this.http.delete(`${this.wishlistApiUrl}/remove?userId=${request.userId}&productId=${request.productId}&variantId=${request.variantId}`);
  
    // Subscribe to the observable to trigger the updateWishlistSubject when the request is complete
    deleteObservable.subscribe(
      () => {
        // Notify subscribers that the wishlist has been updated
        this.wishlistUpdateSubject.next();
      },
      (error) => {
        console.error('Error removing product from wishlist:', error);
      }
    );
  
    return deleteObservable;
  }
  

  public moveToCart(product: Product): Observable<any> {
    const index = state.wishlist.indexOf(product);
    state.wishlist.splice(index, 1);
    localStorage.setItem('wishlistItems', JSON.stringify(state.wishlist));

    this.toastrService.success( `${product.title} has been added to cart.`);
    localStorage.setItem('wishlistItems', JSON.stringify(state.wishlist));

    // Remove API call to the wishlist
    const request = {
      userId: '1234', // Replace with actual user ID
      productId: product.product_id,
      variantId: product.variants[0].variant_id
    };
    return this.http.delete(`${this.wishlistApiUrl}/remove?userId=${request.userId}&productId=${request.productId}&variantId=${request.variantId}`);
  }

  /*
    ---------------------------------------------
    -------------  Compare Product  -------------
    ---------------------------------------------
  */

  // Get Compare Items

    // Get Cart Items
    public getCompareItems(userId: string): Observable<Product[]> {
      return this.http.get<Product[]>(this.addCompareApiUrl + '?userId=' + userId).pipe(
        map((response: any) => response?.data[0])
      );
    }

  public get compareItems(): Observable<Product[]> {
    const itemsStream = new Observable(observer => {
      observer.next(state.compare);
      observer.complete();
    });
    return <Observable<Product[]>>itemsStream;
  }

  public addToCompare(product: { product_id: any; variants: { variant_id: any; }[]; }): Observable<any> {
    const compareLimit = 4;
  
    // Check if the limit is reached
    if (state.compare.length >= compareLimit) {
      // Optionally, you can show a message to the user that the limit has been reached.
      // Adjust this based on your application's requirements.
      this.toastrService.warning('You can compare up to 4 products.');
      return;
    }
  
    let isAlreadyAdded = false;
    state.compare.forEach((item: { product_id: any; }) => {
      if (item.product_id === product.product_id) {
        isAlreadyAdded = true;
      }
    });
  
    if (!isAlreadyAdded) {
      state.compare.push({
        ...product
      });
    }
  
    localStorage.setItem('compareItems', JSON.stringify(state.compare));
  
  // Add API call to the wishlist
  const request =
  {
    "compareItems": [
      {
        "variantId": product.variants[0].variant_id,
        "productId": product.product_id
      }
    ],
    "userId": "1234"
  }
    return this.http.post(`${this.addCompareApiUrl}/add`, request);
  }
  
  

  // Remove Compare items
  // public removeCompareItem(product: Product): any {
  //   const index = state.compare.indexOf(product);
  //   state.compare.splice(index, 1);
  //   localStorage.setItem("compareItems", JSON.stringify(state.compare));
  //   return true
  // }

  public removeCompareItem(product: Product, showToast:boolean= true): Observable<any> {
    const index = state.compare.indexOf(product);
    state.compare.splice(index, 1);
    localStorage.setItem('compareItems', JSON.stringify(state.compare));

    if (showToast){
      this.toastrService.success( `${product.title} has been removed from the compare list.`);
    } 
    localStorage.setItem('compareItems', JSON.stringify(state.compare));

    // Remove API call to the wishlist
    const request = {
      userId: '1234', // Replace with actual user ID
      productId: product.product_id,
      variantId: product.variants[0].variant_id
    };
    // return this.http.delete(`${this.addCompareApiUrl}/remove?userId=${request.userId}&productId=${request.productId}&variantId=${request.variantId}`);

    const deleteObservable = this.http.delete(`${this.addCompareApiUrl}/remove?userId=${request.userId}&productId=${request.productId}&variantId=${request.variantId}`);

    // Subscribe to the observable to trigger the updateWishlistSubject when the request is complete
    deleteObservable.subscribe(
     () => {
       // Notify subscribers that the wishlist has been updated
       this.compareUpdateSubject.next();
     },
     (error) => {
       console.error('Error removing product from wishlist:', error);
     }
   );
 
   return deleteObservable;
  }

  /*
    ---------------------------------------------
    -----------------  Cart  --------------------
    ---------------------------------------------
  */


  // Get Cart Items
  public getCartItems(userId: string | number): Observable<Product[]> {
    return this.http.get<Product[]>(this.cartUrl + '/cart/byuserid?userId=' + userId).pipe(
      map((response: any) => {
        return response?.data[0]
      })
    );
  }

  // Get Cart Items
  public get cartItems(): Observable<Product[]> {
    const itemsStream = new Observable(observer => {
      observer.next(state.cart);
      observer.complete();
    });
    return <Observable<Product[]>>itemsStream;
  }

  // add to cart all products

  public addToCartAllProducts(product){
    const cartItem = state.cart.find((item: { id: any; }) => item.id === product.id);
    const qty = product.quantity ? product.quantity : 1;
    const items = cartItem ? cartItem : product;
    const stock = this.calculateStockCounts(items, qty);
    let cartItems = [];
    product.forEach((product, index) => {
      if (!cartItems[index]) {
        // Initialize cartItems[index] if it's undefined
        cartItems[index] = {};
      }
      cartItems[index].variantid_qty = product.quantity || 1;
      cartItems[index].variantid = product.variants[0].variant_id;
      cartItems[index].productid = product.product_id
    },
    );
    const request =
    {
      "cartItems": cartItems,
      "userid": "1234"
    }
    if (!stock) return false

    if (cartItem == !undefined) {
      cartItem.quantity += qty
    } else {
      this.http.post(this.cartUrl + '/cart/add', request)
        .subscribe(
          (response) => {
            if (response) {
              this.cartUpdateSubject.next();
              return response;
            }
          },
          (error) => {
          }
        );
    }
    return true;
  }

  // Add to Cart
  public addToCart(product: Product, selectedColor?: string, selectedSize?: string): any {
    const cartItem = state.cart.find((item: { id: any; }) => item.id === product.id);
    const qty = product.quantity ? product.quantity : 1;
    const items = cartItem ? cartItem : product;
    const stock = this.calculateStockCounts(items, qty);
    product?.variants.forEach((element: { color: any; size: any; variant_id: any; }) => {
      if (selectedColor === element.color && selectedSize === element.size) {
        this.variantid = element.variant_id;
      }
    });
    const request =
    {
      "cartItems": [
        {
          "variantid_qty": product.quantity || 1,
          "variantid": this.variantid,
          "productid": product.product_id
        }
      ],
      "userid": "1234"
    }
    if (!stock) return false

    if (cartItem == !undefined) {
      cartItem.quantity += qty
    } else {
      this.http.post(this.cartUrl + '/cart/add', request)
        .subscribe(
          (response) => {
            if (response) {
              this.cartUpdateSubject.next();
              return response;
            }
          },
          (error) => {
          }
        );
    }
    this.OpenCart = true; // If we use cart variation modal
    return true;
  }

  // Update Cart Quantity
  public updateCartQuantity(product: Product, quantity: number, deleteType: string | number | boolean, userId: number) {
    const variant_id = product.variants[0].variant_id;
    const params = new HttpParams()
      .set('variant_id', variant_id)
      .set('product_id', product.product_id)
      .set('user_id', '1234')
      .set('deleteType', deleteType);

    // Make the DELETE request with query parameters
    this.http.delete(this.cartUrl + '/cart/remove', { params })
      .subscribe(
        (response) => {
          if (response) {
            this.cartUpdateSubject.next();
          }
        },
        (error) => {
        },
        () => {
        }
      );
  }

  // Calculate Stock Counts
  public calculateStockCounts(product: { quantity: any; stock: any; }, quantity: any) {
    const qty = product.quantity + quantity
    const stock = product.stock
    if (stock < qty || stock == 0) {
      this.toastrService.error('You can not add more items than available. In stock ' + stock + ' items.');
      return false
    }
    return true
  }

  // Remove Cart items
  public removeCartItem(product: Product, deleteType?: string | number | boolean, userId?: number): any {
    // const index = state.cart.indexOf(product);
    // state.cart.splice(index, 1);
    const variant_id = product.variants[0].variant_id

    // Define the query parameters
    const params = new HttpParams()
      .set('variant_id', variant_id)
      .set('product_id', product.product_id)
      .set('user_id', '1234')
      .set('deleteType', deleteType);

    // Make the DELETE request with query parameters
    this.http.delete(this.cartUrl + '/cart/remove', { params })
      .subscribe(
        (response) => {
          if (response) {
            this.cartUpdateSubject.next();
          }
        },
        (error) => {
        }
      );
  }

  // Total amount 
  public cartTotalAmount(): Observable<number> {
    return this.getCartItems(1234).pipe(
      map((products) => {
        const totalAmount = products.reduce((total, product: Product) => {
          const price = product.discount ? product.price * (1 - product.discount / 100) : product.price;
          const subtotal = price * product.variants[0].variantid_qty;
          return total + subtotal * this.Currency.price;
        }, 0);
        return totalAmount;
      })
    );
  }  

  /*
    ---------------------------------------------
    ------------  Filter Product  ---------------
    ---------------------------------------------
  */

    //Get Products filter by category, brand, colors, size, minprice and max price
    newFilterProducts(category: string, brands: string[], colors: string[], sizes: string[], minPrice: number, maxPrice: number): Observable<any> {
      // Construct the query parameters
      let params = new HttpParams()
        .set('category', category)
        .set('brands', brands ? brands.join(',') : '')
        .set('colors', colors ? colors.join(',') : '')
        .set('sizes', sizes ? sizes.join(',') : '')
        .set('minPrice', minPrice ? minPrice.toString() : '0')
        .set('maxPrice', maxPrice ? maxPrice.toString() : '1000');
  
      // Make the GET request with the constructed query parameters
      return this.http.get(`${this.apiUrl}/product/filterProducts`, { params });
    }

  // Get Product Filter
  public oldFilterProducts(filter: any): Observable<Product[]> {
    this.products;
    return this.productRecords?.pipe(map(product =>
      product?.filter((item: Product) => {
        if (!filter.length) return true
        const Tags = filter.some((prev: any) => { // Match Tags
          if (item.tags) {
            if (item.tags.includes(prev)) {
              return prev
            }
          }
        })
        return Tags
      })
    ));
  }

/**
 * @method filterByColor
 */
public filterByColor(products: Product[], payload: string[]): any {
  if (!payload || payload.length === 0) {
    return products;
  } else {
    let uniqueProductIds = new Set<string>();
    let filterProducts = [];

    products.filter((data: any) => {
      if (data?.variants?.length > 0) {
        data.variants.filter((variant: any) => {
          if (payload.includes(variant.color) && !uniqueProductIds.has(data.product_id)) {
            uniqueProductIds.add(data.product_id);
            filterProducts.push(data);
          }
        });
      }
    });

    return filterProducts;
  }
}


/**
 * @method filterBySize
 */
public filterBySize(products: Product[], payload: string[]): any {
  if (!payload || payload.length === 0) {
    return products;
  } else {
    let uniqueProductIds = new Set<string>();
    return products.filter((data: any) => {
      if (data?.variants?.length > 0) {
        let filteredVariants = data.variants.filter((variant: any) => {
          // return payload.includes(variant.size);
          return payload == variant.size;
        });

        if (filteredVariants.length > 0 && !uniqueProductIds.has(data.product_id)) {
          uniqueProductIds.add(data.product_id);
          return true;
        }
      }
      return false;
    });
  }
}


  
/**
 * @method filterByBrand
 */
public filterByBrand(products: Product[], payload: string[]): any {
  if (!payload || payload.length === 0) {
    return products;
  } else {
    let uniqueProductIds = new Set<string>();
    let filterProducts = [];

    products.filter((data: any) => {
      if (payload.includes(data.brand) && !uniqueProductIds.has(data.product_id)) {
        uniqueProductIds.add(data.product_id);
        filterProducts.push(data);
      }
    });

    return filterProducts;
  }
}


/**
 * @method filterByPriceRange
 */
public filterByPriceRange(products: Product[], minPrice: number, maxPrice: number): any {
  if (minPrice === null && maxPrice === null) {
    return products;
  } else {
    return products.filter((product: Product) => {
      const productPrice = product.price || 0;
      return (minPrice === null || productPrice >= minPrice) && (maxPrice === null || productPrice <= maxPrice);
    });
  }
}


  // // Sorting Filter
  // public sortProducts(products: Product[], payload: string): any {
  //   if (!payload) { return products; }
  //   if (payload === 'ascending') {
  //     return products.sort((a, b) => {
  //       if (a.id < b.id) {
  //         return -1;
  //       } else if (a.id > b.id) {
  //         return 1;
  //       }
  //       return 0;
  //     })
  //   } else if (payload === 'a-z') {
  //     return products.sort((a, b) => {
  //       if (a.title < b.title) {
  //         return -1;
  //       } else if (a.title > b.title) {
  //         return 1;
  //       }
  //       return 0;
  //     })
  //   } else if (payload === 'z-a') {
  //     return products.sort((a, b) => {
  //       if (a.title > b.title) {
  //         return -1;
  //       } else if (a.title < b.title) {
  //         return 1;
  //       }
  //       return 0;
  //     })
  //   } else if (payload === 'low') {
  //     return products.sort((a, b) => {
  //       if (a.price < b.price) {
  //         return -1;
  //       } else if (a.price > b.price) {
  //         return 1;
  //       }
  //       return 0;
  //     })
  //   } else if (payload === 'high') {
  //     return products.sort((a, b) => {
  //       if (a.price > b.price) {
  //         return -1;
  //       } else if (a.price < b.price) {
  //         return 1;
  //       }
  //       return 0;
  //     })
  //   }
  // }

  // Sorting Filter
public sortProducts(products: Product[], payload: string): any {
  if (!payload) { return products; }
  
  const compareFunction = (a: string | number, b: string | number): number => {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    } else {
      return a < b ? -1 : (a > b ? 1 : 0);
    }
  };

  switch (payload) {
    case 'ascending':
      return products.sort((a, b) => compareFunction(a.id, b.id));
    case 'a-z':
      return products.sort((a, b) => compareFunction(a.title, b.title));
    case 'z-a':
      return products.sort((a, b) => compareFunction(b.title, a.title));
    case 'low':
      return products.sort((a, b) => compareFunction(a.price, b.price));
    case 'high':
      return products.sort((a, b) => compareFunction(b.price, a.price));
    default:
      return products;
  }
}

  /*
    ---------------------------------------------
    ------------- Product Pagination  -----------
    ---------------------------------------------
  */
  public getPager(totalItems: number, currentPage: number = 1, pageSize: number = 16) {
    // calculate total pages
    let totalPages = Math.ceil(totalItems / pageSize);

    // Paginate Range
    let paginateRange = 3;

    // ensure current page isn't out of range
    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    let startPage: number, endPage: number;
    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage < paginateRange - 1) {
      startPage = 1;
      endPage = startPage + paginateRange - 1;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }

    // calculate start and end item indexes
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    };
  }

}
