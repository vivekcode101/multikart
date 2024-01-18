import { Component, OnInit, Input } from '@angular/core';
import { HomeSlider } from '../../../shared/data/slider';
import { ProductService } from 'src/app/shared/services/product.service';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
  
  @Input() sliders: any[];
  @Input() class: string;
  @Input() textClass: string;
  @Input() category?: string;
  @Input() buttonText: string;
  @Input() buttonClass: string;
  public request: string;

  constructor(private router: Router) { }

  ngOnInit(): void {    
  }

  onShopNow(subCategory:any){
      subCategory === 'Men' ? this.request = 'Men' : this.request ='Women';
      let navigationExtras: NavigationExtras = {
        queryParams: { 'category': this.request },
        fragment: 'anchor'};
        this.router.navigate(['/shop/collection/left/sidebar/'], navigationExtras);
  }

  public HomeSliderConfig: any = HomeSlider;

}
