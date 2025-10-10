import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-hlttable-reusable',
  standalone: false,
  templateUrl: './hlttable-reusable.component.html',
  styleUrl: './hlttable-reusable.component.scss'
})
export class HlttableReusableComponent {
  @Input() initialQuantity: number = 1;
  @Input() minQuantity: number = 1;
  @Output() quantityChange = new EventEmitter<number>();
  @Output() quantityModified = new EventEmitter<boolean>();

  quantity: number = 1;
  tempQuantity: number = 1;
  isModified: boolean = false;

  ngOnInit() {
    this.quantity = this.initialQuantity >= this.minQuantity ? this.initialQuantity : this.minQuantity;
    this.tempQuantity = this.quantity;
    this.quantityChange.emit(this.quantity); // Emit initial quantity
  }

  increment() {
    this.tempQuantity++;
    this.isModified = this.tempQuantity !== this.quantity;
    this.quantityChange.emit(this.tempQuantity); // Emit new quantity
    this.quantityModified.emit(this.isModified);
  }

  decrement() {
    if (this.tempQuantity > this.minQuantity) {
      this.tempQuantity--;
      this.isModified = this.tempQuantity !== this.quantity;
      this.quantityChange.emit(this.tempQuantity); // Emit new quantity
      this.quantityModified.emit(this.isModified);
    }
  }

  onInputChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value >= this.minQuantity) {
      this.tempQuantity = value;
      this.isModified = this.tempQuantity !== this.quantity;
      this.quantityChange.emit(this.tempQuantity); // Emit new quantity
      this.quantityModified.emit(this.isModified);
    } else {
      this.tempQuantity = this.minQuantity;
      this.isModified = this.tempQuantity !== this.quantity;
      this.quantityChange.emit(this.tempQuantity); // Emit new quantity
      this.quantityModified.emit(this.isModified);
    }
  }

  confirmQuantity() {
    this.quantity = this.tempQuantity;
    this.isModified = false;
    this.quantityChange.emit(this.quantity);
    this.quantityModified.emit(this.isModified);
  }

  resetQuantity() {
    this.tempQuantity = this.quantity;
    this.isModified = false;
    this.quantityChange.emit(this.tempQuantity); // Emit reset quantity
    this.quantityModified.emit(this.isModified);
  }
}
