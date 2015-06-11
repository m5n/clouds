/*global $, Math, setInterval */
'use strict';

$(function () {
    var numCloudFragments = 20,
        currentColorScheme;   // Array of 3: the individual RGB values for min
                              // and max color, and an optional color
                              // calculation instruction.

    function getFragmentData(minColorFragments, maxColorFragments, instruction) {
        // Dimensions of #clouds are approx 950x350.
        // TODO: subtractions were measured by hand... automate this calculation
        var posX = Math.round(Math.random() * 950) - 950/6,
            posY = Math.round(Math.random() * 350) - 350/3.5,
            color,
            value,
            range,
            ii;

        color = 'rgb(';
        for (ii = 0; ii < minColorFragments.length; ii += 1) {
            if (ii > 0) {
                color += ',';
            }
            range = maxColorFragments[ii] - minColorFragments[ii];
            value = minColorFragments[ii] + Math.round(Math.random() * range);   // min - max
            if (instruction === 'same') {
                color += value + ',' + value + ',' + value;
                break;
            } else {
                color += value;
            }
        }
        color += ')';

        return {
            posX: posX,
            posY: posY,
            color: color
        };
    }

    function updateFragment(id) {
        var data = getFragmentData.apply(this, currentColorScheme);

        if (id === undefined) {   // ID can be 0, so cannot do "id = id || ..."
            id = Math.floor(Math.random() * numCloudFragments);   // 0 - (#fragments - 1)
        }

        $('#' + id).toggleClass('move').css({
            left: data.posX + 'px',
            top: data.posY + 'px',
            backgroundColor: data.color
        });
    }

    // Thanks, http://javascript.crockford.com/remedial.html
    function supplant(s, o) {
        return s.replace(
            /\{([^{}]*)\}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    }

    function toNumber(value) {
        return parseInt(value, 10);
    }

    // Menu handler.
    $('#menu a').click(function (event) {
        var el = $(event.target),
            ii;

        $('#text').text(el.text());
        $('body').attr('class', el.attr('id'));

        currentColorScheme = [
            el.data('mincolor').split(',').map(toNumber),
            el.data('maxcolor').split(',').map(toNumber),
            el.data('colorinstr')
        ];

        // Re-init cloud fragments.
        for (ii = 0; ii < numCloudFragments; ii += 1) {
            updateFragment(ii);
        }
    });

    // Add cloud fragments.
    var template = $('#cloud-template').html();
    for (var ii = 0; ii < numCloudFragments; ii += 1) {
        var posZ = 99 - Math.round(99 / numCloudFragments * ii);   // 0 - 99

        $('#clouds').append(supplant(template, {
            id: ii,
            zIndex: posZ
        }));
    }

    // Prevent clouds from moving when selecting different examples.
    var maxWidth = '';
    $('#menu a').each(function () {
        var textEl = $('#text'),
            width;

        textEl.text($(this).text());
        width = textEl.width();
        if (width > maxWidth) {
            maxWidth = width;
        }
    });
    $('#text').css('width', Math.round(maxWidth * 1.1) + 'px');

    // Show requested or first example.
    $(location.hash || '#menu a:first-child').click();

    // Start animation.
    setInterval(updateFragment, 200);
});
