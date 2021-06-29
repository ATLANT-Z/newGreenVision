function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}



class OutBanner {

    constructor(seconds, days) {
        this.$outBanner = $('[data-out-banner]');
        this.$list = $('[data-out-banner-list]', this.outBanner);
        this.$banners = $('[data-out-banner-list-item]', this.list);

        this.$clsBtn = $('[data-out-banner-close-btn]', this.outBanner);



        this.initSlider(seconds);
        this.initSliderClick(days);
        this.initCloseBtn(days);
    }


    initSlider(seconds) {
        if (getCookie('showOutBanner') != 'false') {
            this.$outBanner.addClass('show');
            this.currIndex = 0;
            this.intervalId = setInterval(() => { this.showNext() }, seconds * 1000);
        }
        else {
            this.$outBanner.hide();
        }
    }

    showNext() {
        this.$banners.removeClass('active');
        this.$banners.eq(this.currIndex).addClass('active');

        this.increment();
    }

    increment() {
        let iterIndex = 0;
        do {
            this.currIndex++;

            if (this.currIndex >= this.$banners.length)
                this.currIndex = 0;

            iterIndex++;
        } while (getCookie(`showOutBanner[${this.currIndex}]`) == 'false' && iterIndex <= this.$banners.length)

        if (iterIndex > this.$banners.length) {
            this.$clsBtn[0].click();
        }
    }

    initCloseBtn(days) {
        this.$clsBtn.click(() => {
            this.$outBanner.hide();
            clearInterval(this.intervalId);

            setCookie('showOutBanner', 'false', days);
        });
    }

    initSliderClick(days) {
        let showNext = this.showNext.bind(this);

        this.$banners.click(function () {
            let index = $(this).index();
            setCookie(`showOutBanner[${index}]`, 'false', days);

            showNext();
        });
    }
}
let outBanner = new OutBanner(5, 0.25);


class RangeSlideManager {
    constructor() {
        const $sliders = $('[data-range-slider]');
        $sliders.each(function (index) {
            new RangeSlider(this);
        });
    }
}

class RangeSlider {
    constructor(slider) {
        this.$slider = $(slider);
        this.minPrice = parseFloat(this.$slider.attr('data-start-min'));
        this.maxPrice = parseFloat(this.$slider.attr('data-start-max'));

        this.$inputMin = $('[data-range-input-min]', this.$slider);
        this.$inputMax = $('[data-range-input-max]', this.$slider);

        this.$bar = $('[data-range-bar]', this.$slider);
        this.$progress = $('[data-range-progress]', this.$slider);
        this.$knobMin = $('[data-range-knob-min]', this.$slider);
        this.$knobMax = $('[data-range-knob-max]', this.$slider);

        let startKnobTouch = this.startKnobTouch.bind(this);
        this.$knobMin.on('touchstart', startKnobTouch);
        this.$knobMin.on('touchstart', startKnobTouch);

        let startKnobMouse = this.startKnobMouse.bind(this);
        this.$knobMin.on('mousedown', startKnobMouse);
        this.$knobMax.on('mousedown', startKnobMouse);


        this.onChangeInput(this.$inputMin);
        this.onChangeInput(this.$inputMax);

        this.initSlider();
    }

    initSlider() {
        this.updateKnobsFromInput();
    }

    getValFromInputs() {
        let vMin = parseFloat(this.$inputMin.val());
        let vMax = parseFloat(this.$inputMax.val());

        if (vMax < this.minPrice) {
            vMax = this.minPrice;
        }

        if (vMin > vMax) {
            vMin = vMax;
        }

        if (vMin < this.minPrice) {
            vMin = this.minPrice;
        }

        if (vMax > this.maxPrice) {
            vMax = this.maxPrice;
        }

        this.$inputMin.val(vMin);
        this.$inputMax.val(vMax);

        return { vMin, vMax };
    }

    getValFromKnobs() {
        let minPx = parseFloat(this.$knobMin.css('left'));
        let maxPx = parseFloat(this.$knobMax.css('left'));

        let { minPer, maxPer } = this.getPerFromPx(minPx, maxPx);

        if (maxPer < 0) {
            maxPer = 0;
        }

        if (minPer > maxPer) {
            minPer = maxPer;
        }

        if (minPer < 0) {
            minPer = 0;
        }

        if (maxPer > 100) {
            maxPer = 100;
        }

        this.$knobMin.css('left', minPer + '%');
        this.$knobMax.css('left', maxPer + '%');

        return { minPer, maxPer };
    }


    onChangeInput($input) {
        $input.on('change click paste', () => {
            this.updateKnobsFromInput();
        });
    }

    updateKnobsFromInput() {
        let { vMin, vMax } = this.getValFromInputs();
        let { minPer, maxPer } = this.getPerFromValue(vMin, vMax);


        this.$knobMin.css('left', minPer + '%');
        this.$knobMax.css('left', maxPer + '%');

        this.$progress.css('left', minPer + '%').css('right', 100 - maxPer + '%');
    }

    updateKnobs() {
        let { minPer, maxPer } = this.getValFromKnobs();
        let { vMin, vMax } = this.getValueFromPer(minPer, maxPer);

        this.$progress.css('left', minPer + '%').css('right', 100 - maxPer + '%');

        this.$inputMin.val(vMin);
        this.$inputMax.val(vMax);
    }

    getPerFromValue(min, max) {
        const minPer = (min - this.minPrice) / (this.maxPrice - this.minPrice) * 100;
        const maxPer = (max - this.minPrice) / (this.maxPrice - this.minPrice) * 100;

        return { minPer, maxPer };
    }

    getPerFromPx(min, max) {
        this.barWidth = this.$bar[0].offsetWidth;

        const minPer = min / this.barWidth * 100;
        const maxPer = max / this.barWidth * 100;

        return { minPer, maxPer };
    }

    getValueFromPer(min, max) {
        const vMin = Math.round(min / 100 * (this.maxPrice - this.minPrice) + this.minPrice);
        const vMax = Math.round(max / 100 * (this.maxPrice - this.minPrice) + this.minPrice);

        return { vMin, vMax };
    }

    moveKnob() {
        this.dxInPer = this.dxInPx / this.barWidth * 100;

        this.$currKnob.css('left', this.currPer + this.dxInPer + '%');
        this.updateKnobs();
    }


    startKnobMouse(e) {
        this.clickX = e.clientX;

        this.barWidth = this.$bar[0].offsetWidth;
        this.$currKnob = $(e.currentTarget);
        this.currPer = parseFloat(this.$currKnob.css('left')) / this.barWidth * 100;

        let moveKnobMouse = this.moveKnobMouse.bind(this);
        $(document).on('mousemove', moveKnobMouse);

        let endKnobMouse = this.endKnobMouse.bind(this);
        $(document).on('mouseup', endKnobMouse);
    }

    moveKnobMouse(e) {
        this.dxInPx = e.clientX - this.clickX;
        this.moveKnob();
    }

    endKnobMouse(e) {
        $(document).off('mousemove');
        $(document).off('mouseup');
    }


    startKnobTouch(e) {
        this.clickX = e.touches[0].clientX;
        this.barWidth = this.$bar[0].offsetWidth;
        this.$currKnob = $(e.currentTarget);
        this.currPer = parseFloat(this.$currKnob.css('left')) / this.barWidth * 100;

        let moveKnobTouch = this.moveKnobTouch.bind(this);
        $(document).on('touchmove', moveKnobTouch);

        let endTouch = this.endTouch.bind(this);
        $(document).on('touchend', endTouch);
    }

    moveKnobTouch(e) {
        this.dxInPx = e.touches[0].clientX - this.clickX;
        this.moveKnob();
    }

    endTouch(e) {
        $(document).off('touchmove');
        $(document).off('touchend');
    }
}
new RangeSlideManager();
