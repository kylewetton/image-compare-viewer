class ImageCompare {
  constructor(el, settings = {}) {
    const defaults = {
      smoothing: true,
      smoothingAmount: 100,
      controlColor: "#FFFFFF",
      controlShadow: true,
      fluidMode: false,
    };

    this.settings = Object.assign(defaults, settings);
    this.el = el;
    this.images = {};
    this.wrapper = null;
    this.control = null;
    this.arrowContainer = null;
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
    this.el.addEventListener("mouseleave", () => this._activate(false));

    // Mobile events
    this.el.addEventListener("touchstart", () => this._activate(true));
    this.el.addEventListener(
      "touchmove",
      (ev) => this.active && this._slideCompare(ev)
    );
    this.el.addEventListener("touchend", () => this._activate(false));

    // hover

    this.el.addEventListener("mouseenter", () => {
      this.arrowContainer.style.width = "100%";
    });

    this.el.addEventListener("mouseleave", () => {
      this.arrowContainer.style.width = "50%";
    });
  }

  _slideCompare(ev) {
    let bounds = this.el.getBoundingClientRect();
    let x =
      ev.touches !== undefined
        ? ev.touches[0].clientX - bounds.left
        : ev.clientX - bounds.left;
    let position = (x / bounds.width) * 100;
    if (position >= 0 && position <= 100) {
      this.control.style.left = `calc(${position}% - ${this.slideWidth / 2}px)`;
      if (this.settings.fluidMode) {
        this.wrapper.style.clipPath = `inset(0 0 0 ${position}%)`;
      } else {
        this.wrapper.style.width = `calc(${100 - position}%)`;
      }
    }
  }

  _activate(state) {
    this.active = state;
  }

  _shapeContainer() {
    let imposter = document.createElement("div");

    this.el.style.cssText = `
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
        width: 50%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: absolute;
        transition: 0.1s ease-out;
        z-index: 5;
    `;

    for (var idx = 0; idx <= 1; idx++) {
      let arrow = `<svg
       style="transform: rotateZ(${
         idx === 0 ? `180deg` : `0deg`
       }); height: ${arrowSize}px; width: ${arrowSize}px;
       
       ${
         this.settings.controlShadow &&
         `
       -webkit-filter: drop-shadow( 0px 3px 5px rgba(0, 0, 0, .5));
       filter: drop-shadow( 0px ${
         idx === 0 ? "-3px" : "3px"
       } 5px rgba(0, 0, 0, .5));
       `
       }
       "
       xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 42 86.6">
       <path fill="${
         this.settings.controlColor
       }" d="M0 43.3V0l21 21.6 21 21.7L21 65 0 86.6V43.3z"/>
     </svg>`;
      arrows.innerHTML += arrow;
    }

    control.style.cssText = `
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    height: 100%;
    width: ${this.slideWidth}px;
    top: 0;
    left: calc(50% - ${this.slideWidth / 2}px);
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
        height: 100%;
        width: 3px;
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

    for (let idx = 0; idx <= 1; idx++) {
      let child = children[idx];

      child.style.cssText = `
      width: ${idx === 1 ? `auto` : `100%`};
      height: ${idx === 1 ? `100%` : `auto`};
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
            width: ${this.settings.fluidMode ? "100%" : "50%"};
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
              `background-image: url(${afterUrl}); clip-path: inset(0 0 0 50%)`
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

export default ImageCompare;
