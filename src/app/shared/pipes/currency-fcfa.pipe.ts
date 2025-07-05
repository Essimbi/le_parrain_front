import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFcfa'
})
export class CurrencyFcfaPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
