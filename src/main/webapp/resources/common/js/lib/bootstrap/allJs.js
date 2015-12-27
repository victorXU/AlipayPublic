///<jscompress sourcefile="moment.js" />
//! moment.js
//! version : 2.5.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {

    /************************************
     Constants
     ************************************/

    var moment,
        VERSION = "2.5.1",
        global = this,
        round = Math.round,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

    // internal storage for language config files
        languages = {},

    // moment internal properties
        momentProperties = {
            _isAMomentObject: null,
            _i: null,
            _f: null,
            _l: null,
            _strict: null,
            _isUTC: null,
            _offset: null, // optional. Combine with _isUTC
            _pf: null,
            _lang: null // optional
        },

    // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined'),

    // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

    // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

    // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

    //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

    // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d{1,3}/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

    // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

    // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds': 1,
            'Seconds': 1e3,
            'Minutes': 6e4,
            'Hours': 36e5,
            'Days': 864e5,
            'Months': 2592e6,
            'Years': 31536e6
        },

        unitAliases = {
            ms: 'millisecond',
            s: 'second',
            m: 'minute',
            h: 'hour',
            d: 'day',
            D: 'date',
            w: 'week',
            W: 'isoWeek',
            M: 'month',
            y: 'year',
            DDD: 'dayOfYear',
            e: 'weekday',
            E: 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear: 'dayOfYear',
            isoweekday: 'isoWeekday',
            isoweek: 'isoWeek',
            weekyear: 'weekYear',
            isoweekyear: 'isoWeekYear'
        },

    // format function strings
        formatFunctions = {},

    // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M: function () {
                return this.month() + 1;
            },
            MMM: function (format) {
                return this.lang().monthsShort(this, format);
            },
            MMMM: function (format) {
                return this.lang().months(this, format);
            },
            D: function () {
                return this.date();
            },
            DDD: function () {
                return this.dayOfYear();
            },
            d: function () {
                return this.day();
            },
            dd: function (format) {
                return this.lang().weekdaysMin(this, format);
            },
            ddd: function (format) {
                return this.lang().weekdaysShort(this, format);
            },
            dddd: function (format) {
                return this.lang().weekdays(this, format);
            },
            w: function () {
                return this.week();
            },
            W: function () {
                return this.isoWeek();
            },
            YY: function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY: function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY: function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY: function () {
                var y = this.year(),
                    sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg: function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg: function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg: function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG: function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG: function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG: function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e: function () {
                return this.weekday();
            },
            E: function () {
                return this.isoWeekday();
            },
            a: function () {
                return this.lang().meridiem(this.hours(), this.minutes(), true);
            },
            A: function () {
                return this.lang().meridiem(this.hours(), this.minutes(), false);
            },
            H: function () {
                return this.hours();
            },
            h: function () {
                return this.hours() % 12 || 12;
            },
            m: function () {
                return this.minutes();
            },
            s: function () {
                return this.seconds();
            },
            S: function () {
                return toInt(this.milliseconds() / 100);
            },
            SS: function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS: function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS: function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z: function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ: function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z: function () {
                return this.zoneAbbr();
            },
            zz: function () {
                return this.zoneName();
            },
            X: function () {
                return this.unix();
            },
            Q: function () {
                return this.quarter();
            }
        },

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false
        };
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }

    function ordinalizeToken(func, period) {
        return function (a) {
            return this.lang().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
     Constructors
     ************************************/

    function Language() {

    }

    // Moment prototype object

    function Moment(config) {
        checkOverflow(config);
        extend(this, config);
    }

    // Duration Constructor

    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            years * 12;

        this._data = {};

        this._bubble();
    }

    /************************************
     Helpers
     ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }

        if (b.hasOwnProperty("toString")) {
            a.toString = b.toString;
        }

        if (b.hasOwnProperty("valueOf")) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function cloneMoment(m) {
        var result = {}, i;
        for (i in m) {
            if (m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i)) {
                result[i] = m[i];
            }
        }

        return result;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison

    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    // helper function for _.addTime and _.subtractTime

    function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months,
            minutes,
            hours;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        // store the minutes and hours so we can restore them
        if (days || months) {
            minutes = mom.minute();
            hours = mom.hour();
        }
        if (days) {
            mom.date(mom.date() + days * isAdding);
        }
        if (months) {
            mom.month(mom.month() + months * isAdding);
        }
        if (milliseconds && !ignoreUpdateOffset) {
            moment.updateOffset(mom);
        }
        // restore the minutes and hours after possibly changing dst
        if (days || months) {
            mom.minute(minutes);
            mom.hour(hours);
        }
    }

    // check if is an array

    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return Object.prototype.toString.call(input) === '[object Date]' ||
            input instanceof Date;
    }

    // compare two arrays, return the number of differences

    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (inputObject.hasOwnProperty(prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        } else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        } else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment.fn._lang[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment.fn._lang, m, format || '');
            };

            if (index != null) {
                return getter(index);
            } else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                    m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                        m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR :
                            m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                                    m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
                m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    m._pf.charsLeftOver === 0 &&
                    m._pf.unusedTokens.length === 0;
            }
        }
        return m._isValid;
    }

    function normalizeLanguage(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.

    function makeAs(input, model) {
        return model._isUTC ? moment(input).zone(model._offset || 0) :
            moment(input).local();
    }

    /************************************
     Languages
     ************************************/


    extend(Language.prototype, {

        set: function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        },

        _months: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
        months: function (m) {
            return this._months[m.month()];
        },

        _monthsShort: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
        monthsShort: function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse: function (monthName) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                if (!this._monthsParse[i]) {
                    mom = moment.utc([2000, i]);
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays: "日_一_二_三_四_五_六".split("_"),
        weekdays: function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort: "日_一_二_三_四_五_六".split("_"),
        weekdaysShort: function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin: "日_一_二_三_四_五_六".split("_"),
        weekdaysMin: function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse: function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat: {
            LT: "h:mm A",
            L: "MM/DD/YYYY",
            LL: "MMMM D YYYY",
            LLL: "MMMM D YYYY LT",
            LLLL: "dddd, MMMM D YYYY LT"
        },
        longDateFormat: function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM: function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse: /[ap]\.?m?\.?/i,
        meridiem: function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar: {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd [at] LT',
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            sameElse: 'L'
        },
        calendar: function (key, mom) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom) : output;
        },

        _relativeTime: {
            future: "in %s",
            past: "%s ago",
            s: "a few seconds",
            m: "a minute",
            mm: "%d minutes",
            h: "an hour",
            hh: "%d hours",
            d: "a day",
            dd: "%d days",
            M: "a month",
            MM: "%d months",
            y: "a year",
            yy: "%d years"
        },
        relativeTime: function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },
        pastFuture: function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal: function (number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal: "%d",

        preparse: function (string) {
            return string;
        },

        postformat: function (string) {
            return string;
        },

        week: function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week: {
            dow: 0, // Sunday is the first day of the week.
            doy: 6 // The week that contains Jan 1st is the first week of the year.
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    // Loads a language definition into the `languages` cache.  The function
    // takes a key and optionally values.  If not in the browser and no values
    // are provided, it will load the language file module.  As a convenience,
    // this function also returns the language values.

    function loadLang(key, values) {
        values.abbr = key;
        if (!languages[key]) {
            languages[key] = new Language();
        }
        languages[key].set(values);
        return languages[key];
    }

    // Remove a language from the `languages` cache. Mostly useful in tests.

    function unloadLang(key) {
        delete languages[key];
    }

    // Determines which language definition to use and returns it.
    //
    // With no parameters, it will return the global language.  If you
    // pass in a language key, such as 'en', it will return the
    // definition for 'en', so long as 'en' has already been loaded using
    // moment.lang.

    function getLangDefinition(key) {
        var i = 0,
            j, lang, next, split,
            get = function (k) {
                if (!languages[k] && hasModule) {
                    try {
                        require('./lang/' + k);
                    } catch (e) {
                    }
                }
                return languages[k];
            };

        if (!key) {
            return moment.fn._lang;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            lang = get(key);
            if (lang) {
                return lang;
            }
            key = [key];
        }

        //pick the language from the array
        //try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
        //substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
        while (i < key.length) {
            split = normalizeLanguage(key[i]).split('-');
            j = split.length;
            next = normalizeLanguage(key[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                lang = get(split.slice(0, j).join('-'));
                if (lang) {
                    return lang;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return moment.fn._lang;
    }

    /************************************
     Formatting
     ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens),
            i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = "";
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object

    function formatMoment(m, format) {

        if (!m.isValid()) {
            return m.lang().invalidDate();
        }

        format = expandFormat(format, m.lang());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, lang) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return lang.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
     Parsing
     ************************************/


    // get the regex to find the next token

    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
            case 'DDDD':
                return parseTokenThreeDigits;
            case 'YYYY':
            case 'GGGG':
            case 'gggg':
                return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
            case 'Y':
            case 'G':
            case 'g':
                return parseTokenSignedNumber;
            case 'YYYYYY':
            case 'YYYYY':
            case 'GGGGG':
            case 'ggggg':
                return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
            case 'S':
                if (strict) {
                    return parseTokenOneDigit;
                }
            /* falls through */
            case 'SS':
                if (strict) {
                    return parseTokenTwoDigits;
                }
            /* falls through */
            case 'SSS':
                if (strict) {
                    return parseTokenThreeDigits;
                }
            /* falls through */
            case 'DDD':
                return parseTokenOneToThreeDigits;
            case 'MMM':
            case 'MMMM':
            case 'dd':
            case 'ddd':
            case 'dddd':
                return parseTokenWord;
            case 'a':
            case 'A':
                return getLangDefinition(config._l)._meridiemParse;
            case 'X':
                return parseTokenTimestampMs;
            case 'Z':
            case 'ZZ':
                return parseTokenTimezone;
            case 'T':
                return parseTokenT;
            case 'SSSS':
                return parseTokenDigits;
            case 'MM':
            case 'DD':
            case 'YY':
            case 'GG':
            case 'gg':
            case 'HH':
            case 'hh':
            case 'mm':
            case 'ss':
            case 'ww':
            case 'WW':
                return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
            case 'M':
            case 'D':
            case 'd':
            case 'H':
            case 'h':
            case 'm':
            case 's':
            case 'w':
            case 'W':
            case 'e':
            case 'E':
                return parseTokenOneOrTwoDigits;
            default:
                a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), "i"));
                return a;
        }
    }

    function timezoneMinutesFromString(string) {
        string = string || "";
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date

    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
            // MONTH
            case 'M': // fall through to MM
            case 'MM':
                if (input != null) {
                    datePartArray[MONTH] = toInt(input) - 1;
                }
                break;
            case 'MMM': // fall through to MMMM
            case 'MMMM':
                a = getLangDefinition(config._l).monthsParse(input);
                // if we didn't find a month name, mark the date as invalid.
                if (a != null) {
                    datePartArray[MONTH] = a;
                } else {
                    config._pf.invalidMonth = input;
                }
                break;
            // DAY OF MONTH
            case 'D': // fall through to DD
            case 'DD':
                if (input != null) {
                    datePartArray[DATE] = toInt(input);
                }
                break;
            // DAY OF YEAR
            case 'DDD': // fall through to DDDD
            case 'DDDD':
                if (input != null) {
                    config._dayOfYear = toInt(input);
                }

                break;
            // YEAR
            case 'YY':
                datePartArray[YEAR] = toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
                break;
            case 'YYYY':
            case 'YYYYY':
            case 'YYYYYY':
                datePartArray[YEAR] = toInt(input);
                break;
            // AM / PM
            case 'a': // fall through to A
            case 'A':
                config._isPm = getLangDefinition(config._l).isPM(input);
                break;
            // 24 HOUR
            case 'H': // fall through to hh
            case 'HH': // fall through to hh
            case 'h': // fall through to hh
            case 'hh':
                datePartArray[HOUR] = toInt(input);
                break;
            // MINUTE
            case 'm': // fall through to mm
            case 'mm':
                datePartArray[MINUTE] = toInt(input);
                break;
            // SECOND
            case 's': // fall through to ss
            case 'ss':
                datePartArray[SECOND] = toInt(input);
                break;
            // MILLISECOND
            case 'S':
            case 'SS':
            case 'SSS':
            case 'SSSS':
                datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
                break;
            // UNIX TIMESTAMP WITH MS
            case 'X':
                config._d = new Date(parseFloat(input) * 1000);
                break;
            // TIMEZONE
            case 'Z': // fall through to ZZ
            case 'ZZ':
                config._useUTC = true;
                config._tzm = timezoneMinutesFromString(input);
                break;
            case 'w':
            case 'ww':
            case 'W':
            case 'WW':
            case 'd':
            case 'dd':
            case 'ddd':
            case 'dddd':
            case 'e':
            case 'E':
                token = token.substr(0, 1);
            /* falls through */
            case 'gg':
            case 'gggg':
            case 'GG':
            case 'GGGG':
            case 'GGGGG':
                token = token.substr(0, 2);
                if (input) {
                    config._w = config._w || {};
                    config._w[token] = input;
                }
                break;
        }
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]

    function dateFromConfig(config) {
        var i, date, input = [],
            currentDate,
            yearToUse, fixYear, w, temp, lang, weekday, week;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            fixYear = function (val) {
                var int_val = parseInt(val, 10);
                return val ?
                    (val.length < 3 ? (int_val > 68 ? 1900 + int_val : 2000 + int_val) : int_val) :
                    (config._a[YEAR] == null ? moment().weekYear() : config._a[YEAR]);
            };

            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1);
            } else {
                lang = getLangDefinition(config._l);
                weekday = w.d != null ? parseWeekday(w.d, lang) :
                    (w.e != null ? parseInt(w.e, 10) + lang._week.dow : 0);

                week = parseInt(w.w, 10) || 1;

                //if we're parsing 'd', then the low day numbers may be next week
                if (w.d != null && weekday < lang._week.dow) {
                    week++;
                }

                temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow);
            }

            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = config._a[YEAR] == null ? currentDate[YEAR] : config._a[YEAR];

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // add the offsets to the time to be parsed so that we can have a clean array for checking isValid
        input[HOUR] += toInt((config._tzm || 0) / 60);
        input[MINUTE] += toInt((config._tzm || 0) % 60);

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string

    function makeDateFromStringAndFormat(config) {

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var lang = getLangDefinition(config._l),
            string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, lang).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                } else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            } else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // handle am pm
        if (config._isPm && config._a[HOUR] < 12) {
            config._a[HOUR] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[HOUR] === 12) {
            config._a[HOUR] = 0;
        }

        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript

    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings

    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = extend({}, config);
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format

    function makeDateFromString(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be "T" or undefined
                    config._f = isoDates[i][0] + (match[6] || " ");
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += "Z";
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._d = new Date(string);
        }
    }

    function makeDateFromInput(config) {
        var input = config._i,
            matched = aspNetJsonRegex.exec(input);

        if (input === undefined) {
            config._d = new Date();
        } else if (matched) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromConfig(config);
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else {
            config._d = new Date(input);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, language) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            } else {
                input = language.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
     Relative Time
     ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize

    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < 45 && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < 22 && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= 25 && ['dd', days] ||
                days <= 45 && ['M'] ||
                days < 345 && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
     Week of Year
     ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))

    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday

    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(),
            daysToAdd, dayOfYear;

        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
     Top Level Functions
     ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f;

        if (input === null) {
            return moment.invalid({
                nullInput: true
            });
        }

        if (typeof input === 'string') {
            config._i = input = getLangDefinition().preparse(input);
        }

        if (moment.isMoment(input)) {
            config = cloneMoment(input);

            config._d = new Date(+input._d);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        return new Moment(config);
    }

    moment = function (input, format, lang, strict) {
        var c;

        if (typeof(lang) === "boolean") {
            strict = lang;
            lang = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = lang;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    // creating with utc
    moment.utc = function (input, format, lang, strict) {
        var c;

        if (typeof(lang) === "boolean") {
            strict = lang;
            lang = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = lang;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
        // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === "-") ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === "-") ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && input.hasOwnProperty('_lang')) {
            ret._lang = input._lang;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {
    };

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    moment.lang = function (key, values) {
        var r;
        if (!key) {
            return moment.fn._lang._abbr;
        }
        if (values) {
            loadLang(normalizeLanguage(key), values);
        } else if (values === null) {
            unloadLang(key);
            key = 'en';
        } else if (!languages[key]) {
            getLangDefinition(key);
        }
        r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
        return r._abbr;
    };

    // returns language data
    moment.langData = function (key) {
        if (key && key._lang && key._lang._abbr) {
            key = key._lang._abbr;
        }
        return getLangDefinition(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null && obj.hasOwnProperty('_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        } else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function (input) {
        return moment(input).parseZone();
    };

    /************************************
     Moment Prototype
     ************************************/


    extend(moment.fn = Moment.prototype, {

        clone: function () {
            return moment(this);
        },

        valueOf: function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix: function () {
            return Math.floor(+this / 1000);
        },

        toString: function () {
            return this.clone().lang('en').format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },

        toDate: function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString: function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray: function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid: function () {
            return isValid(this);
        },

        isDSTShifted: function () {

            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags: function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc: function () {
            return this.zone(0);
        },

        local: function () {
            this.zone(0);
            this._isUTC = false;
            return this;
        },

        format: function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },

        add: function (input, val) {
            var dur;
            // switch args to support add('s', 1) and add(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },

        subtract: function (input, val) {
            var dur;
            // switch args to support subtract('s', 1) and subtract(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },

        diff: function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                output += ((this - moment(this).startOf('month')) -
                    (that - moment(that).startOf('month'))) / diff;
                // same as above but with zones, to negate all dst
                output -= ((this.zone() - moment(this).startOf('month').zone()) -
                    (that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                        units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                            units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                                units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from: function (time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },

        fromNow: function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar: function () {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're zone'd or not.
            var sod = makeAs(moment(), this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                        diff < 0 ? 'lastDay' :
                            diff < 1 ? 'sameDay' :
                                diff < 2 ? 'nextDay' :
                                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.lang().calendar(format, this));
        },

        isLeapYear: function () {
            return isLeapYear(this.year());
        },

        isDST: function () {
            return (this.zone() < this.clone().month(0).zone() ||
            this.zone() < this.clone().month(5).zone());
        },

        day: function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.lang());
                return this.add({
                    d: input - day
                });
            } else {
                return day;
            }
        },

        month: function (input) {
            var utc = this._isUTC ? 'UTC' : '',
                dayOfMonth;

            if (input != null) {
                if (typeof input === 'string') {
                    input = this.lang().monthsParse(input);
                    if (typeof input !== 'number') {
                        return this;
                    }
                }

                dayOfMonth = this.date();
                this.date(1);
                this._d['set' + utc + 'Month'](input);
                this.date(Math.min(dayOfMonth, this.daysInMonth()));

                moment.updateOffset(this);
                return this;
            } else {
                return this._d['get' + utc + 'Month']();
            }
        },

        startOf: function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
                case 'year':
                    this.month(0);
                /* falls through */
                case 'month':
                    this.date(1);
                /* falls through */
                case 'week':
                case 'isoWeek':
                case 'day':
                    this.hours(0);
                /* falls through */
                case 'hour':
                    this.minutes(0);
                /* falls through */
                case 'minute':
                    this.seconds(0);
                /* falls through */
                case 'second':
                    this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            return this.startOf(units).add((units === 'isoWeek' ? 'week' : units), 1).subtract('ms', 1);
        },

        isAfter: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },

        isBefore: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },

        isSame: function (input, units) {
            units = units || 'ms';
            return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
        },

        min: function (other) {
            other = moment.apply(null, arguments);
            return other < this ? this : other;
        },

        max: function (other) {
            other = moment.apply(null, arguments);
            return other > this ? this : other;
        },

        zone: function (input) {
            var offset = this._offset || 0;
            if (input != null) {
                if (typeof input === "string") {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                this._offset = input;
                this._isUTC = true;
                if (offset !== input) {
                    addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true);
                }
            } else {
                return this._isUTC ? offset : this._d.getTimezoneOffset();
            }
            return this;
        },

        zoneAbbr: function () {
            return this._isUTC ? "UTC" : "";
        },

        zoneName: function () {
            return this._isUTC ? "Coordinated Universal Time" : "";
        },

        parseZone: function () {
            if (this._tzm) {
                this.zone(this._tzm);
            } else if (typeof this._i === 'string') {
                this.zone(this._i);
            }
            return this;
        },

        hasAlignedHourOffset: function (input) {
            if (!input) {
                input = 0;
            } else {
                input = moment(input).zone();
            }

            return (this.zone() - input) % 60 === 0;
        },

        daysInMonth: function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear: function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add("d", (input - dayOfYear));
        },

        quarter: function () {
            return Math.ceil((this.month() + 1.0) / 3.0);
        },

        weekYear: function (input) {
            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return input == null ? year : this.add("y", (input - year));
        },

        isoWeekYear: function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add("y", (input - year));
        },

        week: function (input) {
            var week = this.lang().week(this);
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        isoWeek: function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        weekday: function (input) {
            var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
            return input == null ? weekday : this.add("d", input - weekday);
        },

        isoWeekday: function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        get: function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set: function (units, value) {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                this[units](value);
            }
            return this;
        },

        // If passed a language key, it will set the language for this
        // instance.  Otherwise, it will return the language configuration
        // variables for this instance.
        lang: function (key) {
            if (key === undefined) {
                return this._lang;
            } else {
                this._lang = getLangDefinition(key);
                return this;
            }
        }
    });

    // helper for adding shortcuts

    function makeGetterAndSetter(name, key) {
        moment.fn[name] = moment.fn[name + 's'] = function (input) {
            var utc = this._isUTC ? 'UTC' : '';
            if (input != null) {
                this._d['set' + utc + key](input);
                moment.updateOffset(this);
                return this;
            } else {
                return this._d['get' + utc + key]();
            }
        };
    }

    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
    for (i = 0; i < proxyGettersAndSetters.length; i++) {
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
    }

    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
    makeGetterAndSetter('year', 'FullYear');

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
     Duration Prototype
     ************************************/


    extend(moment.duration.fn = Duration.prototype, {

        _bubble: function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);
            data.days = days % 30;

            months += absRound(days / 30);
            data.months = months % 12;

            years = absRound(months / 12);
            data.years = years;
        },

        weeks: function () {
            return absRound(this.days() / 7);
        },

        valueOf: function () {
            return this._milliseconds +
                this._days * 864e5 +
                (this._months % 12) * 2592e6 +
                toInt(this._months / 12) * 31536e6;
        },

        humanize: function (withSuffix) {
            var difference = +this,
                output = relativeTime(difference, !withSuffix, this.lang());

            if (withSuffix) {
                output = this.lang().pastFuture(difference, output);
            }

            return this.lang().postformat(output);
        },

        add: function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract: function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get: function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as: function (units) {
            units = normalizeUnits(units);
            return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
        },

        lang: moment.fn.lang,

        toIsoString: function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        }
    });

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    function makeDurationAsGetter(name, factor) {
        moment.duration.fn['as' + name] = function () {
            return +this / factor;
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }

    makeDurationAsGetter('Weeks', 6048e5);
    moment.duration.fn.asMonths = function () {
        return (+this - this.years() * 31536e6) / 2592e6 + this.years() * 12;
    };


    /************************************
     Default Lang
     ************************************/


        // Set default language, other languages will inherit from English.
    moment.lang('en', {
        ordinal: function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                        (b === 2) ? 'nd' :
                            (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    /* EMBED_LANGUAGES */

    /************************************
     Exposing Moment
     ************************************/

    function makeGlobal(deprecate) {
        var warned = false,
            local_moment = moment;
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        // here, `this` means `window` in the browser, or `global` on the server
        // add `moment` as a global object via a string identifier,
        // for Closure Compiler "advanced" mode
        if (deprecate) {
            global.moment = function () {
                if (!warned && console && console.warn) {
                    warned = true;
                    console.warn(
                        "Accessing Moment through the global scope is " +
                        "deprecated, and will be removed in an upcoming " +
                        "release.");
                }
                return local_moment.apply(null, arguments);
            };
            extend(global.moment, local_moment);
        } else {
            global['moment'] = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
        makeGlobal(true);
    } else if (typeof define === "function" && define.amd) {
        define("moment", function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal !== true) {
                // If user provided noGlobal, he is aware of global
                makeGlobal(module.config().noGlobal === undefined);
            }

            return moment;
        });
    } else {
        makeGlobal();
    }
}).call(this);
///<jscompress sourcefile="daterangepicker.js" />
/**
 * @version: 1.3.3
 * @author: Dan Grossman http://www.dangrossman.info/
 * @date: 2014-01-22
 * @copyright: Copyright (c) 2012-2014 Dan Grossman. All rights reserved.
 * @license: Licensed under Apache License v2.0. See http://www.apache.org/licenses/LICENSE-2.0
 * @website: http://www.improvely.com/
 */
!function ($, moment) {

    var DateRangePicker = function (element, options, cb) {

        // by default, the daterangepicker element is placed at the bottom of HTML body
        this.parentEl = 'body';

        //element that triggered the date range picker
        this.element = $(element);

        //create the picker HTML object
        var DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
            '<div class="calendar left"></div>' +
            '<div class="calendar right"></div>' +
            '<div class="ranges">' +
            '<div class="range_inputs">' +
            '<div class="daterangepicker_start_input">' +
            '<label for="daterangepicker_start"></label>' +
            '<input class="input-mini" type="text" name="daterangepicker_start" value="" disabled="disabled" />' +
            '</div>' +
            '<div class="daterangepicker_end_input">' +
            '<label for="daterangepicker_end"></label>' +
            '<input class="input-mini" type="text" name="daterangepicker_end" value="" disabled="disabled" />' +
            '</div>' +
            '<button class="applyBtn" disabled="disabled"></button>&nbsp;' +
            '<button class="cancelBtn"></button>' +
            '</div>' +
            '</div>' +
            '</div>';

        this.parentEl = (typeof options === 'object' && options.parentEl && $(options.parentEl)) || $(this.parentEl);
        this.container = $(DRPTemplate).appendTo(this.parentEl);

        //custom options
        if (typeof options !== 'object')
            options = {};
        this.setOptions(options, cb);

        //apply CSS classes and labels to buttons
        var c = this.container;
        $.each(this.buttonClasses, function (idx, val) {
            c.find('button').addClass(val);
        });
        this.container.find('.daterangepicker_start_input label').html(this.locale.fromLabel);
        this.container.find('.daterangepicker_end_input label').html(this.locale.toLabel);
        if (this.applyClass.length)
            this.container.find('.applyBtn').addClass(this.applyClass);
        if (this.cancelClass.length)
            this.container.find('.cancelBtn').addClass(this.cancelClass);
        this.container.find('.applyBtn').html(this.locale.applyLabel);
        this.container.find('.cancelBtn').html(this.locale.cancelLabel);

        //event listeners
        this.container.on('mousedown', $.proxy(this.mousedown, this));

        this.container.find('.calendar')
            .on('click', '.prev', $.proxy(this.clickPrev, this))
            .on('click', '.next', $.proxy(this.clickNext, this))
            .on('click', 'td.available', $.proxy(this.clickDate, this))
            .on('mouseenter', 'td.available', $.proxy(this.enterDate, this))
            .on('mouseleave', 'td.available', $.proxy(this.updateFormInputs, this))
            .on('change', 'select.yearselect', $.proxy(this.updateMonthYear, this))
            .on('change', 'select.monthselect', $.proxy(this.updateMonthYear, this))
            .on('change', 'select.hourselect,select.minuteselect,select.ampmselect', $.proxy(this.updateTime, this));

        this.container.find('.ranges')
            .on('click', 'button.applyBtn', $.proxy(this.clickApply, this))
            .on('click', 'button.cancelBtn', $.proxy(this.clickCancel, this))
            .on('click', '.daterangepicker_start_input,.daterangepicker_end_input', $.proxy(this.showCalendars, this))
            .on('click', 'li', $.proxy(this.clickRange, this))
            .on('mouseenter', 'li', $.proxy(this.enterRange, this))
            .on('mouseleave', 'li', $.proxy(this.updateFormInputs, this));

        if (this.element.is('input')) {
            this.element.on({
                'click.daterangepicker': $.proxy(this.show, this),
                'focus.daterangepicker': $.proxy(this.show, this),
                'keyup.daterangepicker': $.proxy(this.updateFromControl, this)
            });
        } else {
            this.element.on('click.daterangepicker', $.proxy(this.show, this));
        }

    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        setOptions: function (options, callback) {

            this.startDate = moment().startOf('day');
            this.endDate = moment().startOf('day');
            this.minDate = false;
            this.maxDate = false;
            this.dateLimit = false;

            this.showDropdowns = false;
            this.showWeekNumbers = false;
            this.timePicker = false;
            this.timePickerIncrement = 30;
            this.timePicker12Hour = true;
            this.singleDatePicker = false;
            this.ranges = {};

            this.opens = 'right';
            if (this.element.hasClass('pull-right'))
                this.opens = 'left';

            this.buttonClasses = ['btn', 'btn-small'];
            this.applyClass = 'btn-blue';
            this.cancelClass = 'btn-default';

            this.format = 'MM/DD/YYYY';
            this.separator = ' ~ ';

            this.locale = {
                applyLabel: '确定',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                weekLabel: 'W',
                customRangeLabel: 'Custom Range',
                daysOfWeek: moment()._lang._weekdaysMin.slice(),
                monthNames: moment()._lang._monthsShort.slice(),
                firstDay: 0
            };

            this.cb = function () {
            };

            if (typeof options.format === 'string')
                this.format = options.format;

            if (typeof options.separator === 'string')
                this.separator = options.separator;

            if (typeof options.startDate === 'string')
                this.startDate = moment(options.startDate, this.format);

            if (typeof options.endDate === 'string')
                this.endDate = moment(options.endDate, this.format);

            if (typeof options.minDate === 'string')
                this.minDate = moment(options.minDate, this.format);

            if (typeof options.maxDate === 'string')
                this.maxDate = moment(options.maxDate, this.format);

            if (typeof options.startDate === 'object')
                this.startDate = moment(options.startDate);

            if (typeof options.endDate === 'object')
                this.endDate = moment(options.endDate);

            if (typeof options.minDate === 'object')
                this.minDate = moment(options.minDate);

            if (typeof options.maxDate === 'object')
                this.maxDate = moment(options.maxDate);

            if (typeof options.applyClass === 'string')
                this.applyClass = options.applyClass;

            if (typeof options.cancelClass === 'string')
                this.cancelClass = options.cancelClass;

            if (typeof options.dateLimit === 'object')
                this.dateLimit = options.dateLimit;

            // update day names order to firstDay
            if (typeof options.locale === 'object') {

                if (typeof options.locale.daysOfWeek === 'object') {
                    // Create a copy of daysOfWeek to avoid modification of original
                    // options object for reusability in multiple daterangepicker instances
                    this.locale.daysOfWeek = options.locale.daysOfWeek.slice();
                }

                if (typeof options.locale.monthNames === 'object') {
                    this.locale.monthNames = options.locale.monthNames.slice();
                }

                if (typeof options.locale.firstDay === 'number') {
                    this.locale.firstDay = options.locale.firstDay;
                    var iterator = options.locale.firstDay;
                    while (iterator > 0) {
                        this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                        iterator--;
                    }
                }

                if (typeof options.locale.applyLabel === 'string') {
                    this.locale.applyLabel = options.locale.applyLabel;
                }

                if (typeof options.locale.cancelLabel === 'string') {
                    this.locale.cancelLabel = options.locale.cancelLabel;
                }

                if (typeof options.locale.fromLabel === 'string') {
                    this.locale.fromLabel = options.locale.fromLabel;
                }

                if (typeof options.locale.toLabel === 'string') {
                    this.locale.toLabel = options.locale.toLabel;
                }

                if (typeof options.locale.weekLabel === 'string') {
                    this.locale.weekLabel = options.locale.weekLabel;
                }

                if (typeof options.locale.customRangeLabel === 'string') {
                    this.locale.customRangeLabel = options.locale.customRangeLabel;
                }
            }

            if (typeof options.opens === 'string')
                this.opens = options.opens;

            if (typeof options.showWeekNumbers === 'boolean') {
                this.showWeekNumbers = options.showWeekNumbers;
            }

            if (typeof options.buttonClasses === 'string') {
                this.buttonClasses = [options.buttonClasses];
            }

            if (typeof options.buttonClasses === 'object') {
                this.buttonClasses = options.buttonClasses;
            }

            if (typeof options.showDropdowns === 'boolean') {
                this.showDropdowns = options.showDropdowns;
            }

            if (typeof options.singleDatePicker === 'boolean') {
                this.singleDatePicker = options.singleDatePicker;
            }

            if (typeof options.timePicker === 'boolean') {
                this.timePicker = options.timePicker;
            }

            if (typeof options.timePickerIncrement === 'number') {
                this.timePickerIncrement = options.timePickerIncrement;
            }

            if (typeof options.timePicker12Hour === 'boolean') {
                this.timePicker12Hour = options.timePicker12Hour;
            }

            var start, end, range;

            //if no start/end dates set, check if an input element contains initial values
            if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
                if ($(this.element).is('input[type=text]')) {
                    var val = $(this.element).val();
                    var split = val.split(this.separator);
                    start = end = null;
                    if (split.length == 2) {
                        start = moment(split[0], this.format);
                        end = moment(split[1], this.format);
                    } else if (this.singleDatePicker) {
                        start = moment(val, this.format);
                        end = moment(val, this.format);
                    }
                    if (start !== null && end !== null) {
                        this.startDate = start;
                        this.endDate = end;
                    }
                }
            }

            if (typeof options.ranges === 'object') {
                for (range in options.ranges) {

                    start = moment(options.ranges[range][0]);
                    end = moment(options.ranges[range][1]);

                    // If we have a min/max date set, bound this range
                    // to it, but only if it would otherwise fall
                    // outside of the min/max.
                    if (this.minDate && start.isBefore(this.minDate))
                        start = moment(this.minDate);

                    if (this.maxDate && end.isAfter(this.maxDate))
                        end = moment(this.maxDate);

                    // If the end of the range is before the minimum (if min is set) OR
                    // the start of the range is after the max (also if set) don't display this
                    // range option.
                    if ((this.minDate && end.isBefore(this.minDate)) || (this.maxDate && start.isAfter(this.maxDate))) {
                        continue;
                    }

                    this.ranges[range] = [start, end];
                }

                var list = '<ul>';
                for (range in this.ranges) {
                    list += '<li>' + range + '</li>';
                }
                list += '<li>' + this.locale.customRangeLabel + '</li>';
                list += '</ul>';
                this.container.find('.ranges ul').remove();
                this.container.find('.ranges').prepend(list);
            }

            if (typeof callback === 'function') {
                this.cb = callback;
            }

            if (!this.timePicker) {
                this.startDate = this.startDate.startOf('day');
                this.endDate = this.endDate.startOf('day');
            }

            if (this.singleDatePicker) {
                this.opens = 'right';
                this.container.find('.calendar.right').show();
                this.container.find('.calendar.left').hide();
                this.container.find('.ranges').hide();
                if (!this.container.find('.calendar.right').hasClass('single'))
                    this.container.find('.calendar.right').addClass('single');
            } else {
                this.container.find('.calendar.right').removeClass('single');
                this.container.find('.ranges').show();
            }

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();
            this.oldChosenLabel = this.chosenLabel;

            this.leftCalendar = {
                month: moment([this.startDate.year(), this.startDate.month(), 1, this.startDate.hour(), this.startDate.minute()]),
                calendar: []
            };

            this.rightCalendar = {
                month: moment([this.endDate.year(), this.endDate.month(), 1, this.endDate.hour(), this.endDate.minute()]),
                calendar: []
            };

            if (this.opens == 'right') {
                //swap calendar positions
                var left = this.container.find('.calendar.left');
                var right = this.container.find('.calendar.right');
                left.removeClass('left').addClass('right');
                right.removeClass('right').addClass('left');
            }

            if (typeof options.ranges === 'undefined' && !this.singleDatePicker) {
                this.container.find('.calendar').show();
            }

            this.container.addClass('opens' + this.opens);

            this.updateView();
            this.updateCalendars();

        },

        setStartDate: function (startDate) {
            if (typeof startDate === 'string')
                this.startDate = moment(startDate, this.format);

            if (typeof startDate === 'object')
                this.startDate = moment(startDate);

            if (!this.timePicker)
                this.startDate = this.startDate.startOf('day');

            this.oldStartDate = this.startDate.clone();

            this.updateView();
            this.updateCalendars();
        },

        setEndDate: function (endDate) {
            if (typeof endDate === 'string')
                this.endDate = moment(endDate, this.format);

            if (typeof endDate === 'object')
                this.endDate = moment(endDate);

            if (!this.timePicker)
                this.endDate = this.endDate.startOf('day');

            this.oldEndDate = this.endDate.clone();

            this.updateView();
            this.updateCalendars();
        },

        mousedown: function (e) {
            e.stopPropagation();
        },

        updateView: function () {
            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());
            this.updateFormInputs();
        },

        updateFormInputs: function () {
            this.container.find('input[name=daterangepicker_start]').val(this.startDate.format(this.format));
            this.container.find('input[name=daterangepicker_end]').val(this.endDate.format(this.format));

            if (this.startDate.isSame(this.endDate) || this.startDate.isBefore(this.endDate)) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }
        },

        updateFromControl: function () {
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;

            var dateString = this.element.val().split(this.separator);
            var start = moment(dateString[0], this.format);
            var end = moment(dateString[1], this.format);

            if (this.singleDatePicker) {
                start = moment(this.element.val(), this.format);
                end = start;
            }

            if (end.isBefore(start)) return;

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            this.startDate = start;
            this.endDate = end;

            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.notify();

            this.updateCalendars();
        },

        notify: function () {
            this.updateView();
            this.cb(this.startDate, this.endDate, this.chosenLabel);
        },

        move: function () {
            var parentOffset = {
                top: 0,
                left: 0
            };
            if (!this.parentEl.is('body')) {
                parentOffset = {
                    top: this.parentEl.offset().top - this.parentEl.scrollTop(),
                    left: this.parentEl.offset().left - this.parentEl.scrollLeft()
                };
            }

            if (this.opens == 'left') {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    right: $(window).width() - this.element.offset().left - this.element.outerWidth() - parentOffset.left,
                    left: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    left: this.element.offset().left - parentOffset.left,
                    right: 'auto'
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
            }
        },

        show: function (e) {
            this.element.addClass('active');
            this.container.show();
            this.move();

            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }

            $(document).on('mousedown', $.proxy(this.hide, this));
            this.element.trigger('show.daterangepicker', this);
        },

        hide: function (e) {
            this.element.removeClass('active');
            this.container.hide();

            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.notify();

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            $(document).off('mousedown', this.hide);
            this.element.trigger('hide.daterangepicker', this);
        },

        enterRange: function (e) {
            // mouse pointer has entered a range label
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.updateView();
            } else {
                var dates = this.ranges[label];
                this.container.find('input[name=daterangepicker_start]').val(dates[0].format(this.format));
                this.container.find('input[name=daterangepicker_end]').val(dates[1].format(this.format));
            }
        },

        showCalendars: function () {
            this.container.find('.calendar').show();
            this.move();
        },

        updateInputText: function () {
            if (this.element.is('input') && !this.singleDatePicker) {
                this.element.val(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
            } else if (this.element.is('input')) {
                this.element.val(this.startDate.format(this.format));
            }

        },

        clickRange: function (e) {
            var label = e.target.innerHTML;
            this.chosenLabel = label;
            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];

                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.startOf('day');
                }

                this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
                this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
                this.updateCalendars();

                this.updateInputText();

                this.container.find('.calendar').hide();
                this.hide();
                this.element.trigger('apply.daterangepicker', this);
            }
        },

        clickPrev: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract('month', 1);
            } else {
                this.rightCalendar.month.subtract('month', 1);
            }
            this.updateCalendars();
        },

        clickNext: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add('month', 1);
            } else {
                this.rightCalendar.month.add('month', 1);
            }
            this.updateCalendars();
        },

        enterDate: function (e) {

            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                this.container.find('input[name=daterangepicker_start]').val(this.leftCalendar.calendar[row][col].format(this.format));
            } else {
                this.container.find('input[name=daterangepicker_end]').val(this.rightCalendar.calendar[row][col].format(this.format));
            }

        },

        clickDate: function (e) {
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            var startDate, endDate;
            if (cal.hasClass('left')) {
                startDate = this.leftCalendar.calendar[row][col];
                endDate = this.endDate;
                if (typeof this.dateLimit === 'object') {
                    var maxDate = moment(startDate).add(this.dateLimit).startOf('day');
                    if (endDate.isAfter(maxDate)) {
                        endDate = maxDate;
                    }
                }
            } else {
                startDate = this.startDate;
                endDate = this.rightCalendar.calendar[row][col];
                if (typeof this.dateLimit === 'object') {
                    var minDate = moment(endDate).subtract(this.dateLimit).startOf('day');
                    if (startDate.isBefore(minDate)) {
                        startDate = minDate;
                    }
                }
            }

            if (this.singleDatePicker && cal.hasClass('left')) {
                endDate = startDate;
            } else if (this.singleDatePicker && cal.hasClass('right')) {
                startDate = endDate;
            }

            cal.find('td').removeClass('active');

            if (startDate.isSame(endDate) || startDate.isBefore(endDate)) {
                $(e.target).addClass('active');
                this.startDate = startDate;
                this.endDate = endDate;
            } else if (startDate.isAfter(endDate)) {
                $(e.target).addClass('active');
                var difference = this.endDate.diff(this.startDate);
                this.startDate = startDate;
                this.endDate = moment(startDate).add('ms', difference);
            }

            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());
            this.updateCalendars();

            if (this.singleDatePicker)
                this.clickApply();
        },

        clickApply: function (e) {
            this.updateInputText();
            this.hide();
            this.element.trigger('apply.daterangepicker', this).trigger('input');
        },

        clickCancel: function (e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.chosenLabel = this.oldChosenLabel;
            this.updateView();
            this.updateCalendars();
            this.hide();
            this.element.trigger('cancel.daterangepicker', this);
        },

        updateMonthYear: function (e) {

            var isLeft = $(e.target).closest('.calendar').hasClass('left');
            var cal = this.container.find('.calendar.left');
            if (!isLeft)
                cal = this.container.find('.calendar.right');

            // Month must be Number for new moment versions
            var month = parseInt(cal.find('.monthselect').val(), 10);
            var year = cal.find('.yearselect').val();

            if (isLeft) {
                this.leftCalendar.month.month(month).year(year);
            } else {
                this.rightCalendar.month.month(month).year(year);
            }

            this.updateCalendars();

        },

        updateTime: function (e) {

            var isLeft = $(e.target).closest('.calendar').hasClass('left');
            var cal = this.container.find('.calendar.left');
            if (!isLeft)
                cal = this.container.find('.calendar.right');

            var hour = parseInt(cal.find('.hourselect').val());
            var minute = parseInt(cal.find('.minuteselect').val());

            if (this.timePicker12Hour) {
                var ampm = cal.find('.ampmselect').val();
                if (ampm == 'PM' && hour < 12)
                    hour += 12;
                if (ampm == 'AM' && hour == 12)
                    hour = 0;
            }

            if (isLeft) {
                var start = this.startDate.clone();
                start.hour(hour);
                start.minute(minute);
                this.startDate = start;
                this.leftCalendar.month.hour(hour).minute(minute);
            } else {
                var end = this.endDate.clone();
                end.hour(hour);
                end.minute(minute);
                this.endDate = end;
                this.rightCalendar.month.hour(hour).minute(minute);
            }

            this.updateCalendars();

        },

        updateCalendars: function () {
            this.leftCalendar.calendar = this.buildCalendar(this.leftCalendar.month.month(), this.leftCalendar.month.year(), this.leftCalendar.month.hour(), this.leftCalendar.month.minute(), 'left');
            this.rightCalendar.calendar = this.buildCalendar(this.rightCalendar.month.month(), this.rightCalendar.month.year(), this.rightCalendar.month.hour(), this.rightCalendar.month.minute(), 'right');
            this.container.find('.calendar.left').html(this.renderCalendar(this.leftCalendar.calendar, this.startDate, this.minDate, this.maxDate));
            this.container.find('.calendar.right').html(this.renderCalendar(this.rightCalendar.calendar, this.endDate, this.startDate, this.maxDate));

            this.container.find('.ranges li').removeClass('active');
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
                if (this.timePicker) {
                    if (this.startDate.isSame(this.ranges[range][0]) && this.endDate.isSame(this.ranges[range][1])) {
                        customRange = false;
                        this.container.find('.ranges li:eq(' + i + ')').addClass('active');
                    }
                } else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.container.find('.ranges li:eq(' + i + ')').addClass('active');
                    }
                }
                i++;
            }
            if (customRange)
                this.container.find('.ranges li:last').addClass('active');
        },

        buildCalendar: function (month, year, hour, minute, side) {

            var firstDay = moment([year, month, 1]);
            var lastMonth = moment(firstDay).subtract('month', 1).month();
            var lastYear = moment(firstDay).subtract('month', 1).year();

            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();

            var dayOfWeek = firstDay.day();

            var i;

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            for (i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = moment([lastYear, lastMonth, startDay, 12, minute]);
            var col, row;
            for (i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add('hour', 24)) {
                if (i > 0 && col % 7 === 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.clone().hour(hour);
                curDate.hour(12);
            }

            return calendar;

        },

        renderDropdowns: function (selected, minDate, maxDate) {
            var currentMonth = selected.month();
            var monthHtml = '<select class="monthselect">';
            var inMinYear = false;
            var inMaxYear = false;

            for (var m = 0; m < 12; m++) {
                if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                    monthHtml += "<option value='" + m + "'" +
                        (m === currentMonth ? " selected='selected'" : "") +
                        ">" + this.locale.monthNames[m] + "</option>";
                }
            }
            monthHtml += "</select>";

            var currentYear = selected.year();
            var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
            var minYear = (minDate && minDate.year()) || (currentYear - 50);
            var yearHtml = '<select class="yearselect">';

            for (var y = minYear; y <= maxYear; y++) {
                yearHtml += '<option value="' + y + '"' +
                    (y === currentYear ? ' selected="selected"' : '') +
                    '>' + y + '</option>';
            }

            yearHtml += '</select>';

            return monthHtml + yearHtml;
        },

        renderCalendar: function (calendar, selected, minDate, maxDate) {

            var html = '<div class="calendar-date">';
            html += '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers)
                html += '<th></th>';

            if (!minDate || minDate.isBefore(calendar[1][1])) {
                html += '<th class="prev available"><i class="fa fa-chevron-left"></i></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                dateHtml = this.renderDropdowns(calendar[1][1], minDate, maxDate);
            }

            html += '<th colspan="5" class="month">' + dateHtml + '</th>';
            if (!maxDate || maxDate.isAfter(calendar[1][1])) {
                html += '<th class="next available"><i class="fa fa-chevron-right"></i></th>';
            } else {
                html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';

            // add week number label
            if (this.showWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';

            $.each(this.locale.daysOfWeek, function (index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';

                for (var col = 0; col < 7; col++) {
                    var cname = 'available ';
                    cname += (calendar[row][col].month() == calendar[1][1].month()) ? '' : 'off';

                    if ((minDate && calendar[row][col].isBefore(minDate)) || (maxDate && calendar[row][col].isAfter(maxDate))) {
                        cname = ' off disabled ';
                    } else if (calendar[row][col].format('YYYY-MM-DD') == selected.format('YYYY-MM-DD')) {
                        cname += ' active ';
                        if (calendar[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD')) {
                            cname += ' start-date ';
                        }
                        if (calendar[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD')) {
                            cname += ' end-date ';
                        }
                    } else if (calendar[row][col] >= this.startDate && calendar[row][col] <= this.endDate) {
                        cname += ' in-range ';
                        if (calendar[row][col].isSame(this.startDate)) {
                            cname += ' start-date ';
                        }
                        if (calendar[row][col].isSame(this.endDate)) {
                            cname += ' end-date ';
                        }
                    }

                    var title = 'r' + row + 'c' + col;
                    html += '<td class="' + cname.replace(/\s+/g, ' ').replace(/^\s?(.*?)\s?$/, '$1') + '" data-title="' + title + '">' + calendar[row][col].date() + '</td>';
                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';
            html += '</div>';

            var i;
            if (this.timePicker) {

                html += '<div class="calendar-time">';
                html += '<select class="hourselect">';
                var start = 0;
                var end = 23;
                var selected_hour = selected.hour();
                if (this.timePicker12Hour) {
                    start = 1;
                    end = 12;
                    if (selected_hour >= 12)
                        selected_hour -= 12;
                    if (selected_hour === 0)
                        selected_hour = 12;
                }

                for (i = start; i <= end; i++) {
                    if (i == selected_hour) {
                        html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + i + '</option>';
                    }
                }

                html += '</select> : ';

                html += '<select class="minuteselect">';

                for (i = 0; i < 60; i += this.timePickerIncrement) {
                    var num = i;
                    if (num < 10)
                        num = '0' + num;
                    if (i == selected.minute()) {
                        html += '<option value="' + i + '" selected="selected">' + num + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + num + '</option>';
                    }
                }

                html += '</select> ';

                if (this.timePicker12Hour) {
                    html += '<select class="ampmselect">';
                    if (selected.hour() >= 12) {
                        html += '<option value="AM">AM</option><option value="PM" selected="selected">PM</option>';
                    } else {
                        html += '<option value="AM" selected="selected">AM</option><option value="PM">PM</option>';
                    }
                    html += '</select>';
                }

                html += '</div>';

            }

            return html;

        },

        remove: function () {

            this.container.remove();
            this.element.off('.daterangepicker');
            this.element.removeData('daterangepicker');

        }

    };

    $.fn.daterangepicker = function (options, cb) {
        this.each(function () {
            var el = $(this);
            if (el.data('daterangepicker'))
                el.data('daterangepicker').remove();
            el.data('daterangepicker', new DateRangePicker(el, options, cb));
        });
        return this;
    };

}(window.jQuery, window.moment);
///<jscompress sourcefile="bootstrap-datepicker.js" />
/* =========================================================
 * bootstrap-datepicker.js
 * http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Copyright 2012 Stefan Petre
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

!function ($) {

    // Picker object

    var Datepicker = function (element, options) {
        this.element = $(element);
        this.format = DPGlobal.parseFormat(options.format || this.element.data('date-format') || 'mm/dd/yyyy');
        this.picker = $(DPGlobal.template).appendTo('body').on({
            click: $.proxy(this.click, this) //,
            //mousedown: $.proxy(this.mousedown, this)
        });
        this.isInput = this.element.is('input');
        this.component = this.element.is('.date') ? this.element.find('.add-on') : false;

        if (this.isInput) {
            this.element.on({
                focus: $.proxy(this.show, this),
                //blur: $.proxy(this.hide, this),
                keyup: $.proxy(this.update, this)
            });
        } else {
            if (this.component) {
                this.component.on('click', $.proxy(this.show, this));
            } else {
                this.element.on('click', $.proxy(this.show, this));
            }
        }

        this.minViewMode = options.minViewMode || this.element.data('date-minviewmode') || 0;
        if (typeof this.minViewMode === 'string') {
            switch (this.minViewMode) {
                case 'months':
                    this.minViewMode = 1;
                    break;
                case 'years':
                    this.minViewMode = 2;
                    break;
                default:
                    this.minViewMode = 0;
                    break;
            }
        }
        this.viewMode = options.viewMode || this.element.data('date-viewmode') || 0;
        if (typeof this.viewMode === 'string') {
            switch (this.viewMode) {
                case 'months':
                    this.viewMode = 1;
                    break;
                case 'years':
                    this.viewMode = 2;
                    break;
                default:
                    this.viewMode = 0;
                    break;
            }
        }
        this.startViewMode = this.viewMode;
        this.weekStart = options.weekStart || this.element.data('date-weekstart') || 0;
        this.weekEnd = this.weekStart === 0 ? 6 : this.weekStart - 1;
        this.onRender = options.onRender;
        this.fillDow();
        this.fillMonths();
        this.update();
        this.showMode();
    };

    Datepicker.prototype = {
        constructor: Datepicker,

        show: function (e) {
            this.picker.show();
            this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
            this.place();
            $(window).on('resize', $.proxy(this.place, this));
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            if (!this.isInput) {
            }
            var that = this;
            $(document).on('mousedown', function (ev) {
                if ($(ev.target).closest('.datepicker').length == 0) {
                    that.hide();
                }
            });
            this.element.trigger({
                type: 'show',
                date: this.date
            });
        },

        hide: function () {
            this.picker.hide();
            $(window).off('resize', this.place);
            this.viewMode = this.startViewMode;
            this.showMode();
            if (!this.isInput) {
                $(document).off('mousedown', this.hide);
            }
            //this.set();
            this.element.trigger({
                type: 'hide',
                date: this.date
            });
        },

        set: function () {
            var formated = DPGlobal.formatDate(this.date, this.format);
            if (!this.isInput) {
                if (this.component) {
                    this.element.find('input').prop('value', formated);
                }
                this.element.data('date', formated);
            } else {
                this.element.prop('value', formated);
            }
        },

        setValue: function (newDate) {
            if (typeof newDate === 'string') {
                this.date = DPGlobal.parseDate(newDate, this.format);
            } else {
                this.date = new Date(newDate);
            }
            this.set();
            this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
            this.fill();
        },

        place: function () {
            var offset = this.component ? this.component.offset() : this.element.offset();
            this.picker.css({
                top: offset.top + this.height,
                left: offset.left
            });
        },

        update: function (newDate) {
            this.date = DPGlobal.parseDate(
                typeof newDate === 'string' ? newDate : (this.isInput ? this.element.prop('value') : this.element.data('date')),
                this.format
            );
            this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
            this.fill();
        },

        fillDow: function () {
            var dowCnt = this.weekStart;
            var html = '<tr>';
            while (dowCnt < this.weekStart + 7) {
                html += '<th class="dow">' + DPGlobal.dates.daysMin[(dowCnt++) % 7] + '</th>';
            }
            html += '</tr>';
            this.picker.find('.datepicker-days thead').append(html);
        },

        fillMonths: function () {
            var html = '';
            var i = 0
            while (i < 12) {
                html += '<span class="month">' + DPGlobal.dates.monthsShort[i++] + '</span>';
            }
            this.picker.find('.datepicker-months td').append(html);
        },

        fill: function () {
            var d = new Date(this.viewDate),
                year = d.getFullYear(),
                month = d.getMonth(),
                currentDate = this.date.valueOf();
            this.picker.find('.datepicker-days th:eq(1)')
                .text(DPGlobal.dates.months[month] + ' ' + year);
            var prevMonth = new Date(year, month - 1, 28, 0, 0, 0, 0),
                day = DPGlobal.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
            prevMonth.setDate(day);
            prevMonth.setDate(day - (prevMonth.getDay() - this.weekStart + 7) % 7);
            var nextMonth = new Date(prevMonth);
            nextMonth.setDate(nextMonth.getDate() + 42);
            nextMonth = nextMonth.valueOf();
            var html = [];
            var clsName,
                prevY,
                prevM;
            while (prevMonth.valueOf() < nextMonth) {
                if (prevMonth.getDay() === this.weekStart) {
                    html.push('<tr>');
                }
                clsName = this.onRender(prevMonth);
                prevY = prevMonth.getFullYear();
                prevM = prevMonth.getMonth();
                if ((prevM < month && prevY === year) || prevY < year) {
                    clsName += ' old';
                } else if ((prevM > month && prevY === year) || prevY > year) {
                    clsName += ' new';
                }
                if (prevMonth.valueOf() === currentDate) {
                    clsName += ' active';
                }
                html.push('<td class="day ' + clsName + '">' + prevMonth.getDate() + '</td>');
                if (prevMonth.getDay() === this.weekEnd) {
                    html.push('</tr>');
                }
                prevMonth.setDate(prevMonth.getDate() + 1);
            }
            this.picker.find('.datepicker-days tbody').empty().append(html.join(''));
            var currentYear = this.date.getFullYear();

            var months = this.picker.find('.datepicker-months')
                .find('th:eq(1)')
                .text(year)
                .end()
                .find('span').removeClass('active');
            if (currentYear === year) {
                months.eq(this.date.getMonth()).addClass('active');
            }

            html = '';
            year = parseInt(year / 10, 10) * 10;
            var yearCont = this.picker.find('.datepicker-years')
                .find('th:eq(1)')
                .text(year + '-' + (year + 9))
                .end()
                .find('td');
            year -= 1;
            for (var i = -1; i < 11; i++) {
                html += '<span class="year' + (i === -1 || i === 10 ? ' old' : '') + (currentYear === year ? ' active' : '') + '">' + year + '</span>';
                year += 1;
            }
            yearCont.html(html);
        },

        click: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var target = $(e.target).closest('span, td, th');
            if (target.length === 1) {
                switch (target[0].nodeName.toLowerCase()) {
                    case 'th':
                        switch (target[0].className) {
                            case 'switch':
                                this.showMode(1);
                                break;
                            case 'prev':
                            case 'next':
                                this.viewDate['set' + DPGlobal.modes[this.viewMode].navFnc].call(
                                    this.viewDate,
                                    this.viewDate['get' + DPGlobal.modes[this.viewMode].navFnc].call(this.viewDate) +
                                    DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1)
                                );
                                this.fill();
                                this.set();
                                break;
                        }
                        break;
                    case 'span':
                        if (target.is('.month')) {
                            var month = target.parent().find('span').index(target);
                            this.viewDate.setMonth(month);
                        } else {
                            var year = parseInt(target.text(), 10) || 0;
                            this.viewDate.setFullYear(year);
                        }
                        if (this.viewMode !== 0) {
                            this.date = new Date(this.viewDate);
                            this.element.trigger({
                                type: 'changeDate',
                                date: this.date,
                                viewMode: DPGlobal.modes[this.viewMode].clsName
                            });
                        }
                        this.showMode(-1);
                        this.fill();
                        this.set();
                        break;
                    case 'td':
                        if (target.is('.day') && !target.is('.disabled')) {
                            var day = parseInt(target.text(), 10) || 1;
                            var month = this.viewDate.getMonth();
                            if (target.is('.old')) {
                                month -= 1;
                            } else if (target.is('.new')) {
                                month += 1;
                            }
                            var year = this.viewDate.getFullYear();
                            this.date = new Date(year, month, day, 0, 0, 0, 0);
                            this.viewDate = new Date(year, month, Math.min(28, day), 0, 0, 0, 0);
                            this.fill();
                            this.set();
                            this.element.trigger({
                                type: 'changeDate',
                                date: this.date,
                                viewMode: DPGlobal.modes[this.viewMode].clsName
                            });
                        }
                        break;
                }
            }
            this.element.trigger('input');
        },

        mousedown: function (e) {
            e.stopPropagation();
            e.preventDefault();
        },

        showMode: function (dir) {
            if (dir) {
                this.viewMode = Math.max(this.minViewMode, Math.min(2, this.viewMode + dir));
            }
            this.picker.find('>div').hide().filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName).show();
        }
    };

    $.fn.datepicker = function (option, val) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('datepicker'),
                options = typeof option === 'object' && option;
            if (!data) {
                $this.data('datepicker', (data = new Datepicker(this, $.extend({}, $.fn.datepicker.defaults, options))));
            }
            if (typeof option === 'string') data[option](val);
        });
    };

    $.fn.datepicker.defaults = {
        onRender: function (date) {
            return '';
        }
    };
    $.fn.datepicker.Constructor = Datepicker;

    var DPGlobal = {
        modes: [{
            clsName: 'days',
            navFnc: 'Month',
            navStep: 1
        }, {
            clsName: 'months',
            navFnc: 'FullYear',
            navStep: 1
        }, {
            clsName: 'years',
            navFnc: 'FullYear',
            navStep: 10
        }],
        dates: {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
            months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
        },
        isLeapYear: function (year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
        },
        getDaysInMonth: function (year, month) {
            return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
        },
        parseFormat: function (format) {
            var separator = format.match(/[.\/\-\s].*?/),
                parts = format.split(/\W+/);
            if (!separator || !parts || parts.length === 0) {
                throw new Error("Invalid date format.");
            }
            return {
                separator: separator,
                parts: parts
            };
        },
        parseDate: function (date, format) {
            var parts = date.split(format.separator),
                date = new Date(),
                val;
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            if (parts.length === format.parts.length) {
                var year = date.getFullYear(),
                    day = date.getDate(),
                    month = date.getMonth();
                for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                    val = parseInt(parts[i], 10) || 1;
                    switch (format.parts[i]) {
                        case 'dd':
                        case 'd':
                            day = val;
                            date.setDate(val);
                            break;
                        case 'mm':
                        case 'm':
                            month = val - 1;
                            date.setMonth(val - 1);
                            break;
                        case 'yy':
                            year = 2000 + val;
                            date.setFullYear(2000 + val);
                            break;
                        case 'yyyy':
                            year = val;
                            date.setFullYear(val);
                            break;
                    }
                }
                date = new Date(year, month, day, 0, 0, 0);
            }
            return date;
        },
        formatDate: function (date, format) {
            var val = {
                d: date.getDate(),
                m: date.getMonth() + 1,
                yy: date.getFullYear().toString().substring(2),
                yyyy: date.getFullYear()
            };
            val.dd = (val.d < 10 ? '0' : '') + val.d;
            val.mm = (val.m < 10 ? '0' : '') + val.m;
            var date = [];
            for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                date.push(val[format.parts[i]]);
            }
            return date.join(format.separator);
        },
        headTemplate: '<thead>' + '<tr>' + '<th class="prev"><i class="fa fa-chevron-left"></i></th>' + '<th colspan="5" class="switch"></th>' + '<th class="next"><i class="fa fa-chevron-right"></i></th>' + '</tr>' + '</thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'
    };
    DPGlobal.template = '<div class="datepicker dropdown-menu">' +
        '<div class="datepicker-days">' +
        '<table class=" table-condensed">' +
        DPGlobal.headTemplate +
        '<tbody></tbody>' +
        '</table>' +
        '</div>' +
        '<div class="datepicker-months">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        '</table>' +
        '</div>' +
        '<div class="datepicker-years">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        '</table>' +
        '</div>' +
        '</div>';

}(window.jQuery);
///<jscompress sourcefile="select2.js" />
/*
 Copyright 2012 Igor Vaynberg

 Version: 3.5.4 Timestamp: Sun Aug 30 13:30:32 EDT 2015

 This software is licensed under the Apache License, Version 2.0 (the "Apache License") or the GNU
 General Public License version 2 (the "GPL License"). You may choose either license to govern your
 use of this software only upon the condition that you accept all of the terms of either the Apache
 License or the GPL License.

 You may obtain a copy of the Apache License and the GPL License at:

 http://www.apache.org/licenses/LICENSE-2.0
 http://www.gnu.org/licenses/gpl-2.0.html

 Unless required by applicable law or agreed to in writing, software distributed under the
 Apache License or the GPL License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 CONDITIONS OF ANY KIND, either express or implied. See the Apache License and the GPL License for
 the specific language governing permissions and limitations under the Apache License and the GPL License.
 */
(function ($) {
    if (typeof $.fn.each2 == "undefined") {
        $.extend($.fn, {
            /*
             * 4-10 times faster .each replacement
             * use it carefully, as it overrides jQuery context of element on each iteration
             */
            each2: function (c) {
                var j = $([0]), i = -1, l = this.length;
                while (
                ++i < l
                && (j.context = j[0] = this[i])
                && c.call(j[0], i, j) !== false //"this"=DOM, i=index, j=jQuery object
                    );
                return this;
            }
        });
    }
})(jQuery);

(function ($, undefined) {
    "use strict";
    /*global document, window, jQuery, console */

    if (window.Select2 !== undefined) {
        return;
    }

    var AbstractSelect2, SingleSelect2, MultiSelect2, nextUid, sizer,
        lastMousePosition = {x: 0, y: 0}, $document, scrollBarDimensions,

        KEY = {
            TAB: 9,
            ENTER: 13,
            ESC: 27,
            SPACE: 32,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            SHIFT: 16,
            CTRL: 17,
            ALT: 18,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            HOME: 36,
            END: 35,
            BACKSPACE: 8,
            DELETE: 46,
            isArrow: function (k) {
                k = k.which ? k.which : k;
                switch (k) {
                    case KEY.LEFT:
                    case KEY.RIGHT:
                    case KEY.UP:
                    case KEY.DOWN:
                        return true;
                }
                return false;
            },
            isControl: function (e) {
                var k = e.which;
                switch (k) {
                    case KEY.SHIFT:
                    case KEY.CTRL:
                    case KEY.ALT:
                        return true;
                }

                if (e.metaKey) return true;

                return false;
            },
            isFunctionKey: function (k) {
                k = k.which ? k.which : k;
                return k >= 112 && k <= 123;
            }
        },
        MEASURE_SCROLLBAR_TEMPLATE = "<div class='select2-measure-scrollbar'></div>",

        DIACRITICS = {
            "\u24B6": "A",
            "\uFF21": "A",
            "\u00C0": "A",
            "\u00C1": "A",
            "\u00C2": "A",
            "\u1EA6": "A",
            "\u1EA4": "A",
            "\u1EAA": "A",
            "\u1EA8": "A",
            "\u00C3": "A",
            "\u0100": "A",
            "\u0102": "A",
            "\u1EB0": "A",
            "\u1EAE": "A",
            "\u1EB4": "A",
            "\u1EB2": "A",
            "\u0226": "A",
            "\u01E0": "A",
            "\u00C4": "A",
            "\u01DE": "A",
            "\u1EA2": "A",
            "\u00C5": "A",
            "\u01FA": "A",
            "\u01CD": "A",
            "\u0200": "A",
            "\u0202": "A",
            "\u1EA0": "A",
            "\u1EAC": "A",
            "\u1EB6": "A",
            "\u1E00": "A",
            "\u0104": "A",
            "\u023A": "A",
            "\u2C6F": "A",
            "\uA732": "AA",
            "\u00C6": "AE",
            "\u01FC": "AE",
            "\u01E2": "AE",
            "\uA734": "AO",
            "\uA736": "AU",
            "\uA738": "AV",
            "\uA73A": "AV",
            "\uA73C": "AY",
            "\u24B7": "B",
            "\uFF22": "B",
            "\u1E02": "B",
            "\u1E04": "B",
            "\u1E06": "B",
            "\u0243": "B",
            "\u0182": "B",
            "\u0181": "B",
            "\u24B8": "C",
            "\uFF23": "C",
            "\u0106": "C",
            "\u0108": "C",
            "\u010A": "C",
            "\u010C": "C",
            "\u00C7": "C",
            "\u1E08": "C",
            "\u0187": "C",
            "\u023B": "C",
            "\uA73E": "C",
            "\u24B9": "D",
            "\uFF24": "D",
            "\u1E0A": "D",
            "\u010E": "D",
            "\u1E0C": "D",
            "\u1E10": "D",
            "\u1E12": "D",
            "\u1E0E": "D",
            "\u0110": "D",
            "\u018B": "D",
            "\u018A": "D",
            "\u0189": "D",
            "\uA779": "D",
            "\u01F1": "DZ",
            "\u01C4": "DZ",
            "\u01F2": "Dz",
            "\u01C5": "Dz",
            "\u24BA": "E",
            "\uFF25": "E",
            "\u00C8": "E",
            "\u00C9": "E",
            "\u00CA": "E",
            "\u1EC0": "E",
            "\u1EBE": "E",
            "\u1EC4": "E",
            "\u1EC2": "E",
            "\u1EBC": "E",
            "\u0112": "E",
            "\u1E14": "E",
            "\u1E16": "E",
            "\u0114": "E",
            "\u0116": "E",
            "\u00CB": "E",
            "\u1EBA": "E",
            "\u011A": "E",
            "\u0204": "E",
            "\u0206": "E",
            "\u1EB8": "E",
            "\u1EC6": "E",
            "\u0228": "E",
            "\u1E1C": "E",
            "\u0118": "E",
            "\u1E18": "E",
            "\u1E1A": "E",
            "\u0190": "E",
            "\u018E": "E",
            "\u24BB": "F",
            "\uFF26": "F",
            "\u1E1E": "F",
            "\u0191": "F",
            "\uA77B": "F",
            "\u24BC": "G",
            "\uFF27": "G",
            "\u01F4": "G",
            "\u011C": "G",
            "\u1E20": "G",
            "\u011E": "G",
            "\u0120": "G",
            "\u01E6": "G",
            "\u0122": "G",
            "\u01E4": "G",
            "\u0193": "G",
            "\uA7A0": "G",
            "\uA77D": "G",
            "\uA77E": "G",
            "\u24BD": "H",
            "\uFF28": "H",
            "\u0124": "H",
            "\u1E22": "H",
            "\u1E26": "H",
            "\u021E": "H",
            "\u1E24": "H",
            "\u1E28": "H",
            "\u1E2A": "H",
            "\u0126": "H",
            "\u2C67": "H",
            "\u2C75": "H",
            "\uA78D": "H",
            "\u24BE": "I",
            "\uFF29": "I",
            "\u00CC": "I",
            "\u00CD": "I",
            "\u00CE": "I",
            "\u0128": "I",
            "\u012A": "I",
            "\u012C": "I",
            "\u0130": "I",
            "\u00CF": "I",
            "\u1E2E": "I",
            "\u1EC8": "I",
            "\u01CF": "I",
            "\u0208": "I",
            "\u020A": "I",
            "\u1ECA": "I",
            "\u012E": "I",
            "\u1E2C": "I",
            "\u0197": "I",
            "\u24BF": "J",
            "\uFF2A": "J",
            "\u0134": "J",
            "\u0248": "J",
            "\u24C0": "K",
            "\uFF2B": "K",
            "\u1E30": "K",
            "\u01E8": "K",
            "\u1E32": "K",
            "\u0136": "K",
            "\u1E34": "K",
            "\u0198": "K",
            "\u2C69": "K",
            "\uA740": "K",
            "\uA742": "K",
            "\uA744": "K",
            "\uA7A2": "K",
            "\u24C1": "L",
            "\uFF2C": "L",
            "\u013F": "L",
            "\u0139": "L",
            "\u013D": "L",
            "\u1E36": "L",
            "\u1E38": "L",
            "\u013B": "L",
            "\u1E3C": "L",
            "\u1E3A": "L",
            "\u0141": "L",
            "\u023D": "L",
            "\u2C62": "L",
            "\u2C60": "L",
            "\uA748": "L",
            "\uA746": "L",
            "\uA780": "L",
            "\u01C7": "LJ",
            "\u01C8": "Lj",
            "\u24C2": "M",
            "\uFF2D": "M",
            "\u1E3E": "M",
            "\u1E40": "M",
            "\u1E42": "M",
            "\u2C6E": "M",
            "\u019C": "M",
            "\u24C3": "N",
            "\uFF2E": "N",
            "\u01F8": "N",
            "\u0143": "N",
            "\u00D1": "N",
            "\u1E44": "N",
            "\u0147": "N",
            "\u1E46": "N",
            "\u0145": "N",
            "\u1E4A": "N",
            "\u1E48": "N",
            "\u0220": "N",
            "\u019D": "N",
            "\uA790": "N",
            "\uA7A4": "N",
            "\u01CA": "NJ",
            "\u01CB": "Nj",
            "\u24C4": "O",
            "\uFF2F": "O",
            "\u00D2": "O",
            "\u00D3": "O",
            "\u00D4": "O",
            "\u1ED2": "O",
            "\u1ED0": "O",
            "\u1ED6": "O",
            "\u1ED4": "O",
            "\u00D5": "O",
            "\u1E4C": "O",
            "\u022C": "O",
            "\u1E4E": "O",
            "\u014C": "O",
            "\u1E50": "O",
            "\u1E52": "O",
            "\u014E": "O",
            "\u022E": "O",
            "\u0230": "O",
            "\u00D6": "O",
            "\u022A": "O",
            "\u1ECE": "O",
            "\u0150": "O",
            "\u01D1": "O",
            "\u020C": "O",
            "\u020E": "O",
            "\u01A0": "O",
            "\u1EDC": "O",
            "\u1EDA": "O",
            "\u1EE0": "O",
            "\u1EDE": "O",
            "\u1EE2": "O",
            "\u1ECC": "O",
            "\u1ED8": "O",
            "\u01EA": "O",
            "\u01EC": "O",
            "\u00D8": "O",
            "\u01FE": "O",
            "\u0186": "O",
            "\u019F": "O",
            "\uA74A": "O",
            "\uA74C": "O",
            "\u01A2": "OI",
            "\uA74E": "OO",
            "\u0222": "OU",
            "\u24C5": "P",
            "\uFF30": "P",
            "\u1E54": "P",
            "\u1E56": "P",
            "\u01A4": "P",
            "\u2C63": "P",
            "\uA750": "P",
            "\uA752": "P",
            "\uA754": "P",
            "\u24C6": "Q",
            "\uFF31": "Q",
            "\uA756": "Q",
            "\uA758": "Q",
            "\u024A": "Q",
            "\u24C7": "R",
            "\uFF32": "R",
            "\u0154": "R",
            "\u1E58": "R",
            "\u0158": "R",
            "\u0210": "R",
            "\u0212": "R",
            "\u1E5A": "R",
            "\u1E5C": "R",
            "\u0156": "R",
            "\u1E5E": "R",
            "\u024C": "R",
            "\u2C64": "R",
            "\uA75A": "R",
            "\uA7A6": "R",
            "\uA782": "R",
            "\u24C8": "S",
            "\uFF33": "S",
            "\u1E9E": "S",
            "\u015A": "S",
            "\u1E64": "S",
            "\u015C": "S",
            "\u1E60": "S",
            "\u0160": "S",
            "\u1E66": "S",
            "\u1E62": "S",
            "\u1E68": "S",
            "\u0218": "S",
            "\u015E": "S",
            "\u2C7E": "S",
            "\uA7A8": "S",
            "\uA784": "S",
            "\u24C9": "T",
            "\uFF34": "T",
            "\u1E6A": "T",
            "\u0164": "T",
            "\u1E6C": "T",
            "\u021A": "T",
            "\u0162": "T",
            "\u1E70": "T",
            "\u1E6E": "T",
            "\u0166": "T",
            "\u01AC": "T",
            "\u01AE": "T",
            "\u023E": "T",
            "\uA786": "T",
            "\uA728": "TZ",
            "\u24CA": "U",
            "\uFF35": "U",
            "\u00D9": "U",
            "\u00DA": "U",
            "\u00DB": "U",
            "\u0168": "U",
            "\u1E78": "U",
            "\u016A": "U",
            "\u1E7A": "U",
            "\u016C": "U",
            "\u00DC": "U",
            "\u01DB": "U",
            "\u01D7": "U",
            "\u01D5": "U",
            "\u01D9": "U",
            "\u1EE6": "U",
            "\u016E": "U",
            "\u0170": "U",
            "\u01D3": "U",
            "\u0214": "U",
            "\u0216": "U",
            "\u01AF": "U",
            "\u1EEA": "U",
            "\u1EE8": "U",
            "\u1EEE": "U",
            "\u1EEC": "U",
            "\u1EF0": "U",
            "\u1EE4": "U",
            "\u1E72": "U",
            "\u0172": "U",
            "\u1E76": "U",
            "\u1E74": "U",
            "\u0244": "U",
            "\u24CB": "V",
            "\uFF36": "V",
            "\u1E7C": "V",
            "\u1E7E": "V",
            "\u01B2": "V",
            "\uA75E": "V",
            "\u0245": "V",
            "\uA760": "VY",
            "\u24CC": "W",
            "\uFF37": "W",
            "\u1E80": "W",
            "\u1E82": "W",
            "\u0174": "W",
            "\u1E86": "W",
            "\u1E84": "W",
            "\u1E88": "W",
            "\u2C72": "W",
            "\u24CD": "X",
            "\uFF38": "X",
            "\u1E8A": "X",
            "\u1E8C": "X",
            "\u24CE": "Y",
            "\uFF39": "Y",
            "\u1EF2": "Y",
            "\u00DD": "Y",
            "\u0176": "Y",
            "\u1EF8": "Y",
            "\u0232": "Y",
            "\u1E8E": "Y",
            "\u0178": "Y",
            "\u1EF6": "Y",
            "\u1EF4": "Y",
            "\u01B3": "Y",
            "\u024E": "Y",
            "\u1EFE": "Y",
            "\u24CF": "Z",
            "\uFF3A": "Z",
            "\u0179": "Z",
            "\u1E90": "Z",
            "\u017B": "Z",
            "\u017D": "Z",
            "\u1E92": "Z",
            "\u1E94": "Z",
            "\u01B5": "Z",
            "\u0224": "Z",
            "\u2C7F": "Z",
            "\u2C6B": "Z",
            "\uA762": "Z",
            "\u24D0": "a",
            "\uFF41": "a",
            "\u1E9A": "a",
            "\u00E0": "a",
            "\u00E1": "a",
            "\u00E2": "a",
            "\u1EA7": "a",
            "\u1EA5": "a",
            "\u1EAB": "a",
            "\u1EA9": "a",
            "\u00E3": "a",
            "\u0101": "a",
            "\u0103": "a",
            "\u1EB1": "a",
            "\u1EAF": "a",
            "\u1EB5": "a",
            "\u1EB3": "a",
            "\u0227": "a",
            "\u01E1": "a",
            "\u00E4": "a",
            "\u01DF": "a",
            "\u1EA3": "a",
            "\u00E5": "a",
            "\u01FB": "a",
            "\u01CE": "a",
            "\u0201": "a",
            "\u0203": "a",
            "\u1EA1": "a",
            "\u1EAD": "a",
            "\u1EB7": "a",
            "\u1E01": "a",
            "\u0105": "a",
            "\u2C65": "a",
            "\u0250": "a",
            "\uA733": "aa",
            "\u00E6": "ae",
            "\u01FD": "ae",
            "\u01E3": "ae",
            "\uA735": "ao",
            "\uA737": "au",
            "\uA739": "av",
            "\uA73B": "av",
            "\uA73D": "ay",
            "\u24D1": "b",
            "\uFF42": "b",
            "\u1E03": "b",
            "\u1E05": "b",
            "\u1E07": "b",
            "\u0180": "b",
            "\u0183": "b",
            "\u0253": "b",
            "\u24D2": "c",
            "\uFF43": "c",
            "\u0107": "c",
            "\u0109": "c",
            "\u010B": "c",
            "\u010D": "c",
            "\u00E7": "c",
            "\u1E09": "c",
            "\u0188": "c",
            "\u023C": "c",
            "\uA73F": "c",
            "\u2184": "c",
            "\u24D3": "d",
            "\uFF44": "d",
            "\u1E0B": "d",
            "\u010F": "d",
            "\u1E0D": "d",
            "\u1E11": "d",
            "\u1E13": "d",
            "\u1E0F": "d",
            "\u0111": "d",
            "\u018C": "d",
            "\u0256": "d",
            "\u0257": "d",
            "\uA77A": "d",
            "\u01F3": "dz",
            "\u01C6": "dz",
            "\u24D4": "e",
            "\uFF45": "e",
            "\u00E8": "e",
            "\u00E9": "e",
            "\u00EA": "e",
            "\u1EC1": "e",
            "\u1EBF": "e",
            "\u1EC5": "e",
            "\u1EC3": "e",
            "\u1EBD": "e",
            "\u0113": "e",
            "\u1E15": "e",
            "\u1E17": "e",
            "\u0115": "e",
            "\u0117": "e",
            "\u00EB": "e",
            "\u1EBB": "e",
            "\u011B": "e",
            "\u0205": "e",
            "\u0207": "e",
            "\u1EB9": "e",
            "\u1EC7": "e",
            "\u0229": "e",
            "\u1E1D": "e",
            "\u0119": "e",
            "\u1E19": "e",
            "\u1E1B": "e",
            "\u0247": "e",
            "\u025B": "e",
            "\u01DD": "e",
            "\u24D5": "f",
            "\uFF46": "f",
            "\u1E1F": "f",
            "\u0192": "f",
            "\uA77C": "f",
            "\u24D6": "g",
            "\uFF47": "g",
            "\u01F5": "g",
            "\u011D": "g",
            "\u1E21": "g",
            "\u011F": "g",
            "\u0121": "g",
            "\u01E7": "g",
            "\u0123": "g",
            "\u01E5": "g",
            "\u0260": "g",
            "\uA7A1": "g",
            "\u1D79": "g",
            "\uA77F": "g",
            "\u24D7": "h",
            "\uFF48": "h",
            "\u0125": "h",
            "\u1E23": "h",
            "\u1E27": "h",
            "\u021F": "h",
            "\u1E25": "h",
            "\u1E29": "h",
            "\u1E2B": "h",
            "\u1E96": "h",
            "\u0127": "h",
            "\u2C68": "h",
            "\u2C76": "h",
            "\u0265": "h",
            "\u0195": "hv",
            "\u24D8": "i",
            "\uFF49": "i",
            "\u00EC": "i",
            "\u00ED": "i",
            "\u00EE": "i",
            "\u0129": "i",
            "\u012B": "i",
            "\u012D": "i",
            "\u00EF": "i",
            "\u1E2F": "i",
            "\u1EC9": "i",
            "\u01D0": "i",
            "\u0209": "i",
            "\u020B": "i",
            "\u1ECB": "i",
            "\u012F": "i",
            "\u1E2D": "i",
            "\u0268": "i",
            "\u0131": "i",
            "\u24D9": "j",
            "\uFF4A": "j",
            "\u0135": "j",
            "\u01F0": "j",
            "\u0249": "j",
            "\u24DA": "k",
            "\uFF4B": "k",
            "\u1E31": "k",
            "\u01E9": "k",
            "\u1E33": "k",
            "\u0137": "k",
            "\u1E35": "k",
            "\u0199": "k",
            "\u2C6A": "k",
            "\uA741": "k",
            "\uA743": "k",
            "\uA745": "k",
            "\uA7A3": "k",
            "\u24DB": "l",
            "\uFF4C": "l",
            "\u0140": "l",
            "\u013A": "l",
            "\u013E": "l",
            "\u1E37": "l",
            "\u1E39": "l",
            "\u013C": "l",
            "\u1E3D": "l",
            "\u1E3B": "l",
            "\u017F": "l",
            "\u0142": "l",
            "\u019A": "l",
            "\u026B": "l",
            "\u2C61": "l",
            "\uA749": "l",
            "\uA781": "l",
            "\uA747": "l",
            "\u01C9": "lj",
            "\u24DC": "m",
            "\uFF4D": "m",
            "\u1E3F": "m",
            "\u1E41": "m",
            "\u1E43": "m",
            "\u0271": "m",
            "\u026F": "m",
            "\u24DD": "n",
            "\uFF4E": "n",
            "\u01F9": "n",
            "\u0144": "n",
            "\u00F1": "n",
            "\u1E45": "n",
            "\u0148": "n",
            "\u1E47": "n",
            "\u0146": "n",
            "\u1E4B": "n",
            "\u1E49": "n",
            "\u019E": "n",
            "\u0272": "n",
            "\u0149": "n",
            "\uA791": "n",
            "\uA7A5": "n",
            "\u01CC": "nj",
            "\u24DE": "o",
            "\uFF4F": "o",
            "\u00F2": "o",
            "\u00F3": "o",
            "\u00F4": "o",
            "\u1ED3": "o",
            "\u1ED1": "o",
            "\u1ED7": "o",
            "\u1ED5": "o",
            "\u00F5": "o",
            "\u1E4D": "o",
            "\u022D": "o",
            "\u1E4F": "o",
            "\u014D": "o",
            "\u1E51": "o",
            "\u1E53": "o",
            "\u014F": "o",
            "\u022F": "o",
            "\u0231": "o",
            "\u00F6": "o",
            "\u022B": "o",
            "\u1ECF": "o",
            "\u0151": "o",
            "\u01D2": "o",
            "\u020D": "o",
            "\u020F": "o",
            "\u01A1": "o",
            "\u1EDD": "o",
            "\u1EDB": "o",
            "\u1EE1": "o",
            "\u1EDF": "o",
            "\u1EE3": "o",
            "\u1ECD": "o",
            "\u1ED9": "o",
            "\u01EB": "o",
            "\u01ED": "o",
            "\u00F8": "o",
            "\u01FF": "o",
            "\u0254": "o",
            "\uA74B": "o",
            "\uA74D": "o",
            "\u0275": "o",
            "\u01A3": "oi",
            "\u0223": "ou",
            "\uA74F": "oo",
            "\u24DF": "p",
            "\uFF50": "p",
            "\u1E55": "p",
            "\u1E57": "p",
            "\u01A5": "p",
            "\u1D7D": "p",
            "\uA751": "p",
            "\uA753": "p",
            "\uA755": "p",
            "\u24E0": "q",
            "\uFF51": "q",
            "\u024B": "q",
            "\uA757": "q",
            "\uA759": "q",
            "\u24E1": "r",
            "\uFF52": "r",
            "\u0155": "r",
            "\u1E59": "r",
            "\u0159": "r",
            "\u0211": "r",
            "\u0213": "r",
            "\u1E5B": "r",
            "\u1E5D": "r",
            "\u0157": "r",
            "\u1E5F": "r",
            "\u024D": "r",
            "\u027D": "r",
            "\uA75B": "r",
            "\uA7A7": "r",
            "\uA783": "r",
            "\u24E2": "s",
            "\uFF53": "s",
            "\u00DF": "s",
            "\u015B": "s",
            "\u1E65": "s",
            "\u015D": "s",
            "\u1E61": "s",
            "\u0161": "s",
            "\u1E67": "s",
            "\u1E63": "s",
            "\u1E69": "s",
            "\u0219": "s",
            "\u015F": "s",
            "\u023F": "s",
            "\uA7A9": "s",
            "\uA785": "s",
            "\u1E9B": "s",
            "\u24E3": "t",
            "\uFF54": "t",
            "\u1E6B": "t",
            "\u1E97": "t",
            "\u0165": "t",
            "\u1E6D": "t",
            "\u021B": "t",
            "\u0163": "t",
            "\u1E71": "t",
            "\u1E6F": "t",
            "\u0167": "t",
            "\u01AD": "t",
            "\u0288": "t",
            "\u2C66": "t",
            "\uA787": "t",
            "\uA729": "tz",
            "\u24E4": "u",
            "\uFF55": "u",
            "\u00F9": "u",
            "\u00FA": "u",
            "\u00FB": "u",
            "\u0169": "u",
            "\u1E79": "u",
            "\u016B": "u",
            "\u1E7B": "u",
            "\u016D": "u",
            "\u00FC": "u",
            "\u01DC": "u",
            "\u01D8": "u",
            "\u01D6": "u",
            "\u01DA": "u",
            "\u1EE7": "u",
            "\u016F": "u",
            "\u0171": "u",
            "\u01D4": "u",
            "\u0215": "u",
            "\u0217": "u",
            "\u01B0": "u",
            "\u1EEB": "u",
            "\u1EE9": "u",
            "\u1EEF": "u",
            "\u1EED": "u",
            "\u1EF1": "u",
            "\u1EE5": "u",
            "\u1E73": "u",
            "\u0173": "u",
            "\u1E77": "u",
            "\u1E75": "u",
            "\u0289": "u",
            "\u24E5": "v",
            "\uFF56": "v",
            "\u1E7D": "v",
            "\u1E7F": "v",
            "\u028B": "v",
            "\uA75F": "v",
            "\u028C": "v",
            "\uA761": "vy",
            "\u24E6": "w",
            "\uFF57": "w",
            "\u1E81": "w",
            "\u1E83": "w",
            "\u0175": "w",
            "\u1E87": "w",
            "\u1E85": "w",
            "\u1E98": "w",
            "\u1E89": "w",
            "\u2C73": "w",
            "\u24E7": "x",
            "\uFF58": "x",
            "\u1E8B": "x",
            "\u1E8D": "x",
            "\u24E8": "y",
            "\uFF59": "y",
            "\u1EF3": "y",
            "\u00FD": "y",
            "\u0177": "y",
            "\u1EF9": "y",
            "\u0233": "y",
            "\u1E8F": "y",
            "\u00FF": "y",
            "\u1EF7": "y",
            "\u1E99": "y",
            "\u1EF5": "y",
            "\u01B4": "y",
            "\u024F": "y",
            "\u1EFF": "y",
            "\u24E9": "z",
            "\uFF5A": "z",
            "\u017A": "z",
            "\u1E91": "z",
            "\u017C": "z",
            "\u017E": "z",
            "\u1E93": "z",
            "\u1E95": "z",
            "\u01B6": "z",
            "\u0225": "z",
            "\u0240": "z",
            "\u2C6C": "z",
            "\uA763": "z",
            "\u0386": "\u0391",
            "\u0388": "\u0395",
            "\u0389": "\u0397",
            "\u038A": "\u0399",
            "\u03AA": "\u0399",
            "\u038C": "\u039F",
            "\u038E": "\u03A5",
            "\u03AB": "\u03A5",
            "\u038F": "\u03A9",
            "\u03AC": "\u03B1",
            "\u03AD": "\u03B5",
            "\u03AE": "\u03B7",
            "\u03AF": "\u03B9",
            "\u03CA": "\u03B9",
            "\u0390": "\u03B9",
            "\u03CC": "\u03BF",
            "\u03CD": "\u03C5",
            "\u03CB": "\u03C5",
            "\u03B0": "\u03C5",
            "\u03C9": "\u03C9",
            "\u03C2": "\u03C3"
        };

    $document = $(document);

    nextUid = (function () {
        var counter = 1;
        return function () {
            return counter++;
        };
    }());


    function reinsertElement(element) {
        var placeholder = $(document.createTextNode(''));

        element.before(placeholder);
        placeholder.before(element);
        placeholder.remove();
    }

    function stripDiacritics(str) {
        // Used 'uni range + named function' from http://jsperf.com/diacritics/18
        function match(a) {
            return DIACRITICS[a] || a;
        }

        return str.replace(/[^\u0000-\u007E]/g, match);
    }

    function indexOf(value, array) {
        var i = 0, l = array.length;
        for (; i < l; i = i + 1) {
            if (equal(value, array[i])) return i;
        }
        return -1;
    }

    function measureScrollbar() {
        var $template = $(MEASURE_SCROLLBAR_TEMPLATE);
        $template.appendTo(document.body);

        var dim = {
            width: $template.width() - $template[0].clientWidth,
            height: $template.height() - $template[0].clientHeight
        };
        $template.remove();

        return dim;
    }

    /**
     * Compares equality of a and b
     * @param a
     * @param b
     */
    function equal(a, b) {
        if (a === b) return true;
        if (a === undefined || b === undefined) return false;
        if (a === null || b === null) return false;
        // Check whether 'a' or 'b' is a string (primitive or object).
        // The concatenation of an empty string (+'') converts its argument to a string's primitive.
        if (a.constructor === String) return a + '' === b + ''; // a+'' - in case 'a' is a String object
        if (b.constructor === String) return b + '' === a + ''; // b+'' - in case 'b' is a String object
        return false;
    }

    /**
     * Splits the string into an array of values, transforming each value. An empty array is returned for nulls or empty
     * strings
     * @param string
     * @param separator
     */
    function splitVal(string, separator, transform) {
        var val, i, l;
        if (string === null || string.length < 1) return [];
        val = string.split(separator);
        for (i = 0, l = val.length; i < l; i = i + 1) val[i] = transform(val[i]);
        return val;
    }

    function getSideBorderPadding(element) {
        return element.outerWidth(false) - element.width();
    }

    function installKeyUpChangeEvent(element) {
        var key = "keyup-change-value";
        element.on("keydown", function () {
            if ($.data(element, key) === undefined) {
                $.data(element, key, element.val());
            }
        });
        element.on("keyup", function () {
            var val = $.data(element, key);
            if (val !== undefined && element.val() !== val) {
                $.removeData(element, key);
                element.trigger("keyup-change");
            }
        });
    }


    /**
     * filters mouse events so an event is fired only if the mouse moved.
     *
     * filters out mouse events that occur when mouse is stationary but
     * the elements under the pointer are scrolled.
     */
    function installFilteredMouseMove(element) {
        element.on("mousemove", function (e) {
            var lastpos = lastMousePosition;
            if (lastpos === undefined || lastpos.x !== e.pageX || lastpos.y !== e.pageY) {
                $(e.target).trigger("mousemove-filtered", e);
            }
        });
    }

    /**
     * Debounces a function. Returns a function that calls the original fn function only if no invocations have been made
     * within the last quietMillis milliseconds.
     *
     * @param quietMillis number of milliseconds to wait before invoking fn
     * @param fn function to be debounced
     * @param ctx object to be used as this reference within fn
     * @return debounced version of fn
     */
    function debounce(quietMillis, fn, ctx) {
        ctx = ctx || undefined;
        var timeout;
        return function () {
            var args = arguments;
            window.clearTimeout(timeout);
            timeout = window.setTimeout(function () {
                fn.apply(ctx, args);
            }, quietMillis);
        };
    }

    function installDebouncedScroll(threshold, element) {
        var notify = debounce(threshold, function (e) {
            element.trigger("scroll-debounced", e);
        });
        element.on("scroll", function (e) {
            if (indexOf(e.target, element.get()) >= 0) notify(e);
        });
    }

    function focus($el) {
        if ($el[0] === document.activeElement) return;

        /* set the focus in a 0 timeout - that way the focus is set after the processing
         of the current event has finished - which seems like the only reliable way
         to set focus */
        window.setTimeout(function () {
            var el = $el[0], pos = $el.val().length, range;

            $el.focus();

            /* make sure el received focus so we do not error out when trying to manipulate the caret.
             sometimes modals or others listeners may steal it after its set */
            var isVisible = (el.offsetWidth > 0 || el.offsetHeight > 0);
            if (isVisible && el === document.activeElement) {

                /* after the focus is set move the caret to the end, necessary when we val()
                 just before setting focus */
                if (el.setSelectionRange) {
                    el.setSelectionRange(pos, pos);
                }
                else if (el.createTextRange) {
                    range = el.createTextRange();
                    range.collapse(false);
                    range.select();
                }
            }
        }, 0);
    }

    function getCursorInfo(el) {
        el = $(el)[0];
        var offset = 0;
        var length = 0;
        if ('selectionStart' in el) {
            offset = el.selectionStart;
            length = el.selectionEnd - offset;
        } else if ('selection' in document) {
            el.focus();
            var sel = document.selection.createRange();
            length = document.selection.createRange().text.length;
            sel.moveStart('character', -el.value.length);
            offset = sel.text.length - length;
        }
        return {offset: offset, length: length};
    }

    function killEvent(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    function killEventImmediately(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    function measureTextWidth(e) {
        if (!sizer) {
            var style = e[0].currentStyle || window.getComputedStyle(e[0], null);
            sizer = $(document.createElement("div")).css({
                position: "absolute",
                left: "-10000px",
                top: "-10000px",
                display: "none",
                fontSize: style.fontSize,
                fontFamily: style.fontFamily,
                fontStyle: style.fontStyle,
                fontWeight: style.fontWeight,
                letterSpacing: style.letterSpacing,
                textTransform: style.textTransform,
                whiteSpace: "nowrap"
            });
            sizer.attr("class", "select2-sizer");
            $(document.body).append(sizer);
        }
        sizer.text(e.val());
        return sizer.width();
    }

    function syncCssClasses(dest, src, adapter) {
        var classes, replacements = [], adapted;

        classes = $.trim(dest.attr("class"));

        if (classes) {
            classes = '' + classes; // for IE which returns object

            $(classes.split(/\s+/)).each2(function () {
                if (this.indexOf("select2-") === 0) {
                    replacements.push(this);
                }
            });
        }

        classes = $.trim(src.attr("class"));

        if (classes) {
            classes = '' + classes; // for IE which returns object

            $(classes.split(/\s+/)).each2(function () {
                if (this.indexOf("select2-") !== 0) {
                    adapted = adapter(this);

                    if (adapted) {
                        replacements.push(adapted);
                    }
                }
            });
        }

        dest.attr("class", replacements.join(" "));
    }


    function markMatch(text, term, markup, escapeMarkup) {
        var match = stripDiacritics(text.toUpperCase()).indexOf(stripDiacritics(term.toUpperCase())),
            tl = term.length;

        if (match < 0) {
            markup.push(escapeMarkup(text));
            return;
        }

        markup.push(escapeMarkup(text.substring(0, match)));
        markup.push("<span class='select2-match'>");
        markup.push(escapeMarkup(text.substring(match, match + tl)));
        markup.push("</span>");
        markup.push(escapeMarkup(text.substring(match + tl, text.length)));
    }

    function defaultEscapeMarkup(markup) {
        var replace_map = {
            '\\': '&#92;',
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#47;'
        };

        return String(markup).replace(/[&<>"'\/\\]/g, function (match) {
            return replace_map[match];
        });
    }

    /**
     * Produces an ajax-based query function
     *
     * @param options object containing configuration parameters
     * @param options.params parameter map for the transport ajax call, can contain such options as cache, jsonpCallback, etc. see $.ajax
     * @param options.transport function that will be used to execute the ajax request. must be compatible with parameters supported by $.ajax
     * @param options.url url for the data
     * @param options.data a function(searchTerm, pageNumber, context) that should return an object containing query string parameters for the above url.
     * @param options.dataType request data type: ajax, jsonp, other datatypes supported by jQuery's $.ajax function or the transport function if specified
     * @param options.quietMillis (optional) milliseconds to wait before making the ajaxRequest, helps debounce the ajax function if invoked too often
     * @param options.results a function(remoteData, pageNumber, query) that converts data returned form the remote request to the format expected by Select2.
     *      The expected format is an object containing the following keys:
     *      results array of objects that will be used as choices
     *      more (optional) boolean indicating whether there are more results available
     *      Example: {results:[{id:1, text:'Red'},{id:2, text:'Blue'}], more:true}
     */
    function ajax(options) {
        var timeout, // current scheduled but not yet executed request
            handler = null,
            quietMillis = options.quietMillis || 100,
            ajaxUrl = options.url,
            self = this;

        return function (query) {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(function () {
                var data = options.data, // ajax data function
                    url = ajaxUrl, // ajax url string or function
                    transport = options.transport || $.fn.select2.ajaxDefaults.transport,
                // deprecated - to be removed in 4.0  - use params instead
                    deprecated = {
                        type: options.type || 'GET', // set type of request (GET or POST)
                        cache: options.cache || false,
                        jsonpCallback: options.jsonpCallback || undefined,
                        dataType: options.dataType || "json"
                    },
                    params = $.extend({}, $.fn.select2.ajaxDefaults.params, deprecated);

                data = data ? data.call(self, query.term, query.page, query.context) : null;
                url = (typeof url === 'function') ? url.call(self, query.term, query.page, query.context) : url;

                if (handler && typeof handler.abort === "function") {
                    handler.abort();
                }

                if (options.params) {
                    if ($.isFunction(options.params)) {
                        $.extend(params, options.params.call(self));
                    } else {
                        $.extend(params, options.params);
                    }
                }

                $.extend(params, {
                    url: url,
                    dataType: options.dataType,
                    data: data,
                    success: function (data) {
                        // TODO - replace query.page with query so users have access to term, page, etc.
                        // added query as third paramter to keep backwards compatibility
                        var results = options.results(data, query.page, query);
                        query.callback(results);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        var results = {
                            hasError: true,
                            jqXHR: jqXHR,
                            textStatus: textStatus,
                            errorThrown: errorThrown
                        };

                        query.callback(results);
                    }
                });
                handler = transport.call(self, params);
            }, quietMillis);
        };
    }

    /**
     * Produces a query function that works with a local array
     *
     * @param options object containing configuration parameters. The options parameter can either be an array or an
     * object.
     *
     * If the array form is used it is assumed that it contains objects with 'id' and 'text' keys.
     *
     * If the object form is used it is assumed that it contains 'data' and 'text' keys. The 'data' key should contain
     * an array of objects that will be used as choices. These objects must contain at least an 'id' key. The 'text'
     * key can either be a String in which case it is expected that each element in the 'data' array has a key with the
     * value of 'text' which will be used to match choices. Alternatively, text can be a function(item) that can extract
     * the text.
     */
    function local(options) {
        var data = options, // data elements
            dataText,
            tmp,
            text = function (item) {
                return "" + item.text;
            }; // function used to retrieve the text portion of a data item that is matched against the search

        if ($.isArray(data)) {
            tmp = data;
            data = {results: tmp};
        }

        if ($.isFunction(data) === false) {
            tmp = data;
            data = function () {
                return tmp;
            };
        }

        var dataItem = data();
        if (dataItem.text) {
            text = dataItem.text;
            // if text is not a function we assume it to be a key name
            if (!$.isFunction(text)) {
                dataText = dataItem.text; // we need to store this in a separate variable because in the next step data gets reset and data.text is no longer available
                text = function (item) {
                    return item[dataText];
                };
            }
        }

        return function (query) {
            var t = query.term, filtered = {results: []}, process;
            if (t === "") {
                query.callback(data());
                return;
            }

            process = function (datum, collection) {
                var group, attr;
                datum = datum[0];
                if (datum.children) {
                    group = {};
                    for (attr in datum) {
                        if (datum.hasOwnProperty(attr)) group[attr] = datum[attr];
                    }
                    group.children = [];
                    $(datum.children).each2(function (i, childDatum) {
                        process(childDatum, group.children);
                    });
                    if (group.children.length || query.matcher(t, text(group), datum)) {
                        collection.push(group);
                    }
                } else {
                    if (query.matcher(t, text(datum), datum)) {
                        collection.push(datum);
                    }
                }
            };

            $(data().results).each2(function (i, datum) {
                process(datum, filtered.results);
            });
            query.callback(filtered);
        };
    }

    // TODO javadoc
    function tags(data) {
        var isFunc = $.isFunction(data);
        return function (query) {
            var t = query.term, filtered = {results: []};
            var result = isFunc ? data(query) : data;
            if ($.isArray(result)) {
                $(result).each(function () {
                    var isObject = this.text !== undefined,
                        text = isObject ? this.text : this;
                    if (t === "" || query.matcher(t, text)) {
                        filtered.results.push(isObject ? this : {id: this, text: this});
                    }
                });
                query.callback(filtered);
            }
        };
    }

    /**
     * Checks if the formatter function should be used.
     *
     * Throws an error if it is not a function. Returns true if it should be used,
     * false if no formatting should be performed.
     *
     * @param formatter
     */
    function checkFormatter(formatter, formatterName) {
        if ($.isFunction(formatter)) return true;
        if (!formatter) return false;
        if (typeof(formatter) === 'string') return true;
        throw new Error(formatterName + " must be a string, function, or falsy value");
    }

    /**
     * Returns a given value
     * If given a function, returns its output
     *
     * @param val string|function
     * @param context value of "this" to be passed to function
     * @returns {*}
     */
    function evaluate(val, context) {
        if ($.isFunction(val)) {
            var args = Array.prototype.slice.call(arguments, 2);
            return val.apply(context, args);
        }
        return val;
    }

    function countResults(results) {
        var count = 0;
        $.each(results, function (i, item) {
            if (item.children) {
                count += countResults(item.children);
            } else {
                count++;
            }
        });
        return count;
    }

    /**
     * Default tokenizer. This function uses breaks the input on substring match of any string from the
     * opts.tokenSeparators array and uses opts.createSearchChoice to create the choice object. Both of those
     * two options have to be defined in order for the tokenizer to work.
     *
     * @param input text user has typed so far or pasted into the search field
     * @param selection currently selected choices
     * @param selectCallback function(choice) callback tho add the choice to selection
     * @param opts select2's opts
     * @return undefined/null to leave the current input unchanged, or a string to change the input to the returned value
     */
    function defaultTokenizer(input, selection, selectCallback, opts) {
        var original = input, // store the original so we can compare and know if we need to tell the search to update its text
            dupe = false, // check for whether a token we extracted represents a duplicate selected choice
            token, // token
            index, // position at which the separator was found
            i, l, // looping variables
            separator; // the matched separator

        if (!opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1) return undefined;

        while (true) {
            index = -1;

            for (i = 0, l = opts.tokenSeparators.length; i < l; i++) {
                separator = opts.tokenSeparators[i];
                index = input.indexOf(separator);
                if (index >= 0) break;
            }

            if (index < 0) break; // did not find any token separator in the input string, bail

            token = input.substring(0, index);
            input = input.substring(index + separator.length);

            if (token.length > 0) {
                token = opts.createSearchChoice.call(this, token, selection);
                if (token !== undefined && token !== null && opts.id(token) !== undefined && opts.id(token) !== null) {
                    dupe = false;
                    for (i = 0, l = selection.length; i < l; i++) {
                        if (equal(opts.id(token), opts.id(selection[i]))) {
                            dupe = true;
                            break;
                        }
                    }

                    if (!dupe) selectCallback(token);
                }
            }
        }

        if (original !== input) return input;
    }

    function cleanupJQueryElements() {
        var self = this;

        $.each(arguments, function (i, element) {
            self[element].remove();
            self[element] = null;
        });
    }

    /**
     * Creates a new class
     *
     * @param superClass
     * @param methods
     */
    function clazz(SuperClass, methods) {
        var constructor = function () {
        };
        constructor.prototype = new SuperClass;
        constructor.prototype.constructor = constructor;
        constructor.prototype.parent = SuperClass.prototype;
        constructor.prototype = $.extend(constructor.prototype, methods);
        return constructor;
    }

    AbstractSelect2 = clazz(Object, {

        // abstract
        bind: function (func) {
            var self = this;
            return function () {
                func.apply(self, arguments);
            };
        },

        // abstract
        init: function (opts) {
            var results, search, resultsSelector = ".select2-results";

            // prepare options
            this.opts = opts = this.prepareOpts(opts);

            this.id = opts.id;

            // destroy if called on an existing component
            if (opts.element.data("select2") !== undefined &&
                opts.element.data("select2") !== null) {
                opts.element.data("select2").destroy();
            }

            this.container = this.createContainer();

            this.liveRegion = $('.select2-hidden-accessible');
            if (this.liveRegion.length == 0) {
                this.liveRegion = $("<span>", {
                    role: "status",
                    "aria-live": "polite"
                })
                    .addClass("select2-hidden-accessible")
                    .appendTo(document.body);
            }

            this.containerId = "s2id_" + (opts.element.attr("id") || "autogen" + nextUid());
            this.containerEventName = this.containerId
                .replace(/([.])/g, '_')
                .replace(/([;&,\-\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
            this.container.attr("id", this.containerId);

            this.container.attr("title", opts.element.attr("title"));

            this.body = $(document.body);

            syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);

            this.container.attr("style", opts.element.attr("style"));
            this.container.css(evaluate(opts.containerCss, this.opts.element));
            this.container.addClass(evaluate(opts.containerCssClass, this.opts.element));

            this.elementTabIndex = this.opts.element.attr("tabindex");

            // swap container for the element
            this.opts.element
                .data("select2", this)
                .attr("tabindex", "-1")
                .before(this.container)
                .on("click.select2", killEvent); // do not leak click events

            this.container.data("select2", this);

            this.dropdown = this.container.find(".select2-drop");

            syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);

            this.dropdown.addClass(evaluate(opts.dropdownCssClass, this.opts.element));
            this.dropdown.data("select2", this);
            this.dropdown.on("click", killEvent);

            this.results = results = this.container.find(resultsSelector);
            this.search = search = this.container.find("input.select2-input");

            this.queryCount = 0;
            this.resultsPage = 0;
            this.context = null;

            // initialize the container
            this.initContainer();

            this.container.on("click", killEvent);

            installFilteredMouseMove(this.results);

            this.dropdown.on("mousemove-filtered", resultsSelector, this.bind(this.highlightUnderEvent));
            this.dropdown.on("touchstart touchmove touchend", resultsSelector, this.bind(function (event) {
                this._touchEvent = true;
                this.highlightUnderEvent(event);
            }));
            this.dropdown.on("touchmove", resultsSelector, this.bind(this.touchMoved));
            this.dropdown.on("touchstart touchend", resultsSelector, this.bind(this.clearTouchMoved));

            // Waiting for a click event on touch devices to select option and hide dropdown
            // otherwise click will be triggered on an underlying element
            this.dropdown.on('click', this.bind(function (event) {
                if (this._touchEvent) {
                    this._touchEvent = false;
                    this.selectHighlighted();
                }
            }));

            installDebouncedScroll(80, this.results);
            this.dropdown.on("scroll-debounced", resultsSelector, this.bind(this.loadMoreIfNeeded));

            // do not propagate change event from the search field out of the component
            $(this.container).on("change", ".select2-input", function (e) {
                e.stopPropagation();
            });
            $(this.dropdown).on("change", ".select2-input", function (e) {
                e.stopPropagation();
            });

            // if jquery.mousewheel plugin is installed we can prevent out-of-bounds scrolling of results via mousewheel
            if ($.fn.mousewheel) {
                results.mousewheel(function (e, delta, deltaX, deltaY) {
                    var top = results.scrollTop();
                    if (deltaY > 0 && top - deltaY <= 0) {
                        results.scrollTop(0);
                        killEvent(e);
                    } else if (deltaY < 0 && results.get(0).scrollHeight - results.scrollTop() + deltaY <= results.height()) {
                        results.scrollTop(results.get(0).scrollHeight - results.height());
                        killEvent(e);
                    }
                });
            }

            installKeyUpChangeEvent(search);
            search.on("keyup-change input paste", this.bind(this.updateResults));
            search.on("focus", function () {
                search.addClass("select2-focused");
            });
            search.on("blur", function () {
                search.removeClass("select2-focused");
            });

            this.dropdown.on("mouseup", resultsSelector, this.bind(function (e) {
                if ($(e.target).closest(".select2-result-selectable").length > 0) {
                    this.highlightUnderEvent(e);
                    this.selectHighlighted(e);
                }
            }));

            // trap all mouse events from leaving the dropdown. sometimes there may be a modal that is listening
            // for mouse events outside of itself so it can close itself. since the dropdown is now outside the select2's
            // dom it will trigger the popup close, which is not what we want
            // focusin can cause focus wars between modals and select2 since the dropdown is outside the modal.
            this.dropdown.on("click mouseup mousedown touchstart touchend focusin", function (e) {
                e.stopPropagation();
            });

            this.lastSearchTerm = undefined;

            if ($.isFunction(this.opts.initSelection)) {
                // initialize selection based on the current value of the source element
                this.initSelection();

                // if the user has provided a function that can set selection based on the value of the source element
                // we monitor the change event on the element and trigger it, allowing for two way synchronization
                this.monitorSource();
            }

            if (opts.maximumInputLength !== null) {
                this.search.attr("maxlength", opts.maximumInputLength);
            }

            var disabled = opts.element.prop("disabled");
            if (disabled === undefined) disabled = false;
            this.enable(!disabled);

            var readonly = opts.element.prop("readonly");
            if (readonly === undefined) readonly = false;
            this.readonly(readonly);

            // Calculate size of scrollbar
            scrollBarDimensions = scrollBarDimensions || measureScrollbar();

            this.autofocus = opts.element.prop("autofocus");
            opts.element.prop("autofocus", false);
            if (this.autofocus) this.focus();

            this.search.attr("placeholder", opts.searchInputPlaceholder);
        },

        // abstract
        destroy: function () {
            var element = this.opts.element, select2 = element.data("select2"), self = this;

            this.close();

            if (element.length && element[0].detachEvent && self._sync) {
                element.each(function () {
                    if (self._sync) {
                        this.detachEvent("onpropertychange", self._sync);
                    }
                });
            }
            if (this.propertyObserver) {
                this.propertyObserver.disconnect();
                this.propertyObserver = null;
            }
            this._sync = null;

            if (select2 !== undefined) {
                select2.container.remove();
                select2.liveRegion.remove();
                select2.dropdown.remove();
                element.removeData("select2")
                    .off(".select2");
                if (!element.is("input[type='hidden']")) {
                    element
                        .show()
                        .prop("autofocus", this.autofocus || false);
                    if (this.elementTabIndex) {
                        element.attr({tabindex: this.elementTabIndex});
                    } else {
                        element.removeAttr("tabindex");
                    }
                    element.show();
                } else {
                    element.css("display", "");
                }
            }

            cleanupJQueryElements.call(this,
                "container",
                "liveRegion",
                "dropdown",
                "results",
                "search"
            );
        },

        // abstract
        optionToData: function (element) {
            if (element.is("option")) {
                return {
                    id: element.prop("value"),
                    text: element.text(),
                    element: element.get(),
                    css: element.attr("class"),
                    disabled: element.prop("disabled"),
                    locked: equal(element.attr("locked"), "locked") || equal(element.data("locked"), true)
                };
            } else if (element.is("optgroup")) {
                return {
                    text: element.attr("label"),
                    children: [],
                    element: element.get(),
                    css: element.attr("class")
                };
            }
        },

        // abstract
        prepareOpts: function (opts) {
            var element, select, idKey, ajaxUrl, self = this;

            element = opts.element;

            if (element.get(0).tagName.toLowerCase() === "select") {
                this.select = select = opts.element;
            }

            if (select) {
                // these options are not allowed when attached to a select because they are picked up off the element itself
                $.each(["id", "multiple", "ajax", "query", "createSearchChoice", "initSelection", "data", "tags"], function () {
                    if (this in opts) {
                        throw new Error("Option '" + this + "' is not allowed for Select2 when attached to a <select> element.");
                    }
                });
            }

            opts.debug = opts.debug || $.fn.select2.defaults.debug;

            // Warnings for options renamed/removed in Select2 4.0.0
            // Only when it's enabled through debug mode
            if (opts.debug && console && console.warn) {
                // id was removed
                if (opts.id != null) {
                    console.warn(
                        'Select2: The `id` option has been removed in Select2 4.0.0, ' +
                        'consider renaming your `id` property or mapping the property before your data makes it to Select2. ' +
                        'You can read more at https://select2.github.io/announcements-4.0.html#changed-id'
                    );
                }

                // text was removed
                if (opts.text != null) {
                    console.warn(
                        'Select2: The `text` option has been removed in Select2 4.0.0, ' +
                        'consider renaming your `text` property or mapping the property before your data makes it to Select2. ' +
                        'You can read more at https://select2.github.io/announcements-4.0.html#changed-id'
                    );
                }

                // sortResults was renamed to results
                if (opts.sortResults != null) {
                    console.warn(
                        'Select2: the `sortResults` option has been renamed to `sorter` in Select2 4.0.0. '
                    );
                }

                // selectOnBlur was renamed to selectOnClose
                if (opts.selectOnBlur != null) {
                    console.warn(
                        'Select2: The `selectOnBlur` option has been renamed to `selectOnClose` in Select2 4.0.0.'
                    );
                }

                // ajax.results was renamed to ajax.processResults
                if (opts.ajax != null && opts.ajax.results != null) {
                    console.warn(
                        'Select2: The `ajax.results` option has been renamed to `ajax.processResults` in Select2 4.0.0.'
                    );
                }

                // format* options were renamed to language.*
                if (opts.formatNoResults != null) {
                    console.warn(
                        'Select2: The `formatNoResults` option has been renamed to `language.noResults` in Select2 4.0.0.'
                    );
                }
                if (opts.formatSearching != null) {
                    console.warn(
                        'Select2: The `formatSearching` option has been renamed to `language.searching` in Select2 4.0.0.'
                    );
                }
                if (opts.formatInputTooShort != null) {
                    console.warn(
                        'Select2: The `formatInputTooShort` option has been renamed to `language.inputTooShort` in Select2 4.0.0.'
                    );
                }
                if (opts.formatInputTooLong != null) {
                    console.warn(
                        'Select2: The `formatInputTooLong` option has been renamed to `language.inputTooLong` in Select2 4.0.0.'
                    );
                }
                if (opts.formatLoading != null) {
                    console.warn(
                        'Select2: The `formatLoading` option has been renamed to `language.loadingMore` in Select2 4.0.0.'
                    );
                }
                if (opts.formatSelectionTooBig != null) {
                    console.warn(
                        'Select2: The `formatSelectionTooBig` option has been renamed to `language.maximumSelected` in Select2 4.0.0.'
                    );
                }

                if (opts.element.data('select2Tags')) {
                    console.warn(
                        'Select2: The `data-select2-tags` attribute has been renamed to `data-tags` in Select2 4.0.0.'
                    );
                }
            }

            // Aliasing options renamed in Select2 4.0.0

            // data-select2-tags -> data-tags
            if (opts.element.data('tags') != null) {
                var elemTags = opts.element.data('tags');

                // data-tags should actually be a boolean
                if (!$.isArray(elemTags)) {
                    elemTags = [];
                }

                opts.element.data('select2Tags', elemTags);
            }

            // sortResults -> sorter
            if (opts.sorter != null) {
                opts.sortResults = opts.sorter;
            }

            // selectOnBlur -> selectOnClose
            if (opts.selectOnClose != null) {
                opts.selectOnBlur = opts.selectOnClose;
            }

            // ajax.results -> ajax.processResults
            if (opts.ajax != null) {
                if ($.isFunction(opts.ajax.processResults)) {
                    opts.ajax.results = opts.ajax.processResults;
                }
            }

            // Formatters/language options
            if (opts.language != null) {
                var lang = opts.language;

                // formatNoMatches -> language.noMatches
                if ($.isFunction(lang.noMatches)) {
                    opts.formatNoMatches = lang.noMatches;
                }

                // formatSearching -> language.searching
                if ($.isFunction(lang.searching)) {
                    opts.formatSearching = lang.searching;
                }

                // formatInputTooShort -> language.inputTooShort
                if ($.isFunction(lang.inputTooShort)) {
                    opts.formatInputTooShort = lang.inputTooShort;
                }

                // formatInputTooLong -> language.inputTooLong
                if ($.isFunction(lang.inputTooLong)) {
                    opts.formatInputTooLong = lang.inputTooLong;
                }

                // formatLoading -> language.loadingMore
                if ($.isFunction(lang.loadingMore)) {
                    opts.formatLoading = lang.loadingMore;
                }

                // formatSelectionTooBig -> language.maximumSelected
                if ($.isFunction(lang.maximumSelected)) {
                    opts.formatSelectionTooBig = lang.maximumSelected;
                }
            }

            opts = $.extend({}, {
                populateResults: function (container, results, query) {
                    var populate, id = this.opts.id, liveRegion = this.liveRegion;

                    populate = function (results, container, depth) {

                        var i, l, result, selectable, disabled, compound, node, label, innerContainer, formatted;

                        results = opts.sortResults(results, container, query);

                        // collect the created nodes for bulk append
                        var nodes = [];
                        for (i = 0, l = results.length; i < l; i = i + 1) {

                            result = results[i];

                            disabled = (result.disabled === true);
                            selectable = (!disabled) && (id(result) !== undefined);

                            compound = result.children && result.children.length > 0;

                            node = $("<li></li>");
                            node.addClass("select2-results-dept-" + depth);
                            node.addClass("select2-result");
                            node.addClass(selectable ? "select2-result-selectable" : "select2-result-unselectable");
                            if (disabled) {
                                node.addClass("select2-disabled");
                            }
                            if (compound) {
                                node.addClass("select2-result-with-children");
                            }
                            node.addClass(self.opts.formatResultCssClass(result));
                            node.attr("role", "presentation");

                            label = $(document.createElement("div"));
                            label.addClass("select2-result-label");
                            label.attr("id", "select2-result-label-" + nextUid());
                            label.attr("role", "option");

                            formatted = opts.formatResult(result, label, query, self.opts.escapeMarkup);
                            if (formatted !== undefined) {
                                label.html(formatted);
                                node.append(label);
                            }


                            if (compound) {
                                innerContainer = $("<ul></ul>");
                                innerContainer.addClass("select2-result-sub");
                                populate(result.children, innerContainer, depth + 1);
                                node.append(innerContainer);
                            }

                            node.data("select2-data", result);
                            nodes.push(node[0]);
                        }

                        // bulk append the created nodes
                        container.append(nodes);
                        liveRegion.text(opts.formatMatches(results.length));
                    };

                    populate(results, container, 0);
                }
            }, $.fn.select2.defaults, opts);

            if (typeof(opts.id) !== "function") {
                idKey = opts.id;
                opts.id = function (e) {
                    return e[idKey];
                };
            }

            if ($.isArray(opts.element.data("select2Tags"))) {
                if ("tags" in opts) {
                    throw "tags specified as both an attribute 'data-select2-tags' and in options of Select2 " + opts.element.attr("id");
                }
                opts.tags = opts.element.data("select2Tags");
            }

            if (select) {
                opts.query = this.bind(function (query) {
                    var data = {results: [], more: false},
                        term = query.term,
                        children, placeholderOption, process;

                    process = function (element, collection) {
                        var group;
                        if (element.is("option")) {
                            if (query.matcher(term, element.text(), element)) {
                                collection.push(self.optionToData(element));
                            }
                        } else if (element.is("optgroup")) {
                            group = self.optionToData(element);
                            element.children().each2(function (i, elm) {
                                process(elm, group.children);
                            });
                            if (group.children.length > 0) {
                                collection.push(group);
                            }
                        }
                    };

                    children = element.children();

                    // ignore the placeholder option if there is one
                    if (this.getPlaceholder() !== undefined && children.length > 0) {
                        placeholderOption = this.getPlaceholderOption();
                        if (placeholderOption) {
                            children = children.not(placeholderOption);
                        }
                    }

                    children.each2(function (i, elm) {
                        process(elm, data.results);
                    });

                    query.callback(data);
                });
                // this is needed because inside val() we construct choices from options and their id is hardcoded
                opts.id = function (e) {
                    return e.id;
                };
            } else {
                if (!("query" in opts)) {
                    if ("ajax" in opts) {
                        ajaxUrl = opts.element.data("ajax-url");
                        if (ajaxUrl && ajaxUrl.length > 0) {
                            opts.ajax.url = ajaxUrl;
                        }
                        opts.query = ajax.call(opts.element, opts.ajax);
                    } else if ("data" in opts) {
                        opts.query = local(opts.data);
                    } else if ("tags" in opts) {
                        opts.query = tags(opts.tags);
                        if (opts.createSearchChoice === undefined) {
                            opts.createSearchChoice = function (term) {
                                return {id: $.trim(term), text: $.trim(term)};
                            };
                        }
                        if (opts.initSelection === undefined) {
                            opts.initSelection = function (element, callback) {
                                var data = [];
                                $(splitVal(element.val(), opts.separator, opts.transformVal)).each(function () {
                                    var obj = {id: this, text: this},
                                        tags = opts.tags;
                                    if ($.isFunction(tags)) tags = tags();
                                    $(tags).each(function () {
                                        if (equal(this.id, obj.id)) {
                                            obj = this;
                                            return false;
                                        }
                                    });
                                    data.push(obj);
                                });

                                callback(data);
                            };
                        }
                    }
                }
            }
            if (typeof(opts.query) !== "function") {
                throw "query function not defined for Select2 " + opts.element.attr("id");
            }

            if (opts.createSearchChoicePosition === 'top') {
                opts.createSearchChoicePosition = function (list, item) {
                    list.unshift(item);
                };
            }
            else if (opts.createSearchChoicePosition === 'bottom') {
                opts.createSearchChoicePosition = function (list, item) {
                    list.push(item);
                };
            }
            else if (typeof(opts.createSearchChoicePosition) !== "function") {
                throw "invalid createSearchChoicePosition option must be 'top', 'bottom' or a custom function";
            }

            return opts;
        },

        /**
         * Monitor the original element for changes and update select2 accordingly
         */
        // abstract
        monitorSource: function () {
            var el = this.opts.element, observer, self = this;

            el.on("change.select2", this.bind(function (e) {
                if (this.opts.element.data("select2-change-triggered") !== true) {
                    this.initSelection();
                }
            }));

            this._sync = this.bind(function () {

                // sync enabled state
                var disabled = el.prop("disabled");
                if (disabled === undefined) disabled = false;
                this.enable(!disabled);

                var readonly = el.prop("readonly");
                if (readonly === undefined) readonly = false;
                this.readonly(readonly);

                if (this.container) {
                    syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
                    this.container.addClass(evaluate(this.opts.containerCssClass, this.opts.element));
                }

                if (this.dropdown) {
                    syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
                    this.dropdown.addClass(evaluate(this.opts.dropdownCssClass, this.opts.element));
                }

            });

            // IE8-10 (IE9/10 won't fire propertyChange via attachEventListener)
            if (el.length && el[0].attachEvent) {
                el.each(function () {
                    this.attachEvent("onpropertychange", self._sync);
                });
            }

            // safari, chrome, firefox, IE11
            observer = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
            if (observer !== undefined) {
                if (this.propertyObserver) {
                    delete this.propertyObserver;
                    this.propertyObserver = null;
                }
                this.propertyObserver = new observer(function (mutations) {
                    $.each(mutations, self._sync);
                });
                this.propertyObserver.observe(el.get(0), {attributes: true, subtree: false});
            }
        },

        // abstract
        triggerSelect: function (data) {
            var evt = $.Event("select2-selecting", {val: this.id(data), object: data, choice: data});
            this.opts.element.trigger(evt);
            return !evt.isDefaultPrevented();
        },

        /**
         * Triggers the change event on the source element
         */
        // abstract
        triggerChange: function (details) {

            details = details || {};
            details = $.extend({}, details, {type: "change", val: this.val()});
            // prevents recursive triggering
            this.opts.element.data("select2-change-triggered", true);
            this.opts.element.trigger(details);
            this.opts.element.data("select2-change-triggered", false);

            // some validation frameworks ignore the change event and listen instead to keyup, click for selects
            // so here we trigger the click event manually
            this.opts.element.click();

            // ValidationEngine ignores the change event and listens instead to blur
            // so here we trigger the blur event manually if so desired
            if (this.opts.blurOnChange)
                this.opts.element.blur();
        },

        //abstract
        isInterfaceEnabled: function () {
            return this.enabledInterface === true;
        },

        // abstract
        enableInterface: function () {
            var enabled = this._enabled && !this._readonly,
                disabled = !enabled;

            if (enabled === this.enabledInterface) return false;

            this.container.toggleClass("select2-container-disabled", disabled);
            this.close();
            this.enabledInterface = enabled;

            return true;
        },

        // abstract
        enable: function (enabled) {
            if (enabled === undefined) enabled = true;
            if (this._enabled === enabled) return;
            this._enabled = enabled;

            this.opts.element.prop("disabled", !enabled);
            this.enableInterface();
        },

        // abstract
        disable: function () {
            this.enable(false);
        },

        // abstract
        readonly: function (enabled) {
            if (enabled === undefined) enabled = false;
            if (this._readonly === enabled) return;
            this._readonly = enabled;

            this.opts.element.prop("readonly", enabled);
            this.enableInterface();
        },

        // abstract
        opened: function () {
            return (this.container) ? this.container.hasClass("select2-dropdown-open") : false;
        },

        // abstract
        positionDropdown: function () {
            var $dropdown = this.dropdown,
                container = this.container,
                offset = container.offset(),
                height = container.outerHeight(false),
                width = container.outerWidth(false),
                dropHeight = $dropdown.outerHeight(false),
                $window = $(window),
                windowWidth = $window.width(),
                windowHeight = $window.height(),
                viewPortRight = $window.scrollLeft() + windowWidth,
                viewportBottom = $window.scrollTop() + windowHeight,
                dropTop = offset.top + height,
                dropLeft = offset.left,
                enoughRoomBelow = dropTop + dropHeight <= viewportBottom,
                enoughRoomAbove = (offset.top - dropHeight) >= $window.scrollTop(),
                dropWidth = $dropdown.outerWidth(false),
                enoughRoomOnRight = function () {
                    return dropLeft + dropWidth <= viewPortRight;
                },
                enoughRoomOnLeft = function () {
                    return offset.left + viewPortRight + container.outerWidth(false) > dropWidth;
                },
                aboveNow = $dropdown.hasClass("select2-drop-above"),
                bodyOffset,
                above,
                changeDirection,
                css,
                resultsListNode;

            // always prefer the current above/below alignment, unless there is not enough room
            if (aboveNow) {
                above = true;
                if (!enoughRoomAbove && enoughRoomBelow) {
                    changeDirection = true;
                    above = false;
                }
            } else {
                above = false;
                if (!enoughRoomBelow && enoughRoomAbove) {
                    changeDirection = true;
                    above = true;
                }
            }

            //if we are changing direction we need to get positions when dropdown is hidden;
            if (changeDirection) {
                $dropdown.hide();
                offset = this.container.offset();
                height = this.container.outerHeight(false);
                width = this.container.outerWidth(false);
                dropHeight = $dropdown.outerHeight(false);
                viewPortRight = $window.scrollLeft() + windowWidth;
                viewportBottom = $window.scrollTop() + windowHeight;
                dropTop = offset.top + height;
                dropLeft = offset.left;
                dropWidth = $dropdown.outerWidth(false);
                $dropdown.show();

                // fix so the cursor does not move to the left within the search-textbox in IE
                this.focusSearch();
            }

            if (this.opts.dropdownAutoWidth) {
                resultsListNode = $('.select2-results', $dropdown)[0];
                $dropdown.addClass('select2-drop-auto-width');
                $dropdown.css('width', '');
                // Add scrollbar width to dropdown if vertical scrollbar is present
                dropWidth = $dropdown.outerWidth(false) + (resultsListNode.scrollHeight === resultsListNode.clientHeight ? 0 : scrollBarDimensions.width);
                dropWidth > width ? width = dropWidth : dropWidth = width;
                dropHeight = $dropdown.outerHeight(false);
            }
            else {
                this.container.removeClass('select2-drop-auto-width');
            }

            //console.log("below/ droptop:", dropTop, "dropHeight", dropHeight, "sum", (dropTop+dropHeight)+" viewport bottom", viewportBottom, "enough?", enoughRoomBelow);
            //console.log("above/ offset.top", offset.top, "dropHeight", dropHeight, "top", (offset.top-dropHeight), "scrollTop", this.body.scrollTop(), "enough?", enoughRoomAbove);

            // fix positioning when body has an offset and is not position: static
            if (this.body.css('position') !== 'static') {
                bodyOffset = this.body.offset();
                dropTop -= bodyOffset.top;
                dropLeft -= bodyOffset.left;
            }

            if (!enoughRoomOnRight() && enoughRoomOnLeft()) {
                dropLeft = offset.left + this.container.outerWidth(false) - dropWidth;
            }

            css = {
                left: dropLeft,
                width: width
            };

            if (above) {
                this.container.addClass("select2-drop-above");
                $dropdown.addClass("select2-drop-above");
                dropHeight = $dropdown.outerHeight(false);
                css.top = offset.top - dropHeight;
                css.bottom = 'auto';
            }
            else {
                css.top = dropTop;
                css.bottom = 'auto';
                this.container.removeClass("select2-drop-above");
                $dropdown.removeClass("select2-drop-above");
            }
            css = $.extend(css, evaluate(this.opts.dropdownCss, this.opts.element));

            $dropdown.css(css);
        },

        // abstract
        shouldOpen: function () {
            var event;

            if (this.opened()) return false;

            if (this._enabled === false || this._readonly === true) return false;

            event = $.Event("select2-opening");
            this.opts.element.trigger(event);
            return !event.isDefaultPrevented();
        },

        // abstract
        clearDropdownAlignmentPreference: function () {
            // clear the classes used to figure out the preference of where the dropdown should be opened
            this.container.removeClass("select2-drop-above");
            this.dropdown.removeClass("select2-drop-above");
        },

        /**
         * Opens the dropdown
         *
         * @return {Boolean} whether or not dropdown was opened. This method will return false if, for example,
         * the dropdown is already open, or if the 'open' event listener on the element called preventDefault().
         */
        // abstract
        open: function () {

            if (!this.shouldOpen()) return false;

            this.opening();

            // Only bind the document mousemove when the dropdown is visible
            $document.on("mousemove.select2Event", function (e) {
                lastMousePosition.x = e.pageX;
                lastMousePosition.y = e.pageY;
            });

            return true;
        },

        /**
         * Performs the opening of the dropdown
         */
        // abstract
        opening: function () {
            var cid = this.containerEventName,
                scroll = "scroll." + cid,
                resize = "resize." + cid,
                orient = "orientationchange." + cid,
                mask;

            this.container.addClass("select2-dropdown-open").addClass("select2-container-active");

            this.clearDropdownAlignmentPreference();

            if (this.dropdown[0] !== this.body.children().last()[0]) {
                this.dropdown.detach().appendTo(this.body);
            }

            // create the dropdown mask if doesn't already exist
            mask = $("#select2-drop-mask");
            if (mask.length === 0) {
                mask = $(document.createElement("div"));
                mask.attr("id", "select2-drop-mask").attr("class", "select2-drop-mask");
                mask.hide();
                mask.appendTo(this.body);
                mask.on("mousedown touchstart click", function (e) {
                    // Prevent IE from generating a click event on the body
                    reinsertElement(mask);

                    var dropdown = $("#select2-drop"), self;
                    if (dropdown.length > 0) {
                        self = dropdown.data("select2");
                        if (self.opts.selectOnBlur) {
                            self.selectHighlighted({noFocus: true});
                        }
                        self.close();
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            }

            // ensure the mask is always right before the dropdown
            if (this.dropdown.prev()[0] !== mask[0]) {
                this.dropdown.before(mask);
            }

            // move the global id to the correct dropdown
            $("#select2-drop").removeAttr("id");
            this.dropdown.attr("id", "select2-drop");

            // show the elements
            mask.show();

            this.positionDropdown();
            this.dropdown.show();
            this.positionDropdown();

            this.dropdown.addClass("select2-drop-active");

            // attach listeners to events that can change the position of the container and thus require
            // the position of the dropdown to be updated as well so it does not come unglued from the container
            var that = this;
            this.container.parents().add(window).each(function () {
                $(this).on(resize + " " + scroll + " " + orient, function (e) {
                    if (that.opened()) that.positionDropdown();
                });
            });


        },

        // abstract
        close: function () {
            if (!this.opened()) return;

            var cid = this.containerEventName,
                scroll = "scroll." + cid,
                resize = "resize." + cid,
                orient = "orientationchange." + cid;

            // unbind event listeners
            this.container.parents().add(window).each(function () {
                $(this).off(scroll).off(resize).off(orient);
            });

            this.clearDropdownAlignmentPreference();

            $("#select2-drop-mask").hide();
            this.dropdown.removeAttr("id"); // only the active dropdown has the select2-drop id
            this.dropdown.hide();
            this.container.removeClass("select2-dropdown-open").removeClass("select2-container-active");
            this.results.empty();

            // Now that the dropdown is closed, unbind the global document mousemove event
            $document.off("mousemove.select2Event");

            this.clearSearch();
            this.search.removeClass("select2-active");

            // Remove the aria active descendant for highlighted element
            this.search.removeAttr("aria-activedescendant");
            this.opts.element.trigger($.Event("select2-close"));
        },

        /**
         * Opens control, sets input value, and updates results.
         */
        // abstract
        externalSearch: function (term) {
            this.open();
            this.search.val(term);
            this.updateResults(false);
        },

        // abstract
        clearSearch: function () {

        },

        /**
         * @return {Boolean} Whether or not search value was changed.
         * @private
         */
        prefillNextSearchTerm: function () {
            // initializes search's value with nextSearchTerm (if defined by user)
            // ignore nextSearchTerm if the dropdown is opened by the user pressing a letter
            if (this.search.val() !== "") {
                return false;
            }

            var nextSearchTerm = this.opts.nextSearchTerm(this.data(), this.lastSearchTerm);
            if (nextSearchTerm !== undefined) {
                this.search.val(nextSearchTerm);
                this.search.select();
                return true;
            }

            return false;
        },

        //abstract
        getMaximumSelectionSize: function () {
            return evaluate(this.opts.maximumSelectionSize, this.opts.element);
        },

        // abstract
        ensureHighlightVisible: function () {
            var results = this.results, children, index, child, hb, rb, y, more, topOffset;

            index = this.highlight();

            if (index < 0) return;

            if (index == 0) {

                // if the first element is highlighted scroll all the way to the top,
                // that way any unselectable headers above it will also be scrolled
                // into view

                results.scrollTop(0);
                return;
            }

            children = this.findHighlightableChoices().find('.select2-result-label');

            child = $(children[index]);

            topOffset = (child.offset() || {}).top || 0;

            hb = topOffset + child.outerHeight(true);

            // if this is the last child lets also make sure select2-more-results is visible
            if (index === children.length - 1) {
                more = results.find("li.select2-more-results");
                if (more.length > 0) {
                    hb = more.offset().top + more.outerHeight(true);
                }
            }

            rb = results.offset().top + results.outerHeight(false);
            if (hb > rb) {
                results.scrollTop(results.scrollTop() + (hb - rb));
            }
            y = topOffset - results.offset().top;

            // make sure the top of the element is visible
            if (y < 0 && child.css('display') != 'none') {
                results.scrollTop(results.scrollTop() + y); // y is negative
            }
        },

        // abstract
        findHighlightableChoices: function () {
            return this.results.find(".select2-result-selectable:not(.select2-disabled):not(.select2-selected)");
        },

        // abstract
        moveHighlight: function (delta) {
            var choices = this.findHighlightableChoices(),
                index = this.highlight();

            while (index > -1 && index < choices.length) {
                index += delta;
                var choice = $(choices[index]);
                if (choice.hasClass("select2-result-selectable") && !choice.hasClass("select2-disabled") && !choice.hasClass("select2-selected")) {
                    this.highlight(index);
                    break;
                }
            }
        },

        // abstract
        highlight: function (index) {
            var choices = this.findHighlightableChoices(),
                choice,
                data;

            if (arguments.length === 0) {
                return indexOf(choices.filter(".select2-highlighted")[0], choices.get());
            }

            if (index >= choices.length) index = choices.length - 1;
            if (index < 0) index = 0;

            this.removeHighlight();

            choice = $(choices[index]);
            choice.addClass("select2-highlighted");

            // ensure assistive technology can determine the active choice
            this.search.attr("aria-activedescendant", choice.find(".select2-result-label").attr("id"));

            this.ensureHighlightVisible();

            this.liveRegion.text(choice.text());

            data = choice.data("select2-data");
            if (data) {
                this.opts.element.trigger({type: "select2-highlight", val: this.id(data), choice: data});
            }
        },

        removeHighlight: function () {
            this.results.find(".select2-highlighted").removeClass("select2-highlighted");
        },

        touchMoved: function () {
            this._touchMoved = true;
        },

        clearTouchMoved: function () {
            this._touchMoved = false;
        },

        // abstract
        countSelectableResults: function () {
            return this.findHighlightableChoices().length;
        },

        // abstract
        highlightUnderEvent: function (event) {
            var el = $(event.target).closest(".select2-result-selectable");
            if (el.length > 0 && !el.is(".select2-highlighted")) {
                var choices = this.findHighlightableChoices();
                this.highlight(choices.index(el));
            } else if (el.length == 0) {
                // if we are over an unselectable item remove all highlights
                this.removeHighlight();
            }
        },

        // abstract
        loadMoreIfNeeded: function () {
            var results = this.results,
                more = results.find("li.select2-more-results"),
                below, // pixels the element is below the scroll fold, below==0 is when the element is starting to be visible
                page = this.resultsPage + 1,
                self = this,
                term = this.search.val(),
                context = this.context;

            if (more.length === 0) return;
            below = more.offset().top - results.offset().top - results.height();

            if (below <= this.opts.loadMorePadding) {
                more.addClass("select2-active");
                this.opts.query({
                    element: this.opts.element,
                    term: term,
                    page: page,
                    context: context,
                    matcher: this.opts.matcher,
                    callback: this.bind(function (data) {

                        // ignore a response if the select2 has been closed before it was received
                        if (!self.opened()) return;


                        self.opts.populateResults.call(this, results, data.results, {
                            term: term,
                            page: page,
                            context: context
                        });
                        self.postprocessResults(data, false, false);

                        if (data.more === true) {
                            more.detach().appendTo(results).html(self.opts.escapeMarkup(evaluate(self.opts.formatLoadMore, self.opts.element, page + 1)));
                            window.setTimeout(function () {
                                self.loadMoreIfNeeded();
                            }, 10);
                        } else {
                            more.remove();
                        }
                        self.positionDropdown();
                        self.resultsPage = page;
                        self.context = data.context;
                        this.opts.element.trigger({type: "select2-loaded", items: data});
                    })
                });
            }
        },

        /**
         * Default tokenizer function which does nothing
         */
        tokenize: function () {

        },

        /**
         * @param initial whether or not this is the call to this method right after the dropdown has been opened
         */
        // abstract
        updateResults: function (initial) {
            var search = this.search,
                results = this.results,
                opts = this.opts,
                data,
                self = this,
                input,
                term = search.val(),
                lastTerm = $.data(this.container, "select2-last-term"),
            // sequence number used to drop out-of-order responses
                queryNumber;

            // prevent duplicate queries against the same term
            if (initial !== true && lastTerm && equal(term, lastTerm)) return;

            $.data(this.container, "select2-last-term", term);

            // if the search is currently hidden we do not alter the results
            if (initial !== true && (this.showSearchInput === false || !this.opened())) {
                return;
            }

            function postRender() {
                search.removeClass("select2-active");
                self.positionDropdown();
                if (results.find('.select2-no-results,.select2-selection-limit,.select2-searching').length) {
                    self.liveRegion.text(results.text());
                }
                else {
                    self.liveRegion.text(self.opts.formatMatches(results.find('.select2-result-selectable:not(".select2-selected")').length));
                }
            }

            function render(html) {
                results.html(html);
                postRender();
            }

            queryNumber = ++this.queryCount;

            var maxSelSize = this.getMaximumSelectionSize();
            if (maxSelSize >= 1) {
                data = this.data();
                if ($.isArray(data) && data.length >= maxSelSize && checkFormatter(opts.formatSelectionTooBig, "formatSelectionTooBig")) {
                    render("<li class='select2-selection-limit'>" + evaluate(opts.formatSelectionTooBig, opts.element, maxSelSize) + "</li>");
                    return;
                }
            }

            if (search.val().length < opts.minimumInputLength) {
                if (checkFormatter(opts.formatInputTooShort, "formatInputTooShort")) {
                    render("<li class='select2-no-results'>" + evaluate(opts.formatInputTooShort, opts.element, search.val(), opts.minimumInputLength) + "</li>");
                } else {
                    render("");
                }
                if (initial && this.showSearch) this.showSearch(true);
                return;
            }

            if (opts.maximumInputLength && search.val().length > opts.maximumInputLength) {
                if (checkFormatter(opts.formatInputTooLong, "formatInputTooLong")) {
                    render("<li class='select2-no-results'>" + evaluate(opts.formatInputTooLong, opts.element, search.val(), opts.maximumInputLength) + "</li>");
                } else {
                    render("");
                }
                return;
            }

            if (opts.formatSearching && this.findHighlightableChoices().length === 0) {
                render("<li class='select2-searching'>" + evaluate(opts.formatSearching, opts.element) + "</li>");
            }

            search.addClass("select2-active");

            this.removeHighlight();

            // give the tokenizer a chance to pre-process the input
            input = this.tokenize();
            if (input != undefined && input != null) {
                search.val(input);
            }

            this.resultsPage = 1;

            opts.query({
                element: opts.element,
                term: search.val(),
                page: this.resultsPage,
                context: null,
                matcher: opts.matcher,
                callback: this.bind(function (data) {
                    var def; // default choice

                    // ignore old responses
                    if (queryNumber != this.queryCount) {
                        return;
                    }

                    // ignore a response if the select2 has been closed before it was received
                    if (!this.opened()) {
                        this.search.removeClass("select2-active");
                        return;
                    }

                    // handle ajax error
                    if (data.hasError !== undefined && checkFormatter(opts.formatAjaxError, "formatAjaxError")) {
                        render("<li class='select2-ajax-error'>" + evaluate(opts.formatAjaxError, opts.element, data.jqXHR, data.textStatus, data.errorThrown) + "</li>");
                        return;
                    }

                    // save context, if any
                    this.context = (data.context === undefined) ? null : data.context;
                    // create a default choice and prepend it to the list
                    if (this.opts.createSearchChoice && search.val() !== "") {
                        def = this.opts.createSearchChoice.call(self, search.val(), data.results);
                        if (def !== undefined && def !== null && self.id(def) !== undefined && self.id(def) !== null) {
                            if ($(data.results).filter(
                                    function () {
                                        return equal(self.id(this), self.id(def));
                                    }).length === 0) {
                                this.opts.createSearchChoicePosition(data.results, def);
                            }
                        }
                    }

                    if (data.results.length === 0 && checkFormatter(opts.formatNoMatches, "formatNoMatches")) {
                        render("<li class='select2-no-results'>" + evaluate(opts.formatNoMatches, opts.element, search.val()) + "</li>");
                        if (this.showSearch) {
                            this.showSearch(search.val());
                        }
                        return;
                    }

                    results.empty();
                    self.opts.populateResults.call(this, results, data.results, {
                        term: search.val(),
                        page: this.resultsPage,
                        context: null
                    });

                    if (data.more === true && checkFormatter(opts.formatLoadMore, "formatLoadMore")) {
                        results.append("<li class='select2-more-results'>" + opts.escapeMarkup(evaluate(opts.formatLoadMore, opts.element, this.resultsPage)) + "</li>");
                        window.setTimeout(function () {
                            self.loadMoreIfNeeded();
                        }, 10);
                    }

                    this.postprocessResults(data, initial);

                    postRender();

                    this.opts.element.trigger({type: "select2-loaded", items: data});
                })
            });
        },

        // abstract
        cancel: function () {
            this.close();
        },

        // abstract
        blur: function () {
            // if selectOnBlur == true, select the currently highlighted option
            if (this.opts.selectOnBlur)
                this.selectHighlighted({noFocus: true});

            this.close();
            this.container.removeClass("select2-container-active");
            // synonymous to .is(':focus'), which is available in jquery >= 1.6
            if (this.search[0] === document.activeElement) {
                this.search.blur();
            }
            this.clearSearch();
            this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
        },

        // abstract
        focusSearch: function () {
            focus(this.search);
        },

        // abstract
        selectHighlighted: function (options) {
            if (this._touchMoved) {
                this.clearTouchMoved();
                return;
            }
            var index = this.highlight(),
                highlighted = this.results.find(".select2-highlighted"),
                data = highlighted.closest('.select2-result').data("select2-data");

            if (data) {
                this.highlight(index);
                this.onSelect(data, options);
            } else if (options && options.noFocus) {
                this.close();
            }
        },

        // abstract
        getPlaceholder: function () {
            var placeholderOption;
            return this.opts.element.attr("placeholder") ||
                this.opts.element.attr("data-placeholder") || // jquery 1.4 compat
                this.opts.element.data("placeholder") ||
                this.opts.placeholder ||
                ((placeholderOption = this.getPlaceholderOption()) !== undefined ? placeholderOption.text() : undefined);
        },

        // abstract
        getPlaceholderOption: function () {
            if (this.select) {
                var firstOption = this.select.children('option').first();
                if (this.opts.placeholderOption !== undefined) {
                    //Determine the placeholder option based on the specified placeholderOption setting
                    return (this.opts.placeholderOption === "first" && firstOption) ||
                        (typeof this.opts.placeholderOption === "function" && this.opts.placeholderOption(this.select));
                } else if ($.trim(firstOption.text()) === "" && firstOption.val() === "") {
                    //No explicit placeholder option specified, use the first if it's blank
                    return firstOption;
                }
            }
        },

        /**
         * Get the desired width for the container element.  This is
         * derived first from option `width` passed to select2, then
         * the inline 'style' on the original element, and finally
         * falls back to the jQuery calculated element width.
         */
        // abstract
        initContainerWidth: function () {
            function resolveContainerWidth() {
                var style, attrs, matches, i, l, attr;

                if (this.opts.width === "off") {
                    return null;
                } else if (this.opts.width === "element") {
                    return this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px';
                } else if (this.opts.width === "copy" || this.opts.width === "resolve") {
                    // check if there is inline style on the element that contains width
                    style = this.opts.element.attr('style');
                    if (typeof(style) === "string") {
                        attrs = style.split(';');
                        for (i = 0, l = attrs.length; i < l; i = i + 1) {
                            attr = attrs[i].replace(/\s/g, '');
                            matches = attr.match(/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i);
                            if (matches !== null && matches.length >= 1)
                                return matches[1];
                        }
                    }

                    if (this.opts.width === "resolve") {
                        // next check if css('width') can resolve a width that is percent based, this is sometimes possible
                        // when attached to input type=hidden or elements hidden via css
                        style = this.opts.element.css('width');
                        if (style.indexOf("%") > 0) return style;

                        // finally, fallback on the calculated width of the element
                        return (this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px');
                    }

                    return null;
                } else if ($.isFunction(this.opts.width)) {
                    return this.opts.width();
                } else {
                    return this.opts.width;
                }
            };

            var width = resolveContainerWidth.call(this);
            if (width !== null) {
                this.container.css("width", width);
            }
        }
    });

    SingleSelect2 = clazz(AbstractSelect2, {

        // single

        createContainer: function () {
            var container = $(document.createElement("div")).attr({
                "class": "select2-container"
            }).html([
                "<a href='javascript:void(0)' class='select2-choice' tabindex='-1'>",
                "   <span class='select2-chosen'>&#160;</span><abbr class='select2-search-choice-close'></abbr>",
                "   <span class='select2-arrow' role='presentation'><b role='presentation'></b></span>",
                "</a>",
                "<label for='' class='select2-offscreen'></label>",
                "<input class='select2-focusser select2-offscreen' type='text' aria-haspopup='true' role='button' />",
                "<div class='select2-drop select2-display-none'>",
                "   <div class='select2-search'>",
                "       <label for='' class='select2-offscreen'></label>",
                "       <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input' role='combobox' aria-expanded='true'",
                "       aria-autocomplete='list' />",
                "   </div>",
                "   <ul class='select2-results' role='listbox'>",
                "   </ul>",
                "</div>"].join(""));
            return container;
        },

        // single
        enableInterface: function () {
            if (this.parent.enableInterface.apply(this, arguments)) {
                this.focusser.prop("disabled", !this.isInterfaceEnabled());
            }
        },

        // single
        opening: function () {
            var el, range, len;

            if (this.opts.minimumResultsForSearch >= 0) {
                this.showSearch(true);
            }

            this.parent.opening.apply(this, arguments);

            if (this.showSearchInput !== false) {
                // IE appends focusser.val() at the end of field :/ so we manually insert it at the beginning using a range
                // all other browsers handle this just fine

                this.search.val(this.focusser.val());
            }
            if (this.opts.shouldFocusInput(this)) {
                this.search.focus();
                // move the cursor to the end after focussing, otherwise it will be at the beginning and
                // new text will appear *before* focusser.val()
                el = this.search.get(0);
                if (el.createTextRange) {
                    range = el.createTextRange();
                    range.collapse(false);
                    range.select();
                } else if (el.setSelectionRange) {
                    len = this.search.val().length;
                    el.setSelectionRange(len, len);
                }
            }

            this.prefillNextSearchTerm();

            this.focusser.prop("disabled", true).val("");
            this.updateResults(true);
            this.opts.element.trigger($.Event("select2-open"));
        },

        // single
        close: function () {
            if (!this.opened()) return;
            this.parent.close.apply(this, arguments);

            this.focusser.prop("disabled", false);

            if (this.opts.shouldFocusInput(this)) {
                this.focusser.focus();
            }
        },

        // single
        focus: function () {
            if (this.opened()) {
                this.close();
            } else {
                this.focusser.prop("disabled", false);
                if (this.opts.shouldFocusInput(this)) {
                    this.focusser.focus();
                }
            }
        },

        // single
        isFocused: function () {
            return this.container.hasClass("select2-container-active");
        },

        // single
        cancel: function () {
            this.parent.cancel.apply(this, arguments);
            this.focusser.prop("disabled", false);

            if (this.opts.shouldFocusInput(this)) {
                this.focusser.focus();
            }
        },

        // single
        destroy: function () {
            $("label[for='" + this.focusser.attr('id') + "']")
                .attr('for', this.opts.element.attr("id"));
            this.parent.destroy.apply(this, arguments);

            cleanupJQueryElements.call(this,
                "selection",
                "focusser"
            );
        },

        // single
        initContainer: function () {

            var selection,
                container = this.container,
                dropdown = this.dropdown,
                idSuffix = nextUid(),
                elementLabel;

            if (this.opts.minimumResultsForSearch < 0) {
                this.showSearch(false);
            } else {
                this.showSearch(true);
            }

            this.selection = selection = container.find(".select2-choice");

            this.focusser = container.find(".select2-focusser");

            // add aria associations
            selection.find(".select2-chosen").attr("id", "select2-chosen-" + idSuffix);
            this.focusser.attr("aria-labelledby", "select2-chosen-" + idSuffix);
            this.results.attr("id", "select2-results-" + idSuffix);
            this.search.attr("aria-owns", "select2-results-" + idSuffix);

            // rewrite labels from original element to focusser
            this.focusser.attr("id", "s2id_autogen" + idSuffix);

            elementLabel = $("label[for='" + this.opts.element.attr("id") + "']");
            this.opts.element.on('focus.select2', this.bind(function () {
                this.focus();
            }));

            this.focusser.prev()
                .text(elementLabel.text())
                .attr('for', this.focusser.attr('id'));

            // Ensure the original element retains an accessible name
            var originalTitle = this.opts.element.attr("title");
            this.opts.element.attr("title", (originalTitle || elementLabel.text()));

            this.focusser.attr("tabindex", this.elementTabIndex);

            // write label for search field using the label from the focusser element
            this.search.attr("id", this.focusser.attr('id') + '_search');

            this.search.prev()
                .text($("label[for='" + this.focusser.attr('id') + "']").text())
                .attr('for', this.search.attr('id'));

            this.search.on("keydown", this.bind(function (e) {
                if (!this.isInterfaceEnabled()) return;

                // filter 229 keyCodes (input method editor is processing key input)
                if (229 == e.keyCode) return;

                if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
                    // prevent the page from scrolling
                    killEvent(e);
                    return;
                }

                switch (e.which) {
                    case KEY.UP:
                    case KEY.DOWN:
                        this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
                        killEvent(e);
                        return;
                    case KEY.ENTER:
                        this.selectHighlighted();
                        killEvent(e);
                        return;
                    case KEY.TAB:
                        this.selectHighlighted({noFocus: true});
                        return;
                    case KEY.ESC:
                        this.cancel(e);
                        killEvent(e);
                        return;
                }
            }));

            this.search.on("blur", this.bind(function (e) {
                // a workaround for chrome to keep the search field focussed when the scroll bar is used to scroll the dropdown.
                // without this the search field loses focus which is annoying
                if (document.activeElement === this.body.get(0)) {
                    window.setTimeout(this.bind(function () {
                        if (this.opened() && this.results && this.results.length > 1) {
                            this.search.focus();
                        }
                    }), 0);
                }
            }));

            this.focusser.on("keydown", this.bind(function (e) {
                if (!this.isInterfaceEnabled()) return;

                if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC) {
                    return;
                }

                if (this.opts.openOnEnter === false && e.which === KEY.ENTER) {
                    killEvent(e);
                    return;
                }

                if (e.which == KEY.DOWN || e.which == KEY.UP
                    || (e.which == KEY.ENTER && this.opts.openOnEnter)) {

                    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return;

                    this.open();
                    killEvent(e);
                    return;
                }

                if (e.which == KEY.DELETE || e.which == KEY.BACKSPACE) {
                    if (this.opts.allowClear) {
                        this.clear();
                    }
                    killEvent(e);
                    return;
                }
            }));


            installKeyUpChangeEvent(this.focusser);
            this.focusser.on("keyup-change input", this.bind(function (e) {
                if (this.opts.minimumResultsForSearch >= 0) {
                    e.stopPropagation();
                    if (this.opened()) return;
                    this.open();
                }
            }));

            selection.on("mousedown touchstart", "abbr", this.bind(function (e) {
                if (!this.isInterfaceEnabled()) {
                    return;
                }

                this.clear();
                killEventImmediately(e);
                this.close();

                if (this.selection) {
                    this.selection.focus();
                }
            }));

            selection.on("mousedown touchstart", this.bind(function (e) {
                // Prevent IE from generating a click event on the body
                reinsertElement(selection);

                if (!this.container.hasClass("select2-container-active")) {
                    this.opts.element.trigger($.Event("select2-focus"));
                }

                if (this.opened()) {
                    this.close();
                } else if (this.isInterfaceEnabled()) {
                    this.open();
                }

                killEvent(e);
            }));

            dropdown.on("mousedown touchstart", this.bind(function () {
                if (this.opts.shouldFocusInput(this)) {
                    this.search.focus();
                }
            }));

            selection.on("focus", this.bind(function (e) {
                killEvent(e);
            }));

            this.focusser.on("focus", this.bind(function () {
                if (!this.container.hasClass("select2-container-active")) {
                    this.opts.element.trigger($.Event("select2-focus"));
                }
                this.container.addClass("select2-container-active");
            })).on("blur", this.bind(function () {
                if (!this.opened()) {
                    this.container.removeClass("select2-container-active");
                    this.opts.element.trigger($.Event("select2-blur"));
                }
            }));
            this.search.on("focus", this.bind(function () {
                if (!this.container.hasClass("select2-container-active")) {
                    this.opts.element.trigger($.Event("select2-focus"));
                }
                this.container.addClass("select2-container-active");
            }));

            this.initContainerWidth();
            this.opts.element.hide();
            this.setPlaceholder();

        },

        // single
        clear: function (triggerChange) {
            var data = this.selection.data("select2-data");
            if (data) { // guard against queued quick consecutive clicks
                var evt = $.Event("select2-clearing");
                this.opts.element.trigger(evt);
                if (evt.isDefaultPrevented()) {
                    return;
                }
                var placeholderOption = this.getPlaceholderOption();
                this.opts.element.val(placeholderOption ? placeholderOption.val() : "");
                this.selection.find(".select2-chosen").empty();
                this.selection.removeData("select2-data");
                this.setPlaceholder();

                if (triggerChange !== false) {
                    this.opts.element.trigger({type: "select2-removed", val: this.id(data), choice: data});
                    this.triggerChange({removed: data});
                }
            }
        },

        /**
         * Sets selection based on source element's value
         */
        // single
        initSelection: function () {
            var selected;
            if (this.isPlaceholderOptionSelected()) {
                this.updateSelection(null);
                this.close();
                this.setPlaceholder();
            } else {
                var self = this;
                this.opts.initSelection.call(null, this.opts.element, function (selected) {
                    if (selected !== undefined && selected !== null) {
                        self.updateSelection(selected);
                        self.close();
                        self.setPlaceholder();
                        self.lastSearchTerm = self.search.val();
                    }
                });
            }
        },

        isPlaceholderOptionSelected: function () {
            var placeholderOption;
            if (this.getPlaceholder() === undefined) return false; // no placeholder specified so no option should be considered
            return ((placeholderOption = this.getPlaceholderOption()) !== undefined && placeholderOption.prop("selected"))
                || (this.opts.element.val() === "")
                || (this.opts.element.val() === undefined)
                || (this.opts.element.val() === null);
        },

        // single
        prepareOpts: function () {
            var opts = this.parent.prepareOpts.apply(this, arguments),
                self = this;

            if (opts.element.get(0).tagName.toLowerCase() === "select") {
                // install the selection initializer
                opts.initSelection = function (element, callback) {
                    var selected = element.find("option").filter(function () {
                        return this.selected && !this.disabled
                    });
                    // a single select box always has a value, no need to null check 'selected'
                    callback(self.optionToData(selected));
                };
            } else if ("data" in opts) {
                // install default initSelection when applied to hidden input and data is local
                opts.initSelection = opts.initSelection || function (element, callback) {
                        var id = element.val();
                        //search in data by id, storing the actual matching item
                        var match = null;
                        opts.query({
                            matcher: function (term, text, el) {
                                var is_match = equal(id, opts.id(el));
                                if (is_match) {
                                    match = el;
                                }
                                return is_match;
                            },
                            callback: !$.isFunction(callback) ? $.noop : function () {
                                callback(match);
                            }
                        });
                    };
            }

            return opts;
        },

        // single
        getPlaceholder: function () {
            // if a placeholder is specified on a single select without a valid placeholder option ignore it
            if (this.select) {
                if (this.getPlaceholderOption() === undefined) {
                    return undefined;
                }
            }

            return this.parent.getPlaceholder.apply(this, arguments);
        },

        // single
        setPlaceholder: function () {
            var placeholder = this.getPlaceholder();

            if (this.isPlaceholderOptionSelected() && placeholder !== undefined) {

                // check for a placeholder option if attached to a select
                if (this.select && this.getPlaceholderOption() === undefined) return;

                this.selection.find(".select2-chosen").html(this.opts.escapeMarkup(placeholder));

                this.selection.addClass("select2-default");

                this.container.removeClass("select2-allowclear");
            }
        },

        // single
        postprocessResults: function (data, initial, noHighlightUpdate) {
            var selected = 0, self = this, showSearchInput = true;

            // find the selected element in the result list

            this.findHighlightableChoices().each2(function (i, elm) {
                if (equal(self.id(elm.data("select2-data")), self.opts.element.val())) {
                    selected = i;
                    return false;
                }
            });

            // and highlight it
            if (noHighlightUpdate !== false) {
                if (initial === true && selected >= 0) {
                    this.highlight(selected);
                } else {
                    this.highlight(0);
                }
            }

            // hide the search box if this is the first we got the results and there are enough of them for search

            if (initial === true) {
                var min = this.opts.minimumResultsForSearch;
                if (min >= 0) {
                    this.showSearch(countResults(data.results) >= min);
                }
            }
        },

        // single
        showSearch: function (showSearchInput) {
            if (this.showSearchInput === showSearchInput) return;

            this.showSearchInput = showSearchInput;

            this.dropdown.find(".select2-search").toggleClass("select2-search-hidden", !showSearchInput);
            this.dropdown.find(".select2-search").toggleClass("select2-offscreen", !showSearchInput);
            //add "select2-with-searchbox" to the container if search box is shown
            $(this.dropdown, this.container).toggleClass("select2-with-searchbox", showSearchInput);
        },

        // single
        onSelect: function (data, options) {

            if (!this.triggerSelect(data)) {
                return;
            }

            var old = this.opts.element.val(),
                oldData = this.data();

            this.opts.element.val(this.id(data));
            this.updateSelection(data);

            this.opts.element.trigger({type: "select2-selected", val: this.id(data), choice: data});

            this.lastSearchTerm = this.search.val();
            this.close();

            if ((!options || !options.noFocus) && this.opts.shouldFocusInput(this)) {
                this.focusser.focus();
            }

            if (!equal(old, this.id(data))) {
                this.triggerChange({added: data, removed: oldData});
            }
        },

        // single
        updateSelection: function (data) {

            var container = this.selection.find(".select2-chosen"), formatted, cssClass;

            this.selection.data("select2-data", data);

            container.empty();
            if (data !== null) {
                formatted = this.opts.formatSelection(data, container, this.opts.escapeMarkup);
            }
            if (formatted !== undefined) {
                container.append(formatted);
            }
            cssClass = this.opts.formatSelectionCssClass(data, container);
            if (cssClass !== undefined) {
                container.addClass(cssClass);
            }

            this.selection.removeClass("select2-default");

            if (this.opts.allowClear && this.getPlaceholder() !== undefined) {
                this.container.addClass("select2-allowclear");
            }
        },

        // single
        val: function () {
            var val,
                triggerChange = false,
                data = null,
                self = this,
                oldData = this.data();

            if (arguments.length === 0) {
                return this.opts.element.val();
            }

            val = arguments[0];

            if (arguments.length > 1) {
                triggerChange = arguments[1];

                if (this.opts.debug && console && console.warn) {
                    console.warn(
                        'Select2: The second option to `select2("val")` is not supported in Select2 4.0.0. ' +
                        'The `change` event will always be triggered in 4.0.0.'
                    );
                }
            }

            if (this.select) {
                if (this.opts.debug && console && console.warn) {
                    console.warn(
                        'Select2: Setting the value on a <select> using `select2("val")` is no longer supported in 4.0.0. ' +
                        'You can use the `.val(newValue).trigger("change")` method provided by jQuery instead.'
                    );
                }

                this.select
                    .val(val)
                    .find("option").filter(function () {
                        return this.selected
                    }).each2(function (i, elm) {
                        data = self.optionToData(elm);
                        return false;
                    });
                this.updateSelection(data);
                this.setPlaceholder();
                if (triggerChange) {
                    this.triggerChange({added: data, removed: oldData});
                }
            } else {
                // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
                if (!val && val !== 0) {
                    this.clear(triggerChange);
                    return;
                }
                if (this.opts.initSelection === undefined) {
                    throw new Error("cannot call val() if initSelection() is not defined");
                }
                this.opts.element.val(val);
                this.opts.initSelection(this.opts.element, function (data) {
                    self.opts.element.val(!data ? "" : self.id(data));
                    self.updateSelection(data);
                    self.setPlaceholder();
                    if (triggerChange) {
                        self.triggerChange({added: data, removed: oldData});
                    }
                });
            }
        },

        // single
        clearSearch: function () {
            this.search.val("");
            this.focusser.val("");
        },

        // single
        data: function (value) {
            var data,
                triggerChange = false;

            if (arguments.length === 0) {
                data = this.selection.data("select2-data");
                if (data == undefined) data = null;
                return data;
            } else {
                if (this.opts.debug && console && console.warn) {
                    console.warn(
                        'Select2: The `select2("data")` method can no longer set selected values in 4.0.0, ' +
                        'consider using the `.val()` method instead.'
                    );
                }

                if (arguments.length > 1) {
                    triggerChange = arguments[1];
                }
                if (!value) {
                    this.clear(triggerChange);
                } else {
                    data = this.data();
                    this.opts.element.val(!value ? "" : this.id(value));
                    this.updateSelection(value);
                    if (triggerChange) {
                        this.triggerChange({added: value, removed: data});
                    }
                }
            }
        }
    });

    MultiSelect2 = clazz(AbstractSelect2, {

        // multi
        createContainer: function () {
            var container = $(document.createElement("div")).attr({
                "class": "select2-container select2-container-multi"
            }).html([
                "<ul class='select2-choices'>",
                "  <li class='select2-search-field'>",
                "    <label for='' class='select2-offscreen'></label>",
                "    <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input'>",
                "  </li>",
                "</ul>",
                "<div class='select2-drop select2-drop-multi select2-display-none'>",
                "   <ul class='select2-results'>",
                "   </ul>",
                "</div>"].join(""));
            return container;
        },

        // multi
        prepareOpts: function () {
            var opts = this.parent.prepareOpts.apply(this, arguments),
                self = this;

            // TODO validate placeholder is a string if specified
            if (opts.element.get(0).tagName.toLowerCase() === "select") {
                // install the selection initializer
                opts.initSelection = function (element, callback) {

                    var data = [];

                    element.find("option").filter(function () {
                        return this.selected && !this.disabled
                    }).each2(function (i, elm) {
                        data.push(self.optionToData(elm));
                    });
                    callback(data);
                };
            } else if ("data" in opts) {
                // install default initSelection when applied to hidden input and data is local
                opts.initSelection = opts.initSelection || function (element, callback) {
                        var ids = splitVal(element.val(), opts.separator, opts.transformVal);
                        //search in data by array of ids, storing matching items in a list
                        var matches = [];
                        opts.query({
                            matcher: function (term, text, el) {
                                var is_match = $.grep(ids, function (id) {
                                    return equal(id, opts.id(el));
                                }).length;
                                if (is_match) {
                                    matches.push(el);
                                }
                                return is_match;
                            },
                            callback: !$.isFunction(callback) ? $.noop : function () {
                                // reorder matches based on the order they appear in the ids array because right now
                                // they are in the order in which they appear in data array
                                var ordered = [];
                                for (var i = 0; i < ids.length; i++) {
                                    var id = ids[i];
                                    for (var j = 0; j < matches.length; j++) {
                                        var match = matches[j];
                                        if (equal(id, opts.id(match))) {
                                            ordered.push(match);
                                            matches.splice(j, 1);
                                            break;
                                        }
                                    }
                                }
                                callback(ordered);
                            }
                        });
                    };
            }

            return opts;
        },

        // multi
        selectChoice: function (choice) {

            var selected = this.container.find(".select2-search-choice-focus");
            if (selected.length && choice && choice[0] == selected[0]) {

            } else {
                if (selected.length) {
                    this.opts.element.trigger("choice-deselected", selected);
                }
                selected.removeClass("select2-search-choice-focus");
                if (choice && choice.length) {
                    this.close();
                    choice.addClass("select2-search-choice-focus");
                    this.opts.element.trigger("choice-selected", choice);
                }
            }
        },

        // multi
        destroy: function () {
            $("label[for='" + this.search.attr('id') + "']")
                .attr('for', this.opts.element.attr("id"));
            this.parent.destroy.apply(this, arguments);

            cleanupJQueryElements.call(this,
                "searchContainer",
                "selection"
            );
        },

        // multi
        initContainer: function () {

            var selector = ".select2-choices", selection;

            this.searchContainer = this.container.find(".select2-search-field");
            this.selection = selection = this.container.find(selector);

            var _this = this;
            this.selection.on("click", ".select2-container:not(.select2-container-disabled) .select2-search-choice:not(.select2-locked)", function (e) {
                _this.search[0].focus();
                _this.selectChoice($(this));
            });

            // rewrite labels from original element to focusser
            this.search.attr("id", "s2id_autogen" + nextUid());

            this.search.prev()
                .text($("label[for='" + this.opts.element.attr("id") + "']").text())
                .attr('for', this.search.attr('id'));
            this.opts.element.on('focus.select2', this.bind(function () {
                this.focus();
            }));

            this.search.on("input paste", this.bind(function () {
                if (this.search.attr('placeholder') && this.search.val().length == 0) return;
                if (!this.isInterfaceEnabled()) return;
                if (!this.opened()) {
                    this.open();
                }
            }));

            this.search.attr("tabindex", this.elementTabIndex);

            this.keydowns = 0;
            this.search.on("keydown", this.bind(function (e) {
                if (!this.isInterfaceEnabled()) return;

                ++this.keydowns;
                var selected = selection.find(".select2-search-choice-focus");
                var prev = selected.prev(".select2-search-choice:not(.select2-locked)");
                var next = selected.next(".select2-search-choice:not(.select2-locked)");
                var pos = getCursorInfo(this.search);

                if (selected.length &&
                    (e.which == KEY.LEFT || e.which == KEY.RIGHT || e.which == KEY.BACKSPACE || e.which == KEY.DELETE || e.which == KEY.ENTER)) {
                    var selectedChoice = selected;
                    if (e.which == KEY.LEFT && prev.length) {
                        selectedChoice = prev;
                    }
                    else if (e.which == KEY.RIGHT) {
                        selectedChoice = next.length ? next : null;
                    }
                    else if (e.which === KEY.BACKSPACE) {
                        if (this.unselect(selected.first())) {
                            this.search.width(10);
                            selectedChoice = prev.length ? prev : next;
                        }
                    } else if (e.which == KEY.DELETE) {
                        if (this.unselect(selected.first())) {
                            this.search.width(10);
                            selectedChoice = next.length ? next : null;
                        }
                    } else if (e.which == KEY.ENTER) {
                        selectedChoice = null;
                    }

                    this.selectChoice(selectedChoice);
                    killEvent(e);
                    if (!selectedChoice || !selectedChoice.length) {
                        this.open();
                    }
                    return;
                } else if (((e.which === KEY.BACKSPACE && this.keydowns == 1)
                    || e.which == KEY.LEFT) && (pos.offset == 0 && !pos.length)) {

                    this.selectChoice(selection.find(".select2-search-choice:not(.select2-locked)").last());
                    killEvent(e);
                    return;
                } else {
                    this.selectChoice(null);
                }

                if (this.opened()) {
                    switch (e.which) {
                        case KEY.UP:
                        case KEY.DOWN:
                            this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
                            killEvent(e);
                            return;
                        case KEY.ENTER:
                            this.selectHighlighted();
                            killEvent(e);
                            return;
                        case KEY.TAB:
                            this.selectHighlighted({noFocus: true});
                            this.close();
                            return;
                        case KEY.ESC:
                            this.cancel(e);
                            killEvent(e);
                            return;
                    }
                }

                if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e)
                    || e.which === KEY.BACKSPACE || e.which === KEY.ESC) {
                    return;
                }

                if (e.which === KEY.ENTER) {
                    if (this.opts.openOnEnter === false) {
                        return;
                    } else if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
                        return;
                    }
                }

                this.open();

                if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
                    // prevent the page from scrolling
                    killEvent(e);
                }

                if (e.which === KEY.ENTER) {
                    // prevent form from being submitted
                    killEvent(e);
                }

            }));

            this.search.on("keyup", this.bind(function (e) {
                    this.keydowns = 0;
                    this.resizeSearch();
                })
            );

            this.search.on("blur", this.bind(function (e) {
                this.container.removeClass("select2-container-active");
                this.search.removeClass("select2-focused");
                this.selectChoice(null);
                if (!this.opened()) this.clearSearch();
                e.stopImmediatePropagation();
                this.opts.element.trigger($.Event("select2-blur"));
            }));

            this.container.on("click", selector, this.bind(function (e) {
                if (!this.isInterfaceEnabled()) return;
                if ($(e.target).closest(".select2-search-choice").length > 0) {
                    // clicked inside a select2 search choice, do not open
                    return;
                }
                this.selectChoice(null);
                this.clearPlaceholder();
                if (!this.container.hasClass("select2-container-active")) {
                    this.opts.element.trigger($.Event("select2-focus"));
                }
                this.open();
                this.focusSearch();
                e.preventDefault();
            }));

            this.container.on("focus", selector, this.bind(function () {
                if (!this.isInterfaceEnabled()) return;
                if (!this.container.hasClass("select2-container-active")) {
                    this.opts.element.trigger($.Event("select2-focus"));
                }
                this.container.addClass("select2-container-active");
                this.dropdown.addClass("select2-drop-active");
                this.clearPlaceholder();
            }));

            this.initContainerWidth();
            this.opts.element.hide();

            // set the placeholder if necessary
            this.clearSearch();
        },

        // multi
        enableInterface: function () {
            if (this.parent.enableInterface.apply(this, arguments)) {
                this.search.prop("disabled", !this.isInterfaceEnabled());
            }
        },

        // multi
        initSelection: function () {
            var data;
            if (this.opts.element.val() === "" && this.opts.element.text() === "") {
                this.updateSelection([]);
                this.close();
                // set the placeholder if necessary
                this.clearSearch();
            }
            if (this.select || this.opts.element.val() !== "") {
                var self = this;
                this.opts.initSelection.call(null, this.opts.element, function (data) {
                    if (data !== undefined && data !== null) {
                        self.updateSelection(data);
                        self.close();
                        // set the placeholder if necessary
                        self.clearSearch();
                    }
                });
            }
        },

        // multi
        clearSearch: function () {
            var placeholder = this.getPlaceholder(),
                maxWidth = this.getMaxSearchWidth();

            if (placeholder !== undefined && this.getVal().length === 0 && this.search.hasClass("select2-focused") === false) {
                this.search.val(placeholder).addClass("select2-default");
                // stretch the search box to full width of the container so as much of the placeholder is visible as possible
                // we could call this.resizeSearch(), but we do not because that requires a sizer and we do not want to create one so early because of a firefox bug, see #944
                this.search.width(maxWidth > 0 ? maxWidth : this.container.css("width"));
            } else {
                this.search.val("").width(10);
            }
        },

        // multi
        clearPlaceholder: function () {
            if (this.search.hasClass("select2-default")) {
                this.search.val("").removeClass("select2-default");
            }
        },

        // multi
        opening: function () {
            this.clearPlaceholder(); // should be done before super so placeholder is not used to search
            this.resizeSearch();

            this.parent.opening.apply(this, arguments);

            this.focusSearch();

            this.prefillNextSearchTerm();
            this.updateResults(true);

            if (this.opts.shouldFocusInput(this)) {
                this.search.focus();
            }
            this.opts.element.trigger($.Event("select2-open"));
        },

        // multi
        close: function () {
            if (!this.opened()) return;
            this.parent.close.apply(this, arguments);
        },

        // multi
        focus: function () {
            this.close();
            this.search.focus();
        },

        // multi
        isFocused: function () {
            return this.search.hasClass("select2-focused");
        },

        // multi
        updateSelection: function (data) {
            var ids = {}, filtered = [], self = this;

            // filter out duplicates
            $(data).each(function () {
                if (!(self.id(this) in ids)) {
                    ids[self.id(this)] = 0;
                    filtered.push(this);
                }
            });

            this.selection.find(".select2-search-choice").remove();
            this.addSelectedChoice(filtered);
            self.postprocessResults();
        },

        // multi
        tokenize: function () {
            var input = this.search.val();
            input = this.opts.tokenizer.call(this, input, this.data(), this.bind(this.onSelect), this.opts);
            if (input != null && input != undefined) {
                this.search.val(input);
                if (input.length > 0) {
                    this.open();
                }
            }

        },

        // multi
        onSelect: function (data, options) {

            if (!this.triggerSelect(data) || data.text === "") {
                return;
            }

            this.addSelectedChoice(data);

            this.opts.element.trigger({type: "selected", val: this.id(data), choice: data});

            // keep track of the search's value before it gets cleared
            this.lastSearchTerm = this.search.val();

            this.clearSearch();
            this.updateResults();

            if (this.select || !this.opts.closeOnSelect) this.postprocessResults(data, false, this.opts.closeOnSelect === true);

            if (this.opts.closeOnSelect) {
                this.close();
                this.search.width(10);
            } else {
                if (this.countSelectableResults() > 0) {
                    this.search.width(10);
                    this.resizeSearch();
                    if (this.getMaximumSelectionSize() > 0 && this.val().length >= this.getMaximumSelectionSize()) {
                        // if we reached max selection size repaint the results so choices
                        // are replaced with the max selection reached message
                        this.updateResults(true);
                    } else {
                        // initializes search's value with nextSearchTerm and update search result
                        if (this.prefillNextSearchTerm()) {
                            this.updateResults();
                        }
                    }
                    this.positionDropdown();
                } else {
                    // if nothing left to select close
                    this.close();
                    this.search.width(10);
                }
            }

            // since its not possible to select an element that has already been
            // added we do not need to check if this is a new element before firing change
            this.triggerChange({added: data});

            if (!options || !options.noFocus)
                this.focusSearch();
        },

        // multi
        cancel: function () {
            this.close();
            this.focusSearch();
        },

        addSelectedChoice: function (data) {
            var val = this.getVal(), self = this;
            $(data).each(function () {
                val.push(self.createChoice(this));
            });
            this.setVal(val);
        },

        createChoice: function (data) {
            var enableChoice = !data.locked,
                enabledItem = $(
                    "<li class='select2-search-choice'>" +
                    "    <div></div>" +
                    "    <a href='#' class='select2-search-choice-close' tabindex='-1'></a>" +
                    "</li>"),
                disabledItem = $(
                    "<li class='select2-search-choice select2-locked'>" +
                    "<div></div>" +
                    "</li>");
            var choice = enableChoice ? enabledItem : disabledItem,
                id = this.id(data),
                formatted,
                cssClass;

            formatted = this.opts.formatSelection(data, choice.find("div"), this.opts.escapeMarkup);
            if (formatted != undefined) {
                choice.find("div").replaceWith($("<div></div>").html(formatted));
            }
            cssClass = this.opts.formatSelectionCssClass(data, choice.find("div"));
            if (cssClass != undefined) {
                choice.addClass(cssClass);
            }

            if (enableChoice) {
                choice.find(".select2-search-choice-close")
                    .on("mousedown", killEvent)
                    .on("click dblclick", this.bind(function (e) {
                        if (!this.isInterfaceEnabled()) return;

                        this.unselect($(e.target));
                        this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
                        killEvent(e);
                        this.close();
                        this.focusSearch();
                    })).on("focus", this.bind(function () {
                        if (!this.isInterfaceEnabled()) return;
                        this.container.addClass("select2-container-active");
                        this.dropdown.addClass("select2-drop-active");
                    }));
            }

            choice.data("select2-data", data);
            choice.insertBefore(this.searchContainer);

            return id;
        },

        // multi
        unselect: function (selected) {
            var val = this.getVal(),
                data,
                index;
            selected = selected.closest(".select2-search-choice");

            if (selected.length === 0) {
                throw "Invalid argument: " + selected + ". Must be .select2-search-choice";
            }

            data = selected.data("select2-data");

            if (!data) {
                // prevent a race condition when the 'x' is clicked really fast repeatedly the event can be queued
                // and invoked on an element already removed
                return;
            }

            var evt = $.Event("select2-removing");
            evt.val = this.id(data);
            evt.choice = data;
            this.opts.element.trigger(evt);

            if (evt.isDefaultPrevented()) {
                return false;
            }

            while ((index = indexOf(this.id(data), val)) >= 0) {
                val.splice(index, 1);
                this.setVal(val);
                if (this.select) this.postprocessResults();
            }

            selected.remove();

            this.opts.element.trigger({type: "select2-removed", val: this.id(data), choice: data});
            this.triggerChange({removed: data});

            return true;
        },

        // multi
        postprocessResults: function (data, initial, noHighlightUpdate) {
            var val = this.getVal(),
                choices = this.results.find(".select2-result"),
                compound = this.results.find(".select2-result-with-children"),
                self = this;

            choices.each2(function (i, choice) {
                var id = self.id(choice.data("select2-data"));
                if (indexOf(id, val) >= 0) {
                    choice.addClass("select2-selected");
                    // mark all children of the selected parent as selected
                    choice.find(".select2-result-selectable").addClass("select2-selected");
                }
            });

            compound.each2(function (i, choice) {
                // hide an optgroup if it doesn't have any selectable children
                if (!choice.is('.select2-result-selectable')
                    && choice.find(".select2-result-selectable:not(.select2-selected)").length === 0) {
                    choice.addClass("select2-selected");
                }
            });

            if (this.highlight() == -1 && noHighlightUpdate !== false && this.opts.closeOnSelect === true) {
                self.highlight(0);
            }

            //If all results are chosen render formatNoMatches
            if (!this.opts.createSearchChoice && !choices.filter('.select2-result:not(.select2-selected)').length > 0) {
                if (!data || data && !data.more && this.results.find(".select2-no-results").length === 0) {
                    if (checkFormatter(self.opts.formatNoMatches, "formatNoMatches")) {
                        this.results.append("<li class='select2-no-results'>" + evaluate(self.opts.formatNoMatches, self.opts.element, self.search.val()) + "</li>");
                    }
                }
            }

        },

        // multi
        getMaxSearchWidth: function () {
            return this.selection.width() - getSideBorderPadding(this.search);
        },

        // multi
        resizeSearch: function () {
            var minimumWidth, left, maxWidth, containerLeft, searchWidth,
                sideBorderPadding = getSideBorderPadding(this.search);

            minimumWidth = measureTextWidth(this.search) + 10;

            left = this.search.offset().left;

            maxWidth = this.selection.width();
            containerLeft = this.selection.offset().left;

            searchWidth = maxWidth - (left - containerLeft) - sideBorderPadding;

            if (searchWidth < minimumWidth) {
                searchWidth = maxWidth - sideBorderPadding;
            }

            if (searchWidth < 40) {
                searchWidth = maxWidth - sideBorderPadding;
            }

            if (searchWidth <= 0) {
                searchWidth = minimumWidth;
            }

            this.search.width(Math.floor(searchWidth));
        },

        // multi
        getVal: function () {
            var val;
            if (this.select) {
                val = this.select.val();
                return val === null ? [] : val;
            } else {
                val = this.opts.element.val();
                return splitVal(val, this.opts.separator, this.opts.transformVal);
            }
        },

        // multi
        setVal: function (val) {
            if (this.select) {
                this.select.val(val);
            } else {
                var unique = [], valMap = {};
                // filter out duplicates
                $(val).each(function () {
                    if (!(this in valMap)) {
                        unique.push(this);
                        valMap[this] = 0;
                    }
                });
                this.opts.element.val(unique.length === 0 ? "" : unique.join(this.opts.separator));
            }
        },

        // multi
        buildChangeDetails: function (old, current) {
            var current = current.slice(0),
                old = old.slice(0);

            // remove intersection from each array
            for (var i = 0; i < current.length; i++) {
                for (var j = 0; j < old.length; j++) {
                    if (equal(this.opts.id(current[i]), this.opts.id(old[j]))) {
                        current.splice(i, 1);
                        i--;
                        old.splice(j, 1);
                        break;
                    }
                }
            }

            return {added: current, removed: old};
        },


        // multi
        val: function (val, triggerChange) {
            var oldData, self = this;

            if (arguments.length === 0) {
                return this.getVal();
            }

            oldData = this.data();
            if (!oldData.length) oldData = [];

            // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
            if (!val && val !== 0) {
                this.opts.element.val("");
                this.updateSelection([]);
                this.clearSearch();
                if (triggerChange) {
                    this.triggerChange({added: this.data(), removed: oldData});
                }
                return;
            }

            // val is a list of ids
            this.setVal(val);

            if (this.select) {
                this.opts.initSelection(this.select, this.bind(this.updateSelection));
                if (triggerChange) {
                    this.triggerChange(this.buildChangeDetails(oldData, this.data()));
                }
            } else {
                if (this.opts.initSelection === undefined) {
                    throw new Error("val() cannot be called if initSelection() is not defined");
                }

                this.opts.initSelection(this.opts.element, function (data) {
                    var ids = $.map(data, self.id);
                    self.setVal(ids);
                    self.updateSelection(data);
                    self.clearSearch();
                    if (triggerChange) {
                        self.triggerChange(self.buildChangeDetails(oldData, self.data()));
                    }
                });
            }
            this.clearSearch();
        },

        // multi
        onSortStart: function () {
            if (this.select) {
                throw new Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");
            }

            // collapse search field into 0 width so its container can be collapsed as well
            this.search.width(0);
            // hide the container
            this.searchContainer.hide();
        },

        // multi
        onSortEnd: function () {

            var val = [], self = this;

            // show search and move it to the end of the list
            this.searchContainer.show();
            // make sure the search container is the last item in the list
            this.searchContainer.appendTo(this.searchContainer.parent());
            // since we collapsed the width in dragStarted, we resize it here
            this.resizeSearch();

            // update selection
            this.selection.find(".select2-search-choice").each(function () {
                val.push(self.opts.id($(this).data("select2-data")));
            });
            this.setVal(val);
            this.triggerChange();
        },

        // multi
        data: function (values, triggerChange) {
            var self = this, ids, old;
            if (arguments.length === 0) {
                return this.selection
                    .children(".select2-search-choice")
                    .map(function () {
                        return $(this).data("select2-data");
                    })
                    .get();
            } else {
                old = this.data();
                if (!values) {
                    values = [];
                }
                ids = $.map(values, function (e) {
                    return self.opts.id(e);
                });
                this.setVal(ids);
                this.updateSelection(values);
                this.clearSearch();
                if (triggerChange) {
                    this.triggerChange(this.buildChangeDetails(old, this.data()));
                }
            }
        }
    });

    $.fn.select2 = function () {

        var args = Array.prototype.slice.call(arguments, 0),
            opts,
            select2,
            method, value, multiple,
            allowedMethods = ["val", "destroy", "opened", "open", "close", "focus", "isFocused", "container", "dropdown", "onSortStart", "onSortEnd", "enable", "disable", "readonly", "positionDropdown", "data", "search"],
            valueMethods = ["opened", "isFocused", "container", "dropdown"],
            propertyMethods = ["val", "data"],
            methodsMap = {search: "externalSearch"};

        this.each(function () {
            if (args.length === 0 || typeof(args[0]) === "object") {
                opts = args.length === 0 ? {} : $.extend({}, args[0]);
                opts.element = $(this);

                if (opts.element.get(0).tagName.toLowerCase() === "select") {
                    multiple = opts.element.prop("multiple");
                } else {
                    multiple = opts.multiple || false;
                    if ("tags" in opts) {
                        opts.multiple = multiple = true;
                    }
                }

                select2 = multiple ? new window.Select2["class"].multi() : new window.Select2["class"].single();
                select2.init(opts);
            } else if (typeof(args[0]) === "string") {

                if (indexOf(args[0], allowedMethods) < 0) {
                    throw "Unknown method: " + args[0];
                }

                value = undefined;
                select2 = $(this).data("select2");
                if (select2 === undefined) return;

                method = args[0];

                if (method === "container") {
                    value = select2.container;
                } else if (method === "dropdown") {
                    value = select2.dropdown;
                } else {
                    if (methodsMap[method]) method = methodsMap[method];

                    value = select2[method].apply(select2, args.slice(1));
                }
                if (indexOf(args[0], valueMethods) >= 0
                    || (indexOf(args[0], propertyMethods) >= 0 && args.length == 1)) {
                    return false; // abort the iteration, ready to return first matched value
                }
            } else {
                throw "Invalid arguments to select2 plugin: " + args;
            }
        });
        return (value === undefined) ? this : value;
    };

    // plugin defaults, accessible to users
    $.fn.select2.defaults = {
        debug: false,
        width: "copy",
        loadMorePadding: 0,
        closeOnSelect: true,
        openOnEnter: true,
        containerCss: {},
        dropdownCss: {},
        containerCssClass: "",
        dropdownCssClass: "",
        formatResult: function (result, container, query, escapeMarkup) {
            var markup = [];
            markMatch(this.text(result), query.term, markup, escapeMarkup);
            return markup.join("");
        },
        transformVal: function (val) {
            return $.trim(val);
        },
        formatSelection: function (data, container, escapeMarkup) {
            return data ? escapeMarkup(this.text(data)) : undefined;
        },
        sortResults: function (results, container, query) {
            return results;
        },
        formatResultCssClass: function (data) {
            return data.css;
        },
        formatSelectionCssClass: function (data, container) {
            return undefined;
        },
        minimumResultsForSearch: 0,
        minimumInputLength: 0,
        maximumInputLength: null,
        maximumSelectionSize: 0,
        id: function (e) {
            return e == undefined ? null : e.id;
        },
        text: function (e) {
            if (e && this.data && this.data.text) {
                if ($.isFunction(this.data.text)) {
                    return this.data.text(e);
                } else {
                    return e[this.data.text];
                }
            } else {
                return e.text;
            }
        },
        matcher: function (term, text) {
            return stripDiacritics('' + text).toUpperCase().indexOf(stripDiacritics('' + term).toUpperCase()) >= 0;
        },
        separator: ",",
        tokenSeparators: [],
        tokenizer: defaultTokenizer,
        escapeMarkup: defaultEscapeMarkup,
        blurOnChange: false,
        selectOnBlur: false,
        adaptContainerCssClass: function (c) {
            return c;
        },
        adaptDropdownCssClass: function (c) {
            return null;
        },
        nextSearchTerm: function (selectedObject, currentSearchTerm) {
            return undefined;
        },
        searchInputPlaceholder: '',
        createSearchChoicePosition: 'top',
        shouldFocusInput: function (instance) {
            // Attempt to detect touch devices
            var supportsTouchEvents = (('ontouchstart' in window) ||
            (navigator.msMaxTouchPoints > 0));

            // Only devices which support touch events should be special cased
            if (!supportsTouchEvents) {
                return true;
            }

            // Never focus the input if search is disabled
            if (instance.opts.minimumResultsForSearch < 0) {
                return false;
            }

            return true;
        }
    };

    $.fn.select2.locales = [];

    $.fn.select2.locales['en'] = {
        formatMatches: function (matches) {
            if (matches === 1) {
                return "One result is available, press enter to select it.";
            }
            return matches + " results are available, use up and down arrow keys to navigate.";
        },
        formatNoMatches: function () {
            return "No matches found";
        },
        formatAjaxError: function (jqXHR, textStatus, errorThrown) {
            return "Loading failed";
        },
        formatInputTooShort: function (input, min) {
            var n = min - input.length;
            return "Please enter " + n + " or more character" + (n == 1 ? "" : "s");
        },
        formatInputTooLong: function (input, max) {
            var n = input.length - max;
            return "Please delete " + n + " character" + (n == 1 ? "" : "s");
        },
        formatSelectionTooBig: function (limit) {
            return "You can only select " + limit + " item" + (limit == 1 ? "" : "s");
        },
        formatLoadMore: function (pageNumber) {
            return "Loading more results…";
        },
        formatSearching: function () {
            return "Searching…";
        }
    };

    $.extend($.fn.select2.defaults, $.fn.select2.locales['en']);

    $.fn.select2.ajaxDefaults = {
        transport: $.ajax,
        params: {
            type: "GET",
            cache: false,
            dataType: "json"
        }
    };

    // exports
    window.Select2 = {
        query: {
            ajax: ajax,
            local: local,
            tags: tags
        }, util: {
            debounce: debounce,
            markMatch: markMatch,
            escapeMarkup: defaultEscapeMarkup,
            stripDiacritics: stripDiacritics
        }, "class": {
            "abstract": AbstractSelect2,
            "single": SingleSelect2,
            "multi": MultiSelect2
        }
    };

}(jQuery));

/**
 * Select2 Chinese translation
 */
(function ($) {
    "use strict";
    $.fn.select2.locales['zh-CN'] = {
        formatNoMatches: function () {
            return "没有找到匹配项";
        },
        formatInputTooShort: function (input, min) {
            var n = min - input.length;
            return "请再输入" + n + "个字符";
        },
        formatInputTooLong: function (input, max) {
            var n = input.length - max;
            return "请删掉" + n + "个字符";
        },
        formatSelectionTooBig: function (limit) {
            return "你只能选择最多" + limit + "项";
        },
        formatLoadMore: function (pageNumber) {
            return "加载结果中…";
        },
        formatSearching: function () {
            return "搜索中…";
        }
    };

    $.extend($.fn.select2.defaults, $.fn.select2.locales['zh-CN']);
})(jQuery);

///<jscompress sourcefile="crop.org.tree.js" />
/**
 * @description {Class} wdTree
 * This is the main class of wdTree.
 */
(function ($) {
    $.fn.swapClass = function (c1, c2) {
        return this.removeClass(c1).addClass(c2);
    };
    $.fn.switchClass = function (c1, c2) {
        if (this.hasClass(c1)) {
            return this.swapClass(c1, c2);
        }
        else {
            return this.swapClass(c2, c1);
        }
    };
    $.fn.treeview = function (settings) {
        // 补充checkedIds配置, 要求展示时, 将节点立即选中;linzp@zzsoft
        // 补充lockFilter, 表示是否要过滤掉'冻结'状态的节点, true过滤, false不过滤, 默认false
        // 补充invoker, 树调用者, 如果取值 batchCreateOU, 不展示勾选框
        var dfop =
        {
            method: "POST",
            datatype: "json",
            checkedIds: '',
            lockFilter: 'false',
            invoker: '',
            /**
             * @description {Config} url
             * {String} Url for child nodes retrieving.
             */
            url: false,
            /**
             * @description {Config} cbiconpath
             * {String} Checkbox image path.
             */
            cbiconpath: "../img/icons/",
            icons: ["checkbox_0.gif", "checkbox_1.gif", "checkbox_2.gif"],
            /**
             * @description {Config} showcheck
             * {Boolean} Whether to show check box or not.
             */
            showcheck: false,
            /**
             * @description {Event} oncheckboxclick:function(tree, item, status)
             * Fired when check box is clicked on.
             * @param {Object} tree This tree object.
             * @param {Object} item Node item clicked on.
             * @param {Number} status 1 for checked, 0 for unchecked.
             */
            oncheckboxclick: false,
            /**
             * @description {Event} onnodeclick:function(tree, item)
             * Fired when a node is clicked on.
             * @param {Object} tree This tree object.
             * @param {Object} item Ndde item clicked on.
             */
            onnodeclick: false,
            /**
             * @description {Config} cascadecheck
             * {Boolean} Whether node being seleted leads to parent/sub node being selected.
             */
            cascadecheck: true,
            /**
             * @description {Config} data
             * {Object} Tree theme. Three themes provided. 'bbit-tree-lines' ,'bbit-tree-no-lines' and 'bbit-tree-arrows'.
             * @sample
             * data:[{
                 * id:"node1", //node id
                 * text:"node 1", //node text for display.
                 * value:"1", //node value
                 * showcheck:false, //whether to show checkbox
                 * checkstate:0, //Checkbox checking state. 0 for unchecked, 1 for partial checked, 2 for checked.
                 * hasChildren:true, //If hasChildren and complete set to true, and ChildNodes is empty, tree will request server to get sub node.
                 * isexpand:false, //Expand or collapse.
                 * complete:false, //See hasChildren.
                 * ChildNodes:[] // child nodes
                 * }]
             *  */
            data: null,
            /**
             * @description {Config} clicktoggle
             * {String} Whether to toggle node when node clicked.
             */
            clicktoggle: true,
            /**
             * @description {Config} theme
             * {String} Tree theme. Three themes provided. 'bbit-tree-lines' ,'bbit-tree-no-lines' and 'bbit-tree-arrows'.
             */
            theme: "bbit-tree-lines" //bbit-tree-lines ,bbit-tree-no-lines,bbit-tree-arrows
        };

        $.extend(dfop, settings);
        var treenodes = dfop.data;
        var me = $(this);
        var id = me.attr("id");
        if (id == null || id == "") {
            id = "bbtree" + new Date().getTime();
            me.attr("id", id);
        }

        var html = [];
        buildtree(dfop.data, html);
        me.addClass("bbit-tree").html(html.join(""));
        InitEvent(me);
        html = null;
        //pre load the icons
        if (dfop.showcheck) {
            for (var i = 0; i < 3; i++) {
                var im = new Image();
                im.src = dfop.cbiconpath + dfop.icons[i];
            }
        }

        //region 
        function buildtree(data, ht) {
            ht.push("<div class='bbit-tree-bwrap'>"); // Wrap ;
            ht.push("<div class='bbit-tree-body'>"); // body ;
            ht.push("<ul class='bbit-tree-root ", dfop.theme, "'>"); //root
            if (data && data.length > 0) {
                var l = data.length;
                for (var i = 0; i < l; i++) {
                    buildnode(data[i], ht, 0, i, i == l - 1);
                }
            }
            else {
                asnyloadc(null, false, function (data) {
                    if (data && data.length > 0) {
                        treenodes = data;
                        dfop.data = data;
                        var l = data.length;
                        for (var i = 0; i < l; i++) {
                            buildnode(data[i], ht, 0, i, i == l - 1);
                        }
                    }
                });
            }
            ht.push("</ul>"); // root and;
            ht.push("</div>"); // body end;
            ht.push("</div>"); // Wrap end;
        }

        //endregion
        function buildnode(nd, ht, deep, path, isend) {

            // 如果入参中指定选中, 则强制将选中状态改为2, linzp@zzsoft
            if (dfop.checkedIds && dfop.checkedIds.split(",").indexOf(nd.value) != -1) {
                nd.checkstate = 1;
            }
            // 如果调用方来自ou批量创建, batchCreateOU , 并且ouId有值, 则不展示勾选框;品牌节点也不能勾选
            if (dfop.invoker == 'batchCreateOU' && (nd.ouId || nd.orgType == 0)) {
                nd.showcheck = false;
            }
            // 如果设置了只显示某些orgType才显示勾选框
            if (dfop.selectOnlyOrgType) {
                if (dfop.selectOnlyOrgType.split(",").indexOf(String(nd.orgType)) == -1) {
                    nd.showcheck = false;
                }
            }

            var nid = nd.id.replace(/[^\w]/gi, "_");
            ht.push("<li class='bbit-tree-node'>");
            ht.push("<div id='", id, "_", nid, "' tpath='", path, "' unselectable='on' title='", nd.text, "'");
            var cs = [];
            cs.push("bbit-tree-node-el");
            if (nd.hasChildren) {
                cs.push(nd.isexpand ? "bbit-tree-node-expanded" : "bbit-tree-node-collapsed");
            }
            else {
                cs.push("bbit-tree-node-leaf");
            }
            if (nd.classes) {
                cs.push(nd.classes);
            }

            ht.push(" class='", cs.join(" "), "'>");
            //span indent
            ht.push("<span class='bbit-tree-node-indent'>");
            if (deep == 1) {
                ht.push("<img class='bbit-tree-icon' src='" + dfop.cbiconpath + "s.gif'/>");
            }
            else if (deep > 1) {
                ht.push("<img class='bbit-tree-icon' src='" + dfop.cbiconpath + "s.gif'/>");
                for (var j = 1; j < deep; j++) {
                    ht.push("<img class='bbit-tree-elbow-line' src='" + dfop.cbiconpath + "/s.gif'/>");
                }
            }
            ht.push("</span>");
            //img
            cs.length = 0;
            if (nd.hasChildren) {
                if (nd.isexpand) {
                    cs.push(isend ? "bbit-tree-elbow-end-minus" : "bbit-tree-elbow-minus");
                }
                else {
                    cs.push(isend ? "bbit-tree-elbow-end-plus" : "bbit-tree-elbow-plus");
                }
            }
            else {
                cs.push(isend ? "bbit-tree-elbow-end" : "bbit-tree-elbow");
            }
            ht.push("<img class='bbit-tree-ec-icon ", cs.join(" "), "' src='" + dfop.cbiconpath + "s.gif'/>");
            // 根据组织类型,显示不同的图标
            var orgTypeCls = "";
            var orgTypeClsMap = {'0': 'brand', "1": "sls-area", "2": "dcomp", "5": "agt1", "6": "agt2", "9": "store"};
            orgTypeCls = orgTypeClsMap[nd.orgType];
            ht.push("<img class='bbit-tree-node-icon " + orgTypeCls + "' src='" + dfop.cbiconpath + "s.gif'/>");
            //checkbox
            if (dfop.showcheck && nd.showcheck) {
                if (nd.checkstate == null || nd.checkstate == undefined) {
                    nd.checkstate = 0;
                }
                ht.push("<img  id='", id, "_", nid, "_cb' class='bbit-tree-node-cb' src='", dfop.cbiconpath, dfop.icons[nd.checkstate], "'/>");
            }
            //a
            // 如果ouId存在, 将加上样式名为 ouId的样式, 样式在crop.org.tree.css中定义
            var ifOuIdCls = dfop.invoker == 'batchCreateOU' && nd.ouId ? " ouNode" : "";
            var ifLockNode = nd.status == "1" ? " lockNode" : "";

            ht.push("<a hideFocus class='bbit-tree-node-anchor' tabIndex=1 href='javascript:void(0);'>");
            ht.push("<span unselectable='on' class='" + ifOuIdCls + ifLockNode + "'>", nd.text, "</span>");
            ht.push("</a>");
            ht.push("</div>");
            //Child
            if (nd.hasChildren) {
                if (nd.isexpand) {
                    ht.push("<ul  class='bbit-tree-node-ct'  style='z-index: 0; position: static; visibility: visible; top: auto; left: auto;'>");
                    if (nd.ChildNodes) {
                        var l = nd.ChildNodes.length;
                        for (var k = 0; k < l; k++) {
                            nd.ChildNodes[k].parent = nd;
                            buildnode(nd.ChildNodes[k], ht, deep + 1, path + "." + k, k == l - 1);
                        }
                    }
                    ht.push("</ul>");
                }
                else {
                    ht.push("<ul style='display:none;'></ul>");
                }
            }
            ht.push("</li>");
            nd.render = true;
        }

        function getItem(path) {
            var ap = path.split(".");
            var t = treenodes;
            for (var i = 0; i < ap.length; i++) {
                if (i == 0) {
                    t = t[ap[i]];
                }
                else {
                    t = t.ChildNodes[ap[i]];
                }
            }
            return t;
        }

        function check(item, state, type) {
            var pstate = item.checkstate;
            if (type == 1) {
                item.checkstate = state;
            }
            else {// go to childnodes
                var cs = item.ChildNodes;
                var l = cs.length;
                var ch = true;
                for (var i = 0; i < l; i++) {
                    if ((state == 1 && cs[i].checkstate != 1) || state == 0 && cs[i].checkstate != 0) {
                        ch = false;
                        break;
                    }
                }
                if (ch) {
                    item.checkstate = state;
                }
                else {
                    item.checkstate = 2;
                }
            }
            //change show
            if (item.render && pstate != item.checkstate) {
                var nid = item.id.replace(/[^\w]/gi, "_");
                var et = $("#" + id + "_" + nid + "_cb");
                if (et.length == 1) {
                    et.attr("src", dfop.cbiconpath + dfop.icons[item.checkstate]);
                }
            }
        }

        //iterate all children nodes
        function cascade(fn, item, args) {
            if (fn(item, args, 1) != false) {
                if (item.ChildNodes != null && item.ChildNodes.length > 0) {
                    var cs = item.ChildNodes;
                    for (var i = 0, len = cs.length; i < len; i++) {
                        cascade(fn, cs[i], args);
                    }
                }
            }
        }

        //bubble to parent
        function bubble(fn, item, args) {
            var p = item.parent;
            while (p) {
                if (fn(p, args, 0) === false) {
                    break;
                }
                p = p.parent;
            }
        }

        function nodeclick(e) {
            var path = $(this).attr("tpath");
            var et = e.target || e.srcElement;
            var item = getItem(path);
            //alert(et.tagName);
            if (et.tagName == "IMG") {
                //+ if collapsed, expend it 
                if ($(et).hasClass("bbit-tree-elbow-plus") || $(et).hasClass("bbit-tree-elbow-end-plus")) {
                    var ul = $(this).next(); //"bbit-tree-node-ct"
                    if (ul.hasClass("bbit-tree-node-ct")) {
                        ul.show();
                    }
                    else {
                        var deep = path.split(".").length;
                        if (item.complete) {
                            item.ChildNodes != null && asnybuild(item.ChildNodes, deep, path, ul, item);
                        }
                        else {
                            $(this).addClass("bbit-tree-node-loading");
                            asnyloadc(item, true, function (data) {
                                item.complete = true;
                                item.ChildNodes = data;
                                asnybuild(data, deep, path, ul, item);
                            });
                        }
                    }
                    if ($(et).hasClass("bbit-tree-elbow-plus")) {
                        $(et).swapClass("bbit-tree-elbow-plus", "bbit-tree-elbow-minus");
                    }
                    else {
                        $(et).swapClass("bbit-tree-elbow-end-plus", "bbit-tree-elbow-end-minus");
                    }
                    $(this).swapClass("bbit-tree-node-collapsed", "bbit-tree-node-expanded");
                }
                //if expended, collapse it
                else if ($(et).hasClass("bbit-tree-elbow-minus") || $(et).hasClass("bbit-tree-elbow-end-minus")) {
                    $(this).next().hide();
                    if ($(et).hasClass("bbit-tree-elbow-minus")) {
                        $(et).swapClass("bbit-tree-elbow-minus", "bbit-tree-elbow-plus");
                    }
                    else {
                        $(et).swapClass("bbit-tree-elbow-end-minus", "bbit-tree-elbow-end-plus");
                    }
                    $(this).swapClass("bbit-tree-node-expanded", "bbit-tree-node-collapsed");
                }
                else if ($(et).hasClass("bbit-tree-node-cb")) // click on checkbox
                {
                    var s = item.checkstate != 1 ? 1 : 0;
                    var r = true;
                    if (dfop.oncheckboxclick) {
                        r = dfop.oncheckboxclick.call(et, item, s);
                    }
                    if (r != false) {
                        if (dfop.cascadecheck) {
                            cascade(check, item, s);
                            bubble(check, item, s);
                        }
                        else {
                            check(item, s, 1);
                        }
                    }
                }
            }
            else {
                if (dfop.citem) {
                    var nid = dfop.citem.id.replace(/[^\w]/gi, "_");
                    $("#" + id + "_" + nid).removeClass("bbit-tree-selected");
                    $("#" + id + "_" + nid).find("img.tree_node_1_cb").click();
                }
                dfop.citem = item;
                $(this).addClass("bbit-tree-selected");
                if (dfop.onnodeclick) {
                    if (!item.expand) {
                        item.expand = function () {
                            expandnode.call(item);
                        };
                    }
                    dfop.onnodeclick.call(this, item);
                }
            }
        }

        function expandnode() {
            var item = this;
            var nid = item.id.replace(/[^\w]/gi, "_");
            var img = $("#" + id + "_" + nid + " img.bbit-tree-ec-icon");
            if (img.length > 0) {
                img.click();
            }
        }

        function asnybuild(nodes, deep, path, ul, pnode) {
            var l = nodes.length;
            if (l > 0) {
                var ht = [];
                for (var i = 0; i < l; i++) {
                    nodes[i].parent = pnode;
                    buildnode(nodes[i], ht, deep, path + "." + i, i == l - 1);
                }
                ul.html(ht.join(""));
                ht = null;
                InitEvent(ul);
            }
            ul.addClass("bbit-tree-node-ct").css({
                "z-index": 0,
                position: "static",
                visibility: "visible",
                top: "auto",
                left: "auto",
                display: ""
            });
            ul.prev().removeClass("bbit-tree-node-loading");
        }

        function asnyloadc(pnode, isAsync, callback) {
            if (dfop.url) {
                var param = {};
                if (pnode && pnode != null) {
                    param = builparam(pnode);
                } else {
                    // 初始加载,指定根节点id
                    if (dfop.rootId) {
                        param.rootId = dfop.rootId;
                    }
                }
                $.ajax({
                    type: dfop.method,
                    url: dfop.url,
                    data: param,
                    async: isAsync,
                    dataType: dfop.datatype,
                    success: callback,
                    error: function (e) {
                        alert("error occur!");
                    }
                });
            }
        }

        // 提交的参数lockFilter,补充是否要过滤掉'冻结'状态的节点
        function builparam(node) {
            var p = [{name: "id", value: encodeURIComponent(node.id)}
                , {name: "text", value: encodeURIComponent(node.text)}
                , {name: "value", value: encodeURIComponent(node.value)}
                , {name: "lockFilter", value: dfop.lockFilter}
                , {name: "checkstate", value: node.checkstate}];
            return p;
        }

        function bindevent() {
            $(this).hover(function () {
                $(this).addClass("bbit-tree-node-over");
            }, function () {
                $(this).removeClass("bbit-tree-node-over");
            }).click(nodeclick)
                .find("img.bbit-tree-ec-icon").each(function (e) {
                    if (!$(this).hasClass("bbit-tree-elbow")) {
                        $(this).hover(function () {
                            $(this).parent().addClass("bbit-tree-ec-over");
                        }, function () {
                            $(this).parent().removeClass("bbit-tree-ec-over");
                        });
                    }
                });
        }

        function InitEvent(parent) {
            var nodes = $("li.bbit-tree-node>div", parent);
            nodes.each(bindevent);
        }

        function reflash(itemId) {
            var nid = itemId.replace(/[^\w-]/gi, "_");
            var node = $("#" + id + "_" + nid);
            if (node.length > 0) {
                node.addClass("bbit-tree-node-loading");
                var isend = node.hasClass("bbit-tree-elbow-end") || node.hasClass("bbit-tree-elbow-end-plus") || node.hasClass("bbit-tree-elbow-end-minus");
                var path = node.attr("tpath");
                var deep = path.split(".").length;
                var item = getItem(path);
                if (item) {
                    asnyloadc(item, true, function (data) {
                        item.complete = true;
                        item.ChildNodes = data;
                        item.isexpand = true;
                        if (data && data.length > 0) {
                            item.hasChildren = true;
                        }
                        else {
                            item.hasChildren = false;
                        }
                        var ht = [];
                        buildnode(item, ht, deep - 1, path, isend);
                        ht.shift();
                        ht.pop();
                        var li = node.parent();
                        li.html(ht.join(""));
                        ht = null;
                        InitEvent(li);
                        bindevent.call(li.find(">div"));
                    });
                }
            }
            else {
                //node not created yet
            }
        }

        function getck(items, c, fn) {
            for (var i = 0, l = items.length; i < l; i++) {
                (items[i].showcheck == true && items[i].checkstate == 1) && c.push(fn(items[i]));
                if (items[i].ChildNodes != null && items[i].ChildNodes.length > 0) {
                    getck(items[i].ChildNodes, c, fn);
                }
            }
        }

        function getCkAndHalfCk(items, c, fn) {
            for (var i = 0, l = items.length; i < l; i++) {
                (items[i].showcheck == true && (items[i].checkstate == 1 || items[i].checkstate == 2)) && c.push(fn(items[i]));
                if (items[i].ChildNodes != null && items[i].ChildNodes.length > 0) {
                    getCkAndHalfCk(items[i].ChildNodes, c, fn);
                }
            }
        }

        me[0].t = {
            getSelectedNodes: function (gethalfchecknode) {
                var s = [];
                if (gethalfchecknode) {
                    getCkAndHalfCk(treenodes, s, function (item) {
                        return item;
                    });
                }
                else {
                    getck(treenodes, s, function (item) {
                        return item;
                    });
                }
                return s;
            },
            getSelectedValues: function () {
                var s = [];
                getck(treenodes, s, function (item) {
                    return item.value;
                });
                return s;
            },
            getCurrentItem: function () {
                return dfop.citem;
            },
            reflash: function (itemOrItemId) {
                var id;
                if (typeof (itemOrItemId) == "string") {
                    id = itemOrItemId;
                }
                else {
                    id = itemOrItemId.id;
                }
                reflash(id);
            }
        };
        return me;
    };
    //get all checked nodes, and put them into array. no hierarchy
    $.fn.getCheckedNodes = function () {
        if (this[0].t) {
            return this[0].t.getSelectedValues();
        }
        return null;
    };
    $.fn.getTSNs = function (gethalfchecknode) {
        if (this[0].t) {
            return this[0].t.getSelectedNodes(gethalfchecknode);
        }
        return null;
    };
    $.fn.getCurrentNode = function () {
        if (this[0].t) {
            return this[0].t.getCurrentItem();
        }
        return null;
    };
    $.fn.reflash = function (ItemOrItemId) {
        if (this[0].t) {
            return this[0].t.reflash(ItemOrItemId);
        }
    };

})(jQuery);
///<jscompress sourcefile="bootbox.js" />
/**
 * bootbox.js [v4.2.0]
 *
 * http://bootboxjs.com/license.txt
 */

// @see https://github.com/makeusabrew/bootbox/issues/180
// @see https://github.com/makeusabrew/bootbox/issues/186
(function (root, factory) {

    "use strict";
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"));
    } else {
        // Browser globals (root is window)
        root.bootbox = factory(root.jQuery);
    }

}(this, function init($, undefined) {

    "use strict";

    // the base DOM structure needed to create a modal
    var templates = {
        dialog: "<div class='bootbox modal' tabindex='-1' role='dialog'>" + "<div class='modal-dialog'>" + "<div class='modal-content'>" + "<div class='modal-body'><div class='bootbox-body'></div></div>" + "</div>" + "</div>" + "</div>",
        header: "<div class='modal-header'>" + "<h4 class='modal-title'></h4>" + "</div>",
        footer: "<div class='modal-footer'></div>",
        closeButton: "<button type='button' class='bootbox-close-button close' data-dismiss='modal' aria-hidden='true'>&times;</button>",
        form: "<form class='bootbox-form'></form>",
        inputs: {
            text: "<input class='bootbox-input bootbox-input-text form-control' autocomplete=off type=text />",
            textarea: "<textarea class='bootbox-input bootbox-input-textarea form-control'></textarea>",
            email: "<input class='bootbox-input bootbox-input-email form-control' autocomplete='off' type='email' />",
            select: "<select class='bootbox-input bootbox-input-select form-control'></select>",
            checkbox: "<div class='checkbox'><label><input class='bootbox-input bootbox-input-checkbox' type='checkbox' /></label></div>",
            date: "<input class='bootbox-input bootbox-input-date form-control' autocomplete=off type='date' />",
            time: "<input class='bootbox-input bootbox-input-time form-control' autocomplete=off type='time' />",
            number: "<input class='bootbox-input bootbox-input-number form-control' autocomplete=off type='number' />",
            password: "<input class='bootbox-input bootbox-input-password form-control' autocomplete='off' type='password' />"
        }
    };

    var defaults = {
        // default language
        locale: "en",
        // show backdrop or not
        backdrop: true,
        // animate the modal in/out
        animate: true,
        // additional class string applied to the top level dialog
        className: null,

        sizeClassName: null,
        // whether or not to include a close button
        closeButton: true,
        // show the dialog immediately by default
        show: true,
        // dialog container
        container: "body"
    };

    // our public object; augmented after our private API
    var exports = {};

    /**
     * @private
     */

    function _t(key) {
        var locale = locales[defaults.locale];
        return locale ? locale[key] : locales.en[key];
    }

    function processCallback(e, dialog, callback) {
        e.stopPropagation();
        e.preventDefault();

        // by default we assume a callback will get rid of the dialog,
        // although it is given the opportunity to override this

        // so, if the callback can be invoked and it *explicitly returns false*
        // then we'll set a flag to keep the dialog active...
        var preserveDialog = $.isFunction(callback) && callback(e) === false;

        // ... otherwise we'll bin it
        if (!preserveDialog) {
            dialog.modal("hide");
        }
    }

    function getKeyLength(obj) {
        // @TODO defer to Object.keys(x).length if available?
        var k, t = 0;
        for (k in obj) {
            t++;
        }
        return t;
    }

    function each(collection, iterator) {
        var index = 0;
        $.each(collection, function (key, value) {
            iterator(key, value, index++);
        });
    }

    function sanitize(options) {
        var buttons;
        var total;

        if (typeof options !== "object") {
            throw new Error("Please supply an object of options");
        }

        if (!options.message) {
            throw new Error("Please specify a message");
        }

        // make sure any supplied options take precedence over defaults
        options = $.extend({}, defaults, options);

        if (!options.buttons) {
            options.buttons = {};
        }

        // we only support Bootstrap's "static" and false backdrop args
        // supporting true would mean you could dismiss the dialog without
        // explicitly interacting with it
        options.backdrop = options.backdrop ? "static" : false;

        buttons = options.buttons;

        total = getKeyLength(buttons);

        each(buttons, function (key, button, index) {

            if ($.isFunction(button)) {
                // short form, assume value is our callback. Since button
                // isn't an object it isn't a reference either so re-assign it
                button = buttons[key] = {
                    callback: button
                };
            }

            // before any further checks make sure by now button is the correct type
            if ($.type(button) !== "object") {
                throw new Error("button with key " + key + " must be an object");
            }

            if (!button.label) {
                // the lack of an explicit label means we'll assume the key is good enough
                button.label = key;
            }

            if (!button.className) {
                if (total <= 2 && index === total - 1) {
                    // always add a primary to the main option in a two-button dialog
                    button.className = "btn-primary";
                } else {
                    button.className = "btn-default";
                }
            }
        });

        return options;
    }

    /**
     * map a flexible set of arguments into a single returned object
     * if args.length is already one just return it, otherwise
     * use the properties argument to map the unnamed args to
     * object properties
     * so in the latter case:
     * mapArguments(["foo", $.noop], ["message", "callback"])
     * -> { message: "foo", callback: $.noop }
     */

    function mapArguments(args, properties) {
        var argn = args.length;
        var options = {};

        if (argn < 1 || argn > 2) {
            throw new Error("Invalid argument length");
        }

        if (argn === 2 || typeof args[0] === "string") {
            options[properties[0]] = args[0];
            options[properties[1]] = args[1];
        } else {
            options = args[0];
        }

        return options;
    }

    /**
     * merge a set of default dialog options with user supplied arguments
     */

    function mergeArguments(defaults, args, properties) {
        return $.extend(
            // deep merge
            true,
            // ensure the target is an empty, unreferenced object
            {},
            // the base options object for this type of dialog (often just buttons)
            defaults,
            // args could be an object or array; if it's an array properties will
            // map it to a proper options object
            mapArguments(
                args,
                properties
            )
        );
    }

    /**
     * this entry-level method makes heavy use of composition to take a simple
     * range of inputs and return valid options suitable for passing to bootbox.dialog
     */

    function mergeDialogOptions(className, labels, properties, args) {
        //  build up a base set of dialog properties
        var baseOptions = {
            className: "bootbox-" + className,
            buttons: createLabels.apply(null, labels)
        };

        // ensure the buttons properties generated, *after* merging
        // with user args are still valid against the supplied labels
        return validateButtons(
            // merge the generated base properties with user supplied arguments
            mergeArguments(
                baseOptions,
                args,
                // if args.length > 1, properties specify how each arg maps to an object key
                properties
            ),
            labels
        );
    }

    /**
     * from a given list of arguments return a suitable object of button labels
     * all this does is normalise the given labels and translate them where possible
     * e.g. "ok", "confirm" -> { ok: "OK, cancel: "Annuleren" }
     */

    function createLabels() {
        var buttons = {};

        for (var i = 0, j = arguments.length; i < j; i++) {
            var argument = arguments[i];
            var key = argument.toLowerCase();
            var value = argument.toUpperCase();

            buttons[key] = {
                label: _t(value)
            };
        }

        return buttons;
    }

    function validateButtons(options, buttons) {
        var allowedButtons = {};
        each(buttons, function (key, value) {
            allowedButtons[value] = true;
        });

        each(options.buttons, function (key) {
            if (allowedButtons[key] === undefined) {
                throw new Error("button key " + key + " is not allowed (options are " + buttons.join("\n") + ")");
            }
        });

        return options;
    }

    exports.alert = function () {
        var options;

        options = mergeDialogOptions("alert", ["ok"], ["message", "callback"], arguments);

        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error("alert requires callback property to be a function when provided");
        }

        /**
         * overrides
         */
        options.buttons.ok.callback = options.onEscape = function () {
            if ($.isFunction(options.callback)) {
                return options.callback();
            }
            return true;
        };

        return exports.dialog(options);
    };

    exports.confirm = function () {
        var options;

        options = mergeDialogOptions("confirm", ["cancel", "confirm"], ["message", "callback"], arguments);

        /**
         * overrides; undo anything the user tried to set they shouldn't have
         */
        options.buttons.cancel.callback = options.onEscape = function () {
            return options.callback(false);
        };

        options.buttons.confirm.callback = function () {
            return options.callback(true);
        };

        // confirm specific validation
        if (!$.isFunction(options.callback)) {
            throw new Error("confirm requires a callback");
        }

        return exports.dialog(options);
    };

    exports.prompt = function () {
        var options;
        var defaults;
        var dialog;
        var form;
        var input;
        var shouldShow;
        var inputOptions;

        // we have to create our form first otherwise
        // its value is undefined when gearing up our options
        // @TODO this could be solved by allowing message to
        // be a function instead...
        form = $(templates.form);

        // prompt defaults are more complex than others in that
        // users can override more defaults
        // @TODO I don't like that prompt has to do a lot of heavy
        // lifting which mergeDialogOptions can *almost* support already
        // just because of 'value' and 'inputType' - can we refactor?
        defaults = {
            className: "bootbox-prompt",
            buttons: createLabels("cancel", "confirm"),
            value: "",
            inputType: "text"
        };

        options = validateButtons(
            mergeArguments(defaults, arguments, ["title", "callback"]), ["cancel", "confirm"]
        );

        // capture the user's show value; we always set this to false before
        // spawning the dialog to give us a chance to attach some handlers to
        // it, but we need to make sure we respect a preference not to show it
        shouldShow = (options.show === undefined) ? true : options.show;

        // check if the browser supports the option.inputType
        var html5inputs = ["date", "time", "number"];
        var i = document.createElement("input");
        i.setAttribute("type", options.inputType);
        if (html5inputs[options.inputType]) {
            options.inputType = i.type;
        }

        /**
         * overrides; undo anything the user tried to set they shouldn't have
         */
        options.message = form;

        options.buttons.cancel.callback = options.onEscape = function () {
            return options.callback(null);
        };

        options.buttons.confirm.callback = function () {
            var value;

            switch (options.inputType) {
                case "text":
                case "textarea":
                case "email":
                case "select":
                case "date":
                case "time":
                case "number":
                case "password":
                    value = input.val();
                    break;

                case "checkbox":
                    var checkedItems = input.find("input:checked");

                    // we assume that checkboxes are always multiple,
                    // hence we default to an empty array
                    value = [];

                    each(checkedItems, function (_, item) {
                        value.push($(item).val());
                    });
                    break;
            }

            return options.callback(value);
        };

        options.show = false;

        // prompt specific validation
        if (!options.title) {
            throw new Error("prompt requires a title");
        }

        if (!$.isFunction(options.callback)) {
            throw new Error("prompt requires a callback");
        }

        if (!templates.inputs[options.inputType]) {
            throw new Error("invalid prompt type");
        }

        // create the input based on the supplied type
        input = $(templates.inputs[options.inputType]);

        switch (options.inputType) {
            case "text":
            case "textarea":
            case "email":
            case "date":
            case "time":
            case "number":
            case "password":
                input.val(options.value);
                break;

            case "select":
                var groups = {};
                inputOptions = options.inputOptions || [];

                if (!inputOptions.length) {
                    throw new Error("prompt with select requires options");
                }

                each(inputOptions, function (_, option) {

                    // assume the element to attach to is the input...
                    var elem = input;

                    if (option.value === undefined || option.text === undefined) {
                        throw new Error("given options in wrong format");
                    }


                    // ... but override that element if this option sits in a group

                    if (option.group) {
                        // initialise group if necessary
                        if (!groups[option.group]) {
                            groups[option.group] = $("<optgroup/>").attr("label", option.group);
                        }

                        elem = groups[option.group];
                    }

                    elem.append("<option value='" + option.value + "'>" + option.text + "</option>");
                });

                each(groups, function (_, group) {
                    input.append(group);
                });

                // safe to set a select's value as per a normal input
                input.val(options.value);
                break;

            case "checkbox":
                var values = $.isArray(options.value) ? options.value : [options.value];
                inputOptions = options.inputOptions || [];

                if (!inputOptions.length) {
                    throw new Error("prompt with checkbox requires options");
                }

                if (!inputOptions[0].value || !inputOptions[0].text) {
                    throw new Error("given options in wrong format");
                }

                // checkboxes have to nest within a containing element, so
                // they break the rules a bit and we end up re-assigning
                // our 'input' element to this container instead
                input = $("<div/>");

                each(inputOptions, function (_, option) {
                    var checkbox = $(templates.inputs[options.inputType]);

                    checkbox.find("input").attr("value", option.value);
                    checkbox.find("label").append(option.text);

                    // we've ensured values is an array so we can always iterate over it
                    each(values, function (_, value) {
                        if (value === option.value) {
                            checkbox.find("input").prop("checked", true);
                        }
                    });

                    input.append(checkbox);
                });
                break;
        }

        if (options.placeholder) {
            input.attr("placeholder", options.placeholder);
        }

        if (options.pattern) {
            input.attr("pattern", options.pattern);
        }

        // now place it in our form
        form.append(input);

        form.on("submit", function (e) {
            e.preventDefault();
            // @TODO can we actually click *the* button object instead?
            // e.g. buttons.confirm.click() or similar
            dialog.find(".btn-primary").click();
        });

        dialog = exports.dialog(options);

        // clear the existing handler focusing the submit button...
        dialog.off("shown.bs.modal");

        // ...and replace it with one focusing our input, if possible
        dialog.on("shown.bs.modal", function () {
            input.focus();
        });

        if (shouldShow === true) {
            dialog.modal("show");
        }

        return dialog;
    };

    exports.dialog = function (options) {
        options = sanitize(options);

        var dialog = $(templates.dialog);
        var body = dialog.find(".modal-body");
        var buttons = options.buttons;
        var buttonStr = "";
        var sizeClassName = "";
        var titleClassName = "";
        var valueClassName = "";
        var buttonClassName = "";
        var callbacks = {
            onEscape: options.onEscape
        };

        each(buttons, function (key, button) {

            // @TODO I don't like this string appending to itself; bit dirty. Needs reworking
            // can we just build up button elements instead? slower but neater. Then button
            // can just become a template too
            buttonStr += "<button data-bb-handler='" + key + "' type='button' class='btn " + button.className + "'>" + button.label + "</button>";
            callbacks[key] = button.callback;
        });

        body.find(".bootbox-body").html(options.message);

        if (options.animate === true) {
            dialog.addClass("fade");
        }

        if (options.className) {
            dialog.addClass(options.className);
        }

        if (options.title) {
            body.before(templates.header);
        }

        if (options.closeButton) {
            var closeButton = $(templates.closeButton);

            if (options.title) {
                dialog.find(".modal-header").prepend(closeButton);
            } else {
                closeButton.css("margin-top", "-10px").prependTo(body);
            }
        }

        if (options.title) {
            dialog.find(".modal-title").html(options.title);
        }

        if (buttonStr.length) {
            body.after(templates.footer);
            dialog.find(".modal-footer").html(buttonStr);
        }

        // add by zhufeng
        if (options.size) {
            if (options.size === 'lg') {
                sizeClassName = 'modal-lg';
            } else if (options.size === 'md') {
                sizeClassName = '';
            } else if (options.size === 'sm') {
                sizeClassName = 'modal-sm';
            }
            dialog.find('.modal-dialog').addClass(sizeClassName);
        }

        if (options.titleAlign) {
            if (options.titleAlign === 'center') {
                titleClassName = 'align_center';
            } else if (options.titleAlign === 'right') {
                titleClassName = 'align_right';
            } else {
                titleClassName = 'align_left';
            }
            dialog.find('.modal-header').addClass(titleClassName);
        }

        if (options.valueAlign) {
            if (options.valueAlign === 'center') {
                valueClassName = 'align_center';
            } else if (options.valueAlign === 'right') {
                valueClassName = 'align_right';
            } else {
                valueClassName = 'align_left';
            }
            dialog.find('.bootbox-body').addClass(valueClassName);
        }

        if (options.buttonAlign) {
            if (options.buttonAlign === 'center') {
                buttonClassName = 'align_center';
            } else if (options.buttonAlign === 'right') {
                buttonClassName = 'align_right';
            } else {
                buttonClassName = 'align_left';
            }
            dialog.find('.modal-footer').addClass(buttonClassName);
        }
        // end


        /**
         * Bootstrap event listeners; used handle extra
         * setup & teardown required after the underlying
         * modal has performed certain actions
         */

        dialog.on("hidden.bs.modal", function (e) {
            // ensure we don't accidentally intercept hidden events triggered
            // by children of the current dialog. We shouldn't anymore now BS
            // namespaces its events; but still worth doing
            if (e.target === this) {
                dialog.remove();
            }
        });


        // dialog.on("show.bs.modal", function() {
        //   // sadly this doesn't work; show is called *just* before
        //   // the backdrop is added so we'd need a setTimeout hack or
        //   // otherwise... leaving in as would be nice
        //   if (options.backdrop) {
        //     dialog.next(".modal-backdrop").addClass("bootbox-backdrop");
        //   }
        // });


        dialog.on("shown.bs.modal", function () {
            dialog.find(".btn-primary:first").focus();
        });

        /**
         * Bootbox event listeners; experimental and may not last
         * just an attempt to decouple some behaviours from their
         * respective triggers
         */

        dialog.on("escape.close.bb", function (e) {
            if (callbacks.onEscape) {
                processCallback(e, dialog, callbacks.onEscape);
            }
        });

        /**
         * Standard jQuery event listeners; used to handle user
         * interaction with our dialog
         */

        dialog.on("click", ".modal-footer button", function (e) {
            var callbackKey = $(this).data("bb-handler");

            processCallback(e, dialog, callbacks[callbackKey]);

        });

        dialog.on("click", ".bootbox-close-button", function (e) {
            // onEscape might be falsy but that's fine; the fact is
            // if the user has managed to click the close button we
            // have to close the dialog, callback or not
            processCallback(e, dialog, callbacks.onEscape);
        });

        dialog.on("keyup", function (e) {
            if (e.which === 27) {
                dialog.trigger("escape.close.bb");
            }
        });

        // the remainder of this method simply deals with adding our
        // dialogent to the DOM, augmenting it with Bootstrap's modal
        // functionality and then giving the resulting object back
        // to our caller

        $(options.container).append(dialog);

        dialog.modal({
            backdrop: options.backdrop,
            keyboard: false,
            show: false
        });

        if (options.show) {
            dialog.modal("show");
        }

        // @TODO should we return the raw element here or should
        // we wrap it in an object on which we can expose some neater
        // methods, e.g. var d = bootbox.alert(); d.hide(); instead
        // of d.modal("hide");


        // function BBDialog(elem) {
        //   this.elem = elem;
        // }

        // BBDialog.prototype = {
        //   hide: function() {
        //     return this.elem.modal("hide");
        //   },
        //   show: function() {
        //     return this.elem.modal("show");
        //   }
        // };


        return dialog;

    };

    exports.setDefaults = function () {
        var values = {};

        if (arguments.length === 2) {
            // allow passing of single key/value...
            values[arguments[0]] = arguments[1];
        } else {
            // ... and as an object too
            values = arguments[0];
        }

        $.extend(defaults, values);
    };

    exports.hideAll = function () {
        $(".bootbox").modal("hide");
    };


    /**
     * standard locales. Please add more according to ISO 639-1 standard. Multiple language variants are
     * unlikely to be required. If this gets too large it can be split out into separate JS files.
     */
    var locales = {
        br: {
            OK: "OK",
            CANCEL: "Cancelar",
            CONFIRM: "Sim"
        },
        da: {
            OK: "OK",
            CANCEL: "Annuller",
            CONFIRM: "Accepter"
        },
        de: {
            OK: "OK",
            CANCEL: "Abbrechen",
            CONFIRM: "Akzeptieren"
        },
        en: {
            OK: "OK",
            CANCEL: "Cancel",
            CONFIRM: "OK"
        },
        es: {
            OK: "OK",
            CANCEL: "Cancelar",
            CONFIRM: "Aceptar"
        },
        fi: {
            OK: "OK",
            CANCEL: "Peruuta",
            CONFIRM: "OK"
        },
        fr: {
            OK: "OK",
            CANCEL: "Annuler",
            CONFIRM: "D'accord"
        },
        he: {
            OK: "אישור",
            CANCEL: "ביטול",
            CONFIRM: "אישור"
        },
        it: {
            OK: "OK",
            CANCEL: "Annulla",
            CONFIRM: "Conferma"
        },
        lt: {
            OK: "Gerai",
            CANCEL: "Atšaukti",
            CONFIRM: "Patvirtinti"
        },
        lv: {
            OK: "Labi",
            CANCEL: "Atcelt",
            CONFIRM: "Apstiprināt"
        },
        nl: {
            OK: "OK",
            CANCEL: "Annuleren",
            CONFIRM: "Accepteren"
        },
        no: {
            OK: "OK",
            CANCEL: "Avbryt",
            CONFIRM: "OK"
        },
        pl: {
            OK: "OK",
            CANCEL: "Anuluj",
            CONFIRM: "Potwierdź"
        },
        ru: {
            OK: "OK",
            CANCEL: "Отмена",
            CONFIRM: "Применить"
        },
        sv: {
            OK: "OK",
            CANCEL: "Avbryt",
            CONFIRM: "OK"
        },
        tr: {
            OK: "Tamam",
            CANCEL: "İptal",
            CONFIRM: "Onayla"
        },
        zh_CN: {
            OK: "OK",
            CANCEL: "取消",
            CONFIRM: "确认"
        },
        zh_TW: {
            OK: "OK",
            CANCEL: "取消",
            CONFIRM: "確認"
        }
    };

    exports.init = function (_$) {
        return init(_$ || $);
    };

    return exports;
}));
///<jscompress sourcefile="summernote.js" />
/**
 * Super simple wysiwyg editor on Bootstrap v0.5.1
 * http://hackerwins.github.io/summernote/
 *
 * summernote.js
 * Copyright 2013 Alan Hong. and outher contributors
 * summernote may be freely distributed under the MIT license./
 *
 * Date: 2014-03-16T06:23Z
 */
(function (factory) {
    /* global define */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'codemirror'], factory);
    } else {
        // Browser globals: jQuery, CodeMirror
        factory(window.jQuery, window.CodeMirror);
    }
}(function ($, CodeMirror) {
    if ('function' !== typeof Array.prototype.reduce) {
        /**
         * Array.prototype.reduce fallback
         *
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
         */
        Array.prototype.reduce = function (callback, optInitialValue) {
            var idx, value, length = this.length >>> 0,
                isValueSet = false;
            if (1 < arguments.length) {
                value = optInitialValue;
                isValueSet = true;
            }
            for (idx = 0; length > idx; ++idx) {
                if (this.hasOwnProperty(idx)) {
                    if (isValueSet) {
                        value = callback(value, this[idx], idx, this);
                    } else {
                        value = this[idx];
                        isValueSet = true;
                    }
                }
            }
            if (!isValueSet) {
                throw new TypeError('Reduce of empty array with no initial value');
            }
            return value;
        };
    }

    /**
     * Object which check platform and agent
     */
    var agent = {
        bMac: navigator.appVersion.indexOf('Mac') > -1,
        bMSIE: navigator.userAgent.indexOf('MSIE') > -1,
        bFF: navigator.userAgent.indexOf('Firefox') > -1,
        jqueryVersion: parseFloat($.fn.jquery),
        bCodeMirror: !!CodeMirror
    };

    /**
     * func utils (for high-order func's arg)
     */
    var func = (function () {
        var eq = function (elA) {
            return function (elB) {
                return elA === elB;
            };
        };

        var eq2 = function (elA, elB) {
            return elA === elB;
        };

        var ok = function () {
            return true;
        };

        var fail = function () {
            return false;
        };

        var not = function (f) {
            return function () {
                return !f.apply(f, arguments);
            };
        };

        var self = function (a) {
            return a;
        };

        return {
            eq: eq,
            eq2: eq2,
            ok: ok,
            fail: fail,
            not: not,
            self: self
        };
    })();

    /**
     * list utils
     */
    var list = (function () {
        /**
         * returns the first element of an array.
         * @param {Array} array
         */
        var head = function (array) {
            return array[0];
        };

        /**
         * returns the last element of an array.
         * @param {Array} array
         */
        var last = function (array) {
            return array[array.length - 1];
        };

        /**
         * returns everything but the last entry of the array.
         * @param {Array} array
         */
        var initial = function (array) {
            return array.slice(0, array.length - 1);
        };

        /**
         * returns the rest of the elements in an array.
         * @param {Array} array
         */
        var tail = function (array) {
            return array.slice(1);
        };

        /**
         * returns next item.
         * @param {Array} array
         */
        var next = function (array, item) {
            var idx = array.indexOf(item);
            if (idx === -1) {
                return null;
            }

            return array[idx + 1];
        };

        /**
         * returns prev item.
         * @param {Array} array
         */
        var prev = function (array, item) {
            var idx = array.indexOf(item);
            if (idx === -1) {
                return null;
            }

            return array[idx - 1];
        };

        /**
         * get sum from a list
         * @param {Array} array - array
         * @param {Function} fn - iterator
         */
        var sum = function (array, fn) {
            fn = fn || func.self;
            return array.reduce(function (memo, v) {
                return memo + fn(v);
            }, 0);
        };

        /**
         * returns a copy of the collection with array type.
         * @param {Collection} collection - collection eg) node.childNodes, ...
         */
        var from = function (collection) {
            var result = [],
                idx = -1,
                length = collection.length;
            while (++idx < length) {
                result[idx] = collection[idx];
            }
            return result;
        };

        /**
         * cluster elements by predicate function.
         * @param {Array} array - array
         * @param {Function} fn - predicate function for cluster rule
         * @param {Array[]}
         */
        var clusterBy = function (array, fn) {
            if (array.length === 0) {
                return [];
            }
            var aTail = tail(array);
            return aTail.reduce(function (memo, v) {
                var aLast = last(memo);
                if (fn(last(aLast), v)) {
                    aLast[aLast.length] = v;
                } else {
                    memo[memo.length] = [v];
                }
                return memo;
            }, [
                [head(array)]
            ]);
        };

        /**
         * returns a copy of the array with all falsy values removed
         * @param {Array} array - array
         * @param {Function} fn - predicate function for cluster rule
         */
        var compact = function (array) {
            var aResult = [];
            for (var idx = 0, sz = array.length; idx < sz; idx++) {
                if (array[idx]) {
                    aResult.push(array[idx]);
                }
            }
            return aResult;
        };

        return {
            head: head,
            last: last,
            initial: initial,
            tail: tail,
            prev: prev,
            next: next,
            sum: sum,
            from: from,
            compact: compact,
            clusterBy: clusterBy
        };
    })();

    /**
     * Dom functions
     */
    var dom = (function () {
        /**
         * returns whether node is `note-editable` or not.
         *
         * @param {Element} node
         * @return {Boolean}
         */
        var isEditable = function (node) {
            return node && $(node).hasClass('note-editable');
        };

        var isControlSizing = function (node) {
            return node && $(node).hasClass('note-control-sizing');
        };

        /**
         * build layoutInfo from $editor(.note-editor)
         *
         * @param {jQuery} $editor
         * @return {Object}
         */
        var buildLayoutInfo = function ($editor) {
            var makeFinder = function (sClassName) {
                return function () {
                    return $editor.find(sClassName);
                };
            };
            return {
                editor: function () {
                    return $editor;
                },
                dropzone: makeFinder('.note-dropzone'),
                toolbar: makeFinder('.note-toolbar'),
                editable: makeFinder('.note-editable'),
                codable: makeFinder('.note-codable'),
                statusbar: makeFinder('.note-statusbar'),
                popover: makeFinder('.note-popover'),
                handle: makeFinder('.note-handle'),
                dialog: makeFinder('.note-dialog')
            };
        };

        /**
         * returns predicate which judge whether nodeName is same
         * @param {String} sNodeName
         */
        var makePredByNodeName = function (sNodeName) {
            // nodeName is always uppercase.
            return function (node) {
                return node && node.nodeName === sNodeName;
            };
        };

        var isPara = function (node) {
            // Chrome(v31.0), FF(v25.0.1) use DIV for paragraph
            return node && /^DIV|^P|^LI|^H[1-7]/.test(node.nodeName);
        };

        var isList = function (node) {
            return node && /^UL|^OL/.test(node.nodeName);
        };

        var isCell = function (node) {
            return node && /^TD|^TH/.test(node.nodeName);
        };

        /**
         * find nearest ancestor predicate hit
         *
         * @param {Element} node
         * @param {Function} pred - predicate function
         */
        var ancestor = function (node, pred) {
            while (node) {
                if (pred(node)) {
                    return node;
                }
                if (isEditable(node)) {
                    break;
                }

                node = node.parentNode;
            }
            return null;
        };

        /**
         * returns new array of ancestor nodes (until predicate hit).
         *
         * @param {Element} node
         * @param {Function} [optional] pred - predicate function
         */
        var listAncestor = function (node, pred) {
            pred = pred || func.fail;

            var aAncestor = [];
            ancestor(node, function (el) {
                aAncestor.push(el);
                return pred(el);
            });
            return aAncestor;
        };

        /**
         * returns common ancestor node between two nodes.
         *
         * @param {Element} nodeA
         * @param {Element} nodeB
         */
        var commonAncestor = function (nodeA, nodeB) {
            var aAncestor = listAncestor(nodeA);
            for (var n = nodeB; n; n = n.parentNode) {
                if ($.inArray(n, aAncestor) > -1) {
                    return n;
                }
            }
            return null; // difference document area
        };

        /**
         * listing all Nodes between two nodes.
         * FIXME: nodeA and nodeB must be sorted, use comparePoints later.
         *
         * @param {Element} nodeA
         * @param {Element} nodeB
         */
        var listBetween = function (nodeA, nodeB) {
            var aNode = [];

            var bStart = false,
                bEnd = false;

            // DFS(depth first search) with commonAcestor.
            (function fnWalk(node) {
                if (!node) {
                    return;
                } // traverse fisnish
                if (node === nodeA) {
                    bStart = true;
                } // start point
                if (bStart && !bEnd) {
                    aNode.push(node);
                } // between
                if (node === nodeB) {
                    bEnd = true;
                    return;
                } // end point

                for (var idx = 0, sz = node.childNodes.length; idx < sz; idx++) {
                    fnWalk(node.childNodes[idx]);
                }
            })(commonAncestor(nodeA, nodeB));

            return aNode;
        };

        /**
         * listing all previous siblings (until predicate hit).
         * @param {Element} node
         * @param {Function} [optional] pred - predicate function
         */
        var listPrev = function (node, pred) {
            pred = pred || func.fail;

            var aNext = [];
            while (node) {
                aNext.push(node);
                if (pred(node)) {
                    break;
                }
                node = node.previousSibling;
            }
            return aNext;
        };

        /**
         * listing next siblings (until predicate hit).
         *
         * @param {Element} node
         * @param {Function} [pred] - predicate function
         */
        var listNext = function (node, pred) {
            pred = pred || func.fail;

            var aNext = [];
            while (node) {
                aNext.push(node);
                if (pred(node)) {
                    break;
                }
                node = node.nextSibling;
            }
            return aNext;
        };

        /**
         * listing descendant nodes
         *
         * @param {Element} node
         * @param {Function} [pred] - predicate function
         */
        var listDescendant = function (node, pred) {
            var aDescendant = [];
            pred = pred || func.ok;

            // start DFS(depth first search) with node
            (function fnWalk(current) {
                if (node !== current && pred(current)) {
                    aDescendant.push(current);
                }
                for (var idx = 0, sz = current.childNodes.length; idx < sz; idx++) {
                    fnWalk(current.childNodes[idx]);
                }
            })(node);

            return aDescendant;
        };

        /**
         * insert node after preceding
         *
         * @param {Element} node
         * @param {Element} preceding - predicate function
         */
        var insertAfter = function (node, preceding) {
            var next = preceding.nextSibling,
                parent = preceding.parentNode;
            if (next) {
                parent.insertBefore(node, next);
            } else {
                parent.appendChild(node);
            }
            return node;
        };

        /**
         * append elements.
         *
         * @param {Element} node
         * @param {Collection} aChild
         */
        var appends = function (node, aChild) {
            $.each(aChild, function (idx, child) {
                node.appendChild(child);
            });
            return node;
        };

        var isText = makePredByNodeName('#text');

        /**
         * returns #text's text size or element's childNodes size
         *
         * @param {Element} node
         */
        var length = function (node) {
            if (isText(node)) {
                return node.nodeValue.length;
            }
            return node.childNodes.length;
        };

        /**
         * returns offset from parent.
         *
         * @param {Element} node
         */
        var position = function (node) {
            var offset = 0;
            while ((node = node.previousSibling)) {
                offset += 1;
            }
            return offset;
        };

        /**
         * return offsetPath(array of offset) from ancestor
         *
         * @param {Element} ancestor - ancestor node
         * @param {Element} node
         */
        var makeOffsetPath = function (ancestor, node) {
            var aAncestor = list.initial(listAncestor(node, func.eq(ancestor)));
            return $.map(aAncestor, position).reverse();
        };

        /**
         * return element from offsetPath(array of offset)
         *
         * @param {Element} ancestor - ancestor node
         * @param {array} aOffset - offsetPath
         */
        var fromOffsetPath = function (ancestor, aOffset) {
            var current = ancestor;
            for (var i = 0, sz = aOffset.length; i < sz; i++) {
                current = current.childNodes[aOffset[i]];
            }
            return current;
        };

        /**
         * split element or #text
         *
         * @param {Element} node
         * @param {Number} offset
         */
        var splitData = function (node, offset) {
            if (offset === 0) {
                return node;
            }
            if (offset >= length(node)) {
                return node.nextSibling;
            }

            // splitText
            if (isText(node)) {
                return node.splitText(offset);
            }

            // splitElement
            var child = node.childNodes[offset];
            node = insertAfter(node.cloneNode(false), node);
            return appends(node, listNext(child));
        };

        /**
         * split dom tree by boundaryPoint(pivot and offset)
         *
         * @param {Element} root
         * @param {Element} pivot - this will be boundaryPoint's node
         * @param {Number} offset - this will be boundaryPoint's offset
         */
        var split = function (root, pivot, offset) {
            var aAncestor = listAncestor(pivot, func.eq(root));
            if (aAncestor.length === 1) {
                return splitData(pivot, offset);
            }
            return aAncestor.reduce(function (node, parent) {
                var clone = parent.cloneNode(false);
                insertAfter(clone, parent);
                if (node === pivot) {
                    node = splitData(node, offset);
                }
                appends(clone, listNext(node));
                return clone;
            });
        };

        /**
         * remove node, (bRemoveChild: remove child or not)
         * @param {Element} node
         * @param {Boolean} bRemoveChild
         */
        var remove = function (node, bRemoveChild) {
            if (!node || !node.parentNode) {
                return;
            }
            if (node.removeNode) {
                return node.removeNode(bRemoveChild);
            }

            var elParent = node.parentNode;
            if (!bRemoveChild) {
                var aNode = [];
                var i, sz;
                for (i = 0, sz = node.childNodes.length; i < sz; i++) {
                    aNode.push(node.childNodes[i]);
                }

                for (i = 0, sz = aNode.length; i < sz; i++) {
                    elParent.insertBefore(aNode[i], node);
                }
            }

            elParent.removeChild(node);
        };

        var html = function ($node) {
            return dom.isTextarea($node[0]) ? $node.val() : $node.html();
        };

        return {
            blank: agent.bMSIE ? '&nbsp;' : '<br/>',
            emptyPara: '<p><br/></p>',
            isEditable: isEditable,
            isControlSizing: isControlSizing,
            buildLayoutInfo: buildLayoutInfo,
            isText: isText,
            isPara: isPara,
            isList: isList,
            isTable: makePredByNodeName('TABLE'),
            isCell: isCell,
            isAnchor: makePredByNodeName('A'),
            isDiv: makePredByNodeName('DIV'),
            isLi: makePredByNodeName('LI'),
            isSpan: makePredByNodeName('SPAN'),
            isB: makePredByNodeName('B'),
            isU: makePredByNodeName('U'),
            isS: makePredByNodeName('S'),
            isI: makePredByNodeName('I'),
            isImg: makePredByNodeName('IMG'),
            isTextarea: makePredByNodeName('TEXTAREA'),
            ancestor: ancestor,
            listAncestor: listAncestor,
            listNext: listNext,
            listPrev: listPrev,
            listDescendant: listDescendant,
            commonAncestor: commonAncestor,
            listBetween: listBetween,
            insertAfter: insertAfter,
            position: position,
            makeOffsetPath: makeOffsetPath,
            fromOffsetPath: fromOffsetPath,
            split: split,
            remove: remove,
            html: html
        };
    })();

    var settings = {
        // version
        version: '0.5.1',

        /**
         * options for init
         */
        options: {
            width: null, // set editor width
            height: null, // set editable height, ex) 300

            focus: false, // set focus after initilize summernote

            tabsize: null, // size of tab ex) 2 or 4
            styleWithSpan: true, // style with span (Chrome and FF)

            disableLinkTarget: false, // hide link Target Checkbox
            disableDragAndDrop: false, // disable drag and drop event

            codemirror: null, // codemirror options

            // language
            lang: 'en-US', // language 'en-US', 'ko-KR', ...
            direction: null, // text direction, ex) 'rtl'

            // default toolbar
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'italic', 'underline', 'clear']],
                ['fontname', ['fontname']],
                // ['fontsize', ['fontsize']], Still buggy
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['height', ['height']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview']],
                ['help', ['help']]
            ],

            // callbacks
            oninit: null, // initialize
            onfocus: null, // editable has focus
            onblur: null, // editable out of focus
            onenter: null, // enter key pressed
            onkeyup: null, // keyup
            onkeydown: null, // keydown
            onImageUpload: null, // imageUploadHandler
            onImageUploadError: null, // imageUploadErrorHandler
            onToolbarClick: null,

            keyMap: {
                pc: {
                    'CTRL+Z': 'undo',
                    'CTRL+Y': 'redo',
                    'TAB': 'tab',
                    'SHIFT+TAB': 'untab',
                    'CTRL+B': 'bold',
                    'CTRL+I': 'italic',
                    'CTRL+U': 'underline',
                    'CTRL+SHIFT+S': 'strikethrough',
                    'CTRL+BACKSLASH': 'removeFormat',
                    'CTRL+SHIFT+L': 'justifyLeft',
                    'CTRL+SHIFT+E': 'justifyCenter',
                    'CTRL+SHIFT+R': 'justifyRight',
                    'CTRL+SHIFT+J': 'justifyFull',
                    'CTRL+SHIFT+NUM7': 'insertUnorderedList',
                    'CTRL+SHIFT+NUM8': 'insertOrderedList',
                    'CTRL+LEFTBRACKET': 'outdent',
                    'CTRL+RIGHTBRACKET': 'indent',
                    'CTRL+NUM0': 'formatPara',
                    'CTRL+NUM1': 'formatH1',
                    'CTRL+NUM2': 'formatH2',
                    'CTRL+NUM3': 'formatH3',
                    'CTRL+NUM4': 'formatH4',
                    'CTRL+NUM5': 'formatH5',
                    'CTRL+NUM6': 'formatH6',
                    'CTRL+ENTER': 'insertHorizontalRule'
                },

                mac: {
                    'CMD+Z': 'undo',
                    'CMD+SHIFT+Z': 'redo',
                    'TAB': 'tab',
                    'SHIFT+TAB': 'untab',
                    'CMD+B': 'bold',
                    'CMD+I': 'italic',
                    'CMD+U': 'underline',
                    'CMD+SHIFT+S': 'strikethrough',
                    'CMD+BACKSLASH': 'removeFormat',
                    'CMD+SHIFT+L': 'justifyLeft',
                    'CMD+SHIFT+E': 'justifyCenter',
                    'CMD+SHIFT+R': 'justifyRight',
                    'CMD+SHIFT+J': 'justifyFull',
                    'CMD+SHIFT+NUM7': 'insertUnorderedList',
                    'CMD+SHIFT+NUM8': 'insertOrderedList',
                    'CMD+LEFTBRACKET': 'outdent',
                    'CMD+RIGHTBRACKET': 'indent',
                    'CMD+NUM0': 'formatPara',
                    'CMD+NUM1': 'formatH1',
                    'CMD+NUM2': 'formatH2',
                    'CMD+NUM3': 'formatH3',
                    'CMD+NUM4': 'formatH4',
                    'CMD+NUM5': 'formatH5',
                    'CMD+NUM6': 'formatH6',
                    'CMD+ENTER': 'insertHorizontalRule'
                }
            }
        },

        // default language: en-US
        lang: {
            'en-US': {
                font: {
                    bold: 'Bold',
                    italic: 'Italic',
                    underline: 'Underline',
                    strike: 'Strike',
                    clear: 'Remove Font Style',
                    height: 'Line Height',
                    name: 'Font Family',
                    size: 'Font Size'
                },
                image: {
                    image: 'Picture',
                    insert: 'Insert Image',
                    resizeFull: 'Resize Full',
                    resizeHalf: 'Resize Half',
                    resizeQuarter: 'Resize Quarter',
                    floatLeft: 'Float Left',
                    floatRight: 'Float Right',
                    floatNone: 'Float None',
                    dragImageHere: 'Drag an image here',
                    selectFromFiles: 'Select from files',
                    url: 'Image URL',
                    remove: 'Remove Image'
                },
                link: {
                    link: 'Link',
                    insert: 'Insert Link',
                    unlink: 'Unlink',
                    edit: 'Edit',
                    textToDisplay: 'Text to display',
                    url: 'To what URL should this link go?',
                    openInNewWindow: 'Open in new window'
                },
                video: {
                    video: 'Video',
                    videoLink: 'Video Link',
                    insert: 'Insert Video',
                    url: 'Video URL?',
                    providers: '(YouTube, Vimeo, Vine, Instagram, or DailyMotion)'
                },
                table: {
                    table: 'Table'
                },
                hr: {
                    insert: 'Insert Horizontal Rule'
                },
                style: {
                    style: 'Style',
                    normal: 'Normal',
                    blockquote: 'Quote',
                    pre: 'Code',
                    h1: 'Header 1',
                    h2: 'Header 2',
                    h3: 'Header 3',
                    h4: 'Header 4',
                    h5: 'Header 5',
                    h6: 'Header 6'
                },
                lists: {
                    unordered: 'Unordered list',
                    ordered: 'Ordered list'
                },
                options: {
                    help: 'Help',
                    fullscreen: 'Full Screen',
                    codeview: 'Code View'
                },
                paragraph: {
                    paragraph: 'Paragraph',
                    outdent: 'Outdent',
                    indent: 'Indent',
                    left: 'Align left',
                    center: 'Align center',
                    right: 'Align right',
                    justify: 'Justify full'
                },
                color: {
                    recent: 'Recent Color',
                    more: 'More Color',
                    background: 'BackColor',
                    foreground: 'FontColor',
                    transparent: 'Transparent',
                    setTransparent: 'Set transparent',
                    reset: 'Reset',
                    resetToDefault: 'Reset to default'
                },
                shortcut: {
                    shortcuts: 'Keyboard shortcuts',
                    close: 'Close',
                    textFormatting: 'Text formatting',
                    action: 'Action',
                    paragraphFormatting: 'Paragraph formatting',
                    documentStyle: 'Document Style'
                },
                history: {
                    undo: 'Undo',
                    redo: 'Redo'
                }
            },
            'CHN': {
                font: {
                    bold: '加粗',
                    italic: '斜体',
                    underline: '下划线',
                    strike: 'Strike',
                    clear: '清除样式',
                    height: '行高',
                    name: '字体',
                    size: '字号'
                },
                image: {
                    image: '图片',
                    insert: '添加图片',
                    resizeFull: '全屏',
                    resizeHalf: '缩小一半',
                    resizeQuarter: '缩小四分之一',
                    floatLeft: '左浮动',
                    floatRight: '右浮动',
                    floatNone: '无浮动',
                    dragImageHere: '拖拽图片至此',
                    selectFromFiles: '选择文件',
                    url: '图片链接',
                    remove: '移除图片'
                },
                link: {
                    link: '链接',
                    insert: '插入链接',
                    unlink: '取消链接',
                    edit: '编辑',
                    textToDisplay: '文本显示',
                    url: '链接指向何处?',
                    openInNewWindow: '在新窗口打开'
                },
                video: {
                    video: '视频',
                    videoLink: '视频链接',
                    insert: '插入视频',
                    url: '视频链接?',
                    providers: '(视频出处)'
                },
                table: {
                    table: '表格'
                },
                hr: {
                    insert: '插入水平行'
                },
                style: {
                    style: '样式',
                    normal: '通用',
                    blockquote: '引用',
                    pre: '设置',
                    h1: '引用 1',
                    h2: '引用 2',
                    h3: '引用 3',
                    h4: '引用 4',
                    h5: '引用 5',
                    h6: '引用 6'
                },
                lists: {
                    unordered: '无排序',
                    ordered: '排序'
                },
                options: {
                    help: '帮助',
                    fullscreen: '全屏',
                    codeview: '代码'
                },
                paragraph: {
                    paragraph: '段落',
                    outdent: '无缩进',
                    indent: '缩进',
                    left: '左对齐',
                    center: '居中',
                    right: '右对齐',
                    justify: '平铺'
                },
                color: {
                    recent: '当前颜色',
                    more: '更多颜色',
                    background: '背景颜色',
                    foreground: '字体颜色',
                    transparent: '透明',
                    setTransparent: '设置为透明',
                    reset: '重置',
                    resetToDefault: '重置为默认颜色'
                },
                shortcut: {
                    shortcuts: '快捷键',
                    close: '关闭',
                    textFormatting: '文本格式化',
                    action: '段落',
                    paragraphFormatting: '段落格式化',
                    documentStyle: '文档样式'
                },
                history: {
                    undo: '撤销',
                    redo: '再来一次'
                }
            }
        }
    };

    /**
     * Async functions which returns `Promise`
     */
    var async = (function () {
        /**
         * read contents of file as representing URL
         *
         * @param {File} file
         * @return {Promise} - then: sDataUrl
         */
        var readFileAsDataURL = function (file) {
            return $.Deferred(function (deferred) {
                $.extend(new FileReader(), {
                    onload: function (e) {
                        var sDataURL = e.target.result;
                        deferred.resolve(sDataURL);
                    },
                    onerror: function () {
                        deferred.reject(this);
                    }
                }).readAsDataURL(file);
            }).promise();
        };

        /**
         * create `<image>` from url string
         *
         * @param {String} sUrl
         * @return {Promise} - then: $image
         */
        var createImage = function (sUrl) {
            return $.Deferred(function (deferred) {
                $('<img>').one('load', function () {
                    deferred.resolve($(this));
                }).one('error abort', function () {
                    deferred.reject($(this));
                }).css({
                    display: 'none'
                }).appendTo(document.body).attr('src', sUrl);
            }).promise();
        };

        return {
            readFileAsDataURL: readFileAsDataURL,
            createImage: createImage
        };
    })();

    /**
     * Object for keycodes.
     */
    var key = {
        isEdit: function (keyCode) {
            return [8, 9, 13, 32].indexOf(keyCode) !== -1;
        },
        nameFromCode: {
            '8': 'BACKSPACE',
            '9': 'TAB',
            '13': 'ENTER',
            '32': 'SPACE',

            // Number: 0-9
            '48': 'NUM0',
            '49': 'NUM1',
            '50': 'NUM2',
            '51': 'NUM3',
            '52': 'NUM4',
            '53': 'NUM5',
            '54': 'NUM6',
            '55': 'NUM7',
            '56': 'NUM8',

            // Alphabet: a-z
            '66': 'B',
            '69': 'E',
            '73': 'I',
            '74': 'J',
            '75': 'K',
            '76': 'L',
            '82': 'R',
            '83': 'S',
            '85': 'U',
            '89': 'Y',
            '90': 'Z',

            '191': 'SLASH',
            '219': 'LEFTBRACKET',
            '220': 'BACKSLASH',
            '221': 'RIGHTBRACKET'
        }
    };

    /**
     * Style
     * @class
     */
    var Style = function () {
        /**
         * passing an array of style properties to .css()
         * will result in an object of property-value pairs.
         * (compability with version < 1.9)
         *
         * @param  {jQuery} $obj
         * @param  {Array} propertyNames - An array of one or more CSS properties.
         * @returns {Object}
         */
        var jQueryCSS = function ($obj, propertyNames) {
            if (agent.jqueryVersion < 1.9) {
                var result = {};
                $.each(propertyNames, function (idx, propertyName) {
                    result[propertyName] = $obj.css(propertyName);
                });
                return result;
            }
            return $obj.css.call($obj, propertyNames);
        };

        /**
         * paragraph level style
         *
         * @param {WrappedRange} rng
         * @param {Object} oStyle
         */
        this.stylePara = function (rng, oStyle) {
            $.each(rng.nodes(dom.isPara), function (idx, elPara) {
                $(elPara).css(oStyle);
            });
        };

        /**
         * get current style on cursor
         *
         * @param {WrappedRange} rng
         * @param {Element} elTarget - target element on event
         * @return {Object} - object contains style properties.
         */
        this.current = function (rng, elTarget) {
            var $cont = $(dom.isText(rng.sc) ? rng.sc.parentNode : rng.sc);
            var properties = ['font-family', 'font-size', 'text-align', 'list-style-type', 'line-height'];
            var oStyle = jQueryCSS($cont, properties) || {};

            oStyle['font-size'] = parseInt(oStyle['font-size']);

            // document.queryCommandState for toggle state
            oStyle['font-bold'] = document.queryCommandState('bold') ? 'bold' : 'normal';
            oStyle['font-italic'] = document.queryCommandState('italic') ? 'italic' : 'normal';
            oStyle['font-underline'] = document.queryCommandState('underline') ? 'underline' : 'normal';

            // list-style-type to list-style(unordered, ordered)
            if (!rng.isOnList()) {
                oStyle['list-style'] = 'none';
            } else {
                var aOrderedType = ['circle', 'disc', 'disc-leading-zero', 'square'];
                var bUnordered = $.inArray(oStyle['list-style-type'], aOrderedType) > -1;
                oStyle['list-style'] = bUnordered ? 'unordered' : 'ordered';
            }

            var elPara = dom.ancestor(rng.sc, dom.isPara);
            if (elPara && elPara.style['line-height']) {
                oStyle['line-height'] = elPara.style.lineHeight;
            } else {
                var lineHeight = parseInt(oStyle['line-height']) / parseInt(oStyle['font-size']);
                oStyle['line-height'] = lineHeight.toFixed(1);
            }

            oStyle.image = dom.isImg(elTarget) && elTarget;
            oStyle.anchor = rng.isOnAnchor() && dom.ancestor(rng.sc, dom.isAnchor);
            oStyle.aAncestor = dom.listAncestor(rng.sc, dom.isEditable);

            return oStyle;
        };
    };

    /**
     * range module
     */
    var range = (function () {
        var bW3CRangeSupport = !!document.createRange;

        /**
         * return boundaryPoint from TextRange, inspired by Andy Na's HuskyRange.js
         * @param {TextRange} textRange
         * @param {Boolean} bStart
         * @return {BoundaryPoint}
         */
        var textRange2bp = function (textRange, bStart) {
            var elCont = textRange.parentElement(),
                nOffset;

            var tester = document.body.createTextRange(),
                elPrevCont;
            var aChild = list.from(elCont.childNodes);
            for (nOffset = 0; nOffset < aChild.length; nOffset++) {
                if (dom.isText(aChild[nOffset])) {
                    continue;
                }
                tester.moveToElementText(aChild[nOffset]);
                if (tester.compareEndPoints('StartToStart', textRange) >= 0) {
                    break;
                }
                elPrevCont = aChild[nOffset];
            }

            if (nOffset !== 0 && dom.isText(aChild[nOffset - 1])) {
                var textRangeStart = document.body.createTextRange(),
                    elCurText = null;
                textRangeStart.moveToElementText(elPrevCont || elCont);
                textRangeStart.collapse(!elPrevCont);
                elCurText = elPrevCont ? elPrevCont.nextSibling : elCont.firstChild;

                var pointTester = textRange.duplicate();
                pointTester.setEndPoint('StartToStart', textRangeStart);
                var nTextCount = pointTester.text.replace(/[\r\n]/g, '').length;

                while (nTextCount > elCurText.nodeValue.length && elCurText.nextSibling) {
                    nTextCount -= elCurText.nodeValue.length;
                    elCurText = elCurText.nextSibling;
                }

                /* jshint ignore:start */
                var sDummy = elCurText.nodeValue; //enforce IE to re-reference elCurText, hack
                /* jshint ignore:end */

                if (bStart && elCurText.nextSibling && dom.isText(elCurText.nextSibling) &&
                    nTextCount === elCurText.nodeValue.length) {
                    nTextCount -= elCurText.nodeValue.length;
                    elCurText = elCurText.nextSibling;
                }

                elCont = elCurText;
                nOffset = nTextCount;
            }

            return {
                cont: elCont,
                offset: nOffset
            };
        };

        /**
         * return TextRange from boundary point (inspired by google closure-library)
         * @param {BoundaryPoint} bp
         * @return {TextRange}
         */
        var bp2textRange = function (bp) {
            var textRangeInfo = function (elCont, nOffset) {
                var elNode, bCollapseToStart;

                if (dom.isText(elCont)) {
                    var aPrevText = dom.listPrev(elCont, func.not(dom.isText));
                    var elPrevCont = list.last(aPrevText).previousSibling;
                    elNode = elPrevCont || elCont.parentNode;
                    nOffset += list.sum(list.tail(aPrevText), dom.length);
                    bCollapseToStart = !elPrevCont;
                } else {
                    elNode = elCont.childNodes[nOffset] || elCont;
                    if (dom.isText(elNode)) {
                        return textRangeInfo(elNode, nOffset);
                    }

                    nOffset = 0;
                    bCollapseToStart = false;
                }

                return {
                    cont: elNode,
                    collapseToStart: bCollapseToStart,
                    offset: nOffset
                };
            };

            var textRange = document.body.createTextRange();
            var info = textRangeInfo(bp.cont, bp.offset);

            textRange.moveToElementText(info.cont);
            textRange.collapse(info.collapseToStart);
            textRange.moveStart('character', info.offset);
            return textRange;
        };

        /**
         * Wrapped Range
         *
         * @param {Element} sc - start container
         * @param {Number} so - start offset
         * @param {Element} ec - end container
         * @param {Number} eo - end offset
         */
        var WrappedRange = function (sc, so, ec, eo) {
            this.sc = sc;
            this.so = so;
            this.ec = ec;
            this.eo = eo;

            // nativeRange: get nativeRange from sc, so, ec, eo
            var nativeRange = function () {
                if (bW3CRangeSupport) {
                    var w3cRange = document.createRange();
                    w3cRange.setStart(sc, so);
                    w3cRange.setEnd(ec, eo);
                    return w3cRange;
                } else {
                    var textRange = bp2textRange({
                        cont: sc,
                        offset: so
                    });
                    textRange.setEndPoint('EndToEnd', bp2textRange({
                        cont: ec,
                        offset: eo
                    }));
                    return textRange;
                }
            };

            /**
             * select update visible range
             */
            this.select = function () {
                var nativeRng = nativeRange();
                if (bW3CRangeSupport) {
                    var selection = document.getSelection();
                    if (selection.rangeCount > 0) {
                        selection.removeAllRanges();
                    }
                    selection.addRange(nativeRng);
                } else {
                    nativeRng.select();
                }
            };

            /**
             * returns matched nodes on range
             *
             * @param {Function} pred - predicate function
             * @return {Element[]}
             */
            this.nodes = function (pred) {
                var aNode = dom.listBetween(sc, ec);
                var aMatched = list.compact($.map(aNode, function (node) {
                    return dom.ancestor(node, pred);
                }));
                return $.map(list.clusterBy(aMatched, func.eq2), list.head);
            };

            /**
             * returns commonAncestor of range
             * @return {Element} - commonAncestor
             */
            this.commonAncestor = function () {
                return dom.commonAncestor(sc, ec);
            };

            /**
             * makeIsOn: return isOn(pred) function
             */
            var makeIsOn = function (pred) {
                return function () {
                    var elAncestor = dom.ancestor(sc, pred);
                    return !!elAncestor && (elAncestor === dom.ancestor(ec, pred));
                };
            };

            // isOnEditable: judge whether range is on editable or not
            this.isOnEditable = makeIsOn(dom.isEditable);
            // isOnList: judge whether range is on list node or not
            this.isOnList = makeIsOn(dom.isList);
            // isOnAnchor: judge whether range is on anchor node or not
            this.isOnAnchor = makeIsOn(dom.isAnchor);
            // isOnAnchor: judge whether range is on cell node or not
            this.isOnCell = makeIsOn(dom.isCell);
            // isCollapsed: judge whether range was collapsed
            this.isCollapsed = function () {
                return sc === ec && so === eo;
            };

            /**
             * insert node at current cursor
             * @param {Element} node
             */
            this.insertNode = function (node) {
                var nativeRng = nativeRange();
                if (bW3CRangeSupport) {
                    nativeRng.insertNode(node);
                } else {
                    nativeRng.pasteHTML(node.outerHTML); // NOTE: missing node reference.
                }
            };

            this.toString = function () {
                var nativeRng = nativeRange();
                return bW3CRangeSupport ? nativeRng.toString() : nativeRng.text;
            };

            // bookmark: offsetPath bookmark
            this.bookmark = function (elEditable) {
                return {
                    s: {
                        path: dom.makeOffsetPath(elEditable, sc),
                        offset: so
                    },
                    e: {
                        path: dom.makeOffsetPath(elEditable, ec),
                        offset: eo
                    }
                };
            };
        };

        return {
            /**
             * create Range Object From arguments or Browser Selection
             *
             * @param {Element} sc - start container
             * @param {Number} so - start offset
             * @param {Element} ec - end container
             * @param {Number} eo - end offset
             */
            create: function (sc, so, ec, eo) {
                if (arguments.length === 0) { // from Browser Selection
                    if (bW3CRangeSupport) { // webkit, firefox
                        var selection = document.getSelection();
                        if (selection.rangeCount === 0) {
                            return null;
                        }

                        var nativeRng = selection.getRangeAt(0);
                        sc = nativeRng.startContainer;
                        so = nativeRng.startOffset;
                        ec = nativeRng.endContainer;
                        eo = nativeRng.endOffset;
                    } else { // IE8: TextRange
                        var textRange = document.selection.createRange();
                        var textRangeEnd = textRange.duplicate();
                        textRangeEnd.collapse(false);
                        var textRangeStart = textRange;
                        textRangeStart.collapse(true);

                        var bpStart = textRange2bp(textRangeStart, true),
                            bpEnd = textRange2bp(textRangeEnd, false);

                        sc = bpStart.cont;
                        so = bpStart.offset;
                        ec = bpEnd.cont;
                        eo = bpEnd.offset;
                    }
                } else if (arguments.length === 2) { //collapsed
                    ec = sc;
                    eo = so;
                }
                return new WrappedRange(sc, so, ec, eo);
            },

            /**
             * create WrappedRange from node
             *
             * @param {Element} node
             * @return {WrappedRange}
             */
            createFromNode: function (node) {
                return this.create(node, 0, node, 1);
            },

            /**
             * create WrappedRange from Bookmark
             *
             * @param {Element} elEditable
             * @param {Obkect} bookmark
             * @return {WrappedRange}
             */
            createFromBookmark: function (elEditable, bookmark) {
                var sc = dom.fromOffsetPath(elEditable, bookmark.s.path);
                var so = bookmark.s.offset;
                var ec = dom.fromOffsetPath(elEditable, bookmark.e.path);
                var eo = bookmark.e.offset;
                return new WrappedRange(sc, so, ec, eo);
            }
        };
    })();

    /**
     * Table
     * @class
     */
    var Table = function () {
        /**
         * handle tab key
         *
         * @param {WrappedRange} rng
         * @param {Boolean} bShift
         */
        this.tab = function (rng, bShift) {
            var elCell = dom.ancestor(rng.commonAncestor(), dom.isCell);
            var elTable = dom.ancestor(elCell, dom.isTable);
            var aCell = dom.listDescendant(elTable, dom.isCell);

            var elNext = list[bShift ? 'prev' : 'next'](aCell, elCell);
            if (elNext) {
                range.create(elNext, 0).select();
            }
        };

        /**
         * create empty table element
         *
         * @param {Number} nRow
         * @param {Number} nCol
         */
        this.createTable = function (nCol, nRow) {
            var aTD = [],
                sTD;
            for (var idxCol = 0; idxCol < nCol; idxCol++) {
                aTD.push('<td>' + dom.blank + '</td>');
            }
            sTD = aTD.join('');

            var aTR = [],
                sTR;
            for (var idxRow = 0; idxRow < nRow; idxRow++) {
                aTR.push('<tr>' + sTD + '</tr>');
            }
            sTR = aTR.join('');
            var sTable = '<table class="table table-bordered">' + sTR + '</table>';

            return $(sTable)[0];
        };
    };

    /**
     * Editor
     * @class
     */
    var Editor = function () {

        var style = new Style();
        var table = new Table();

        /**
         * save current range
         *
         * @param {jQuery} $editable
         */
        this.saveRange = function ($editable) {
            $editable.data('range', range.create());
        };

        /**
         * restore lately range
         *
         * @param {jQuery} $editable
         */
        this.restoreRange = function ($editable) {
            var rng = $editable.data('range');
            if (rng) {
                rng.select();
            }
        };

        /**
         * current style
         * @param {Element} elTarget
         */
        this.currentStyle = function (elTarget) {
            var rng = range.create();
            return rng && rng.isOnEditable() && style.current(rng, elTarget);
        };

        /**
         * undo
         * @param {jQuery} $editable
         */
        this.undo = function ($editable) {
            $editable.data('NoteHistory').undo($editable);
        };

        /**
         * redo
         * @param {jQuery} $editable
         */
        this.redo = function ($editable) {
            $editable.data('NoteHistory').redo($editable);
        };

        /**
         * record Undo
         * @param {jQuery} $editable
         */
        var recordUndo = this.recordUndo = function ($editable) {
            $editable.data('NoteHistory').recordUndo($editable);
        };

        /* jshint ignore:start */
        // native commands(with execCommand), generate function for execCommand
        var aCmd = ['bold', 'italic', 'underline', 'strikethrough',
            'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
            'insertOrderedList', 'insertUnorderedList',
            'indent', 'outdent', 'formatBlock', 'removeFormat',
            'backColor', 'foreColor', 'insertHorizontalRule', 'fontName'
        ];

        for (var idx = 0, len = aCmd.length; idx < len; idx++) {
            this[aCmd[idx]] = (function (sCmd) {
                return function ($editable, sValue) {
                    recordUndo($editable);
                    document.execCommand(sCmd, false, sValue);
                };
            })(aCmd[idx]);
        }
        /* jshint ignore:end */

        /**
         * @param {jQuery} $editable
         * @param {WrappedRange} rng
         * @param {Number} nTabsize
         */
        var insertTab = function ($editable, rng, nTabsize) {
            recordUndo($editable);
            var sNbsp = new Array(nTabsize + 1).join('&nbsp;');
            rng.insertNode($('<span id="noteTab">' + sNbsp + '</span>')[0]);
            var $tab = $('#noteTab').removeAttr('id');
            rng = range.create($tab[0], 1);
            rng.select();
            dom.remove($tab[0]);
        };

        /**
         * handle tab key
         * @param {jQuery} $editable
         * @param {Number} nTabsize
         * @param {Boolean} bShift
         */
        this.tab = function ($editable, options) {
            var rng = range.create();
            if (rng.isCollapsed() && rng.isOnCell()) {
                table.tab(rng);
            } else {
                insertTab($editable, rng, options.tabsize);
            }
        };

        /**
         * handle shift+tab key
         */
        this.untab = function () {
            var rng = range.create();
            if (rng.isCollapsed() && rng.isOnCell()) {
                table.tab(rng, true);
            }
        };

        /**
         * insert image
         *
         * @param {jQuery} $editable
         * @param {String} sUrl
         */
        this.insertImage = function ($editable, sUrl) {
            async.createImage(sUrl).then(function ($image) {
                recordUndo($editable);
                $image.css({
                    display: '',
                    width: Math.min($editable.width(), $image.width())
                });
                range.create().insertNode($image[0]);
            }).fail(function () {
                var callbacks = $editable.data('callbacks');
                if (callbacks.onImageUploadError) {
                    callbacks.onImageUploadError();
                }
            });
        };

        /**
         * insert video
         * @param {jQuery} $editable
         * @param {String} sUrl
         */
        this.insertVideo = function ($editable, sUrl) {
            recordUndo($editable);

            // video url patterns(youtube, instagram, vimeo, dailymotion)
            var ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            var ytMatch = sUrl.match(ytRegExp);

            var igRegExp = /\/\/instagram.com\/p\/(.[a-zA-Z0-9]*)/;
            var igMatch = sUrl.match(igRegExp);

            var vRegExp = /\/\/vine.co\/v\/(.[a-zA-Z0-9]*)/;
            var vMatch = sUrl.match(vRegExp);

            var vimRegExp = /\/\/(player.)?vimeo.com\/([a-z]*\/)*([0-9]{6,11})[?]?.*/;
            var vimMatch = sUrl.match(vimRegExp);

            var dmRegExp = /.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/;
            var dmMatch = sUrl.match(dmRegExp);

            var $video;
            if (ytMatch && ytMatch[2].length === 11) {
                var youtubeId = ytMatch[2];
                $video = $('<iframe>')
                    .attr('src', '//www.youtube.com/embed/' + youtubeId)
                    .attr('width', '640').attr('height', '360');
            } else if (igMatch && igMatch[0].length > 0) {
                $video = $('<iframe>')
                    .attr('src', igMatch[0] + '/embed/')
                    .attr('width', '612').attr('height', '710')
                    .attr('scrolling', 'no')
                    .attr('allowtransparency', 'true');
            } else if (vMatch && vMatch[0].length > 0) {
                $video = $('<iframe>')
                    .attr('src', vMatch[0] + '/embed/simple')
                    .attr('width', '600').attr('height', '600')
                    .attr('class', 'vine-embed');
            } else if (vimMatch && vimMatch[3].length > 0) {
                $video = $('<iframe webkitallowfullscreen mozallowfullscreen allowfullscreen>')
                    .attr('src', '//player.vimeo.com/video/' + vimMatch[3])
                    .attr('width', '640').attr('height', '360');
            } else if (dmMatch && dmMatch[2].length > 0) {
                $video = $('<iframe>')
                    .attr('src', '//www.dailymotion.com/embed/video/' + dmMatch[2])
                    .attr('width', '640').attr('height', '360');
            } else {
                // this is not a known video link. Now what, Cat? Now what?
            }

            if ($video) {
                $video.attr('frameborder', 0);
                range.create().insertNode($video[0]);
            }
        };

        /**
         * formatBlock
         *
         * @param {jQuery} $editable
         * @param {String} sTagName
         */
        this.formatBlock = function ($editable, sTagName) {
            recordUndo($editable);
            sTagName = agent.bMSIE ? '<' + sTagName + '>' : sTagName;
            document.execCommand('FormatBlock', false, sTagName);
        };

        this.formatPara = function ($editable) {
            this.formatBlock($editable, 'P');
        };

        /* jshint ignore:start */
        for (var idx = 1; idx <= 6; idx++) {
            this['formatH' + idx] = function (idx) {
                return function ($editable) {
                    this.formatBlock($editable, 'H' + idx);
                };
            }(idx);
        }
        ;
        /* jshint ignore:end */

        /**
         * fontsize
         * FIXME: Still buggy
         *
         * @param {jQuery} $editable
         * @param {String} sValue - px
         */
        this.fontSize = function ($editable, sValue) {
            recordUndo($editable);
            document.execCommand('fontSize', false, 3);
            if (agent.bFF) {
                // firefox: <font size="3"> to <span style='font-size={sValue}px;'>, buggy
                $editable.find('font[size=3]').removeAttr('size').css('font-size', sValue + 'px');
            } else {
                // chrome: <span style="font-size: medium"> to <span style='font-size={sValue}px;'>
                $editable.find('span').filter(function () {
                    return this.style.fontSize === 'medium';
                }).css('font-size', sValue + 'px');
            }
        };

        /**
         * lineHeight
         * @param {jQuery} $editable
         * @param {String} sValue
         */
        this.lineHeight = function ($editable, sValue) {
            recordUndo($editable);
            style.stylePara(range.create(), {
                lineHeight: sValue
            });
        };

        /**
         * unlink
         * @param {jQuery} $editable
         */
        this.unlink = function ($editable) {
            var rng = range.create();
            if (rng.isOnAnchor()) {
                recordUndo($editable);
                var elAnchor = dom.ancestor(rng.sc, dom.isAnchor);
                rng = range.createFromNode(elAnchor);
                rng.select();
                document.execCommand('unlink');
            }
        };

        /**
         * create link
         *
         * @param {jQuery} $editable
         * @param {String} sLinkUrl
         * @param {Boolean} bNewWindow
         */
        this.createLink = function ($editable, sLinkUrl, bNewWindow) {
            var rng = range.create();
            recordUndo($editable);

            // protocol
            var sLinkUrlWithProtocol = sLinkUrl;
            if (sLinkUrl.indexOf('@') !== -1 && sLinkUrl.indexOf(':') === -1) {
                sLinkUrlWithProtocol = 'mailto:' + sLinkUrl;
            } else if (sLinkUrl.indexOf('://') === -1) {
                sLinkUrlWithProtocol = 'http://' + sLinkUrl;
            }

            // createLink when range collapsed (IE, Firefox).
            if ((agent.bMSIE || agent.bFF) && rng.isCollapsed()) {
                rng.insertNode($('<A id="linkAnchor">' + sLinkUrl + '</A>')[0]);
                var $anchor = $('#linkAnchor').attr('href', sLinkUrlWithProtocol).removeAttr('id');
                rng = range.createFromNode($anchor[0]);
                rng.select();
            } else {
                document.execCommand('createlink', false, sLinkUrlWithProtocol);
                rng = range.create();
            }

            // target
            $.each(rng.nodes(dom.isAnchor), function (idx, elAnchor) {
                if (bNewWindow) {
                    $(elAnchor).attr('target', '_blank');
                } else {
                    $(elAnchor).removeAttr('target');
                }
            });
        };

        /**
         * get link info
         *
         * @return {Promise}
         */
        this.getLinkInfo = function () {
            var rng = range.create();
            var bNewWindow = true;
            var sUrl = '';

            // If range on anchor expand range on anchor(for edit link).
            if (rng.isOnAnchor()) {
                var elAnchor = dom.ancestor(rng.sc, dom.isAnchor);
                rng = range.createFromNode(elAnchor);
                bNewWindow = $(elAnchor).attr('target') === '_blank';
                sUrl = elAnchor.href;
            }

            return {
                text: rng.toString(),
                url: sUrl,
                newWindow: bNewWindow
            };
        };

        /**
         * get video info
         *
         * @return {Object}
         */
        this.getVideoInfo = function () {
            var rng = range.create();

            if (rng.isOnAnchor()) {
                var elAnchor = dom.ancestor(rng.sc, dom.isAnchor);
                rng = range.createFromNode(elAnchor);
            }

            return {
                text: rng.toString()
            };
        };

        this.color = function ($editable, sObjColor) {
            var oColor = JSON.parse(sObjColor);
            var foreColor = oColor.foreColor,
                backColor = oColor.backColor;

            recordUndo($editable);
            if (foreColor) {
                document.execCommand('foreColor', false, foreColor);
            }
            if (backColor) {
                document.execCommand('backColor', false, backColor);
            }
        };

        this.insertTable = function ($editable, sDim) {
            recordUndo($editable);
            var aDim = sDim.split('x');
            range.create().insertNode(table.createTable(aDim[0], aDim[1]));
        };

        /**
         * @param {jQuery} $editable
         * @param {String} sValue
         * @param {jQuery} $target
         */
        this.floatMe = function ($editable, sValue, $target) {
            recordUndo($editable);
            $target.css('float', sValue);
        };

        /**
         * resize overlay element
         * @param {jQuery} $editable
         * @param {String} sValue
         * @param {jQuery} $target - target element
         */
        this.resize = function ($editable, sValue, $target) {
            recordUndo($editable);

            $target.css({
                width: $editable.width() * sValue + 'px',
                height: ''
            });
        };

        /**
         * @param {Position} pos
         * @param {jQuery} $target - target element
         * @param {Boolean} [bKeepRatio] - keep ratio
         */
        this.resizeTo = function (pos, $target, bKeepRatio) {
            var szImage;
            if (bKeepRatio) {
                var newRatio = pos.y / pos.x;
                var ratio = $target.data('ratio');
                szImage = {
                    width: ratio > newRatio ? pos.x : pos.y / ratio,
                    height: ratio > newRatio ? pos.x * ratio : pos.y
                };
            } else {
                szImage = {
                    width: pos.x,
                    height: pos.y
                };
            }

            $target.css(szImage);
        };

        /**
         * remove media object
         *
         * @param {jQuery} $editable
         * @param {String} sValue - dummy argument (for keep interface)
         * @param {jQuery} $target - target element
         */
        this.removeMedia = function ($editable, sValue, $target) {
            recordUndo($editable);
            $target.detach();
        };
    };

    /**
     * History
     * @class
     */
    var History = function () {
        var aUndo = [],
            aRedo = [];

        var makeSnap = function ($editable) {
            var elEditable = $editable[0],
                rng = range.create();
            return {
                contents: $editable.html(),
                bookmark: rng.bookmark(elEditable),
                scrollTop: $editable.scrollTop()
            };
        };

        var applySnap = function ($editable, oSnap) {
            $editable.html(oSnap.contents).scrollTop(oSnap.scrollTop);
            range.createFromBookmark($editable[0], oSnap.bookmark).select();
        };

        this.undo = function ($editable) {
            var oSnap = makeSnap($editable);
            if (aUndo.length === 0) {
                return;
            }
            applySnap($editable, aUndo.pop());
            aRedo.push(oSnap);
        };

        this.redo = function ($editable) {
            var oSnap = makeSnap($editable);
            if (aRedo.length === 0) {
                return;
            }
            applySnap($editable, aRedo.pop());
            aUndo.push(oSnap);
        };

        this.recordUndo = function ($editable) {
            aRedo = [];
            aUndo.push(makeSnap($editable));
        };
    };

    /**
     * Toolbar
     */
    var Toolbar = function () {
        /**
         * update button status
         *
         * @param {jQuery} $toolbar
         * @param {Object} oStyle
         */
        this.update = function ($toolbar, oStyle) {

            /**
             * handle dropdown's check mark (for fontname, fontsize, lineHeight).
             * @param {jQuery} $btn
             * @param {Number} nValue
             */
            var checkDropdownMenu = function ($btn, nValue) {
                $btn.find('.dropdown-menu li a').each(function () {
                    // always compare string to avoid creating another func.
                    var bChecked = ($(this).data('value') + '') === (nValue + '');
                    this.className = bChecked ? 'checked' : '';
                });
            };

            /**
             * update button state(active or not).
             *
             * @param {String} sSelector
             * @param {Function} pred
             */
            var btnState = function (sSelector, pred) {
                var $btn = $toolbar.find(sSelector);
                $btn.toggleClass('active', pred());
            };

            // fontname
            var $fontname = $toolbar.find('.note-fontname');
            if ($fontname.length > 0) {
                var selectedFont = oStyle['font-family'];
                if (!!selectedFont) {
                    selectedFont = list.head(selectedFont.split(','));
                    selectedFont = selectedFont.replace(/\'/g, '');
                    $fontname.find('.note-current-fontname').text(selectedFont);
                    checkDropdownMenu($fontname, selectedFont);
                }
            }

            // fontsize
            var $fontsize = $toolbar.find('.note-fontsize');
            $fontsize.find('.note-current-fontsize').text(oStyle['font-size']);
            checkDropdownMenu($fontsize, parseFloat(oStyle['font-size']));

            // lineheight
            var $lineHeight = $toolbar.find('.note-height');
            checkDropdownMenu($lineHeight, parseFloat(oStyle['line-height']));

            btnState('button[data-event="bold"]', function () {
                return oStyle['font-bold'] === 'bold';
            });
            btnState('button[data-event="italic"]', function () {
                return oStyle['font-italic'] === 'italic';
            });
            btnState('button[data-event="underline"]', function () {
                return oStyle['font-underline'] === 'underline';
            });
            btnState('button[data-event="justifyLeft"]', function () {
                return oStyle['text-align'] === 'left' || oStyle['text-align'] === 'start';
            });
            btnState('button[data-event="justifyCenter"]', function () {
                return oStyle['text-align'] === 'center';
            });
            btnState('button[data-event="justifyRight"]', function () {
                return oStyle['text-align'] === 'right';
            });
            btnState('button[data-event="justifyFull"]', function () {
                return oStyle['text-align'] === 'justify';
            });
            btnState('button[data-event="insertUnorderedList"]', function () {
                return oStyle['list-style'] === 'unordered';
            });
            btnState('button[data-event="insertOrderedList"]', function () {
                return oStyle['list-style'] === 'ordered';
            });
        };

        /**
         * update recent color
         *
         * @param {Element} elBtn
         * @param {String} sEvent
         * @param {sValue} sValue
         */
        this.updateRecentColor = function (elBtn, sEvent, sValue) {
            var $color = $(elBtn).closest('.note-color');
            var $recentColor = $color.find('.note-recent-color');
            var oColor = JSON.parse($recentColor.attr('data-value'));
            oColor[sEvent] = sValue;
            $recentColor.attr('data-value', JSON.stringify(oColor));
            var sKey = sEvent === 'backColor' ? 'background-color' : 'color';
            $recentColor.find('i').css(sKey, sValue);
        };

        this.updateFullscreen = function ($toolbar, bFullscreen) {
            var $btn = $toolbar.find('button[data-event="fullscreen"]');
            $btn.toggleClass('active', bFullscreen);
        };

        this.updateCodeview = function ($toolbar, bCodeview) {
            var $btn = $toolbar.find('button[data-event="codeview"]');
            $btn.toggleClass('active', bCodeview);
        };

        /**
         * activate buttons exclude codeview
         * @param {jQuery} $toolbar
         */
        this.activate = function ($toolbar) {
            $toolbar.find('button').not('button[data-event="codeview"]').removeClass('disabled');
        };

        /**
         * deactivate buttons exclude codeview
         * @param {jQuery} $toolbar
         */
        this.deactivate = function ($toolbar) {
            $toolbar.find('button').not('button[data-event="codeview"]').addClass('disabled');
        };
    };

    /**
     * Popover (http://getbootstrap.com/javascript/#popovers)
     */
    var Popover = function () {
        /**
         * show popover
         * @param {jQuery} popover
         * @param {Element} elPlaceholder - placeholder for popover
         */
        var showPopover = function ($popover, elPlaceholder) {
            var $placeholder = $(elPlaceholder);
            var pos = $placeholder.position(),
                height = $placeholder.height();

            // display popover below placeholder.
            $popover.css({
                display: 'block',
                left: pos.left,
                top: pos.top + height
            });
        };

        /**
         * update current state
         * @param {jQuery} $popover - popover container
         * @param {Object} oStyle - style object
         */
        this.update = function ($popover, oStyle) {
            var $linkPopover = $popover.find('.note-link-popover');

            if (oStyle.anchor) {
                var $anchor = $linkPopover.find('a');
                $anchor.attr('href', oStyle.anchor.href).html(oStyle.anchor.href);
                showPopover($linkPopover, oStyle.anchor);
            } else {
                $linkPopover.hide();
            }

            var $imagePopover = $popover.find('.note-image-popover');
            if (oStyle.image) {
                showPopover($imagePopover, oStyle.image);
            } else {
                $imagePopover.hide();
            }
        };

        /**
         * hide all popovers
         * @param {jQuery} $popover - popover contaienr
         */
        this.hide = function ($popover) {
            $popover.children().hide();
        };
    };

    /**
     * Handle
     */
    var Handle = function () {
        /**
         * update handle
         * @param {jQuery} $handle
         * @param {Object} oStyle
         */
        this.update = function ($handle, oStyle) {
            var $selection = $handle.find('.note-control-selection');
            if (oStyle.image) {
                var $image = $(oStyle.image);
                var pos = $image.position();
                var szImage = {
                    w: $image.width(),
                    h: $image.height()
                };
                $selection.css({
                    display: 'block',
                    left: pos.left,
                    top: pos.top,
                    width: szImage.w,
                    height: szImage.h
                }).data('target', oStyle.image); // save current image element.
                var sSizing = szImage.w + 'x' + szImage.h;
                $selection.find('.note-control-selection-info').text(sSizing);
            } else {
                $selection.hide();
            }
        };

        this.hide = function ($handle) {
            $handle.children().hide();
        };
    };

    /**
     * Dialog
     *
     * @class
     */
    var Dialog = function () {

        /**
         * toggle button status
         *
         * @param {jQuery} $btn
         * @param {Boolean} bEnable
         */
        var toggleBtn = function ($btn, bEnable) {
            $btn.toggleClass('disabled', !bEnable);
            $btn.attr('disabled', !bEnable);
        };

        /**
         * show image dialog
         *
         * @param {jQuery} $editable
         * @param {jQuery} $dialog
         * @return {Promise}
         */
        this.showImageDialog = function ($editable, $dialog) {
            return $.Deferred(function (deferred) {
                var $imageDialog = $dialog.find('.note-image-dialog');

                var $imageInput = $dialog.find('.note-image-input'),
                    $imageUrl = $dialog.find('.note-image-url'),
                    $imageBtn = $dialog.find('.note-image-btn');

                $imageDialog.one('shown.bs.modal', function (event) {
                    event.stopPropagation();

                    // Cloning imageInput to clear element.
                    $imageInput.replaceWith($imageInput.clone()
                            .on('change', function () {
                                $imageDialog.modal('hide');
                                deferred.resolve(this.files);
                            })
                    );

                    $imageBtn.click(function (event) {
                        event.preventDefault();

                        $imageDialog.modal('hide');
                        deferred.resolve($imageUrl.val());
                    });

                    $imageUrl.keyup(function () {
                        toggleBtn($imageBtn, $imageUrl.val());
                    }).val('').focus();
                }).one('hidden.bs.modal', function (event) {
                    event.stopPropagation();

                    $editable.focus();
                    $imageInput.off('change');
                    $imageUrl.off('keyup');
                    $imageBtn.off('click');
                }).modal('show');
            });
        };

        /**
         * Show video dialog and set event handlers on dialog controls.
         *
         * @param {jQuery} $dialog
         * @param {Object} videoInfo
         * @return {Promise}
         */
        this.showVideoDialog = function ($editable, $dialog, videoInfo) {
            return $.Deferred(function (deferred) {
                var $videoDialog = $dialog.find('.note-video-dialog');
                var $videoUrl = $videoDialog.find('.note-video-url'),
                    $videoBtn = $videoDialog.find('.note-video-btn');

                $videoDialog.one('shown.bs.modal', function (event) {
                    event.stopPropagation();

                    $videoUrl.val(videoInfo.text).keyup(function () {
                        toggleBtn($videoBtn, $videoUrl.val());
                    }).trigger('keyup').trigger('focus');

                    $videoBtn.click(function (event) {
                        event.preventDefault();

                        $videoDialog.modal('hide');
                        deferred.resolve($videoUrl.val());
                    });
                }).one('hidden.bs.modal', function (event) {
                    event.stopPropagation();

                    $editable.focus();
                    $videoUrl.off('keyup');
                    $videoBtn.off('click');
                }).modal('show');
            });
        };

        /**
         * Show link dialog and set event handlers on dialog controls.
         *
         * @param {jQuery} $dialog
         * @param {Object} linkInfo
         * @return {Promise}
         */
        this.showLinkDialog = function ($editable, $dialog, linkInfo) {
            return $.Deferred(function (deferred) {
                var $linkDialog = $dialog.find('.note-link-dialog');

                var $linkText = $linkDialog.find('.note-link-text'),
                    $linkUrl = $linkDialog.find('.note-link-url'),
                    $linkBtn = $linkDialog.find('.note-link-btn'),
                    $openInNewWindow = $linkDialog.find('input[type=checkbox]');

                $linkDialog.one('shown.bs.modal', function (event) {
                    event.stopPropagation();

                    $linkText.val(linkInfo.text);

                    $linkUrl.keyup(function () {
                        toggleBtn($linkBtn, $linkUrl.val());
                        // display same link on `Text to display` input
                        // when create a new link
                        if (!linkInfo.text) {
                            $linkText.val($linkUrl.val());
                        }
                    }).val(linkInfo.url).trigger('focus');

                    $openInNewWindow.prop('checked', linkInfo.newWindow);

                    $linkBtn.one('click', function (event) {
                        event.preventDefault();

                        $linkDialog.modal('hide');
                        deferred.resolve($linkUrl.val(), $openInNewWindow.is(':checked'));
                    });
                }).one('hidden.bs.modal', function (event) {
                    event.stopPropagation();

                    $editable.focus();
                    $linkUrl.off('keyup');
                }).modal('show');
            }).promise();
        };

        /**
         * show help dialog
         *
         * @param {jQuery} $dialog
         */
        this.showHelpDialog = function ($editable, $dialog) {
            var $helpDialog = $dialog.find('.note-help-dialog');

            $helpDialog.one('hidden.bs.modal', function (event) {
                event.stopPropagation();
                $editable.focus();
            }).modal('show');
        };
    };

    /**
     * EventHandler
     */
    var EventHandler = function () {
        var editor = new Editor();
        var toolbar = new Toolbar(),
            popover = new Popover();
        var handle = new Handle(),
            dialog = new Dialog();

        /**
         * returns makeLayoutInfo from editor's descendant node.
         *
         * @param {Element} descendant
         * @returns {Object}
         */
        var makeLayoutInfo = function (descendant) {
            var $editor = $(descendant).closest('.note-editor');
            return $editor.length > 0 && dom.buildLayoutInfo($editor);
        };

        /**
         * insert Images from file array.
         *
         * @param {jQuery} $editable
         * @param {File[]} files
         */
        var insertImages = function ($editable, files) {
            editor.restoreRange($editable);
            var callbacks = $editable.data('callbacks');

            // If onImageUpload options setted
            if (callbacks.onImageUpload) {
                callbacks.onImageUpload(files, editor, $editable);
                // else insert Image as dataURL
            } else {
                $.each(files, function (idx, file) {
                    async.readFileAsDataURL(file).then(function (sDataURL) {
                        editor.insertImage($editable, sDataURL);
                    }).fail(function () {
                        if (callbacks.onImageUploadError) {
                            callbacks.onImageUploadError();
                        }
                    });
                });
            }
        };

        var hMousedown = function (event) {
            //preventDefault Selection for FF, IE8+
            if (dom.isImg(event.target)) {
                event.preventDefault();
            }
        };

        var hToolbarAndPopoverUpdate = function (event) {
            var oLayoutInfo = makeLayoutInfo(event.currentTarget || event.target);
            var oStyle = editor.currentStyle(event.target);
            if (!oStyle) {
                return;
            }
            toolbar.update(oLayoutInfo.toolbar(), oStyle);
            popover.update(oLayoutInfo.popover(), oStyle);
            handle.update(oLayoutInfo.handle(), oStyle);
        };

        var hScroll = function (event) {
            var oLayoutInfo = makeLayoutInfo(event.currentTarget || event.target);
            //hide popover and handle when scrolled
            popover.hide(oLayoutInfo.popover());
            handle.hide(oLayoutInfo.handle());
        };

        /**
         * `mousedown` event handler on $handle
         *  - controlSizing: resize image
         *
         * @param {MouseEvent} event
         */
        var hHandleMousedown = function (event) {
            if (dom.isControlSizing(event.target)) {
                var oLayoutInfo = makeLayoutInfo(event.target),
                    $handle = oLayoutInfo.handle(),
                    $popover = oLayoutInfo.popover(),
                    $editable = oLayoutInfo.editable(),
                    $editor = oLayoutInfo.editor();

                var elTarget = $handle.find('.note-control-selection').data('target'),
                    $target = $(elTarget);
                var posStart = $target.offset(),
                    scrollTop = $(document).scrollTop();

                $editor.on('mousemove', function (event) {

                    editor.resizeTo({
                        x: event.clientX - posStart.left,
                        y: event.clientY - (posStart.top - scrollTop)
                    }, $target, !event.shiftKey);

                    handle.update($handle, {
                        image: elTarget
                    });
                    popover.update($popover, {
                        image: elTarget
                    });
                }).one('mouseup', function () {
                    $editor.off('mousemove');
                });

                if (!$target.data('ratio')) { // original ratio.
                    $target.data('ratio', $target.height() / $target.width());
                }

                editor.recordUndo($editable);
                event.stopPropagation();
                event.preventDefault();
            }
        };

        var hToolbarAndPopoverMousedown = function (event) {
            // prevent default event when insertTable (FF, Webkit)
            var $btn = $(event.target).closest('[data-event]');
            if ($btn.length > 0) {
                event.preventDefault();
            }
        };

        var hToolbarAndPopoverClick = function (event) {
            var $btn = $(event.target).closest('[data-event]');

            if ($btn.length > 0) {
                var sEvent = $btn.attr('data-event'),
                    sValue = $btn.attr('data-value');

                var oLayoutInfo = makeLayoutInfo(event.target);
                var $editor = oLayoutInfo.editor(),
                    $toolbar = oLayoutInfo.toolbar(),
                    $dialog = oLayoutInfo.dialog(),
                    $editable = oLayoutInfo.editable(),
                    $codable = oLayoutInfo.codable();

                var server;
                var cmEditor;

                var options = $editor.data('options');

                // before command: detect control selection element($target)
                var $target;
                if ($.inArray(sEvent, ['resize', 'floatMe', 'removeMedia']) !== -1) {
                    var $handle = oLayoutInfo.handle();
                    var $selection = $handle.find('.note-control-selection');
                    $target = $($selection.data('target'));
                }

                if (editor[sEvent]) { // on command
                    $editable.trigger('focus');
                    editor[sEvent]($editable, sValue, $target);
                }

                // after command
                if ($.inArray(sEvent, ['backColor', 'foreColor']) !== -1) {
                    toolbar.updateRecentColor($btn[0], sEvent, sValue);
                } else if (sEvent === 'showLinkDialog') { // popover to dialog
                    $editable.focus();
                    var linkInfo = editor.getLinkInfo();

                    editor.saveRange($editable);
                    dialog.showLinkDialog($editable, $dialog, linkInfo).then(function (sLinkUrl, bNewWindow) {
                        editor.restoreRange($editable);
                        editor.createLink($editable, sLinkUrl, bNewWindow);
                    });
                } else if (sEvent === 'showImageDialog') {
                    $editable.focus();

                    dialog.showImageDialog($editable, $dialog).then(function (data) {
                        if (typeof data === 'string') {
                            editor.restoreRange($editable);
                            editor.insertImage($editable, data);
                        } else {
                            insertImages($editable, data);
                        }
                    });
                } else if (sEvent === 'showVideoDialog') {
                    $editable.focus();
                    var videoInfo = editor.getVideoInfo();

                    editor.saveRange($editable);
                    dialog.showVideoDialog($editable, $dialog, videoInfo).then(function (sUrl) {
                        editor.restoreRange($editable);
                        editor.insertVideo($editable, sUrl);
                    });
                } else if (sEvent === 'showHelpDialog') {
                    dialog.showHelpDialog($editable, $dialog);
                } else if (sEvent === 'fullscreen') {
                    var $scrollbar = $('html, body');

                    var resize = function (size) {
                        $editor.css('width', size.w);
                        $editable.css('height', size.h);
                        $codable.css('height', size.h);
                        if ($codable.data('cmEditor')) {
                            $codable.data('cmEditor').setSize(null, size.h);
                        }
                    };

                    $editor.toggleClass('fullscreen');
                    var isFullscreen = $editor.hasClass('fullscreen');
                    if (isFullscreen) {
                        $editable.data('orgHeight', $editable.css('height'));

                        $(window).on('resize', function () {
                            resize({
                                w: $(window).width(),
                                h: $(window).height() - $toolbar.outerHeight()
                            });
                        }).trigger('resize');

                        $scrollbar.css('overflow', 'hidden');
                    } else {
                        $(window).off('resize');
                        resize({
                            w: options.width || '',
                            h: $editable.data('orgHeight')
                        });
                        $scrollbar.css('overflow', 'auto');
                    }
                    toolbar.updateFullscreen($toolbar, isFullscreen);
                } else if (sEvent === 'codeview') {
                    $editor.toggleClass('codeview');

                    var bCodeview = $editor.hasClass('codeview');
                    if (bCodeview) {
                        $codable.val($editable.html());
                        $codable.height($editable.height());
                        toolbar.deactivate($toolbar);
                        $codable.focus();

                        // activate CodeMirror as codable
                        if (agent.bCodeMirror) {
                            cmEditor = CodeMirror.fromTextArea($codable[0], $.extend({
                                mode: 'text/html',
                                lineNumbers: true
                            }, options.codemirror));
                            var tern = $editor.data('options').codemirror.tern || false;
                            if (tern) {
                                server = new CodeMirror.TernServer(tern);
                                cmEditor.ternServer = server;
                                cmEditor.on('cursorActivity', function (cm) {
                                    server.updateArgHints(cm);
                                });
                            }

                            // CodeMirror hasn't Padding.
                            cmEditor.setSize(null, $editable.outerHeight());
                            // autoFormatRange If formatting included
                            if (cmEditor.autoFormatRange) {
                                cmEditor.autoFormatRange({
                                    line: 0,
                                    ch: 0
                                }, {
                                    line: cmEditor.lineCount(),
                                    ch: cmEditor.getTextArea().value.length
                                });
                            }
                            $codable.data('cmEditor', cmEditor);
                        }
                    } else {
                        // deactivate CodeMirror as codable
                        if (agent.bCodeMirror) {
                            cmEditor = $codable.data('cmEditor');
                            $codable.val(cmEditor.getValue());
                            cmEditor.toTextArea();
                        }

                        $editable.html($codable.val() || dom.emptyPara);
                        $editable.height(options.height ? $codable.height() : 'auto');

                        toolbar.activate($toolbar);
                        $editable.focus();
                    }

                    toolbar.updateCodeview(oLayoutInfo.toolbar(), bCodeview);
                }

                hToolbarAndPopoverUpdate(event);
            }
        };

        var EDITABLE_PADDING = 24;
        /**
         * `mousedown` event handler on statusbar
         *
         * @param {MouseEvent} event
         */
        var hStatusbarMousedown = function (event) {
            var $document = $(document);
            var $editable = makeLayoutInfo(event.target).editable();
            var nEditableTop = $editable.offset().top - $document.scrollTop();

            $document.on('mousemove', function (event) {
                var nHeight = event.clientY - (nEditableTop + EDITABLE_PADDING);
                $editable.height(nHeight);
            }).one('mouseup', function () {
                $document.off('mousemove');
            });

            event.stopPropagation();
            event.preventDefault();
        };

        var PX_PER_EM = 18;
        var hDimensionPickerMove = function (event) {
            var $picker = $(event.target.parentNode); // target is mousecatcher
            var $dimensionDisplay = $picker.next();
            var $catcher = $picker.find('.note-dimension-picker-mousecatcher');
            var $highlighted = $picker.find('.note-dimension-picker-highlighted');
            var $unhighlighted = $picker.find('.note-dimension-picker-unhighlighted');

            var posOffset;
            // HTML5 with jQuery - e.offsetX is undefined in Firefox
            if (event.offsetX === undefined) {
                var posCatcher = $(event.target).offset();
                posOffset = {
                    x: event.pageX - posCatcher.left,
                    y: event.pageY - posCatcher.top
                };
            } else {
                posOffset = {
                    x: event.offsetX,
                    y: event.offsetY
                };
            }

            var dim = {
                c: Math.ceil(posOffset.x / PX_PER_EM) || 1,
                r: Math.ceil(posOffset.y / PX_PER_EM) || 1
            };

            $highlighted.css({
                width: dim.c + 'em',
                height: dim.r + 'em'
            });
            $catcher.attr('data-value', dim.c + 'x' + dim.r);

            if (3 < dim.c && dim.c < 10) { // 5~10
                $unhighlighted.css({
                    width: dim.c + 1 + 'em'
                });
            }

            if (3 < dim.r && dim.r < 10) { // 5~10
                $unhighlighted.css({
                    height: dim.r + 1 + 'em'
                });
            }

            $dimensionDisplay.html(dim.c + ' x ' + dim.r);
        };

        /**
         * attach Drag and Drop Events
         *
         * @param {Object} oLayoutInfo - layout Informations
         */
        var attachDragAndDropEvent = function (oLayoutInfo) {
            var collection = $(),
                $dropzone = oLayoutInfo.dropzone,
                $dropzoneMessage = oLayoutInfo.dropzone.find('.note-dropzone-message');

            // show dropzone on dragenter when dragging a object to document.
            $(document).on('dragenter', function (e) {
                var bCodeview = oLayoutInfo.editor.hasClass('codeview');
                if (!bCodeview && collection.length === 0) {
                    oLayoutInfo.editor.addClass('dragover');
                    $dropzone.width(oLayoutInfo.editor.width());
                    $dropzone.height(oLayoutInfo.editor.height());
                    $dropzoneMessage.text('Drag Image Here');
                }
                collection = collection.add(e.target);
            }).on('dragleave', function (e) {
                collection = collection.not(e.target);
                if (collection.length === 0) {
                    oLayoutInfo.editor.removeClass('dragover');
                }
            }).on('drop', function () {
                collection = $();
                oLayoutInfo.editor.removeClass('dragover');
            });

            // change dropzone's message on hover.
            $dropzone.on('dragenter', function () {
                $dropzone.addClass('hover');
                $dropzoneMessage.text('Drop Image');
            }).on('dragleave', function () {
                $dropzone.removeClass('hover');
                $dropzoneMessage.text('Drag Image Here');
            });

            // attach dropImage
            $dropzone.on('drop', function (event) {
                var dataTransfer = event.originalEvent.dataTransfer;
                if (dataTransfer && dataTransfer.files) {
                    var oLayoutInfo = makeLayoutInfo(event.currentTarget || event.target);
                    oLayoutInfo.editable().focus();
                    insertImages(oLayoutInfo.editable(), dataTransfer.files);
                }
                event.preventDefault();
            }).on('dragover', false); // prevent default dragover event
        };


        /**
         * bind KeyMap on keydown
         *
         * @param {Object} oLayoutInfo
         * @param {Object} keyMap
         */
        this.bindKeyMap = function (oLayoutInfo, keyMap) {
            var $editor = oLayoutInfo.editor;
            var $editable = oLayoutInfo.editable;

            $editable.on('keydown', function (event) {
                var aKey = [];

                // modifier
                if (event.metaKey) {
                    aKey.push('CMD');
                }
                if (event.ctrlKey) {
                    aKey.push('CTRL');
                }
                if (event.shiftKey) {
                    aKey.push('SHIFT');
                }

                // keycode
                var keyName = key.nameFromCode[event.keyCode];
                if (keyName) {
                    aKey.push(keyName);
                }

                var handler = keyMap[aKey.join('+')];
                if (handler) {
                    event.preventDefault();

                    editor[handler]($editable, $editor.data('options'));
                } else if (key.isEdit(event.keyCode)) {
                    editor.recordUndo($editable);
                }
            });
        };

        /**
         * attach eventhandler
         *
         * @param {Object} oLayoutInfo - layout Informations
         * @param {Object} options - user options include custom event handlers
         * @param {Function} options.enter - enter key handler
         */
        this.attach = function (oLayoutInfo, options) {
            var keyMap = options.keyMap[agent.bMac ? 'mac' : 'pc'];
            this.bindKeyMap(oLayoutInfo, keyMap);

            oLayoutInfo.editable.on('mousedown', hMousedown);
            oLayoutInfo.editable.on('keyup mouseup', hToolbarAndPopoverUpdate);
            oLayoutInfo.editable.on('scroll', hScroll);

            // Doesn't attach `dragAndDrop` event when `options.disableDragAndDrop` is true
            if (!options.disableDragAndDrop) {
                attachDragAndDropEvent(oLayoutInfo);
            }

            oLayoutInfo.handle.on('mousedown', hHandleMousedown);

            oLayoutInfo.toolbar.on('click', hToolbarAndPopoverClick);
            oLayoutInfo.popover.on('click', hToolbarAndPopoverClick);
            oLayoutInfo.toolbar.on('mousedown', hToolbarAndPopoverMousedown);
            oLayoutInfo.popover.on('mousedown', hToolbarAndPopoverMousedown);
            oLayoutInfo.statusbar.on('mousedown', hStatusbarMousedown);

            //toolbar table dimension
            var $toolbar = oLayoutInfo.toolbar;
            var $catcher = $toolbar.find('.note-dimension-picker-mousecatcher');
            $catcher.on('mousemove', hDimensionPickerMove);

            // save selection when focusout
            oLayoutInfo.editable.on('blur', function () {
                editor.saveRange(oLayoutInfo.editable);
            });

            // save options on editor
            oLayoutInfo.editor.data('options', options);

            // ret styleWithCSS for backColor / foreColor clearing with 'inherit'.
            if (options.styleWithSpan && !agent.bMSIE) {
                // protect FF Error: NS_ERROR_FAILURE: Failure
                setTimeout(function () {
                    document.execCommand('styleWithCSS', 0, true);
                });
            }

            // History
            oLayoutInfo.editable.data('NoteHistory', new History());

            // basic event callbacks (lowercase)
            // enter, focus, blur, keyup, keydown
            if (options.onenter) {
                oLayoutInfo.editable.keypress(function (event) {
                    if (event.keyCode === key.ENTER) {
                        options.onenter(event);
                    }
                });
            }
            if (options.onfocus) {
                oLayoutInfo.editable.focus(options.onfocus);
            }
            if (options.onblur) {
                oLayoutInfo.editable.blur(options.onblur);
            }
            if (options.onkeyup) {
                oLayoutInfo.editable.keyup(options.onkeyup);
            }
            if (options.onkeydown) {
                oLayoutInfo.editable.keydown(options.onkeydown);
            }
            if (options.onpaste) {
                oLayoutInfo.editable.on('paste', options.onpaste);
            }
            if (options.onToolbarClick) {
                oLayoutInfo.toolbar.click(options.onToolbarClick);
            }

            // callbacks for advanced features (camel)
            // All editor status will be saved on editable with jquery's data
            // for support multiple editor with singleton object.
            oLayoutInfo.editable.data('callbacks', {
                onChange: options.onChange,
                onAutoSave: options.onAutoSave,
                onImageUpload: options.onImageUpload,
                onImageUploadError: options.onImageUploadError,
                onFileUpload: options.onFileUpload,
                onFileUploadError: options.onFileUpload
            });
        };

        this.dettach = function (oLayoutInfo) {
            oLayoutInfo.editable.off();
            oLayoutInfo.toolbar.off();
            oLayoutInfo.handle.off();
            oLayoutInfo.popover.off();
        };
    };

    /**
     * renderer
     *
     * rendering toolbar and editable
     */
    var Renderer = function () {
        var tplToolbarInfo, tplPopover, tplHandle, tplDialog, tplStatusbar;

        /* jshint ignore:start */
        tplToolbarInfo = {
            picture: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.image.image + '" data-event="showImageDialog" tabindex="-1"><i class="fa fa-picture-o icon-picture"></i></button>';
            },
            ownpicture: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.image.image + '" data-event="showPersonalImageDialog" tabindex="-1"><i class="fa fa-picture-o icon-picture"></i></button>';
            },
            link: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.link.link + '" data-event="showLinkDialog" tabindex="-1"><i class="fa fa-link icon-link"></i></button>';
            },
            video: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.video.video + '" data-event="showVideoDialog" tabindex="-1"><i class="fa fa-youtube-play icon-play"></i></button>';
            },
            table: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" title="' + lang.table.table + '" data-toggle="dropdown" tabindex="-1"><i class="fa fa-table icon-table"></i> <span class="caret"></span></button>' +
                    '<ul class="dropdown-menu">' +
                    '<div class="note-dimension-picker">' +
                    '<div class="note-dimension-picker-mousecatcher" data-event="insertTable" data-value="1x1"></div>' +
                    '<div class="note-dimension-picker-highlighted"></div>' +
                    '<div class="note-dimension-picker-unhighlighted"></div>' +
                    '</div>' +
                    '<div class="note-dimension-display"> 1 x 1 </div>' +
                    '</ul>';
            },
            style: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" title="' + lang.style.style + '" data-toggle="dropdown" tabindex="-1"><i class="fa fa-magic icon-magic"></i> <span class="caret"></span></button>' +
                    '<ul class="dropdown-menu">' +
                    '<li><a data-event="formatBlock" data-value="p">' + lang.style.normal + '</a></li>' +
                    '<li><a data-event="formatBlock" data-value="blockquote"><blockquote>' + lang.style.blockquote + '</blockquote></a></li>' +
                    '<li><a data-event="formatBlock" data-value="pre">' + lang.style.pre + '</a></li>' +
                    '<li><a data-event="formatBlock" data-value="h1"><h1>' + lang.style.h1 + '</h1></a></li>' +
                    '<li><a data-event="formatBlock" data-value="h2"><h2>' + lang.style.h2 + '</h2></a></li>' +
                    '<li><a data-event="formatBlock" data-value="h3"><h3>' + lang.style.h3 + '</h3></a></li>' +
                    '<li><a data-event="formatBlock" data-value="h4"><h4>' + lang.style.h4 + '</h4></a></li>' +
                    '<li><a data-event="formatBlock" data-value="h5"><h5>' + lang.style.h5 + '</h5></a></li>' +
                    '<li><a data-event="formatBlock" data-value="h6"><h6>' + lang.style.h6 + '</h6></a></li>' +
                    '</ul>';
            },
            fontname: function (lang) {
                var aFont = [
                    'Serif', 'Sans', 'Arial', 'Arial Black', 'Courier',
                    'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande',
                    'Lucida Sans', 'Tahoma', 'Times', 'Times New Roman', 'Verdana'
                ];

                var sMarkup = '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" data-toggle="dropdown" title="' + lang.font.name + '" tabindex="-1"><span class="note-current-fontname">Arial</span> <b class="caret"></b></button>';
                sMarkup += '<ul class="dropdown-menu">';
                for (var idx = 0; idx < aFont.length; idx++) {
                    sMarkup += '<li><a data-event="fontName" data-value="' + aFont[idx] + '"><i class="fa fa-check icon-ok"></i> ' + aFont[idx] + '</a></li>';
                }
                sMarkup += '</ul>';

                return sMarkup;
            },
            fontsize: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" data-toggle="dropdown" title="' + lang.font.size + '" tabindex="-1"><span class="note-current-fontsize">11</span> <b class="caret"></b></button>' +
                    '<ul class="dropdown-menu">' +
                    '<li><a data-event="fontSize" data-value="8"><i class="fa fa-check icon-ok"></i> 8</a></li>' +
                    '<li><a data-event="fontSize" data-value="9"><i class="fa fa-check icon-ok"></i> 9</a></li>' +
                    '<li><a data-event="fontSize" data-value="10"><i class="fa fa-check icon-ok"></i> 10</a></li>' +
                    '<li><a data-event="fontSize" data-value="11"><i class="fa fa-check icon-ok"></i> 11</a></li>' +
                    '<li><a data-event="fontSize" data-value="12"><i class="fa fa-check icon-ok"></i> 12</a></li>' +
                    '<li><a data-event="fontSize" data-value="14"><i class="fa fa-check icon-ok"></i> 14</a></li>' +
                    '<li><a data-event="fontSize" data-value="18"><i class="fa fa-check icon-ok"></i> 18</a></li>' +
                    '<li><a data-event="fontSize" data-value="24"><i class="fa fa-check icon-ok"></i> 24</a></li>' +
                    '<li><a data-event="fontSize" data-value="36"><i class="fa fa-check icon-ok"></i> 36</a></li>' +
                    '</ul>';
            },
            color: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small note-recent-color" title="' + lang.color.recent + '" data-event="color" data-value=\'{"backColor":"yellow"}\' tabindex="-1"><i class="fa fa-font icon-font" style="color:black;background-color:yellow;"></i></button>' +
                    '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" title="' + lang.color.more + '" data-toggle="dropdown" tabindex="-1">' +
                    '<span class="caret"></span>' +
                    '</button>' +
                    '<ul class="dropdown-menu">' +
                    '<li>' +
                    '<div class="btn-group">' +
                    '<div class="note-palette-title">' + lang.color.background + '</div>' +
                    '<div class="note-color-reset" data-event="backColor" data-value="inherit" title="' + lang.color.transparent + '">' + lang.color.setTransparent + '</div>' +
                    '<div class="note-color-palette" data-target-event="backColor"></div>' +
                    '</div>' +
                    '<div class="btn-group">' +
                    '<div class="note-palette-title">' + lang.color.foreground + '</div>' +
                    '<div class="note-color-reset" data-event="foreColor" data-value="inherit" title="' + lang.color.reset + '">' + lang.color.resetToDefault + '</div>' +
                    '<div class="note-color-palette" data-target-event="foreColor"></div>' +
                    '</div>' +
                    '</li>' +
                    '</ul>';
            },
            bold: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.font.bold + '" data-shortcut="Ctrl+B" data-mac-shortcut="⌘+B" data-event="bold" tabindex="-1"><i class="fa fa-bold icon-bold"></i></button>';
            },
            italic: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.font.italic + '" data-shortcut="Ctrl+I" data-mac-shortcut="⌘+I" data-event="italic" tabindex="-1"><i class="fa fa-italic icon-italic"></i></button>';
            },
            underline: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.font.underline + '" data-shortcut="Ctrl+U" data-mac-shortcut="⌘+U" data-event="underline" tabindex="-1"><i class="fa fa-underline icon-underline"></i></button>';
            },
            clear: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.font.clear + '" data-shortcut="Ctrl+\\" data-mac-shortcut="⌘+\\" data-event="removeFormat" tabindex="-1"><i class="fa fa-eraser icon-eraser"></i></button>';
            },
            ul: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.lists.unordered + '" data-shortcut="Ctrl+Shift+8" data-mac-shortcut="⌘+⇧+7" data-event="insertUnorderedList" tabindex="-1"><i class="fa fa-list-ul icon-list-ul"></i></button>';
            },
            ol: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.lists.ordered + '" data-shortcut="Ctrl+Shift+7" data-mac-shortcut="⌘+⇧+8" data-event="insertOrderedList" tabindex="-1"><i class="fa fa-list-ol icon-list-ol"></i></button>';
            },
            paragraph: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" title="' + lang.paragraph.paragraph + '" data-toggle="dropdown" tabindex="-1"><i class="fa fa-align-left icon-align-left"></i>  <span class="caret"></span></button>' +
                    '<div class="dropdown-menu">' +
                    '<div class="note-align btn-group">' +
                    '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.paragraph.left + '" data-shortcut="Ctrl+Shift+L" data-mac-shortcut="⌘+⇧+L" data-event="justifyLeft" tabindex="-1"><i class="fa fa-align-left icon-align-left"></i></button>' +
                    '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.paragraph.center + '" data-shortcut="Ctrl+Shift+E" data-mac-shortcut="⌘+⇧+E" data-event="justifyCenter" tabindex="-1"><i class="fa fa-align-center icon-align-center"></i></button>' +
                    '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.paragraph.right + '" data-shortcut="Ctrl+Shift+R" data-mac-shortcut="⌘+⇧+R" data-event="justifyRight" tabindex="-1"><i class="fa fa-align-right icon-align-right"></i></button>' +
                    '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.paragraph.justify + '" data-shortcut="Ctrl+Shift+J" data-mac-shortcut="⌘+⇧+J" data-event="justifyFull" tabindex="-1"><i class="fa fa-align-justify icon-align-justify"></i></button>' +
                    '</div>' +
                    '<div class="note-list btn-group">' +
                    '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.paragraph.outdent + '" data-shortcut="Ctrl+[" data-mac-shortcut="⌘+[" data-event="outdent" tabindex="-1"><i class="fa fa-outdent icon-indent-left"></i></button>' +
                    '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.paragraph.indent + '" data-shortcut="Ctrl+]" data-mac-shortcut="⌘+]" data-event="indent" tabindex="-1"><i class="fa fa-indent icon-indent-right"></i></button>' +
                    '</div>' +
                    '</div>';
            },
            height: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" data-toggle="dropdown" title="' + lang.font.height + '" tabindex="-1"><i class="fa fa-text-height icon-text-height"></i>&nbsp; <b class="caret"></b></button>' +
                    '<ul class="dropdown-menu">' +
                    '<li><a data-event="lineHeight" data-value="1.0"><i class="fa fa-check icon-ok"></i> 1.0</a></li>' +
                    '<li><a data-event="lineHeight" data-value="1.2"><i class="fa fa-check icon-ok"></i> 1.2</a></li>' +
                    '<li><a data-event="lineHeight" data-value="1.4"><i class="fa fa-check icon-ok"></i> 1.4</a></li>' +
                    '<li><a data-event="lineHeight" data-value="1.5"><i class="fa fa-check icon-ok"></i> 1.5</a></li>' +
                    '<li><a data-event="lineHeight" data-value="1.6"><i class="fa fa-check icon-ok"></i> 1.6</a></li>' +
                    '<li><a data-event="lineHeight" data-value="1.8"><i class="fa fa-check icon-ok"></i> 1.8</a></li>' +
                    '<li><a data-event="lineHeight" data-value="2.0"><i class="fa fa-check icon-ok"></i> 2.0</a></li>' +
                    '<li><a data-event="lineHeight" data-value="3.0"><i class="fa fa-check icon-ok"></i> 3.0</a></li>' +
                    '</ul>';
            },
            help: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.options.help + '" data-event="showHelpDialog" tabindex="-1"><i class="fa fa-question icon-question"></i></button>';
            },
            fullscreen: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.options.fullscreen + '" data-event="fullscreen" tabindex="-1"><i class="fa fa-arrows-alt icon-fullscreen"></i></button>';
            },
            codeview: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.options.codeview + '" data-event="codeview" tabindex="-1"><i class="fa fa-code icon-code"></i></button>';
            },
            undo: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.history.undo + '" data-event="undo" tabindex="-1"><i class="fa fa-undo icon-undo"></i></button>';
            },
            redo: function (lang) {
                return '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.history.redo + '" data-event="redo" tabindex="-1"><i class="fa fa-repeat icon-repeat"></i></button>';
            }
        };
        tplPopover = function (lang) {
            return '<div class="note-popover">' +
                '<div class="note-link-popover popover bottom in" style="display: none;">' +
                '<div class="arrow"></div>' +
                '<div class="popover-content note-link-content">' +
                '<a href="http://www.google.com" target="_blank">www.google.com</a>&nbsp;&nbsp;' +
                '<div class="note-insert btn-group">' +
                '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.link.edit + '" data-event="showLinkDialog" tabindex="-1"><i class="fa fa-edit icon-edit"></i></button>' +
                '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.link.unlink + '" data-event="unlink" tabindex="-1"><i class="fa fa-unlink icon-unlink"></i></button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="note-image-popover popover bottom in" style="display: none;">' +
                '<div class="arrow"></div>' +
                '<div class="popover-content note-image-content">' +
                '<div class="btn-group">' +
                '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.image.resizeFull + '" data-event="resize" data-value="1" tabindex="-1"><span class="note-fontsize-10">100%</span> </button>' +
                '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.image.resizeHalf + '" data-event="resize" data-value="0.5" tabindex="-1"><span class="note-fontsize-10">50%</span> </button>' +
                '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.image.resizeQuarter + '" data-event="resize" data-value="0.25" tabindex="-1"><span class="note-fontsize-10">25%</span> </button>' +
                '</div>' +
                '<div class="btn-group">' +
                '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.image.floatLeft + '" data-event="floatMe" data-value="left" tabindex="-1"><i class="fa fa-align-left icon-align-left"></i></button>' +
                '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.image.floatRight + '" data-event="floatMe" data-value="right" tabindex="-1"><i class="fa fa-align-right icon-align-right"></i></button>' +
                '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.image.floatNone + '" data-event="floatMe" data-value="none" tabindex="-1"><i class="fa fa-align-justify icon-align-justify"></i></button>' +
                '</div>' +
                '<div class="btn-group">' +
                '<button type="button" class="btn btn-default btn-sm btn-small" title="' + lang.image.remove + '" data-event="removeMedia" data-value="none" tabindex="-1"><i class="fa fa-trash-o icon-trash"></i></button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        };

        var tplHandle = function () {
            return '<div class="note-handle">' +
                '<div class="note-control-selection">' +
                '<div class="note-control-selection-bg"></div>' +
                '<div class="note-control-holder note-control-nw"></div>' +
                '<div class="note-control-holder note-control-ne"></div>' +
                '<div class="note-control-holder note-control-sw"></div>' +
                '<div class="note-control-sizing note-control-se"></div>' +
                '<div class="note-control-selection-info"></div>' +
                '</div>' +
                '</div>';
        };

        var tplShortcutText = function (lang, options) {
            return '<table class="note-shortcut">' +
                '<thead>' +
                '<tr><th></th><th>' + lang.shortcut.textFormatting + '</th></tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr><td>⌘ + B</td><td>' + lang.font.bold + '</td></tr>' +
                '<tr><td>⌘ + I</td><td>' + lang.font.italic + '</td></tr>' +
                '<tr><td>⌘ + U</td><td>' + lang.font.underline + '</td></tr>' +
                '<tr><td>⌘ + ⇧ + S</td><td>' + lang.font.strike + '</td></tr>' +
                '<tr><td>⌘ + \\</td><td>' + lang.font.clear + '</td></tr>' +
                '</tr>' +
                '</tbody>' +
                '</table>';
        };

        var tplShortcutAction = function (lang, options) {
            return '<table class="note-shortcut">' +
                '<thead>' +
                '<tr><th></th><th>' + lang.shortcut.action + '</th></tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr><td>⌘ + Z</td><td>' + lang.history.undo + '</td></tr>' +
                '<tr><td>⌘ + ⇧ + Z</td><td>' + lang.history.redo + '</td></tr>' +
                '<tr><td>⌘ + ]</td><td>' + lang.paragraph.indent + '</td></tr>' +
                '<tr><td>⌘ + [</td><td>' + lang.paragraph.outdent + '</td></tr>' +
                '<tr><td>⌘ + ENTER</td><td>' + lang.hr.insert + '</td></tr>' +
                '</tbody>' +
                '</table>';
        };

        var tplExtraShortcuts = function (lang, options) {
            var template =
                '<table class="note-shortcut">' +
                '<thead>' +
                '<tr><th></th><th>' + lang.shortcut.extraKeys + '</th></tr>' +
                '</thead>' +
                '<tbody>';
            for (var key in options.extraKeys) {
                if (!options.extraKeys.hasOwnProperty(key)) {
                    continue;
                }
                template += '<tr><td>' + key + '</td><td>' + options.extraKeys[key] + '</td></tr>';
            }
            template += '</tbody></table>';
            return template;
        };

        var tplShortcutPara = function (lang, options) {
            return '<table class="note-shortcut">' +
                '<thead>' +
                '<tr><th></th><th>' + lang.shortcut.paragraphFormatting + '</th></tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr><td>⌘ + ⇧ + L</td><td>' + lang.paragraph.left + '</td></tr>' +
                '<tr><td>⌘ + ⇧ + E</td><td>' + lang.paragraph.center + '</td></tr>' +
                '<tr><td>⌘ + ⇧ + R</td><td>' + lang.paragraph.right + '</td></tr>' +
                '<tr><td>⌘ + ⇧ + J</td><td>' + lang.paragraph.justify + '</td></tr>' +
                '<tr><td>⌘ + ⇧ + NUM7</td><td>' + lang.lists.ordered + '</td></tr>' +
                '<tr><td>⌘ + ⇧ + NUM8</td><td>' + lang.lists.unordered + '</td></tr>' +
                '</tbody>' +
                '</table>';
        };

        var tplShortcutStyle = function (lang, options) {
            return '<table class="note-shortcut">' +
                '<thead>' +
                '<tr><th></th><th>' + lang.shortcut.documentStyle + '</th></tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr><td>⌘ + NUM0</td><td>' + lang.style.normal + '</td></tr>' +
                '<tr><td>⌘ + NUM1</td><td>' + lang.style.h1 + '</td></tr>' +
                '<tr><td>⌘ + NUM2</td><td>' + lang.style.h2 + '</td></tr>' +
                '<tr><td>⌘ + NUM3</td><td>' + lang.style.h3 + '</td></tr>' +
                '<tr><td>⌘ + NUM4</td><td>' + lang.style.h4 + '</td></tr>' +
                '<tr><td>⌘ + NUM5</td><td>' + lang.style.h5 + '</td></tr>' +
                '<tr><td>⌘ + NUM6</td><td>' + lang.style.h6 + '</td></tr>' +
                '</tbody>' +
                '</table>';
        };

        var tplShortcutTable = function (lang, options) {
            var template = '<table class="note-shortcut-layout">' +
                '<tbody>' +
                '<tr><td>' + tplShortcutAction(lang, options) + '</td><td>' + tplShortcutText(lang, options) + '</td></tr>' +
                '<tr><td>' + tplShortcutStyle(lang, options) + '</td><td>' + tplShortcutPara(lang, options) + '</td></tr>';
            if (options.extraKeys) {
                template += '<tr><td colspan="2">' + tplExtraShortcuts(lang, options) + '</td></tr>';
            }
            template += '</tbody</table>';
            return template;
        };

        var replaceMacKeys = function (sHtml) {
            return sHtml.replace(/⌘/g, 'Ctrl').replace(/⇧/g, 'Shift');
        };

        tplDialog = function (lang, options) {
            var tplImageDialog = function () {
                return '<div class="note-image-dialog modal" aria-hidden="false">' +
                    '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<button type="button" class="close" aria-hidden="true" tabindex="-1">&times;</button>' +
                    '<h4>' + lang.image.insert + '</h4>' +
                    '</div>' +
                    '<div class="modal-body">' +
                    '<div class="row-fluid">' +
                    '<h5>' + lang.image.selectFromFiles + '</h5>' +
                    '<input class="note-image-input" type="file" name="files" accept="image/*" />' +
                    '<h5>' + lang.image.url + '</h5>' +
                    '<input class="note-image-url form-control span12" type="text" />' +
                    '</div>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                    '<button href="#" class="btn btn-primary note-image-btn disabled" disabled="disabled">' + lang.image.insert + '</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            };

            var tplLinkDialog = function () {
                return '<div class="note-link-dialog modal" aria-hidden="false">' +
                    '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<button type="button" class="close" aria-hidden="true" tabindex="-1">&times;</button>' +
                    '<h4>' + lang.link.insert + '</h4>' +
                    '</div>' +
                    '<div class="modal-body">' +
                    '<div class="row-fluid">' +
                    '<div class="form-group">' +
                    '<label>' + lang.link.textToDisplay + '</label>' +
                    '<input class="note-link-text form-control span12" disabled type="text" />' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label>' + lang.link.url + '</label>' +
                    '<input class="note-link-url form-control span12" type="text" />' +
                    '</div>' +
                    (!options.disableLinkTarget ?
                        '<div class="checkbox">' +
                        '<label>' + '<input type="checkbox" checked> ' +
                        lang.link.openInNewWindow +
                        '</label>' +
                        '</div>' : ''
                    ) +
                    '</div>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                    '<button href="#" class="btn btn-primary note-link-btn disabled" disabled="disabled">' + lang.link.insert + '</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            };

            var tplVideoDialog = function () {
                return '<div class="note-video-dialog modal" aria-hidden="false">' +
                    '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<button type="button" class="close" aria-hidden="true" tabindex="-1">&times;</button>' +
                    '<h4>' + lang.video.insert + '</h4>' +
                    '</div>' +
                    '<div class="modal-body">' +
                    '<div class="row-fluid">' +

                    '<div class="form-group">' +
                    '<label>' + lang.video.url + '</label>&nbsp;<small class="text-muted">' + lang.video.providers + '</small>' +
                    '<input class="note-video-url form-control span12" type="text" />' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                    '<button href="#" class="btn btn-primary note-video-btn disabled" disabled="disabled">' + lang.video.insert + '</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            };

            var tplHelpDialog = function () {
                return '<div class="note-help-dialog modal" aria-hidden="false">' +
                    '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                    '<div class="modal-body">' +
                    '<a class="modal-close pull-right" aria-hidden="true" tabindex="-1">' + lang.shortcut.close + '</a>' +
                    '<div class="title">' + lang.shortcut.shortcuts + '</div>' +
                    (agent.bMac ? tplShortcutTable(lang, options) : replaceMacKeys(tplShortcutTable(lang, options))) +
                    '<p class="text-center"><a href="//hackerwins.github.io/summernote/" target="_blank">Summernote 0.5.1</a> · <a href="//github.com/HackerWins/summernote" target="_blank">Project</a> · <a href="//github.com/HackerWins/summernote/issues" target="_blank">Issues</a></p>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            };

            return '<div class="note-dialog">' +
                tplImageDialog() +
                tplLinkDialog() +
                tplVideoDialog() +
                tplHelpDialog() +
                '</div>';
        };

        tplStatusbar = function () {
            return '<div class="note-resizebar"><div class="note-icon-bar"></div><div class="note-icon-bar"></div><div class="note-icon-bar"></div></div>';
        };
        /* jshint ignore:end */

        // createTooltip
        var createTooltip = function ($container, sPlacement) {
            $container.find('button').each(function (i, elBtn) {
                var $btn = $(elBtn);
                var tplShortcut = $btn.attr(agent.bMac ? 'data-mac-shortcut' : 'data-shortcut');
                if (tplShortcut) {
                    $btn.attr('title', function (i, v) {
                        return v + ' (' + tplShortcut + ')';
                    });
                }
                // bootstrap tooltip on btn-group bug: https://github.com/twitter/bootstrap/issues/5687
            }).tooltip({
                container: 'body',
                trigger: 'hover',
                placement: sPlacement || 'top'
            }).on('click', function () {
                $(this).tooltip('hide');
            });
        };

        // pallete colors
        var aaColor = [
            ['#000000', '#424242', '#636363', '#9C9C94', '#CEC6CE', '#EFEFEF', '#F7F7F7', '#FFFFFF'],
            ['#FF0000', '#FF9C00', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9C00FF', '#FF00FF'],
            ['#F7C6CE', '#FFE7CE', '#FFEFC6', '#D6EFD6', '#CEDEE7', '#CEE7F7', '#D6D6E7', '#E7D6DE'],
            ['#E79C9C', '#FFC69C', '#FFE79C', '#B5D6A5', '#A5C6CE', '#9CC6EF', '#B5A5D6', '#D6A5BD'],
            ['#E76363', '#F7AD6B', '#FFD663', '#94BD7B', '#73A5AD', '#6BADDE', '#8C7BC6', '#C67BA5'],
            ['#CE0000', '#E79439', '#EFC631', '#6BA54A', '#4A7B8C', '#3984C6', '#634AA5', '#A54A7B'],
            ['#9C0000', '#B56308', '#BD9400', '#397B21', '#104A5A', '#085294', '#311873', '#731842'],
            ['#630000', '#7B3900', '#846300', '#295218', '#083139', '#003163', '#21104A', '#4A1031']
        ];

        // createPalette
        var createPalette = function ($container) {
            $container.find('.note-color-palette').each(function () {
                var $palette = $(this),
                    sEvent = $palette.attr('data-target-event');
                var aPaletteContents = [];
                for (var row = 0, szRow = aaColor.length; row < szRow; row++) {
                    var aColor = aaColor[row];
                    var aButton = [];
                    for (var col = 0, szCol = aColor.length; col < szCol; col++) {
                        var sColor = aColor[col];
                        aButton.push(['<button type="button" class="note-color-btn" style="background-color:', sColor,
                            ';" data-event="', sEvent,
                            '" data-value="', sColor,
                            '" title="', sColor,
                            '" data-toggle="button" tabindex="-1"></button>'
                        ].join(''));
                    }
                    aPaletteContents.push('<div>' + aButton.join('') + '</div>');
                }
                $palette.html(aPaletteContents.join(''));
            });
        };

        /**
         * create summernote layout
         *
         * @param {jQuery} $holder
         * @param {Object} options
         */
        this.createLayout = function ($holder, options) {
            //already created
            var next = $holder.next();
            if (next && next.hasClass('note-editor')) {
                return;
            }

            //01. create Editor
            var $editor = $('<div class="note-editor"></div>');
            if (options.width) {
                $editor.width(options.width);
            }

            //02. statusbar (resizebar)
            if (options.height > 0) {
                $('<div class="note-statusbar">' + tplStatusbar() + '</div>').prependTo($editor);
            }

            //03. create Editable
            var isContentEditable = !$holder.is(':disabled');
            var $editable = $('<div class="note-editable" contentEditable="' + isContentEditable + '"></div>')
                .prependTo($editor);
            if (options.height) {
                $editable.height(options.height);
            }
            if (options.direction) {
                $editable.attr('dir', options.direction);
            }

            $editable.html(dom.html($holder) || dom.emptyPara);

            //031. create codable
            $('<textarea class="note-codable"></textarea>').prependTo($editor);

            var langInfo = $.summernote.lang[options.lang];

            //04. create Toolbar
            var sToolbar = '';
            for (var idx = 0, sz = options.toolbar.length; idx < sz; idx++) {
                var group = options.toolbar[idx];
                sToolbar += '<div class="note-' + group[0] + ' btn-group">';
                for (var i = 0, szGroup = group[1].length; i < szGroup; i++) {
                    sToolbar += tplToolbarInfo[group[1][i]](langInfo);
                }
                sToolbar += '</div>';
            }

            sToolbar = '<div class="note-toolbar btn-toolbar">' + sToolbar + '</div>';

            var $toolbar = $(sToolbar).prependTo($editor);
            createPalette($toolbar);
            createTooltip($toolbar, 'bottom');

            //05. create Popover
            var $popover = $(tplPopover(langInfo)).prependTo($editor);
            createTooltip($popover);

            //06. handle(control selection, ...)
            $(tplHandle()).prependTo($editor);

            //07. create Dialog
            var $dialog = $(tplDialog(langInfo, options)).prependTo($editor);
            $dialog.find('button.close, a.modal-close').click(function () {
                $(this).closest('.modal').modal('hide');
            });

            //08. create Dropzone
            $('<div class="note-dropzone"><div class="note-dropzone-message"></div></div>').prependTo($editor);

            //09. Editor/Holder switch
            $editor.insertAfter($holder);
            $holder.hide();
        };

        /**
         * returns layoutInfo from holder
         *
         * @param {jQuery} $holder - placeholder
         * @returns {Object}
         */
        this.layoutInfoFromHolder = function ($holder) {
            var $editor = $holder.next();
            if (!$editor.hasClass('note-editor')) {
                return;
            }

            var layoutInfo = dom.buildLayoutInfo($editor);
            // cache all properties.
            for (var key in layoutInfo) {
                if (layoutInfo.hasOwnProperty(key)) {
                    layoutInfo[key] = layoutInfo[key].call();
                }
            }
            return layoutInfo;
        };

        /**
         * removeLayout
         *
         * @param {jQuery} $holder - placeholder
         */
        this.removeLayout = function ($holder) {
            var info = this.layoutInfoFromHolder($holder);
            if (!info) {
                return;
            }
            $holder.html(info.editable.html());

            info.editor.remove();
            $holder.show();
        };
    };

    // jQuery namespace for summernote
    $.summernote = $.summernote || {};

    // extends default `settings`
    $.extend($.summernote, settings);

    var renderer = new Renderer();
    var eventHandler = new EventHandler();

    /**
     * extend jquery fn
     */
    $.fn.extend({
        /**
         * initialize summernote
         *  - create editor layout and attach Mouse and keyboard events.
         *
         * @param {Object} options
         * @returns {this}
         */

        summernote: function (options) {
            // extend default options
            options = $.extend({}, $.summernote.options, options);

            this.each(function (idx, elHolder) {
                var $holder = $(elHolder);

                // createLayout with options
                renderer.createLayout($holder, options);

                var info = renderer.layoutInfoFromHolder($holder);
                eventHandler.attach(info, options);

                // Textarea: auto filling the code before form submit.
                if (dom.isTextarea($holder[0])) {
                    $holder.closest('form').submit(function () {
                        $holder.html($holder.code());
                    });
                }
            });

            // focus on first editable element
            if (this.first() && options.focus) {
                var info = renderer.layoutInfoFromHolder(this.first());
                info.editable.focus();
            }

            // callback on init
            if (this.length > 0 && options.oninit) {
                options.oninit();
            }

            return this;
        },

        /**
         * get the HTML contents of note or set the HTML contents of note.
         *
         * @param {String} [sHTML] - HTML contents(optional, set)
         * @returns {this|String} - context(set) or HTML contents of note(get).
         */
        code: function (sHTML) {
            // get the HTML contents of note
            if (sHTML === undefined) {
                var $holder = this.first();
                if ($holder.length === 0) {
                    return;
                }
                var info = renderer.layoutInfoFromHolder($holder);
                if (!!(info && info.editable)) {
                    var bCodeview = info.editor.hasClass('codeview');
                    if (bCodeview && agent.bCodeMirror) {
                        info.codable.data('cmEditor').save();
                    }
                    return bCodeview ? info.codable.val() : info.editable.html();
                }
                return $holder.html();
            }

            // set the HTML contents of note
            this.each(function (i, elHolder) {
                var info = renderer.layoutInfoFromHolder($(elHolder));
                if (info && info.editable) {
                    info.editable.html(sHTML);
                }
            });

            return this;
        },

        insertImage: function (imgSrc) {
            var $img = $('<img>');
            var self = this;
            $img.one('load', function () {
                $('.note-editable').focus();
                var oldRange = $('.note-editable').data('range');
                rangeObj = document.createRange();
                rangeObj.setStart(oldRange.sc, oldRange.so);
                rangeObj.setEnd(oldRange.ec, oldRange.eo);

                var selection = document.getSelection();
                selection.rangeCount > 0 && selection.removeAllRanges();
                selection.addRange(rangeObj);
                rangeObj.insertNode(this);
            }).attr('src', imgSrc);
        },

        /**
         * destroy Editor Layout and dettach Key and Mouse Event
         * @returns {this}
         */
        destroy: function () {
            this.each(function (idx, elHolder) {
                var $holder = $(elHolder);

                var info = renderer.layoutInfoFromHolder($holder);
                if (!info || !info.editable) {
                    return;
                }
                eventHandler.dettach(info);
                renderer.removeLayout($holder);
            });

            return this;
        }
    });
}));
///<jscompress sourcefile="bootstrapValidator.js" />
/**
 * BootstrapValidator (http://bootstrapvalidator.com)
 *
 * A jQuery plugin to validate form fields. Use with Bootstrap 3
 *
 * @version     v0.4.4
 * @author      https://twitter.com/nghuuphuoc
 * @copyright   (c) 2013 - 2014 Nguyen Huu Phuoc
 * @license     MIT
 */

(function ($) {
    var BootstrapValidator = function (form, options) {
        this.$form = $(form);
        this.options = $.extend({}, BootstrapValidator.DEFAULT_OPTIONS, options);

        this.$invalidField = null; // First invalid field
        this.$submitButton = null; // The submit button which is clicked to submit form

        // Validating status
        this.STATUS_NOT_VALIDATED = 'NOT_VALIDATED';
        this.STATUS_VALIDATING = 'VALIDATING';
        this.STATUS_INVALID = 'INVALID';
        this.STATUS_VALID = 'VALID';

        // Determine the event that is fired when user change the field value
        // Most modern browsers supports input event except IE 7, 8.
        // IE 9 supports input event but the event is still not fired if I press the backspace key.
        // Get IE version
        // https://gist.github.com/padolsey/527683/#comment-7595
        var ieVersion = (function () {
            var v = 3,
                div = document.createElement('div'),
                a = div.all || [];
            while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><br><![endif]-->', a[0]);
            return v > 4 ? v : !v;
        }());

        var el = document.createElement('div');
        this._changeEvent = (ieVersion === 9 || !('oninput' in el)) ? 'keyup' : 'input';

        // The flag to indicate that the form is ready to submit when a remote/callback validator returns
        this._submitIfValid = null;

        this._init();
    };

    // The default options
    BootstrapValidator.DEFAULT_OPTIONS = {
        // The form CSS class
        elementClass: 'bv-form',

        // Default invalid message
        message: 'This value is not valid',

        // Indicate fields which won't be validated
        // By default, the plugin will not validate the following kind of fields:
        // - disabled
        // - hidden
        // - invisible
        //
        // The setting consists of jQuery filters. Accept 3 formats:
        // - A string. Use a comma to separate filter
        // - An array. Each element is a filter
        // - An array. Each element can be a callback function
        //      function($field, validator) {
        //          $field is jQuery object representing the field element
        //          validator is the BootstrapValidator instance
        //          return true or false;
        //      }
        //
        // The 3 following settings are equivalent:
        //
        // 1) ':disabled, :hidden, :not(:visible)'
        // 2) [':disabled', ':hidden', ':not(:visible)']
        // 3) [':disabled', ':hidden', function($field) {
        //        return !$field.is(':visible');
        //    }]
        excluded: [':disabled', ':hidden', ':not(:visible)'],

        // Shows ok/error/loading icons based on the field validity.
        // This feature requires Bootstrap v3.1.0 or later (http://getbootstrap.com/css/#forms-control-validation).
        // Since Bootstrap doesn't provide any methods to know its version, this option cannot be on/off automatically.
        // In other word, to use this feature you have to upgrade your Bootstrap to v3.1.0 or later.
        //
        // Examples:
        // - Use Glyphicons icons:
        //  feedbackIcons: {
        //      valid: 'glyphicon glyphicon-ok',
        //      invalid: 'glyphicon glyphicon-remove',
        //      validating: 'glyphicon glyphicon-refresh'
        //  }
        // - Use FontAwesome icons:
        //  feedbackIcons: {
        //      valid: 'fa fa-check',
        //      invalid: 'fa fa-times',
        //      validating: 'fa fa-refresh'
        //  }
        feedbackIcons: {
            valid: null,
            invalid: null,
            validating: null
        },

        // The submit buttons selector
        // These buttons will be disabled to prevent the valid form from multiple submissions
        submitButtons: 'input[type="button"]',

        // The custom submit handler
        // It will prevent the form from the default submission
        //
        //  submitHandler: function(validator, form) {
        //      - validator is the BootstrapValidator instance
        //      - form is the jQuery object present the current form
        //  }
        submitHandler: null,

        // Live validating option
        // Can be one of 3 values:
        // - enabled: The plugin validates fields as soon as they are changed
        // - disabled: Disable the live validating. The error messages are only shown after the form is submitted
        // - submitted: The live validating is enabled after the form is submitted
        live: 'enabled',

        // Map the field name with validator rules
        fields: null
    };

    BootstrapValidator.prototype = {
        constructor: BootstrapValidator,

        /**
         * Init form
         */
        _init: function () {
            var that = this,
                options = {
                    excluded: this.$form.attr('data-bv-excluded'),
                    trigger: this.$form.attr('data-bv-trigger'),
                    message: this.$form.attr('data-bv-message'),
                    submitButtons: this.$form.attr('data-bv-submitbuttons'),
                    live: this.$form.attr('data-bv-live'),
                    fields: {},
                    feedbackIcons: {
                        valid: this.$form.attr('data-bv-feedbackicons-valid'),
                        invalid: this.$form.attr('data-bv-feedbackicons-invalid'),
                        validating: this.$form.attr('data-bv-feedbackicons-validating')
                    }
                },
                validator,
                v, // Validator name
                enabled,
                optionName,
                optionValue,
                html5AttrName,
                html5Attrs;

            this.$form
                // Disable client side validation in HTML 5
                .attr('novalidate', 'novalidate')
                .addClass(this.options.elementClass)
                // Disable the default submission first
                /*.on('submit.bv', function(e) {
                 e.preventDefault();
                 that.validate();
                 })*/
                .on('click', this.options.submitButtons, function () {
                    that.$submitButton = $(this);
                    // The user just click the submit button
                    that._submitIfValid = true;
                })
                // Find all fields which have either "name" or "data-bv-field" attribute
                .find('[name], [data-bv-field]').each(function () {
                    var $field = $(this);
                    // Don't initialize hidden input
                    if ('hidden' == $field.attr('type')) {
                        return;
                    }

                    // add by zhufeng
                    if ('radio' === $field.attr('type') || 'checkbox' === $field.attr('type')) {
                        return;
                    }

                    var field = $field.attr('name') || $field.attr('data-bv-field');
                    $field.attr('data-bv-field', field);

                    options.fields[field] = $.extend({}, {
                        trigger: $field.attr('data-bv-trigger'),
                        message: $field.attr('data-bv-message'),
                        container: $field.attr('data-bv-container'),
                        selector: $field.attr('data-bv-selector'),
                        validators: {}
                    }, options.fields[field]);

                    for (v in $.fn.bootstrapValidator.validators) {
                        validator = $.fn.bootstrapValidator.validators[v];
                        enabled = $field.attr('data-bv-' + v.toLowerCase()) + '';
                        html5Attrs = ('function' == typeof validator.enableByHtml5) ? validator.enableByHtml5($(this)) : null;

                        if ((html5Attrs && enabled != 'false') || (html5Attrs !== true && ('' == enabled || 'true' == enabled))) {
                            // Try to parse the options via attributes
                            validator.html5Attributes = validator.html5Attributes || {
                                    message: 'message'
                                };
                            options.fields[field]['validators'][v] = $.extend({}, html5Attrs == true ? {} : html5Attrs, options.fields[field]['validators'][v]);

                            for (html5AttrName in validator.html5Attributes) {
                                optionName = validator.html5Attributes[html5AttrName];
                                optionValue = $field.attr('data-bv-' + v.toLowerCase() + '-' + html5AttrName);
                                if (optionValue) {
                                    if ('true' == optionValue) {
                                        optionValue = true;
                                    } else if ('false' == optionValue) {
                                        optionValue = false;
                                    }
                                    options.fields[field]['validators'][v][optionName] = optionValue;
                                }
                            }
                        }
                    }
                });

            this.options = $.extend(true, this.options, options);
            if ('string' == typeof this.options.excluded) {
                this.options.excluded = $.map(this.options.excluded.split(','), function (item) {
                    // Trim the spaces
                    return $.trim(item);
                });
            }

            for (var field in this.options.fields) {
                this._initField(field);
            }

            this.setLiveMode(this.options.live);
        },

        /**
         * Init field
         *
         * @param {String} field The field name
         */
        _initField: function (field) {
            if (this.options.fields[field] == null || this.options.fields[field].validators == null) {
                return;
            }

            var fields = this.getFieldElements(field);

            // We don't need to validate non-existing fields
            if (fields == null) {
                delete this.options.fields[field];
                return;
            }
            for (var validatorName in this.options.fields[field].validators) {
                if (!$.fn.bootstrapValidator.validators[validatorName]) {
                    delete this.options.fields[field].validators[validatorName];
                }
            }

            var that = this,
                type = fields.attr('type'),
                event = ('radio' == type || 'checkbox' == type || 'file' == type || 'SELECT' == fields[0].tagName) ? 'change' : that._changeEvent,
                total = fields.length,
                updateAll = (total == 1) || ('radio' == type) || ('checkbox' == type);

            for (var i = 0; i < total; i++) {
                var $field = $(fields[i]),
                    $parent = $field.parents('.form-group'),
                // Allow user to indicate where the error messages are shown
                    $message = this.options.fields[field].container ? $parent.find(this.options.fields[field].container) : this._getMessageContainer($field);

                // Set the attribute to indicate the fields which are defined by selector
                if (this.options.fields[field].selector) {
                    $field.attr('data-bv-field', field);
                }

                // Whenever the user change the field value, mark it as not validated yet
                $field.on(event + '.update.bv', function () {
                    // Reset the flag
                    that._submitIfValid = false;
                    updateAll ? that.updateStatus(field, that.STATUS_NOT_VALIDATED, null) : that.updateElementStatus($(this), that.STATUS_NOT_VALIDATED, null);
                });

                // Create help block elements for showing the error messages
                $field.data('bv.messages', $message);
                for (validatorName in this.options.fields[field].validators) {
                    $field.data('bv.result.' + validatorName, this.STATUS_NOT_VALIDATED);

                    if (!updateAll || i == total - 1) {
                        $('<small/>')
                            .css('display', 'none')
                            .attr('data-bv-validator', validatorName)
                            .attr('data-bv-validator-for', field)
                            .html(this.options.fields[field].validators[validatorName].message || this.options.fields[field].message || this.options.message)
                            .addClass('help-block')
                            .appendTo($message);
                    }
                }

                // Prepare the feedback icons
                // Available from Bootstrap 3.1 (http://getbootstrap.com/css/#forms-control-validation)
                if (this.options.feedbackIcons && this.options.feedbackIcons.validating && this.options.feedbackIcons.invalid && this.options.feedbackIcons.valid && (!updateAll || i == total - 1)) {
                    $parent.addClass('has-feedback');
                    var $icon = $('<i/>').css('display', 'none').addClass('form-control-feedback').attr('data-bv-field', field).insertAfter($field);
                    // The feedback icon does not render correctly if there is no label
                    // https://github.com/twbs/bootstrap/issues/12873
                    if ($parent.find('label').length == 0) {
                        $icon.css('top', 0);
                    }
                }
            }

            if (this.options.fields[field]['enabled'] == null) {
                this.options.fields[field]['enabled'] = true;
            }
        },

        /**
         * Get the element to place the error messages
         *
         * @param {jQuery} $field The field element
         * @returns {jQuery}
         */
        _getMessageContainer: function ($field) {
            var $parent = $field.parent();
            if ($parent.hasClass('form-group')) {
                return $parent;
            }

            var cssClasses = $parent.attr('class');
            if (!cssClasses) {
                return this._getMessageContainer($parent);
            }

            cssClasses = cssClasses.split(' ');
            var n = cssClasses.length;
            for (var i = 0; i < n; i++) {
                if (/^col-(xs|sm|md|lg)-\d+$/.test(cssClasses[i]) || /^col-(xs|sm|md|lg)-offset-\d+$/.test(cssClasses[i])) {
                    return $parent;
                }
            }

            return this._getMessageContainer($parent);
        },

        /**
         * Called when all validations are completed
         */
        _submit: function () {
            if (!this.isValid()) {
                if ('submitted' == this.options.live) {
                    this.setLiveMode('enabled');
                }

                // Focus to the first invalid field
                if (this.$invalidField) {
                    // Activate the tab containing the invalid field if exists
                    var $tab = this.$invalidField.parents('.tab-pane'),
                        tabId;
                    if ($tab && (tabId = $tab.attr('id'))) {
                        $('a[href="#' + tabId + '"][data-toggle="tab"]').trigger('click.bs.tab.data-api');
                    }

                    this.$invalidField.focus();
                }

                return;
            }

            /*// Call the custom submission if enabled
             if (this.options.submitHandler && 'function' == typeof this.options.submitHandler) {
             // If you want to submit the form inside your submit handler, please call defaultSubmit() method
             this.options.submitHandler.call(this, this, this.$form, this.$submitButton);
             } else {
             this.disableSubmitButtons(true).defaultSubmit();
             }*/
        },

        /**
         * Check if the field is excluded.
         * Returning true means that the field will not be validated
         *
         * @param {jQuery} $field The field element
         * @return {Boolean}
         */
        _isExcluded: function ($field) {
            if (this.options.excluded) {
                for (var i in this.options.excluded) {
                    if (('string' == typeof this.options.excluded[i] && $field.is(this.options.excluded[i])) || ('function' == typeof this.options.excluded[i] && this.options.excluded[i].call(this, $field, this) == true)) {
                        return true;
                    }
                }
            }

            return false;
        },

        // --- Public methods ---

        /**
         * Retrieve the field elements by given name
         *
         * @param {String} field The field name
         * @returns {null|jQuery[]}
         */
        getFieldElements: function (field) {
            var fields = this.options.fields[field].selector ? $(this.options.fields[field].selector) : this.$form.find('[name="' + field + '"]');
            return (fields.length == 0) ? null : fields;
        },

        /**
         * Set live validating mode
         *
         * @param {String} mode Live validating mode. Can be 'enabled', 'disabled', 'submitted'
         * @returns {BootstrapValidator}
         */
        setLiveMode: function (mode) {
            this.options.live = mode;
            if ('submitted' == mode) {
                return this;
            }

            var that = this;
            for (var field in this.options.fields) {
                (function (f) {
                    var fields = that.getFieldElements(f);
                    if (fields) {
                        var type = fields.attr('type'),
                            total = fields.length,
                            updateAll = (total == 1) || ('radio' == type) || ('checkbox' == type),
                            trigger = that.options.fields[field].trigger || that.options.trigger || (('radio' == type || 'checkbox' == type || 'file' == type || 'SELECT' == fields[0].tagName) ? 'change' : that._changeEvent),
                            events = $.map(trigger.split(' '), function (item) {
                                return item + '.live.bv';
                            }).join(' ');

                        for (var i = 0; i < total; i++) {
                            ('enabled' == mode) ? $(fields[i]).on(events, function () {
                                updateAll ? that.validateField(f) : that.validateFieldElement($(this), false);
                            }) : $(fields[i]).off(events);
                        }
                    }
                })(field);
            }

            return this;
        },

        /**
         * Disable/enable submit buttons
         *
         * @param {Boolean} disabled Can be true or false
         * @returns {BootstrapValidator}
         */
        disableSubmitButtons: function (disabled) {
            if (!disabled) {
                this.$form.find(this.options.submitButtons).removeAttr('disabled');
            } else if (this.options.live != 'disabled') {
                // Don't disable if the live validating mode is disabled
                this.$form.find(this.options.submitButtons).attr('disabled', 'disabled');
            }

            return this;
        },

        /**
         * Validate the form
         *
         * @return {BootstrapValidator}
         */
        validate: function () {
            if (!this.options.fields) {
                return this;
            }
            // this.disableSubmitButtons(true);

            for (var field in this.options.fields) {
                this.validateField(field);
            }

            // Check if whether the submit button is clicked
            if (this.$submitButton) {
                this._submit();
            }

            return this;
        },

        /**
         * Validate given field
         *
         * @param {String} field The field name
         * @returns {BootstrapValidator}
         */
        validateField: function (field) {
            var fields = this.getFieldElements(field);
            if (!fields) {
                return;
            }
            var type = fields.attr('type'),
                n = (('radio' == type) || ('checkbox' == type)) ? 1 : fields.length;

            for (var i = 0; i < n; i++) {
                this.validateFieldElement($(fields[i]), (n == 1));
            }

            return this;
        },

        /**
         * Validate field element
         *
         * @param {jQuery} $field The field element
         * @param {Boolean} updateAll If true, update status of all elements which have the same name
         * @returns {BootstrapValidator}
         */
        validateFieldElement: function ($field, updateAll) {
            var that = this,
                field = $field.attr('data-bv-field'),
                validators = this.options.fields[field].validators,
                validatorName,
                validateResult;

            // 添加无视验证的判断条件 add by zhufeng
            if (!this.options.fields[field]['enabled'] || this._isExcluded($field) || $field.attr('ignore') === 'Y') {
                return this;
            }

            for (validatorName in validators) {
                if ($field.data('bv.dfs.' + validatorName)) {
                    $field.data('bv.dfs.' + validatorName).reject();
                }

                // Don't validate field if it is already done
                var result = $field.data('bv.result.' + validatorName);

                // 这里是为了避免重复验证的方法，但是我们没有必要使用它 add by zhufeng
                // if (result == this.STATUS_VALID || result == this.STATUS_INVALID) {
                //     continue;
                // }

                $field.data('bv.result.' + validatorName, this.STATUS_VALIDATING);
                validateResult = $.fn.bootstrapValidator.validators[validatorName].validate(this, $field, validators[validatorName]);

                if ('object' == typeof validateResult) {
                    updateAll ? this.updateStatus(field, this.STATUS_VALIDATING, validatorName) : this.updateElementStatus($field, this.STATUS_VALIDATING, validatorName);
                    $field.data('bv.dfs.' + validatorName, validateResult);

                    validateResult.done(function ($f, v, isValid) {
                        // v is validator name
                        $f.removeData('bv.dfs.' + v);
                        updateAll ? that.updateStatus($f.attr('data-bv-field'), isValid ? that.STATUS_VALID : that.STATUS_INVALID, v) : that.updateElementStatus($f, isValid ? that.STATUS_VALID : that.STATUS_INVALID, v);

                        if (isValid && that._submitIfValid == true) {
                            // If a remote validator returns true and the form is ready to submit, then do it
                            that._submit();
                        }
                    });
                } else if ('boolean' == typeof validateResult) {
                    updateAll ? this.updateStatus(field, validateResult ? this.STATUS_VALID : this.STATUS_INVALID, validatorName) : this.updateElementStatus($field, validateResult ? this.STATUS_VALID : this.STATUS_INVALID, validatorName);
                }
            }

            return this;
        },

        /**
         * Update all validating results of elements which have the same field name
         *
         * @param {String} field The field name
         * @param {String} status The status. Can be 'NOT_VALIDATED', 'VALIDATING', 'INVALID' or 'VALID'
         * @param {String} [validatorName] The validator name. If null, the method updates validity result for all validators
         * @return {BootstrapValidator}
         */
        updateStatus: function (field, status, validatorName) {
            var fields = this.getFieldElements(field),
                type = fields.attr('type'),
                n = (('radio' == type) || ('checkbox' == type)) ? 1 : fields.length;

            for (var i = 0; i < n; i++) {
                this.updateElementStatus($(fields[i]), status, validatorName);
            }

            return this;
        },

        /**
         * Update validating result of given element
         *
         * @param {jQuery} $field The field element
         * @param {String} status The status. Can be 'NOT_VALIDATED', 'VALIDATING', 'INVALID' or 'VALID'
         * @param {String} [validatorName] The validator name. If null, the method updates validity result for all validators
         * @return {BootstrapValidator}
         */
        updateElementStatus: function ($field, status, validatorName) {
            var that = this,
                field = $field.attr('data-bv-field'),
                $parent = $field.parents('.form-group').eq(0),
                $message = $field.data('bv.messages'),
                $errors = $message.find('.help-block[data-bv-validator]'),
                $icon = $parent.find('.form-control-feedback[data-bv-field="' + field + '"]');

            // Update status
            if (validatorName) {
                $field.data('bv.result.' + validatorName, status);
            } else {
                for (var v in this.options.fields[field].validators) {
                    $field.data('bv.result.' + v, status);
                }
            }

            // Determine the tab containing the element
            var $tabPane = $field.parents('.tab-pane'),
                tabId,
                $tab;
            if ($tabPane && (tabId = $tabPane.attr('id'))) {
                $tab = $('a[href="#' + tabId + '"][data-toggle="tab"]').parent();
            }

            // Show/hide error elements and feedback icons
            switch (status) {
                case this.STATUS_VALIDATING:
                    this.disableSubmitButtons(true);
                    $parent.removeClass('has-success').removeClass('has-error');
                    // TODO: Show validating message
                    validatorName ? $errors.filter('.help-block[data-bv-validator="' + validatorName + '"]').hide() : $errors.hide();
                    if ($icon) {
                        $icon.removeClass(this.options.feedbackIcons.valid).removeClass(this.options.feedbackIcons.invalid).addClass(this.options.feedbackIcons.validating).show();
                    }
                    if ($tab) {
                        $tab.removeClass('bv-tab-success').removeClass('bv-tab-error');
                    }
                    break;

                case this.STATUS_INVALID:
                    this.disableSubmitButtons(true);
                    $parent.removeClass('has-success').addClass('has-error');
                    validatorName ? $errors.filter('[data-bv-validator="' + validatorName + '"]').show() : $errors.show();
                    if ($icon) {
                        $icon.removeClass(this.options.feedbackIcons.valid).removeClass(this.options.feedbackIcons.validating).addClass(this.options.feedbackIcons.invalid).show();
                    }
                    if ($tab) {
                        $tab.removeClass('bv-tab-success').addClass('bv-tab-error');
                    }
                    break;

                case this.STATUS_VALID:
                    validatorName ? $errors.filter('[data-bv-validator="' + validatorName + '"]').hide() : $errors.hide();

                    // If the field is valid (passes all validators)
                    var validField = ($errors.filter(function () {
                        var display = $(this).css('display'),
                            v = $(this).attr('data-bv-validator');
                        return ('block' == display) || ($field.data('bv.result.' + v) != that.STATUS_VALID);
                    }).length == 0);
                    this.disableSubmitButtons(validField ? false : true);
                    if ($icon) {
                        $icon
                            .removeClass(this.options.feedbackIcons.invalid).removeClass(this.options.feedbackIcons.validating).removeClass(this.options.feedbackIcons.valid)
                            .addClass(validField ? this.options.feedbackIcons.valid : this.options.feedbackIcons.invalid)
                            .show();
                    }

                    // Check if all elements in given container are valid
                    var isValidContainer = function ($container) {
                        return $container
                                .find('.help-block[data-bv-validator]')
                                .filter(function () {
                                    var display = $(this).css('display'),
                                        v = $(this).attr('data-bv-validator');
                                    return ('block' == display) || ($field.data('bv.result.' + v) && $field.data('bv.result.' + v) != that.STATUS_VALID);
                                })
                                .length == 0;
                    };
                    $parent.removeClass('has-error has-success').addClass(isValidContainer($parent) ? 'has-success' : 'has-error');
                    if ($tab) {
                        $tab.removeClass('bv-tab-success').removeClass('bv-tab-error').addClass(isValidContainer($tabPane) ? 'bv-tab-success' : 'bv-tab-error');
                    }
                    break;

                case this.STATUS_NOT_VALIDATED:
                default:
                    this.disableSubmitButtons(false);
                    $parent.removeClass('has-success').removeClass('has-error');
                    validatorName ? $errors.filter('.help-block[data-bv-validator="' + validatorName + '"]').hide() : $errors.hide();
                    if ($icon) {
                        $icon.removeClass(this.options.feedbackIcons.valid).removeClass(this.options.feedbackIcons.invalid).removeClass(this.options.feedbackIcons.validating).hide();
                    }
                    if ($tab) {
                        $tab.removeClass('bv-tab-success').removeClass('bv-tab-error');
                    }
                    break;
            }

            return this;
        },

        /**
         * Check the form validity
         *
         * @returns {Boolean}
         */
        isValid: function () {
            var fields, field, $field,
                type, status, validatorName,
                n, i;
            for (field in this.options.fields) {
                if (this.options.fields[field] == null || !this.options.fields[field]['enabled']) {
                    continue;
                }

                fields = this.getFieldElements(field);
                type = fields.attr('type');
                n = (('radio' == type) || ('checkbox' == type)) ? 1 : fields.length;

                for (i = 0; i < n; i++) {
                    $field = $(fields[i]);
                    if (this._isExcluded($field) || $field.attr('ignore') === 'Y') {
                        continue;
                    }

                    for (validatorName in this.options.fields[field].validators) {
                        status = $field.data('bv.result.' + validatorName);
                        if (status == this.STATUS_NOT_VALIDATED || status == this.STATUS_VALIDATING) {
                            return false;
                        }

                        if (status == this.STATUS_INVALID) {
                            this.$invalidField = $field;
                            return false;
                        }
                    }
                }
            }

            return true;
        },

        /**
         * Submit the form using default submission.
         * It also does not perform any validations when submitting the form
         *
         * It might be used when you want to submit the form right inside the submitHandler()
         */
        defaultSubmit: function () {
            this.$form.off('submit.bv').submit();
        },

        // Useful APIs which aren't used internally

        /**
         * Reset the form
         *
         * @param {Boolean} resetFormData Reset current form data
         * @return {BootstrapValidator}
         */
        resetForm: function (resetFormData) {
            var field, fields, total, type, validator;
            for (field in this.options.fields) {
                fields = this.getFieldElements(field);
                total = fields.length;

                for (var i = 0; i < total; i++) {
                    for (validator in this.options.fields[field].validators) {
                        $(fields[i]).removeData('bv.dfs.' + validator);
                    }
                }

                // Mark field as not validated yet
                this.updateStatus(field, this.STATUS_NOT_VALIDATED, null);

                if (resetFormData) {
                    type = fields.attr('type');
                    ('radio' == type || 'checkbox' == type) ? fields.removeAttr('checked').removeAttr('selected') : fields.val('');
                }
            }

            this.$invalidField = null;
            this.$submitButton = null;

            // Enable submit buttons
            this.disableSubmitButtons(false);

            return this;
        },

        /**
         * Enable/Disable all validators to given field
         *
         * @param {String} field The field name
         * @param {Boolean} enabled Enable/Disable field validators
         * @return {BootstrapValidator}
         */
        enableFieldValidators: function (field, enabled) {
            this.options.fields[field]['enabled'] = enabled;
            this.updateStatus(field, this.STATUS_NOT_VALIDATED, null);

            return this;
        }
    };

    // Plugin definition
    $.fn.bootstrapValidator = function (option, params) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('bootstrapValidator'),
                options = 'object' == typeof option && option;
            if (!data) {
                data = new BootstrapValidator(this, options);
                $this.data('bootstrapValidator', data);
            }

            // Allow to call plugin method
            if ('string' == typeof option) {
                data[option](params);
            }
        });
    };

    // Available validators
    $.fn.bootstrapValidator.validators = {};

    $.fn.bootstrapValidator.Constructor = BootstrapValidator;

    // Helper methods, which can be used in validator class
    $.fn.bootstrapValidator.helpers = {
        /**
         * Implement Luhn validation algorithm ((http://en.wikipedia.org/wiki/Luhn))
         * Credit to https://gist.github.com/ShirtlessKirk/2134376
         *
         * @param {String} value
         * @returns {Boolean}
         */
        luhn: function (value) {
            var length = value.length,
                mul = 0,
                prodArr = [
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                    [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]
                ],
                sum = 0;

            while (length--) {
                sum += prodArr[mul][parseInt(value.charAt(length), 10)];
                mul ^= 1;
            }

            return (sum % 10 === 0 && sum > 0);
        },

        /**
         * Implement modulus 11, 10 (ISO 7064) algorithm
         *
         * @param {String} value
         * @returns {Boolean}
         */
        mod_11_10: function (value) {
            var check = 5,
                length = value.length;
            for (var i = 0; i < length; i++) {
                check = (((check || 10) * 2) % 11 + parseInt(value.charAt(i), 10)) % 10;
            }
            return (check == 1);
        },

        /**
         * Implements Mod 37, 36 (ISO 7064) algorithm
         * Usages:
         * mod_37_36('A12425GABC1234002M')
         * mod_37_36('002006673085', '0123456789')
         *
         * @param {String} value
         * @param {String} alphabet
         * @returns {Boolean}
         */
        mod_37_36: function (value, alphabet) {
            alphabet = alphabet || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var modulus = alphabet.length,
                length = value.length,
                check = Math.floor(modulus / 2);
            for (var i = 0; i < length; i++) {
                check = (((check || modulus) * 2) % (modulus + 1) + alphabet.indexOf(value.charAt(i))) % modulus;
            }
            return (check == 1);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.base64 = {
        /**
         * Return true if the input value is a base 64 encoded string.
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.between = {
        html5Attributes: {
            message: 'message',
            min: 'min',
            max: 'max',
            inclusive: 'inclusive'
        },

        enableByHtml5: function ($field) {
            if ('range' == $field.attr('type')) {
                return {
                    min: $field.attr('min'),
                    max: $field.attr('max')
                };
            }

            return false;
        },

        /**
         * Return true if the input value is between (strictly or not) two given numbers
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - min
         * - max
         * - inclusive [optional]: Can be true or false. Default is true
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            value = parseFloat(value);
            return (options.inclusive === true) ? (value > options.min && value < options.max) : (value >= options.min && value <= options.max);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.callback = {
        /**
         * Return result from the callback method
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - callback: The callback method that passes 2 parameters:
         *      callback: function(fieldValue, validator) {
         *          // fieldValue is the value of field
         *          // validator is instance of BootstrapValidator
         *      }
         * - message: The invalid message
         * @returns {Boolean|Deferred}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (options.callback && 'function' == typeof options.callback) {
                var dfd = new $.Deferred();
                dfd.resolve($field, 'callback', options.callback.call(this, value, validator));
                return dfd;
            }
            return true;
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.choice = {
        html5Attributes: {
            message: 'message',
            min: 'min',
            max: 'max'
        },

        /**
         * Check if the number of checked boxes are less or more than a given number
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consists of following keys:
         * - min
         * - max
         * At least one of two keys is required
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var numChoices = $field.is('select') ? validator.getFieldElements($field.attr('data-bv-field')).find('option').filter(':selected').length : validator.getFieldElements($field.attr('data-bv-field')).filter(':checked').length;
            if ((options.min && numChoices < options.min) || (options.max && numChoices > options.max)) {
                return false;
            }

            return true;
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.creditCard = {
        /**
         * Return true if the input value is valid credit card number
         * Based on https://gist.github.com/DiegoSalazar/4075533
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following key:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            // Accept only digits, dashes or spaces
            if (/[^0-9-\s]+/.test(value)) {
                return false;
            }
            value = value.replace(/\D/g, '');

            if (!$.fn.bootstrapValidator.helpers.luhn(value)) {
                return false;
            }

            // Validate the card number based on prefix (IIN ranges) and length
            var cards = {
                AMERICAN_EXPRESS: {
                    length: [15],
                    prefix: ['34', '37']
                },
                DINERS_CLUB: {
                    length: [14],
                    prefix: ['300', '301', '302', '303', '304', '305', '36']
                },
                DINERS_CLUB_US: {
                    length: [16],
                    prefix: ['54', '55']
                },
                DISCOVER: {
                    length: [16],
                    prefix: ['6011', '622126', '622127', '622128', '622129', '62213',
                        '62214', '62215', '62216', '62217', '62218', '62219',
                        '6222', '6223', '6224', '6225', '6226', '6227', '6228',
                        '62290', '62291', '622920', '622921', '622922', '622923',
                        '622924', '622925', '644', '645', '646', '647', '648',
                        '649', '65'
                    ]
                },
                JCB: {
                    length: [16],
                    prefix: ['3528', '3529', '353', '354', '355', '356', '357', '358']
                },
                LASER: {
                    length: [16, 17, 18, 19],
                    prefix: ['6304', '6706', '6771', '6709']
                },
                MAESTRO: {
                    length: [12, 13, 14, 15, 16, 17, 18, 19],
                    prefix: ['5018', '5020', '5038', '6304', '6759', '6761', '6762', '6763', '6764', '6765', '6766']
                },
                MASTERCARD: {
                    length: [16],
                    prefix: ['51', '52', '53', '54', '55']
                },
                SOLO: {
                    length: [16, 18, 19],
                    prefix: ['6334', '6767']
                },
                UNIONPAY: {
                    length: [16, 17, 18, 19],
                    prefix: ['622126', '622127', '622128', '622129', '62213', '62214',
                        '62215', '62216', '62217', '62218', '62219', '6222', '6223',
                        '6224', '6225', '6226', '6227', '6228', '62290', '62291',
                        '622920', '622921', '622922', '622923', '622924', '622925'
                    ]
                },
                VISA: {
                    length: [16],
                    prefix: ['4']
                }
            };

            var type, i;
            for (type in cards) {
                for (i in cards[type]['prefix']) {
                    if (value.substr(0, cards[type]['prefix'][i].length) == cards[type]['prefix'][i] // Check the prefix
                        && cards[type]['length'].indexOf(value.length) != -1) // and length
                    {
                        return true;
                    }
                }
            }

            return false;
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.cvv = {
        html5Attributes: {
            message: 'message',
            ccfield: 'creditCardField'
        },

        /**
         * Return true if the input value is a valid CVV number.
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - creditCardField: The credit card number field. It can be null
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            if (!/^[0-9]{3,4}$/.test(value)) {
                return false;
            }

            if (!options.creditCardField) {
                return true;
            }

            // Get the credit card number
            var creditCard = validator.getFieldElements(options.creditCardField).val();
            if (creditCard == '') {
                return true;
            }

            // Supported credit card types
            var cards = {
                AMERICAN_EXPRESS: {
                    length: [15],
                    prefix: ['34', '37']
                },
                DINERS_CLUB: {
                    length: [14],
                    prefix: ['300', '301', '302', '303', '304', '305', '36']
                },
                DINERS_CLUB_US: {
                    length: [16],
                    prefix: ['54', '55']
                },
                DISCOVER: {
                    length: [16],
                    prefix: ['6011', '622126', '622127', '622128', '622129', '62213',
                        '62214', '62215', '62216', '62217', '62218', '62219',
                        '6222', '6223', '6224', '6225', '6226', '6227', '6228',
                        '62290', '62291', '622920', '622921', '622922', '622923',
                        '622924', '622925', '644', '645', '646', '647', '648',
                        '649', '65'
                    ]
                },
                JCB: {
                    length: [16],
                    prefix: ['3528', '3529', '353', '354', '355', '356', '357', '358']
                },
                LASER: {
                    length: [16, 17, 18, 19],
                    prefix: ['6304', '6706', '6771', '6709']
                },
                MAESTRO: {
                    length: [12, 13, 14, 15, 16, 17, 18, 19],
                    prefix: ['5018', '5020', '5038', '6304', '6759', '6761', '6762', '6763', '6764', '6765', '6766']
                },
                MASTERCARD: {
                    length: [16],
                    prefix: ['51', '52', '53', '54', '55']
                },
                SOLO: {
                    length: [16, 18, 19],
                    prefix: ['6334', '6767']
                },
                UNIONPAY: {
                    length: [16, 17, 18, 19],
                    prefix: ['622126', '622127', '622128', '622129', '62213', '62214',
                        '62215', '62216', '62217', '62218', '62219', '6222', '6223',
                        '6224', '6225', '6226', '6227', '6228', '62290', '62291',
                        '622920', '622921', '622922', '622923', '622924', '622925'
                    ]
                },
                VISA: {
                    length: [16],
                    prefix: ['4']
                }
            };
            var type, i, creditCardType = null;
            for (type in cards) {
                for (i in cards[type]['prefix']) {
                    if (creditCard.substr(0, cards[type]['prefix'][i].length) == cards[type]['prefix'][i] // Check the prefix
                        && cards[type]['length'].indexOf(creditCard.length) != -1) // and length
                    {
                        creditCardType = type;
                        break;
                    }
                }
            }

            return (creditCardType == null) ? false : (('AMERICAN_EXPRESS' == creditCardType) ? (value.length == 4) : (value.length == 3));
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.date = {
        html5Attributes: {
            message: 'message',
            format: 'format'
        },

        /**
         * Return true if the input value is valid date
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * - format: The date format. Default is MM/DD/YYYY
         * The format can be:
         *
         * i) date: Consist of DD, MM, YYYY parts which are separated by /
         * ii) date and time:
         * The time can consist of h, m, s parts which are separated by :
         * ii) date, time and A (indicating AM or PM)
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            options.format = options.format || 'MM/DD/YYYY';

            var formats = options.format.split(' '),
                dateFormat = formats[0],
                timeFormat = (formats.length > 1) ? formats[1] : null,
                amOrPm = (formats.length > 2) ? formats[2] : null,
                sections = value.split(' '),
                date = sections[0],
                time = (sections.length > 1) ? sections[1] : null;

            if (formats.length != sections.length) {
                return false;
            }

            // Determine the separator
            var separator = (date.indexOf('/') != -1) ? '/' : ((date.indexOf('-') != -1) ? '-' : null);
            if (separator == null) {
                return false;
            }

            // Determine the date
            date = date.split(separator);
            dateFormat = dateFormat.split(separator);
            var year = date[dateFormat.indexOf('YYYY')],
                month = date[dateFormat.indexOf('MM')],
                day = date[dateFormat.indexOf('DD')];

            // Determine the time
            var minutes = null,
                hours = null,
                seconds = null;
            if (timeFormat) {
                timeFormat = timeFormat.split(':'),
                    time = time.split(':');

                if (timeFormat.length != time.length) {
                    return false;
                }

                hours = time.length > 0 ? time[0] : null;
                minutes = time.length > 1 ? time[1] : null;
                seconds = time.length > 2 ? time[2] : null;

                // Validate seconds
                if (seconds) {
                    seconds = parseInt(seconds, 10);
                    if (seconds < 0 || seconds > 60) {
                        return false;
                    }
                }

                // Validate hours
                if (hours) {
                    hours = parseInt(hours, 10);
                    if (hours < 0 || hours >= 24 || (amOrPm && hours > 12)) {
                        return false;
                    }
                }

                // Validate minutes
                if (minutes) {
                    minutes = parseInt(minutes, 10);
                    if (minutes < 0 || minutes > 59) {
                        return false;
                    }
                }
            }

            // Validate day, month, and year
            day = parseInt(day, 10);
            month = parseInt(month, 10);
            year = parseInt(year, 10);

            if (year < 1000 || year > 9999 || month == 0 || month > 12) {
                return false;
            }

            var numDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            // Update the number of days in Feb of leap year
            if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
                numDays[1] = 29;
            }

            // Check the day
            return (day > 0 && day <= numDays[month - 1]);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.different = {
        html5Attributes: {
            message: 'message',
            field: 'field'
        },

        /**
         * Return true if the input value is different with given field's value
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consists of the following key:
         * - field: The name of field that will be used to compare with current one
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            var compareWith = validator.getFieldElements(options.field);
            if (compareWith == null) {
                return true;
            }

            if (value != compareWith.val()) {
                validator.updateStatus(options.field, validator.STATUS_VALID, 'different');
                return true;
            } else {
                return false;
            }
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.digits = {
        /**
         * Return true if the input value contains digits only
         *
         * @param {BootstrapValidator} validator Validate plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            return /^\d+$/.test(value);
        }
    }
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.ean = {
        /**
         * Validate EAN (International Article Number)
         * Examples:
         * - Valid: 73513537, 9780471117094, 4006381333931
         * - Invalid: 73513536
         *
         * @see http://en.wikipedia.org/wiki/European_Article_Number
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            if (!/^(\d{8}|\d{12}|\d{13})$/.test(value)) {
                return false;
            }

            var length = value.length,
                sum = 0,
                weight = (length == 8) ? [3, 1] : [1, 3];
            for (var i = 0; i < length - 1; i++) {
                sum += parseInt(value.charAt(i)) * weight[i % 2];
            }
            sum = 10 - sum % 10;
            return (sum == value.charAt(length - 1));
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.emailAddress = {
        enableByHtml5: function ($field) {
            return ('email' == $field.attr('type'));
        },

        /**
         * Return true if and only if the input value is a valid email address
         *
         * @param {BootstrapValidator} validator Validate plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            // Email address regular expression
            // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
            var emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return emailRegExp.test(value);
        }
    }
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.file = {
        html5Attributes: {
            extension: 'extension',
            maxsize: 'maxSize',
            message: 'message',
            type: 'type'
        },

        /**
         * Validate upload file. Use HTML 5 API if the browser supports
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - extension: The allowed extensions, separated by a comma
         * - maxSize: The maximum size in bytes
         * - message: The invalid message
         * - type: The allowed MIME type, separated by a comma
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            var ext,
                extensions = options.extension ? options.extension.split(',') : null,
                types = options.type ? options.type.split(',') : null,
                html5 = (window.File && window.FileList && window.FileReader);

            if (html5) {
                // Get FileList instance
                var files = $field.get(0).files,
                    total = files.length;
                for (var i = 0; i < total; i++) {
                    // Check file size
                    if (options.maxSize && files[i].size > parseInt(options.maxSize)) {
                        return false;
                    }

                    // Check file extension
                    ext = files[i].name.substr(files[i].name.lastIndexOf('.') + 1);
                    if (extensions && extensions.indexOf(ext) == -1) {
                        return false;
                    }

                    // Check file type
                    if (types && types.indexOf(files[i].type) == -1) {
                        return false;
                    }
                }
            } else {
                // Check file extension
                ext = value.substr(value.lastIndexOf('.') + 1);
                if (extensions && extensions.indexOf(ext) == -1) {
                    return false;
                }
            }

            return true;
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.greaterThan = {
        html5Attributes: {
            message: 'message',
            value: 'value',
            inclusive: 'inclusive'
        },

        enableByHtml5: function ($field) {
            var min = $field.attr('min');
            if (min) {
                return {
                    value: min
                };
            }

            return false;
        },

        /**
         * Return true if the input value is greater than or equals to given number
         *
         * @param {BootstrapValidator} validator Validate plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - value: The number used to compare to
         * - inclusive [optional]: Can be true or false. Default is true
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }
            value = parseFloat(value);
            return (options.inclusive === true) ? (value > options.value) : (value >= options.value);
        }
    }
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.grid = {
        /**
         * Validate GRId (Global Release Identifier)
         * Examples:
         * - Valid: A12425GABC1234002M, A1-2425G-ABC1234002-M, A1 2425G ABC1234002 M, Grid:A1-2425G-ABC1234002-M
         * - Invalid: A1-2425G-ABC1234002-Q
         *
         * @see http://en.wikipedia.org/wiki/Global_Release_Identifier
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            value = value.toUpperCase();
            if (!/^[GRID:]*([0-9A-Z]{2})[-\s]*([0-9A-Z]{5})[-\s]*([0-9A-Z]{10})[-\s]*([0-9A-Z]{1})$/g.test(value)) {
                return false;
            }
            value = value.replace(/\s/g, '').replace(/-/g, '');
            if ('GRID:' == value.substr(0, 5)) {
                value = value.substr(5);
            }
            return $.fn.bootstrapValidator.helpers.mod_37_36(value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.hex = {
        /**
         * Return true if and only if the input value is a valid hexadecimal number
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consist of key:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            return /^[0-9a-fA-F]+$/.test(value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.hexColor = {
        enableByHtml5: function ($field) {
            return ('color' == $field.attr('type'));
        },

        /**
         * Return true if the input value is a valid hex color
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }
            return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.iban = {
        html5Attributes: {
            message: 'message',
            country: 'country'
        },

        /**
         * Validate an International Bank Account Number (IBAN)
         * To test it, take the sample IBAN from
         * http://www.nordea.com/Our+services/International+products+and+services/Cash+Management/IBAN+countries/908462.html
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * - country: The ISO 3166-1 country code
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            // See
            // http://www.swift.com/dsp/resources/documents/IBAN_Registry.pdf
            // http://en.wikipedia.org/wiki/International_Bank_Account_Number#IBAN_formats_by_country
            var ibanRegex = {
                'AD': 'AD[0-9]{2}[0-9]{4}[0-9]{4}[A-Z0-9]{12}', // Andorra
                'AE': 'AE[0-9]{2}[0-9]{3}[0-9]{16}', // United Arab Emirates
                'AL': 'AL[0-9]{2}[0-9]{8}[A-Z0-9]{16}', // Albania
                'AO': 'AO[0-9]{2}[0-9]{21}', // Angola
                'AT': 'AT[0-9]{2}[0-9]{5}[0-9]{11}', // Austria
                'AZ': 'AZ[0-9]{2}[A-Z]{4}[A-Z0-9]{20}', // Azerbaijan
                'BA': 'BA[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{8}[0-9]{2}', // Bosnia and Herzegovina
                'BE': 'BE[0-9]{2}[0-9]{3}[0-9]{7}[0-9]{2}', // Belgium
                'BF': 'BF[0-9]{2}[0-9]{23}', // Burkina Faso
                'BG': 'BG[0-9]{2}[A-Z]{4}[0-9]{4}[0-9]{2}[A-Z0-9]{8}', // Bulgaria
                'BH': 'BH[0-9]{2}[A-Z]{4}[A-Z0-9]{14}', // Bahrain
                'BI': 'BI[0-9]{2}[0-9]{12}', // Burundi
                'BJ': 'BJ[0-9]{2}[A-Z]{1}[0-9]{23}', // Benin
                'BR': 'BR[0-9]{2}[0-9]{8}[0-9]{5}[0-9]{10}[A-Z][A-Z0-9]', // Brazil
                'CH': 'CH[0-9]{2}[0-9]{5}[A-Z0-9]{12}', // Switzerland
                'CI': 'CI[0-9]{2}[A-Z]{1}[0-9]{23}', // Ivory Coast
                'CM': 'CM[0-9]{2}[0-9]{23}', // Cameroon
                'CR': 'CR[0-9]{2}[0-9]{3}[0-9]{14}', // Costa Rica
                'CV': 'CV[0-9]{2}[0-9]{21}', // Cape Verde
                'CY': 'CY[0-9]{2}[0-9]{3}[0-9]{5}[A-Z0-9]{16}', // Cyprus
                'CZ': 'CZ[0-9]{2}[0-9]{20}', // Czech Republic
                'DE': 'DE[0-9]{2}[0-9]{8}[0-9]{10}', // Germany
                'DK': 'DK[0-9]{2}[0-9]{14}', // Denmark
                'DO': 'DO[0-9]{2}[A-Z0-9]{4}[0-9]{20}', // Dominican Republic
                'DZ': 'DZ[0-9]{2}[0-9]{20}', // Algeria
                'EE': 'EE[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{11}[0-9]{1}', // Estonia
                'ES': 'ES[0-9]{2}[0-9]{4}[0-9]{4}[0-9]{1}[0-9]{1}[0-9]{10}', // Spain
                'FI': 'FI[0-9]{2}[0-9]{6}[0-9]{7}[0-9]{1}', // Finland
                'FO': 'FO[0-9]{2}[0-9]{4}[0-9]{9}[0-9]{1}', // Faroe Islands
                'FR': 'FR[0-9]{2}[0-9]{5}[0-9]{5}[A-Z0-9]{11}[0-9]{2}', // France
                'GB': 'GB[0-9]{2}[A-Z]{4}[0-9]{6}[0-9]{8}', // United Kingdom
                'GE': 'GE[0-9]{2}[A-Z]{2}[0-9]{16}', // Georgia
                'GI': 'GI[0-9]{2}[A-Z]{4}[A-Z0-9]{15}', // Gibraltar
                'GL': 'GL[0-9]{2}[0-9]{4}[0-9]{9}[0-9]{1}', // Greenland[
                'GR': 'GR[0-9]{2}[0-9]{3}[0-9]{4}[A-Z0-9]{16}', // Greece
                'GT': 'GT[0-9]{2}[A-Z0-9]{4}[A-Z0-9]{20}', // Guatemala
                'HR': 'HR[0-9]{2}[0-9]{7}[0-9]{10}', // Croatia
                'HU': 'HU[0-9]{2}[0-9]{3}[0-9]{4}[0-9]{1}[0-9]{15}[0-9]{1}', // Hungary
                'IE': 'IE[0-9]{2}[A-Z]{4}[0-9]{6}[0-9]{8}', // Ireland
                'IL': 'IL[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{13}', // Israel
                'IR': 'IR[0-9]{2}[0-9]{22}', // Iran
                'IS': 'IS[0-9]{2}[0-9]{4}[0-9]{2}[0-9]{6}[0-9]{10}', // Iceland
                'IT': 'IT[0-9]{2}[A-Z]{1}[0-9]{5}[0-9]{5}[A-Z0-9]{12}', // Italy
                'JO': 'JO[0-9]{2}[A-Z]{4}[0-9]{4}[0]{8}[A-Z0-9]{10}', // Jordan
                'KW': 'KW[0-9]{2}[A-Z]{4}[0-9]{22}', // Kuwait
                'KZ': 'KZ[0-9]{2}[0-9]{3}[A-Z0-9]{13}', // Kazakhstan
                'LB': 'LB[0-9]{2}[0-9]{4}[A-Z0-9]{20}', // Lebanon
                'LI': 'LI[0-9]{2}[0-9]{5}[A-Z0-9]{12}', // Liechtenstein
                'LT': 'LT[0-9]{2}[0-9]{5}[0-9]{11}', // Lithuania
                'LU': 'LU[0-9]{2}[0-9]{3}[A-Z0-9]{13}', // Luxembourg
                'LV': 'LV[0-9]{2}[A-Z]{4}[A-Z0-9]{13}', // Latvia
                'MC': 'MC[0-9]{2}[0-9]{5}[0-9]{5}[A-Z0-9]{11}[0-9]{2}', // Monaco
                'MD': 'MD[0-9]{2}[A-Z0-9]{20}', // Moldova
                'ME': 'ME[0-9]{2}[0-9]{3}[0-9]{13}[0-9]{2}', // Montenegro
                'MG': 'MG[0-9]{2}[0-9]{23}', // Madagascar
                'MK': 'MK[0-9]{2}[0-9]{3}[A-Z0-9]{10}[0-9]{2}', // Macedonia
                'ML': 'ML[0-9]{2}[A-Z]{1}[0-9]{23}', // Mali
                'MR': 'MR13[0-9]{5}[0-9]{5}[0-9]{11}[0-9]{2}', // Mauritania
                'MT': 'MT[0-9]{2}[A-Z]{4}[0-9]{5}[A-Z0-9]{18}', // Malta
                'MU': 'MU[0-9]{2}[A-Z]{4}[0-9]{2}[0-9]{2}[0-9]{12}[0-9]{3}[A-Z]{3}', // Mauritius
                'MZ': 'MZ[0-9]{2}[0-9]{21}', // Mozambique
                'NL': 'NL[0-9]{2}[A-Z]{4}[0-9]{10}', // Netherlands
                'NO': 'NO[0-9]{2}[0-9]{4}[0-9]{6}[0-9]{1}', // Norway
                'PK': 'PK[0-9]{2}[A-Z]{4}[A-Z0-9]{16}', // Pakistan
                'PL': 'PL[0-9]{2}[0-9]{8}[0-9]{16}', // Poland
                'PS': 'PS[0-9]{2}[A-Z]{4}[A-Z0-9]{21}', // Palestinian
                'PT': 'PT[0-9]{2}[0-9]{4}[0-9]{4}[0-9]{11}[0-9]{2}', // Portugal
                'QA': 'QA[0-9]{2}[A-Z]{4}[A-Z0-9]{21}', // Qatar
                'RO': 'RO[0-9]{2}[A-Z]{4}[A-Z0-9]{16}', // Romania
                'RS': 'RS[0-9]{2}[0-9]{3}[0-9]{13}[0-9]{2}', // Serbia
                'SA': 'SA[0-9]{2}[0-9]{2}[A-Z0-9]{18}', // Saudi Arabia
                'SE': 'SE[0-9]{2}[0-9]{3}[0-9]{16}[0-9]{1}', // Sweden
                'SI': 'SI[0-9]{2}[0-9]{5}[0-9]{8}[0-9]{2}', // Slovenia
                'SK': 'SK[0-9]{2}[0-9]{4}[0-9]{6}[0-9]{10}', // Slovakia
                'SM': 'SM[0-9]{2}[A-Z]{1}[0-9]{5}[0-9]{5}[A-Z0-9]{12}', // San Marino
                'SN': 'SN[0-9]{2}[A-Z]{1}[0-9]{23}', // Senegal
                'TN': 'TN59[0-9]{2}[0-9]{3}[0-9]{13}[0-9]{2}', // Tunisia
                'TR': 'TR[0-9]{2}[0-9]{5}[A-Z0-9]{1}[A-Z0-9]{16}', // Turkey
                'VG': 'VG[0-9]{2}[A-Z]{4}[0-9]{16}' // Virgin Islands, British
            };
            value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            var country = options.country || value.substr(0, 2);
            if (!ibanRegex[country]) {
                return false;
            }
            if (!(new RegExp('^' + ibanRegex[country] + '$')).test(value)) {
                return false;
            }

            value = value.substr(4) + value.substr(0, 4);
            value = value.split('').map(function (n) {
                var code = n.charCodeAt(0);
                return (code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0))
                    // Replace A, B, C, ..., Z with 10, 11, ..., 35
                    ? (code - 'A'.charCodeAt(0) + 10) : n;
            }).join('');

            var temp = parseInt(value.substr(0, 1), 10),
                length = value.length;
            for (var i = 1; i < length; ++i) {
                temp = (temp * 10 + parseInt(value.substr(i, 1), 10)) % 97;
            }
            return (temp == 1);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.identical = {
        html5Attributes: {
            message: 'message',
            field: 'field'
        },

        /**
         * Check if input value equals to value of particular one
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consists of the following key:
         * - field: The name of field that will be used to compare with current one
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            var compareWith = validator.getFieldElements(options.field);
            if (compareWith == null) {
                return true;
            }

            if (value == compareWith.val()) {
                validator.updateStatus(options.field, validator.STATUS_VALID, 'identical');
                return true;
            } else {
                return false;
            }
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.imei = {
        /**
         * Validate IMEI (International Mobile Station Equipment Identity)
         * Examples:
         * - Valid: 35-209900-176148-1, 35-209900-176148-23, 3568680000414120, 490154203237518
         * - Invalid: 490154203237517
         *
         * @see http://en.wikipedia.org/wiki/International_Mobile_Station_Equipment_Identity
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            switch (true) {
                case /^\d{15}$/.test(value):
                case /^\d{2}-\d{6}-\d{6}-\d{1}$/.test(value):
                case /^\d{2}\s\d{6}\s\d{6}\s\d{1}$/.test(value):
                    value = value.replace(/[^0-9]/g, '');
                    return $.fn.bootstrapValidator.helpers.luhn(value);
                    break;

                case /^\d{14}$/.test(value):
                case /^\d{16}$/.test(value):
                case /^\d{2}-\d{6}-\d{6}(|-\d{2})$/.test(value):
                case /^\d{2}\s\d{6}\s\d{6}(|\s\d{2})$/.test(value):
                    return true;

                default:
                    return false;
            }
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.integer = {
        enableByHtml5: function ($field) {
            return ('number' == $field.attr('type'));
        },

        /**
         * Return true if the input value is an integer
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following key:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }
            return /^(?:-?(?:0|[1-9][0-9]*))$/.test(value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.ip = {
        html5Attributes: {
            message: 'message',
            ipv4: 'ipv4',
            ipv6: 'ipv6'
        },

        /**
         * Return true if the input value is a IP address.
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - ipv4: Enable IPv4 validator, default to true
         * - ipv6: Enable IPv6 validator, default to true
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }
            options = $.extend({}, {
                ipv4: true,
                ipv6: true
            }, options);

            if (options.ipv4) {
                return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value);
            } else if (options.ipv6) {
                return /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(str);
            }
            return false;
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.isbn = {
        /**
         * Return true if the input value is a valid ISBN 10 or ISBN 13 number
         * Examples:
         * - Valid:
         * ISBN 10: 99921-58-10-7, 9971-5-0210-0, 960-425-059-0, 80-902734-1-6, 85-359-0277-5, 1-84356-028-3, 0-684-84328-5, 0-8044-2957-X, 0-85131-041-9, 0-943396-04-2, 0-9752298-0-X
         * ISBN 13: 978-0-306-40615-7
         * - Invalid:
         * ISBN 10: 99921-58-10-6
         * ISBN 13: 978-0-306-40615-6
         *
         * @see http://en.wikipedia.org/wiki/International_Standard_Book_Number
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            // http://en.wikipedia.org/wiki/International_Standard_Book_Number#Overview
            // Groups are separated by a hyphen or a space
            var type;
            switch (true) {
                case /^\d{9}[\dX]$/.test(value):
                case (value.length == 13 && /^(\d+)-(\d+)-(\d+)-([\dX])$/.test(value)):
                case (value.length == 13 && /^(\d+)\s(\d+)\s(\d+)\s([\dX])$/.test(value)):
                    type = 'ISBN10';
                    break;
                case /^(978|979)\d{9}[\dX]$/.test(value):
                case (value.length == 17 && /^(978|979)-(\d+)-(\d+)-(\d+)-([\dX])$/.test(value)):
                case (value.length == 17 && /^(978|979)\s(\d+)\s(\d+)\s(\d+)\s([\dX])$/.test(value)):
                    type = 'ISBN13';
                    break;
                default:
                    return false;
            }

            // Replace all special characters except digits and X
            value = value.replace(/[^0-9X]/gi, '');
            var chars = value.split(''),
                length = chars.length,
                sum = 0,
                checksum;

            switch (type) {
                case 'ISBN10':
                    sum = 0;
                    for (var i = 0; i < length - 1; i++) {
                        sum += ((10 - i) * parseInt(chars[i]));
                    }
                    checksum = 11 - (sum % 11);
                    if (checksum == 11) {
                        checksum = 0;
                    } else if (checksum == 10) {
                        checksum = 'X';
                    }
                    return (checksum + '' == chars[length - 1]);

                case 'ISBN13':
                    sum = 0;
                    for (var i = 0; i < length - 1; i++) {
                        sum += ((i % 2 == 0) ? parseInt(chars[i]) : (parseInt(chars[i]) * 3));
                    }
                    checksum = 10 - (sum % 10);
                    if (checksum == 10) {
                        checksum = '0';
                    }
                    return (checksum + '' == chars[length - 1]);

                default:
                    return false;
            }
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.ismn = {
        /**
         * Validate ISMN (International Standard Music Number)
         * Examples:
         * - Valid: M230671187, 979-0-0601-1561-5, 979 0 3452 4680 5, 9790060115615
         * - Invalid: 9790060115614
         *
         * @see http://en.wikipedia.org/wiki/International_Standard_Music_Number
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            // Groups are separated by a hyphen or a space
            var type;
            switch (true) {
                case /^M\d{9}$/.test(value):
                case /^M-\d{4}-\d{4}-\d{1}$/.test(value):
                case /^M\s\d{4}\s\d{4}\s\d{1}$/.test(value):
                    type = 'ISMN10';
                    break;
                case /^9790\d{9}$/.test(value):
                case /^979-0-\d{4}-\d{4}-\d{1}$/.test(value):
                case /^979\s0\s\d{4}\s\d{4}\s\d{1}$/.test(value):
                    type = 'ISMN13';
                    break;
                default:
                    return false;
            }

            if ('ISMN10' == type) {
                value = '9790' + value.substr(1);
            }

            // Replace all special characters except digits
            value = value.replace(/[^0-9]/gi, '');
            var length = value.length,
                sum = 0,
                weight = [1, 3];
            for (var i = 0; i < length - 1; i++) {
                sum += parseInt(value.charAt(i)) * weight[i % 2];
            }
            sum = 10 - sum % 10;
            return (sum == value.charAt(length - 1));
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.issn = {
        /**
         * Validate ISSN (International Standard Serial Number)
         * Examples:
         * - Valid: 0378-5955, 0024-9319, 0032-1478
         * - Invalid: 0032-147X
         *
         * @see http://en.wikipedia.org/wiki/International_Standard_Serial_Number
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            // Groups are separated by a hyphen or a space
            if (!/^\d{4}\-\d{3}[\dX]$/.test(value)) {
                return false;
            }

            // Replace all special characters except digits and X
            value = value.replace(/[^0-9X]/gi, '');
            var chars = value.split(''),
                length = chars.length,
                sum = 0;

            if (chars[7] == 'X') {
                chars[7] = 10;
            }
            for (var i = 0; i < length; i++) {
                sum += ((8 - i) * parseInt(chars[i]));
            }
            return (sum % 11 == 0);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.lessThan = {
        html5Attributes: {
            message: 'message',
            value: 'value',
            inclusive: 'inclusive'
        },

        enableByHtml5: function ($field) {
            var max = $field.attr('max');
            if (max) {
                return {
                    value: max
                };
            }

            return false;
        },

        /**
         * Return true if the input value is less than or equal to given number
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - value: The number used to compare to
         * - inclusive [optional]: Can be true or false. Default is true
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }
            value = parseFloat(value);
            return (options.inclusive === false) ? (value <= options.value) : (value < options.value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.mac = {
        /**
         * Return true if the input value is a MAC address.
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            return /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/.test(value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.notEmpty = {
        enableByHtml5: function ($field) {
            var required = $field.attr('required') + '';
            return ('required' == required || 'true' == required);
        },

        /**
         * Check if input value is empty or not
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var type = $field.attr('type');
            if ('radio' == type || 'checkbox' == type) {
                return validator
                        .getFieldElements($field.attr('data-bv-field'))
                        .filter(':checked')
                        .length > 0;
            }

            return $.trim($field.val()) != '';
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.numeric = {
        /**
         * Validate decimal number
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consist of key:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            return !isNaN(parseFloat(value)) && isFinite(value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.phone = {
        html5Attributes: {
            message: 'message',
            country: 'country'
        },

        /**
         * Return true if the input value contains a valid US phone number only
         *
         * @param {BootstrapValidator} validator Validate plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consist of key:
         * - message: The invalid message
         * - country: The ISO 3166 country code
         * Currently it only supports United State (US) country
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            var country = (options.country || 'US').toUpperCase();
            switch (country) {
                case 'US':
                default:
                    // Make sure US phone numbers have 10 digits
                    // May start with 1, +1, or 1-; should discard
                    // Area code may be delimited with (), & sections may be delimited with . or -
                    // Test: http://regexr.com/38mqi
                    // value = value.replace(/\D/g, '');
                    return (/1[0-9]{10}$/).test(value) && (value.length == 11);
            }
        }
    }
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.regexp = {
        html5Attributes: {
            message: 'message',
            regexp: 'regexp'
        },

        enableByHtml5: function ($field) {
            var pattern = $field.attr('pattern');
            if (pattern) {
                return {
                    regexp: pattern
                };
            }

            return false;
        },

        /**
         * Check if the element value matches given regular expression
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consists of the following key:
         * - regexp: The regular expression you need to check
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            var regexp = ('string' == typeof options.regexp) ? new RegExp(options.regexp) : options.regexp;
            return regexp.test(value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.remote = {
        html5Attributes: {
            message: 'message',
            url: 'url',
            name: 'name'
        },

        /**
         * Request a remote server to check the input value
         *
         * @param {BootstrapValidator} validator Plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - url
         * - data [optional]: By default, it will take the value
         *  {
         *      <fieldName>: <fieldValue>
         *  }
         * - name [optional]: Override the field name for the request.
         * - message: The invalid message
         * @returns {Boolean|Deferred}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            var name = $field.attr('data-bv-field'),
                data = options.data;
            if (data == null) {
                data = {};
            }
            // Support dynamic data
            if ('function' == typeof data) {
                data = data.call(this, validator);
            }
            data[options.name || name] = value;

            var dfd = new $.Deferred();
            var xhr = $.ajax({
                type: 'POST',
                url: options.url,
                dataType: 'json',
                data: data
            });
            xhr.then(function (response) {
                dfd.resolve($field, 'remote', response.valid === true || response.valid === 'true');
            });

            dfd.fail(function () {
                xhr.abort();
            });

            return dfd;
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.siren = {
        /**
         * Check if a string is a siren number
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consist of key:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            if (!/^\d{9}$/.test(value)) {
                return false;
            }
            return $.fn.bootstrapValidator.helpers.luhn(value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.siret = {
        /**
         * Check if a string is a siret number
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consist of key:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            var sum = 0,
                length = value.length,
                tmp;
            for (var i = 0; i < length; i++) {
                tmp = parseInt(value.charAt(i), 10);
                if ((i % 2) == 0) {
                    tmp = tmp * 2;
                    if (tmp > 9) {
                        tmp -= 9;
                    }
                }
                sum += tmp;
            }
            return (sum % 10 == 0);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.step = {
        html5Attributes: {
            message: 'message',
            base: 'baseValue',
            step: 'step'
        },

        /**
         * Return true if the input value is valid step one
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - baseValue: The base value
         * - step: The step
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            options = $.extend({}, {
                baseValue: 0,
                step: 1
            }, options);
            value = parseFloat(value);
            if (isNaN(value) || !isFinite(value)) {
                return false;
            }

            var round = function (x, precision) {
                    var m = Math.pow(10, precision);
                    x = x * m;
                    var sign = (x > 0) | -(x < 0),
                        isHalf = (x % 1 === 0.5 * sign);
                    if (isHalf) {
                        return (Math.floor(x) + (sign > 0)) / m;
                    } else {
                        return Math.round(x) / m;
                    }
                },
                floatMod = function (x, y) {
                    if (y == 0.0) {
                        return 1.0;
                    }
                    var dotX = (x + '').split('.'),
                        dotY = (y + '').split('.'),
                        precision = ((dotX.length == 1) ? 0 : dotX[1].length) + ((dotY.length == 1) ? 0 : dotY[1].length);
                    return round(x - y * Math.floor(x / y), precision);
                };

            var mod = floatMod(value - options.baseValue, options.step);
            return (mod == 0.0 || mod == options.step);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.stringCase = {
        html5Attributes: {
            message: 'message',
            'case': 'case'
        },

        /**
         * Check if a string is a lower or upper case one
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consist of key:
         * - message: The invalid message
         * - case: Can be 'lower' (default) or 'upper'
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            var stringCase = (options['case'] || 'lower').toLowerCase();
            switch (stringCase) {
                case 'upper':
                    return value === value.toUpperCase();
                case 'lower':
                default:
                    return value === value.toLowerCase();
            }
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.stringLength = {
        html5Attributes: {
            message: 'message',
            min: 'min',
            max: 'max'
        },

        enableByHtml5: function ($field) {
            var maxLength = $field.attr('maxlength');
            if (maxLength) {
                return {
                    max: parseInt(maxLength, 10)
                };
            }

            return false;
        },

        /**
         * Check if the length of element value is less or more than given number
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consists of following keys:
         * - min
         * - max
         * At least one of two keys is required
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            var length = $.trim(value).length;
            if ((options.min && length < options.min) || (options.max && length > options.max)) {
                return false;
            }

            return true;
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.uri = {
        enableByHtml5: function ($field) {
            return ('url' == $field.attr('type'));
        },

        /**
         * Return true if the input value is a valid URL
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            // Credit to https://gist.github.com/dperini/729294
            //
            // Regular Expression for URL validation
            //
            // Author: Diego Perini
            // Updated: 2010/12/05
            //
            // the regular expression composed & commented
            // could be easily tweaked for RFC compliance,
            // it was expressly modified to fit & satisfy
            // these test for an URL shortener:
            //
            //   http://mathiasbynens.be/demo/url-regex
            //
            // Notes on possible differences from a standard/generic validation:
            //
            // - utf-8 char class take in consideration the full Unicode range
            // - TLDs have been made mandatory so single names like "localhost" fails
            // - protocols have been restricted to ftp, http and https only as requested
            //
            // Changes:
            //
            // - IP address dotted notation validation, range: 1.0.0.0 - 223.255.255.255
            //   first and last IP address of each class is considered invalid
            //   (since they are broadcast/network addresses)
            //
            // - Added exclusion of private, reserved and/or local networks ranges
            //
            // Compressed one-line versions:
            //
            // Javascript version
            //
            // /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i
            //
            // PHP version
            //
            // _^(?:(?:https?|ftp)://)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}-\x{ffff}0-9]+-?)*[a-z\x{00a1}-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}-\x{ffff}0-9]+-?)*[a-z\x{00a1}-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}-\x{ffff}]{2,})))(?::\d{2,5})?(?:/[^\s]*)?$_iuS
            var urlExp = new RegExp(
                "^" +
                    // protocol identifier
                "(?:(?:https?|ftp)://)" +
                    // user:pass authentication
                "(?:\\S+(?::\\S*)?@)?" +
                "(?:" +
                    // IP address exclusion
                    // private & local networks
                "(?!10(?:\\.\\d{1,3}){3})" +
                "(?!127(?:\\.\\d{1,3}){3})" +
                "(?!169\\.254(?:\\.\\d{1,3}){2})" +
                "(?!192\\.168(?:\\.\\d{1,3}){2})" +
                "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
                    // IP address dotted notation octets
                    // excludes loopback network 0.0.0.0
                    // excludes reserved space >= 224.0.0.0
                    // excludes network & broacast addresses
                    // (first & last IP address of each class)
                "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
                "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
                "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
                "|" +
                    // host name
                "(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)" +
                    // domain name
                "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*" +
                    // TLD identifier
                "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
                ")" +
                    // port number
                "(?::\\d{2,5})?" +
                    // resource path
                "(?:/[^\\s]*)?" +
                "$", "i"
            );
            return urlExp.test(value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.uuid = {
        html5Attributes: {
            message: 'message',
            version: 'version'
        },

        /**
         * Return true if and only if the input value is a valid UUID string
         *
         * @see http://en.wikipedia.org/wiki/Universally_unique_identifier
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consist of key:
         * - message: The invalid message
         * - version: Can be 3, 4, 5, null
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            // See the format at http://en.wikipedia.org/wiki/Universally_unique_identifier#Variants_and_versions
            var patterns = {
                    '3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
                    '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
                    '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
                    all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
                },
                version = options.version ? (options.version + '') : 'all';
            return (null == patterns[version]) ? true : patterns[version].test(value);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.vat = {
        html5Attributes: {
            message: 'message',
            country: 'country'
        },

        /**
         * Validate an European VAT number
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consist of key:
         * - message: The invalid message
         * - country: The ISO 3166-1 country code
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            var country = options.country || value.substr(0, 2),
                method = ['_', country.toLowerCase()].join('');
            if (this[method] && 'function' == typeof this[method]) {
                return this[method](value);
            }

            return true;
        },

        // VAT validators

        /**
         * Validate Austrian VAT number
         * Example:
         * - Valid: ATU13585627
         * - Invalid: ATU13585626
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _at: function (value) {
            if (!/^ATU[0-9]{8}$/.test(value)) {
                return false;
            }

            value = value.substr(3);
            var sum = 0,
                weight = [1, 2, 1, 2, 1, 2, 1],
                temp = 0;

            for (var i = 0; i < 7; i++) {
                temp = parseInt(value.charAt(i)) * weight[i];
                if (temp > 9) {
                    temp = Math.floor(temp / 10) + temp % 10;
                }
                sum += temp;
            }

            sum = 10 - (sum + 4) % 10;
            if (sum == 10) {
                sum = 0;
            }

            return (sum == value.substr(7, 1));
        },

        /**
         * Validate Belgian VAT number
         * Example:
         * - Valid: BE0428759497
         * - Invalid: BE431150351
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _be: function (value) {
            if (!/^BE[0]{0,1}[0-9]{9}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            if (value.length == 9) {
                value = '0' + value;
            }

            if (value.substr(1, 1) == 0) {
                return false;
            }

            var sum = parseInt(value.substr(0, 8), 10) + parseInt(value.substr(8, 2), 10);
            return (sum % 97 == 0);
        },

        /**
         * Validate Bulgarian VAT number
         * Example:
         * - Valid: BG175074752,
         * BG7523169263, BG8032056031,
         * BG7542011030,
         * BG7111042925
         * - Invalid: BG175074753, BG7552A10004, BG7111042922
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _bg: function (value) {
            if (!/^BG[0-9]{9,10}$/.test(value)) {
                return false;
            }

            value = value.substr(2);

            var total = 0,
                sum = 0,
                weight = [],
                i = 0;

            // Legal entities
            if (value.length == 9) {
                for (i = 0; i < 8; i++) {
                    sum += parseInt(value.charAt(i)) * (i + 1);
                }
                sum = sum % 11;
                if (sum == 10) {
                    sum = 0;
                    for (i = 0; i < 8; i++) {
                        sum += parseInt(value.charAt(i)) * (i + 3);
                    }
                }
                sum = sum % 10;
                return (sum == value.substr(8));
            }
            // Physical persons, foreigners and others
            else if (value.length == 10) {
                // Validate Bulgarian national identification numbers
                var egn = function (value) {
                        // Check the birth date
                        var year = parseInt(value.substr(0, 2), 10) + 1900,
                            month = parseInt(value.substr(2, 2), 10),
                            day = parseInt(value.substr(4, 2), 10);
                        if (month > 40) {
                            year += 100;
                            month -= 40;
                        } else if (month > 20) {
                            year -= 100;
                            month -= 20;
                        }

                        try {
                            var d = new Date(year, month, day);
                        } catch (ex) {
                            return false;
                        }

                        var sum = 0,
                            weight = [2, 4, 8, 5, 10, 9, 7, 3, 6];
                        for (var i = 0; i < 9; i++) {
                            sum += parseInt(value.charAt(i)) * weight[i];
                        }
                        sum = (sum % 11) % 10;
                        return (sum == value.substr(9, 1));
                    },
                // Validate Bulgarian personal number of a foreigner
                    pnf = function (value) {
                        var sum = 0,
                            weight = [21, 19, 17, 13, 11, 9, 7, 3, 1];
                        for (var i = 0; i < 9; i++) {
                            sum += parseInt(value.charAt(i)) * weight[i];
                        }
                        sum = sum % 10;
                        return (sum == value.substr(9, 1));
                    },
                // Finally, consider it as a VAT number
                    vat = function (value) {
                        var sum = 0,
                            weight = [4, 3, 2, 7, 6, 5, 4, 3, 2];
                        for (var i = 0; i < 9; i++) {
                            sum += parseInt(value.charAt(i)) * weight[i];
                        }
                        sum = 11 - sum % 11;
                        if (sum == 10) {
                            return false;
                        }
                        if (sum == 11) {
                            sum = 0;
                        }
                        return (sum == value.substr(9, 1));
                    };
                return (egn(value) || pnf(value) || vat(value));
            }

            return false;
        },

        /**
         * Validate Swiss VAT number
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _ch: function (value) {
            if (!/^CHE[0-9]{9}(MWST)?$/.test(value)) {
                return false;
            }

            value = value.substr(3);
            var sum = 0,
                weight = [5, 4, 3, 2, 7, 6, 5, 4];
            for (var i = 0; i < 8; i++) {
                sum += parseInt(value.charAt(i), 10) * weight[i];
            }

            sum = 11 - sum % 11;
            if (sum == 10) {
                return false;
            }
            if (sum == 11) {
                sum = 0;
            }

            return (sum == value.substr(8, 1));
        },

        /**
         * Validate Cypriot VAT number
         * Examples:
         * - Valid: CY10259033P
         * - Invalid: CY10259033Z
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _cy: function (value) {
            if (!/^CY[0-5|9]{1}[0-9]{7}[A-Z]{1}$/.test(value)) {
                return false;
            }

            value = value.substr(2);

            // Do not allow to start with "12"
            if (value.substr(0, 2) == '12') {
                return false;
            }

            // Extract the next digit and multiply by the counter.
            var sum = 0,
                translation = {
                    '0': 1,
                    '1': 0,
                    '2': 5,
                    '3': 7,
                    '4': 9,
                    '5': 13,
                    '6': 15,
                    '7': 17,
                    '8': 19,
                    '9': 21
                };
            for (var i = 0; i < 8; i++) {
                var temp = parseInt(value.charAt(i), 10);
                if (i % 2 == 0) {
                    temp = translation[temp + ''];
                }
                sum += temp;
            }

            sum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' [sum % 26];
            return (sum == value.substr(8, 1));
        },

        /**
         * Validate Czech Republic VAT number
         * Can be:
         * i) Legal entities (8 digit numbers)
         * ii) Individuals with a RC (the 9 or 10 digit Czech birth number)
         * iii) Individuals without a RC (9 digit numbers beginning with 6)
         *
         * Examples:
         * - Valid: i) CZ25123891; ii) CZ7103192745, CZ991231123; iii) CZ640903926
         * - Invalid: i) CZ25123890; ii) CZ1103492745, CZ590312123
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _cz: function (value) {
            if (!/^CZ[0-9]{8,10}$/.test(value)) {
                return false;
            }

            value = value.substr(2);

            var sum = 0,
                i = 0;
            if (value.length == 8) {
                // Do not allow to start with '9'
                if (value.charAt(0) + '' == '9') {
                    return false;
                }

                sum = 0;
                for (i = 0; i < 7; i++) {
                    sum += parseInt(value.charAt(i), 10) * (8 - i);
                }
                sum = 11 - sum % 11;
                if (sum == 10) {
                    sum = 0;
                }
                if (sum == 11) {
                    sum = 1;
                }

                return (sum == value.substr(7, 1));
            } else if (value.length == 9 && (value.charAt(0) + '' == '6')) {
                sum = 0;
                // Skip the first (which is 6)
                for (i = 0; i < 7; i++) {
                    sum += parseInt(value.charAt(i + 1), 10) * (8 - i);
                }
                sum = 11 - sum % 11;
                if (sum == 10) {
                    sum = 0;
                }
                if (sum == 11) {
                    sum = 1;
                }
                sum = [8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 10][sum - 1];
                return (sum == value.substr(8, 1));
            } else if (value.length == 9 || value.length == 10) {
                // Validate Czech birth number (Rodné číslo), which is also national identifier
                var year = 1900 + parseInt(value.substr(0, 2)),
                    month = parseInt(value.substr(2, 2)) % 50 % 20,
                    day = parseInt(value.substr(4, 2));
                if (value.length == 9) {
                    if (year >= 1980) {
                        year -= 100;
                    }
                    if (year > 1953) {
                        return false;
                    }
                } else if (year < 1954) {
                    year += 100;
                }

                try {
                    var d = new Date(year, month, day);
                } catch (ex) {
                    return false;
                }

                // Check that the birth date is not in the future
                if (value.length == 10) {
                    var check = parseInt(value.substr(0, 9), 10) % 11;
                    if (year < 1985) {
                        check = check % 10;
                    }
                    return (check == value.substr(9, 1));
                }

                return true;
            }

            return false;
        },

        /**
         * Validate German VAT number
         * Examples:
         * - Valid: DE136695976
         * - Invalid: DE136695978
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _de: function (value) {
            if (!/^DE[0-9]{9}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            return $.fn.bootstrapValidator.helpers.mod_11_10(value);
        },

        /**
         * Validate Danish VAT number
         * Example:
         * - Valid: DK13585628
         * - Invalid: DK13585627
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _dk: function (value) {
            if (!/^DK[0-9]{8}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var sum = 0,
                weight = [2, 7, 6, 5, 4, 3, 2, 1];
            for (var i = 0; i < 8; i++) {
                sum += parseInt(value.charAt(i), 10) * weight[i];
            }

            return (sum % 11 == 0);
        },

        /**
         * Validate Estonian VAT number
         * Examples:
         * - Valid: EE100931558, EE100594102
         * - Invalid: EE100594103
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _ee: function (value) {
            if (!/^EE[0-9]{9}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var sum = 0,
                weight = [3, 7, 1, 3, 7, 1, 3, 7, 1];

            for (var i = 0; i < 9; i++) {
                sum += parseInt(value.charAt(i)) * weight[i];
            }

            return (sum % 10 == 0);
        },

        /**
         * Validate Spanish VAT number (NIF - Número de Identificación Fiscal)
         * Can be:
         * i) DNI (Documento nacional de identidad), for Spaniards
         * ii) NIE (Número de Identificación de Extranjeros), for foreigners
         * iii) CIF (Certificado de Identificación Fiscal), for legal entities and others
         *
         * Examples:
         * - Valid: i) ES54362315K; ii) ESX2482300W, ESX5253868R; iii) ESM1234567L, ESJ99216582, ESB58378431, ESB64717838
         * - Invalid: i) ES54362315Z; ii) ESX2482300A; iii) ESJ99216583
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _es: function (value) {
            if (!/^ES[0-9A-Z][0-9]{7}[0-9A-Z]$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var dni = function (value) {
                    var check = parseInt(value.substr(0, 8), 10);
                    check = 'TRWAGMYFPDXBNJZSQVHLCKE' [check % 23];
                    return (check == value.substr(8, 1));
                },
                nie = function (value) {
                    var check = ['XYZ'.indexOf(value.charAt(0)), value.substr(1)].join('');
                    check = parseInt(check, 10);
                    check = 'TRWAGMYFPDXBNJZSQVHLCKE' [check % 23];
                    return (check == value.substr(8, 1));
                },
                cif = function (value) {
                    var first = value.charAt(0),
                        check;
                    if ('KLM'.indexOf(first) != -1) {
                        // K: Spanish younger than 14 year old
                        // L: Spanish living outside Spain without DNI
                        // M: Granted the tax to foreigners who have no NIE
                        check = parseInt(value.substr(1, 8), 10);
                        check = 'TRWAGMYFPDXBNJZSQVHLCKE' [check % 23];
                        return (check == value.substr(8, 1));
                    } else if ('ABCDEFGHJNPQRSUVW'.indexOf(first) != -1) {
                        var sum = 0,
                            weight = [2, 1, 2, 1, 2, 1, 2],
                            temp = 0;

                        for (var i = 0; i < 7; i++) {
                            temp = parseInt(value.charAt(i + 1)) * weight[i];
                            if (temp > 9) {
                                temp = Math.floor(temp / 10) + temp % 10;
                            }
                            sum += temp;
                        }
                        sum = 10 - sum % 10;
                        return (sum == value.substr(8, 1) || 'JABCDEFGHI' [sum] == value.substr(8, 1));
                    }

                    return false;
                };

            var first = value.charAt(0);
            if (/^[0-9]$/.test(first)) {
                return dni(value);
            } else if (/^[XYZ]$/.test(first)) {
                return nie(value);
            } else {
                return cif(value);
            }
        },

        /**
         * Validate Finnish VAT number
         * Examples:
         * - Valid: FI20774740
         * - Invalid: FI20774741
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _fi: function (value) {
            if (!/^FI[0-9]{8}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var sum = 0,
                weight = [7, 9, 10, 5, 8, 4, 2, 1];

            for (var i = 0; i < 8; i++) {
                sum += parseInt(value.charAt(i)) * weight[i];
            }

            return (sum % 11 == 0);
        },

        /**
         * Validate French VAT number (TVA - taxe sur la valeur ajoutée)
         * It's constructed by a SIREN number, prefixed by two characters.
         *
         * Examples:
         * - Valid: FR40303265045, FR23334175221, FRK7399859412, FR4Z123456782
         * - Invalid: FR84323140391
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _fr: function (value) {
            if (!/^FR[0-9A-Z]{2}[0-9]{9}$/.test(value)) {
                return false;
            }

            value = value.substr(2);

            if (!$.fn.bootstrapValidator.helpers.luhn(value.substr(2))) {
                return false;
            }

            if (/^[0-9]{2}$/.test(value.substr(0, 2))) {
                // First two characters are digits
                return value.substr(0, 2) == (parseInt(value.substr(2) + '12', 10) % 97);
            } else {
                // The first characters cann't be O and I
                var alphabet = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ',
                    check;
                // First one is digit
                if (/^[0-9]{1}$/.test(value.charAt(0))) {
                    check = alphabet.indexOf(value.charAt(0)) * 24 + alphabet.indexOf(value.charAt(1)) - 10;
                } else {
                    check = alphabet.indexOf(value.charAt(0)) * 34 + alphabet.indexOf(value.charAt(1)) - 100;
                }
                return ((parseInt(value.substr(2), 10) + 1 + Math.floor(check / 11)) % 11) == (check % 11);
            }
        },

        /**
         * Validate United Kingdom VAT number
         * Example:
         * - Valid: GB980780684
         * - Invalid: GB802311781
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _gb: function (value) {
            if (!/^GB[0-9]{9}$/.test(value) // Standard
                && !/^GB[0-9]{12}$/.test(value) // Branches
                && !/^GBGD[0-9]{3}$/.test(value) // Government department
                && !/^GBHA[0-9]{3}$/.test(value) // Health authority
                && !/^GB(GD|HA)8888[0-9]{5}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var length = value.length;
            if (length == 5) {
                var firstTwo = value.substr(0, 2),
                    lastThree = parseInt(value.substr(2));
                return ('GD' == firstTwo && lastThree < 500) || ('HA' == firstTwo && lastThree >= 500);
            } else if (length == 11 && ('GD8888' == value.substr(0, 6) || 'HA8888' == value.substr(0, 6))) {
                if (('GD' == value.substr(0, 2) && parseInt(value.substr(6, 3)) >= 500) || ('HA' == value.substr(0, 2) && parseInt(value.substr(6, 3)) < 500)) {
                    return false;
                }
                return (parseInt(value.substr(6, 3)) % 97 == parseInt(value.substr(9, 2)));
            } else if (length == 9 || length == 12) {
                var sum = 0,
                    weight = [8, 7, 6, 5, 4, 3, 2, 10, 1];
                for (var i = 0; i < 9; i++) {
                    sum += parseInt(value.charAt(i)) * weight[i];
                }
                sum = sum % 97;

                if (parseInt(value.substr(0, 3)) >= 100) {
                    return (sum == 0 || sum == 42 || sum == 55);
                } else {
                    return (sum == 0);
                }
            }

            return true;
        },

        /**
         * Validate Greek VAT number
         * Examples:
         * - Valid: GR023456780, EL094259216
         * - Invalid: EL123456781
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _gr: function (value) {
            if (!/^GR[0-9]{9}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            if (value.length == 8) {
                value = '0' + value;
            }

            var sum = 0,
                weight = [256, 128, 64, 32, 16, 8, 4, 2];
            for (var i = 0; i < 8; i++) {
                sum += parseInt(value.charAt(i)) * weight[i];
            }
            sum = (sum % 11) % 10;

            return (sum == value.substr(8, 1));
        },

        // EL is traditionally prefix of Greek VAT numbers
        _el: function (value) {
            if (!/^EL[0-9]{9}$/.test(value)) {
                return false;
            }

            value = 'GR' + value.substr(2);
            return this._gr(value);
        },

        /**
         * Validate Hungarian VAT number
         * Examples:
         * - Valid: HU12892312
         * - Invalid: HU12892313
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _hu: function (value) {
            if (!/^HU[0-9]{8}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var sum = 0,
                weight = [9, 7, 3, 1, 9, 7, 3, 1];

            for (var i = 0; i < 8; i++) {
                sum += parseInt(value.charAt(i)) * weight[i];
            }

            return (sum % 10 == 0);
        },

        /**
         * Validate Croatian VAT number
         * Examples:
         * - Valid: HR33392005961
         * - Invalid: HR33392005962
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _hr: function (value) {
            if (!/^HR[0-9]{11}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            return $.fn.bootstrapValidator.helpers.mod_11_10(value);
        },

        /**
         * Validate Irish VAT number
         * Examples:
         * - Valid: IE6433435F, IE6433435OA, IE8D79739I
         * - Invalid: IE8D79738J
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _ie: function (value) {
            if (!/^IE[0-9]{1}[0-9A-Z\*\+]{1}[0-9]{5}[A-Z]{1,2}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var getCheckDigit = function (value) {
                while (value.length < 7) {
                    value = '0' + value;
                }
                var alphabet = 'WABCDEFGHIJKLMNOPQRSTUV',
                    sum = 0;
                for (var i = 0; i < 7; i++) {
                    sum += parseInt(value.charAt(i)) * (8 - i);
                }
                sum += 9 * alphabet.indexOf(value.substr(7));
                return alphabet[sum % 23];
            };

            // The first 7 characters are digits
            if (/^[0-9]+$/.test(value.substr(0, 7))) {
                // New system
                return value.charAt(7) == getCheckDigit(value.substr(0, 7) + value.substr(8) + '');
            } else if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ+*'.indexOf(value.charAt(1)) != -1) {
                // Old system
                return value.charAt(7) == getCheckDigit(value.substr(2, 5) + value.substr(0, 1) + '');
            }

            return true;
        },

        /**
         * Validate Italian VAT number, which consists of 11 digits.
         * - First 7 digits are a company identifier
         * - Next 3 are the province of residence
         * - The last one is a check digit
         *
         * Examples:
         * - Valid: IT00743110157
         * - Invalid: IT00743110158
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _it: function (value) {
            if (!/^IT[0-9]{11}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            if (parseInt(value.substr(0, 7)) == 0) {
                return false;
            }

            var lastThree = parseInt(value.substr(7, 3));
            if ((lastThree < 1) || (lastThree > 201) && lastThree != 999 && lastThree != 888) {
                return false;
            }

            return $.fn.bootstrapValidator.helpers.luhn(value);
        },

        /**
         * Validate Lithuanian VAT number
         * It can be:
         * - 9 digits, for legal entities
         * - 12 digits, for temporarily registered taxpayers
         *
         * Examples:
         * - Valid: LT119511515, LT100001919017, LT100004801610
         * - Invalid: LT100001919018
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _lt: function (value) {
            if (!/^LT([0-9]{7}1[0-9]{1}|[0-9]{10}1[0-9]{1})$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var length = value.length,
                sum = 0;
            for (var i = 0; i < length - 1; i++) {
                sum += parseInt(value.charAt(i)) * (1 + i % 9);
            }
            var check = sum % 11;
            if (check == 10) {
                sum = 0;
                for (var i = 0; i < length - 1; i++) {
                    sum += parseInt(value.charAt(i)) * (1 + (i + 2) % 9);
                }
            }
            check = check % 11 % 10;
            return (check == value.charAt(length - 1));
        },

        /**
         * Validate Luxembourg VAT number
         * Examples:
         * - Valid: LU15027442
         * - Invalid: LU15027443
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _lu: function (value) {
            if (!/^LU[0-9]{8}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            return (value.substr(0, 6) % 89 == value.substr(6, 2));
        },

        /**
         * Validate Latvian VAT number
         * Examples:
         * - Valid: LV40003521600, LV16117519997
         * - Invalid: LV40003521601, LV16137519997
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _lv: function (value) {
            if (!/^LV[0-9]{11}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var first = parseInt(value.charAt(0)),
                sum = 0,
                weight = [],
                i = 0,
                length = value.length;
            if (first > 3) {
                // Legal entity
                sum = 0;
                weight = [9, 1, 4, 8, 3, 10, 2, 5, 7, 6, 1];
                for (i = 0; i < length; i++) {
                    sum += parseInt(value.charAt(i)) * weight[i];
                }
                sum = sum % 11;
                return (sum == 3);
            } else {
                // Check birth date
                var day = parseInt(value.substr(0, 2)),
                    month = parseInt(value.substr(2, 2)),
                    year = parseInt(value.substr(4, 2));
                year = year + 1800 + parseInt(value.charAt(6)) * 100;

                try {
                    var d = new Date(year, month, day);
                } catch (ex) {
                    return false;
                }

                // Check personal code
                sum = 0;
                weight = [10, 5, 8, 4, 2, 1, 6, 3, 7, 9];
                for (i = 0; i < length - 1; i++) {
                    sum += parseInt(value.charAt(i)) * weight[i];
                }
                sum = (sum + 1) % 11 % 10;
                return (sum == value.charAt(length - 1));
            }

            return true;
        },

        /**
         * Validate Maltese VAT number
         * Examples:
         * - Valid: MT11679112
         * - Invalid: MT11679113
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _mt: function (value) {
            if (!/^MT[0-9]{8}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var sum = 0,
                weight = [3, 4, 6, 7, 8, 9, 10, 1];

            for (var i = 0; i < 8; i++) {
                sum += parseInt(value.charAt(i)) * weight[i];
            }

            return (sum % 37 == 0);
        },

        /**
         * Validate Dutch VAT number
         * Examples:
         * - Valid: NL004495445B01
         * - Invalid: NL123456789B90
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _nl: function (value) {
            if (!/^NL[0-9]{9}B[0-9]{2}$/.test(value)) {
                return false;
            }
            value = value.substr(2);
            var sum = 0,
                weight = [9, 8, 7, 6, 5, 4, 3, 2];
            for (var i = 0; i < 8; i++) {
                sum += parseInt(value.charAt(i)) * weight[i];
            }

            sum = sum % 11;
            if (sum > 9) {
                sum = 0;
            }
            return (sum == value.substr(8, 1));
        },

        /**
         * Validate Norwegian VAT number
         *
         * @see http://www.brreg.no/english/coordination/number.html
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _no: function (value) {
            if (!/^NO[0-9]{9}$/.test(value)) {
                return false;
            }
            value = value.substr(2);
            var sum = 0,
                weight = [3, 2, 7, 6, 5, 4, 3, 2];
            for (var i = 0; i < 8; i++) {
                sum += parseInt(value.charAt(i)) * weight[i];
            }

            sum = 11 - sum % 11;
            if (sum == 11) {
                sum = 0;
            }
            return (sum == value.substr(8, 1));
        },

        /**
         * Validate Polish VAT number
         * Examples:
         * - Valid: PL8567346215
         * - Invalid: PL8567346216
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _pl: function (value) {
            if (!/^PL[0-9]{10}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var sum = 0,
                weight = [6, 5, 7, 2, 3, 4, 5, 6, 7, -1];

            for (var i = 0; i < 10; i++) {
                sum += parseInt(value.charAt(i)) * weight[i];
            }

            return (sum % 11 == 0);
        },

        /**
         * Validate Portuguese VAT number
         * Examples:
         * - Valid: PT501964843
         * - Invalid: PT501964842
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _pt: function (value) {
            if (!/^PT[0-9]{9}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var sum = 0,
                weight = [9, 8, 7, 6, 5, 4, 3, 2];

            for (var i = 0; i < 8; i++) {
                sum += parseInt(value.charAt(i)) * weight[i];
            }
            sum = 11 - sum % 11;
            if (sum > 9) {
                sum = 0;
            }
            return (sum == value.substr(8, 1));
        },

        /**
         * Validate Romanian VAT number
         * Examples:
         * - Valid: RO18547290
         * - Invalid: RO18547291
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _ro: function (value) {
            if (!/^RO[1-9][0-9]{1,9}$/.test(value)) {
                return false;
            }
            value = value.substr(2);

            var length = value.length,
                weight = [7, 5, 3, 2, 1, 7, 5, 3, 2].slice(10 - length),
                sum = 0;
            for (var i = 0; i < length - 1; i++) {
                sum += parseInt(value.charAt(i)) * weight[i];
            }

            sum = (10 * sum) % 11 % 10;
            return (sum == value.substr(length - 1, 1));
        },

        /**
         * Validate Russian VAT number (Taxpayer Identification Number - INN)
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _ru: function (value) {
            if (!/^RU([0-9]{9}|[0-9]{12})$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            if (value.length == 10) {
                var sum = 0,
                    weight = [2, 4, 10, 3, 5, 9, 4, 6, 8, 0];
                for (var i = 0; i < 10; i++) {
                    sum += parseInt(value.charAt(i)) * weight[i];
                }
                sum = sum % 11;
                if (sum > 9) {
                    sum = sum % 10;
                }

                return (sum == value.substr(9, 1));
            } else if (value.length == 12) {
                var sum1 = 0,
                    weight1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0],
                    sum2 = 0,
                    weight2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0];

                for (var i = 0; i < 11; i++) {
                    sum1 += parseInt(value.charAt(i)) * weight1[i];
                    sum2 += parseInt(value.charAt(i)) * weight2[i];
                }
                sum1 = sum1 % 11;
                if (sum1 > 9) {
                    sum1 = sum1 % 10;
                }
                sum2 = sum2 % 11;
                if (sum2 > 9) {
                    sum2 = sum2 % 10;
                }

                return (sum1 == value.substr(10, 1) && sum2 == value.substr(11, 1));
            }

            return false;
        },

        /**
         * Validate Serbian VAT number
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _rs: function (value) {
            if (!/^RS[0-9]{9}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var sum = 10,
                temp = 0;
            for (var i = 0; i < 8; i++) {
                temp = (parseInt(value.charAt(i)) + sum) % 10;
                if (temp == 0) {
                    temp = 10;
                }
                sum = (2 * temp) % 11;
            }

            return ((sum + parseInt(value.substr(8, 1))) % 10 == 1);
        },

        /**
         * Validate Swedish VAT number
         * Examples:
         * - Valid: SE123456789701
         * - Invalid: SE123456789101
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _se: function (value) {
            if (!/^SE[0-9]{10}01$/.test(value)) {
                return false;
            }

            value = value.substr(2, 10);
            return $.fn.bootstrapValidator.helpers.luhn(value);
        },

        /**
         * Validate Slovenian VAT number
         * Examples:
         * - Valid: SI50223054
         * - Invalid: SI50223055
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _si: function (value) {
            if (!/^SI[0-9]{8}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            var sum = 0,
                weight = [8, 7, 6, 5, 4, 3, 2];

            for (var i = 0; i < 7; i++) {
                sum += parseInt(value.charAt(i)) * weight[i];
            }
            sum = 11 - sum % 11;
            if (sum == 10) {
                sum = 0;
            }
            return (sum == value.substr(7, 1));
        },

        /**
         * Validate Slovak VAT number
         * Examples:
         * - Valid: SK2022749619
         * - Invalid: SK2022749618
         *
         * @param {String} value VAT number
         * @returns {Boolean}
         */
        _sk: function (value) {
            if (!/^SK[1-9][0-9][(2-4)|(6-9)][0-9]{7}$/.test(value)) {
                return false;
            }

            value = value.substr(2);
            return (value % 11 == 0);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.vin = {
        /**
         * Validate an US VIN (Vehicle Identification Number)
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consist of key:
         * - message: The invalid message
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            // Don't accept I, O, Q characters
            if (!/^[a-hj-npr-z0-9]{8}[0-9xX][a-hj-npr-z0-9]{8}$/i.test(value)) {
                return false;
            }

            value = value.toUpperCase();
            var chars = {
                    A: 1,
                    B: 2,
                    C: 3,
                    D: 4,
                    E: 5,
                    F: 6,
                    G: 7,
                    H: 8,
                    J: 1,
                    K: 2,
                    L: 3,
                    M: 4,
                    N: 5,
                    P: 7,
                    R: 9,
                    S: 2,
                    T: 3,
                    U: 4,
                    V: 5,
                    W: 6,
                    X: 7,
                    Y: 8,
                    Z: 9,
                    '1': 1,
                    '2': 2,
                    '3': 3,
                    '4': 4,
                    '5': 5,
                    '6': 6,
                    '7': 7,
                    '8': 8,
                    '9': 9,
                    '0': 0
                },
                weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2],
                sum = 0,
                length = value.length;
            for (var i = 0; i < length; i++) {
                sum += chars[value.charAt(i) + ''] * weights[i];
            }

            var reminder = sum % 11;
            if (reminder == 10) {
                reminder = 'X';
            }

            return reminder == value.charAt(8);
        }
    };
}(window.jQuery));
;
(function ($) {
    $.fn.bootstrapValidator.validators.zipCode = {
        html5Attributes: {
            message: 'message',
            country: 'country'
        },

        /**
         * Return true if and only if the input value is a valid country zip code
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Consist of key:
         * - message: The invalid message
         * - country: The ISO 3166 country code
         *
         * Currently it supports the following countries:
         * - US (United State)
         * - CA (Canada)
         * - DK (Denmark)
         * - GB (United Kingdom)
         * - SE (Sweden)
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '' || !options.country) {
                return true;
            }

            var country = (options.country || 'US').toUpperCase();
            switch (country) {
                case 'CA':
                    return /(?:A|B|C|E|G|J|K|L|M|N|P|R|S|T|V|X|Y){1}[0-9]{1}(?:A|B|C|E|G|J|K|L|M|N|P|R|S|T|V|X|Y){1}\s?[0-9]{1}(?:A|B|C|E|G|J|K|L|M|N|P|R|S|T|V|X|Y){1}[0-9]{1}/i.test(value);
                case 'DK':
                    return /^(DK(-|\s)?)?\d{4}$/i.test(value);
                case 'GB':
                    return this._gb(value);
                case 'SE':
                    return /^(S-)?\d{3}\s?\d{2}$/i.test(value);
                case 'US':
                default:
                    return /^\d{4,5}([\-]\d{4})?$/.test(value);
            }
        },

        /**
         * Validate United Kingdom postcode
         * Examples:
         * - Standard: EC1A 1BB, W1A 1HQ, M1 1AA, B33 8TH, CR2 6XH, DN55 1PT
         * - Special cases:
         * AI-2640, ASCN 1ZZ, GIR 0AA
         *
         * @see http://en.wikipedia.org/wiki/Postcodes_in_the_United_Kingdom
         * @param {String} value The postcode
         * @returns {Boolean}
         */
        _gb: function (value) {
            var firstChar = '[ABCDEFGHIJKLMNOPRSTUWYZ]', // Does not accept QVX
                secondChar = '[ABCDEFGHKLMNOPQRSTUVWXY]', // Does not accept IJZ
                thirdChar = '[ABCDEFGHJKPMNRSTUVWXY]',
                fouthChar = '[ABEHMNPRVWXY]',
                fifthChar = '[ABDEFGHJLNPQRSTUWXYZ]',
                regexps = [
                    // AN NAA, ANN NAA, AAN NAA, AANN NAA format
                    new RegExp('^(' + firstChar + '{1}' + secondChar + '?[0-9]{1,2})(\\s*)([0-9]{1}' + fifthChar + '{2})$', 'i'),
                    // ANA NAA
                    new RegExp('^(' + firstChar + '{1}[0-9]{1}' + thirdChar + '{1})(\\s*)([0-9]{1}' + fifthChar + '{2})$', 'i'),
                    // AANA NAA
                    new RegExp('^(' + firstChar + '{1}' + secondChar + '{1}?[0-9]{1}' + fouthChar + '{1})(\\s*)([0-9]{1}' + fifthChar + '{2})$', 'i'),

                    new RegExp('^(BF1)(\\s*)([0-6]{1}[ABDEFGHJLNPQRST]{1}[ABDEFGHJLNPQRSTUWZYZ]{1})$', 'i'), // BFPO postcodes
                    /^(GIR)(\s*)(0AA)$/i, // Special postcode GIR 0AA
                    /^(BFPO)(\s*)([0-9]{1,4})$/i, // Standard BFPO numbers
                    /^(BFPO)(\s*)(c\/o\s*[0-9]{1,3})$/i, // c/o BFPO numbers
                    /^([A-Z]{4})(\s*)(1ZZ)$/i, // Overseas Territories
                    /^(AI-2640)$/i // Anguilla
                ];
            for (var i = 0; i < regexps.length; i++) {
                if (regexps[i].test(value)) {
                    return true;
                }
            }

            return false;
        }
    };
}(window.jQuery));
// add by zhufeng
(function ($) {
    $.fn.bootstrapValidator.validators.floatNumber = {
        /**
         * Return true if the input value contains digits only
         *
         * @param {BootstrapValidator} validator Validate plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            if (value == '') {
                return true;
            }

            return /^[+-]?\d+(\.\d+)?$/.test(value);
        }
    }
}(window.jQuery));
;
///<jscompress sourcefile="pageination.js" />
/*
 * pagination.js 2.0.5
 * A jQuery plugin to provide simple yet fully customisable pagination.
 * https://github.com/superRaytin/paginationjs
 *
 * Homepage: http://paginationjs.com
 *
 * Copyright 2014-2100, superRaytin
 * Released under the MIT license.
 */

(function (global, $) {

    if (typeof $ === 'undefined') {
        throwError('Pagination requires jQuery.');
    }

    var pluginName = 'pagination';

    var pluginHookMethod = 'addHook';

    var eventPrefix = '__pagination-';

    // Conflict, use backup
    if ($.fn.pagination) {
        pluginName = 'pagination2';
    }

    $.fn[pluginName] = function (options) {

        if (typeof options === 'undefined') {
            return this;
        }

        var container = $(this);

        var pagination = {

            initialize: function () {
                var self = this;

                // Save attributes of current instance
                if (!container.data('pagination')) {
                    container.data('pagination', {});
                }

                // Before initialize
                if (self.callHook('beforeInit') === false) return;

                // If pagination has been initialized, destroy it
                if (container.data('pagination').initialized) {
                    $('.paginationjs', container).remove();
                }

                // Inline style
                /*if (attributes.inlineStyle === true) {
                 addStyle();
                 }*/

                // Passed to the callback function
                var model = self.model = {
                    pageRange: attributes.pageRange,
                    pageSize: attributes.pageSize
                };

                // "dataSource"`s type is unknown, parse it to find true data
                self.parseDataSource(attributes.dataSource, function (dataSource) {

                    // Whether simulated pagination
                    self.sync = Helpers.isArray(dataSource);
                    if (self.sync) {
                        model.totalNumber = attributes.totalNumber = dataSource.length;
                    }

                    // Obtain the total number of pages
                    model.totalPage = self.getTotalPage();

                    // Less than one page
                    if (attributes.hideWhenLessThanOnePage) {
                        if (model.totalPage <= 1) return;
                    }

                    var el = self.render(true);

                    // Extra className
                    if (attributes.className) {
                        el.addClass(attributes.className);
                    }

                    model.el = el;

                    // Load template
                    container[attributes.position === 'bottom' ? 'append' : 'prepend'](el);

                    // Binding events
                    self.observer();

                    // initialized flag
                    container.data('pagination').initialized = true;

                    // After initialize
                    self.callHook('afterInit', el);

                });

            },

            render: function (isBoot) {

                var self = this;
                var model = self.model;
                var el = model.el || $('<div class="paginationjs"></div>');
                var isForced = isBoot !== true;

                // Before render
                self.callHook('beforeRender', isForced);

                var currentPage = model.pageNumber || attributes.pageNumber;
                var pageRange = attributes.pageRange;
                var totalPage = model.totalPage;

                var rangeStart = currentPage - pageRange;
                var rangeEnd = currentPage + pageRange;

                if (rangeEnd > totalPage) {
                    rangeEnd = totalPage;
                    rangeStart = totalPage - pageRange * 2;
                    rangeStart = rangeStart < 1 ? 1 : rangeStart;
                }

                if (rangeStart <= 1) {
                    rangeStart = 1;

                    rangeEnd = Math.min(pageRange * 2 + 1, totalPage);
                }

                el.html(self.createTemplate({
                    currentPage: currentPage,
                    pageRange: pageRange,
                    totalPage: totalPage,
                    rangeStart: rangeStart,
                    rangeEnd: rangeEnd
                }));

                // After render
                self.callHook('afterRender', isForced);

                return el;
            },

            // Create template
            createTemplate: function (args) {

                var self = this;
                var currentPage = args.currentPage;
                var totalPage = args.totalPage;
                var rangeStart = args.rangeStart;
                var rangeEnd = args.rangeEnd;

                var totalNumber = attributes.totalNumber;

                var showPrevious = attributes.showPrevious;
                var showNext = attributes.showNext;
                var showPageNumbers = attributes.showPageNumbers;
                var showNavigator = attributes.showNavigator;
                var showGoInput = attributes.showGoInput;
                var showGoButton = attributes.showGoButton;

                var pageLink = attributes.pageLink;
                var prevText = attributes.prevText;
                var nextText = attributes.nextText;
                var ellipsisText = attributes.ellipsisText;
                var goButtonText = attributes.goButtonText;

                var classPrefix = attributes.classPrefix;
                var activeClassName = attributes.activeClassName;
                var disableClassName = attributes.disableClassName;
                var ulClassName = attributes.ulClassName;

                var formatNavigator = $.isFunction(attributes.formatNavigator) ? attributes.formatNavigator() : attributes.formatNavigator;
                var formatGoInput = $.isFunction(attributes.formatGoInput) ? attributes.formatGoInput() : attributes.formatGoInput;
                var formatGoButton = $.isFunction(attributes.formatGoButton) ? attributes.formatGoButton() : attributes.formatGoButton;

                var autoHidePrevious = $.isFunction(attributes.autoHidePrevious) ? attributes.autoHidePrevious() : attributes.autoHidePrevious;
                var autoHideNext = $.isFunction(attributes.autoHideNext) ? attributes.autoHideNext() : attributes.autoHideNext;

                var header = $.isFunction(attributes.header) ? attributes.header() : attributes.header;
                var footer = $.isFunction(attributes.footer) ? attributes.footer() : attributes.footer;

                var html = '';
                var goInput = '<input type="text" class="J-paginationjs-go-pagenumber">';
                var goButton = '<input type="button" class="J-paginationjs-go-button" value="' + goButtonText + '">';
                var formattedString;
                var i;

                if (header) {

                    formattedString = self.replaceVariables(header, {
                        currentPage: currentPage,
                        totalPage: totalPage,
                        totalNumber: totalNumber
                    });

                    html += formattedString;
                }

                if (showPrevious || showPageNumbers || showNext) {

                    html += '<div class="paginationjs-pages">';

                    if (ulClassName) {
                        html += '<ul class="' + ulClassName + '">';
                    } else {
                        html += '<ul>';
                    }

                    // Previous page button
                    if (showPrevious) {
                        if (currentPage === 1) {
                            if (!autoHidePrevious) {
                                html += '<li class="' + classPrefix + '-prev ' + disableClassName + '"><a>' + prevText + '<\/a><\/li>';
                            }
                        } else {
                            html += '<li class="' + classPrefix + '-prev J-paginationjs-previous" data-num="' + (currentPage - 1) + '" title="Previous page"><a href="' + pageLink + '">' + prevText + '<\/a><\/li>';
                        }
                    }

                    // Page numbers
                    if (showPageNumbers) {
                        if (rangeStart <= 3) {
                            for (i = 1; i < rangeStart; i++) {
                                if (i == currentPage) {
                                    html += '<li class="' + classPrefix + '-page J-paginationjs-page ' + activeClassName + '" data-num="' + i + '"><a>' + i + '<\/a><\/li>';
                                } else {
                                    html += '<li class="' + classPrefix + '-page J-paginationjs-page" data-num="' + i + '"><a href="' + pageLink + '">' + i + '<\/a><\/li>';
                                }
                            }
                        } else {
                            if (attributes.showFirstOnEllipsisShow) {
                                html += '<li class="' + classPrefix + '-page ' + classPrefix + '-first J-paginationjs-page" data-num="1"><a href="' + pageLink + '">1<\/a><\/li>';
                            }

                            html += '<li class="' + classPrefix + '-ellipsis ' + disableClassName + '"><a>' + ellipsisText + '<\/a><\/li>';
                        }

                        // Main loop
                        for (i = rangeStart; i <= rangeEnd; i++) {
                            if (i == currentPage) {
                                html += '<li class="' + classPrefix + '-page J-paginationjs-page ' + activeClassName + '" data-num="' + i + '"><a>' + i + '<\/a><\/li>';
                            } else {
                                html += '<li class="' + classPrefix + '-page J-paginationjs-page" data-num="' + i + '"><a href="' + pageLink + '">' + i + '<\/a><\/li>';
                            }
                        }

                        if (rangeEnd >= totalPage - 2) {
                            for (i = rangeEnd + 1; i <= totalPage; i++) {
                                html += '<li class="' + classPrefix + '-page J-paginationjs-page" data-num="' + i + '"><a href="' + pageLink + '">' + i + '<\/a><\/li>';
                            }
                        } else {
                            html += '<li class="' + classPrefix + '-ellipsis ' + disableClassName + '"><a>' + ellipsisText + '<\/a><\/li>';

                            if (attributes.showLastOnEllipsisShow) {
                                html += '<li class="' + classPrefix + '-page ' + classPrefix + '-last J-paginationjs-page" data-num="' + totalPage + '"><a href="' + pageLink + '">' + totalPage + '<\/a><\/li>';
                            }
                        }
                    }

                    // Next page button
                    if (showNext) {
                        if (currentPage == totalPage) {
                            if (!autoHideNext) {
                                html += '<li class="' + classPrefix + '-next ' + disableClassName + '"><a>' + nextText + '<\/a><\/li>';
                            }
                        } else {
                            html += '<li class="' + classPrefix + '-next J-paginationjs-next" data-num="' + (currentPage + 1) + '" title="Next page"><a href="' + pageLink + '">' + nextText + '<\/a><\/li>';
                        }
                    }

                    html += '<\/ul><\/div>';

                }

                // Navigator
                if (showNavigator) {

                    if (formatNavigator) {

                        formattedString = self.replaceVariables(formatNavigator, {
                            currentPage: currentPage,
                            totalPage: totalPage,
                            totalNumber: totalNumber
                        });

                        html += '<div class="' + classPrefix + '-nav J-paginationjs-nav">' + formattedString + '<\/div>';
                    }
                }

                // Go input
                if (showGoInput) {

                    if (formatGoInput) {

                        formattedString = self.replaceVariables(formatGoInput, {
                            currentPage: currentPage,
                            totalPage: totalPage,
                            totalNumber: totalNumber,
                            input: goInput
                        });

                        html += '<div class="' + classPrefix + '-go-input">' + formattedString + '</div>';
                    }
                }

                // Go button
                if (showGoButton) {

                    if (formatGoButton) {

                        formattedString = self.replaceVariables(formatGoButton, {
                            currentPage: currentPage,
                            totalPage: totalPage,
                            totalNumber: totalNumber,
                            button: goButton
                        });

                        html += '<div class="' + classPrefix + '-go-button">' + formattedString + '</div>';
                    }
                }

                if (footer) {

                    formattedString = self.replaceVariables(footer, {
                        currentPage: currentPage,
                        totalPage: totalPage,
                        totalNumber: totalNumber
                    });

                    html += formattedString;
                }

                return html;
            },

            // Go to the specified page
            go: function (number, callback) {

                var self = this;
                var model = self.model;

                if (self.disabled) return;

                var pageNumber = number;
                var pageSize = attributes.pageSize;
                var totalPage = model.totalPage;

                pageNumber = parseInt(pageNumber);

                // Page number out of bounds
                if (!pageNumber || pageNumber < 1 || pageNumber > totalPage) return;

                // Simulated pagination
                if (self.sync) {
                    render(self.getDataSegment(pageNumber));
                    return;
                }

                var postData = {};
                var alias = attributes.alias || {};

                postData[alias.pageSize ? alias.pageSize : 'pageSize'] = pageSize;
                postData[alias.pageNumber ? alias.pageNumber : 'pageNumber'] = pageNumber;

                var formatAjaxParams = {
                    type: 'get',
                    cache: false,
                    data: {},
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    dataType: 'json',
                    async: true
                };

                $.extend(true, formatAjaxParams, attributes.ajax);
                $.extend(formatAjaxParams.data || {}, postData);

                formatAjaxParams.url = attributes.dataSource;
                formatAjaxParams.success = function (response) {
                    render(self.filterDataByLocator(response));
                };
                formatAjaxParams.error = function (jqXHR, textStatus, errorThrown) {
                    attributes.formatAjaxError && attributes.formatAjaxError(jqXHR, textStatus, errorThrown);
                    self.enable();
                };

                self.disable();

                $.ajax(formatAjaxParams);

                function render(data) {
                    // Pagination direction
                    model.direction = typeof model.pageNumber === 'undefined' ? 0 : (pageNumber > model.pageNumber ? 1 : -1);

                    model.pageNumber = pageNumber;

                    self.render();

                    if (self.disabled && !self.sync) {
                        // enable
                        self.enable();
                    }

                    // cache model data
                    container.data('pagination').model = model;

                    // format result before execute callback
                    if ($.isFunction(attributes.formatResult)) {
                        var cloneData = $.extend(true, [], data);
                        if (!Helpers.isArray(data = attributes.formatResult(cloneData))) {
                            data = cloneData;
                        }
                    }

                    container.data('pagination').currentPageData = data;

                    // Before paging
                    self.callHook('beforePaging');

                    // callback
                    self.doCallback(data, callback);

                    // After pageing
                    self.callHook('afterPaging');

                    // Already the first page
                    if (pageNumber == 1) {
                        self.callHook('afterIsFirstPage');
                    }

                    // Already the last page
                    if (pageNumber == model.totalPage) {
                        self.callHook('afterIsLastPage');
                    }

                }
            },

            doCallback: function (data, customCallback) {
                var self = this;
                var model = self.model;

                if ($.isFunction(customCallback)) {
                    customCallback(data, model);
                } else if ($.isFunction(attributes.callback)) {
                    attributes.callback(data, model);
                }
            },

            destroy: function () {

                // Before destroy
                if (this.callHook('beforeDestroy') === false) return;

                this.model.el.remove();
                container.off();

                // Remove style element
                $('#paginationjs-style').remove();

                // After destroy
                this.callHook('afterDestroy');
            },

            previous: function (callback) {
                this.go(this.model.pageNumber - 1, callback);
            },

            next: function (callback) {
                this.go(this.model.pageNumber + 1, callback);
            },

            disable: function () {
                var self = this;
                var source = self.sync ? 'sync' : 'async';

                // Before disable
                if (self.callHook('beforeDisable', source) === false) return;

                self.disabled = true;
                self.model.disabled = true;

                // After disable
                self.callHook('afterDisable', source);
            },

            enable: function () {
                var self = this;
                var source = self.sync ? 'sync' : 'async';

                // Before enable
                if (self.callHook('beforeEnable', source) === false) return;

                self.disabled = false;
                self.model.disabled = false;

                // After enable
                self.callHook('afterEnable', source);
            },

            show: function () {
                var self = this;

                if (self.model.el.is(':visible')) return;

                self.model.el.show();
            },

            hide: function () {
                var self = this;

                if (!self.model.el.is(':visible')) return;

                self.model.el.hide();
            },

            // Replace the variables of template
            replaceVariables: function (template, variables) {

                var formattedString;

                for (var key in variables) {
                    var value = variables[key];
                    var regexp = new RegExp('<%=\\s*' + key + '\\s*%>', 'img');

                    formattedString = (formattedString || template).replace(regexp, value);
                }

                return formattedString;
            },

            // Get data segments
            getDataSegment: function (number) {
                var pageSize = attributes.pageSize;
                var dataSource = attributes.dataSource;
                var totalNumber = attributes.totalNumber;

                var start = pageSize * (number - 1) + 1;
                var end = Math.min(number * pageSize, totalNumber);

                return dataSource.slice(start - 1, end);
            },

            // Get total page
            getTotalPage: function () {
                return Math.ceil(attributes.totalNumber / attributes.pageSize);
            },

            // Get locator
            getLocator: function (locator) {
                var result;

                if (typeof locator === 'string') {
                    result = locator;
                } else if ($.isFunction(locator)) {
                    result = locator();
                } else {
                    throwError('"locator" is incorrect. (String | Function)');
                }

                return result;
            },

            // Filter data by "locator"
            filterDataByLocator: function (dataSource) {

                var locator = this.getLocator(attributes.locator);
                var filteredData;

                // Data source is an Object, use "locator" to locate the true data
                if (Helpers.isObject(dataSource)) {
                    try {
                        $.each(locator.split('.'), function (index, item) {
                            filteredData = (filteredData ? filteredData : dataSource)[item];
                        });
                    } catch (e) {
                    }

                    if (!filteredData) {
                        throwError('dataSource.' + locator + ' is undefined.');
                    } else if (!Helpers.isArray(filteredData)) {
                        throwError('dataSource.' + locator + ' must be an Array.');
                    }
                }

                return filteredData || dataSource;
            },

            // Parse dataSource
            parseDataSource: function (dataSource, callback) {

                var self = this;
                var args = arguments;

                if (Helpers.isObject(dataSource)) {
                    callback(attributes.dataSource = self.filterDataByLocator(dataSource));
                } else if (Helpers.isArray(dataSource)) {
                    callback(attributes.dataSource = dataSource);
                } else if ($.isFunction(dataSource)) {
                    attributes.dataSource(function (data) {
                        if ($.isFunction(data)) {
                            throwError('Unexpect parameter of the "done" Function.');
                        }

                        args.callee.call(self, data, callback);
                    });
                } else if (typeof dataSource === 'string') {
                    if (/^https?|file:/.test(dataSource)) {
                        attributes.ajaxDataType = 'jsonp';
                    }

                    callback(dataSource);
                } else {
                    throwError('Unexpect data type of the "dataSource".');
                }
            },

            callHook: function (hook) {
                var paginationData = container.data('pagination');
                var result;

                var args = Array.prototype.slice.apply(arguments);
                args.shift();

                if (attributes[hook] && $.isFunction(attributes[hook])) {
                    if (attributes[hook].apply(global, args) === false) {
                        result = false;
                    }
                }

                if (paginationData.hooks && paginationData.hooks[hook]) {
                    $.each(paginationData.hooks[hook], function (index, item) {
                        if (item.apply(global, args) === false) {
                            result = false;
                        }
                    });
                }

                return result !== false;
            },

            observer: function () {

                var self = this;
                var el = self.model.el;

                // Go to page
                container.on(eventPrefix + 'go', function (event, pageNumber, done) {

                    pageNumber = parseInt($.trim(pageNumber));

                    if (!pageNumber) return;

                    if (!$.isNumeric(pageNumber)) {
                        throwError('"pageNumber" is incorrect. (Number)');
                    }

                    self.go(pageNumber, done);
                });

                // Page click
                el.delegate('.J-paginationjs-page', 'click', function (event) {
                    var current = $(event.currentTarget);
                    var pageNumber = $.trim(current.attr('data-num'));

                    if (!pageNumber || current.hasClass(attributes.disableClassName) || current.hasClass(attributes.activeClassName)) return;

                    // Before page button clicked
                    if (self.callHook('beforePageOnClick', event) === false) return false;

                    self.go(pageNumber);

                    // After page button clicked
                    self.callHook('afterPageOnClick', event);

                    if (!attributes.pageLink) return false;
                });

                // Previous click
                el.delegate('.J-paginationjs-previous', 'click', function (event) {
                    var current = $(event.currentTarget);
                    var pageNumber = $.trim(current.attr('data-num'));

                    if (!pageNumber || current.hasClass(attributes.disableClassName)) return;

                    // Before previous clicked
                    if (self.callHook('beforePreviousOnClick', event) === false) return false;

                    self.go(pageNumber);

                    // After previous clicked
                    self.callHook('afterPreviousOnClick', event);

                    if (!attributes.pageLink) return false;
                });

                // Next click
                el.delegate('.J-paginationjs-next', 'click', function (event) {
                    var current = $(event.currentTarget);
                    var pageNumber = $.trim(current.attr('data-num'));

                    if (!pageNumber || current.hasClass(attributes.disableClassName)) return;

                    // Before next clicked
                    if (self.callHook('beforeNextOnClick', event) === false) return false;

                    self.go(pageNumber);

                    // After next clicked
                    self.callHook('afterNextOnClick', event);

                    if (!attributes.pageLink) return false;
                });

                // Go button click
                el.delegate('.J-paginationjs-go-button', 'click', function () {
                    var pageNumber = $('.J-paginationjs-go-pagenumber', el).val();

                    // Before Go button clicked
                    if (self.callHook('beforeGoButtonOnClick', event, pageNumber) === false) return false;

                    container.trigger(eventPrefix + 'go', pageNumber);

                    // After Go button clicked
                    self.callHook('afterGoButtonOnClick', event, pageNumber);
                });

                // go input enter
                el.delegate('.J-paginationjs-go-pagenumber', 'keyup', function (event) {
                    if (event.which === 13) {
                        var pageNumber = $(event.currentTarget).val();

                        // Before Go input enter
                        if (self.callHook('beforeGoInputOnEnter', event, pageNumber) === false) return false;

                        container.trigger(eventPrefix + 'go', pageNumber);

                        // Regains focus
                        $('.J-paginationjs-go-pagenumber', el).focus();

                        // After Go input enter
                        self.callHook('afterGoInputOnEnter', event, pageNumber);
                    }
                });

                // Previous page
                container.on(eventPrefix + 'previous', function (event, done) {
                    self.previous(done);
                });

                // Next page
                container.on(eventPrefix + 'next', function (event, done) {
                    self.next(done);
                });

                // Disable
                container.on(eventPrefix + 'disable', function () {
                    self.disable();
                });

                // Enable
                container.on(eventPrefix + 'enable', function () {
                    self.enable();
                });

                // Show
                container.on(eventPrefix + 'show', function () {
                    self.show();
                });

                // Hide
                container.on(eventPrefix + 'hide', function () {
                    self.hide();
                });

                // Destroy
                container.on(eventPrefix + 'destroy', function () {
                    self.destroy();
                });

                // If simulated paging, trigger a default page
                if (pagination.sync || attributes.triggerPagingOnInit) {
                    container.trigger(eventPrefix + 'go', Math.min(attributes.pageNumber, self.model.totalPage));
                }
            }
        };


        // If initial
        if (container.data('pagination') && container.data('pagination').initialized === true) {

            // Handling events
            if ($.isNumeric(options)) {
                // container.pagination(5)
                container.trigger.call(this, eventPrefix + 'go', options, arguments[1]);
                return this;
            } else if (typeof options === 'string') {

                var args = Array.prototype.slice.apply(arguments);
                args[0] = eventPrefix + args[0];

                switch (options) {
                    case 'previous':
                    case 'next':
                    case 'go':
                    case 'disable':
                    case 'enable':
                    case 'show':
                    case 'hide':
                    case 'destroy':
                        container.trigger.apply(this, args);
                        break;

                    // Get selected page number
                    case 'getSelectedPageNum':
                        if (container.data('pagination').model) {
                            return container.data('pagination').model.pageNumber;
                        } else {
                            return container.data('pagination').attributes.pageNumber;
                        }

                    // Get total page
                    case 'getTotalPage':
                        return container.data('pagination').model.totalPage;

                    // Get selected page data
                    case 'getSelectedPageData':
                        return container.data('pagination').currentPageData;

                    // Whether pagination was be disabled
                    case 'isDisabled':
                        return container.data('pagination').model.disabled === true;

                    default:
                        throwError('Pagination do not provide action: ' + options);
                }

                return this;
            }
        } else {
            if (!Helpers.isObject(options)) {
                throwError('options is illegal');
            }
        }


        // Attributes
        var attributes = $.extend({}, arguments.callee.defaults, options);

        // Check parameters
        parameterChecker(attributes);

        pagination.initialize();

        return this;
    };

    // Instance defaults
    $.fn[pluginName].defaults = {

        // Data source
        // Array | String | Function | Object
        //dataSource: '',

        // String | Function
        //locator: 'data',

        // Total entries, must be specified when the pagination is asynchronous
        totalNumber: 1,

        // Default page
        pageNumber: 1,

        // entries of per page
        pageSize: 10,

        // Page range (pages on both sides of the current page)
        pageRange: 2,

        // Whether to display the 'Previous' button
        showPrevious: true,

        // Whether to display the 'Next' button
        showNext: true,

        // Whether to display the page buttons
        showPageNumbers: true,

        showNavigator: false,

        // Whether to display the 'Go' input
        showGoInput: false,

        // Whether to display the 'Go' button
        showGoButton: false,

        // Page link
        pageLink: '',

        // 'Previous' text
        prevText: '&laquo;',
        // prevText: '上一页',


        // 'Next' text
        nextText: '&raquo;',
        // nextText: '下一页',

        // Ellipsis text
        ellipsisText: '...',

        // 'Go' button text
        goButtonText: 'Go',

        // Additional className for Pagination element
        //className: '',

        classPrefix: 'paginationjs',

        // Default active class
        activeClassName: 'active',

        // Default disable class
        disableClassName: 'disabled',

        //ulClassName: '',

        // Whether to insert inline style
        inlineStyle: true,

        formatNavigator: '<%= currentPage %> / <%= totalPage %>',

        formatGoInput: '<%= input %>',

        formatGoButton: '<%= button %>',

        // Pagination element's position in the container
        position: 'bottom',

        // Auto hide previous button when current page is the first page
        autoHidePrevious: false,

        // Auto hide next button when current page is the last page
        autoHideNext: false,

        //header: '',

        //footer: '',

        // Aliases for custom pagination parameters
        //alias: {},

        // Whether to trigger pagination at initialization
        triggerPagingOnInit: true,

        // Whether to hide pagination when less than one page
        hideWhenLessThanOnePage: false,

        showFirstOnEllipsisShow: true,

        showLastOnEllipsisShow: true,

        // Pagging callback
        callback: function () {
        }
    };

    // Hook register
    $.fn[pluginHookMethod] = function (hook, callback) {

        if (arguments.length < 2) {
            throwError('Missing argument.');
        }

        if (!$.isFunction(callback)) {
            throwError('callback must be a function.');
        }

        var container = $(this);
        var paginationData = container.data('pagination');

        if (!paginationData) {
            container.data('pagination', {});
            paginationData = container.data('pagination');
        }

        !paginationData.hooks && (paginationData.hooks = {});

        //paginationData.hooks[hook] = callback;
        paginationData.hooks[hook] = paginationData.hooks[hook] || [];
        paginationData.hooks[hook].push(callback);

    };

    // Static method
    $[pluginName] = function (selector, options) {

        if (arguments.length < 2) {
            throwError('Requires two parameters.');
        }

        var container;

        // 'selector' is a jQuery object
        if (typeof selector !== 'string' && selector instanceof jQuery) {
            container = selector;
        } else {
            container = $(selector);
        }

        if (!container.length) return;

        container.pagination(options);

        return container;

    };

    // ============================================================
    // helpers
    // ============================================================

    var Helpers = {};

    // Throw error

    function throwError(content) {
        throw new Error('Pagination: ' + content);
    }

    // Check parameters

    function parameterChecker(args) {

        if (!args.dataSource) {
            throwError('"dataSource" is required.');
        }

        if (typeof args.dataSource === 'string') {
            if (typeof args.totalNumber === 'undefined') {
                throwError('"totalNumber" is required.');
            } else if (!$.isNumeric(args.totalNumber)) {
                throwError('"totalNumber" is incorrect. (Number)');
            }
        } else if (Helpers.isObject(args.dataSource)) {
            if (typeof args.locator === 'undefined') {
                throwError('"dataSource" is a Object, please specify "locator".');
            } else if (typeof args.locator !== 'string' && !$.isFunction(args.locator)) {
                throwError('' + args.locator + ' is incorrect. (String | Function)');
            }
        }
    }

    // Object type detection

    function getObjectType(object) {
        var tmp;
        return ((tmp = typeof(object)) == "object" ? object == null && "null" || Object.prototype.toString.call(object).slice(8, -1) : tmp).toLowerCase();
    }

    $.each(['Object', 'Array'], function (index, name) {
        Helpers['is' + name] = function (object) {
            return getObjectType(object) === name.toLowerCase();
        };
    });

    // Inline style

    /*function addStyle() {
     var styleElement = $('#paginationjs-style');

     if (styleElement.length) return;

     var cssText = '.paginationjs{line-height:1.6;font-family:"Marmelad","Lucida Grande","Arial","Hiragino Sans GB",Georgia,sans-serif;font-size:14px;box-sizing:initial}.paginationjs:after{display:table;content:" ";clear:both}.paginationjs .paginationjs-pages{float:left}.paginationjs .paginationjs-pages ul{float:left;margin:0;padding:0}.paginationjs .paginationjs-pages li{float:left;border:1px solid #aaa;border-right:0;list-style:none}.paginationjs .paginationjs-pages li>a{min-width:38px;height:38px;line-height:38px;display:block;background:#fff;font-size:14px;color:#333;text-decoration:none;text-align:center}.paginationjs .paginationjs-pages li>a:hover{background:#eee}.paginationjs .paginationjs-pages li.active{border:0}.paginationjs .paginationjs-pages li.active>a{height:40px;width:40px;line-height:40px;background:#2381c5;color:#fff}.paginationjs .paginationjs-pages li.disabled>a{opacity:.3}.paginationjs .paginationjs-pages li.disabled>a:hover{background:0}.paginationjs .paginationjs-pages li:first-child{border-radius:3px 0 0 3px;}.paginationjs .paginationjs-pages li:first-child>a{border-radius:3px 0 0 3px;font-size:15px;}.paginationjs .paginationjs-pages li:last-child{border-right:1px solid #aaa;border-radius:0 3px 3px 0}.paginationjs .paginationjs-pages li:last-child>a{border-radius:0 3px 3px 0;font-size:15px;}.paginationjs .paginationjs-go-input{float:left;margin-left:10px;font-size:14px}.paginationjs .paginationjs-go-input>input[type="text"]{width:30px;height:38px;background:#fff;border-radius:3px;border:1px solid #aaa;padding:0;font-size:14px;text-align:center;vertical-align:baseline;outline:0;box-shadow:none;box-sizing:initial}.paginationjs .paginationjs-go-button{float:left;margin-left:10px;font-size:14px}.paginationjs .paginationjs-go-button>input[type="button"]{min-width:40px;height:40px;line-height:28px;background:#fff;border-radius:3px;border:1px solid #aaa;text-align:center;padding:0 8px;font-size:14px;vertical-align:baseline;outline:0;box-shadow:none;color:#333;cursor:pointer}.paginationjs .paginationjs-go-button>input[type="button"]:hover{background-color:#f8f8f8}.paginationjs .paginationjs-nav{float:left;height:30px;line-height:30px;margin-left:10px;font-size:14px}.paginationjs.paginationjs-small{font-size:12px}.paginationjs.paginationjs-small .paginationjs-pages li>a{min-width:26px;height:24px;line-height:24px;font-size:12px}.paginationjs.paginationjs-small .paginationjs-pages li.active>a{height:26px;line-height:26px}.paginationjs.paginationjs-small .paginationjs-go-input{font-size:12px}.paginationjs.paginationjs-small .paginationjs-go-input>input[type="text"]{width:26px;height:24px;font-size:12px}.paginationjs.paginationjs-small .paginationjs-go-button{font-size:12px}.paginationjs.paginationjs-small .paginationjs-go-button>input[type="button"]{min-width:30px;height:26px;line-height:24px;padding:0 6px;font-size:12px}.paginationjs.paginationjs-small .paginationjs-nav{height:26px;line-height:26px;font-size:12px}.paginationjs.paginationjs-big{font-size:16px}.paginationjs.paginationjs-big .paginationjs-pages li>a{min-width:36px;height:34px;line-height:34px;font-size:16px}.paginationjs.paginationjs-big .paginationjs-pages li.active>a{height:36px;line-height:36px}.paginationjs.paginationjs-big .paginationjs-go-input{font-size:16px}.paginationjs.paginationjs-big .paginationjs-go-input>input[type="text"]{width:36px;height:34px;font-size:16px}.paginationjs.paginationjs-big .paginationjs-go-button{font-size:16px}.paginationjs.paginationjs-big .paginationjs-go-button>input[type="button"]{min-width:50px;height:36px;line-height:34px;padding:0 12px;font-size:16px}.paginationjs.paginationjs-big .paginationjs-nav{height:36px;line-height:36px;font-size:16px}.paginationjs.paginationjs-theme-blue .paginationjs-pages li{border-color:#289de9}.paginationjs.paginationjs-theme-blue .paginationjs-pages li>a{color:#289de9}.paginationjs.paginationjs-theme-blue .paginationjs-pages li>a:hover{background:#e9f4fc}.paginationjs.paginationjs-theme-blue .paginationjs-pages li.active>a{background:#289de9;color:#fff}.paginationjs.paginationjs-theme-blue .paginationjs-pages li.disabled>a:hover{background:0}.paginationjs.paginationjs-theme-blue .paginationjs-go-input>input[type="text"]{border-color:#289de9}.paginationjs.paginationjs-theme-blue .paginationjs-go-button>input[type="button"]{background:#289de9;border-color:#289de9;color:#fff}.paginationjs.paginationjs-theme-blue .paginationjs-go-button>input[type="button"]:hover{background-color:#3ca5ea}.paginationjs.paginationjs-theme-green .paginationjs-pages li{border-color:#449d44}.paginationjs.paginationjs-theme-green .paginationjs-pages li>a{color:#449d44}.paginationjs.paginationjs-theme-green .paginationjs-pages li>a:hover{background:#ebf4eb}.paginationjs.paginationjs-theme-green .paginationjs-pages li.active>a{background:#449d44;color:#fff}.paginationjs.paginationjs-theme-green .paginationjs-pages li.disabled>a:hover{background:0}.paginationjs.paginationjs-theme-green .paginationjs-go-input>input[type="text"]{border-color:#449d44}.paginationjs.paginationjs-theme-green .paginationjs-go-button>input[type="button"]{background:#449d44;border-color:#449d44;color:#fff}.paginationjs.paginationjs-theme-green .paginationjs-go-button>input[type="button"]:hover{background-color:#55a555}.paginationjs.paginationjs-theme-yellow .paginationjs-pages li{border-color:#ec971f}.paginationjs.paginationjs-theme-yellow .paginationjs-pages li>a{color:#ec971f}.paginationjs.paginationjs-theme-yellow .paginationjs-pages li>a:hover{background:#fdf5e9}.paginationjs.paginationjs-theme-yellow .paginationjs-pages li.active>a{background:#ec971f;color:#fff}.paginationjs.paginationjs-theme-yellow .paginationjs-pages li.disabled>a:hover{background:0}.paginationjs.paginationjs-theme-yellow .paginationjs-go-input>input[type="text"]{border-color:#ec971f}.paginationjs.paginationjs-theme-yellow .paginationjs-go-button>input[type="button"]{background:#ec971f;border-color:#ec971f;color:#fff}.paginationjs.paginationjs-theme-yellow .paginationjs-go-button>input[type="button"]:hover{background-color:#eea135}.paginationjs.paginationjs-theme-red .paginationjs-pages li{border-color:#c9302c}.paginationjs.paginationjs-theme-red .paginationjs-pages li>a{color:#c9302c}.paginationjs.paginationjs-theme-red .paginationjs-pages li>a:hover{background:#faeaea}.paginationjs.paginationjs-theme-red .paginationjs-pages li.active>a{background:#c9302c;color:#fff}.paginationjs.paginationjs-theme-red .paginationjs-pages li.disabled>a:hover{background:0}.paginationjs.paginationjs-theme-red .paginationjs-go-input>input[type="text"]{border-color:#c9302c}.paginationjs.paginationjs-theme-red .paginationjs-go-button>input[type="button"]{background:#c9302c;border-color:#c9302c;color:#fff}.paginationjs.paginationjs-theme-red .paginationjs-go-button>input[type="button"]:hover{background-color:#ce4541}.paginationjs .paginationjs-pages li.paginationjs-next{*border-right:1px solid #aaa;border-right:1px solid #aaa\\0}.paginationjs .paginationjs-go-input{*margin-left:5px;margin-left:5px\\0}.paginationjs .paginationjs-go-input>input[type="text"]{*line-height:28px;line-height:28px\\0;*vertical-align:middle;vertical-align:middle\\0}.paginationjs .paginationjs-go-button{*margin-left:5px;margin-left:5px\\\0}.paginationjs .paginationjs-go-button>input[type="button"]{*vertical-align:middle;vertical-align:middle\\0}.paginationjs.paginationjs-big .paginationjs-pages li>a{line-height:36px\\0}.paginationjs.paginationjs-big .paginationjs-go-input>input[type="text"]{*height:35px;height:36px\\0;*line-height:36px;line-height:36px\\0}';

     $('head').append('<style type="text\/css" id="paginationjs-style">' + cssText + '<\/style>');
     }*/

    /*
     * export via AMD or CommonJS
     * */
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function () {
            return $;
        });
    }

})(this, window.jQuery);
