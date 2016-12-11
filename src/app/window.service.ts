import { Injectable } from '@angular/core';

@Injectable()
export class WindowService {

    private width: number;
    private height: number;
    private aspect: number = 16/9;
    
    private element: any;
    //private fullscreen: boolean = false;

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

    public initialize(element) {
        this.element = element;
        this.resize(element.offsetWidth);
        //document.addEventListener('onfullscreenchange', (event) => { // TODO: Decouple from DOM
        //    this.fullscreen = (document.fullscreenElement === this.element) ? true : false;
        //});
    }

    //public requestFullscreen() {
    //    this.element.requestFullscreen();
    //}

    //public exitFullscreen() {
    //    this.element.exitFullscreen();
    //}

    //public isFullscreen() {
    //    return this.fullscreen;
    //}

}
