function stopClick(e, isPrevent = false) {
    e.stopPropagation();

    if (isPrevent)
        e.preventDefault();
}

//обработчик нажатия клавиши, чтоб расширять
function uiGrowableInputKeyDownHandlerJQuery() {
    let _this = this;
    //задержка, чтобы буква отпечаталась
    setTimeout(function () {
        setTrueWidthForInput(_this);
    }, 5);
}

//изменять ширину инпут при вводе
function setTrueWidthForInput(input) {
    let $input = $(input);
    let $buffer = $('<span></span>');

    $buffer.css('font-size', $input.css('font-size'));
    $buffer.css('text-transform', $input.css('text-transform'));
    $buffer.css('font-weight', $input.css('font-weight'));

    $buffer.css('opacity', 0);
    $buffer.css('position', 'fixed');
    $buffer.css('width', 'auto');

    $('body').append($buffer);

    $buffer.text($input.val());

    $input.css('width', parseFloat($buffer.css('width')) + 20 + 'px');

    $buffer.remove();
}

//изменять ширину инпут при вводе
$('[data-ui-growable-input]').on('keydown', uiGrowableInputKeyDownHandlerJQuery);


//всплывает caption
{
    function popCaptionBuilder() {
        this.class = `ui-pop-caption`;
        return {
            class: `${this.class}`,
            code: `<div class="${this.class}" data-caption-text></div>`,
            time: 300,
        };
    }
    let POP_CAPTION = popCaptionBuilder();

    $('[data-caption-on-focus]').on('mouseenter', function () {
        $(this).append(POP_CAPTION.code);
        let $cap = $(`.${POP_CAPTION.class}`, this);

        $cap.animate({
            opacity: 1,
        }, {
            duration: POP_CAPTION.time,
        });

        $('[data-caption-text]', this).text(
            $(this).attr('data-caption-on-focus')
        );
    });

    $('[data-caption-on-focus]').on('mouseleave', function () {
        let $cap = $(`.${POP_CAPTION.class}`, this);

        $cap.animate({
            opacity: 0,
        }, {
            duration: POP_CAPTION.time,
            complete: function () {
                $(this).remove();
            }
        });
    });
}

$('[data-copy-btn]').click(function () {
    let $parent = $(this).closest('[data-copy-parent]');
    let $target = $('[data-copy-target]', $parent);

    var $temp = $("<input>");
    $("body").append($temp);
    let textToCopy = ($target.val() || $target.text()).trim();
    $temp.val(textToCopy).select();
    document.execCommand("copy");
    $temp.remove();


    let time = 2400;
    if ($target.is('input') || $target.is('textarea')) {
        $target.val('Тест скопирован!');
        setTimeout(() => {
            $target.val(textToCopy);
        }, time);
    }
    else {
        $target.text('Тест скопирован!');
        setTimeout(() => {
            $target.text(textToCopy);
        }, time);
    }

});


$('[data-show-id]').click(function (e) {
    stopClick(e, true);

    const id = $(this).attr('data-show-id');
    $(`#${id}`).addClass('show');
});

$('[data-hide-showable]').click(function (e) {
    stopClick(e, true);
    $(this).closest('[data-showable]').removeClass('show');
});



$('[data-ui-select]').click(function (e) {
    stopClick(e);
    $('[data-ui-select]').not(this).removeClass('active');

    $(this).toggleClass('active');
});

$('[data-ui-select-list]>*').click(function (e) {
    stopClick(e, true);
    const $this = $(this);
    const $parent = $this.closest('[data-ui-select]')

    $('input', $parent).eq(0).val($this.text().trim());
    $parent.removeClass('active');
});

$('body').on('click', function () {
    $('[data-ui-select]').removeClass('active');
})


$('[data-clear-input]').click(function (e) {
    stopClick(e, true);
    const $parent = $(this).closest('[data-input-w]');
    $('input', $parent).eq(0).val('');
});


//попапы
//попапы

async function defaultAsync() {
    return true;
}

function isCloseHandler(callback) {
    let functionName = $(this).attr('data-is-close');

    if (functionName) {
        window[functionName]().then((message) => {
            callback.call(this, message);
        }).catch((message) => {
            callback.call(this, message);
        });
    } else {
        callback.call(this, true);
    }
}

//попапы
{
    $('body').on('click', '[data-pop-block]', function (e) {
        stopClick(e);
        let $block = $(this);

        $block.removeClass('show');
    });

    $('body').on('click', '[data-pop]', function (e) {
        stopClick(e);
    });

    $('body').on('click', '[data-pop-block] [data-close-all-pop]', function () {
        isCloseHandler.call(this, function (isClose) {
            if (isClose) {
                let $pop = $(this).parents('[data-pop-block]');

                $pop.removeClass('show');
            }
        });
    });

    $('body').on('click', '[data-pop-block] [data-close-pop]', function () {
        isCloseHandler.call(this, function (isClose) {
            if (isClose) {
                let $pop = $(this).closest('[data-pop-block]');

                $pop.removeClass('show');
            }
        });
    });
}

$('[data-passwd-hide-btn]').click(function (e) {
    stopClick(e, true);

    const $this = $(this);
    const $parent = $this.closest('[data-input-w]');
    $('input', $parent).eq(0).attr('type', 'password');
});

$('[data-passwd-show-btn]').click(function (e) {
    stopClick(e, true);

    const $this = $(this);
    const $parent = $this.closest('[data-input-w]');
    $('input', $parent).eq(0).attr('type', 'text');
});


function genPassword() {
    return Array(12)
        .fill("0123456789ABCDEFGHI$#@JKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$#@")
        .map(function (x) {
            return x[Math.floor(Math.random() * x.length)]
        })
        .join('');
}

$('[data-gen-passwd-for-id]').click(function (e) {
    stopClick(e, true);

    const id = $(this).attr('data-gen-passwd-for-id');
    $(`input#${id}`).val(genPassword())
});