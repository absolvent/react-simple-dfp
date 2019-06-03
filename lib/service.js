'use strict';

const DFP_SCRIPT_SRC = '//www.googletagservices.com/tag/js/gpt.js';

const once = function (fn) {
	let _promise;

	return function _once() {
		if (!_promise) {
			const args = Array.prototype.slice.call(arguments);
			_promise = Promise.resolve(fn.apply(null, args));
		}

		return _promise;
	};
};

const loadScript = (function () {
	const _loadedScripts = {};

	return function _loadScript(src) {
		if (_loadedScripts[src]) {
			return _loadedScripts[src];
		}

		return (_loadedScripts[src] = new Promise(_injectScriptTag));

		function _injectScriptTag(resolve, reject) {
			const element = document.createElement('script');
			const target = document.getElementsByTagName('script')[0];

			element.src = src;
			element.async = true;
			element.onload = resolve;
			element.onerror = reject;

			target.parentNode.insertBefore(element, target);
		}
	};
})();

const service = once(() => {
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
	// Infinite scroll ad
	// @see https://support.google.com/dfp_sb/answer/4623874
	googletag.pubads().disableInitialLoad();
	googletag.enableServices();
}

function dfp(options) {
	service().then(function (googletag) {
		googletag.cmd.push(_defineSlot);

		function _defineSlot() {
			let slot = googletag.defineSlot(options.unitPath, options.size, options.elementId);

			if (!slot) {
				slot = googletag.slot_manager_instance.l[options.elementId];
				googletag.pubads().refresh([slot]);
				return;
			}

			slot.addService(googletag.pubads());

			if (options.sizes) {
				const mapping = googletag.sizeMapping();

				mapping.addSize([0,0], []);

				options.sizes.forEach(function (size) {
					mapping.addSize(size[0], [size[1]]);
				});

				const sizeArray = mapping.build();
				slot.defineSizeMapping(sizeArray);
			}

			if ('collapse' in options) {
				slot.setCollapseEmptyDiv(!!options.collapse);
			}

			if (options.targeting) {
				Object.keys(options.targeting).forEach(function (key) {
					slot.setTargeting(key, options.targeting[key]);
				});
			}

			if (typeof options.onSlotRenderEnded === 'function') {
				googletag.pubads().addEventListener('slotRenderEnded', function _onSlotRenderEnded(e) {
					if (e.slot === slot) {
						options.onSlotRenderEnded(e);
					}
				});
			}

			if (typeof options.onImpressionViewable === 'function') {
				googletag.pubads().addEventListener('impressionViewable', function _onImpressionViewable(e) {
					if (e.slot === slot) {
						options.onSlotRenderEnded(e);
					}
				});
			}

			googletag.display(options.elementId);
			googletag.pubads().refresh([slot]);
		}
	});
}

module.exports = dfp;
