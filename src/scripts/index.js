class ImageCompare {
  constructor(el, settings = {}) {
    const defaults = {
      controlColor: "#FFFFFF",
      controlShadow: true,
      smoothing: true,
      smoothingAmount: 100,
      hoverStart: false,
      verticalMode: false,
      fluidMode: false,
    };

    this.settings = Object.assign(defaults, settings);
    this.el = el;
    this.images = {};
    this.wrapper = null;
    this.control = null;
    this.arrowContainer = null;
    this.arrowAnimator = [];
    this.active = false;
    this.slideWidth = 50;
  }

  mount() {
    this._shapeContainer();
    this._getImages();
    this._buildControl();
    this._events();
  }

  _events() {
    // Desktop events
    this.el.addEventListener("mousedown", () => this._activate(true));
    this.el.addEventListener(
      "mousemove",
      (ev) => this.active && this._slideCompare(ev)
    );

    this.el.addEventListener("mouseup", () => this._activate(false));

    // Mobile events
    this.el.addEventListener("touchstart", () => this._activate(true));
    this.el.addEventListener(
      "touchmove",
      (ev) => this.active && this._slideCompare(ev)
    );
    this.el.addEventListener("touchend", () => this._activate(false));

    // hover

    this.el.addEventListener("mouseenter", () => {
      this.settings.hoverStart && this._activate(true);

      this.arrowAnimator.forEach((anim, i) => {
        anim.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.1s ease-out;
        ${
          this.settings.verticalMode
            ? `transform: translateY(0px);`
            : `transform: translateX(0px);`
        }
        `;
      });
    });

    this.el.addEventListener("mouseleave", () => {
      this._activate(false);

      this.arrowAnimator.forEach((anim, i) => {
        anim.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.1s ease-out;
        ${
          this.settings.verticalMode
            ? `transform: translateY(${i === 0 ? `10px` : `-10px`});`
            : `transform: translateX(${i === 0 ? `10px` : `-10px`});`
        }
        `;
      });
    });
  }

  _slideCompare(ev) {
    let bounds = this.el.getBoundingClientRect();
    let x =
      ev.touches !== undefined
        ? ev.touches[0].clientX - bounds.left
        : ev.clientX - bounds.left;
    let y =
      ev.touches !== undefined
        ? ev.touches[0].clientY - bounds.top
        : ev.clientY - bounds.top;

    let position = this.settings.verticalMode
      ? (y / bounds.height) * 100
      : (x / bounds.width) * 100;

    if (position >= 0 && position <= 100) {
      this.settings.verticalMode
        ? (this.control.style.top = `calc(${position}% - ${
            this.slideWidth / 2
          }px)`)
        : (this.control.style.left = `calc(${position}% - ${
            this.slideWidth / 2
          }px)`);

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
  }

  _activate(state) {
    this.active = state;
  }

  _shapeContainer() {
    let imposter = document.createElement("div");

    this.el.style.cssText += `
        position: relative;
        overflow: hidden;
        cursor: col-resize;
      `;

    imposter.style.cssText = `
    z-index: 4;
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    `;

    this.el.appendChild(imposter);
  }

  _buildControl() {
    let control = document.createElement("div");
    let uiLine = document.createElement("div");
    let arrows = document.createElement("div");
    const arrowSize = "20";

    arrows.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        ${this.settings.verticalMode && `flex-direction: column`};
        justify-content: space-between;
        align-items: center;
        position: absolute;
        transition: 0.1s ease-out;
        z-index: 5;
    `;

    for (var idx = 0; idx <= 1; idx++) {
      let animator = document.createElement(`div`);
      let arrow = `<svg
       style="
       transform: 
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
       -webkit-filter: drop-shadow( 0px 3px 5px rgba(0, 0, 0, .5));
       filter: drop-shadow( 0px ${
         idx === 0 ? "-3px" : "3px"
       } 5px rgba(0, 0, 0, .5));
       `
           : ``
       }
       "
       xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 42 86.6">
       <path fill="${
         this.settings.controlColor
       }" d="M0 43.3V0l21 21.6 21 21.7L21 65 0 86.6V43.3z"/>
     </svg>`;
      animator.innerHTML += arrow;
      this.arrowAnimator.push(animator);
      arrows.appendChild(animator);
    }

    this.arrowAnimator.forEach((anim, i) => {
      anim.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.1s ease-out;
      ${
        this.settings.verticalMode
          ? `transform: translateY(${i === 0 ? `10px` : `-10px`});`
          : `transform: translateX(${i === 0 ? `10px` : `-10px`});`
      }
      `;
    });

    control.style.cssText = `
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    height: ${this.settings.verticalMode ? `${this.slideWidth}px;` : `100%;`}
    width: ${this.settings.verticalMode ? `100%;` : `${this.slideWidth}px;`}
    top: ${
      this.settings.verticalMode
        ? `calc(50% - ${this.slideWidth / 2}px);`
        : `0px;`
    }
    left: ${
      this.settings.verticalMode
        ? `0px;`
        : `calc(50% - ${this.slideWidth / 2}px);`
    }
    z-index: 5;
    ${
      "ontouchstart" in document.documentElement
        ? ``
        : this.settings.smoothing
        ? `transition: ${this.settings.smoothingAmount}ms ease-out;`
        : ``
    }
    `;

    uiLine.style.cssText = `
        height: ${this.settings.verticalMode ? "3px" : "100%"};
        width: ${this.settings.verticalMode ? "100%" : "3px"};
        z-index: 6;
        background: ${this.settings.controlColor};
        ${
          this.settings.controlShadow &&
          `box-shadow: 0px 0px 15px rgba(0,0,0,0.5);`
        }
    `;

    control.appendChild(uiLine);
    control.appendChild(arrows);

    this.arrowContainer = arrows;

    this.control = control;
    this.el.appendChild(control);
  }

  _getImages() {
    let children = this.el.children;
    children = [...children].filter((el) => el.nodeName === "IMG");

    this.settings.verticalMode && children.reverse();

    for (let idx = 0; idx <= 1; idx++) {
      let child = children[idx];

      child.style.cssText = `
      width: ${
        idx === 1 ? (this.settings.verticalMode ? `100%` : `auto`) : `100%`
      };
      height: ${
        idx === 1 ? (this.settings.verticalMode ? `auto` : `100%`) : `auto`
      };
      position: ${idx === 1 ? `absolute` : `static`};
      z-index: ${idx === 0 ? "1" : "2"};
      ${idx === 1 ? `right: 0;` : `left: 0;`};
      top: 0;
      display: ${this.settings.fluidMode ? "none" : "block"};
      pointer-events: none;
      -khtml-user-select: none;
      -o-user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      user-select: none;
      max-width: none;
      `;

      if (idx === 1) {
        let wrapper = document.createElement("div");
        let afterUrl = children[1].src;
        wrapper.style.cssText = `
            position: absolute;
            width: ${
              this.settings.fluidMode || this.settings.verticalMode
                ? "100%"
                : "50%"
            };
            height: 100%;
            right: 0;
            top: 0;
            overflow: hidden;
            background-size: cover;
            background-position: center;
            z-index: 3;
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
                this.settings.verticalMode ? ` 0 0 50% 0` : `0 0 0 50%`
              })`
            }
        `;

        wrapper.appendChild(child);
        this.wrapper = wrapper;
        this.el.appendChild(this.wrapper);
      }
    }
    if (this.settings.fluidMode) {
      let url = children[0].src;
      let fluidWrapper = document.createElement("div");
      fluidWrapper.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url(${url});
        background-size: cover;
        background-position: center;
      `;
      this.el.appendChild(fluidWrapper);
    }
  }
}

// const el = document.getElementById("image-compare");

// let viewer = new ImageCompare(el, {
//   verticalMode: true,
//   fluidMode: true,
// }).mount();

export default ImageCompare;
