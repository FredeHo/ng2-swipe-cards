import {
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Renderer,
  Input,
  Output,
  OnInit,
  OnDestroy
}
from '@angular/core';


@Directive({
  selector: '[tinder-card]',
  host: {
    class: 'card-heap'
  }
})
export class TinderCardDirective implements OnInit, OnDestroy {
  _overlay: any;
  @Input('tinder-card')
  set overlay(value: any) {
    this._overlay = value || {};
  }
  _callLike: EventEmitter<any>;
  @Input('callLike')
  set callLike(value: EventEmitter<any>) {
    this._callLike = value || new EventEmitter<any>();
    this.initCallLike();
  }

  @Input() fixed: boolean;
  @Input() orientation: string = 'xy';

  @Output() onLike: EventEmitter<any> = new EventEmitter();

  action: string;

  element: HTMLElement;
  renderer: Renderer;
  overlayElement: HTMLElement;

  constructor(el: ElementRef, renderer: Renderer) {
    this.renderer = renderer;
    this.element = el.nativeElement;
  }

  onReleaseLikeCb(event: any) {
    this.action = event.action;
    let el = this.element;
    let x = (el.offsetWidth + el.clientWidth) * ((event.action == "like" ? 1 : event.action == "dislike" ? 0 : 1) || 0);
    let rotate = (x * 20) / el.clientWidth;

    if (this._overlay) {
      let overlayElm = <HTMLElement>this.element.querySelector('.tinder-overlay');
      this.renderer.setElementStyle(overlayElm, "transition", "transform 0.6s ease");
      this.renderer.setElementStyle(overlayElm, "opacity", "0.5");
    }
  }

  onSwipeLikeCb(event: any) {
    if (this._overlay) {
      let overlayElm = <HTMLElement>this.element.querySelector('.tinder-overlay');
      this.renderer.setElementStyle(overlayElm, "transition", "opacity 0s ease");
      let opacity = Math.max(((event.distance < 0 ? event.distance * -1 : event.distance) * 0.5 / this.element.offsetWidth), ((event.distance < 0 ? event.distance * -1 : event.distance) * 0.5 / this.element.offsetWidth));
      this.renderer.setElementStyle(overlayElm, "opacity", opacity.toString());
    }
  }

  destroy(delay: number = 0) {
    setTimeout(() => {
      this.element.remove();
    }, 200);
  }

  @HostListener('onSwipe', ['$event'])
  onSwipe(event: any) {
    let action;

    if(event.deltaX > 0)
    {
      action = "like"
    } else {
      action = "dislike";
    }

    if(event.deltaY > 0)
    {
      if(Math.abs(event.deltaX) < Math.abs(event.deltaY)) action = "ignore";
    } else {
      if(Math.abs(event.deltaX) < Math.abs(event.deltaY)) action = "watchlist";
    }

      let opacity = Math.max(((event.distance < 0 ? event.distance * -1 : event.distance) * 0.5 / this.element.offsetWidth), ((event.distance < 0 ? event.distance * -1 : event.distance) * 0.5 / this.element.offsetWidth));
      
    if (!!this._overlay) {
      this.renderer.setElementStyle(this.overlayElement, "transition", "opacity 0s ease");
      this.renderer.setElementStyle(this.overlayElement, "opacity", opacity.toString());
      this.renderer.setElementStyle(this.overlayElement, "background-color", this._overlay[action].backgroundColor);
    }
    this.translate({
      x: event.deltaX,
      y: event.deltaY,
      rotate: ((event.deltaX * 20) / this.element.clientWidth)
    });
  }

  @HostListener('onAbort', ['$event'])
  onAbort(event: any) {
    if (!!this._overlay) {
      this.renderer.setElementStyle(this.overlayElement, "transition", "opacity 0.2s ease");
      this.renderer.setElementStyle(this.overlayElement, "opacity", "0");
    }
  }

  @HostListener('onRelease', ['$event'])
  onRelease(event: any) {
    let action;

    if(event.deltaX > 0)
    {
      action = "like"
    } else {
      action = "dislike";
    }

    if(event.deltaY > 0)
    {
      if(Math.abs(event.deltaX) < Math.abs(event.deltaY)) action = "ignore";
    } else {
      if(Math.abs(event.deltaX) < Math.abs(event.deltaY)) action = "watchlist";
    }
    if (this._callLike) {
      this._callLike.emit({ action });
    }
    if (this.onLike) {
      this.onLike.emit({ action });
    }
  }

  translate(params: any) {
    if (!this.fixed) {
      this.renderer.setElementStyle(this.element, "transition", "transform " + (params.time || 0) + "s ease");
      this.renderer.setElementStyle(this.element, "webkitTransform", "translate3d(" +
        (params.x && (!this.orientation || this.orientation.indexOf("x") != -1) ? (params.x) : 0) +
        "px, " +
        (params.y && (!this.orientation || this.orientation.indexOf("y") != -1) ? (params.y) : 0) +
        "px, 0) rotate(" +
        params.rotate +
        "deg)");
    }
  }

  initOverlay() {
    if (!!this._overlay) {
      this.overlayElement = document.createElement("div");
      this.overlayElement.className += " card-overlay";
      this.element.appendChild(this.overlayElement);
      this.renderer.setElementStyle(this.overlayElement, "transform", "translateZ(0)");
      this.renderer.setElementStyle(this.overlayElement, "opacity", "0");
      this.renderer.setElementStyle(this.overlayElement, "border-radius", "2px");
      this.renderer.setElementStyle(this.overlayElement, "position", "absolute");
      this.renderer.setElementStyle(this.overlayElement, "width", "100%");
      this.renderer.setElementStyle(this.overlayElement, "height", "100%");
      this.renderer.setElementStyle(this.overlayElement, "top", "0");
      this.renderer.setElementStyle(this.overlayElement, "left", "0");
      this.renderer.setElementStyle(this.overlayElement, "display", "flex");
      this.renderer.setElementStyle(this.overlayElement, "align-items", "center");
      this.renderer.setElementStyle(this.overlayElement, "justify-content", "center");
      this.renderer.setElementStyle(this.overlayElement, "overflow", "hidden");
      this.renderer.setElementStyle(this.overlayElement, "color", "white");
    }
  }

  ngOnInit() {
    this.initOverlay();

    this._overlay = this._overlay || {};
    this.orientation = this.orientation || "xy";
    this._callLike = this._callLike || new EventEmitter();
    this.initCallLike();
  }

  initCallLike() {
    this._callLike.subscribe((params: any) => {
      let el = this.element;
      let x = (el.offsetWidth + el.clientWidth) * (params.like ? 1 : -1);
      let y = (el.offsetHeight + el.clientHeight) * (params.like ? -1 : 1);
      this.translate({
        x: x,
        y: y,
        rotate: (x * 20) / el.clientWidth,
        time: 0.8
      });
      this.renderer.setElementStyle(this.overlayElement, "transition", "opacity 0.4s ease");
      this.renderer.setElementStyle(this.overlayElement, "opacity", "0.5");
      this.renderer.setElementStyle(this.overlayElement, "background-color", this._overlay[params.like ? "like" : "dislike"].backgroundColor);
      this.destroy(200);
    });
  }

  ngOnDestroy() {
    if (this._callLike) {
      this._callLike.unsubscribe();
    }
  }
}
