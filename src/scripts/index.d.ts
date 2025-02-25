export interface ImageCompareOptions {
  // UI Theme Defaults
  /**
   * @default "#FFFFFF"
   */
  controlColor?: string;
  /**
   * @default true
   */
  controlShadow?: boolean;
  /**
   * @default false
   */
  addCircle?: boolean;
  /**
   * @default true
   */
  addCircleBlur?: boolean;
  // Label Defaults
  /**
   * @default false
   */
  showLabels?: boolean;
  labelOptions?: {
    /**
     * @default 'Before'
     */
    before?: string;
    /**
     * @default 'After'
     */
    after?: string;
    /**
     * @default false
     */
    onHover?: boolean;
  };
  // Smoothing
  /**
   * @default true
   */
  smoothing?: boolean;
  /**
   * @default 100
   */
  smoothingAmount?: number;
  // Other options
  /**
   * @default false
   */
  hoverStart?: boolean;
  /**
   * @default false
   */
  verticalMode?: boolean;
  /**
   * @default 50
   */
  startingPoint?: number;
  /**
   * @default false
   */
  fluidMode?: boolean;
}

declare class ImageCompare {
  constructor(element: HTMLElement, options?: ImageCompareOptions);
  mount(): void;
}

export default ImageCompare;
