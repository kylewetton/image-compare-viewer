// uncomment for packing
// import "../styles/index.scss";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

class ImageCompare {
  constructor(el, settings = {}) {
    const defaults = {
      controlColor: "#FFFFFF",
      controlShadow: true,
      addCircle: false,
      addCircleBlur: true,
      showLabels: false,
      labelOptions: {
        before: "Before",
        after: "After",
        onHover: false,
      },
      smoothing: true,
      smoothingAmount: 100,
      hoverStart: false,
      verticalMode: false,
      startingPoint: 50,
      fluidMode: false,
    };

    this.settings = Object.assign(defaults, settings);
    this.animationFrameId = null;

    this.safariAgent =
      navigator.userAgent.indexOf("Safari") != -1 &&
      navigator.userAgent.indexOf("Chrome") == -1;

    this.el = el;
    this.images = {};
    this.wrapper = null;
    this.control = null;
    this.arrowContainer = null;
    this.arrowAnimator = [];
    this.active = false;
    this.slideWidth = 50;
    this.lineWidth = 2;
    this.arrowCoordinates = {
      circle: [5, 3],
      standard: [8, 0],
    };
  }

  mount() {
    // Temporarily disable Safari smoothing
    if (this.safariAgent) {
      this.settings.smoothing = false;
    }

    this._shapeContainer();
    this._getImages();
    this._buildControl();
    this._events();
  }

  _events() {
    let bodyStyles = `

    `;

    // Desktop events
    this.el.addEventListener("mousedown", (ev) => {
      this._activate(true);
      document.body.classList.add("icv__body");
      disableBodyScroll(this.el, {reserveScrollBarGap: true});
      this._slideCompare(ev);
    });
    this.el.addEventListener(
      "mousemove",
      (ev) => this.active && this._slideCompare(ev)
    );

    this.el.addEventListener("mouseup", () => this._activate(false));
    document.body.addEventListener("mouseup", () => {
      document.body.classList.remove("icv__body");
      enableBodyScroll(this.el);
      this._activate(false);
    });

    // Mobile events

    this.control.addEventListener("touchstart", (e) => {
      this._activate(true);
      document.body.classList.add("icv__body");
      disableBodyScroll(this.el, {reserveScrollBarGap: true});
    });

    this.el.addEventListener("touchmove", (ev) => {
      this.active && this._slideCompare(ev);
    });
    this.el.addEventListener("touchend", () => {
      this._activate(false);
      document.body.classList.remove("icv__body");
      enableBodyScroll(this.el);
    });

    // hover

    this.el.addEventListener("mouseenter", () => {
      this.settings.hoverStart && this._activate(true);
      let coord = this.settings.addCircle
        ? this.arrowCoordinates.circle
        : this.arrowCoordinates.standard;

      this.arrowAnimator.forEach((anim, i) => {
        anim.style.cssText = `
        ${
          this.settings.verticalMode
            ? `transform: translateY(${coord[1] * (i === 0 ? 1 : -1)}px);`
            : `transform: translateX(${coord[1] * (i === 0 ? 1 : -1)}px);`
        }
        `;
      });
    });

    this.el.addEventListener("mouseleave", () => {
      let coord = this.settings.addCircle
        ? this.arrowCoordinates.circle
        : this.arrowCoordinates.standard;

      this.arrowAnimator.forEach((anim, i) => {
        anim.style.cssText = `
        ${
          this.settings.verticalMode
            ? `transform: translateY(${
                i === 0 ? `${coord[0]}px` : `-${coord[0]}px`
              });`
            : `transform: translateX(${
                i === 0 ? `${coord[0]}px` : `-${coord[0]}px`
              });`
        }
        `;
      });
    });
  }

  _slideCompare (ev) {
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        const bounds = this.el.getBoundingClientRect();
        const x = ev.touches !== undefined ? ev.touches[0].clientX - bounds.left : ev.clientX - bounds.left;
        const y = ev.touches !== undefined ? ev.touches[0].clientY - bounds.top : ev.clientY - bounds.top;
        const position = this.settings.verticalMode ? (y / bounds.height) * 100 : (x / bounds.width) * 100;

        if (position >= 0 && position <= 100) {
          this.settings.verticalMode
            ? (this.control.style.top = `calc(${position}% - ${this.slideWidth / 2}px)`)
            : (this.control.style.left = `calc(${position}% - ${this.slideWidth / 2}px)`);

          if (this.settings.fluidMode) {
            this.settings.verticalMode
              ? (this.wrapper.style.clipPath = `inset(0 0 ${100 - position}% 0)`)
              : (this.wrapper.style.clipPath = `inset(0 0 0 ${position}%)`);
          } else {
            this.settings.verticalMode
              ? (this.wrapper.style.height = `calc(${position}%)`)
              : (this.wrapper.style.width = `calc(${100 - position}%)`);
          }
        }

        this.animationFrameId = null;
      });
    }
  }

  _activate(state) {
    this.active = state;
  }

  _shapeContainer() {
    let imposter = document.createElement("div");
    let label_l = document.createElement("span");
    let label_r = document.createElement("span");

    label_l.classList.add("icv__label", "icv__label-before", "keep");
    label_r.classList.add("icv__label", "icv__label-after", "keep");

    if (this.settings.labelOptions.onHover) {
      label_l.classList.add("on-hover");
      label_r.classList.add("on-hover");
    }

    if (this.settings.verticalMode) {
      label_l.classList.add("vertical");
      label_r.classList.add("vertical");
    }

    label_l.innerHTML = this.settings.labelOptions.before || "Before";
    label_r.innerHTML = this.settings.labelOptions.after || "After";

    if (this.settings.showLabels) {
      this.el.appendChild(label_l);
      this.el.appendChild(label_r);
    }

    this.el.classList.add(
      `icv`,
      this.settings.verticalMode
        ? `icv__icv--vertical`
        : `icv__icv--horizontal`,
      this.settings.fluidMode ? `icv__is--fluid` : `standard`
    );

    imposter.classList.add("icv__imposter");

    this.el.appendChild(imposter);
  }

  _buildControl() {
    let control = document.createElement("div");
    let uiLine = document.createElement("div");
    let arrows = document.createElement("div");
    let circle = document.createElement("div");

    const arrowSize = "20";

    arrows.classList.add("icv__theme-wrapper");

    for (var idx = 0; idx <= 1; idx++) {
      let animator = document.createElement(`div`);

      let arrow = `<svg
      height="15"
      width="15"
       style="
       transform: 
       scale(${this.settings.addCircle ? 0.7 : 1.5})  
       rotateZ(${
         idx === 0
           ? this.settings.verticalMode
             ? `-90deg`
             : `180deg`
           : this.settings.verticalMode
           ? `90deg`
           : `0deg`
       }); height: ${arrowSize}px; width: ${arrowSize}px;
       
       ${
         this.settings.controlShadow
           ? `
       -webkit-filter: drop-shadow( 0px 3px 5px rgba(0, 0, 0, .33));
       filter: drop-shadow( 0px ${
         idx === 0 ? "-3px" : "3px"
       } 5px rgba(0, 0, 0, .33));
       `
           : ``
       }
       "
       xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 15 15">
       <path ${
         this.settings.addCircle
           ? `fill="transparent"`
           : `fill="${this.settings.controlColor}"`
       }
       stroke="${this.settings.controlColor}"
       stroke-linecap="round"
       stroke-width="${this.settings.addCircle ? 3 : 0}"
       d="M4.5 1.9L10 7.65l-5.5 5.4"
       />
     </svg>`;

      animator.innerHTML += arrow;
      this.arrowAnimator.push(animator);
      arrows.appendChild(animator);
    }

    let coord = this.settings.addCircle
      ? this.arrowCoordinates.circle
      : this.arrowCoordinates.standard;

    this.arrowAnimator.forEach((anim, i) => {
      anim.classList.add("icv__arrow-wrapper");

      anim.style.cssText = `
      ${
        this.settings.verticalMode
          ? `transform: translateY(${
              i === 0 ? `${coord[0]}px` : `-${coord[0]}px`
            });`
          : `transform: translateX(${
              i === 0 ? `${coord[0]}px` : `-${coord[0]}px`
            });`
      }
      `;
    });

    control.classList.add("icv__control");

    control.style.cssText = `
    ${this.settings.verticalMode ? `height` : `width `}: ${this.slideWidth}px;
    ${this.settings.verticalMode ? `top` : `left `}: calc(${
      this.settings.startingPoint
    }% - ${this.slideWidth / 2}px);
    ${
      "ontouchstart" in document.documentElement
        ? ``
        : this.settings.smoothing
        ? `transition: ${this.settings.smoothingAmount}ms ease-out;`
        : ``
    }
    `;

    uiLine.classList.add("icv__control-line");

    uiLine.style.cssText = `
      ${this.settings.verticalMode ? `height` : `width `}: ${this.lineWidth}px;
      background: ${this.settings.controlColor};
        ${
          this.settings.controlShadow
            ? `box-shadow: 0px 0px 15px rgba(0,0,0,0.33);`
            : ``
        }
    `;

    let uiLine2 = uiLine.cloneNode(true);

    circle.classList.add("icv__circle");
    circle.style.cssText = `

      ${
        this.settings.addCircleBlur &&
        `-webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px)`
      };
      
      border: ${this.lineWidth}px solid ${this.settings.controlColor};
      ${
        this.settings.controlShadow &&
        `box-shadow: 0px 0px 15px rgba(0,0,0,0.33)`
      };
    `;

    control.appendChild(uiLine);
    this.settings.addCircle && control.appendChild(circle);
    control.appendChild(arrows);
    control.appendChild(uiLine2);

    this.arrowContainer = arrows;

    this.control = control;
    this.el.appendChild(control);
  }

  _getImages() {
    let children = this.el.querySelectorAll("img, video, .keep");
    this.el.innerHTML = "";
    children.forEach((img) => {
      this.el.appendChild(img);
    });

    let childrenImages = [...children].filter(
      (element) => ["img", "video"].includes(element.nodeName.toLowerCase())
    );

    //  this.settings.verticalMode && [...children].reverse();
    this.settings.verticalMode && childrenImages.reverse();

    for (let idx = 0; idx <= 1; idx++) {
      let child = childrenImages[idx];

      child.classList.add("icv__img");
      child.classList.add(idx === 0 ? `icv__img-a` : `icv__img-b`);

      if (idx === 1) {
        let wrapper = document.createElement("div");
        let afterUrl = childrenImages[1].src;
        wrapper.classList.add("icv__wrapper");
        wrapper.style.cssText = `
            width: ${100 - this.settings.startingPoint}%; 
            height: ${this.settings.startingPoint}%;

            ${
              "ontouchstart" in document.documentElement
                ? ``
                : this.settings.smoothing
                ? `transition: ${this.settings.smoothingAmount}ms ease-out;`
                : ``
            }
            ${
              this.settings.fluidMode &&
              `background-image: url(${afterUrl}); clip-path: inset(${
                this.settings.verticalMode
                  ? ` 0 0 ${100 - this.settings.startingPoint}% 0`
                  : `0 0 0 ${this.settings.startingPoint}%`
              })`
            }
        `;

        wrapper.appendChild(child);
        this.wrapper = wrapper;
        this.el.appendChild(this.wrapper);
      }
    }
    if (this.settings.fluidMode) {
      let url = childrenImages[0].src;
      let fluidWrapper = document.createElement("div");
      fluidWrapper.classList.add("icv__fluidwrapper");
      fluidWrapper.style.cssText = `
 
        background-image: url(${url});
        
      `;
      this.el.appendChild(fluidWrapper);
    }
  }
}

// const el = document.querySelectorAll(".image-compare");

// el.forEach((viewer) => {
//   let v = new ImageCompare(viewer, {
//     controlShadow: false,
//     addCircle: true,
//     addCircleBlur: true,
//     showLabels: true,
//     labelOptions: {
//       onHover: true,
//       before: "Draft",
//       after: "Final",
//     },
//   }).mount();
// });

export default ImageCompare;
