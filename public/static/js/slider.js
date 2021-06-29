function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}

function getOffsetOfParent(el, parent) {
    const elOffset = getOffset(el);
    const parentOffset = getOffset(parent);

    return {
        left: elOffset.left - parentOffset.left,
        top: elOffset.top - parentOffset.top
    };
}

function getOffsetOfFromPoint(point, parent) {
    const parentOffset = getOffset(parent);

    return {
        left: point.x - parentOffset.left,
        top: point.y - parentOffset.top
    };
}

class PaySlider {
    constructor() {
        this.maxMonth = 12;

        this.$slider = $('[data-p-slider]');
        this.$knob = $('[data-p-slider-knob]', this.$slider);
        this.$bar = $('[data-p-slider-bar]', this.$slider);
        this.$progress = $('[data-p-slider-progress]', this.$slider);
        this.$output = $('[data-p-slider-output]', this.$slider);

        this.$scale = $('[data-p-slider-scale]', this.$slider);

        this.initScale();


        let knobHandler = this.knobHandler.bind(this);
        let knobHandlerTouch = this.knobHandlerTouch.bind(this);
        this.$knob.mousedown(knobHandler);
        this.$knob.on('touchstart', knobHandlerTouch);

        let endSlide = this.endSlide.bind(this);
        let endSlideTouch = this.endSlideTouch.bind(this);
        $(document).mouseup(endSlide);
        $(document).on('touchend', endSlideTouch);


        let scaLeClick = this.scaLeClick.bind(this);
        this.$scale.on('click', scaLeClick);


        let setKnob = this.setKnob.bind(this);
        this.$output.on('change keydown paste input', function () {
            setKnob($(this).val());
        })

        setInterval(this.updateInterface.bind(this), 300);
    }

    scaLeClick(e) {
        let xInPx = getOffsetOfFromPoint({ x: e.clientX, y: e.clientY }, this.$scale[0]).left;
        this.choseWithXInPx(xInPx);
    }

    getLeftInPerOfValue(val) {
        let $nums = this.$scale.children();
        let $chose = $($nums[val - 1]);

        return this.getLeftInPerOf($chose);
    }

    getLeftInPerOf($scaleNum) {
        this.scaleWidth = parseFloat(this.$scale.css('width'));
        let scaleNumWidth = parseFloat($scaleNum.css('width')) / 2;
        let offsetOfParent = getOffsetOfParent(
            $scaleNum[0],
            this.$scale[0]
        );
        return (offsetOfParent.left + scaleNumWidth) / this.scaleWidth * 100;
    }

    initScale() {
        this.maxValue = +this.$slider.attr('data-max-month');
        this.minValue = +this.$slider.attr('data-min-month');
        let initSliderValue = +this.$slider.attr('data-slider-value');

        for (let i = 0; i < 12; i++) {
            let $span = $(`<span>${i + 1}</span>`);

            if (i < this.maxValue)
                $span.addClass('in-range');

            this.$scale.append($span);
        }

        this.initProgress(this.maxValue);
        this.setKnob(initSliderValue);
    }

    initProgress() {
        this.$progress.css('width', this.getLeftInPerOfValue(this.maxValue - this.minValue) + 11 + "%");
        this.$progress.css('margin-left', this.getLeftInPerOfValue(this.minValue) - 2 + "%");
    }

    setKnobPosition(val) {
        this.$knob.css('left', this.getLeftInPerOfValue(val) + "%");
    }

    setKnob(val) {
        if (val == "")
            return;
        else if (val > this.maxValue)
            this.currentValue = this.maxValue;
        else if (val < this.minValue)
            this.currentValue = this.minValue;
        else
            this.currentValue = val;


        this.setKnobPosition(this.currentValue);

        this.$output.val(this.currentValue);

        if (typeof vm !== 'undefined')
            vm.setPayPartsCount(this.currentValue);
    }

    updateInterface() {
        this.setKnobPosition(this.currentValue);
        this.initProgress();
    }

    knobHandler(e) {
        this.clickX = e.clientX;
        let moveKnob = this.moveKnob.bind(this);

        this.dragStart();

        $('body').on('mousemove', moveKnob);
    }

    knobHandlerTouch(e) {
        this.clickX = e.touches[0].clientX;
        let moveKnobTouch = this.moveKnobTouch.bind(this);

        this.dragStart();

        $('body').on('touchmove', moveKnobTouch);
    }

    dragStart() {
        this.startLeft = parseFloat(this.$knob.css('left'));
        $('body').css('user-select', 'none');
    }

    dragEnd() {
        $('body').css('user-select', 'auto');
    }

    endSlide(e) {
        this.dragEnd();
        $('body').off('mousemove');
    }

    endSlideTouch(e) {
        this.dragEnd();
        $('body').off('touchmove');
    }

    getClosestChose(xInPx) {
        let xInPer = xInPx / this.scaleWidth * 100;

        if (xInPer < 0)
            xInPer = 0;
        else if (xInPer > 100)
            xInPer = 100;

        let closestIndex = 0;
        let lastDist = 100;
        let getLeftInPer = this.getLeftInPerOf.bind(this);

        let $nums = this.$scale.children();
        $nums.each(function (index) {
            let dist = Math.abs(getLeftInPer($(this)) - xInPer);
            if (dist < lastDist) {
                closestIndex = index + 1;
                lastDist = dist
            }
        });

        return closestIndex;
    }

    moveKnob(e) {
        let xInPx = (e.clientX - this.clickX + this.startLeft);
        this.choseWithXInPx(xInPx);
    }

    moveKnobTouch(e) {
        let xInPx = (e.touches[0].clientX - this.clickX + this.startLeft);
        this.choseWithXInPx(xInPx);
    }

    choseWithXInPx(xInPx) {
        let choseVal = this.getClosestChose(xInPx);
        this.setKnob(choseVal);
    }
}

let pSlider = new PaySlider();




function checkFlexGap() {
    // create flex container with row-gap set
    var flex = document.createElement("div");
    flex.style.display = "flex";
    flex.style.flexDirection = "column";
    flex.style.rowGap = "1px";

    // create two, elements inside it
    flex.appendChild(document.createElement("div"));
    flex.appendChild(document.createElement("div"));

    // append to the DOM (needed to obtain scrollHeight)
    document.body.appendChild(flex);
    var isSupported = flex.scrollHeight === 1; // flex container should be 1px high from the row-gap
    flex.parentNode.removeChild(flex);

    return isSupported;
}

if (!checkFlexGap()) {
    function initAttrFromCss(cssProp) {
        let $this = $(this);
        let val = parseFloat($this.css(cssProp));
        $this.attr('data-sup-' + cssProp, val + 'px');
    }

    function addToAttrValue(cssProp, val) {
        let $this = $(this);
        let oldVal, newVal;

        oldVal = parseFloat($this.attr('data-sup-' + cssProp));
        if (isNaN(oldVal))
            oldVal = 0;
        newVal = oldVal + val;

        $this.attr('data-sup-' + cssProp, newVal + 'px');
    }

    function setCssFromAttr(cssProp) {
        let $this = $(this);
        let hasAttr = $this.is(`[data-sup-${cssProp}]`);

        if (hasAttr) {
            let val = parseFloat($this.attr('data-sup-' + cssProp));
            $this.css(cssProp, val);
        }

        $this.removeAttr(`data-sup-${cssProp}`);
    }

    function hasGap() {
        let row = parseFloat($(this).css('row-gap'));
        let col = parseFloat($(this).css('column-gap'));

        return !isNaN(col) && col != 0 || !isNaN(row) && row != 0;
    }


    let $gapElArr = $('*').filter(hasGap);
    $gapElArr.each(function () {
        initAttrFromCss.call(this, 'margin-top');
        initAttrFromCss.call(this, 'margin-left');
        initAttrFromCss.call(this, 'width');
    });

    $gapElArr.each(function () {
        let $this = $(this);

        let row = parseFloat($this.css('row-gap'));
        let col = parseFloat($this.css('column-gap'));

        let $child = $('>*', $this);

        if ($child.length > 1) {
            $this.css('gap', 0);

            addToAttrValue.call($this, 'margin-top', -row);
            addToAttrValue.call($this, 'margin-left', -col);
            addToAttrValue.call($this, 'width', col);


            $child.each(function () {
                if (!isNaN(col) && col != 0) {
                    addToAttrValue.call(this, 'margin-left', col);
                }
                if (!isNaN(row) && row != 0) {
                    addToAttrValue.call(this, 'margin-top', row);
                }

                if ($(this).width() / $(this).parent().width() > 0.95 && $(this).width() > 32) {
                    initAttrFromCss.call(this, 'width');
                    addToAttrValue.call(this, 'width', -col);
                }
            });
        }
    });

    let $allEl = $('[data-sup-margin-top]');
    $allEl.each(function () {
        setCssFromAttr.call(this, 'margin-top');
        setCssFromAttr.call(this, 'margin-left');
        setCssFromAttr.call(this, 'width');
    });

}