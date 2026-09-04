/* Knowledge cards cognitive model: glossary term tooltips. */
(function () {
    'use strict';

    var glossaryUrl = '/glossary.json';
    var cache = null;
    var tip = null;
    var activeEl = null;

    function ensureTip() {
        if (!tip) {
            tip = document.createElement('div');
            tip.className = 'term-tooltip';
            tip.hidden = true;
            document.body.appendChild(tip);
        }
        return tip;
    }

    function load(cb) {
        if (cache) {
            cb(cache);
            return;
        }
        fetch(glossaryUrl)
            .then(function (r) {
                return r.json();
            })
            .then(function (g) {
                cache = g;
                cb(g);
            })
            .catch(function () {
                cache = {};
                cb(cache);
            });
    }

    function show(el) {
        var id = el.getAttribute('data-term');
        activeEl = el;
        load(function (g) {
            if (activeEl !== el) {
                return;
            }
            var entry = g && g[id];
            var t = ensureTip();
            t.textContent = '';
            if (!entry) {
                t.hidden = true;
                return;
            }
            t.appendChild(document.createTextNode(entry.def));

            t.style.visibility = 'hidden';
            t.style.display = 'block';
            var tw = t.offsetWidth;
            var th = t.offsetHeight;
            t.style.display = '';
            t.style.visibility = '';

            var r = el.getBoundingClientRect();
            var x = Math.min(r.left, window.innerWidth - tw - 8);
            var y = r.bottom + 6;
            if (y + th > window.innerHeight - 8) {
                y = Math.max(8, r.top - th - 6);
            }
            t.style.left = Math.max(8, x) + 'px';
            t.style.top = y + 'px';
            t.hidden = false;
        });
    }

    function hide(el) {
        if (el && el !== activeEl) {
            return;
        }
        activeEl = null;
        if (tip) {
            tip.hidden = true;
        }
    }

    function bind(el) {
        el.addEventListener('mouseenter', function () {
            show(el);
        });
        el.addEventListener('mouseleave', function () {
            hide(el);
        });
        el.addEventListener('focus', function () {
            show(el);
        });
        el.addEventListener('blur', function () {
            hide(el);
        });
        el.addEventListener('click', function (ev) {
            ev.stopPropagation();
            if (activeEl === el) {
                hide(el);
            } else {
                show(el);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var root = document.querySelector('.main-article');
        if (root) {
            root.querySelectorAll('.term-anchor').forEach(bind);
        }
    });

    window.termTooltip = {
        bind: bind,
        refresh: function () {
            var root = document.querySelector('.main-article');
            if (root) {
                root.querySelectorAll('.term-anchor').forEach(bind);
            }
        }
    };
})();
