/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MouseService } from './mouse.service';

describe('MouseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MouseService]
    });
  });

  it('should ...', inject([MouseService], (service: MouseService) => {
    expect(service).toBeTruthy();
  }));
});
