import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../../../../shared/classes/product';
import { ProductService } from '../../../../shared/services/product.service';

@Component({
  selector: 'app-related-product',
  templateUrl: './related-product.component.html',
  styleUrls: ['./related-product.component.scss']
})
export class RelatedProductComponent implements OnInit {

  @Input() type: string

  public products: Product[] = [];

  constructor(public productService: ProductService) { }

  ngOnInit(): void {
    this.productService.getProducts.subscribe(response => {
      if (response) {
        this.products = response.filter(item => item.type == this.type)
      }
    }
    );
  }

}
