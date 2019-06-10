'use strict';

const DFP_SCRIPT_SRC = '//www.googletagservices.com/tag/js/gpt.js';

const once = function(fn) {
  let _promise;

  return function _once() {
    if (!_promise) {
      const args = Array.prototype.slice.call(arguments);
      _promise = Promise.resolve(fn.apply(null, args));
    }

    return _promise;
  };
};

const loadScript = (function() {
  const _loadedScripts = {};

  return function _loadScript(src) {
    if (_loadedScripts[src]) {
      return _loadedScripts[src];
    }

    function _injectScriptTag(resolve, reject) {
      const element = document.createElement('script');
      const target = document.getElementsByTagName('script')[0];

      element.src = src;
      element.async = true;
      element.onload = resolve;
      element.onerror = reject;

      target.parentNode.insertBefore(element, target);
    }

    return (_loadedScripts[src] = new Promise(_injectScriptTag));
  };
})();

const service = once(function() {
  return loadDfp().then(function _dfpLoaded(googletag) {
    googletag.cmd.push(function _dfpReady() {
      initDfp(googletag);
    });
    return googletag;
  });
});

function loadDfp() {
  const protocol = document.location.protocol === 'https:' ? 'https:' : 'http:';

  return loadScript(protocol + DFP_SCRIPT_SRC).then(function _scriptLoaded() {
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];
    return window.googletag;
  });
}

function initDfp(googletag) {
  googletag.pubads().enableSingleRequest();
  googletag.pubads().disableInitialLoad();
  googletag.enableServices();
}

function dfp(options) {
  service().then(function(googletag) {
    function _defineSlot() {
      const oldSlot = googletag
        .pubads()
        .getSlots()
        .filter(slot => slot.getSlotElementId() === options.elementId)[0];

      if (oldSlot) {
        googletag.pubads().refresh([oldSlot]);
        return;
      }

      const slot = googletag
        .defineSlot(options.unitPath, options.size, options.elementId)
        .addService(googletag.pubads());

      if (options.centering) {
        googletag.pubads().setCentering(!!options.centering);
      }

      if (options.sizes) {
        const mapping = googletag.sizeMapping();

        mapping.addSize([0, 0], []);

        options.sizes.forEach(function(size) {
          mapping.addSize(size[0], [size[1]]);
        });

        const sizeArray = mapping.build();
        slot.defineSizeMapping(sizeArray);
      }

      if (options.collapse) {
        slot.setCollapseEmptyDiv(!!options.collapse);
      }

      if (options.targeting) {
        Object.keys(options.targeting).forEach(function(key) {
          slot.setTargeting(key, options.targeting[key]);
        });
      }

      if (typeof options.onSlotRenderEnded === 'function') {
        googletag.pubads().addEventListener('slotRenderEnded', function(e) {
          if (e.slot === slot) {
            options.onSlotRenderEnded(e);
          }
        });
      }

      if (typeof options.onImpressionViewable === 'function') {
        googletag.pubads().addEventListener('impressionViewable', function(e) {
          if (e.slot === slot) {
            options.onSlotRenderEnded(e);
          }
        });
      }

      googletag.display(options.elementId);
      googletag.pubads().refresh([slot]);
    }

    googletag.cmd.push(_defineSlot);
  });
}

module.exports = dfp;
