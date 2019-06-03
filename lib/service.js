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

const loadScript = () => {
  const _loadedScripts = {};

  return function _loadScript(src) {
    if (_loadedScripts[src]) {
      return _loadedScripts[src];
    }

    const _injectScriptTag = (resolve, reject) => {
      const element = document.createElement('script');
      const target = document.getElementsByTagName('script')[0];

      element.src = src;
      element.async = true;
      element.onload = resolve;
      element.onerror = reject;

      target.parentNode.insertBefore(element, target);
    };

    return (_loadedScripts[src] = new Promise(_injectScriptTag));
  };
};

const service = once(() => {
  return loadDfp().then(googletag => {
    googletag.cmd.push(() => {
      initDfp(googletag);
    });
    return googletag;
  });
});

const loadDfp = () => {
  const protocol = document.location.protocol === 'https:' ? 'https:' : 'http:';

  return loadScript(protocol + DFP_SCRIPT_SRC).then(() => {
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];
    return window.googletag;
  });
};

const initDfp = googletag => {
  googletag.pubads().enableSingleRequest();
  googletag.pubads().disableInitialLoad();
  googletag.enableServices();
};

const dfp = options => {
  service().then(googletag => {
    const _defineSlot = () => {
      const slot = googletag
        .defineSlot(options.unitPath, options.size, options.elementId)
        .addService(googletag.pubads());

      if (options.centering) {
        googletag.pubads().setCentering(!!options.centering);
      }

      if (options.sizes) {
        const mapping = googletag.sizeMapping();

        mapping.addSize([0, 0], []);

        options.sizes.forEach(size => {
          mapping.addSize(size[0], [size[1]]);
        });

        const sizeArray = mapping.build();
        slot.defineSizeMapping(sizeArray);
      }

      if (options.collapse) {
        slot.setCollapseEmptyDiv(!!options.collapse);
      }

      if (options.targeting) {
        Object.keys(options.targeting).forEach(key => {
          slot.setTargeting(key, options.targeting[key]);
        });
      }

      if (typeof options.onSlotRenderEnded === 'function') {
        googletag.pubads().addEventListener('slotRenderEnded', e => {
          if (e.slot === slot) {
            options.onSlotRenderEnded(e);
          }
        });
      }

      if (typeof options.onImpressionViewable === 'function') {
        googletag.pubads().addEventListener('impressionViewable', e => {
          if (e.slot === slot) {
            options.onSlotRenderEnded(e);
          }
        });
      }

      googletag.display(options.elementId);
      googletag.pubads().refresh([slot]);
    };

    googletag.cmd.push(_defineSlot);
  });
};

module.exports = dfp;
