import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true,
})
export class TimeFormatPipe implements PipeTransform {

  transform(value: number | null): string {
    if (value == null) return '0:00';
    
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
