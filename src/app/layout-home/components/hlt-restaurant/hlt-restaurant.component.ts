import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-hlt-restaurant',
  standalone: false,
  templateUrl: './hlt-restaurant.component.html',
  styleUrl: './hlt-restaurant.component.scss'
})
export class HltRestaurantComponent implements OnInit{
 @Input() label: string = 'Description';
  @Input() required: boolean = false;
  @Input() initialValue: string = ''; // New input for initial description

  @Output() TextAreaValue = new EventEmitter<string>();

  textareaControl!: FormControl;

  ngOnInit() {
    this.textareaControl = new FormControl(
      this.initialValue, // Set initial value from input
      this.required ? [Validators.required] : []
    );
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.TextAreaValue.emit(value);
  }
}
