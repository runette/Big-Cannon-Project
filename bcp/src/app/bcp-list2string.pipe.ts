import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'List2string'
})
export class BcpList2stringPipe implements PipeTransform {

  transform(value: string[], ): string {

    return value.join();
  }

}
