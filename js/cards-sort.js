(function () {
    'use strict';

    var PAGE_SIZE = 30;
    var SORT_KEY = 'cardsSort';

    var grid = document.getElementById('cards-grid');
    if (!grid) {
        return;
    }

    var items = Array.prototype.slice.call(grid.querySelectorAll('.card-item'));
    var sortBtns = Array.prototype.slice.call(document.querySelectorAll('.cards-sort-btn'));
    var pager = document.getElementById('cards-pager');
    var prevBtn = document.getElementById('cards-pager-prev');
    var nextBtn = document.getElementById('cards-pager-next');
    var info = document.getElementById('cards-pager-info');

    var sortDir = localStorage.getItem(SORT_KEY) === 'asc' ? 'asc' : 'desc';
    var page = 0;

    function applySortDir() {
        sortBtns.forEach(function (btn) {
            var on = btn.getAttribute('data-sort') === sortDir;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    }

    // Filter-visible set is recorded by cards-filter.js as data-fmatch ("1"/"0");
    // no marker means the filter is inactive for that card (visible).
    function matches(it) {
        return it.getAttribute('data-fmatch') !== '0';
    }

    function visibleItems() {
        return items.filter(matches);
    }

    function compare(a, b) {
        var d = a.getAttribute('data-date').localeCompare(b.getAttribute('data-date'));
        if (d !== 0) {
            return sortDir === 'desc' ? -d : d;
        }
        return parseInt(a.getAttribute('data-idx'), 10) - parseInt(b.getAttribute('data-idx'), 10);
    }

    function pageCount(total) {
        return Math.max(1, Math.ceil(total / PAGE_SIZE));
    }

    function render() {
        // Pager is the single owner of display state:
        //   - filter-excluded cards (data-fmatch="0") -> hidden
        //   - matched cards outside the current page window -> hidden
        //   - matched cards inside the window -> shown
        var vis = visibleItems();
        var pc = pageCount(vis.length);
        if (page > pc - 1) {
            page = pc - 1;
        }
        var from = page * PAGE_SIZE;
        var to = from + PAGE_SIZE;
        var pos = 0;
        items.forEach(function (it) {
            if (!matches(it)) {
                it.style.display = 'none';
                return;
            }
            it.style.display = (pos >= from && pos < to) ? '' : 'none';
            pos++;
        });
        if (pager) {
            var showPager = vis.length > PAGE_SIZE;
            pager.hidden = !showPager;
            if (showPager && prevBtn && nextBtn && info) {
                prevBtn.disabled = page === 0;
                nextBtn.disabled = page >= pc - 1;
                info.textContent = '\u7b2c ' + (page + 1) + ' / ' + pc + ' \u9875';
            }
        }
    }

    function refresh() {
        items.sort(compare);
        items.forEach(function (it) {
            grid.appendChild(it);
        });
        render();
        applySortDir();
    }

    sortBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var next = btn.getAttribute('data-sort');
            if (next === sortDir) {
                return;
            }
            sortDir = next;
            try {
                localStorage.setItem(SORT_KEY, sortDir);
            } catch (e) { }
            refresh();
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            if (page > 0) {
                page -= 1;
                render();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            var pc = pageCount(visibleItems().length);
            if (page < pc - 1) {
                page += 1;
                render();
            }
        });
    }

    document.addEventListener('cards:update', function () {
        page = 0;
        refresh();
    });

    refresh();
})();
