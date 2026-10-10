const combinedSliderStyles = document.createElement('template');
combinedSliderStyles.innerHTML = /*html*/`
    <style>
        /* Shared Base Styles */
        :host {
            display: inline-block;
            width: 100%;
            box-sizing: border-box;
            
            --thumb-size: 24px;
            --thumb-bg: #007bff;
            --thumb-shadow: 0 0 2px rgba(0,0,0,0.4);

            --track-height: 8px;
            --track-bg: #ddd;
            --track-fill-bg: #007bff;
            --track-radius: calc(var(--track-height) / 2);
        }

        *, *::before, *::after {
            box-sizing: inherit;
        }

        /* --- Single Slider Styles --- */
        .single-slider-wrapper {
            position: relative;
            height: var(--thumb-size);
            display: flex;
            align-items: center;
        }

        input[type=range] {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            background: transparent;
            cursor: pointer;
            margin: 0;
        }

        input[type=range]:focus {
            outline: none;
        }

        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            border: 0px;
            height: var(--thumb-size);
            width: var(--thumb-size);
            border-radius: 50%;
            background: var(--thumb-bg);
            box-shadow: var(--thumb-shadow);
            margin-top: calc((var(--track-height) - var(--thumb-size)) / 2);
        }
        input[type=range]::-moz-range-thumb {
            border: 0px;
            height: var(--thumb-size);
            width: var(--thumb-size);
            border-radius: 50%;
            background: var(--thumb-bg);
            box-shadow: var(--thumb-shadow);
        }

        #slider::-webkit-slider-runnable-track {
            height: var(--track-height);
            background: linear-gradient(to right, var(--track-fill-bg) var(--fill-percent, 50%), var(--track-bg) var(--fill-percent, 50%));
            border-radius: var(--track-radius);
        }
        #slider::-moz-range-track {
            height: var(--track-height);
            background: linear-gradient(to right, var(--track-fill-bg) var(--fill-percent, 50%), var(--track-bg) var(--fill-percent, 50%));
            border-radius: var(--track-radius);
        }

        /* --- Dual Range Slider Styles --- */
        .dual-slider-wrapper {
            position: relative;
            height: var(--thumb-size);
        }
        .slider-track-base {
            position: absolute;
            width: 100%;
            height: var(--track-height);
            background-color: var(--track-bg);
            border-radius: var(--track-radius);
            top: 50%;
            transform: translateY(-50%);
            z-index: 1;
        }
        .range-fill {
            position: absolute;
            height: var(--track-height);
            background-color: var(--track-fill-bg);
            border-radius: var(--track-radius);
            top: 50%;
            transform: translateY(-50%);
            z-index: 2;
            cursor: grab;
        }
        .dual-slider-wrapper input[type=range] {
            position: absolute;
            width: 100%;
            pointer-events: none;
            z-index: 3;
            top: 50%;
            transform: translateY(-50%);           
        }

        .dual-slider-wrapper input[type=range]::-webkit-slider-thumb {
            pointer-events: auto; /* Make the thumb clickable */
            margin-top: 0; /* Reset margin, as the parent input is already centered */
        }
        .dual-slider-wrapper input[type=range]::-moz-range-thumb {
            pointer-events: auto;
        }
    </style>
`;

/* -------------------------------------------------------------------------- */
/*                            Single Slider Component                           */
/* -------------------------------------------------------------------------- */

const singleSliderTemplate = document.createElement('template');
singleSliderTemplate.innerHTML = /*html*/`
    <div class="single-slider-wrapper">
        <input id="slider" type="range">
    </div>
`;

class SingleSlider extends HTMLElement {
    static get observedAttributes() {
        return ['value', 'min', 'max'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(combinedSliderStyles.content.cloneNode(true));
        this.shadowRoot.appendChild(singleSliderTemplate.content.cloneNode(true));
        this.slider = this.shadowRoot.querySelector('#slider');
    }

    connectedCallback() {
        if (!this.hasAttribute('min')) this.min = this.slider.min;
        if (!this.hasAttribute('max')) this.max = this.slider.max;
        if (!this.hasAttribute('value')) this.value = this.slider.value;
        
        this.slider.addEventListener('input', this._onInput.bind(this));
        this.slider.addEventListener('change', this._onChange.bind(this));
        this._updateFill();
    }

    _onInput(event) {
        this.value = event.target.value;
        this._dispatchEvent('input');
    }

    _onChange() {
        this._dispatchEvent('change');
    }

    _updateFill() {
        const min = this.min;
        const max = this.max;
        const val = this.value;
        const range = max - min;
        
        const percent = (range > 0) ? ((val - min) / range) * 100 : 0;
        this.slider.style.setProperty('--fill-percent', `${percent}%`);
    }

    _dispatchEvent(type) {
        const event = new CustomEvent(type, {
            bubbles: true,
            composed: true,
            detail: { value: this.value }
        });
        this.dispatchEvent(event);
    }
    
    get value() { return Number(this.slider.value); }
    set value(val) {
        const numericVal = Number(val);
        this.slider.value = numericVal;
        this.setAttribute('value', numericVal);
        this._updateFill();
    }

    get min() { return Number(this.slider.min); }
    set min(val) {
        const numericVal = Number(val);
        this.slider.min = numericVal;
        this.setAttribute('min', numericVal);
        this._updateFill();
    }

    get max() { return Number(this.slider.max); }
    set max(val) {
        const numericVal = Number(val);
        this.slider.max = numericVal;
        this.setAttribute('max', numericVal);
        this._updateFill();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        switch (name) {
            case 'value': this.value = newValue; break;
            case 'min': this.min = newValue; break;
            case 'max': this.max = newValue; break;
        }
    }
}

window.customElements.define('ui-slider', SingleSlider);


/* -------------------------------------------------------------------------- */
/*                          Dual Range Slider Component                         */
/* -------------------------------------------------------------------------- */

const dualSliderTemplate = document.createElement('template');
dualSliderTemplate.innerHTML = /*html*/`
    <div class="dual-slider-wrapper">
        <div class="slider-track-base"></div>
        <div class="range-fill"></div>
        <input id="slider-min" type="range">
        <input id="slider-max" type="range">
    </div>
`;

class DualRangeSlider extends HTMLElement {
    static get observedAttributes() {
        return ['value-min', 'value-max', 'min', 'max', 'minimum-delta'];
    }

    get defaultMinimumDelta() { return 1; }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(combinedSliderStyles.content.cloneNode(true));
        this.shadowRoot.appendChild(dualSliderTemplate.content.cloneNode(true));
        
        this.sliderMin = this.shadowRoot.querySelector('#slider-min');
        this.sliderMax = this.shadowRoot.querySelector('#slider-max');
        this.rangeFill = this.shadowRoot.querySelector('.range-fill');

        this.isDraggingRange = false;
        this.dragStartX = 0;
        this.dragStartMin = 0;
        this.dragStartMax = 0;
        this.minimumDelta = this.defaultMinimumDelta;
    }

    connectedCallback() {
        const min = Number(this.hasAttribute('min') ? this.getAttribute('min') : this.sliderMin.min);
        const max = Number(this.hasAttribute('max') ? this.getAttribute('max') : this.sliderMin.max);
        
        this.min = min;
        this.max = max;
        
        if (this.hasAttribute('minimum-delta')) {
            this.minimumDelta = Number(this.getAttribute('minimum-delta'));
        } else {
            this.minimumDelta = this.defaultMinimumDelta;
        }

        const midpoint = min + (max - min) / 2;
        this.valueMin = (this.hasAttribute('value-min')) ? 
            this.getAttribute('value-min') : min + (midpoint - min) / 2;
        this.valueMax = (this.hasAttribute('value-max')) ? 
            this.getAttribute('value-max') : midpoint + (max - midpoint) / 2;
                
        this.sliderMin.addEventListener('input', this._onMinThumbInput.bind(this));
        this.sliderMax.addEventListener('input', this._onMaxThumbInput.bind(this));
        this.sliderMin.addEventListener('change', this._onThumbChange.bind(this));
        this.sliderMax.addEventListener('change', this._onThumbChange.bind(this));

        // --- START: The Fix ---
        // Bind event listeners for both Mouse and Touch events
        this.rangeFill.addEventListener('mousedown', this._onRangeDragStart.bind(this));
        this.rangeFill.addEventListener('touchstart', this._onRangeDragStart.bind(this), { passive: false });
        // --- END: The Fix ---
    }
    
    // --- START: New helper to get the correct X coordinate ---
    _getPointerX(e) {
        // For touch events, clientX is in the changedTouches array
        if (e.type.startsWith('touch')) {
            return e.changedTouches[0].clientX;
        }
        // For mouse events, clientX is directly on the event object
        return e.clientX;
    }
    // --- END: New helper ---

    _onMinThumbInput() {
        this.valueMin = this.sliderMin.value;
        this._dispatchEvent('input');
    }

    _onMaxThumbInput() {
        this.valueMax = this.sliderMax.value;
        this._dispatchEvent('input');
    }

    _onThumbChange() {
        this._dispatchEvent('change');
    }

    _onRangeDragStart(e) {
        // Prevent default touch action like scrolling
        if (e.type === 'touchstart') {
            e.preventDefault();
        }

        this.isDraggingRange = true;
        this.rangeFill.style.cursor = 'grabbing';
        this.dragStartX = this._getPointerX(e); // Use helper
        this.dragStartMin = this.valueMin;
        this.dragStartMax = this.valueMax;
        this.rangeDelta = this.valueMax - this.valueMin;

        // Bind move/end handlers to the window to capture events outside the element
        this._boundOnRangeDragMove = this._onRangeDragMove.bind(this);
        this._boundOnRangeDragEnd = this._onRangeDragEnd.bind(this);
        
        // Add listeners for both Mouse and Touch
        window.addEventListener('mousemove', this._boundOnRangeDragMove);
        window.addEventListener('touchmove', this._boundOnRangeDragMove, { passive: false });
        window.addEventListener('mouseup', this._boundOnRangeDragEnd);
        window.addEventListener('touchend', this._boundOnRangeDragEnd);
    }
    
    _onRangeDragMove(e) {
        if (!this.isDraggingRange) return;

        // Prevent scrolling during drag on touch devices
        if (e.type === 'touchmove') {
            e.preventDefault();
        }

        const currentX = this._getPointerX(e); // Use helper
        const dx = currentX - this.dragStartX;
        const componentWidth = this.offsetWidth;
        const totalRange = this.max - this.min;
        
        if (componentWidth === 0 || totalRange === 0) return;

        const valuePerPixel = totalRange / componentWidth;
        const valueChange = dx * valuePerPixel;
        
        let newMin = this.dragStartMin + valueChange;
        let newMax = this.dragStartMax + valueChange;

        if (newMin < this.min) {
            newMin = this.min;
            newMax = this.min + this.rangeDelta;
        }

        if (newMax > this.max) {
            newMax = this.max;
            newMin = this.max - this.rangeDelta;
        }
        
        this.sliderMin.value = newMin;
        this.sliderMax.value = newMax;
        
        this._updateRangeFill();
        this._dispatchEvent('input');
    }
    
    _onRangeDragEnd() {
        if (!this.isDraggingRange) return;

        this.isDraggingRange = false;
        this.rangeFill.style.cursor = 'grab';

        // Remove all potential listeners
        window.removeEventListener('mousemove', this._boundOnRangeDragMove);
        window.removeEventListener('touchmove', this._boundOnRangeDragMove);
        window.removeEventListener('mouseup', this._boundOnRangeDragEnd);
        window.removeEventListener('touchend', this._boundOnRangeDragEnd);
        
        this.setAttribute('value-min', this.sliderMin.value);
        this.setAttribute('value-max', this.sliderMax.value);
        this._dispatchEvent('change');
    }

    _updateRangeFill() {
        const min = this.min;
        const max = this.max;
        const range = max - min;
        
        if (range <= 0) return;

        const minPercent = ((this.valueMin - min) / range) * 100;
        const maxPercent = ((this.valueMax - min) / range) * 100;
        
        this.rangeFill.style.left = `${minPercent}%`;
        this.rangeFill.style.width = `${maxPercent - minPercent}%`;
    }

    _dispatchEvent(type) {
        const event = new CustomEvent(type, {
            bubbles: true,
            composed: true,
            detail: { 
                valueMin: this.valueMin,
                valueMax: this.valueMax
            }
        });
        this.dispatchEvent(event);
    }

    get valueMin() { return Number(this.sliderMin.value); }
    set valueMin(val) {
        const numericVal = Number(val);
        this.sliderMin.value = numericVal;

        if (this.valueMin > this.valueMax - this.minimumDelta) {
            let newMax = this.valueMin + this.minimumDelta;
            if (newMax > this.max) {
                newMax = this.max;
                this.sliderMin.value = newMax - this.minimumDelta;
            }
            this.sliderMax.value = newMax;
        }

        this.setAttribute('value-min', this.sliderMin.value);
        this.setAttribute('value-max', this.sliderMax.value);
        this._updateRangeFill();
    }

    get valueMax() { return Number(this.sliderMax.value); }
    set valueMax(val) {
        const numericVal = Number(val);
        this.sliderMax.value = numericVal;

        if (this.valueMax < this.valueMin + this.minimumDelta) {
            let newMin = this.valueMax - this.minimumDelta;
            if (newMin < this.min) {
                newMin = this.min;
                this.sliderMax.value = newMin + this.minimumDelta;
            }
            this.sliderMin.value = newMin;
        }

        this.setAttribute('value-min', this.sliderMin.value);
        this.setAttribute('value-max', this.sliderMax.value);
        this._updateRangeFill();
    }

    get min() { return Number(this.sliderMin.min); }
    set min(val) {
        const numericVal = Number(val);
        this.sliderMin.min = numericVal;
        this.sliderMax.min = numericVal;
        this.setAttribute('min', numericVal);
        this._updateRangeFill();
    }

    get max() { return Number(this.sliderMax.max); }
    set max(val) {
        const numericVal = Number(val);
        this.sliderMin.max = numericVal;
        this.sliderMax.max = numericVal;
        this.setAttribute('max', numericVal);
        this._updateRangeFill();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        if (this.isDraggingRange) return;
        
        switch (name) {
            case 'value-min': this.valueMin = newValue; break;
            case 'value-max': this.valueMax = newValue; break;
            case 'min': this.min = newValue; break;
            case 'max': this.max = newValue; break;
            case 'minimum-delta':
                const newDelta = Number(newValue);
                this.minimumDelta = !isNaN(newDelta) ? newDelta : this.defaultMinimumDelta;
                this.valueMax = this.valueMax; // Re-trigger validation
                break;
        }
    }
}

window.customElements.define('ui-range-slider', DualRangeSlider);