/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CannonService } from './cannon.service';

describe('CannonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CannonService]
    });
  });

  it('should ...', inject([CannonService], (service: CannonService) => {
    expect(service).toBeTruthy();
  }));
});
