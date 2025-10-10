import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-time-toggle',
  standalone: false,
  templateUrl: './time-toggle.component.html',
  styleUrl: './time-toggle.component.scss'
})
export class TimeToggleComponent {
 timeForm: FormGroup;
  hour: number;
  minute: number;
  meridian: 'am' | 'pm';
  currentHour: number;
  currentMinute: number;
  currentMeridian: 'am' | 'pm';
  showTimePicker: boolean = false; // Controls visibility of time picker vs dropdown
  selectedDuration: number | null = null; // Selected hours from dropdown
  hours: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Dropdown options

  constructor(
    public dialogRef: MatDialogRef<TimeToggleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentTime: string },
    private fb: FormBuilder
  ) {
    this.timeForm = this.fb.group({
      endTime: ['']
    });
    // Initialize properties to avoid undefined errors
    this.hour = 0;
    this.minute = 0;
    this.meridian = 'am';
    this.currentHour = 0;
    this.currentMinute = 0;
    this.currentMeridian = 'am';
  }

  ngOnInit(): void {
    const now = new Date();
    this.currentHour = now.getHours();
    this.currentMinute = now.getMinutes();
    this.currentMeridian = this.currentHour >= 12 ? 'pm' : 'am';

    const h12 = this.currentHour % 12 || 12;
    this.hour = h12;
    this.minute = this.currentMinute;
    this.meridian = this.currentMeridian;

    // Set default dropdown value to 1hr
    this.selectedDuration = 1;
    this.onDurationChange(); // Calculate initial time based on 1hr
  }

  updateTimeFormValue() {
    this.timeForm.get('endTime')?.setValue(`${this.pad(this.hour)}:${this.pad(this.minute)} ${this.meridian}`);
  }

  pad(value: number): string {
    return value < 10 ? '0' + value : '' + value;
  }

  onDurationChange(): void {
    if (this.selectedDuration !== null) {
      const now = new Date();
      const newTime = new Date(now.getTime() + this.selectedDuration * 60 * 60 * 1000); // Add selected hours
      this.hour = newTime.getHours() % 12 || 12;
      this.minute = newTime.getMinutes();
      this.meridian = newTime.getHours() >= 12 ? 'pm' : 'am';
      this.updateTimeFormValue();
    }
  }

  toggleTimePicker(): void {
    this.showTimePicker = true;
  }

  increaseHour() {
    let newHour = this.hour;
    let newMeridian = this.meridian;

    if (newHour === 1) { // If currently 1 AM/PM, going down means 12 PM/AM
      newHour = 12;
      newMeridian = this.toggleMeridianValue(this.meridian);
    } else {
      newHour--;
    }

    const testDate = this.get24HourTime(newHour, this.minute, newMeridian);

    // Only decrease if the new time is not before the current time
    if (!this.isBeforeCurrent(testDate)) {
      this.hour = newHour;
      this.meridian = newMeridian;
      this.updateTimeFormValue();
    }
  }

  decreaseHour() {
    this.hour = (this.hour % 12) + 1;
    if (this.hour === 12) {
      this.toggleMeridian();
    }
    this.updateTimeFormValue();
  }

  increaseMinute() {
    let newHour = this.hour;
    let newMinute = this.minute - 1;
    let newMeridian = this.meridian;

    if (newMinute < 0) {
      newMinute = 59;
      if (newHour === 1) {
        newHour = 12;
        newMeridian = this.toggleMeridianValue(this.meridian);
      } else {
        newHour -= 1;
      }
    }

    const testDate = this.get24HourTime(newHour, newMinute, newMeridian);

    if (!this.isBeforeCurrent(testDate)) {
      this.minute = newMinute;
      this.hour = newHour;
      this.meridian = newMeridian;
      this.updateTimeFormValue();
    }
  }

  decreaseMinute() {
    this.minute += 1;
    if (this.minute >= 60) {
      this.minute = 0;
      this.decreaseHour();
    }
    this.updateTimeFormValue();
  }

  toggleMeridian() {
    this.meridian = this.meridian === 'am' ? 'pm' : 'am';
    this.updateTimeFormValue();
  }

  toggleMeridianValue(current: 'am' | 'pm'): 'am' | 'pm' {
    return current === 'am' ? 'pm' : 'am';
  }

  get24HourTime(h12: number, min: number, mer: 'am' | 'pm'): Date {
    let hour24 = h12;
    if (mer === 'pm' && h12 !== 12) hour24 += 12;
    if (mer === 'am' && h12 === 12) hour24 = 0;

    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour24, min);
  }

  isBeforeCurrent(date: Date): boolean {
    const now = new Date();
    const currentComparable = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
    return date < currentComparable;
  }

  onOffImmediately(): void {
    this.dialogRef.close('off');
  }

  onSave(): void {
    const formatted = this.convertTo24Hour(this.timeForm.get('endTime')?.value);
    this.dialogRef.close(formatted);
  }

  convertTo24Hour(time12: string): string {
    if (!time12) return '';
    const [timePart, period] = time12.split(' ');
    const [hours, minutes] = timePart.split(':');
    let h = parseInt(hours, 10);
    if (period === 'pm' && h !== 12) h += 12;
    if (period === 'am' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minutes}`;
  }
}
