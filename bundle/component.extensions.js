/*!
 * @license jquery-mutation-summary
 * Copyright © 2012, 2013, 2014, Joel Purra <http://joelpurra.com/>
 * Released under MIT, BSD and GPL license. Comply with at least one.
 *
 * A jQuery wrapper/plugin for mutation-summary, the DOM mutation-observers wrapper.
 * http://joelpurra.github.com/jquery-mutation-summary
 * 
 * "Mutation Summary is a JavaScript library that makes observing changes to the DOM fast, easy and safe."
 * http://code.google.com/p/mutation-summary/
 */

/*jslint white: true, browser: true*/
/*global jQuery, MutationSummary*/

(function($, global) {
    "use strict"; // jshint ;_;
    var tag = "JqueryMutationSummary",
        eventNamespace = "." + tag,
        JqueryMutationSummary = function(element, options) {
            this.$element = $(element);
            this.options = $.extend(true, {}, this.internalDefaults, $.fn.mutationSummary.defaults, options);
        },
        JqueryMutationSummaryInner = function($element, configuration) {
            this.$element = $element;
            this.configuration = configuration;
        },
        privateFunctions = {};

    $.extend(true, privateFunctions, {
        getConfiguration: function(callback, observeOwnChanges, queries) {
            var configuration;

            if ($.isFunction(callback)) {
                if ($.isArray(observeOwnChanges)) {
                    queries = observeOwnChanges;
                    observeOwnChanges = false;
                }

                configuration = {
                    callback: callback,
                    observeOwnChanges: observeOwnChanges === true,
                    queries: queries || []
                };
            } else {
                configuration = callback;
            }

            return configuration;
        }
    });

    JqueryMutationSummary.prototype = {

        constructor: JqueryMutationSummary

        ,
        internalDefaults: {
            mutationSummaries: []
        }

        ,
        connect: function(callback, observeOwnChanges, queries) {
            var configuration = privateFunctions.getConfiguration(callback, observeOwnChanges, queries);

            var inner = new JqueryMutationSummaryInner(this.$element, configuration);

            this.options.mutationSummaries.push(inner);

            inner.start();
        }

        ,
        disconnect: function(callback, observeOwnChanges, queries) {
            // Pass as reference to inner function
            var summaries = this.options.mutationSummaries;

            // If any parameters were passed, only disconnect any matching summaries
            $.each(summaries, function(index) {
                // Take care of deleted summaries
                if (this === undefined) {
                    return;
                }

                if (this.configurationMatches(callback, observeOwnChanges, queries)) {
                    this.stop();

                    delete summaries[index];
                }
            });
        }
    };

    JqueryMutationSummaryInner.prototype = {
        constructor: JqueryMutationSummaryInner

        ,
        getCallbackWrapper: function() {
            function callbackWrapper(summaries) {
                // Pass extra info in the callback, since it's so wrapped
                summaries.observer = this.observer;
                summaries.configuration = $.extend(true, {}, this.configuration);

                this.originalCallback(summaries);
            };

            return $.proxy(callbackWrapper, this);
        }

        ,
        configurationMatches: function(callback, observeOwnChanges, queries) {
            var matchWith = privateFunctions.getConfiguration(callback, observeOwnChanges, queries),
                isMatch = true;

            isMatch = isMatch && (callback === undefined || this.configuration.callback === matchWith.callback);
            isMatch = isMatch && (observeOwnChanges === undefined || this.configuration.observeOwnChanges === matchWith.observeOwnChanges);
            isMatch = isMatch && (queries === undefined || this.configuration.queries === matchWith.queries);

            return isMatch;
        }

        ,
        start: function() {
            var rawElement = this.$element.get(0);

            this.originalCallback = this.configuration.callback;
            this.wrappedCallback = this.getCallbackWrapper();
            this.wrappedConfiguration = $.extend(true, {}, this.configuration);

            if (this.$element.length === 1) {
                // mutation-summary fails if passing global
                if (rawElement !== global) {
                    this.wrappedConfiguration.rootNode = rawElement;
                }
            }

            this.wrappedConfiguration.callback = this.wrappedCallback;

            this.observer = new MutationSummary(this.wrappedConfiguration);
        }

        ,
        stop: function() {
            // Any changes from the last callback will be passed here
            // http://code.google.com/p/mutation-summary/wiki/APIReference#Methods
            var finalSummary = this.observer.disconnect();

            if (finalSummary !== undefined) {
                this.wrappedCallback(finalSummary);
            }

            delete this.observer;
        }
    };

    // Add jQuery method
    // $("#element").mutationSummary();
    // $("#element").mutationSummary("method", arguments);
    $.fn.extend({
        mutationSummary: function(option) {
            var callArguments = arguments;

            return this.each(function() {
                var $this = $(this),
                    data = $this.data(tag),
                    options = typeof option === "object" && option;

                // Store javascript object as element data
                if (!data) {
                    $this.data(tag, (data = new JqueryMutationSummary(this, options)));
                }

                // Pass arguments to methods
                if (typeof option === "string") {
                    data[option].apply(data, Array.prototype.slice.call(callArguments, 1));
                }
            });
        }
    });

    $.fn.mutationSummary.defaults = {};

    $.fn.mutationSummary.Constructor = JqueryMutationSummary;
}(jQuery, this));

/*
 * =============================================================
 * jQuery.utils
 * =============================================================
 *
 *
 *
 * Dependencies:
 * jQuery 2.0+
 *
 *
 */

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {
    var utils={};
    utils.datetime={

        isDate: function(obj){
            return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
        },

        isLeapYear: function(year){
            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
        },

        getDaysInMonth: function(year, month){
            return [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },

        setToStartOfDay: function(date){
            if (this.isDate(date)) date.setHours(0,0,0,0);
        },

        compareDates: function(a,b){
            // weak date comparison (use setToStartOfDay(date) to ensure correct result)
            return a.getTime() === b.getTime();
        },

        /**
         *
         * @returns {string}
         */
        currentDate: function () {
            var currentDate = new Date();
            var day = currentDate.getDate();
            var month = currentDate.getMonth() + 1;
            var year = currentDate.getFullYear();
            return (month + '/' + day + '/' + year);
        }
    };

    utils.array={
        isArray: function(obj){
            return (/Array/).test(Object.prototype.toString.call(obj));
        },

        toStringFromArray:function(arr,index){
            var length=arr.length;
            var s='';
            for (var i=0;i<length;i++){
                if(index !==undefined){
                    if(i!==index){
                        s+=arr[i];

                    }
                }else{
                    s+=arr[i];
                }
            }
            return s;
        },

        toNamespaceFromArray:function(arr){
            var length=arr.length;
            var maxIndex=length-1;
            var s='';
            for (var i=0;i<length;i++){
                s+=arr[i].toString();
                if(i!==maxIndex){
                    s+='.';
                }
            }

            return s.toLowerCase();
        }
    };

    utils.string={
        dashToCamelCase:function(s){
            return s.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        },

        random:function(){
            return Math.floor((Math.random()*100000)+1).toString();
        },

        camelCaseToArray: function(s){
            return s.match(/[A-Z]?[a-z]+/g);
        },

        tagNameToNamespace:function(s){
            s= s.replace(/-/g,'.');
            return s.toLowerCase();
        }
    };

    utils.color={
        rgb2hex: function(rgb){
            if (  rgb.search("rgb") == -1 ) {
                return rgb;
            }
            else if ( rgb == 'rgba(0, 0, 0, 0)' ) {
                return 'transparent';
            }
            else {
                rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
                function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }
                return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
            }
        }
    };

    utils.url={
        /**
         *
         * @param ji {String}
         * @returns {String}
         */
        queryString: function (ji) {
            var hu = window.location.search.substring(1);
            var gy = hu.split("&");
            for (i = 0; i < gy.length; i++) {
                var ft = gy[i].split("=");
                if (ft[0] == ji) {
                    return ft[1];
                }
            }
            return null;
        },

        /**
         *
         * @returns {Array}
         */
        queryStringObjectArray: function () {
            var arr = [];
            var hu = window.location.search.substring(1);
            var gy = hu.split("&");
            for (i = 0; i < gy.length; i++) {
                var ft = gy[i].split("=");
                if (ft[0] == ji) {
                    return ft[1];
                }
                var obj = {};
                obj.prop = ft[0];
                obj.val = ft[1];
                arr.push(obj);
            }

            return arr;
        },

        /**
         *
         * @returns {Array}
         */
        queryStringFilterArray: function () {
            var arr = [];
            var hu = window.location.search.substring(1);
            var gy = hu.split("&");
            for (i = 0; i < gy.length; i++) {
                var ft = gy[i].split("=");
                var obj = {};
                obj.filter = ft[0];
                obj.val = ft[1];
                if (obj.filter != '') {
                    arr.push(obj);
                }

            }

            return arr;
        }
    };

    utils.image={
        /**
         *
         * @param img {Object}
         * @param data {Object}
         * @returns {Object}
         */
        aspectRatio: function (img, data) {
            var width = img.width();
            var height = img.height();
            var aRatio = height / width;
            data.aspectRatio = aRatio;
            if (typeof data.height != 'undefined') {
                data.width = parseInt((1 / aRatio) * data.height);
            } else if (typeof data.width != 'undefined') {
                data.height = parseInt(aRatio * data.width);
            }

            return data;
        }
    };


    $.utils = $.utils || {};
    $.extend($.utils, utils);

    /* String/Number prototypes  */
    String.prototype.toCamelCase=function(){
        return this.replace(/[-_]([a-z])/g, function (g) { return g[1].toUpperCase(); });
    };
    String.prototype.toTitleCase=function(){
        return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };
    String.prototype.toPixel = function(){
        var val=parseInt(this,10);
        val = val.toString() + 'px';
        return val;
    };
    String.prototype.toArrayFromCamelCase = function(){
        return this.match(/[A-Z]?[a-z]+/g);
    };
    String.prototype.toFloatPixel = function(){
        return this.toString() + 'px';
    };
    String.prototype.toInteger=function(){
        return parseInt(this.replace('px',''),10);
    };
    String.prototype.toMillisecond = function(){
        var val=parseInt(this,10);
        val = val.toString() + 'ms';
        return val;
    };
    String.prototype.toNode=function(){
        var parsed=$.parseHTML(this);
        if(parsed[0]){
            return parsed[0]
        }else{
            return null;
        }
    };
    Number.prototype.toPixel = function(){
        var val=parseInt(this,10);
        val = val.toString() + 'px';
        return val;
    };
    Number.prototype.toFloatPixel = function(){
        return this.toString() + 'px';
    };
    Number.prototype.toMillisecond = function(){
        var val=parseInt(this,10);
        val = val.toString() + 'ms';
        return val;
    };




    /**
     * replaces an element's class based on a wildcard pattern
     * @param removals {String}
     * @param additions {String}
     * @returns {Object}
     * @public
     *
     * ex: average rating
     *     $span.alterClass('icon-star-*', 'icon-star-3');
     *     $span.icon-star-2 => $span.icon-star-3
     */
    $.fn.alterClass = function ( removals, additions ) {

        var self = this;

        if ( removals.indexOf( '*' ) === -1 ) {
            // Use native jQuery methods if there is no wildcard matching
            self.removeClass( removals );
            return !additions ? self : self.addClass( additions );
        }

        var patt = new RegExp( '\\s' +
            removals.
                replace( /\*/g, '[A-Za-z0-9-_]+' ).
                split( ' ' ).
                join( '\\s|\\s' ) +
            '\\s', 'g' );

        self.each( function ( i, it ) {
            var cn = ' ' + it.className + ' ';
            while ( patt.test( cn ) ) {
                cn = cn.replace( patt, ' ' );
            }
            it.className = $.trim( cn );
        });

        return !additions ? self : self.addClass( additions );
    };

    /**
     * extends jQuery 'find' to additionally filter the jQuery object against the selector
     * example uses: querying mutation records
     * @param selector {String}
     * @returns {Object}
     * @public
     */
    $.fn.selfFind = function(selector) {
        return this.find(selector).add(this.filter(selector))
    };

    /**
     * clear select list
     * @param opts
     * @returns {$.fn}
     */
    $.fn.clearSelect=function(opts){
        (typeof opts.defaultOption ==='undefined') ? this.children.remove() : this.children('option:not(:first)').remove();
        return this;

    };

    $.fn.findTextNodes=function(){
        return this.contents().filter(function(){return this.nodeType===3});
    };

    $.fn.findTextNodeDescendants=function(){
        return this.find('*').contents().filter(function(){return this.nodeType===3});
    };

    //no chaining
    $.fn.isVisible=function(){
        var _isVisible=this.is(':visible');
        var visibility=this.css( 'visibility');
        return(_isVisible && visibility==='visible');
    };

    //no chaining
    $.fn.query=function(selector,callback) {
        var self = this;
        var count = 0;
        var result = this.find(selector);
        if (result[0]) {
            callback(result);
        }
        var timeOutId = setInterval(function () {
            result = self.find(selector);
            if (result[0] || (count > 4)) {
                clearInterval(timeOutId);
                callback(result);
            } else count++;
        }, 500);
    };

    $.fn.detachClass=function(klass){
        return this.each(function(){
            if($(this).length===1){
                $(this).removeClass(klass);
            }else if($(this).length>1){
                $.each($(this),function(index,node){
                    $(node).removeClass(klass);
                });
            }
        });

    };

    //no chaining
    $.fn.removeAnimation=function(interval,f){
        var element=this;
        var g=function(){ element.removeClass('hide-important')};
        setTimeout(function(){
            element.addClass('hide-important');
            f();
            setTimeout(g,100);
        },interval);
    };

    //no chaining
    $.fn.timeout=function(interval,f){
        setTimeout(function(){
            f();
        },interval);
    };

    /**
     *  returns first matched children in an iterative children query as "children"
     * @param selector
     * @returns {*|jQuery|HTMLElement}
     */
    $.fn.closestChildren=function(selector){
        if (!selector || selector === '') {
            return $();
        }
        var result=$();
        this.each(function() {
            var $this = $(this);
            var queue = [];
            queue.push($this);
            while (queue.length > 0) {
                var node = queue.shift();
                var children = node.children();
                for (var i = 0; i < children.length; ++i) {
                    var $child = $(children[i]);
                    if ($child.is(selector)) {
                        result=children;
                        return false;
                    } else {
                        queue.push($child);
                    }
                }
            }
        });
        var elements = [];
        $.each(result, function (index, element) {
            if ($(element).is(selector)) {
                elements.push(element);
            }
        });
        return $(elements);
    };

    //no chaining
    $.fn.hasAttr=function(attr){
        return this[0].hasAttribute(attr);
    };


    return $;


}));

/*
 * =============================================================
 * $.browser
 * =============================================================
 *
 * replaces the deprecated jQuery.browser that has now been removed from jQuery 1.9+
 *
 *
 * Dependencies:
 * jQuery 2.0 +
 *
 *
 */

(function (root, factory) {
	if (typeof module !== 'undefined' && module.exports) {
		//commonjs
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory();
	}
}(this, function () {
	var browser = {};
	browser.mozilla = false;
	browser.webkit = false;
	browser.opera = false;
	browser.msie = false;

	var nAgt = navigator.userAgent;
	browser.name = navigator.appName;
	browser.fullVersion = '' + parseFloat(navigator.appVersion);
	browser.majorVersion = parseInt(navigator.appVersion, 10);
	var nameOffset, verOffset, ix;

	// Opera
	if ((verOffset = nAgt.indexOf("Opera")) != -1) {
		browser.opera = true;
		browser.name = "Opera";
		browser.fullVersion = nAgt.substring(verOffset + 6);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			browser.fullVersion = nAgt.substring(verOffset + 8);
	}
		// MSIE
	else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
		browser.msie = true;
		browser.name = "Microsoft Internet Explorer";
		browser.fullVersion = nAgt.substring(verOffset + 5);
	}
		// Chrome
	else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
		browser.webkit = true;
		browser.name = "Chrome";
		browser.fullVersion = nAgt.substring(verOffset + 7);
	}
		// Safari
	else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
		browser.webkit = true;
		browser.name = "Safari";
		browser.fullVersion = nAgt.substring(verOffset + 7);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			browser.fullVersion = nAgt.substring(verOffset + 8);
	}
		// Firefox
	else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
		browser.mozilla = true;
		browser.name = "Firefox";
		browser.fullVersion = nAgt.substring(verOffset + 8);
	}
		// Other
	else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
        (verOffset = nAgt.lastIndexOf('/'))) {
		browser.name = nAgt.substring(nameOffset, verOffset);
		browser.fullVersion = nAgt.substring(verOffset + 1);
		if (browser.name.toLowerCase() === browser.name.toUpperCase()) {
			browser.name = navigator.appName;
		}
	} else if (nAgt.indexOf('Mozilla') !== -1 && nAgt.indexOf('Firefox') === -1) {
		browser.msie = true;
		browser.name = "Internet Explorer";
		browser.fullVersion = '11';
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix = browser.fullVersion.indexOf(";")) != -1)
		browser.fullVersion = browser.fullVersion.substring(0, ix);
	if ((ix = browser.fullVersion.indexOf(" ")) != -1)
		browser.fullVersion = browser.fullVersion.substring(0, ix);

	browser.majorVersion = parseInt('' + browser.fullVersion, 10);
	if (isNaN(browser.majorVersion)) {
		browser.fullVersion = '' + parseFloat(navigator.appVersion);
		browser.majorVersion = parseInt(navigator.appVersion, 10);
	}
	browser.version = browser.majorVersion;

	$.browser = $.browser || {};
	$.extend($.browser, browser);
	return $;


}));

/*
 * =============================================================
 * $.device
 * =============================================================
 *
 * Dependencies:
 * jQuery 2.0+
 *
 */

//umd pattern

(function (root, factory) {
	if (typeof module !== 'undefined' && module.exports) {
		//commonjs
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory();
	}
}(this, function () {
	var TABLET_MIN_WIDTH = 661;
	var device = {};
	device.touch = $.support.touch || 'ontouchend' in document;
	device.android = false;
	device.iphone = false;
	device.ipad = false;
	device.ipod = false;
	device.ios = false;
	device.webos = false;
	device.blackberry = false;
	device.smartphone = false;
	device.tablet = false;
	device.retina = false;


	if (/Android/.test(navigator.userAgent)) {
		device.android = device.touch;

	} else if (/iPhone/.test(navigator.userAgent)) {
		device.iphone = device.touch;

	} else if (/iPad/.test(navigator.userAgent)) {
		device.ipad = device.touch;

	} else if (/iPod/.test(navigator.userAgent)) {
		device.ipod = device.touch;

	} else if (/webOS/.test(navigator.userAgent)) {
		device.webos = device.touch;

	} else if (/BlackBerry/.test(navigator.userAgent)) {
		device.blackberry = device.touch;

	}
	if ((device.iphone) || (device.ipad) || (device.ipod)) {
		device.ios = true;
	}


	Object.defineProperties(device, {
		'viewport': {
			/**
             * getter
             *
             * @returns {{width: *, height: *}}
             */
			get: function () {
				var width = _getScreenWidth();
				var height = _getScreenHeight();
				return {
					width: width,
					height: height
				};
			},
			configurable: false

		},

		'orientation': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var width = _getScreenWidth();
				var height = _getScreenHeight();
				return (height > width) ? 'portrait' : 'landscape';
			},
			configurable: false

		},

		/**
         * getter
         * @returns {string}
         */
		'orientationEvent': {
			get: function () {
				var supportsOrientationChange = "onorientationchange" in window,
                    orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';

				return orientationEvent;
			}
		}
	});


	if (window.devicePixelRatio > 1) {
		device.retina = true;
	}
	if ((_getScreenHeight() > TABLET_MIN_WIDTH) || (_getScreenWidth() > TABLET_MIN_WIDTH)) {
		device.tablet = true;
		device.smartphone = false;
	} else {
		device.tablet = false;
		device.smartphone = true;
	}
	if (!device.touch) {
		device.tablet = false;
		device.smartphone = false;
	}

	

	//private

	/**
     *
     * @returns {Number|*|jQuery}
     * @private
     */
	function _getScreenHeight() {
		return window.innerHeight || $(window).height();
	}

	/**
     *
     * @returns {Number|*|jQuery}
     * @private
     */
	function _getScreenWidth() {
		return window.innerWidth || $(window).width();
	}
	$.device = $.device || {};
	$.extend($.device, device);
	return $;


}));


/*
 * =============================================================
 * $.device.mq
 * =============================================================
 *
 * Dependencies:
 * jQuery 2.0+
 *
 */

//umd pattern

(function (root, factory) {
	if (typeof module !== 'undefined' && module.exports) {
		//commonjs
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory();
	}
}(this, function () {
	var mq = {};
	var MQ_TOUCH_MAX_WIDTH = 1024;
	var MQ_TOUCH_MIN_WIDTH = 320;
	var MQ_SMARTPHONE_MAX_WIDTH = 640;
	var MQ_TABLET_MIN_WIDTH = 641;

	Object.defineProperties(mq, {
		'touch': {
			/**
             * getter
             *
             * @returns {boolean}
             */
			get: function () {
				return ($.device.viewport.width <= MQ_TOUCH_MAX_WIDTH);
			},
			configurable: false

		},

		'smartphone': {
			/**
             * getter
             *
             * @returns {boolean}
             */
			get: function () {
				return ($.touch.device.viewport.width <= MQ_SMARTPHONE_MAX_WIDTH);
			},
			configurable: false

		},

		'touchQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var mediaQuery = '(max-width:' + MQ_TOUCH_MAX_WIDTH + 'px) and (min-width:' + MQ_TOUCH_MIN_WIDTH + 'px)';
				return mediaQuery;
			},
			configurable: false

		},

		'touchLandscapeQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var mediaQuery = '(max-width:' + MQ_TOUCH_MAX_WIDTH + 'px) and (min-width:' + MQ_TOUCH_MIN_WIDTH + 'px) and (orientation:landscape)';
				return mediaQuery;
			},
			configurable: false

		},

		'touchPortraitQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var mediaQuery = '(max-width:' + MQ_TOUCH_MAX_WIDTH + 'px) and (min-width:' + MQ_TOUCH_MIN_WIDTH + 'px) and (orientation:portrait)';
				return mediaQuery;
			},
			configurable: false

		},

		'tabletQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var mediaQuery = '(max-width:' + (MQ_TOUCH_MAX_WIDTH - 1) + 'px) and (min-width:' + MQ_TABLET_MIN_WIDTH + 'px)';
				return mediaQuery;
			},
			configurable: false

		},

		'tabletLandscapeQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var mediaQuery = '(max-width:' + MQ_TOUCH_MAX_WIDTH + 'px) and (min-width:' + MQ_TABLET_MIN_WIDTH + 'px) and (orientation:landscape)';
				return mediaQuery;
			},
			configurable: false

		},

		'tabletPortraitQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var mediaQuery = '(max-width:' + MQ_TOUCH_MAX_WIDTH + 'px) and (min-width:' + MQ_TABLET_MIN_WIDTH + 'px) and (orientation:portrait)';
				return mediaQuery;
			},
			configurable: false

		},

		'smartPhoneQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var mediaQuery = '(max-width:' + MQ_SMARTPHONE_MAX_WIDTH + 'px)';
				return mediaQuery;
			},
			configurable: false

		},

		'smartPhoneLandscapeQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var mediaQuery = '(max-width:' + MQ_SMARTPHONE_MAX_WIDTH + 'px) and (orientation:landscape)';
				return mediaQuery;
			},
			configurable: false

		},

		'smartPhonePortraitQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var mediaQuery = '(max-width:' + MQ_SMARTPHONE_MAX_WIDTH + 'px) and (orientation:portrait)';
				return mediaQuery;
			},
			configurable: false

		},

		'landscapeQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var mediaQuery = '(orientation:landscape)';
				return mediaQuery;
			},
			configurable: false

		},

		'portraitQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var mediaQuery = '(orientation:portrait)';
				return mediaQuery;
			},
			configurable: false

		},

		'desktopQuery': {
			/**
             * getter
             *
             * @returns {string}
             */
			get: function () {
				var desktopMinWidth = MQ_TOUCH_MAX_WIDTH + 1;
				var mediaQuery = '(min-width:' + desktopMinWidth + 'px)';
				return mediaQuery;
			},
			configurable: false

		}


	});

	$.device = $.device || {};
	$.device.mq = mq;

	return $;

}));

/*
 * =============================================================
 * jQuery.support
 * =============================================================
 *
 * almost all tests adopted from Modernizr
 *
 *
 *
 * Dependencies:
 * jQuery 2.0+
 *
 *
 */
(function (root, factory) {
	if (typeof module !== 'undefined' && module.exports) {
		//commonjs
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory();
	}
}(this, function () {
	var support = {},


        docElement = document.documentElement,

        mod = 'elliptical',

        modElem = document.createElement(mod),

        mStyle = modElem.style,

        toString = {}.toString,

        prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),

        omPrefixes = 'Webkit Moz O ms',

        cssomPrefixes = omPrefixes.split(' '),

        domPrefixes = omPrefixes.toLowerCase().split(' '),

        ns = { 'svg': 'http://www.w3.org/2000/svg' },

        classes = [],

        slice = classes.slice,

        featureName,
        injectElementWithStyles = function (rule, callback, nodes, testnames) {

        	var style, ret, node, docOverflow,
                div = document.createElement('div'),
                body = document.body,
                fakeBody = body || document.createElement('body');

        	if (parseInt(nodes, 10)) {
        		while (nodes--) {
        			node = document.createElement('div');
        			node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
        			div.appendChild(node);
        		}
        	}

        	style = ['&#173;', '<style id="s', mod, '">', rule, '</style>'].join('');
        	div.id = mod;
        	(body ? div : fakeBody).innerHTML += style;
        	fakeBody.appendChild(div);
        	if (!body) {
        		fakeBody.style.background = '';
        		fakeBody.style.overflow = 'hidden';
        		docOverflow = docElement.style.overflow;
        		docElement.style.overflow = 'hidden';
        		docElement.appendChild(fakeBody);
        	}

        	ret = callback(div, rule);
        	if (!body) {
        		fakeBody.parentNode.removeChild(fakeBody);
        		docElement.style.overflow = docOverflow;
        	} else {
        		div.parentNode.removeChild(div);
        	}

        	return !!ret;

        },

        testMediaQuery = function (mq) {

        	var matchMedia = window.matchMedia || window.msMatchMedia;
        	if (matchMedia) {
        		return matchMedia(mq).matches;
        	}

        	var bool;

        	injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function (node) {
        		bool = (window.getComputedStyle ?
                    getComputedStyle(node, null) :
                    node.currentStyle)['position'] == 'absolute';
        	});

        	return bool;

        },



        _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

	function setCss(str) {
		mStyle.cssText = str;
	}

	function setCssAll(str1, str2) {
		return setCss(prefixes.join(str1 + ';') + (str2 || ''));
	}

	function is(obj, type) {
		return typeof obj === type;
	}

	function contains(str, substr) {
		return !!~('' + str).indexOf(substr);
	}

	function testProps(props, prefixed) {
		for (var i in props) {
			var prop = props[i];
			if (!contains(prop, "-") && mStyle[prop] !== undefined) {
				return prefixed == 'pfx' ? prop : true;
			}
		}
		return false;
	}

	function testDOMProps(props, obj, elem) {
		for (var i in props) {
			var item = obj[props[i]];
			if (item !== undefined) {

				if (elem === false) {
					return props[i];
				}

				if (is(item, 'function')) {
					return item.bind(elem || obj);
				}

				return item;
			}
		}
		return false;
	}

	function prefixed(prop, obj, elem) {
		if (!obj) {
			return testPropsAll(prop, 'pfx');
		} else {
			return testPropsAll(prop, obj, elem);
		}
	}

	function testPropsAll(prop, prefixed, elem) {

		var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
            props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

		if (is(prefixed, "string") || is(prefixed, "undefined")) {
			return testProps(props, prefixed);

		} else {
			props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
			return testDOMProps(props, prefixed, elem);
		}
	}

	support.orientation = testOrientation();
	function testOrientation() {
	    return ("orientation" in window && "onorientationchange" in window);
	}
	

	//touch
	support.touch = testTouch();
	function testTouch() {
		var bool;

		if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
			bool = true;
		} else {
			injectElementWithStyles(['@media (', prefixes.join('touch-enabled),('), mod, ')', '{#elliptical{top:9px;position:absolute}}'].join(''), function (node) {
				bool = node.offsetTop === 9;
			});
		}

		return bool;
	}

	//canvas
	support.canvas = testCanvas();
	function testCanvas() {
		var elem = document.createElement('canvas');
		return !!(elem.getContext && elem.getContext('2d'));

	}

	//geolocation
	support.geolocation = testGeolocation();
	function testGeolocation() {
		return 'geolocation' in navigator;
	}

	//history
	support.history = testHistory();
	function testHistory() {
		return !!(window.history && history.pushState);
	}

	//dragdrop
	support.dragdrop = testDragDrop();
	function testDragDrop() {
		var div = document.createElement('div');
		return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
	}

	//websockets
	support.websockets = testWebSockets();
	function testWebSockets() {
		return 'WebSocket' in window || 'MozWebSocket' in window;
	}

	//css3dtransforms
	support.css3dtransforms = testCSSTransform3d();
	function testCSSTransform3d() {
		var ret = !!testPropsAll('perspective');

		if (ret && 'webkitPerspective' in docElement.style) {

			injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#elliptical{left:9px;position:absolute;height:3px;}}', function (node, rule) {
				ret = node.offsetLeft === 9 && node.offsetHeight === 3;
			});
		}
		return ret;

	}

	//video
	support.video = testVideo();
	function testVideo() {
		var elem = document.createElement('video'),
            bool = false;

		try {
			if (bool = !!elem.canPlayType) {
				bool = new Boolean(bool);
				bool.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '');

				bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '');

				bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');
			}

		} catch (e) {
		}

		return bool;
	}

	//audio
	support.audio = testAudio();
	function testAudio() {
		var elem = document.createElement('audio'),
            bool = false;

		try {
			if (bool = !!elem.canPlayType) {
				bool = new Boolean(bool);
				bool.ogg = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '');
				bool.mp3 = elem.canPlayType('audio/mpeg;').replace(/^no$/, '');

				bool.wav = elem.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '');
				bool.m4a = (elem.canPlayType('audio/x-m4a;') ||
                    elem.canPlayType('audio/aac;')).replace(/^no$/, '');
			}
		} catch (e) {
		}

		return bool;
	}

	//localstorage
	support.localstorage = testLocalStorage();
	function testLocalStorage() {
		try {
			localStorage.setItem(mod, mod);
			localStorage.removeItem(mod);
			return true;
		} catch (e) {
			return false;
		}
	}

	//sessionstorage
	support.sessionstorage = testSessionStorage();
	function testSessionStorage() {
		try {
			sessionStorage.setItem(mod, mod);
			sessionStorage.removeItem(mod);
			return true;
		} catch (e) {
			return false;
		}
	}

	//web workers
	support.webworkers = testWebWorkers();
	function testWebWorkers() {
		return !!window.Worker;
	}

	//application cache
	support.applicationcache = testApplicationCache();
	function testApplicationCache() {
		return !!window.applicationCache;
	}

	//svg
	support.svg = testSVG();
	function testSVG() {
		return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
	}

	//inline svg
	support.inlinesvg = testInlineSVG();
	function testInlineSVG() {
		var div = document.createElement('div');
		div.innerHTML = '<svg/>';
		return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
	}

	//svg clip paths
	support.svgclippaths = testSVGClipPaths();
	function testSVGClipPaths() {
		return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
	}

	//webkit background clip
	support.backgroundclip = testBackgroundClip();
	function testBackgroundClip() {

		if (/Android/.test(navigator.userAgent)) {
			return false;
		}
		var ele = document.createElement("elliptical");
		var ret = ((typeof ele.style.webkitBackgroundClip !== 'undefined') && (ele.style.webkitBackgroundClip = 'text'));
		var textSupport = ele.style.webkitBackgroundClip == 'text';
		return textSupport;

	}

	//content editable
	support.contenteditbale = testContentEditable();
	function testContentEditable() {
		return 'contentEditable' in document.documentElement;
	}

	//overflow scrolling
	support.overflowscrolling = testOverflowScrolling();
	function testOverflowScrolling() {
		return testPropsAll('overflowScrolling');
	}

	//css resize
	support.cssresize = testResize();
	function testResize() {
		return testPropsAll('resize');
	}

	//css flexwrap
	support.flexwrap = testFlexWrap();
	function testFlexWrap() {
		return testPropsAll('flexWrap');
	}

	//postmessage
	support.postmessage = testPostMessage();
	function testPostMessage() {
		return !!window.postMessage;
	}

	//dataview
	support.dataview = testDataView();
	function testDataView() {
		return (typeof DataView !== 'undefined' && 'getFloat64' in DataView.prototype);
	}

	//dataset
	support.dataset = testDataSet();
	function testDataSet() {
		var n = document.createElement("div");
		n.setAttribute("data-a-b", "c");
		return !!(n.dataset && n.dataset.aB === "c");
	}

	//progressbar
	support.progressbar = testProgressBar();
	function testProgressBar() {
		return document.createElement('progress').max !== undefined;
	}

	//meter
	support.meter = testMeter();
	function testMeter() {
		return document.createElement('meter').max !== undefined;
	}

	//filesystem
	support.filesystem = testFilesystem();
	function testFilesystem() {
		return !!prefixed('requestFileSystem', window);
	}

	//filereader
	support.filereader = testFileReader();
	function testFileReader() {
		return !!(window.File && window.FileList && window.FileReader);
	}

	//fullscreen
	support.fullscreen = testFullScreen();
	function testFullScreen() {
		for (var i = 0; i < domPrefixes.length; i++) {
			if (document[domPrefixes[i].toLowerCase() + 'CancelFullScreen']) {
				return true;
			}

		}
		return !!document['cancelFullScreen'] || false;
	}

	//cors
	support.cors = testCors();
	function testCors() {
		return !!(window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest());
	}

	//battery
	support.battery = testBattery();
	function testBattery() {
		return !!prefixed('battery', navigator);
	}

	//low battery
	support.lowbattery = testLowBattery();
	function testLowBattery() {
		var minLevel = 0.20,
            battery = prefixed('battery', navigator);
		return !!(battery && !battery.charging && battery.level <= minLevel);
	}

	//flexbox
	support.flexbox = testFlexbox();
	function testFlexbox() {
		return testPropsAll('flexWrap');
	}

	//indexedDB
	support.indexeddb = testIndexedDB();
	function testIndexedDB() {
		return !!testPropsAll("indexedDB", window);
	}

	//hsla
	support.hsla = hsla();
	function hsla() {
		setCss('background-color:hsla(120,40%,100%,.5)');
		return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
	}

	//multiple backgrounds
	support.multiplebgs = multiplebgs();
	function multiplebgs() {
		setCss('background:url(https://),url(https://),red url(https://)');
		return (/(url\s*\(.*?){3}/).test(mStyle.background);
	}

	//css columns
	support.csscolumns = cssColumns();
	function cssColumns() {
		return testPropsAll('columnCount');
	}

	//css reflections
	support.cssreflections = cssReflections();
	function cssReflections() {
		return testPropsAll('boxReflect');
	}

    //devicemotion
	support.devicemotion = testDeviceMotion();
	function testDeviceMotion() {
	    return 'DeviceMotionEvent' in window;
	}

    //deviceorientation
	support.deviceorientation = testDeviceOrientation();
	function testDeviceOrientation() {
	    return 'DeviceOrientationEvent' in window;
	}

    //connectiontype (note buggy) bugs.webkit.org/show_bug.cgi?id=73528
	support.connectiontype = testConnectionType();
	function testConnectionType() {
	    var connection = navigator.connection || { type: 0 };
	    return connection.type;
	}

    //lowbandwidth (note buggy) bugs.webkit.org/show_bug.cgi?id=73528
	support.lowbandwidth = testLowBandwidth();
	function testLowBandwidth() {
	    var connection = navigator.connection || { type: 0 };

	    return connection.type == 3 || // connection.CELL_2G
            connection.type == 4 || // connection.CELL_3G
            /^[23]g$/.test(connection.type);
	}


	//form validation
	support.formvalidation = testFormValidation();
	function testFormValidation() {
		var form = document.createElement('form');
		if (!('checkValidity' in form)) {
			return false;
		}
		var body = document.body,

            html = document.documentElement,

            bodyFaked = false,

            invaildFired = false,

            input,

            formvalidationapi = true;

		// Prevent form from being submitted
		form.onsubmit = function (e) {
			//Opera does not validate form, if submit is prevented
			if (!window.opera) {
				e.preventDefault();
			}
			e.stopPropagation();
		};

		// Calling form.submit() doesn't trigger interactive validation,
		// use a submit button instead
		//older opera browsers need a name attribute
		form.innerHTML = '<input name="modTest" required><button></button>';

		// FF4 doesn't trigger "invalid" event if form is not in the DOM tree
		// Chrome throws error if invalid input is not visible when submitting
		form.style.position = 'absolute';
		form.style.top = '-99999em';

		// We might in <head> in which case we need to create body manually
		if (!body) {
			bodyFaked = true;
			body = document.createElement('body');
			//avoid crashing IE8, if background image is used
			body.style.background = "";
			html.appendChild(body);
		}

		body.appendChild(form);

		input = form.getElementsByTagName('input')[0];

		// Record whether "invalid" event is fired
		input.oninvalid = function (e) {
			invaildFired = true;
			e.preventDefault();
			e.stopPropagation();
		};

		//presto Opera does not fully support the validationMessage property
		var formvalidationmessage = !!input.validationMessage;

		// Submit form by clicking submit button
		form.getElementsByTagName('button')[0].click();

		// Don't forget to clean up
		body.removeChild(form);
		bodyFaked && html.removeChild(body);

		return invaildFired;
	}
	support.init = function () {
		var html = $('html');
		html.removeClass('no-js');
		html.addClass('js');
		var tests = ['touch', 'canvas', 'svg', 'history', 'formvalidation', 'localstorage', 'sessionstorage', 'meter', 'backgroundclip', 'inlinesvg',
            'svgclippaths', 'css3dtransforms', 'video', 'audio', 'progressbar', 'cssresize', 'postmessage', 'overflowscrolling', 'flexbox',
            'indexeddb', 'hsla', 'multiplebgs', 'csscolumns', 'cssreflections', 'flexwrap'];

		tests.forEach(function (t) {
			support[t] ? html.addClass(t) : html.addClass('no-' + t);
		});

		

	};

	support.stickyFooter = function () {
		if ($.browser.msie) {
			var stickyFooter = $('.ui-sticky-footer');
			if (stickyFooter[0]) {
				stickyFooter.addClass('ns');
			}
		}


	};


	support.init();
	support.stickyFooter();
	$.support = $.support || {};
	$.extend($.support, support);

	return $;

}));

/*
 * =============================================================
 * jQuery.transition
 * =============================================================
 *
 * culled in large part from https://github.com/rstacruz/jquery.transit/
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

    $.transit = {

        // Map of $.css() keys to values for 'transitionProperty'.
        // See https://developer.mozilla.org/en/CSS/CSS_transitions#Properties_that_can_be_animated
        propertyMap: {
            marginLeft: 'margin',
            marginRight: 'margin',
            marginBottom: 'margin',
            marginTop: 'margin',
            paddingLeft: 'padding',
            paddingRight: 'padding',
            paddingBottom: 'padding',
            paddingTop: 'padding'
        },

        // Will simply transition "instantly" if false
        enabled: true,

        // Set this to false if you don't want to use the transition end property.
        useTransitionEnd: false
    };

    var div = document.createElement('div');
    var support = {};

    // Helper function to get the proper vendor property name.
    // (`transition` => `WebkitTransition`)
    function getVendorPropertyName(prop) {
        var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
        var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

        if (prop in div.style) { return prop; }

        for (var i = 0; i < prefixes.length; ++i) {
            var vendorProp = prefixes[i] + prop_;
            if (vendorProp in div.style) { return vendorProp; }
        }
    }

    // Helper function to check if transform3D is supported.
    // Should return true for Webkits and Firefox 10+.
    function checkTransform3dSupport() {
        div.style[support.transform] = '';
        div.style[support.transform] = 'rotateY(90deg)';
        return div.style[support.transform] !== '';
    }

    var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

    // Check for the browser's transitions support.
    // You can access this in jQuery's `$.support.transition`.
    // As per [jQuery's cssHooks documentation](http://api.jquery.com/jQuery.cssHooks/),
    // we set $.support.transition to a string of the actual property name used.
    support.transition = getVendorPropertyName('transition');
    support.transitionDelay = getVendorPropertyName('transitionDelay');
    support.transform = getVendorPropertyName('transform');
    support.transformOrigin = getVendorPropertyName('transformOrigin');
    support.transform3d = checkTransform3dSupport();

    $.extend($.support, support);

    var eventNames = {
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'WebkitTransition': 'webkitTransitionEnd',
        'msTransition': 'MSTransitionEnd'
    };

    // Detect the 'transitionend' event needed.
    var transitionEnd = support.transitionEnd = eventNames[support.transition] || null;

    // Avoid memory leak in IE.
    div = null;

    // ## $.cssEase
    // List of easing aliases that you can use with `$.fn.transition`.
    $.cssEase = {
        '_default': 'ease',
        'in': 'ease-in',
        'out': 'ease-out',
        'in-out': 'ease-in-out',
        'snap': 'cubic-bezier(0,1,.5,1)'
    };

    // ## 'transform' CSS hook
    // Allows you to use the `transform` property in CSS.
    //
    //     $("#hello").css({ transform: "rotate(90deg)" });
    //
    //     $("#hello").css('transform');
    //     //=> { rotate: '90deg' }
    //
    $.cssHooks.transform = {
        // The getter returns a `Transform` object.
        get: function (elem) {
            return $(elem).data('transform');
        },

        // The setter accepts a `Transform` object or a string.
        set: function (elem, v) {
            var value = v;

            if (!(value instanceof Transform)) {
                value = new Transform(value);
            }

            // We've seen the 3D version of Scale() not work in Chrome when the
            // element being scaled extends outside of the viewport.  Thus, we're
            // forcing Chrome to not use the 3d transforms as well.  Not sure if
            // translate is affectede, but not risking it.  Detection code from
            // http://davidwalsh.name/detecting-google-chrome-javascript
            if (support.transform === 'WebkitTransform' && !isChrome) {
                elem.style[support.transform] = value.toString(true);
            } else {
                elem.style[support.transform] = value.toString();
            }

            $(elem).data('transform', value);
        }
    };

    // ## 'transformOrigin' CSS hook
    // Allows the use for `transformOrigin` to define where scaling and rotation
    // is pivoted.
    //
    //     $("#hello").css({ transformOrigin: '0 0' });
    //
    $.cssHooks.transformOrigin = {
        get: function (elem) {
            return elem.style[support.transformOrigin];
        },
        set: function (elem, value) {
            elem.style[support.transformOrigin] = value;
        }
    };

    // ## 'transition' CSS hook
    // Allows you to use the `transition` property in CSS.
    //
    //     $("#hello").css({ transition: 'all 0 ease 0' });
    //
    $.cssHooks.transition = {
        get: function (elem) {
            return elem.style[support.transition];
        },
        set: function (elem, value) {
            elem.style[support.transition] = value;
        }
    };

    // ## Other CSS hooks
    // Allows you to rotate, scale and translate.
    registerCssHook('scale');
    registerCssHook('translate');
    registerCssHook('rotate');
    registerCssHook('rotateX');
    registerCssHook('rotateY');
    registerCssHook('rotate3d');
    registerCssHook('perspective');
    registerCssHook('skewX');
    registerCssHook('skewY');
    registerCssHook('x', true);
    registerCssHook('y', true);

    // ## Transform class
    // This is the main class of a transformation property that powers
    // `$.fn.css({ transform: '...' })`.
    //
    // This is, in essence, a dictionary object with key/values as `-transform`
    // properties.
    //
    //     var t = new Transform("rotate(90) scale(4)");
    //
    //     t.rotate             //=> "90deg"
    //     t.scale              //=> "4,4"
    //
    // Setters are accounted for.
    //
    //     t.set('rotate', 4)
    //     t.rotate             //=> "4deg"
    //
    // Convert it to a CSS string using the `toString()` and `toString(true)` (for WebKit)
    // functions.
    //
    //     t.toString()         //=> "rotate(90deg) scale(4,4)"
    //     t.toString(true)     //=> "rotate(90deg) scale3d(4,4,0)" (WebKit version)
    //
    function Transform(str) {
        if (typeof str === 'string') { this.parse(str); }
        return this;
    }

    Transform.prototype = {
        // ### setFromString()
        // Sets a property from a string.
        //
        //     t.setFromString('scale', '2,4');
        //     // Same as set('scale', '2', '4');
        //
        setFromString: function (prop, val) {
            var args =
                (typeof val === 'string') ? val.split(',') :
                    (val.constructor === Array) ? val :
                        [val];

            args.unshift(prop);

            Transform.prototype.set.apply(this, args);
        },

        // ### set()
        // Sets a property.
        //
        //     t.set('scale', 2, 4);
        //
        set: function (prop) {
            var args = Array.prototype.slice.apply(arguments, [1]);
            if (this.setter[prop]) {
                this.setter[prop].apply(this, args);
            } else {
                this[prop] = args.join(',');
            }
        },

        get: function (prop) {
            if (this.getter[prop]) {
                return this.getter[prop].apply(this);
            } else {
                return this[prop] || 0;
            }
        },

        setter: {
            // ### rotate
            //
            //     .css({ rotate: 30 })
            //     .css({ rotate: "30" })
            //     .css({ rotate: "30deg" })
            //     .css({ rotate: "30deg" })
            //
            rotate: function (theta) {
                this.rotate = unit(theta, 'deg');
            },

            rotateX: function (theta) {
                this.rotateX = unit(theta, 'deg');
            },

            rotateY: function (theta) {
                this.rotateY = unit(theta, 'deg');
            },

            // ### scale
            //
            //     .css({ scale: 9 })      //=> "scale(9,9)"
            //     .css({ scale: '3,2' })  //=> "scale(3,2)"
            //
            scale: function (x, y) {
                if (y === undefined) { y = x; }
                this.scale = x + "," + y;
            },

            // ### skewX + skewY
            skewX: function (x) {
                this.skewX = unit(x, 'deg');
            },

            skewY: function (y) {
                this.skewY = unit(y, 'deg');
            },

            // ### perspectvie
            perspective: function (dist) {
                this.perspective = unit(dist, 'px');
            },

            // ### x / y
            // Translations. Notice how this keeps the other value.
            //
            //     .css({ x: 4 })       //=> "translate(4px, 0)"
            //     .css({ y: 10 })      //=> "translate(4px, 10px)"
            //
            x: function (x) {
                this.set('translate', x, null);
            },

            y: function (y) {
                this.set('translate', null, y);
            },

            // ### translate
            // Notice how this keeps the other value.
            //
            //     .css({ translate: '2, 5' })    //=> "translate(2px, 5px)"
            //
            translate: function (x, y) {
                if (this._translateX === undefined) { this._translateX = 0; }
                if (this._translateY === undefined) { this._translateY = 0; }

                if (x !== null) { this._translateX = unit(x, 'px'); }
                if (y !== null) { this._translateY = unit(y, 'px'); }

                this.translate = this._translateX + "," + this._translateY;
            }
        },

        getter: {
            x: function () {
                return this._translateX || 0;
            },

            y: function () {
                return this._translateY || 0;
            },

            scale: function () {
                var s = (this.scale || "1,1").split(',');
                if (s[0]) { s[0] = parseFloat(s[0]); }
                if (s[1]) { s[1] = parseFloat(s[1]); }

                // "2.5,2.5" => 2.5
                // "2.5,1" => [2.5,1]
                return (s[0] === s[1]) ? s[0] : s;
            },

            rotate3d: function () {
                var s = (this.rotate3d || "0,0,0,0deg").split(',');
                for (var i = 0; i <= 3; ++i) {
                    if (s[i]) { s[i] = parseFloat(s[i]); }
                }
                if (s[3]) { s[3] = unit(s[3], 'deg'); }

                return s;
            }
        },

        // ### parse()
        // Parses from a string. Called on constructor.
        parse: function (str) {
            var self = this;
            str.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function (x, prop, val) {
                self.setFromString(prop, val);
            });
        },

        // ### toString()
        // Converts to a `transition` CSS property string. If `use3d` is given,
        // it converts to a `-webkit-transition` CSS property string instead.
        toString: function (use3d) {
            var re = [];

            for (var i in this) {
                if (this.hasOwnProperty(i)) {
                    // Don't use 3D transformations if the browser can't support it.
                    if ((!support.transform3d) && (
                        (i === 'rotateX') ||
                        (i === 'rotateY') ||
                        (i === 'perspective') ||
                        (i === 'transformOrigin'))) { continue; }

                    if (i[0] !== '_') {
                        if (use3d && (i === 'scale')) {
                            re.push(i + "3d(" + this[i] + ",1)");
                        } else if (use3d && (i === 'translate')) {
                            re.push(i + "3d(" + this[i] + ",0)");
                        } else {
                            re.push(i + "(" + this[i] + ")");
                        }
                    }
                }
            }

            return re.join(" ");
        }
    };

    function callOrQueue(self, queue, fn) {
        if (queue === true) {
            self.queue(fn);
        } else if (queue) {
            self.queue(queue, fn);
        } else {
            fn();
        }
    }

    // ### getProperties(dict)
    // Returns properties (for `transition-property`) for dictionary `props`. The
    // value of `props` is what you would expect in `$.css(...)`.
    function getProperties(props) {
        var re = [];

        $.each(props, function (key) {
            key = $.camelCase(key); // Convert "text-align" => "textAlign"
            key = $.transit.propertyMap[key] || key;
            key = uncamel(key); // Convert back to dasherized

            if ($.inArray(key, re) === -1) { re.push(key); }
        });

        return re;
    }

    // ### getTransition()
    // Returns the transition string to be used for the `transition` CSS property.
    //
    // Example:
    //
    //     getTransition({ opacity: 1, rotate: 30 }, 500, 'ease');
    //     //=> 'opacity 500ms ease, -webkit-transform 500ms ease'
    //
    function getTransition(properties, duration, easing, delay) {
        // Get the CSS properties needed.
        var props = getProperties(properties);

        // Account for aliases (`in` => `ease-in`).
        if ($.cssEase[easing]) { easing = $.cssEase[easing]; }

        // Build the duration/easing/delay attributes for it.
        var attribs = '' + toMS(duration) + ' ' + easing;
        if (parseInt(delay, 10) > 0) { attribs += ' ' + toMS(delay); }

        // For more properties, add them this way:
        // "margin 200ms ease, padding 200ms ease, ..."
        var transitions = [];
        $.each(props, function (i, name) {
            transitions.push(name + ' ' + attribs);
        });

        return transitions.join(', ');
    }

    // ## $.fn.transition
    // Works like $.fn.animate(), but uses CSS transitions.
    //
    //     $("...").transition({ opacity: 0.1, scale: 0.3 });
    //
    //     // Specific duration
    //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500);
    //
    //     // With duration and easing
    //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in');
    //
    //     // With callback
    //     $("...").transition({ opacity: 0.1, scale: 0.3 }, function() { ... });
    //
    //     // With everything
    //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in', function() { ... });
    //
    //     // Alternate syntax
    //     $("...").transition({
    //       opacity: 0.1,
    //       duration: 200,
    //       delay: 40,
    //       easing: 'in',
    //       complete: function() { /* ... */ }
    //      });
    //
    $.fn.transition = $.fn.transit = function (properties, callback) {
        var self = this;
        var delay = 0;
        var queue = true;
        var easing;
        var duration;
        var count;
        var preset;

        /*// Account for `.transition(properties, callback)`.
         if (typeof duration === 'function') {
         callback = duration;
         duration = undefined;
         }

         // Account for `.transition(properties, duration, callback)`.
         if (typeof easing === 'function') {
         callback = easing;
         easing = undefined;
         }*/

        // Alternate syntax.
        if (typeof properties.easing !== 'undefined') {
            easing = properties.easing;
            delete properties.easing;
        }

        if (typeof properties.duration !== 'undefined') {
            duration = properties.duration;
            delete properties.duration;
        }

        if (typeof properties.complete !== 'undefined') {
            callback = properties.complete;
            delete properties.complete;
        }

        if (typeof properties.queue !== 'undefined') {
            queue = properties.queue;
            delete properties.queue;
        }

        if (typeof properties.delay !== 'undefined') {
            delay = properties.delay;
            delete properties.delay;
        }


        preset=properties.preset;
        count=properties.count;
        if(preset!==undefined){
            if ((duration === undefined)||(duration===0)) {
                duration = '';
            } else {
                duration = toSeconds(duration).toString();
            }
            if ((delay === undefined)||(delay===0)) {
                delay = '';
            } else {
                delay = toSeconds(delay).toString();
            }
            if ((count === undefined)||(count===0)) {
                count = '';
            } else {
                count = count.toString();
            }
            var options={};
            options.duration=duration;
            options.delay=delay;
            options.count=count;
            return CSS3.animate(self, options, callback, preset,properties.remove);

        }

        // Set defaults. (`400` duration, `ease` easing)
        if (typeof duration === 'undefined') { duration = $.fx.speeds._default; }
        if (typeof easing === 'undefined') { easing = $.cssEase._default; }

        duration = toMS(duration);

        // Build the `transition` property.
        var transitionValue = getTransition(properties, duration, easing, delay);

        // Compute delay until callback.
        // If this becomes 0, don't bother setting the transition property.
        var work = $.transit.enabled && support.transition;
        var i = work ? (parseInt(duration, 10) + parseInt(delay, 10)) : 0;

        // If there's nothing to do...
        if (i === 0) {
            var fn = function (next) {
                self.css(properties);
                if (callback) { callback.apply(self); }
                if (next) { next(); }
            };

            callOrQueue(self, queue, fn);
            return self;
        }

        // Save the old transitions of each element so we can restore it later.
        var oldTransitions = {};

        var run = function (nextCall) {
            var bound = false;

            // Prepare the callback.
            var cb = function () {
                if (bound) { self.unbind(transitionEnd, cb); }

                if (i > 0) {
                    self.each(function () {
                        this.style[support.transition] = (oldTransitions[this] || null);
                    });
                }

                if (typeof callback === 'function') { callback.apply(self); }
                if (typeof nextCall === 'function') { nextCall(); }
            };

            if ((i > 0) && (transitionEnd) && ($.transit.useTransitionEnd)) {
                // Use the 'transitionend' event if it's available.
                bound = true;
                self.bind(transitionEnd, cb);
            } else {
                // Fallback to timers if the 'transitionend' event isn't supported.
                window.setTimeout(cb, i);
            }

            // Apply transitions.
            self.each(function () {
                if (i > 0) {
                    this.style[support.transition] = transitionValue;
                }
                $(this).css(properties);
            });
        };

        // Defer running. This allows the browser to paint any pending CSS it hasn't
        // painted yet before doing the transitions.
        var deferredRun = function (next) {
            var i = 0;

            // Durations that are too slow will get transitions mixed up.
            // (Tested on Mac/FF 7.0.1)
            if ((support.transition === 'MozTransition') && (i < 25)) { i = 25; }

            window.setTimeout(function () { run(next); }, i);
        };

        // Use jQuery's fx queue.
        callOrQueue(self, queue, deferredRun);

        // Chainability.
        return this;
    };

    function registerCssHook(prop, isPixels) {
        // For certain properties, the 'px' should not be implied.
        if (!isPixels) { $.cssNumber[prop] = true; }

        $.transit.propertyMap[prop] = support.transform;

        $.cssHooks[prop] = {
            get: function (elem) {
                var t = $(elem).css('transform') || new Transform();
                return t.get(prop);
            },

            set: function (elem, value) {
                var t = $(elem).css('transform') || new Transform();
                t.setFromString(prop, value);

                $(elem).css({ transform: t });
            }
        };
    }

    // ### uncamel(str)
    // Converts a camelcase string to a dasherized string.
    // (`marginLeft` => `margin-left`)
    function uncamel(str) {
        return str.replace(/([A-Z])/g, function (letter) { return '-' + letter.toLowerCase(); });
    }

    // ### unit(number, unit)
    // Ensures that number `number` has a unit. If no unit is found, assume the
    // default is `unit`.
    //
    //     unit(2, 'px')          //=> "2px"
    //     unit("30deg", 'rad')   //=> "30deg"
    //
    function unit(i, units) {
        if ((typeof i === "string") && (!i.match(/^[\-0-9\.]+$/))) {
            return i;
        } else {
            return "" + i + units;
        }
    }

    // ### toMS(duration)
    // Converts given `duration` to a millisecond string.
    //
    //     toMS('fast')   //=> '400ms'
    //     toMS(10)       //=> '10ms'
    //
    function toMS(duration) {
        var i = duration;

        // Allow for string durations like 'fast'.
        if ($.fx.speeds[i]) { i = $.fx.speeds[i]; }

        return unit(i, 'ms');
    }

    // Export some functions for testable-ness.
    $.transit.getTransitionValue = getTransition;


    /*
     =========================================
     Preset keyframe animations extension
     =========================================
     */

    //CSS3 uses seconds as the unit measurement
    function toSeconds(ms){
        var sec=parseFloat(ms/1000);
        return sec;
    }

    var CSS3 = {};
    CSS3.pfx = ["webkit", "moz", "MS", "o"];
    if ($.browser.webkit) {
        CSS3.animationend = CSS3.pfx[0] + 'AnimationEnd';
    } else{
        CSS3.animationend = 'animationend'; /* mozilla doesn't use the vendor prefix */
    }
    CSS3.isAnimated = function (ele) {  /* method query to determine if the element is currently being animated; we don't want to attach multiple animationend handlers; undesirable behavior will result */

        //var data = ele.data("events")[CSS3.animationend];
        /*var data = $.data(ele,'events');
         console.log(data);
         if (data === undefined || data.length === 0) {
         return false;  // no animationend event handler attached, return false
         } else {
         return true;  // there is animationend event handler attached, return true
         }*/

        if(!ele[0]){
            return;
        }
        var classList = ele[0].className.split(/\s+/);
        for (var i = 0; i < classList.length; i++) {
            if (classList[i] === 'animated') {
                return true;
            }
        }
        return false;
    };

    function _unbindAnimation(ele,event,animation,animationType,callback){
        ele.removeCSSStyles()
            .removeClass(animation);
        //hide element if animationOut
        if((animationType.indexOf('Out')>-1)||(animationType.indexOf('out')>-1)){
            ele.hide();
        }
        ele.off(event);
        if (callback && callback !== undefined) {
            callback.call(ele);
        }

    }
    CSS3.animate = function (ele, options, callback, animationType, removeClass) {  /* transition animation handler */

        if (CSS3.isAnimated(ele)) {
            return ele; /* block animation request */
        }
        if (options === undefined) {
            options = {};
        }
        ele.show();
        ele.css({visibility:'visible'});
        var animation = 'animated ' + animationType;
        //bind animationEnd
        ele.on(CSS3.animationend, function (e) {
            if(removeClass !==undefined){
                ele.removeClass(removeClass);
                _unbindAnimation(ele,e,animation,animationType,callback);

            }else{
                _unbindAnimation(ele,e,animation,animationType,callback);
            }

        });

        ele.addCSSStyles(options).addClass(animation);
        return ele;
    };

    CSS3.animationEndEvent=function(){
        return CSS3.animationend;
    };

    CSS3.transitionEndEvent=function(){
        var transitionEnd;
        var pfx = ["webkit", "moz", "MS", "o"];
        if ($.browser.webkit) {
            transitionEnd = pfx[0] + 'TransitionEnd';
        } else if ($.browser.mozilla) {
            transitionEnd = 'transitionend';
            /* mozilla doesn't use the vendor prefix */
        } else if ($.browser.msie) {
            transitionEnd = pfx[2] + 'TransitionEnd';
        } else if ($.browser.opera) {
            transitionEnd = pfx[3] + 'TransitionEnd';
        } else {
            transitionEnd = 'transitionend';
        }
        return transitionEnd;
    };

    /* css style setter methods */
    $.fn.removeCSSStyles = function () {
        this.css({
            'animation-duration': '',
            'animation-delay': '',
            'animation-iteration-count': '',
            '-webkit-animation-duration': '',
            '-webkit-animation-delay': '',
            '-webkit-animation-iteration-count': '',
            '-moz-animation-duration': '',
            '-moz-animation-delay': '',
            '-moz-animation-iteration-count': '',
            'visibility':''
        });
        return this;
    };
    $.fn.addCSSStyles = function (options) {
        var duration = options.duration;
        var delay = options.delay;
        var count = options.count;
        if (duration === undefined) {
            duration = '';
        } else {
            duration = options.duration.toString() + 's';
        }
        if (delay === undefined) {
            delay = '';
        } else {
            delay = options.delay.toString() + 's';
        }
        if (count === undefined) {
            count = '';
        } else {
            count = options.count.toString();
        }

        this.css({
            'animation-duration': duration,
            'animation-delay': delay,
            'animation-iteration-count': count,
            '-webkit-animation-duration': duration,
            '-webkit-animation-delay': delay,
            '-webkit-animation-iteration-count': count,
            '-moz-animation-duration': duration,
            '-moz-animation-delay': delay,
            '-moz-animation-iteration-count': count
        });

        return this;
    };

    //expose CSS3 object
    $.transit.CSS3=CSS3;

    return $;
}));


(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

    (function (doc, win) {
        'use strict';
        if (typeof doc.createEvent !== 'function') return false; // no tap events here
        // helpers
        var useJquery = typeof jQuery !== 'undefined',
        // some helpers borrowed from https://github.com/WebReflection/ie-touch
            msPointerEnabled = !!navigator.pointerEnabled || navigator.msPointerEnabled,
            isTouch = (!!('ontouchstart' in window) && navigator.userAgent.indexOf('PhantomJS') < 0) || msPointerEnabled,
            msEventType = function (type) {
                var lo = type.toLowerCase(),
                    ms = 'MS' + type;
                return navigator.msPointerEnabled ? ms : lo;
            },
            touchevents = {
                touchstart: msEventType('PointerDown') + ' touchstart',
                touchend: msEventType('PointerUp') + ' touchend',
                touchmove: msEventType('PointerMove') + ' touchmove'
            },
            setListener = function (elm, events, callback) {
                var eventsArray = events.split(' '),
                    i = eventsArray.length;

                while (i--) {
                    elm.addEventListener(eventsArray[i], callback, false);
                }
            },
            getPointerEvent = function (event) {
                return event.targetTouches ? event.targetTouches[0] : event;
            },
            sendEvent = function (elm, eventName, originalEvent, data) {
                var customEvent = doc.createEvent('Event');
                data = data || {};
                data.x = currX;
                data.y = currY;
                data.distance = data.distance;
                if (useJquery)
                    jQuery(elm).trigger(eventName, data);
                else {
                    customEvent.originalEvent = originalEvent;
                    for (var key in data) {
                        customEvent[key] = data[key];
                    }
                    customEvent.initEvent(eventName, true, true);
                    elm.dispatchEvent(customEvent);
                }
            },
            onTouchStart = function (e) {

                var pointer = getPointerEvent(e);
                // caching the current x
                cachedX = currX = pointer.pageX;
                // caching the current y
                cachedY = currY = pointer.pageY;
                // a touch event is detected
                touchStarted = true;
                tapNum++;
                // detecting if after 200ms the finger is still in the same position
                clearTimeout(tapTimer);
                tapTimer = setTimeout(function () {
                    if (
                        cachedX >= currX - precision &&
                        cachedX <= currX + precision &&
                        cachedY >= currY - precision &&
                        cachedY <= currY + precision &&
                        !touchStarted
                    ) {
                        // Here you get the Tap event
                        sendEvent(e.target, (tapNum === 2) ? 'dbltap' : 'tap', e);
                    }
                    tapNum = 0;
                }, taptreshold);

            },
            onTouchEnd = function (e) {
                var eventsArr = [],
                    deltaY = cachedY - currY,
                    deltaX = cachedX - currX;
                touchStarted = false;

                if (deltaX <= -swipeTreshold)
                    eventsArr.push('swiperight');

                if (deltaX >= swipeTreshold)
                    eventsArr.push('swipeleft');

                if (deltaY <= -swipeTreshold)
                    eventsArr.push('swipedown');

                if (deltaY >= swipeTreshold)
                    eventsArr.push('swipeup');
                if (eventsArr.length) {
                    for (var i = 0; i < eventsArr.length; i++) {
                        var eventName = eventsArr[i];
                        sendEvent(e.target, eventName, e, {
                            distance: {
                                x: Math.abs(deltaX),
                                y: Math.abs(deltaY)
                            }
                        });
                    }
                }
            },
            onTouchMove = function (e) {
                var pointer = getPointerEvent(e);
                currX = pointer.pageX;
                currY = pointer.pageY;
            },
            touchStarted = false, // detect if a touch event is sarted
            swipeTreshold = win.SWIPE_TRESHOLD || 80,
            taptreshold = win.TAP_TRESHOLD || 200,
            precision = win.TAP_PRECISION / 2 || 60 / 2, // touch events boundaries ( 60px by default )
            justTouchEvents = win.JUST_ON_TOUCH_DEVICES || isTouch,
            tapNum = 0,
            currX, currY, cachedX, cachedY, tapTimer;

        //setting the events listeners
        setListener(doc, touchevents.touchstart + (justTouchEvents ? '' : ' mousedown'), onTouchStart);
        setListener(doc, touchevents.touchend + (justTouchEvents ? '' : ' mouseup'), onTouchEnd);
        setListener(doc, touchevents.touchmove + (justTouchEvents ? '' : ' mousemove'), onTouchMove);
    }(document, window));


}));

/*
 * =============================================================
 * jQuery special events
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

    /* throttled resize special event */
    /* ported from jQuery.mobile */
    (function () {
        $.event.special.throttledresize = {
            setup: function () {
                $(this).bind("resize", handler);
            },
            teardown: function () {
                $(this).unbind("resize", handler);
            }
        };

        var throttle = 250,
            handler = function () {
                curr = (new Date()).getTime();
                diff = curr - lastCall;

                if (diff >= throttle) {

                    lastCall = curr;
                    $(this).trigger("throttledresize");

                } else {

                    if (heldCall) {
                        clearTimeout(heldCall);
                    }

                    // Promise a held call will still execute
                    heldCall = setTimeout(handler, throttle - diff);
                }
            },
            lastCall = 0,
            heldCall,
            curr,
            diff;
    })();

    /* orientationchange special event--------------------------------------------------------------------------------*/
    /* ported from jQuery.mobile */
    (function () {
        var win = $(window),
            event_name = "orientationchange",
            special_event,
            get_orientation,
            last_orientation,
            initial_orientation_is_landscape,
            initial_orientation_is_default,
            portrait_map = { "0": true, "180": true };

        // It seems that some device/browser vendors use window.orientation values 0 and 180 to
        // denote the "default" orientation. For iOS devices, and most other smart-phones tested,
        // the default orientation is always "portrait", but in some Android and RIM based tablets,
        // the default orientation is "landscape". The following code attempts to use the window
        // dimensions to figure out what the current orientation is, and then makes adjustments
        // to the to the portrait_map if necessary, so that we can properly decode the
        // window.orientation value whenever get_orientation() is called.
        //


        if ($.device.orientation) {

            // Check the window width and height to figure out what the current orientation
            // of the device is at this moment. Note that we've initialized the portrait map
            // values to 0 and 180, *AND* we purposely check for landscape so that if we guess
            // wrong, , we default to the assumption that portrait is the default orientation.
            // We use a threshold check below because on some platforms like iOS, the iPhone
            // form-factor can report a larger width than height if the user turns on the
            // developer console. The actual threshold value is somewhat arbitrary, we just
            // need to make sure it is large enough to exclude the developer console case.

            var ww = window.innerWidth || $(window).width(),
                wh = window.innerHeight || $(window).height(),
                landscape_threshold = 50;

            initial_orientation_is_landscape = ww > wh && (ww - wh) > landscape_threshold;


            // Now check to see if the current window.orientation is 0 or 180.
            initial_orientation_is_default = portrait_map[window.orientation];

            // If the initial orientation is landscape, but window.orientation reports 0 or 180, *OR*
            // if the initial orientation is portrait, but window.orientation reports 90 or -90, we
            // need to flip our portrait_map values because landscape is the default orientation for
            // this device/browser.
            if ((initial_orientation_is_landscape && initial_orientation_is_default) || (!initial_orientation_is_landscape && !initial_orientation_is_default)) {
                portrait_map = { "-90": true, "90": true };
            }
        }

        $.event.special.orientationchange = $.extend({}, $.event.special.orientationchange, {
            setup: function () {
                // If the event is supported natively, return false so that jQuery
                // will bind to the event using DOM methods.
                if ($.device.orientation && !$.event.special.orientationchange.disabled && !$.device.android) {
                    return false;
                }

                // Get the current orientation to avoid initial double-triggering.
                last_orientation = get_orientation();

                // Because the orientationchange event doesn't exist, simulate the
                // event by testing window dimensions on resize.
                win.bind("throttledresize", handler);
            },
            teardown: function () {
                // If the event is not supported natively, return false so that
                // jQuery will unbind the event using DOM methods.
                if ($.device.orientation && !$.event.special.orientationchange.disabled && !$.device.android) {
                    return false;
                }

                // Because the orientationchange event doesn't exist, unbind the
                // resize event handler.
                win.unbind("throttledresize", handler);
            },
            add: function (handleObj) {
                // Save a reference to the bound event handler.
                var old_handler = handleObj.handler;


                handleObj.handler = function (event) {
                    // Modify event object, adding the .orientation property.
                    event.orientation = get_orientation();

                    // Call the originally-bound event handler and return its result.
                    return old_handler.apply(this, arguments);
                };
            }
        });

        // If the event is not supported natively, this handler will be bound to
        // the window resize event to simulate the orientationchange event.
        function handler() {
            // Get the current orientation.
            var orientation = get_orientation();

            if (orientation !== last_orientation) {
                // The orientation has changed, so trigger the orientationchange event.
                last_orientation = orientation;
                win.trigger(event_name);
            }
        }

        // Get the current page orientation. This method is exposed publicly, should it
        // be needed, as jQuery.event.special.orientationchange.orientation()
        $.event.special.orientationchange.orientation = get_orientation = function () {
            var isPortrait = true, elem = document.documentElement;

            // prefer window orientation to the calculation based on screensize as
            // the actual screen resize takes place before or after the orientation change event
            // has been fired depending on implementation (eg android 2.3 is before, iphone after).
            // More testing is required to determine if a more reliable method of determining the new screensize
            // is possible when orientationchange is fired. (eg, use media queries + element + opacity)
            if ($.support.orientation) {
                // if the window orientation registers as 0 or 180 degrees report
                // portrait, otherwise landscape
                isPortrait = portrait_map[window.orientation];
            } else {
                isPortrait = elem && elem.clientWidth / elem.clientHeight < 1.1;
            }

            return isPortrait ? "portrait" : "landscape";
        };

        $.fn[event_name] = function (fn) {
            return fn ? this.bind(event_name, fn) : this.trigger(event_name);
        };

        // jQuery < 1.8
        if ($.attrFn) {
            $.attrFn[event_name] = true;
        }

    }());



    /* zoom ----------------------------------------------------------------------------------------------------------*/
    /* ported from jQuery.mobile */
    (function () {
        var meta = $("meta[name=viewport]"),
            initialContent = meta.attr("content"),
            disabledZoom = initialContent + ",maximum-scale=1, user-scalable=no",
            enabledZoom = initialContent + ",maximum-scale=10, user-scalable=yes",
            disabledInitially = /(user-scalable[\s]*=[\s]*no)|(maximum-scale[\s]*=[\s]*1)[$,\s]/.test(initialContent);

        $.device.zoom = $.extend({}, {
            enabled: !disabledInitially,
            locked: false,
            disable: function (lock) {
                if (!disabledInitially && !$.device.zoom.locked) {
                    meta.attr("content", disabledZoom);
                    $.device.zoom.enabled = false;
                    $.device.zoom.locked = lock || false;
                }
            },
            enable: function (unlock) {
                if (!disabledInitially && (!$.device.zoom.locked || unlock === true)) {
                    meta.attr("content", enabledZoom);
                    $.device.zoom.enabled = true;
                    $.device.zoom.locked = false;
                }
            },
            restore: function () {
                if (!disabledInitially) {
                    meta.attr("content", initialContent);
                    $.device.zoom.enabled = true;
                }
            }
        });

    }());

    /* end zoom ------------------------------------------------------------------------------------------------------*/

    /* orientationfix ------------------------------------------------------------------------------------------------*/

    (function () {
        /* ported from jQuery.mobile */
        // This fix addresses an iOS bug, so return early if the UA claims it's something else.
        if (!(/iPhone|iPad|iPod/.test(navigator.platform) && navigator.userAgent.indexOf("AppleWebKit") > -1)) {
            return;
        }

        var zoom = $.device.zoom,
            evt, x, y, z, aig;

        function checkTilt(e) {
            evt = e.originalEvent;
            aig = evt.accelerationIncludingGravity;

            x = Math.abs(aig.x);
            y = Math.abs(aig.y);
            z = Math.abs(aig.z);

            // If portrait orientation and in one of the danger zones
            if (!window.orientation && (x > 7 || ((z > 6 && y < 8 || z < 8 && y > 6) && x > 5))) {
                if (zoom.enabled) {
                    zoom.disable();
                }
            } else if (!zoom.enabled) {
                zoom.enable();
            }
        }

        $(window)
            .bind("orientationchange.iosorientationfix", zoom.enable)
            .bind("devicemotion.iosorientationfix", checkTilt);

    }());






    (function () {
        var scrollEvent = 'touchmove scroll';
        $.event.special.scrollstart = {

            enabled: true,
            setup: function () {

                var thisObject = this,
                    $this = $(thisObject),
                    scrolling,
                    timer;

                function trigger(event, state) {
                    scrolling = state;
                    triggerCustomEvent(thisObject, scrolling ? "scrollstart" : "scrollstop", event);
                }

                // iPhone triggers scroll after a small delay; use touchmove instead
                $this.bind(scrollEvent, function (event) {

                    if (!$.event.special.scrollstart.enabled) {
                        return;
                    }

                    if (!scrolling) {
                        trigger(event, true);
                    }

                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        trigger(event, false);
                    }, 50);
                });
            },
            teardown: function () {
                $(this).unbind(scrollEvent);
            }
        };

        function triggerCustomEvent(obj, eventType, event, bubble) {
            var originalType = event.type;
            event.type = eventType;
            if (bubble) {
                $.event.trigger(event, undefined, obj);
            } else {
                $.event.dispatch.call(obj, event);
            }
            event.type = originalType;
        }

    }());

    /* touchclick special event --------------------------------------------------------------------------------------*/
    //create a special event to act as standard 'click' for desktop and 'touch' for touch devices
    (function () {

        var isTouch = false;

        $.event.special.touchclick = {

            setup: function () {
                isTouch = $.device.touch;
            },

            add: function (handleObj) {
                if (!isTouch) {
                    bindClick($(this), handleObj);
                } else {
                    bindTouch($(this), handleObj);
                }
            },

            remove: function (handleObj) {
                if (!isTouch) {
                    unbindClick($(this), handleObj);
                } else {
                    unbindTouch($(this), handleObj);
                }
            }

        };

        function bindClick(element, handleObj) {
            var old_handler = handleObj.handler;
            var selector = handleObj.selector;
            element.on('click', selector, function (event) {
                event.preventDefault();
                event.namespace = 'elliptical.click';
                return old_handler.apply(this, arguments);
            });
        }

        function bindTouch(element, handleObj) {
            var old_handler = handleObj.handler;
            var selector = handleObj.selector;
            element.on('touchstart', selector, function (event) {
                event.preventDefault();
                event.namespace = 'elliptical.touch';
                return old_handler.apply(this, arguments);
            });
        }

        function unbindClick(element, handleObj) {
            var selector = handleObj.selector;
            element.off('click', selector);
        }

        function unbindTouch(element, handleObj) {
            var selector = handleObj.selector;
            element.off('touchstart', selector);
        }

    }());

    /* touchhover special event --------------------------------------------------------------------------------------*/
    //create a special event to handle mouseenter/mouseleave for desktop and  touch devices
    (function () {

        var isTouch = false;

        $.event.special.touchhover = {

            setup: function () {
                isTouch = $.device.touch;
            },

            add: function (handleObj) {
                if (!isTouch) {
                    bindHover($(this), handleObj);
                } else {
                    bindTouch($(this), handleObj);
                }
            },

            remove: function (handleObj) {
                if (!isTouch) {
                    unbindHover($(this), handleObj);
                } else {
                    unbindTouch($(this), handleObj);
                }
            }

        };

        function bindHover(element, handleObj) {
            var old_handler = handleObj.handler;
            var selector = handleObj.selector;
            element.on('mouseenter', selector, function (event) {
                event.preventDefault();
                event.type='hoverover';
                event.namespace = 'elliptical.hoverover';
                return old_handler.apply(this, arguments);
            });
            element.on('mouseleave', selector, function (event) {
                event.preventDefault();
                event.type='hoverout';
                event.namespace = 'elliptical.hoverout';
                return old_handler.apply(this, arguments);
            });
        }

        function bindTouch(element, handleObj) {
            var old_handler = handleObj.handler;
            var selector = handleObj.selector;
            element.on('touchend', selector, function (event) {
                event.preventDefault();
                if(element.hasClass('over')){
                    event.type='hoverout';
                    event.namespace = 'elliptical.hoverout';
                    element.removeClass('over');
                }else{
                    event.type='hoverover';
                    event.namespace = 'elliptical.hoverover';
                    element.addClass('over');
                }

                return old_handler.apply(this, arguments);
            });
        }

        function unbindHover(element, handleObj) {
            var selector = handleObj.selector;
            element.off('mouseenter', selector);
            element.off('mouseleave', selector);
        }

        function unbindTouch(element, handleObj) {
            var selector = handleObj.selector;
            element.off('touchend', selector);
        }

    }());

    /* fixed navs and inputs focus -----------------------------------------------------------------------------------*/
    //on ios devices, keyboard on input focus will shift fixed navs...workaround: hide navs on focus
    (function () {
        if ($.device.ios) {
            var inputs = $('input, textarea');
            var navs = $('ui-navbar, ui-topbar');
            if(navs[0]){
                inputs.on('focusin', function (event) {
                    onFocus(navs);
                });
                inputs.on('focusout', function (event) {
                    onBlur(navs);
                });
            }
        }

        function onFocus(navs){
            navs.addClass('hide');
        }

        function onBlur(navs){
            navs.removeClass('hide');
        }

    }());

}));




/*
 * =============================================================
 * transforms
 * =============================================================
 *
 * Dependencies:
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

    var transforms={

    };

    /**
     * sets hardware accelerated class and returns toggle flag
     * @param element {Object}
     * @param hardwareAcceleratedClass {String}
     * @returns {Boolean}
     */
    transforms.setHardwareAcceleration = function (element,hardwareAcceleratedClass) {
        var toggleAcceleration;
        if (!element.hasClass(hardwareAcceleratedClass)) {
            toggleAcceleration = true;
            element.addClass(hardwareAcceleratedClass);

        } else {
            toggleAcceleration = false;
        }
        return toggleAcceleration;
    };

    /**
     * removes hardware acceleration class if toggleAcceleration bit set
     * @param element {Object}
     * @param toggleAcceleration {Boolean}
     * @param hardwareAcceleratedClass {String}
     */
    transforms.resetHardwareAcceleration = function (element,toggleAcceleration,hardwareAcceleratedClass) {
        if (toggleAcceleration) {
            element.removeClass(hardwareAcceleratedClass);
        }
    };

    /**
     *
     * @param element {Object}
     * @param overflowContainerClass {String}
     * @returns {Boolean}
     */
    transforms.setContainerOverflow = function (element,overflowContainerClass) {
        var toggleOverflow;
        if (!element.hasClass(overflowContainerClass)) {
            toggleOverflow = true;
            element.addClass(overflowContainerClass);

        } else {
            toggleOverflow = false;
        }

        return toggleOverflow;
    };

    /**
     *
     * @param element {Object}
     * @param toggleOverflow {Boolean}
     * @param overflowContainerClass {String}
     */
    transforms.resetContainerOverflow = function (element,toggleOverflow,overflowContainerClass) {
        if (toggleOverflow) {
            element.removeClass(overflowContainerClass);
        }
    };

    /**
     *
     * @param container {Object}
     * @param leftBoxShadowClass {String}
     * @param fixedToggleContainerClass {String}
     */
    transforms.resetContainer = function (container,leftBoxShadowClass,fixedToggleContainerClass) {
        if(!container){
            return;
        }
        container.css({
            transition: '',
            '-webkit-transition': '',
            '-webkit-transform': '',
            '-moz-transition': '',
            '-moz-transform': '',
            'transform':'',
            'height': ''
        })
            .removeClass(leftBoxShadowClass)
            .removeClass(fixedToggleContainerClass);
    };

    transforms.resetTransition = function (element) {
        element.css({
            transition: '',
            '-webkit-transition': '',
            '-moz-transition': ''
        });

    };

    /**
     *
     * @param element {Object}
     */
    transforms.resetTransform = function (element) {
        element.css({
            transition: '',
            '-webkit-transition': '',
            '-webkit-transform': '',
            '-moz-transition': '',
            '-moz-transform': '',
            'transform':''
        });

    };

    /**
     *
     * @param element {Object}
     * @param coordinates {Object}
     */
    transforms.transform = function (element, coordinates) {
        var obj = {
            '-webkit-transform': 'translate3d(' + coordinates.x + ',' + coordinates.y + ',' + coordinates.z + ')',
            '-moz-transform': 'translate3d(' + coordinates.x + ',' + coordinates.y + ',' + coordinates.z + ')',
            transform: 'translate3d(' + coordinates.x + ',' + coordinates.y + ',' + coordinates.z + ')'
        };

        element.css(obj);

    };

    /**
     *
     * @param element {Object}
     * @param opts  {Object}
     * @param callback  {Function}
     *
     */
    transforms.transition3d = function (element, opts, callback) {
        //get prefixed transitionEnd event
        var CSS3= $.transit.CSS3;
        var transitionEnd = CSS3.transitionEndEvent();

        var coordinates = opts.coordinates;

        /* coordinates properties to pixel */
        coordinates.x=coordinates.x.toPixel();
        coordinates.y=coordinates.y.toPixel();
        coordinates.z=coordinates.z.toPixel();

        var easing = opts.easing || 'ease-in-out';
        opts.duration = opts.duration.toMillisecond() || '300ms';
        opts.delay = opts.delay.toMillisecond() || 0;
        opts.transitionEnd = opts.transitionEnd || false;
        var obj = {
            transition: 'transform ' + opts.duration + ' ' + opts.delay + ' ' + easing,
            '-webkit-transition': '-webkit-transform ' + opts.duration + ' ' + opts.delay + ' ' + easing,
            '-moz-transition': '-moz-transform ' + opts.duration + ' ' + opts.delay + ' ' + easing,
            '-webkit-transform': 'translate3d(' + coordinates.x + ',' + coordinates.y + ',' + coordinates.z + ')',
            '-moz-transform': 'translate3d(' + coordinates.x + ',' + coordinates.y + ',' + coordinates.z + ')',
            transform: 'translate3d(' + coordinates.x + ',' + coordinates.y + ',' + coordinates.z + ')'
        };

        element
            .on(transitionEnd, function () {
                if (opts.transitionEnd) {
                    $(this).off(transitionEnd);
                }
                if (callback) {
                    callback();
                }
            })
            .css(obj);
    };

    $.transforms = $.transforms || {};
    $.extend($.transforms, transforms);
    return $;

}));

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical = root.elliptical || {};
        root.elliptical.extensions = root.elliptical.extensions || {};
        root.elliptical.extensions.utils = factory();
        root.returnExports = root.elliptical.extensions.utils;
    }
}(this, function () {

    return {

        _utils: $.utils,

        _DOMParser: function (htmlString) {
            return new DOMParser().parseFromString(htmlString, 'text/html');
        },

        _preloadImages: function (element, callback) {
            var imgArray = [];
            var err = {};
            var data = {};
            var images = element.find('img').not('[data-src]');
            var length = images.length;
            var counter = 0;
            if (length === 0) {
                if (callback) {
                    err.message = 'No images found in element';
                    callback(err, null);
                }
                return false;
            }
            $.each(images, function (i, img) {
                var image = new Image();
                $(image).bind('load', function (event) {
                    counter++;
                    imgArray.push(image);
                    if (counter === length) {
                        if (!callback) {
                        } else {
                            data.images = imgArray;
                            data.length = counter;
                            callback(null, data);
                        }
                    }
                });
                image.src = img.src;
            });
            return true;
        },

        _scrollTop: function (ypos, evt) {
            if (typeof ypos !== "number") {
                ypos = 0;
            } else if (typeof evt === 'undefined') {
                evt = 'scrollTop';
            }

            setTimeout(function () {
                window.scrollTo(0, ypos);
                $(document).trigger(evt, {x: 0, y: ypos});
            }, 20);
        },

        _setModal: function (element, opts, callback) {
            //support 0-3 params
            var length = arguments.length;
            if (length === 0) {
                element = $('body');
                opts = {};
                callback = null;
            } else if (length === 1) {
                if (typeof element === 'function') {
                    callback = element;
                    element = $('body');
                    opts = {};
                } else if (element.context) {
                    opts = {};
                    callback = null;
                } else {
                    opts = element;
                    element = $('body');
                }
            } else if (length === 2) {
                if (typeof opts === 'function') {
                    callback = opts;
                    if (element.context === undefined) {
                        opts = element;
                        element = $('body');
                    } else {
                        opts = {};
                    }
                } else {
                    callback = null;
                }
            }

            var div = $('<div class="ui-modal"></div>');
            if (opts.cssClass) {
                div.addClass(opts.cssClass);
            }

            if (opts.zIndex) {
                div.css({
                    'z-index': opts.zIndex
                });
            }
            if (this._data) {
                this._data.set('modal', div);
            } else {
                this._modal = div;
            }

            var opacity = (opts.opacity) ? opts.opacity : .3;
            div.css({
                opacity: 0
            });
            element.append(div);

            this._transition(div, {
                opacity: opacity,
                duration: 250
            }, function () {
                if (callback) {
                    callback();
                }
            });
        },

        _removeModal: function (callback) {
            var self = this;
            var modal = null;
            if (this._data) {
                modal = this._data.get('modal');
            } else {
                modal = this._modal;
            }

            if (!modal || modal === undefined) {
                return;
            }
            this._transition(modal, {
                opacity: 0,
                duration: 250
            }, function () {
                modal.remove();
                (self._data) ? self._data.set('modal', null) : self._modal = null;
                if (callback) {
                    callback();
                }
            });
        },


        _resetSemanticState:function(){
            this.element.removeClass('error')
                .removeClass('warning')
                .removeClass('success')
                .removeClass('info')
        },

        _setChildrenAttributes:function(){
            var element=this.element;
            if(element[0].hasAttribute && element[0].hasAttribute('disabled')){
                element.query('input,textarea,select',function(result){
                    if(result[0]){
                        result.attr('disabled',true);
                    }
                });
            }
            if(element[0].hasAttribute && element[0].hasAttribute('readonly')){
                element.query('input,textarea,select',function(result){
                    if(result[0]){
                        result.attr('readonly',true);
                    }
                });
            }
        },

        _enableChildrenAttributes:function(){
            var element=this.element;
            element.query('input,textarea,select',function(result){
                if(result[0]){
                    result.attr('disabled',false);
                }
            });
            element.query('input,textarea,select',function(result){
                if(result[0]){
                    result.attr('readonly',false);
                }
            });
        },

        _find:function(selector){
            return this.element.find(selector);
        },

        _jsonParseMessage: function (obj) {
            try {
                var msgObj = JSON.parse(obj);
                if (msgObj.message) {
                    return msgObj.message;
                } else {
                    return obj;
                }
            } catch (ex) {
                return obj;
            }
        }


    };
}));
//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical = root.elliptical || {};
        root.elliptical.extensions = root.elliptical.extensions || {};
        root.elliptical.extensions.device = factory();
        root.returnExports = elliptical.extensions.device;
    }
}(this, function () {

    return {

        _device: $.device,
        _mq: $.mq,

        _press: function () {
            return ('ontouchend' in document) ? 'touchstart' : 'click';
        },

        _mode: function () {
            return (this._device.viewport.width > 768) ? "desktop" : "touch";
        }

    };
}));


//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical=root.elliptical || {};
        root.elliptical.extensions=root.elliptical.extensions || {};
        root.elliptical.extensions.drawer = factory();
        root.returnExports=elliptical.extensions.drawer;
    }
}(this, function () {

    return {
        /**
         * create a drawer container
         * @param element {Object}
         * @param dataClass {String}
         * @private
         */
        _createDrawer: function (element, dataClass) {
            //prevent multiple drawers
            if(this._data.get('locked')){
                return;
            }
            this._data.set('locked',true);
            //get reference to the container
            var container=$('ui-container');
            this._data.set('container',container);

            //get ref to the toggle container
            var transformContainer = container.parent();
            this._data.set('transformContainer',transformContainer);

            //create the drawer elements
            var drawer=$('<touch-ui-drawer></touch-ui-drawer>');
            if (dataClass) {
                drawer.addClass(dataClass);
            }
            var height = this._device.viewport.height;

            drawer.css({
                'min-height': height + 'px'
            });
            if(!this._device.touch){
                drawer.css({
                    'position': 'relative'
                });
            }
            var drawerHeader = $('<header></header>');

            //append header to drawer
            drawer.append(drawerHeader);

            var drawerSection = $('<section></section>');
            drawer.append(drawerSection);

            //insert drawer into the DOM
            container.before(drawer);

            //save references
            this._data.set('drawer',drawer);
            this._data.set('drawerHeader',drawerHeader);
            this._data.set('drawerSection',drawerSection);
        },

        /**
         * open the drawer
         * @param callback {function}
         * @param fnClose {function}
         * @private
         */
        _openDrawer: function (callback, fnClose) {

            //show drawer
            this._showDrawer();


            //get viewport height
            var height = this._device.viewport.height;
            if(this.options) this.options.height=height;
            else{
                this.height = height;
            }

            var self = this;

            //get ref to containers
            var container = this._data.get('container');
            var transformContainer = this._data.get('transformContainer');

            //hardware accelerate the transition
            this._setHardwareAcceleration(transformContainer);

            //container overflow
            //this._setContainerOverflow(transformContainer);

            //set container to viewport height and add component classes
            container
                .addClass('ui-fixed-toggle-container')
                .css({
                    height: height + 'px'
                })
                .addClass('ui-drawer-box-shadow');


            //append overlay to container
            var overlay = $('<ui-overlay></ui-overlay>');
            overlay.addClass('show');
            container.append(overlay);

            //save ref to overlay
            this._data.set('overlay',overlay);

            var overlayBackground=(this.options) ? this.options.overlayBackground : this.overlayBackground;
            var overlayOpacity=(this.options) ? this.options.overlayOpacity : this.overlayOpacity;
            var overlayOpenDuration=(this.options) ? this.options.overlayOpenDuration : this.overlayOpenDuration;
            var transformDuration=(this.options) ? this.options.transformDuration : this.transformDuration;
            var transformDelay=(this.options) ? this.options.transformDelay : this.transformDelay;
            var translateX=(this.options) ? this.options.translateX : this.translateX;

            overlay.transition({
                background: overlayBackground,
                opacity: overlayOpacity,
                duration: overlayOpenDuration

            });

            //transition container
            var opts = {};
            opts.duration = transformDuration;
            opts.delay = transformDelay;
            opts.easing = 'ease-in-out';
            var coordinates = {};
            coordinates.x = translateX;
            coordinates.y = 0;
            coordinates.z = 0;
            opts.coordinates = coordinates;
            opts.transitionEnd = true;

            /* click special event name */
            var click=this._data.click;
            var closeEvent=this._closeDrawer.bind(this);
            this.element.trigger('drawer.open',{open:true,closeEvent:closeEvent});
            this._3dTransition(container, opts, function () {
                self._resetHardwareAcceleration(transformContainer);
                self._resetTransition($(this));

                if (callback) {
                    callback();
                }
            });

            overlay.on(click, function () {
                if (fnClose) {
                    fnClose();
                }
            });


        },

        /**
         * close the drawer
         * @param callback
         * @private
         */
        _closeDrawer: function (callback) {
            var height=(this.options) ? this.options.height : this.height;
            //get container ref
            var container = this._data.get('container');
            var scrollTop=window.scrollY;
            /* if drawer has been vertically scrolled, we need to add scrollY to
             the fixed toggle container height(=viewport height when opened) on close
             to avoid revealing underneath content at scrollY.
             */
            if(scrollTop > 0){
                height+=scrollTop;
                container.css({
                    height:height + 'px'
                });

                /* additionally, to avoid navbar/topbar and drawer header dsiappearing from viewport on drawer close, we
                 need to assign top=scrollTop on those elements during the duration of the close animation
                 */
                this.element.css({
                    top:scrollTop + 'px'
                });

                var drawerHeader=this._data.get('drawerHeader');
                drawerHeader.css({
                    top:scrollTop + 'px'
                })
            }

            var transformContainer = this._data.get('transformContainer');
            var overlayBackground=(this.options) ? this.options.overlayBackground : this.overlayBackground;
            var overlayCloseDuration=(this.options) ? this.options.overlayCloseDuration : this.overlayCloseDuration;
            var transformDuration=(this.options) ? this.options.transformDuration : this.transformDuration;
            var transformDelay=(this.options) ? this.options.transformDelay : this.transformDelay;

            //get overlay ref
            var overlay = this._data.get('overlay');

            var self = this;
            //hardware accelerate the transition
            this._setHardwareAcceleration(transformContainer);

            var opts = {};
            opts.duration = transformDuration;
            opts.delay = transformDelay;
            opts.easing = 'ease-in-out';
            var coordinates = {};
            coordinates.x = 0;
            coordinates.y = 0;
            coordinates.z = 0;
            opts.coordinates = coordinates;
            opts.transitionEnd = true;
            this.element.trigger('drawer.close',{open:false});
            this._3dTransition(container, opts, function () {
                self._resetHardwareAcceleration(transformContainer);
                self._resetContainer(container);
                self._hideDrawer();

                if (callback) {
                    callback();
                }
            });

            /* click special event name */
            var click=this._data.click;

            overlay.off(click);

            overlay.transition({
                background: overlayBackground,
                opacity: 0,
                duration: overlayCloseDuration
            }, function () {
                overlay.remove();

            });

        },

        /**
         * show the drawer
         * @private
         */
        _showDrawer: function () {
            var height = this._device.viewport.height;
            var drawer=this._data.get('drawer');
            drawer.css({
                'min-height': height + 'px',
                'display':'block'
            });


        },

        /**
         * hide the drawer
         * @private
         */
        _hideDrawer: function () {
            var drawerHeader=this._data.get('drawerHeader');
            drawerHeader.css({
                top:''
            });
            var drawer=this._data.get('drawer');
            drawer.hide();
        },

        /**
         * remove the drawer
         * @private
         */
        _removeDrawer: function () {
            var drawer=this._data.get('drawer');
            if(drawer){
                drawer.remove();
                this._data.set('drawer',null);
            }
            this._data.set('locked',false);
            var container = this._data.get('container');
            this._resetContainer(container);
            var overlay = this._data.get('overlay');
            if (overlay) {
                overlay.remove();
            }
            var transformContainer = this._data.get('transformContainer');
            this._resetHardwareAcceleration(transformContainer);

        },


        /*==========================================
         PUBLIC METHODS
         *===========================================*/

        /**
         *  @public
         */
        showDrawer: function () {
            this._showDrawer();
        },

        /**
         *
         * @public
         */
        hideDrawer: function () {
            this._hideDrawer();
        }


    };
}));

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical=root.elliptical || {};
        root.elliptical.extensions=root.elliptical.extensions || {};
        root.elliptical.extensions.navigation = factory();
        root.returnExports = root.elliptical.extensions.navigation;
    }
}(this, function () {

    return {
        /**
         * shortcut method to create a touch navigation
         * @param element {Object}
         * @param dataClass {String}
         * @private
         */
        _createTouchNavigation: function (element, dataClass) {
            this._data.set('input',null);
            this._data.set('touchInput',null);
            this._createDrawer(element, dataClass);
            this._createTouchMenu(element);
        },

        /**
         * remove touch navigation
         * @param element
         * @private
         */
        _removeTouchNavigation: function (element) {
            //unbind touch search
            var touchInput=this._data.get('touchInput');
            if (touchInput) {
                this._unbindSearch(touchInput);
            }
            //remove drawer
            this._removeDrawer();
            //reset element
            this.element.css({
                position: ''
            });
            this._data.set('navLocked',false);
        },

        /**
         *  create a touch drawer menu from element desktop navigation widget
         * @param element {Object}
         * @private
         */
        _createTouchMenu: function (element) {
            //prevent multiple menus
            if(this._data.get('navLocked')){
                return;
            }
            this._data.set('navLocked',true);


            //get the drawer
            var drawer = this._data.get('drawer');

            //get the drawer
            var drawerSection = this._data.get('drawerSection');
            if(!drawerSection){
                return;
            }

            //get the drawer header
            var drawerHeader = this._data.get('drawerHeader');

            //create the drawer menu element
            var drawerMenu = $('<touch-ui-menu></touch-ui-menu>');

            var includeHome=(this.options) ? this.options.includeHome : this.includeHome;
            var homeUrl=(this.options) ? this.options.homeUrl : this.homeUrl;
            var homeIcon=(this.options) ? this.options.homeIcon : this.homeIcon;
            var touchMenu=(this.options) ? this.options.touchMenu : this.touchMenu;

            //add home menu item at the top
            if (includeHome) {
                drawerMenu.append(this._methods.createHomeListItem(homeUrl, homeIcon));

            }

            if(touchMenu !==undefined && touchMenu===false){
                //append menu to drawer
                drawerSection.append(drawerMenu);
                //save ref to menu
                this._data.set('drawerMenu',drawerMenu);
                return;
            }

            var menu=this._getMenu(element);

            //clone it
            var clone = menu.clone();

            //extract items from clone
            var items=this._extractMenuItems(clone);

            ///---handle dropdown buttons------
            /* unwrap button dropdowns */
            items.find('ui-button-dropdown').contents().unwrap();

            //if menu-item tag has dropdowns, replaceWith menu-item-dropdown
            items=this._methods.replaceWithMenuItemTags(items);
            ///--end handling of dropdown buttons---------

            //touchify the ui-dropdowns
            this._methods.touchifyUIDropdowns(items);


            //iconify menu items
            this._methods.iconifyTouchMenuItems(items);

            //append to menu
            drawerMenu.append(items);

            //add any linkable parent node to the child touch dropdown(it is then linkable within the child dropdown)
            drawerMenu = this._methods.addParentNodesToChildDropDowns(drawerMenu, 'ui-dropdown');


            /* ---attach search to drawerHeader----------------*/
            this._appendSearch(drawerMenu,drawerHeader);

            //add any menu items from plugin opts
            var model=(this.options) ? this.options.model : this.model;
            var optsItems = this._methods.createMenuItemsFromArray(model);
            if (optsItems) {
                drawerMenu.append(optsItems);
            }

            //append menu to drawer
            drawerSection.append(drawerMenu);

            //save ref to menu
            this._data.set('drawerMenu',drawerMenu);

        },

        /**
         *
         * @param element
         * @returns {*}
         * @private
         */
        _getMenu:function(element){
            //find DOM element menus
            return element.find('ui-menu').not('[touch-menu="false"]').add(element.find('[role="menu"]'));

        },

        _extractMenuItems:function(clone){
            var excludeMenuItemSelector='[touch-menu-item="false"]';
            var items = clone.children().not(excludeMenuItemSelector);
            return this._methods.filterMenuItems(items);
        },

        _appendSearch:function(drawerMenu,drawerHeader){
            /* first check in cloned menu items */
            var self=this;
            setTimeout(function(){
                var search=self.element.find('[role=search]');
                if(search[0]){
                    var clone=search.clone();
                    drawerHeader.append(clone);
                }
            },1000);

        },

        /**
         * append menu items from a model
         * @private
         */
        _appendMenuModel: function () {
            var model=(this.options) ? this.options.model : this.model;
            if (this._mq.touch) {
                var drawerMenu = this._data.get('drawerMenu');
                //add menu items from plugin opts
                var optsLi = this._methods.createMenuItemsFromArray(model);
                if (optsLi) {
                    drawerMenu.append(optsLi);
                }
            }
        },

        /**
         *
         * @param model {Array}
         * @private
         */
        _addMenuModel:function(model){
            var drawerMenu = $('touch-ui-menu');
            var items = this._methods.createMenuItemsFromArray(model);
            drawerMenu.append(items);
        },

        /**
         * pass an input to the search handler
         * @returns {*}
         * @private
         */
        _initSearchHandler:function(){
            var searchSelector='ui-search';
            var search_ =this.element.find(searchSelector);
            if(search_[0]){
                /* desktop search box */
                var input=search_.find('input');
                this._data.set('input',input);
                /* setup handler for desktop */
                this._onSearch(input,'desktop');
                return search_;
            }else{
                return null;
            }
        },

        /**
         * pass a touch input to the search handler
         * @param search
         * @param drawerHeader
         * @private
         */
        _initTouchSearchHandler:function(search,drawerHeader){
            /* touch search box */
            var searchClone=search.clone();
            var touchInput = searchClone.find('input');
            if (touchInput[0]) {
                this._data.set('touchInput',touchInput);
                /* append touch search box */
                drawerHeader.append(searchClone);
                /* touch search handler */
                this._onSearch(touchInput,'touch');
            }
        },

        /**
         * search handler mediator
         * @param input {object}
         * @param device {string}
         * @private
         */
        _onSearch: function (input,device) {
            if(device==='desktop'){
                if(this._data.get('searchRegistered')){
                    return false;
                } else{
                    this._data.set('searchRegistered',true);
                    this._onDesktopSearch(input)
                }

            }else{
                if(this._data.get('touchSearchRegistered')){
                    return false;
                } else {
                    this._data.set('touchSearchRegistered',true);
                }
            }
        },

        _onDesktopSearch:function(input){
            var eventTrigger=this._onEventTrigger.bind(this);
            input.on('focus', function () {
                input.on('click', function (event) {
                    if ($(this).hasClass('focused')) {
                        handleEvent(input);
                    } else {
                        input.addClass('focused');
                    }
                });
                input.keypress(function (event) {
                    if (event.which === 13) {
                        handleEvent(input);
                        return true;
                    }
                });
            });
            input.on('blur', function () {
                input.removeClass('focused');
                input.off('click');
            });


            function handleEvent(input){
                var val = input.val();
                var eventData = {
                    value: val
                };
                eventTrigger('search', eventData);
            }
        },

        _onTouchSearch:function(input){
            var eventTrigger=this._onEventTrigger.bind(this);

            input.on('focus', function () {
                input.on('tap', function (event) {
                    if ($(this).hasClass('focused')) {
                        handleEvent(input);
                    } else {
                        input.addClass('focused');
                    }
                });
            });
            input.on('blur', function () {
                input.removeClass('focused');
                input.off('tap');
            });


            function handleEvent(input){
                var val = input.val();
                var eventData = {
                    value: val
                };
                eventTrigger('search', eventData);
            }

        },


        /**
         * get the correct touch-ui-dropdown selector
         * @returns {string}
         * @private
         */
        __dropdownSelector:function(){
            return 'touch-ui-dropdown';
        },

        /**
         * get the correct item dropdown selector
         * @returns {string}
         * @private
         */
        __menuItemSelector:function(){
            return 'menu-item-dropdown';
        },

        /**
         * toggles touch sub-menu
         * @param item {Object}
         * @private
         */
        _touchToggleDropdown:function(item){
            var selector=this.__dropdownSelector();
            var dropdown=item.find(selector);
            if (dropdown.hasClass('show')) {
                item.removeClass('close');
                dropdown.removeClass('show');
            } else {
                item.addClass('close');
                dropdown.addClass('show');
            }
        },

        /**
         * link element triggers location or a dev handled event
         * @param a {object} link element
         * @param handleTouchEvents {Boolean}
         * @private
         */
        _touchMenuItem:function(a,handleTouchEvents){
            var self=this;
            var duration=(this.options) ? this.options.transformDuration : this.transformDuration;
            duration+=100;
            var id = a.attr('data-id');
            var href = a.attr('href');
            var action = a.attr('data-action');
            var route = a.attr('data-route');
            if (route && route === 'false') {
                handleTouchEvents = true;
            }
            /* close the drawer */
            this._hide();
            if (href !== undefined && href !== '#' && action === undefined && handleTouchEvents) {
                /* trigger location after the drawer has closed */
                setTimeout(function(){
                    if(typeof href !=='undefined'){
                        if(self._location) self._location(href);
                        else{
                            location.href=href;
                        }
                    }
                },duration);
            } else { //else, just fire an event
                var data = {
                    id: id,
                    action: action,
                    mode: 'touch',
                    href:href
                };
                this._onEventTrigger('selected', data);
            }
        },

        /**
         * currentTarget link element triggers submenu toggle or link element location/handled event
         * @param a {Object}
         * @param handleTouchEvents {Boolean}
         * @private
         */
        _touchMenuLink:function(a,handleTouchEvents){
            var href= a.attr('href');
            if(href===undefined || href==='#'){
                var item= a.parent('menu-item-dropdown');
                if(item[0]){
                    this._touchToggleDropdown(item);
                }
            }else{
                this._touchMenuItem(a,handleTouchEvents);
            }
        },

        /**
         * reset touch menu--hide dropdown and remove close arrow css
         * @private
         */
        _resetMenu:function(){
            var menu=this._data.get('drawerMenu');
            menu.find('.show').removeClass('show');
            menu.find('.close').removeClass('close');
        },


        _methods: {
            /**
             *
             * @returns {boolean}
             */
            customElements:function(){
                return true;
            },

            /**
             * returns menu item selector
             * @returns {string}
             */
            listItem:function(){
                return 'menu-item';
            },

            /**
             * returns dropdown menu item selector
             * @returns {string}
             */
            dropdownListItem:function(){
                return 'menu-item-dropdown';
            },

            /**
             * returns icon attribute selector
             * @returns {string}
             */
            iconAttribute:function(){
                return 'touch-icon';
            },

            /**
             *
             */
            dropdownElement:function(){
                return '<ui-dropdown></ui-dropdown>';
            },

            /**
             *
             * @param text {String}
             * @returns {*|HTMLElement}
             */
            createSpanItem: function (text) {
                return $('<span>' + text + '</span>');
            },

            /**
             *
             * @param href {String}
             * @param text {String}
             * @returns {*|HTMLElement}
             */
            createCloneListItem: function (href, text) {
                return $('<' + this.listItem() + '<a href="' + href + '">' + text + '</a></' + this.listItem() + '>');
            },

            /**
             * in a menu item dropdown, add the parent node as the first linkable item in the
             * dropdown. This is done to avoid tbe conflict of the parent triggering a dropdown
             * and being url linkable
             * @param menu {Object}
             * @param dropdownClass {String}
             * @returns {Object}
             */
            addParentNodesToChildDropDowns: function (menu, dropdownClass) {
                var li = menu.find(this.dropdownListItem());
                var self = this;
                li.each(function (i, ele) {
                    var a = $(ele).children('a');
                    var href = a.attr('href');
                    if (typeof href != 'undefined' && href != '#') {
                        var text = a.html();
                        var item = self.createCloneListItem(href, text);
                        var ul = $(ele).find('.' + dropdownClass);
                        ul.prepend(item);
                        var spanItem = self.createSpanItem(text);
                        a.replaceWith(spanItem);
                    }
                });

                return menu;
            },

            /**
             *
             * @param arr {Array}
             * //@param dropdownClass {String}
             * @returns {Array}
             */
            createMenuItemsFromArray: function (arr) {
                if (arr.length === 0) {
                    return null;
                }
                var itemArray = [];
                var a, item;
                for (var i = 0; i < arr.length; i++) {

                    if (arr[i].dropdown && arr[i].dropdown.length > 0) {
                        if (typeof arr[i].icon != 'undefined') {
                            item = $('<menu-item-dropdown><span class="touch-icon ' + arr[i].icon + '"></span><a>' + arr[i].label + '</a></menu-item-dropdown>');
                        } else {
                            item = $('<menu-item-dropdown><a>' + arr[i].label + '</a></menu-item-dropdown>');
                        }
                        var dropdown = $('<touch-ui-dropdown></touch-ui-dropdown>');
                        for (var j = 0; j < arr[i].dropdown.length; j++) {
                            var _item = $('<menu-item><a href="' + arr[i].dropdown[j].url + '">' + arr[i].dropdown[j].label + '</a></menu-item>');
                            dropdown.append(_item);
                        }

                        item.append(dropdown);
                        itemArray.push(item);

                    } else {
                        if (typeof arr[i].icon != 'undefined') {
                            item = $('<menu-item><span class="touch ' + arr[i].icon + '"><a href="' + arr[i].url + '">' + arr[i].label + '</a></span></menu-item>');
                        } else {
                            item = $('<menu-item><a href="' + arr[i].url + '">' + arr[i].label + '</a></menu-item>');
                        }
                        itemArray.push(item);
                    }
                }

                return itemArray;
            },

            /**
             *
             * @param homeUrl {String}
             * @param homeIcon {String}
             * @returns {Object}
             */
            createHomeListItem: function (homeUrl, homeIcon) {
                var item;
                var menuItem=this.listItem();
                var home='home';
                if (homeIcon === null) {
                    item = $('<' + menuItem + ' ' + home + '><a href="' + homeUrl + '">Home</a></' + menuItem + '>');
                } else {
                    item = $('<' + menuItem + ' ' + home + '><span class="touch-icon ' + homeIcon + '"></span><a href="' + homeUrl + '">Home</a></' + menuItem + '>');
                }

                return item;
            },

            filterMenuItems:function(items){
                var exclude=items.find('[data-touch="false"]');
                $.each(exclude,function(i,ele){
                    $(ele).remove();
                });
                return items;
            },

            /**
             *
             * @param items {Object}
             */
            touchifyUIDropdowns: function (items) {
                var self=this;
                $.each(items, function (index, element) {
                    var dropdown = $(element).find('ui-dropdown');
                    var megaDropdown=$(element).find('ui-mega-dropdown');
                    if (dropdown && dropdown.length > 0) {
                        dropdown.replaceWith( "<touch-ui-dropdown>" + dropdown.html() + "</touch-ui-dropdown>" );
                        if(megaDropdown && megaDropdown.length >0){
                            self.createTouchMenuItemsFromMegaDropdown(megaDropdown,dropdown);
                            megaDropdown.remove();
                        }
                    }else if(megaDropdown && megaDropdown.length >0){
                        dropdown=$('<touch-ui-dropdown></touch-ui-dropdown>');
                        self.createTouchMenuItemsFromMegaDropdown(megaDropdown,dropdown);
                        megaDropdown.replaceWith(dropdown);
                    }
                });
            },

            replaceWithMenuItemTags: function (items) {
                var clonedItems = [];
                for (var i = 0; i < items.length; i++) {
                    var $element = $(items[i]);
                    var dropdown = $element.find('ui-dropdown');
                    var megaDropdown = $element.find('ui-mega-dropdown');
                    if (dropdown[0] || megaDropdown[0]) {
                        var html = $element.html();
                        var clone = $("<menu-item-dropdown>" + html + "</menu-item-dropdown>");
                        clonedItems.push(clone[0]);
                    } else {
                        clonedItems.push($element[0]);
                    }
                }

                return clonedItems;
            },

            /**
             *
             * @param items {Array}
             */
            iconifyTouchMenuItems:function(items){
                var iconAttr=this.iconAttribute();
                $.each(items, function (index, item) {
                    var $item=$(item);
                    var icon=$item.attr(iconAttr);
                    if(icon !== undefined){
                        var span=$('<span class="touch ' + icon + '"></span>');
                        $item.prepend(span);
                    }
                });
            },

            /**
             *
             * @param mega {Element}
             * @param dropdown {Element}
             */
            createTouchMenuItemsFromMegaDropdown:function(mega,dropdown){
                var a=mega.find('a').not('[touch-menu-item="false"]');
                $.each(a,function(i,link){
                    var menuItem=$('<menu-item></menu-item>');
                    menuItem.append(link);
                    dropdown.append(menuItem);
                });
            }
        },

        /**
         *
         * @param input {object}
         * @private
         */
        _unbindSearch: function (input) {
            input.off('focus');
            input.off('blur');

        },


        /**
         *
         * @private
         */
        _onDestroy:function(){
            this._unbindSearch();
        },


        /*==========================================
         PUBLIC METHODS
         *===========================================*/

        /**
         *  @public
         */
        show: function () {
            this._show();
        },

        /**
         *
         * @public
         */
        hide: function () {
            this._hide();
        }

    };
}));

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical=root.elliptical || {};
        root.elliptical.extensions=root.elliptical.extensions || {};
        root.elliptical.extensions.transition = factory();
        root.returnExports = root.elliptical.extensions.transition;
    }
}(this, function () {

    return {

        _transition: function (element, options, callback) {
            $.transition=$.transition || $.transit;
            if (!(element instanceof jQuery)) element=$(element);
            options = options || {};
            if (options === {}) {
                options.duration = 300;
                options.preset = 'fadeIn';
            }
            if(options.preset==='none'){
                element.hide();
                return;
            }
            element.transition(options, function () {
                if (callback) {
                    callback.call(element[ 0 ]);
                }
            });
        }
    };
}));
//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical=root.elliptical || {};
        root.elliptical.extensions=root.elliptical.extensions || {};
        root.elliptical.extensions.transform = factory();
        root.returnExports = root.elliptical.extensions.transform;
    }
}(this, function () {
    var provider = $.transforms;
    var HARDWARE_ACCELERATED_CLASS='ui-hardware-accelerated';
    var OVERFLOW_CONTAINER_CLASS='ui-overflow-container';
    var FIXED_TOGGLE_CONTAINER_CLASS='ui-fixed-toggle-container';
    var BOX_SHADOW_CLASS='ui-drawer-box-shadow';

    return {

        _setHardwareAcceleration: function (element) {
            this._data.set('toggleAcceleration', provider.setHardwareAcceleration(element, HARDWARE_ACCELERATED_CLASS));
        },

        _resetHardwareAcceleration: function (element) {
            provider.resetHardwareAcceleration(element, this._data.get('toggleAcceleration'), HARDWARE_ACCELERATED_CLASS);
        },

        _setContainerOverflow: function (element) {
            this._data.set('toggleOverflow', provider.setContainerOverflow(element, OVERFLOW_CONTAINER_CLASS));
        },

        _resetContainerOverflow: function (element) {
            provider.resetContainerOverflow(element, OVERFLOW_CONTAINER_CLASS);
        },

        _resetContainer: function (container) {
            provider.resetContainer(container, BOX_SHADOW_CLASS, FIXED_TOGGLE_CONTAINER_CLASS);
        },

        _resetTransition: function (element) {
            provider.resetTransition(element);
        },

        _resetTransform: function (element) {
            provider.resetTransform(element);
        },

        _transform: function (element, coordinates) {
            provider.transform(element, coordinates);
        },

        _3dTransition: function (element, opts, callback) {
            provider.transition3d(element, opts, callback);
        }

    };
}));
//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical=root.elliptical || {};
        root.elliptical.extensions=root.elliptical.extensions || {};
        root.elliptical.extensions.template = factory(root.elliptical.utils,root.dust);
        root.returnExports = root.elliptical.extensions.template;
    }
}(this, function (utils,dust) {
    var random=utils.random;

    return {

        __precompile:function(template,id){
            template = template.replace(/&quot;/g,'"');
            var compiled=dust.compile(template,id);
            dust.loadSource(compiled);
        },

        _precompileTemplate:function(node,templateId){
            var html=node.innerHTML;
            this.__precompile(html,templateId);
        },

        _verifyTemplateExists:function(templateId){
            if(dust.cache[templateId]===undefined){
                console.log('warning: template ' + templateId + ' does not exist');
            }
        },

        _render:function(node,templateId,context,callback){
            this._verifyTemplateExists(templateId);
            dust.render(templateId, context, function (err, out) {
                if(out || out===""){
                    node.innerHTML=out;
                }
                if (callback) {
                    callback(err, out);
                }
            });
        },

        _renderTemplate:function(templateId,context,callback){
            this._verifyTemplateExists(templateId);
            dust.render(templateId, context, callback);
        },

        _renderTemplateString:function(str,context,callback){
            var id='template-' + random.str(6);
            this.__precompile(str,id);
            this._renderTemplate(id,context,callback);
        }
    };
}));

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical = root.elliptical || {};
        root.elliptical.extensions = root.elliptical.extensions || {};
        root.elliptical.extensions.event = factory();
        root.returnExports = root.elliptical.extensions.event;
    }
}(this, function () {

    return {

        _onEventTrigger: function (evt, data) {
            this._triggerEvent(evt, data);
        },

        _triggerEvent: function (evt, data) {
            var event = $.Event(evt);
            this._trigger(evt, event, data);
        },

        _trigger: function (type, event, data) {
            if(this.options){
                this._jqTrigger(type,event,data);
            }else{
                this.__triggerEvent(type,data);
            }
        },

        __triggerEvent:function(evt,data){
            var nameSpacedTagName = this._utils.string.tagNameToNamespace(tagName);
            evt=nameSpacedTagName + '.' + evt;
            this.element.trigger(evt,data);
        },

        _jqTrigger:function(type,event,data){
            try {
                var prop, orig,
                    callback = this.options[type];

                data = data || {};
                var prefix = this.widgetEventPrefix;
                var tagName = this.bindings[0].tagName.toLowerCase();
                var tagArray = tagName.split('-');
                var tagLength = tagArray.length;
                var nameSpacedTagName = this._utils.string.tagNameToNamespace(tagName);
                var arr = prefix.toArrayFromCamelCase();
                var nameSpacedPrefix = this._utils.array.toNamespaceFromArray(arr);
                if (nameSpacedPrefix === nameSpacedTagName) {
                    prefix = nameSpacedPrefix;
                } else if (tagLength > 1) {
                    prefix = nameSpacedTagName + '.' + prefix;
                } else {
                    prefix = this.namespace + '.' + prefix;
                }

                event = $.Event(event);
                event.type = ( type === prefix ?
                    type :
                prefix + '.' + type ).toLowerCase();
                // the original event may come from any element
                // so we need to reset the target on the new event
                event.target = this.element[0];

                // copy original event properties over to the new event
                orig = event.originalEvent;
                if (orig) {
                    for (prop in orig) {
                        if (!( prop in event )) {
                            event[prop] = orig[prop];
                        }
                    }
                }

                this.element.trigger(event, data);
                return !( $.isFunction(callback) &&
                callback.apply(this.element[0], [event].concat(data)) === false ||
                event.isDefaultPrevented() );
            } catch (ex) {

            }
        }

    };
}));

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.extensions=root.elliptical.extensions || {};
        root.elliptical.extensions.options = factory(root.elliptical.utils);
        root.returnExports = root.elliptical.extensions.options;
    }
}(this, function (utils) {

    return {

        _setOptionsFromAttribute:function(){
            var options=(this.options) ? this.options.opts : this.opts;
            if(options===undefined) return;
            options=JSON.parse(options);
            var src=(this.options) ? this.options : this;
            Object.assign(src,options);
        }


    };
}));

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'),require('jquery-extensions'),require('./prototype.device'), require('./prototype.template'),
            require('./prototype.transition'), require('./prototype.transform'),require('./prototype.utils'),
            require('./prototype.event'),require('./prototype.options'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils','jquery-extensions','./prototype.device',
            './prototype.template','./prototype.transition','./prototype.transform','./prototype.utils','./prototype.event','./prototype.options'], factory);
    } else {
        // Browser globals (root is window)
        var e=root.elliptical.extensions;
        root.elliptical.extensions.base = factory(root.elliptical.utils,e.device,
            e.template,e.transition,e.transform,e.utils,e.event,e.options);
        root.returnExports = root.elliptical.extensions.base;
    }
}(this, function (utils,root,device,template,transition,transform,util,event,options) {

    var base={};
    Object.assign(base,util,device,template,transition,transform,event,options);
    return base;

}));