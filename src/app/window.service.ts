import { Injectable } from '@angular/core';

@Injectable()
export class WindowService {

    private width: number;
    private height: number;
    private aspect: number = 16/9;

  constructor() { }

    public resize(width: number) {
        this.width = width;
        this.height = width/this.aspect;
    }

    public getWidth() {
        return this.width;
    }

    public getHeight() {
        return this.height;
    }

    public getAspect() {
        return this.aspect;
    }

    public setAspect(aspect: number) {
        this.aspect = aspect;
    }

}
