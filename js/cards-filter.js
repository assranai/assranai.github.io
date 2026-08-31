(function () {
    'use strict';

    var chips = document.querySelectorAll('.card-filter-chip');
    var items = document.querySelectorAll('.card-item');
    var empty = document.getElementById('cards-empty');

    if (!chips.length || !items.length) {
        return;
    }

    var selected = new Set();

    function apply() {
        var visible = 0;

        items.forEach(function (item) {
            var tags = (item.getAttribute('data-tags') || '').split(',').map(function (t) {
                return t.trim();
            }).filter(Boolean);

            var show = selected.size === 0 || tags.some(function (t) {
                return selected.has(t);
            });

            item.style.display = show ? '' : 'none';
            if (show) {
                visible++;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var tag = chip.getAttribute('data-tag');
            if (!tag) {
                return;
            }

            if (selected.has(tag)) {
                selected.delete(tag);
                chip.classList.remove('active');
            } else {
                selected.add(tag);
                chip.classList.add('active');
            }

            apply();
        });
    });
})();
