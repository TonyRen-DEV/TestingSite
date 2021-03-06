(function(global) {
    var k, _handlers = {},
        _mods = {
            16: false,
            18: false,
            17: false,
            91: false
        },
        _scope = "all",
        _MODIFIERS = {
            "⇧": 16,
            shift: 16,
            "⌥": 18,
            alt: 18,
            option: 18,
            "⌃": 17,
            ctrl: 17,
            control: 17,
            "⌘": 91,
            command: 91
        },
        _MAP = {
            backspace: 8,
            tab: 9,
            clear: 12,
            enter: 13,
            "return": 13,
            esc: 27,
            escape: 27,
            space: 32,
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            del: 46,
            "delete": 46,
            home: 36,
            end: 35,
            pageup: 33,
            pagedown: 34,
            ",": 188,
            ".": 190,
            "/": 191,
            "`": 192,
            "-": 189,
            "=": 187,
            ";": 186,
            "'": 222,
            "[": 219,
            "]": 221,
            "\\": 220
        },
        code = function(x) {
            return _MAP[x] || x.toUpperCase().charCodeAt(0)
        },
        _downKeys = [];
    for (k = 1; k < 20; k++) _MAP["f" + k] = 111 + k;

    function index(array, item) {
        var i = array.length;
        while (i--)
            if (array[i] === item) return i;
        return -1
    }

    function compareArray(a1, a2) {
        if (a1.length != a2.length) return false;
        for (var i = 0; i < a1.length; i++) {
            if (a1[i] !== a2[i]) return false
        }
        return true
    }
    var modifierMap = {
        16: "shiftKey",
        18: "altKey",
        17: "ctrlKey",
        91: "metaKey"
    };

    function updateModifierKey(event) {
        for (k in _mods) _mods[k] = event[modifierMap[k]]
    }

    function dispatch(event) {
        var key, handler, k, i, modifiersMatch, scope;
        key = event.keyCode;
        if (index(_downKeys, key) == -1) {
            _downKeys.push(key)
        }
        if (key == 93 || key == 224) key = 91;
        if (key in _mods) {
            _mods[key] = true;
            for (k in _MODIFIERS)
                if (_MODIFIERS[k] == key) assignKey[k] = true;
            return
        }
        updateModifierKey(event);
        if (!assignKey.filter.call(this, event)) return;
        if (!(key in _handlers)) return;
        scope = getScope();
        for (i = 0; i < _handlers[key].length; i++) {
            handler = _handlers[key][i];
            if (handler.scope == scope || handler.scope == "all") {
                modifiersMatch = handler.mods.length > 0;
                for (k in _mods)
                    if (!_mods[k] && index(handler.mods, +k) > -1 || _mods[k] && index(handler.mods, +k) == -1) modifiersMatch = false;
                if (handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch) {
                    if (handler.method(event, handler) === false) {
                        if (event.preventDefault) event.preventDefault();
                        else event.returnValue = false;
                        if (event.stopPropagation) event.stopPropagation();
                        if (event.cancelBubble) event.cancelBubble = true
                    }
                }
            }
        }
    }

    function clearModifier(event) {
        var key = event.keyCode,
            k, i = index(_downKeys, key);
        if (i >= 0) {
            _downKeys.splice(i, 1)
        }
        if (key == 93 || key == 224) key = 91;
        if (key in _mods) {
            _mods[key] = false;
            for (k in _MODIFIERS)
                if (_MODIFIERS[k] == key) assignKey[k] = false
        }
    }

    function resetModifiers() {
        for (k in _mods) _mods[k] = false;
        for (k in _MODIFIERS) assignKey[k] = false
    }

    function assignKey(key, scope, method) {
        var keys, mods;
        keys = getKeys(key);
        if (method === undefined) {
            method = scope;
            scope = "all"
        }
        for (var i = 0; i < keys.length; i++) {
            mods = [];
            key = keys[i].split("+");
            if (key.length > 1) {
                mods = getMods(key);
                key = [key[key.length - 1]]
            }
            key = key[0];
            key = code(key);
            if (!(key in _handlers)) _handlers[key] = [];
            _handlers[key].push({
                shortcut: keys[i],
                scope: scope,
                method: method,
                key: keys[i],
                mods: mods
            })
        }
    }

    function unbindKey(key, scope) {
        var multipleKeys, keys, mods = [],
            i, j, obj;
        multipleKeys = getKeys(key);
        for (j = 0; j < multipleKeys.length; j++) {
            keys = multipleKeys[j].split("+");
            if (keys.length > 1) {
                mods = getMods(keys);
                key = keys[keys.length - 1]
            }
            key = code(key);
            if (scope === undefined) {
                scope = getScope()
            }
            if (!_handlers[key]) {
                return
            }
            for (i = 0; i < _handlers[key].length; i++) {
                obj = _handlers[key][i];
                if (obj.scope === scope && compareArray(obj.mods, mods)) {
                    _handlers[key][i] = {}
                }
            }
        }
    }

    function isPressed(keyCode) {
        if (typeof keyCode == "string") {
            keyCode = code(keyCode)
        }
        return index(_downKeys, keyCode) != -1
    }

    function getPressedKeyCodes() {
        return _downKeys.slice(0)
    }

    function filter(event) {
        var tagName = (event.target || event.srcElement).tagName;
        return !(tagName == "INPUT" || tagName == "SELECT" || tagName == "TEXTAREA")
    }
    for (k in _MODIFIERS) assignKey[k] = false;

    function setScope(scope) {
        _scope = scope || "all"
    }

    function getScope() {
        return _scope || "all"
    }

    function deleteScope(scope) {
        var key, handlers, i;
        for (key in _handlers) {
            handlers = _handlers[key];
            for (i = 0; i < handlers.length;) {
                if (handlers[i].scope === scope) handlers.splice(i, 1);
                else i++
            }
        }
    }

    function getKeys(key) {
        var keys;
        key = key.replace(/\s/g, "");
        keys = key.split(",");
        if (keys[keys.length - 1] == "") {
            keys[keys.length - 2] += ","
        }
        return keys
    }

    function getMods(key) {
        var mods = key.slice(0, key.length - 1);
        for (var mi = 0; mi < mods.length; mi++) mods[mi] = _MODIFIERS[mods[mi]];
        return mods
    }

    function addEvent(object, event, method) {
        if (object.addEventListener) object.addEventListener(event, method, false);
        else if (object.attachEvent) object.attachEvent("on" + event, function() {
            method(window.event)
        })
    }
    addEvent(document, "keydown", function(event) {
        dispatch(event)
    });
    addEvent(document, "keyup", clearModifier);
    addEvent(window, "focus", resetModifiers);
    var previousKey = global.key;

    function noConflict() {
        var k = global.key;
        global.key = previousKey;
        return k
    }
    global.key = assignKey;
    global.key.setScope = setScope;
    global.key.getScope = getScope;
    global.key.deleteScope = deleteScope;
    global.key.filter = filter;
    global.key.isPressed = isPressed;
    global.key.getPressedKeyCodes = getPressedKeyCodes;
    global.key.noConflict = noConflict;
    global.key.unbind = unbindKey;
    if (typeof module !== "undefined") module.exports = assignKey
})(this);
"use strict";
(function() {
    var UndoManager = ace.require("./undomanager").UndoManager;
    var original_execute = UndoManager.prototype.execute;
    UndoManager.prototype.id_counter = 0;
    UndoManager.prototype.execute = function(options) {
        var deltaSets = options.args[0];
        for (var ii = 0; ii < deltaSets.length; ii++) deltaSets[ii].delta_array_id = ++this.id_counter;
        original_execute.call(this, options)
    };
    UndoManager.prototype.getCurrentId = function() {
        var top_delta_set = this.$undoStack[this.$undoStack.length - 1];
        if (!top_delta_set) return 0;
        return top_delta_set[top_delta_set.length - 1].delta_array_id
    }
})();
"use strict";
var oxford_comma = function(arr) {
    switch (arr.length) {
        case 1:
            return arr[0];
        case 2:
            return arr[0] + " and " + arr[1];
        case 3:
            return arr[0] + ", " + arr[1] + ", and " + arr[2]
    }
};
var rotate = function(el, deg) {
    el.style.transform = "rotate(" + deg + "deg)";
    el.style.webkitTansform = "rotate(" + deg + "deg)";
    el.style.mozTransform = "rotate(" + deg + "deg)"
};
var translate = function(el, x, y) {
    var str = x == null ? "" : "translate(" + x + "px," + y + "px)";
    el.style.transform = str;
    el.style.webkitTransform = str;
    el.style.mozTransform = str
};
var text_multi = function(el, text, truncate_long_words) {
    if (truncate_long_words) {
        text = text.replace(/(\S{25})\S*/g, "$1...")
    }
    el.textContent = text;
    el.innerHTML = el.innerHTML.replace(/\n/g, "<br/>").replace(/\t/g, "&nbsp;&nbsp;&nbsp; ")
};
var escape_str = function(str) {
    str = str || "";
    return str.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
        return "&#" + i.charCodeAt(0) + ";"
    })
};
var hex_print_string = function(str) {
    var c = [];
    for (var ii = 0; ii < str.length; ii++) c.push(str.charCodeAt(ii).toString(16));
    console.log(c.join(" "))
};
var js_str_from_utf16 = function(str) {
    var bom = new Uint16Array(new Uint8Array([str.charCodeAt(0), str.charCodeAt(1)]).buffer);
    var endian = bom[0] === 65534 ? "be" : "le";
    var arr = new Uint8Array(str.length - 2);
    for (var ii = 2; ii < str.length; ii++) arr[ii - 2] = str.charCodeAt(ii);
    return new TextDecoder("utf-16" + endian).decode(new Uint16Array(arr.buffer))
};
var decode_body = function(body) {
    body = body || "";
    try {
        if (body.substr(0, 2) == String.fromCharCode.call(null, 255, 254) || body.substr(0, 2) == String.fromCharCode.call(null, 254, 255)) return js_str_from_utf16(body);
        else return decodeURIComponent(escape(body))
    } catch (e) {
        return body
    }
};
var css_animation = function() {
    var timers = [];
    var els = [];
    return function(el, cls, callback, delay) {
        el.classList.remove(cls);
        el.offsetTop;
        var old_idx = els.indexOf(el);
        if (old_idx != -1) {
            clearTimeout(timers[old_idx]);
            timers.splice(old_idx, 1);
            els.splice(old_idx, 1)
        }
        els.push(el);
        timers.push(setTimeout(callback, delay));
        el.classList.add(cls)
    }
}();
var stop_propagation = function(e) {
    e.stopPropagation()
};
var prevent_default = function(e) {
    e.preventDefault()
};
var prevent_default_and_stop_propagation = function(e) {
    e.stopPropagation();
    e.preventDefault()
};
var until_success = function(executor) {
    var before_retry = undefined;
    var outer_executor = function(succeed, reject) {
        var rejection_handler = function(err) {
            if (before_retry) {
                try {
                    var pre_retry_result = before_retry(err);
                    if (pre_retry_result) return succeed(pre_retry_result)
                } catch (pre_retry_error) {
                    return reject(pre_retry_error)
                }
            }
            return new Promise(executor).then(succeed, rejection_handler)
        };
        return new Promise(executor).then(succeed, rejection_handler)
    };
    var outer_promise = new Promise(outer_executor);
    outer_promise.before_retry = function(func) {
        before_retry = func;
        return outer_promise
    };
    return outer_promise
};
var ext_from_filename = function(str) {
    str = str || "";
    return str.slice((Math.max(0, str.lastIndexOf(".")) || Infinity) + 1)
};
var load_script_async = function(url) {
    var new_el = document.createElement("script");
    new_el.async = 1;
    new_el.src = url;
    var something_el = document.getElementsByTagName("script")[0];
    something_el.parentNode.insertBefore(new_el, something_el)
};
var offline_simple = function() {
    var callbacks = [];
    var delay_chain = {
        0: 1,
        1: 500,
        500: 1e3,
        1e3: 2500,
        2500: 5e3,
        5e3: 1e4,
        1e4: 6e4,
        6e4: 6e4
    };
    var delay = 0;
    var timer = 0;
    var commence_testing = function() {
        if (timer) return;
        delay = 0;
        clearTimeout(timer);
        timer = setTimeout(run_test, delay)
    };
    var request_test = function() {
        delay = delay_chain[delay];
        clearTimeout(timer);
        console.log("Test of internet access will be made in " + delay + "ms.");
        timer = setTimeout(run_test, delay)
    };
    var addEventListener = function(kind, foo) {
        if (kind !== "online") throw "only 'online' events please.";
        callbacks.push(foo)
    };
    var trigger = function(kind) {
        if (kind !== "online") throw "only 'online' events please.";
        console.log("internet is available");
        for (var ii = 0; ii < callbacks.length; ii++) callbacks[ii]({
            is_online: true
        })
    };
    var run_test = function() {
        timer = 0;
        console.log("testing for internet access");
        var xhr = new XMLHttpRequest;
        xhr.open("HEAD", "/favicon.ico?_=" + (new Date).getTime(), true);
        if (xhr.timeout != null) xhr.timeout = 5e3;
        var check_status = function() {
            if (xhr.status && xhr.status < 12e3) trigger("online");
            else request_test()
        };
        if (xhr.onprogress === null) {
            xhr.onerror = request_test;
            xhr.ontimeout = request_test;
            xhr.onload = check_status
        } else {
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) checkStatus();
                else if (xhr.readyState === 0) request_test()
            }
        }
        try {
            xhr.send()
        } catch (e) {
            request_test()
        }
    };
    return {
        addEventListener: addEventListener,
        commence_testing: commence_testing
    }
}();
"use strict";
var DropDown = function(val_array) {
    var str = val_array.map(function(val) {
        return "<div class='dropdown_item' title='" + escape_str(val) + "'>" + escape_str(val) + "</div>"
    }).join("");
    this.val_array = val_array.slice(0);
    this.el_list = document.createElement("div");
    this.el_list.className = "dropdown_item_list";
    this.el_list.tabindex = -1;
    this.el_list.style.display = "none";
    this.el_list.innerHTML = str;
    this.el_collapsed = document.createElement("div");
    this.el_collapsed.className = "dropdown_collapsed";
    this.el = document.createElement("div");
    this.el.className = "dropdown";
    this.el.appendChild(this.el_list);
    this.el.appendChild(this.el_collapsed);
    this.ind = 0;
    this.el_collapsed.textContent = val_array[0];
    this.event_callbacks = {};
    this.open = false;
    this.enabled = true;
    var dd = this;
    this.document_mousedown = function(e) {
        dd.el_list.style.display = "none";
        dd.open = false;
        dd.trigger("blur");
        document.removeEventListener("mousedown", dd.document_mousedown)
    };
    this.el_collapsed.addEventListener("mousedown", function() {
        if (!dd.enabled) return;
        if (!dd.trigger("click")) return;
        dd.el.parentNode.classList.add("selected");
        dd.el_list.style.display = "";
        this.open = true;
        setTimeout(function() {
            dd.el_list.focus();
            dd.el_list.scrollTop = dd.el_list.children[dd.ind].offsetTop;
            document.addEventListener("mousedown", dd.document_mousedown)
        }, 1)
    });
    var on_click = function(e) {
        dd.SetInd(this.getAttribute("data-ind"));
        dd.el_list.style.display = "none";
        dd.open = false;
        e.stopPropagation();
        document.removeEventListener("mousedown", dd.document_mousedown)
    };
    for (var ii = 0; ii < this.el_list.children.length; ii++) {
        this.el_list.children[ii].setAttribute("data-ind", ii);
        this.el_list.children[ii].addEventListener("click", on_click)
    }
    return this
};
DropDown.FakeEvent = function() {
    this.is_stopped = false
};
DropDown.FakeEvent.prototype.preventDefault = function() {
    this.is_stopped = true
};
DropDown.FakeEvent.prototype.stopImmediatePropagation = function() {
    this.is_stopped = true
};
DropDown.prototype.addEventListener = function(evt, func) {
    if (!(evt in this.event_callbacks)) this.event_callbacks[evt] = [];
    this.event_callbacks[evt].push(func)
};
DropDown.prototype.trigger = function(evt, args) {
    var fe = new DropDown.FakeEvent;
    if (evt in this.event_callbacks) {
        for (var ii = 0; ii < this.event_callbacks[evt].length; ii++) this.event_callbacks[evt][ii].call(this, fe);
        if (fe.is_stopped) return false
    }
    return true
};
DropDown.prototype.IndexOf = function(val) {
    return this.val_array.indexOf(val)
};
DropDown.prototype.GetVal = function() {
    return this.val_array[this.ind]
};
DropDown.prototype.SetInd = function(ind, no_trigger) {
    ind = Math.min(Math.max(parseInt(ind), 0), this.val_array.length - 1);
    if (ind === this.ind) return;
    this.el_list.children[this.ind].classList.remove("selected");
    this.el_collapsed.textContent = this.val_array[ind];
    this.el_collapsed.title = escape_str(this.val_array[ind]);
    this.ind = ind;
    this.el_list.children[ind].classList.add("selected");
    if (!no_trigger) this.trigger("change", {
        ind: ind,
        str: this.val_array[ind],
        isOpen: this.open
    })
};
DropDown.prototype.SetSelected = function(v) {
    if (v) this.el.parentNode.classList.add("selected");
    else this.el.parentNode.classList.remove("selected")
};
"use strict";
dn.menu_id_to_caption = {
    menu_print: "print",
    menu_sharing: "sharing",
    menu_save: "save",
    menu_history: "history",
    menu_file: "current file",
    menu_new: "new",
    menu_open: "new/open",
    menu_find: "find/replace",
    menu_goto: "goto line",
    menu_general_settings: "general settings",
    menu_shortcuts: "shortcuts",
    menu_drive: "drive",
    menu_help: "about/help"
};
dn.shortcuts_list = ["cut|Ctrl-X|Cmd-X", "copy|Ctrl-C|Cmd-C", "paste|Ctrl-V|Cmd-V", "cycle clipboard|Cltr-[V then left or right arrow]|Cmd-[V then left or right arrow]", "select all|Ctrl-A|Cmd-A", "find|Ctrl(-Alt)-F", "replace|Ctrl-R", "go to line|Ctrl(-Alt)-L", "undo|Ctrl-Z|Cmd-Z", "redo|Ctrl-Shift-Z,Ctrl-Y|Cmd-Shift-Z,Cmd-Y", "autocomplete|Ctrl-Space|Cmd-Space", " | ", "toggle widget|Esc", "save|Ctrl-S|Cmd-S", "print|Ctrl(-Alt)-P|Cmd-P", "file history|Ctrl-H|Cmd-H", "new|Ctrl(-Alt)-N", "open|Ctrl(-Alt)-O", "  | ", "to upper case|Ctrl-U", "to lower case|Ctr-Shift-U", "modify selection|Shift-(Ctrl-)(Alt-) {Down, Up, Left, Right, End, Home, PageDown, PageUp, End}|Shift-(Cmd-)(Alt-) {Down, Up, Left, Right, End, Home, PageDown,End}", "copy lines down|Ctrl-Alt-Down|Cmd-Option-Down", "copy lines up|Ctrl-Alt-Up|Cmd-Option-Up", "center selection||Ctrl-L", "fold all|Alt-0|Option-0", "unfold all|Alt-Shift-0|Option-Shift-0", "go to end|Ctrl-End,Ctrl-Down|Cmd-End,Cmd-Down", "go to line end|Alt-Right,End|Cmd-Right,End,Ctrl-E", "go to line start|Alt-Left,Home|Cmd-Left,Home,Ctrl-A", "go to page down|PageDown|Option-PageDown,Ctrl-V", "go to page up|PageUp|Option-PageUp", "go to start|Ctrl-Home,Ctrl-Up|Cmd-Home,Cmd-Up", "go to word left|Ctrl-Left|Option-Left", "go to word right|Ctrl-Right|Option-Right", "indent|Tab", "outdent|Shift-Tab", "overwrite|Insert", "remove line|Ctrl-D|Cmd-D", "remove to line end||Ctrl-K", "remove to linestart||Option-Backspace", "remove word left||Alt-Backspace,Ctrl-Alt-Backspace", "remove word right||Alt-Delete", "split line||Ctrl-O", "toggle comment|Ctrl-7|Cmd-7", "transpose letters|Ctrl-T"];
dn.ext_to_mime_type = {
    html: "text/html",
    htm: "text/html",
    js: "text/javascript",
    pl: "application/x-perl",
    xml: "text/xml",
    c: "text/x-csrc",
    cpp: "text/x-c++src",
    h: "text/x-chdr",
    json: "application/json",
    php: "application/x-php",
    svg: "text/html",
    css: "text/css",
    java: "text/x-java",
    py: "text/x-python",
    scala: "scala",
    textile: "textile",
    tex: "application/x-tex",
    bib: "application/x-tex",
    rtf: "application/rtf",
    rtx: "application/rtf",
    sh: "application/x-sh",
    sql: "text/x-sql",
    as: "text/x-actionscript"
};
dn.tooltip_info = {
    save: "Save file contents.  ",
    print: "Open print view in a new tab.  ",
    sharing: "View and modify file's sharing status.",
    "file history": "Explore the file history.  ",
    drive: "Show this file in Google Drive.  ",
    about: "Drive Notepad website.",
    shortcuts: "Keyboard shortcuts.",
    "new": "Create new file in a new tab.  ",
    open: "Launch open dialoag.  ",
    settings_file: "Properties of the current file.",
    settings_general: "Your general Drive Notepad preferences.",
    title: "Click to edit the file's title.",
    description: "Click to edit the file's description."
};
var WHICH = {
    ENTER: 13,
    ESC: 27,
    UP: 38,
    DOWN: 40
};
dn.default_settings = {
    ext: "txt",
    wordWrap: [true, null, null],
    wordWrapAt: 80,
    fontSize: 1,
    widget_anchor: ["l", 50, "t", 10],
    showGutterHistory: 1,
    lastDNVersionUsed: "",
    newLineDefault: "windows",
    historyRemovedIsExpanded: true,
    softTabN: 4,
    tabIsHard: 0,
    widgetSub: "general",
    theme: "chrome",
    pane: "",
    pane_open: true,
    find_regex: false,
    find_whole_words: false,
    find_case_sensitive: false,
    help_inner: "main",
    find_goto: false,
    find_replace: false
};
dn.impersonal_settings_keys = ["wordWrap", "wordWrapAt", "fontSize", "widget_anchor", "showGutterHistory", "historyRemovedIsExpanded", "tabIsHard", "softTabN", "newLineDefault", "widgetSub", "theme", "pane", "pane_open", "find_regex", "find_whole_words", "find_case_sensitive", "help_inner", "find_goto", "find_replace"];
dn.const_ = {
    auth_timeout: dn.const_.auth_timeout,
    drag_delay_ms: 400,
    drag_shift_px: 40,
    min_font_size: .3,
    max_font_size: 5,
    max_wrap_at: 200,
    min_wrap_at: 20,
    wrap_at_increment: 10,
    max_soft_tab_n: 10,
    min_soft_tab_n: 2,
    detect_tabs_spaces_frac: .9,
    detect_tabs_tabs_frac: .9,
    detect_tabs_n_spaces_frac: .99,
    detect_tabs_n_spaces_frac_for_default: .6,
    font_size_increment: .15,
    error_delay_ms: 5e3,
    find_history_add_delay: 3e3,
    find_history_max_len: 100,
    clipboard_info_delay: 500,
    clipboard_max_length: 20,
    find_max_results_half: 3,
    find_max_prefix_chars: 10,
    find_max_suffix_chars: 60,
    ad_initial_wait: 4 * 60 * 1e3
};
dn.platform = function() {
    if (navigator.platform.indexOf("Win") > -1) return "Windows";
    else if (navigator.platform.indexOf("Linux") > -1) return "Linux";
    else if (navigator.platform.indexOf("Mac") > -1) return "Mac";
    return null
}();
"use strict";
dn.FileModel = function() {
    this.is_loaded = false;
    this.file_id = null;
    this.folder_id = null;
    this.title = null;
    this.description = "";
    this.ext = "";
    this.loaded_body = "";
    this.loaded_mime_type = undefined;
    this.chosen_mime_type = "text/plain";
    this.is_read_only = false;
    this.is_shared = false;
    this.properties_chosen = {}, this.properties = {}, this.properties_detected_info = {};
    this.change_callbacks = [];
    return this
};
dn.FileModel.prototype.addEventListener = function(kind, c) {
    if (kind !== "change") throw "only change listeners please!";
    this.change_callbacks.push(c)
};
dn.FileModel.prototype.trigger = function(kind, ob) {
    if (kind !== "change") throw "only change events please!";
    for (var ii = 0; ii < this.change_callbacks.length; ii++) this.change_callbacks[ii](ob)
};
dn.FileModel.prototype.set = function(obj) {
    if (obj.syntax && obj.syntax !== this.properties.syntax) {
        this.properties.syntax = obj.syntax;
        if (this.is_loaded) this.compute_syntax()
    }
    if (obj.newline && obj.newline !== this.properties.newline) {
        this.properties.newline = obj.newline;
        if (this.is_loaded) this.compute_newline()
    }
    if (obj.tabs && !(this.properties.tabs && obj.tabs.val === this.properties.tabs.val && obj.tabs.n === this.properties.tabs.n)) {
        this.properties.tabs = obj.tabs;
        if (this.is_loaded) this.compute_tabs()
    }
    if (obj.title && obj.title !== this.title) {
        this.update_mime_type(this.title, obj.title);
        this.title = obj.title;
        this.trigger("change", {
            property: "title"
        });
        if (this.is_loaded) this.compute_syntax()
    }
    if (obj.description && obj.description !== this.description) {
        this.description = obj.description;
        this.trigger("change", {
            property: "description"
        })
    }
    if (obj.is_read_only && obj.is_read_only !== this.is_read_only) {
        this.is_read_only = obj.is_read_only;
        this.trigger("change", {
            property: "is_read_only"
        })
    }
    if (obj.is_shared && obj.is_shared !== this.is_shared) {
        this.is_shared = obj.is_shared;
        this.trigger("change", {
            property: "is_shared"
        })
    }
    if (obj.loaded_mime_type) {
        this.loaded_mime_type = obj.loaded_mime_type;
        this.chosen_mime_type = this.loaded_mime_type || "text/plain"
    }
    if (obj.is_loaded && ~this.is_loaded) {
        this.is_loaded = true;
        this.compute_newline();
        this.compute_tabs();
        this.compute_syntax();
        this.trigger("change", {
            property: "is_loaded"
        })
    }
};
dn.FileModel.prototype.update_mime_type = function(old_title, new_title) {
    old_ext = ext_from_filename(old_title);
    new_ext = ext_from_filename(new_title);
    if (new_ext !== old_ext) {
        this.loaded_mime_type = undefined;
        this.chosen_mime_type = dn.ext_to_mime_type[new_ext] || "text/plain"
    }
};
dn.FileModel.prototype.compute_newline = function() {
    var str = this.loaded_body;
    if (this.properties.newline === "windows") this.properties_chosen.newline = "windows";
    else if (this.properties.newline === "unix") this.properties_chosen.newline = "unix";
    else this.properties.newline = "detect";
    var first_n = str.indexOf("\n");
    if (first_n === -1) {
        var val = dn.g_settings.get("newLineDefault");
        this.properties_detected_info.newline = "no newlines detected, default is " + val + "-like";
        if (this.properties.newline === "detect") this.properties_chosen.newline = val
    } else {
        var has_rn = str.indexOf("\r\n") != -1;
        var has_solo_n = str.match(/[^\r]\n/) ? true : false;
        if (has_rn && !has_solo_n) {
            this.properties_detected_info.newline = "detected windows-like newlines";
            if (this.properties.newline === "detect") this.properties_chosen.newline = "windows"
        } else if (has_solo_n && !has_rn) {
            this.properties_detected_info.newline = "detected unix-like newlines";
            if (this.properties.newline === "detect") this.properties_chosen.newline = "unix"
        } else {
            var val = dn.g_settings.get("newLineDefault");
            this.properties_detected_info.newline = "mixture of newlines detected, default is " + val + "-like";
            this.properties_chosen.newline = val
        }
    }
    this.trigger("change", {
        property: "newline"
    })
};
dn.FileModel.prototype.compute_syntax = function() {
    var title = this.title;
    this.properties_chosen.syntax = undefined;
    if (this.properties.syntax && this.properties.syntax !== "detect") {
        var all_modes = require("ace/ext/modelist").modes;
        for (var ii = 0; ii < all_modes.length; ii++)
            if (all_modes[ii].caption == this.properties.syntax) {
                this.properties_chosen.syntax = this.properties.syntax;
                break
            }
        if (this.properties_chosen.syntax === undefined) this.properties.syntax = "detect"
    } else {
        this.properties.syntax = "detect"
    }
    var detected = require("ace/ext/modelist").getModeForPath(title).caption;
    this.properties_detected_info.syntax = "detected " + detected + " from file extension";
    if (this.properties_chosen.syntax === undefined) this.properties_chosen.syntax = detected;
    this.trigger("change", {
        property: "syntax"
    })
};
dn.FileModel.prototype.re_whitepace = /^([^\S\n\r]+)/gm;
dn.FileModel.prototype.compute_tabs = function() {
    var str = this.loaded_body;
    var prop = this.properties.tabs;
    try {
        if (prop.val === undefined && prop.n === undefined) prop = JSON.parse(prop);
        prop = {
            val: prop.val,
            n: prop.n
        };
        prop.n = parseInt(prop.n);
        if (!(prop.val === "tab" || prop.val === "spaces")) throw 0;
        if (!(prop.n >= dn.const_.min_soft_tab_n && prop.n <= dn.const_.max_soft_tab_n)) prop.n = undefined;
        if (prop.val === "spaces" && prop.n === undefined) throw 0
    } catch (e) {
        prop = {
            val: "detect"
        }
    }
    this.properties.tabs = prop;
    if (prop.val === "tab") this.properties_chosen.tabs = prop;
    else if (prop.val === "spaces") this.properties_chosen.tabs = prop;
    else this.properties_chosen.tabs = undefined;
    var indents = str.match(this.re_whitepace) || [];
    var n_only_tabs = 0;
    var n_only_space;
    var space_hist = [];
    var n_with_mixture = 0;
    var n_samp = Math.min(indents.length, 1e3);
    for (var ii = 0; ii < n_samp; ii++) {
        var indents_ii = indents[ii];
        var without_tabs = indents_ii.replace("	", "");
        if (without_tabs.length === 0) n_only_tabs++;
        else if (without_tabs.length !== indents_ii.length) n_with_mixture++;
        else space_hist[indents_ii.length] = (space_hist[indents_ii.length] || 0) + 1
    }
    n_only_space = n_samp - n_with_mixture - n_only_tabs;
    if (n_only_tabs / n_samp >= dn.const_.detect_tabs_tabs_frac) {
        this.properties_detected_info.tabs = "hard tab indentation detected";
        if (this.properties_chosen.tabs === undefined) this.properties_chosen.tabs = {
            val: "tabs"
        };
        if (this.properties_chosen.tabs.n === undefined) this.properties_chosen.tabs.n = dn.g_settings.get("softTabN")
    } else if (n_samp === 0 || n_only_space / n_samp < dn.const_.detect_tabs_spaces_frac) {
        if (this.properties_chosen.tabs === undefined) {
            this.properties_chosen.tabs = {
                val: dn.g_settings.get("tabIsHard") ? "tabs" : "spaces",
                n: dn.g_settings.get("softTabN")
            }
        }
        this.properties_detected_info.tabs = (n_samp === 0 ? "no indentations detected" : "detected mixture of tabs") + ", default is " + (this.properties_chosen.tabs.val == "tabs" ? "hard tabs" : dn.g_settings.get("softTabN") + " spaces")
    } else {
        var space_mod_hist = [];
        for (var ss = dn.const_.min_soft_tab_n; ss <= dn.const_.max_soft_tab_n; ss++) {
            for (var ii = ss, m = 0; ii < space_hist.length; ii += ss) m += space_hist[ii] === undefined ? 0 : space_hist[ii];
            space_mod_hist[ss] = m
        }
        var ss;
        for (ss = dn.const_.max_soft_tab_n; ss >= dn.const_.min_soft_tab_n; ss--)
            if (space_mod_hist[ss] / n_only_space > dn.const_.detect_tabs_n_spaces_frac) {
                this.properties_detected_info.tabs = "detected soft-tabs of " + ss + " spaces";
                break
            }
        if (ss < dn.const_.min_soft_tab_n) {
            ss = dn.g_settings.get("softTabN");
            if (space_mod_hist[ss] / n_only_space > dn.const_.detect_tabs_n_spaces_frac_for_default) this.properties_detected_info.tabs = "detected close match to default of " + ss + " spaces";
            else this.properties_detected_info.tabs = "detected soft-tabs, assuming default " + ss + " spaces"
        }
        if (this.properties_chosen.tabs === undefined) this.properties_chosen.tabs = {
            val: "spaces"
        };
        if (this.properties_chosen.tabs.n === undefined) this.properties_chosen.tabs.n = ss
    }
    this.trigger("change", {
        property: "tabs"
    })
};
"use strict";
dn.settings_pane = function() {
    var el = {};
    var theme_drop_down;
    var on_document_ready = function() {
        el.theme_chooser = document.getElementById("theme_chooser");
        el.button_clear_clipboard = document.getElementById("button_clear_clipboard");
        el.button_clear_find_replace = document.getElementById("button_clear_find_replace");
        el.gutter_history_show = document.getElementById("gutter_history_show");
        el.gutter_history_hide = document.getElementById("gutter_history_hide");
        el.word_wrap_off = document.getElementById("word_wrap_off");
        el.word_wrap_at = document.getElementById("word_wrap_at");
        el.word_wrap_edge = document.getElementById("word_wrap_edge");
        el.font_size_dec = document.getElementById("font_size_dec");
        el.font_size_inc = document.getElementById("font_size_inc");
        el.font_size_text = document.getElementById("font_size_text");
        el.tab_hard = document.getElementById("tab_hard");
        el.tab_soft = document.getElementById("tab_soft");
        el.newline_windows = document.getElementById("newline_menu_windows");
        el.newline_unix = document.getElementById("newline_menu_unix");
        el.tab_soft_text = document.getElementById("tab_soft_text");
        el.tab_soft_dec = document.getElementById("tab_soft_dec");
        el.tab_soft_inc = document.getElementById("tab_soft_inc");
        el.word_wrap_at_text = document.getElementById("word_wrap_at_text");
        el.word_wrap_at_dec = document.getElementById("word_wrap_at_dec");
        el.word_wrap_at_inc = document.getElementById("word_wrap_at_inc");
        dn.g_settings.addEventListener("VALUE_CHANGED", on_change);
        var themes = require("ace/ext/themelist");
        theme_drop_down = new DropDown(Object.keys(themes.themesByName));
        theme_drop_down.addEventListener("change", function() {
            dn.g_settings.set("theme", theme_drop_down.GetVal())
        });
        theme_drop_down.addEventListener("blur", function() {
            dn.focus_editor()
        });
        el.theme_chooser.appendChild(theme_drop_down.el);
        el.newline_windows.addEventListener("click", function() {
            dn.g_settings.set("newLineDefault", "windows")
        });
        el.newline_unix.addEventListener("click", function() {
            dn.g_settings.set("newLineDefault", "unix")
        });
        el.tab_hard.addEventListener("click", function() {
            dn.g_settings.set("tabIsHard", 1)
        });
        el.tab_soft.addEventListener("click", function() {
            dn.g_settings.set("tabIsHard", 0)
        });
        el.tab_soft_dec.addEventListener("click", function() {
            var at = dn.g_settings.get("softTabN") - 1;
            at = at < dn.const_.min_soft_tab_n ? dn.const_.min_soft_tab_n : at;
            dn.g_settings.set("softTabN", at)
        });
        el.tab_soft_inc.addEventListener("click", function() {
            var at = dn.g_settings.get("softTabN") + 1;
            at = at > dn.const_.max_soft_tab_n ? dn.const_.max_soft_tab_n : at;
            dn.g_settings.set("softTabN", at)
        });
        el.font_size_dec.addEventListener("click", font_size_dec_click);
        el.font_size_inc.addEventListener("click", font_size_inc_click);
        el.word_wrap_off.addEventListener("click", function() {
            dn.g_settings.set("wordWrap", [0, 0, 0])
        });
        el.word_wrap_at.addEventListener("click", function() {
            var at = dn.g_settings.get("wordWrapAt");
            dn.g_settings.set("wordWrap", [1, at, at])
        });
        el.word_wrap_at_dec.addEventListener("click", function() {
            var at = dn.g_settings.get("wordWrapAt") - dn.const_.wrap_at_increment;
            at = at < dn.const_.min_wrap_at ? dn.const_.min_wrap_at : at;
            dn.g_settings.set("wordWrapAt", at)
        });
        el.word_wrap_at_inc.addEventListener("click", function() {
            var at = dn.g_settings.get("wordWrapAt") + dn.const_.wrap_at_increment;
            at = at > dn.const_.max_wrap_at ? dn.const_.max_wrap_at : at;
            dn.g_settings.set("wordWrapAt", at)
        });
        el.word_wrap_edge.addEventListener("click", function() {
            dn.g_settings.set("wordWrap", [1, null, null])
        });
        el.gutter_history_show.addEventListener("click", function() {
            dn.g_settings.set("showGutterHistory", 1)
        });
        el.gutter_history_hide.addEventListener("click", function() {
            dn.g_settings.set("showGutterHistory", 0)
        });
        el.button_clear_clipboard.addEventListener("click", function() {
            dn.g_clipboard.clear()
        });
        el.button_clear_find_replace.addEventListener("click", function() {
            dn.g_find_history.clear()
        })
    };
    var font_size_dec_click = function() {
        var font_size = dn.g_settings.get("fontSize");
        font_size -= dn.const_.font_size_increment;
        font_size = font_size < dn.const_.min_font_size ? dn.const_.min_font_size : font_size;
        dn.g_settings.set("fontSize", font_size)
    };
    var font_size_inc_click = function() {
        var font_size = dn.g_settings.get("fontSize");
        font_size += dn.const_.font_size_increment;
        font_size = font_size > dn.const_.max_font_size ? dn.const_.max_font_size : font_size;
        dn.g_settings.set("fontSize", font_size)
    };
    var on_change = function(e) {
        var new_value = e.newValue;
        switch (e.property) {
            case "showGutterHistory":
                var s = dn.editor.getSession();
                if (new_value) {
                    el.gutter_history_show.classList.add("selected");
                    el.gutter_history_hide.classList.remove("selected")
                } else {
                    el.gutter_history_hide.classList.add("selected");
                    el.gutter_history_show.classList.remove("selected")
                }
                break;
            case "wordWrapAt":
                el.word_wrap_at_text.textContent = new_value;
                break;
            case "wordWrap":
                if (!new_value[0]) el.word_wrap_off.classList.add("selected");
                else el.word_wrap_off.classList.remove("selected");
                if (new_value[0] && !new_value[1]) el.word_wrap_edge.classList.add("selected");
                else el.word_wrap_edge.classList.remove("selected");
                if (new_value[0] && new_value[1]) el.word_wrap_at.classList.add("selected");
                else el.word_wrap_at.classList.remove("selected");
                break;
            case "softTabN":
                el.tab_soft_text.textContent = new_value;
                break;
            case "tabIsHard":
                if (new_value) {
                    el.tab_soft.classList.remove("selected");
                    el.tab_hard.classList.add("selected")
                } else {
                    el.tab_soft.classList.add("selected");
                    el.tab_hard.classList.remove("selected")
                }
                break;
            case "newLineDefault":
                if (new_value == "windows") {
                    el.newline_unix.classList.remove("selected");
                    el.newline_windows.classList.add("selected")
                } else {
                    el.newline_unix.classList.add("selected");
                    el.newline_windows.classList.remove("selected")
                }
                break;
            case "fontSize":
                var scrollLine = dn.get_scroll_line();
                el.font_size_text.textContent = new_value.toFixed(1);
                break;
            case "theme":
                theme_drop_down.SetInd(theme_drop_down.IndexOf(new_value), true);
                break
        }
    };
    return {
        on_document_ready: on_document_ready
    }
}();
"use strict;";
dn.open_pane = function() {
    var el = {};
    var picker;
    var on_document_ready = function() {
        el.opener_button_a = document.getElementById("opener_button_a");
        el.opener_button_a.addEventListener("click", open_button_click)
    };
    var open_button_click = function() {
        gapi.load("picker", function() {
            var view = new google.picker.View(google.picker.ViewId.DOCS);
            try {
                if (!picker) {
                    picker = (new google.picker.PickerBuilder).enableFeature(google.picker.Feature.NAV_HIDDEN).setAppId(dn.client_id).setOAuthToken(gapi.auth.getToken().access_token).addView(view).setCallback(picker_callback).build();
                    if (!picker) throw "could not build picker"
                }
                picker.setVisible(true)
            } catch (e) {
                dn.show_error("" + e)
            }
        })
    };
    var picker_callback = function(data) {
        if (data.action == google.picker.Action.PICKED) {
            var file_id = data.docs[0].id;
            var url = "?state=" + JSON.stringify({
                action: "open",
                userId: dn.url_user_id,
                ids: [file_id]
            });
            window.location = url
        } else if (data.action == "cancel") {
            dn.focus_editor()
        }
    };
    return {
        on_document_ready: on_document_ready
    }
}();
"use strict";
dn.help_pane = function() {
    var el = {};
    var show_inner = function(inner_pane) {
        el.inner_pane_shortcuts.style.display = "none";
        el.inner_pane_tips.style.display = "none";
        el.inner_pane_main.style.display = "none";
        el.button_shortcuts.classList.remove("selected");
        el.button_tips.classList.remove("selected");
        if (inner_pane == "tips") {
            el.inner_pane_tips.style.display = "";
            el.button_tips.classList.add("selected")
        } else if (inner_pane == "shortcuts") {
            el.inner_pane_shortcuts.style.display = "";
            el.button_shortcuts.classList.add("selected")
        } else {
            el.inner_pane_main.style.display = ""
        }
    };
    var render_user_name = function(val) {
        el.user_name.textContent = val
    };
    var create_pane_shortcuts = function() {
        var arry = dn.shortcuts_list;
        var dict = {};
        var platform = dn.platform;
        if (platform == "Windows" || platform == "Linux") {
            for (var i = 0; i < arry.length; i++) {
                var parts = arry[i].split("|");
                if (parts[1].length) dict[parts[0]] = parts[1]
            }
        } else if (platform == "Mac") {
            for (var i = 0; i < arry.length; i++) {
                var parts = arry[i].split("|");
                if (parts[1].length) dict[parts[0]] = parts.length > 2 ? parts[2] : parts[1]
            }
        } else {}
        var html = [];
        for (var action in dict) html.push("<div class='shortcut_item'><div class='shortcut_action'>" + action + "</div><div class='shortcut_key'>" + dict[action].replace(",", "<br>") + "</div></div>");
        el.inner_pane_shortcuts.innerHTML = ["<div class='widget_box_title shortcuts_title'>Keyboard Shortcuts ", platform ? "(" + platform + ")" : "", "</div>", "<div class='shortcuts_header_action'>action</div><div class='shortcuts_header_key'>key</div>", "<div class='shortcuts_list'>", html.join(""), "</div>"].join("")
    };
    var on_document_ready = function() {
        el.user_name = document.getElementById("user_name");
        el.inner_pane_shortcuts = document.getElementById("pane_help_shortcuts");
        el.inner_pane_tips = document.getElementById("pane_help_tips");
        el.inner_pane_main = document.getElementById("pane_help_main");
        el.button_shortcuts = document.getElementById("button_view_shortcuts");
        el.button_tips = document.getElementById("button_view_tips");
        el.button_shortcuts.addEventListener("click", function() {
            if (dn.g_settings.get("help_inner") === "shortcuts") dn.g_settings.set("help_inner", "main");
            else dn.g_settings.set("help_inner", "shortcuts")
        });
        el.button_tips.addEventListener("click", function() {
            if (dn.g_settings.get("help_inner") === "tips") dn.g_settings.set("help_inner", "main");
            else dn.g_settings.set("help_inner", "tips")
        });
        create_pane_shortcuts();
        dn.g_settings.addEventListener("VALUE_CHANGED", function(e) {
            if (e.property === "help_inner") show_inner(e.newValue)
        })
    };
    return {
        on_document_ready: on_document_ready,
        on_user_name_change: render_user_name
    }
}();
"use strict";
dn.filter_api_errors = function(err) {
    if (dn.is_auth_error(err)) {
        dn.pr_auth.reject(err);
        return false
    } else {
        throw err
    }
};
dn.is_auth_error = function(err) {
    if (!err) return 2;
    try {
        if (err.status > 200) {
            var str = "status: " + err.status + "   ";
            if (err.result && err.result.error) str += JSON.stringify(err.result.error);
            str += " dn.status: " + JSON.stringify(dn.status);
            str += " stack: " + (new Error).stack;
            ga("send", "exception", {
                exDescription: str
            })
        }
    } catch (_) {}
    if (err.type === "token_refresh_required" || err.status === 401) return 1;
    if (err.status === 403) {
        var reason = "";
        try {
            reason = err.result.error.errors[0].reason
        } catch (_) {}
        if (reason === "domainPolicy") return 0;
        if (reason === "insufficientFilePermissions") return 0;
        if (reason === "cannotDownloadAbusiveFile") return 0;
        return 1
    }
    if (err.status === 404) return 0;
    if (err === "timeout") return 3;
    if (err.result && err.result.error && err.result.error.code === -1) return 3;
    if (err.status === 400) return 0;
    if (err.status === 500) return 4;
    return 0
};
dn.api_error_to_string = function(err) {
    if (!err) return "Error.";
    var reason = "";
    try {
        reason = err.result.error.errors[0].reason
    } catch (_) {}
    if (reason === "insufficientFilePermissions") return "You do not have permission to modify the file.";
    if (reason === "domainPolicy") return "Your domain administrators have disabled Drive apps.";
    if (err.result && err.result.error && err.result.error.message !== undefined) {
        return "" + err.result.error.message
    } else {
        console.log("Strangely structured error:");
        console.dir(err);
        return "Error. See developer console for details."
    }
};
dn.handle_auth_error = function(err) {
    dn.status.authorization = -1;
    dn.status.popup_active = 0;
    dn.show_status();
    var err_type = dn.is_auth_error(err);
    if (err_type === 0) {
        dn.show_error(dn.api_error_to_string(err))
    } else if (err_type == 1) {
        dn.reauth_auto()
    } else if (err_type == 2) {
        dn.toggle_permission(true)
    } else {
        dn.show_error("network error. retrying...");
        offline_simple.commence_testing()
    }
};
dn.reauth_auto_delay_chain = {
    0: 1,
    1: 500,
    500: 1e3,
    1e3: 2500,
    2500: 5e3,
    5e3: 1e4,
    1e4: 6e4,
    6e4: 6e4
};
dn.reauth_auto = function() {
    if (!dn.reauth_auto_timer) {
        if (!dn.reauth_auto_delay) dn.reauth_auto_delay = dn.reauth_auto_delay_chain[0];
        else dn.reauth_auto_delay = dn.reauth_auto_delay_chain[dn.reauth_auto_delay];
        dn.status.authorization = 0;
        dn.show_status();
        console.log("issuing auto reauth with delay " + dn.reauth_auto_delay + "ms.");
        dn.reauth_auto_timer = setTimeout(function() {
            dn.reauth_auto_timer = undefined;
            console.log("and now running the auto reauth...");
            Promise.race([gapi.auth.authorize(dn.auth_map(true)), make_timeout(dn.const_.auth_timeout)]).then(dn.pr_auth.resolve.bind(dn.pr_auth), dn.pr_auth.reject.bind(dn.pr_auth))
        }, dn.reauth_auto_delay)
    } else {
        console.log("auto reauth already due to be sent")
    }
};
dn.reauth_manual = function() {
    dn.status.popup_active = 1;
    dn.status.authorization = 0;
    dn.show_status();
    Promise.resolve(gapi.auth.authorize(dn.auth_map(false))).then(dn.pr_auth.resolve.bind(dn.pr_auth), dn.pr_auth.reject.bind(dn.pr_auth))
};
dn.request_user_info = function() {
    return gapi.client.request({
        path: "userinfo/v2/me?fields=name"
    })
};
dn.request_file_meta = function() {
    return gapi.client.request({
        path: "/drive/v3/files/" + dn.the_file.file_id,
        params: {
            fields: "id,name,mimeType,description,parents,capabilities,fileExtension,shared,properties"
        }
    })
};
dn.request_file_body = function() {
    return gapi.client.request({
        path: "/drive/v3/files/" + dn.the_file.file_id,
        params: {
            alt: "media"
        },
        headers: {
            contentType: "charset=utf-8"
        }
    })
};
dn.make_multipart_boundary = function() {
    return (new Date).getTime() + "" + Math.random() * 10
};
dn.request_new = function(folder_id, title) {
    var meta = {
        name: title
    };
    if (folder_id !== undefined) meta["parents"] = [folder_id];
    return function() {
        return gapi.client.request({
            path: "/drive/v3/files/",
            method: "POST",
            params: {
                fields: "id,name,mimeType,description,parents,capabilities,fileExtension,shared"
            },
            body: JSON.stringify(meta)
        })
    }
};
dn.request_revision_list = function() {
    return gapi.client.request({
        path: "/drive/v3/files/" + dn.the_file.file_id + "/revisions"
    })
};
dn.request_revision_body = function(revision_id) {
    return function() {
        return gapi.client.request({
            path: "/download/drive/v3/files/" + dn.the_file.file_id + "/revisions/" + revision_id,
            params: {
                alt: "media"
            }
        })
    }
};
dn.request_save = function(parts) {
    var has_body = parts.body !== undefined;
    var meta = {
        properties: {}
    };
    var has_meta = false;
    if (parts.title !== undefined) {
        has_meta = true;
        meta["name"] = parts.title
    }
    if (parts.description !== undefined) {
        has_meta = true;
        meta["description"] = parts.description
    }
    if (parts.syntax !== undefined) {
        has_meta = true;
        meta.properties["aceMode"] = parts.syntax
    }
    if (parts.newline !== undefined) {
        has_meta = true;
        meta.properties["newline"] = parts.newline
    }
    if (parts.tabs !== undefined) {
        has_meta = true;
        meta.properties["tabs"] = parts.tabs
    }
    var is_multipart = has_body && has_meta;
    var params = {
        fields: "version"
    };
    if (has_body) params["uploadType"] = is_multipart ? "multipart" : "media";
    var headers = {};
    if (is_multipart) {
        var boundary = dn.make_multipart_boundary();
        request_body = "--" + boundary + "\nContent-Type: application/json; charset=UTF-8\n\n" + JSON.stringify(meta) + "\n--" + boundary + "\nContent-Type: " + parts.mimeType + "; charset=UTF-8\n\n" + parts.body + "\n--" + boundary + "--";
        headers["Content-Type"] = 'multipart/related; boundary="' + boundary + '"'
    } else if (has_body) {
        request_body = parts.body;
        headers["Content-Type"] = parts.mimeType
    } else {
        request_body = JSON.stringify(meta)
    }
    return function() {
        return gapi.client.request({
            path: (has_body ? "/upload" : "") + "/drive/v3/files/" + dn.the_file.file_id,
            method: "PATCH",
            params: params,
            headers: headers,
            body: request_body
        })
    }
};
dn.request_app_data_document = function() {
    return new Promise(function(succ, fail) {
        dn.app_data_realtime_error = function(err) {
            if (dn.status.realtime_settings < 1) {
                fail(err)
            } else {
                if (err.type === "token_refresh_required") {
                    dn.pr_auth.reject(err)
                } else {
                    console.dir(err);
                    dn.show_error("" + err)
                }
            }
        };
        gapi.drive.realtime.loadAppDataDocument(succ, null, dn.app_data_realtime_error)
    })
};
dn.request_screw_up_auth_counter = 0;
dn.request_screw_up_auth = function() {
    if (++dn.request_screw_up_auth_counter < 10) {
        console.log("INVALIDATING TOKEN");
        gapi.auth.setToken("this_is_no_longer_valid")
    }
    return true
};
"use strict";
dn.clipboard_tool = function(const_) {
    var is_active = false;
    var showing_pane = false;
    var clipboard_index = -1;
    var clipboard_info_timer = 0;
    var document_clipboard_left = function(e) {
        if (!is_active) return false;
        if (clipboard_index <= 0) return true;
        clipboard_index--;
        dn.editor.undo();
        dn.editor.insert(dn.g_clipboard.get(clipboard_index));
        return true
    };
    var document_clipboard_right = function(e) {
        if (!is_active) return false;
        dn.g_atomic_exec(function() {
            if (clipboard_index >= dn.g_clipboard.length - 1) return true;
            clipboard_index++;
            dn.editor.undo();
            dn.editor.insert(dn.g_clipboard.get(clipboard_index))
        });
        return true
    };
    var document_clipboard_keyup = function(e) {
        if (e.which == 17 || e.which == 91 || !e.ctrlKey) {
            document.removeEventListener("keyup", document_clipboard_keyup);
            is_active = false;
            if (showing_pane) {
                showing_pane = false;
                dn.show_pane(dn.g_settings.get("pane"));
                dn.toggle_widget(dn.g_settings.get("pane_open"))
            }
            if (clipboard_info_timer) {
                clearTimeout(clipboard_info_timer);
                clipboard_info_timer = null
            }
        }
    };
    var on_paste = function(e) {
        if (dn.g_clipboard === undefined) return;
        var text = e.text || "";
        is_active = true;
        document.addEventListener("keyup", document_clipboard_keyup);
        clipboard_index = dn.g_clipboard.lastIndexOf(text);
        if (clipboard_index == -1) {
            clipboard_index = dn.g_clipboard.push(text);
            if (dn.g_clipboard.length > const_.clipboard_max_length) {
                clipboard_index--;
                dn.g_clipboard.remove(0)
            }
        }
        if (clipboard_info_timer) clearTimeout(clipboard_info_timer);
        clipboard_info_timer = setTimeout(function() {
            clipboard_info_timer = null;
            showing_pane = true;
            dn.toggle_widget(true);
            dn.show_pane("pane_clipboard")
        }, const_.clipboard_info_delay)
    };
    var on_copy = function(text) {
        if (dn.g_clipboard === undefined) return;
        text = text || "";
        dn.g_atomic_exec(function() {
            var previous_idx = dn.g_clipboard.lastIndexOf(text);
            if (previous_idx === -1) {
                dn.g_clipboard.push(text);
                if (dn.g_clipboard.length > const_.clipboard_max_length) dn.g_clipboard.remove(0)
            } else {
                dn.g_clipboard.move(previous_idx, 0)
            }
        })
    };
    var on_document_ready = function() {
        dn.editor.on("paste", on_paste);
        dn.editor.on("copy", on_copy)
    };
    return {
        on_document_ready: on_document_ready,
        on_left: document_clipboard_left,
        on_right: document_clipboard_right,
        is_active: function() {
            return showing_pane
        }
    }
}(dn.const_);
"use strict";
dn.save_pending_requests = [];
dn.SaveTracker = function() {
    this.local = undefined;
    this.remote = undefined;
    return this
};
dn.save_local_version_counter = 0;
dn.save_server_state = {};
dn.save_local_state = {};
dn.save = function(parts, correction_with_undo_id) {
    if (!dn.status.user_wants_file) {
        dn.create_file();
        parts.title = undefined
    }
    var found_something = false;
    if (parts.body !== undefined) {
        var editor_undo_id = correction_with_undo_id === undefined ? dn.editor.getSession().getUndoManager().getCurrentId() : correction_with_undo_id;
        if (dn.save_undo_id === editor_undo_id) {
            delete parts.body
        } else {
            found_something = true;
            dn.save_undo_id = NaN;
            parts.undo_id = editor_undo_id;
            dn.check_unsaved();
            parts.mimeType = parts.mimeType || dn.the_file.chosen_mime_type;
            dn.status.save_body = 0
        }
    }
    if (parts.title !== undefined) {
        found_something = true;
        dn.status.save_title = 0
    }
    if (parts.syntax !== undefined || parts.description !== undefined || parts.newline !== undefined || parts.tabs !== undefined) {
        found_something = true;
        dn.status.save_other = 0
    }
    if (!found_something) return;
    dn.show_status();
    dn.save_pending_requests.push(new dn.SaveRequest(parts))
};
dn.SaveRequest = function(parts) {
    this._parts = parts;
    var displaced_requests = [];
    for (var k in this._parts)
        if (this._parts.hasOwnProperty(k)) {
            if (dn.save_local_state[k] && !dn.save_local_state[k]._is_settled) displaced_requests.push(dn.save_local_state[k]);
            dn.save_local_state[k] = this
        }
    for (var ii = 0; ii < displaced_requests.length; ii++) {
        var desired = false;
        for (var k in dn.save_local_state)
            if (dn.save_local_state.hasOwnProperty(k))
                if (dn.save_local_state[k] == displaced_requests[ii]) {
                    desired = true;
                    break
                }
        if (!desired) displaced_requests[ii]._desired = false
    }
    this._desired = true;
    this._tracker = new dn.SaveTracker;
    this._tracker.local = ++dn.save_local_version_counter;
    this._is_settled = false;
    this._error = undefined;
    var self = this;
    this._pr = until_success(function(succ, fail) {
        Promise.all([dn.pr_auth, dn.pr_file_loaded]).then(self._throw_if_not_desired.bind(self)).then(dn.request_save(self._parts)).then(self._on_completion.bind(self)).then(succ, fail)
    }).before_retry(dn.filter_api_errors).catch(self._on_error.bind(self)).then(self._on_finally.bind(self));
    return this
};
dn.SaveRequest.prototype._throw_if_not_desired = function() {
    if (!this._desired) throw "not desired";
    return true
};
dn.SaveRequest.prototype._on_error = function(err) {
    if (err !== "not desired") this._error = err
};
dn.SaveRequest.prototype._on_completion = function(res) {
    this._tracker.remote = parseInt(res.result.version);
    for (var k in this._parts)
        if (this._parts.hasOwnProperty(k)) {
            if (dn.save_server_state[k] === undefined) dn.save_server_state[k] = new dn.SaveTracker;
            if (dn.save_server_state[k].remote === undefined || this._tracker.remote > dn.save_server_state[k].remote) {
                dn.save_server_state[k].remote = this._tracker.remote;
                dn.save_server_state[k].local = this._tracker.local
            }
        }
    return true
};
dn.SaveRequest.prototype._on_finally = function() {
    if (this._error !== undefined) {
        dn.show_error("Saving failed. " + dn.api_error_to_string(this._error));
        console.dir(this._error);
        while (dn.save_pending_requests.length) dn.save_pending_requests.pop()._desired = false;
        dn.save_server_state = {};
        dn.save_local_state = {};
        dn.status.save_body = 1;
        dn.status.save_title = 1;
        dn.status.save_other = 1;
        dn.show_status();
        return
    }
    this._is_settled = true;
    dn.save_pending_requests.splice(dn.save_pending_requests.indexOf(this), 1);
    if (dn.save_pending_requests.length > 0) return;
    var correction = {};
    var correction_need = false;
    for (var k in dn.save_local_state)
        if (dn.save_local_state.hasOwnProperty(k))
            if (dn.save_server_state[k].local !== dn.save_local_state[k]._tracker.local) {
                correction[k] = dn.save_local_state[k]._parts[k];
                correction_need = true
            }
    dn.status.save_body = 1;
    dn.status.save_title = 1;
    dn.status.save_other = 1;
    var local_undo_id = dn.save_local_state.body ? dn.save_local_state.body._parts.undo_id : undefined;
    if (correction.body === undefined && local_undo_id !== undefined) {
        dn.save_undo_id = dn.save_local_state.body._parts.undo_id;
        dn.check_unsaved()
    }
    if (correction_need) dn.save(correction, local_undo_id);
    else dn.show_status()
};
"use strict";
dn.do_print = function() {
    var line_to_html = function(n) {
        var printLayer = Object.create(ace.require("ace/layer/text").Text.prototype);
        var tokens = dn.editor.getSession().getTokens(n);
        var html = [];
        var screenColumn = 0;
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            var value = token.value.replace(/\t/g, "   ");
            if (value) printLayer.$renderToken(html, 0, token, value)
        }
        return html.join("").replace(/&#160;/g, " ")
    };
    return function() {
        var content = dn.editor.session.doc.getAllLines();
        var html = Array(content.length);
        for (var i = 0; i < content.length; i++) html[i] = "<li><div class='printline'>" + line_to_html(i) + "</div></li>";
        var printWindow = window.open("", "");
        printWindow.document.writeln("<html><head><title>" + dn.the_file.title + "</title></head><style>" + ace.require("ace/theme/" + dn.g_settings.get("theme")).cssText + "\nbody{font-size:" + dn.g_settings.get("fontSize") * 14 + "px; white-space:pre-wrap;" + "font-family:'Monaco','Menlo','Ubuntu Mono','Droid Sans Mono','Consolas',monospace;}" + "\nli{color:gray;}\n.printline{color:black;}</style>" + "<body class='ace-" + dn.g_settings.get("theme").replace("_", "-") + "'><ol id='content'>" + html.join("") + "</ol></body></html>");
        printWindow.print();
        return false
    }
}();
"use strict";
dn.file_pane = function() {
    var el = {};
    var history_active = false;
    var do_save = function(e) {
        e.preventDefault();
        if (dn.the_file.is_read_only) return dn.show_error("Cannot save read-only file.");
        dn.save({
            body: dn.editor.getSession().getValue()
        })
    };
    var read_only_bail = function(e) {
        dn.show_error("The file is read-only, so you cannot change its properties.");
        e.preventDefault()
    };
    var on_title_begin_edit = function(e) {
        if (dn.the_file.is_read_only) return read_only_bail(e);
        el.title_text.style.display = "none";
        el.title_input.style.display = "";
        el.title_input.focus();
        el.title_input.select()
    };
    var on_title_keydown = function(e) {
        if (e.which == WHICH.ESC) {
            el.title_input.value = dn.the_file.title;
            e.stopPropagation();
            dn.focus_editor()
        } else if (e.which === WHICH.ENTER) {
            e.preventDefault();
            dn.focus_editor()
        }
    };
    var on_description_begin_edit = function(e) {
        if (dn.the_file.is_read_only) return read_only_bail(e);
        el.description_text.style.display = "none";
        el.description_input.style.display = "";
        el.description_input.focus();
        el.description_input.select()
    };
    var on_description_keydown = function(e) {
        if (e.which == WHICH.ESC) {
            el.description_input.value = dn.the_file.description;
            e.stopPropagation();
            dn.focus_editor()
        } else if (e.which === WHICH.ENTER && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            dn.focus_editor()
        }
    };
    var do_share = function() {
        Promise.resolve(dn.pr_file_loaded).then(function() {
            dn.status.file_sharing = -1;
            dn.the_file.is_shared = 0;
            dn.show_status();
            if (el.share_dialog) {
                do_share_sub()
            } else {
                gapi.load("drive-share", function() {
                    el.share_dialog = new gapi.drive.share.ShareClient(dn.client_id);
                    do_share_sub()
                })
            }
        })
    };
    var do_share_sub = function() {
        el.share_dialog.setItemIds([dn.the_file.file_id]);
        el.share_dialog.setOAuthToken(gapi.auth.getToken().access_token);
        el.share_dialog.showSettingsDialog()
    };
    var do_print = dn.do_print;
    var on_description_end_edit = function() {
        el.description_input.style.display = "none";
        el.description_text.style.display = "";
        var new_val = el.description_input.value;
        if (dn.the_file.description !== new_val) {
            dn.the_file.set({
                description: new_val
            });
            dn.save({
                description: new_val
            })
        }
        dn.focus_editor()
    };
    var on_title_end_edit = function() {
        el.title_input.style.display = "none";
        el.title_text.style.display = "";
        var new_val = el.title_input.value;
        if (dn.the_file.title !== new_val) {
            dn.the_file.set({
                title: new_val
            });
            dn.save({
                title: new_val
            })
        }
        dn.focus_editor()
    };
    var on_newline_click = function(e) {
        if (dn.the_file.is_read_only) return read_only_bail(e);
        var val = "detect";
        if (e.currentTarget === el.newline_unix) val = "unix";
        else if (e.currentTarget === el.newline_windows) val = "windows";
        dn.the_file.set({
            newline: val
        });
        dn.save({
            newline: val
        })
    };
    var on_syntax_detect_click = function(e) {
        if (dn.the_file.is_read_only) return read_only_bail(e);
        dn.the_file.set({
            syntax: "detect"
        });
        dn.save({
            syntax: "detect"
        })
    };
    var on_syntax_dropdown_click = function(e) {
        if (dn.the_file.is_read_only) return read_only_bail(e);
        var val = syntax_drop_down.GetVal();
        dn.save({
            syntax: val
        });
        dn.the_file.set({
            syntax: val
        })
    };
    var on_tab_click = function(e) {
        if (dn.the_file.is_read_only) return read_only_bail(e);
        var val = {
            val: "detect"
        };
        if (e.currentTarget === el.tab_soft_inc) {
            e.stopPropagation();
            val = {
                val: "spaces",
                n: Math.min(dn.the_file.properties_chosen.tabs.n + 1, dn.const_.max_soft_tab_n)
            }
        } else if (e.currentTarget === el.tab_soft_dec) {
            e.stopPropagation();
            var n = dn.the_file.properties_chosen.tabs.n - 1;
            val = {
                val: "spaces",
                n: Math.max(dn.the_file.properties_chosen.tabs.n - 1, dn.const_.min_soft_tab_n)
            }
        } else if (e.currentTarget === el.tab_soft) {
            val = {
                val: "spaces",
                n: dn.the_file.properties_chosen.tabs.n
            }
        } else if (e.currentTarget === el.tab_hard) {
            val = {
                val: "tab",
                n: dn.the_file.properties_chosen.tabs.n
            }
        }
        dn.the_file.set({
            tabs: val
        });
        dn.save({
            tabs: JSON.stringify(val)
        })
    };
    var render_title = function() {
        el.title_text_inner.textContent = dn.the_file.title;
        el.title_input.value = dn.the_file.title
    };
    var render_description = function() {
        text_multi(el.description_text_inner, dn.the_file.description, true);
        el.description_input.value = dn.the_file.description
    };
    var render_newline = function() {
        el.newline_detect.classList.remove("selected");
        el.newline_windows.classList.remove("selected");
        el.newline_unix.classList.remove("selected");
        var val = dn.the_file.properties.newline;
        if (val === "detect") el.newline_detect.classList.add("selected");
        else if (val === "windows") el.newline_windows.classList.add("selected");
        else el.newline_unix.classList.add("selected");
        el.newline_info.textContent = dn.the_file.properties_detected_info.newline
    };
    var render_syntax = function() {
        syntax_drop_down.SetInd(syntax_drop_down.IndexOf(dn.the_file.properties_chosen.syntax), true);
        if (dn.the_file.properties.syntax === "detect") {
            el.ace_mode_detect.classList.add("selected");
            syntax_drop_down.SetSelected(false)
        } else {
            el.ace_mode_detect.classList.remove("selected");
            syntax_drop_down.SetSelected(true)
        }
        el.ace_mode_info.textContent = dn.the_file.properties_detected_info.syntax
    };
    var render_tabs = function() {
        var user_tabs = dn.the_file.properties.tabs;
        el.tab_soft.classList.remove("selected");
        el.tab_hard.classList.remove("selected");
        el.tab_detect.classList.remove("selected");
        if (user_tabs.val === "tab") el.tab_hard.classList.add("selected");
        else if (user_tabs.val === "spaces") el.tab_soft.classList.add("selected");
        else el.tab_detect.classList.add("selected");
        el.tab_soft_text.textContent = dn.the_file.properties_chosen.tabs.n;
        el.tab_info.textContent = dn.the_file.properties_detected_info.tabs
    };
    var end_history = function() {
        if (!history_active) return;
        dn.history_tool.end();
        el.button_history.classList.remove("selected");
        el.button_save.style.display = "";
        el.button_print.style.display = "";
        el.inner_pane_history.style.display = "none";
        el.inner_pane_main.style.display = "";
        history_active = false
    };
    var do_history = function() {
        Promise.resolve(dn.pr_file_loaded).then(function() {
            el.button_history.classList.add("selected");
            el.button_save.style.display = "none";
            el.button_print.style.display = "none";
            el.inner_pane_history.style.display = "";
            el.inner_pane_main.style.display = "none";
            dn.history_tool.start();
            history_active = true
        })
    };
    var syntax_drop_down;
    var register_controllers = function() {
        el.title_text.addEventListener("click", on_title_begin_edit);
        el.title_input.addEventListener("blur", on_title_end_edit);
        el.title_input.addEventListener("keydown", on_title_keydown);
        el.description_text.addEventListener("click", on_description_begin_edit);
        el.description_input.addEventListener("blur", on_description_end_edit);
        el.description_input.addEventListener("keydown", on_description_keydown);
        el.newline_detect.addEventListener("click", on_newline_click);
        el.newline_windows.addEventListener("click", on_newline_click);
        el.newline_unix.addEventListener("click", on_newline_click);
        el.tab_detect.addEventListener("click", on_tab_click);
        el.tab_hard.addEventListener("click", on_tab_click);
        el.tab_soft_inc.addEventListener("click", on_tab_click);
        el.tab_soft_dec.addEventListener("click", on_tab_click);
        el.tab_soft.addEventListener("click", on_tab_click);
        el.ace_mode_detect.addEventListener("click", on_syntax_detect_click);
        syntax_drop_down.enabled = true;
        syntax_drop_down.addEventListener("click", on_syntax_dropdown_click);
        syntax_drop_down.addEventListener("change", on_syntax_dropdown_click);
        el.button_save.addEventListener("click", do_save);
        el.button_print.addEventListener("click", do_print);
        el.button_share.addEventListener("click", do_share);
        el.button_history.addEventListener("click", function() {
            if (history_active) end_history();
            else do_history()
        })
    };
    var on_document_ready = function() {
        el.title_input = document.getElementById("details_file_title_input");
        el.title_text = document.getElementById("details_file_title_text");
        el.title_text_inner = document.getElementById("details_file_title_text_inner");
        el.description_input = document.getElementById("details_file_description_input");
        el.description_text = document.getElementById("details_file_description_text");
        el.description_text_inner = document.getElementById("details_file_description_text_inner");
        el.ace_mode_choose = document.getElementById("file_ace_mode_choose");
        el.ace_mode_detect = document.getElementById("file_ace_mode_detect");
        el.ace_mode_info = document.getElementById("file_ace_mode_info");
        el.newline_detect = document.getElementById("file_newline_detect");
        el.newline_windows = document.getElementById("file_newline_windows");
        el.newline_unix = document.getElementById("file_newline_unix");
        el.newline_info = document.getElementById("file_newline_info");
        el.tab_detect = document.getElementById("file_tab_detect");
        el.tab_soft_inc = document.getElementById("file_tab_soft_inc");
        el.tab_soft_dec = document.getElementById("file_tab_soft_dec");
        el.tab_hard = document.getElementById("file_tab_hard");
        el.tab_soft = document.getElementById("file_tab_soft");
        el.tab_soft_text = document.getElementById("file_tab_soft_text");
        el.tab_info = document.getElementById("file_tab_info");
        el.button_save = document.getElementById("button_save");
        el.button_print = document.getElementById("button_print");
        el.button_share = document.getElementById("button_share");
        el.button_history = document.getElementById("button_history");
        el.inner_pane_main = document.getElementById("pane_file_main");
        el.inner_pane_history = document.getElementById("pane_file_history");
        var modes = require("ace/ext/modelist").modes;
        syntax_drop_down = new DropDown(modes.map(function(m) {
            return m.caption
        }));
        syntax_drop_down.enabled = false;
        el.ace_mode_choose.appendChild(syntax_drop_down.el);
        dn.history_tool.on_document_ready();
        dn.the_file.addEventListener("change", function(e) {
            switch (e.property) {
                case "syntax":
                    render_syntax();
                    break;
                case "newline":
                    render_newline();
                    break;
                case "tabs":
                    render_tabs();
                    break;
                case "title":
                    render_title();
                    break;
                case "description":
                    render_description();
                    break;
                case "is_loaded":
                    register_controllers();
                    break
            }
        })
    };
    return {
        on_save_shorcut: do_save,
        on_print_shortcut: do_print,
        on_document_ready: on_document_ready,
        on_close_pane: end_history,
        do_history: function(e) {
            e.preventDefault();
            dn.g_settings.set("pane", "pane_file");
            dn.g_settings.set("pane_open", true);
            do_history()
        }
    }
}();
dn.patch_editor_history = function(editor) {
    var Range = ace.require("./range").Range;
    var dom = ace.require("./lib/dom");
    var show_row = [];
    var row_line_number = [0];
    var markers = [];
    var first_rendered_row = -1;
    var rendered_row_transitions = [];
    var colors_background = [16777215, 16777215, 12381160, 16763594];
    var transition_duration = 1e3;
    editor.$blockScrolling = Infinity;
    editor.setHighlightActiveLine(false);
    editor.setHighlightGutterLine(false);
    Range.prototype.toScreenRange = function(session) {
        var screenPosStart = session.documentToScreenPosition(this.start);
        var screenPosEnd = session.documentToScreenPosition(this.end);
        ret = new Range(screenPosStart.row, screenPosStart.column, screenPosEnd.row, screenPosEnd.column);
        ret.doc_range = this.clone();
        return ret
    };
    editor.session.gutterRenderer = {
        getWidth: function(session, lastLineNumber, config) {
            return ("" + row_line_number[row_line_number.length - 1]).length * config.characterWidth
        },
        getText: function(session, row) {
            if (row >= row_line_number.length) return "" + row;
            return row_line_number[row] === -1 ? "-" : row_line_number[row]
        }
    };
    editor.session.removeAllGutterDecorations = function() {
        for (var ii = 0; ii < this.$decorations.length; ii++) this.$decorations[ii] = "";
        this._signal("changeBreakpoint", {})
    };
    editor.renderer.$markerBack.drawFullLineMarker = function(stringBuilder, range, clazz, config, extraStyle) {
        var top = this.$getTop(range.start.row, config);
        var height = config.lineHeight;
        if (range.start.row != range.end.row) height += this.$getTop(range.end.row, config) - top;
        stringBuilder.push("<div class='", clazz, "' data-row='", range.doc_range.start.row, "' style='", "height:", height, "px;", "top:", top, "px;", "left:0;right:0;", extraStyle || "", "'></div>")
    };
    var insertFullLines_original = editor.session.doc.insertFullLines;
    editor.session.doc.insertFullLines = function(arg_0, arg_1) {
        if (arg_0 === -1) {
            show_row = new Uint8Array(arg_1.length);
            for (var ii = 0; ii < arg_1.length; ii++) show_row[ii] = 1;
            var len = this.getLength() - 1;
            this.remove(new Range(0, 0, len, this.getLine(len).length));
            this.insertMergedLines({
                row: 0,
                column: 0
            }, arg_1)
        } else {
            show_row = Array.prototype.slice.call(show_row, 0);
            if (arg_0.length !== undefined) {
                if (arg_1 !== undefined) throw "batched insert takes one array";
                for (var kk = 0; kk < arg_0.length; kk++) {
                    var splice_args = [arg_0[kk].at, 0];
                    for (var ii = 0; ii < arg_0[kk].lines.length; ii++) splice_args.push(0);
                    Array.prototype.splice.apply(show_row, splice_args);
                    insertFullLines_original.call(this, arg_0[kk].at, arg_0[kk].lines)
                }
            } else {
                var splice_args = [arg_0, 0];
                for (var ii = 0; ii < arg_1.length; ii++) splice_args.push(0);
                Array.prototype.splice.apply(show_row, splice_args);
                insertFullLines_original.call(this, arg_0, arg_1)
            }
            show_row = new Uint8Array(show_row)
        }
        editor.show_rows(show_row)
    };
    editor.renderer.addEventListener("afterRender", function() {
        var first_row = editor.renderer.getFirstVisibleRow();
        var last_row = editor.renderer.getLastVisibleRow();
        var first_row_old = first_rendered_row;
        var last_row_old = first_row_old + rendered_row_transitions.length;
        var time_now = Date.now();
        if (first_row_old < first_row) {
            for (var row = first_row_old; row < last_row_old && row < first_row; row++) rendered_row_transitions.shift()
        } else if (first_row_old > first_row) {
            for (var row = Math.min(last_row, first_row_old) - 1; row >= first_row; row--) {
                rendered_row_transitions.unshift({
                    row: row,
                    from_time: undefined,
                    from_color: undefined,
                    to_time: time_now,
                    to_color: colors_background[show_row[row]]
                })
            }
        }
        var all_marker_els = editor.renderer.$markerBack.element.children;
        var marker_els = [];
        for (var ii = 0; ii < all_marker_els.length; ii++)
            if (all_marker_els[ii].dataset.row !== undefined) marker_els[all_marker_els[ii].dataset.row] = all_marker_els[ii];
        var els_to_set = [];
        var colors_to_set = [];
        var colors_current = [];
        for (var row = Math.max(first_row, first_row_old); row < Math.min(last_row, last_row_old); row++) {
            if (show_row[row] === 0) continue;
            var el = marker_els[row];
            var transition = rendered_row_transitions[row - first_row];
            var to_color_new = colors_background[show_row[row]];
            var current_color;
            if (transition.to_time > time_now) {
                var elapsed_frac = (time_now - transition.from_time) / (transition.to_time - transition.from_time);
                current_color = mix_color(transition.from_color, transition.to_color, elapsed_frac)
            } else {
                current_color = transition.to_color
            }
            if (transition.to_color !== to_color_new) {
                transition.from_color = current_color;
                transition.from_time = time_now;
                transition.to_time = time_now + transition_duration;
                transition.to_color = to_color_new
            }
            el.style.backgroundColor = color_to_string(current_color);
            if (transition.to_time > time_now) {
                el.style.transitionProperty = "";
                el.style.transitionDuration = transition.to_time - time_now + "ms";
                els_to_set.push(el);
                colors_to_set.push(to_color_new);
                colors_current.push(current_color)
            }
        }
        if (els_to_set.length) window.getComputedStyle(els_to_set[0]).backgroundColor;
        while (els_to_set.length) {
            var el = els_to_set.pop();
            el.style.transitionProperty = "background-color";
            el.style.backgroundColor = color_to_string(colors_to_set.pop())
        }
        if (last_row_old > last_row) {
            for (row = last_row_old - 1; row >= last_row && row >= first_row_old; row--) rendered_row_transitions.pop()
        } else if (last_row_old < last_row) {
            for (row = Math.max(last_row_old, first_row); row < last_row; row++) rendered_row_transitions.push({
                row: row,
                from_time: undefined,
                from_color: undefined,
                to_time: time_now,
                to_color: colors_background[show_row[row]]
            })
        }
        first_rendered_row = first_row
    });
    var mix_color = function(a, b, frac) {
        return ((a & 16711680) >> 16) * (1 - frac) + ((b & 16711680) >> 16) * frac << 16 | ((a & 65280) >> 8) * (1 - frac) + ((b & 65280) >> 8) * frac << 8 | (a & 255) * (1 - frac) + (b & 255) * frac
    };
    var color_to_string = function(color) {
        return "rgb(" + ((color & 16711680) >> 16) + ", " + ((color & 65280) >> 8) + ", " + (color & 255) + ")"
    };
    editor.show_rows = function(show_row_) {
        show_row = new Uint8Array(show_row_);
        var n = editor.session.doc.getLength();
        if (show_row.length !== n) throw "bad mask length";
        editor.session.unfold();
        while (markers.length) editor.session.removeMarker(markers.pop());
        editor.session.removeAllGutterDecorations();
        var line_no = 0;
        var fold_start = -1;
        row_line_number = [];
        var first_used_row = -1;
        for (var ii = 0; ii < n; ii++) {
            if (show_row[ii]) {
                row_line_number.push(show_row[ii] === 3 ? -1 : ++line_no);
                if (fold_start !== -1) {
                    if (fold_start > 0) {
                        editor.session.addFold("", new Range(fold_start - 1, Infinity, ii - 1, Infinity))
                    } else {
                        editor.session.addFold("", new Range(0, 0, ii, 0));
                        row_line_number[0] = 1;
                        first_used_row = ii
                    }
                }
                fold_start = -1
            } else {
                row_line_number.push(line_no);
                if (fold_start === -1) fold_start = ii
            }
        }
        if (fold_start !== -1) editor.session.addFold("", new Range(fold_start - 1, Infinity, ii - 1, Infinity));
        var previous = -1;
        if (first_used_row !== -1) {
            if (show_row[first_used_row] >= 1) editor.session.addGutterDecoration(0, "gutter_special_" + show_row[first_used_row])
        }
        for (var ii = 0; ii < n; ii++) {
            if (show_row[ii] >= 1) {
                markers.push(editor.session.addMarker(new Range(ii, 0, ii, Infinity), "special_" + show_row[ii] + (previous !== show_row[ii] ? "_first" : ""), "fullLine", false));
                editor.session.addGutterDecoration(ii, "gutter_special_" + show_row[ii])
            }
            previous = show_row[ii] ? show_row[ii] : previous
        }
        editor.renderer.updateFull()
    };
    editor.$resetCursorStyle = function() {
        var style = this.$cursorStyle || "ace";
        var cursorLayer = this.renderer.$cursorLayer;
        if (!cursorLayer) return;
        cursorLayer.setSmoothBlinking(/smooth/.test(style));
        cursorLayer.isBlinking = style != "wide";
        dom.setCssClass(cursorLayer.element, "ace_slim-cursors", /slim/.test(style))
    };
    editor.$mouseHandler.setOptions({
        dragEnabled: false
    })
};
"use strict";
dn.history_tool = function() {
    var el = {};
    var revision_meta = [];
    var worker_has_revision = {};
    var revision_uses_line = [];
    var worker;
    var editor;
    var at_idx = 0;
    var from_idx = 0;
    var LineWidgets = ace.require("./line_widgets").LineWidgets;
    var start = function() {
        if (worker === undefined) {
            worker = new Worker("js/history_tool_worker.js");
            worker.onmessage = on_worker_message
        }
        dn.el.editor.style.display = "none";
        el.revisions_view.style.display = "";
        el.revisions_view.innerHTML = "";
        el.info_overflow.style.display = "";
        editor = ace.edit("revisions_view");
        editor.setFontSize(dn.editor.getFontSize());
        dn.patch_editor_history(editor);
        editor.session.setUseWrapMode(true);
        editor.setReadOnly(true);
        refresh_revisions_list()
    };
    var end = function() {
        editor.destroy();
        editor = undefined;
        el.revisions_view.innerHTML = "";
        var el_old = el.revisions_view;
        el.revisions_view = el_old.cloneNode(true);
        el_old.parentNode.replaceChild(el.revisions_view, el_old);
        dn.el.editor.style.display = "";
        el.revisions_view.style.display = "none";
        el.info_overflow.style.display = "none"
    };
    var get_editor = function() {
        return editor
    };
    var on_worker_message = function(e) {
        if (!editor) return;
        var session = editor.getSession();
        if (e.data.diffed_revision) {
            revision_uses_line = [];
            if (e.data.diffed_revision.idx === 0) {
                session.doc.insertFullLines(-1, e.data.diffed_revision.lines)
            } else {
                session.doc.insertFullLines(e.data.diffed_revision.sections);
                revision_meta[e.data.diffed_revision.idx].el_tick.classList.add("diffed")
            }
        }
        if (e.data.line_is_used) {
            var idx = e.data.line_is_used.idx;
            revision_uses_line[idx] = new Uint8Array(e.data.line_is_used.buffer);
            if (idx === Math.max(at_idx, from_idx)) {
                if (at_idx === from_idx) render_single_revision(at_idx);
                else render_revision_pair(at_idx, from_idx)
            } else if (Math.max(at_idx, from_idx) >= e.data.line_is_used.diffed_n && idx == Math.min(at_idx, from_idx)) {
                render_single_revision(Math.min(at_idx, from_idx))
            }
        }
    };
    var render_single_revision = function(idx) {
        editor.show_rows(revision_uses_line[idx]);
        var str = "";
        if (idx === 0) {
            str = "Showing the file:\n	" + current_version_date_str
        } else {
            var time = date_str_to_local(revision_meta[idx].modifiedTime);
            str = "Showing file as it was at:\n	" + time[1] + " on " + time[0]
        }
        text_multi(el.info, str)
    };
    var fuse = function(at_is_used, from_is_used) {
        var map = new Uint8Array([0, 2, 3, 1]);
        var show_rows = new Uint8Array(at_is_used.length);
        for (var ii = 0; ii < show_rows.length; ii++) show_rows[ii] = map[at_is_used[ii] | from_is_used[ii] << 1];
        return show_rows
    };
    var current_version_date_str = "as it exists in the editor";
    var render_revision_pair = function(at_idx, from_idx) {
        editor.show_rows(fuse(revision_uses_line[at_idx], revision_uses_line[from_idx]));
        var str = "";
        if (at_idx === 0) {
            str += "Showing the file:\n	" + current_version_date_str
        } else {
            var time_at = date_str_to_local(revision_meta[at_idx].modifiedTime);
            str += "Showing file as it was at:\n	" + time_at[1] + " on " + time_at[0]
        }
        if (from_idx === 0) {
            str += "\nWith changes relative to the file:\n	" + current_version_date_str
        } else {
            var time_from = date_str_to_local(revision_meta[from_idx].modifiedTime);
            str += "\nWith changes relative to the file at:\n	" + time_from[1] + " on " + time_from[0]
        }
        text_multi(el.info, str)
    };
    var append_tick = function() {
        var el_tick = document.createElement("div");
        el_tick.classList.add("revision_tick");
        el.tick_box.appendChild(el_tick);
        return el_tick
    };
    var send_revisions_order_to_worker = function(resp) {
        var r_to_get = [],
            id_order = [];
        revision_meta = revision_meta.concat(resp.result.revisions.reverse());
        el.at_range.max = revision_meta.length - 1;
        el.from_range.max = revision_meta.length - 1;
        for (var ii = 1; ii < revision_meta.length; ii++) {
            id_order.push(revision_meta[ii].id);
            revision_meta[ii].el_tick = append_tick();
            if (!worker_has_revision.hasOwnProperty(revision_meta[ii].id)) {
                r_to_get.push(revision_meta[ii])
            } else {
                revision_meta[ii].el_tick.classList.add("downloaded")
            }
        }
        worker.postMessage({
            use_order: id_order
        });
        revision_meta[0].el_tick.classList.add("diffed");
        render_download_status();
        render_for_settings();
        return r_to_get
    };
    var send_revision_body_to_worker = function(revision_meta) {
        return function(resp) {
            if (resp.status !== 200) throw resp;
            worker.postMessage({
                revision: {
                    id: revision_meta.id,
                    body: decode_body(resp.body)
                }
            });
            worker_has_revision[revision_meta.id] = true;
            revision_meta.el_tick.classList.add("downloaded");
            render_download_status();
            return true
        }
    };
    var render_download_status = function() {
        var n_pending = 0;
        for (var ii = 0; ii < revision_meta.length; ii++)
            if (!worker_has_revision.hasOwnProperty(revision_meta[ii].id)) n_pending++;
        if (n_pending) {
            el.info.textContent = "Downloaded " + (revision_meta.length - n_pending) + " of " + revision_meta.length + "..."
        } else {
            el.info.textContent = "Downloaded all revisions."
        }
    };
    var refresh_revisions_list = function() {
        el.info.textContent = "Updating revision list...";
        el.tick_box.innerHTML = "";
        el.at_range.max = 1;
        el.from_range.max = 1;
        el.at_range.value = 0;
        el.from_range.value = 0;
        at_idx = 0;
        from_idx = 0;
        revision_meta = [{
            id: "current",
            el_tick: append_tick()
        }];
        revision_uses_line = [];
        worker.postMessage({
            reset_with_current_body: dn.editor.getSession().getValue()
        });
        worker_has_revision["current"] = true;
        revision_meta[0].el_tick.classList.add("downloaded");
        render_for_settings();
        until_success(function(succ, fail) {
            Promise.all([dn.pr_auth, dn.pr_file_loaded]).then(dn.request_revision_list).then(send_revisions_order_to_worker).then(succ, fail)
        }).before_retry(dn.filter_api_errors).catch(function(err) {
            console.log("failed to update revisions list");
            dn.show_error(dn.api_error_to_string(err));
            throw err
        }).then(function(r_to_get) {
            var body_promises = [];
            for (var ii = 0; ii < r_to_get.length; ii++) {
                body_promises.push(until_success(function(ii, succ, fail) {
                    Promise.resolve(dn.pr_auth).then(dn.request_revision_body(r_to_get[ii].id)).then(send_revision_body_to_worker(r_to_get[ii])).then(succ, fail)
                }.bind(null, ii)).before_retry(dn.filter_api_errors).catch(function(err) {
                    console.log("failed to download revision body");
                    dn.show_error(dn.api_error_to_string(err));
                    throw err
                }))
            }
            return Promise.all(body_promises).then(function(res) {
                console.log("got all bodies!!")
            }).catch(function(err) {
                console.log("failed to get all bodies")
            })
        })
    };
    var date_str_to_local = function(d) {
        d = new Date(Date.parse(d));
        return [d.toLocaleDateString({}, {
            month: "short",
            day: "numeric",
            year: "numeric"
        }), d.toLocaleTimeString({}, {
            hour: "numeric",
            minute: "numeric"
        })]
    };
    var render_for_settings = function() {
        if (!dn.pr_file_loaded.is_resolved() || !editor) return;
        at_idx = parseInt(el.at_range.value);
        from_idx = parseInt(el.from_range.value);
        var at_meta = revision_meta[at_idx];
        var from_meta = revision_meta[from_idx];
        if (at_idx === 0) {
            text_multi(el.caption_at, "Current\ndocument")
        } else {
            var at_time = date_str_to_local(at_meta.modifiedTime);
            text_multi(el.caption_at, at_time.join("\n"))
        }
        if (from_idx === 0) {
            text_multi(el.caption_from, "Current\ndocument")
        } else {
            var from_time = date_str_to_local(from_meta.modifiedTime);
            text_multi(el.caption_from, from_time.join("\n"))
        }
        var have_at = revision_uses_line[at_idx] !== undefined;
        var have_from = revision_uses_line[from_idx] !== undefined;
        if (have_at && have_from) {
            if (at_idx === from_idx) render_single_revision(at_idx);
            else render_revision_pair(at_idx, from_idx)
        } else if (!have_at && have_from) {
            render_single_revision(from_idx);
            worker.postMessage({
                uses_line: [at_idx]
            })
        } else if (have_at && !have_from) {
            render_single_revision(at_idx);
            worker.postMessage({
                uses_line: [from_idx]
            })
        } else {
            worker.postMessage({
                uses_line: [from_idx, at_idx]
            })
        }
    };
    var render_removed_state = function(state) {
        if (state) {
            el.remove_expand.classList.add("selected");
            el.remove_collapse.classList.remove("selected")
        } else {
            el.remove_expand.classList.remove("selected");
            el.remove_collapse.classList.add("selected")
        }
        render_for_settings()
    };
    var on_document_ready = function() {
        el.remove_expand = document.getElementById("revisions_remove_expand");
        el.remove_collapse = document.getElementById("revisions_remove_collapse");
        el.info = document.getElementById("revision_info");
        el.info_overflow = document.getElementById("file_info_overflow");
        el.tick_box = document.getElementById("revision_tick_box");
        el.at_range = document.getElementById("revision_at_range");
        el.from_range = document.getElementById("revision_from_range");
        el.caption_at = document.getElementById("revision_caption_at");
        el.caption_from = document.getElementById("revision_caption_from");
        el.revisions_view = document.getElementById("revisions_view");
        el.ordered_list = document.getElementById("revisions_ordered_list");
        dn.g_settings.addEventListener("VALUE_CHANGED", function(e) {
            if (e.property === "historyRemovedIsExpanded") render_removed_state(e.newValue)
        });
        el.remove_expand.addEventListener("click", function() {
            dn.g_settings.set("historyRemovedIsExpanded", true)
        });
        el.remove_collapse.addEventListener("click", function() {
            dn.g_settings.set("historyRemovedIsExpanded", false)
        });
        el.at_range.addEventListener("input", render_for_settings);
        el.from_range.addEventListener("input", render_for_settings)
    };
    return {
        start: start,
        end: end,
        on_document_ready: on_document_ready,
        get_editor: get_editor,
        debug: function() {
            m = new Uint8Array(editor.session.doc.getLength());
            for (var i = 0; i < m.length; i++) m[i] = Math.random() * 4;
            editor.show_rows(m);
            console.dir(m)
        }
    }
}();
"use strict";
dn.find_pane = function(const_) {
    var el = {};
    var goto_input_has_focus = false;
    var AceSearch;
    var AceRange;
    var search_inputs_have_focus = false;
    var search_results = [];
    var search_current_match_idx = -1;
    var search_markers = [];
    var search_marker_current = undefined;
    var search_str = "";
    var search_history_idx = -1;
    var search_history_left_behind_str = "";
    var search_history_last_modified_time = -1;
    var focus_on_input = function() {
        if (dn.g_settings.get("find_goto")) el.goto_input.focus();
        else el.find_input.focus()
    };
    var on_document_ready = function() {
        AceSearch = ace.require("./search").Search;
        AceRange = ace.require("./range").Range;
        el.button_case_sensitive = document.getElementById("button_find_case_sensitive");
        el.button_whole_words = document.getElementById("button_find_whole_words");
        el.button_regex = document.getElementById("button_find_regex");
        el.find_input = document.getElementById("find_input");
        el.goto_input = document.getElementById("goto_input");
        el.replace_input = document.getElementById("find_replace_input");
        el.info = document.getElementById("find_info");
        el.search_results = document.getElementById("find_results");
        el.info_overflow = document.getElementById("find_info_overflow");
        el.button_goto = document.getElementById("button_goto");
        el.button_replace = document.getElementById("button_replace");
        el.goto_wrapper = document.getElementById("find_goto_wrapper");
        el.find_wrapper = document.getElementById("find_find_wrapper");
        el.replace_wrapper = document.getElementById("find_replace_wrapper");
        el.button_find_replace_all = document.getElementById("button_find_replace_all");
        dn.g_settings.addEventListener("VALUE_CHANGED", function(e) {
            var new_value = e.newValue;
            switch (e.property) {
                case "find_regex":
                    if (new_value) el.button_regex.classList.add("selected");
                    else el.button_regex.classList.remove("selected");
                    settings_changed();
                    break;
                case "find_whole_words":
                    if (new_value) el.button_whole_words.classList.add("selected");
                    else el.button_whole_words.classList.remove("selected");
                    settings_changed();
                    break;
                case "find_case_sensitive":
                    if (new_value) el.button_case_sensitive.classList.add("selected");
                    else el.button_case_sensitive.classList.remove("selected");
                    settings_changed();
                    break;
                case "find_replace":
                    on_replace_toggled(new_value);
                    break;
                case "find_goto":
                    on_goto_toggled(new_value);
                    break
            }
        });
        el.button_case_sensitive.addEventListener("click", function() {
            dn.g_settings.set("find_case_sensitive", !dn.g_settings.get("find_case_sensitive"))
        });
        el.button_whole_words.addEventListener("click", function() {
            dn.g_settings.set("find_whole_words", !dn.g_settings.get("find_whole_words"))
        });
        el.button_regex.addEventListener("click", function() {
            dn.g_settings.set("find_regex", !dn.g_settings.get("find_regex"))
        });
        el.goto_input.addEventListener("keydown", goto_input_keydown);
        el.goto_input.addEventListener("keyup", goto_input_keyup);
        el.goto_input.addEventListener("blur", goto_input_blur);
        el.goto_input.addEventListener("focus", goto_input_focus);
        el.find_input.addEventListener("keyup", find_input_keyup);
        el.find_input.addEventListener("keydown", find_input_keydown);
        el.find_input.addEventListener("blur", search_inputs_blur);
        el.find_input.addEventListener("focus", search_inputs_focus);
        el.replace_input.addEventListener("blur", search_inputs_blur);
        el.replace_input.addEventListener("focus", search_inputs_focus);
        el.replace_input.addEventListener("keydown", replace_input_keydown);
        el.button_find_replace_all.addEventListener("click", replace_all);
        el.button_replace.addEventListener("click", function() {
            dn.g_settings.set("find_replace", !dn.g_settings.get("find_replace"));
            dn.g_settings.set("find_goto", false);
            el.find_input.focus()
        });
        el.button_goto.addEventListener("click", function() {
            dn.g_settings.set("find_goto", !dn.g_settings.get("find_goto"));
            if (dn.g_settings.get("find_goto")) el.goto_input.focus();
            else el.find_input.focus()
        })
    };
    var find_shortcut_used = function(e) {
        var sel = dn.editor.session.getTextRange(dn.editor.getSelectionRange());
        dn.g_settings.set("find_goto", false);
        dn.g_settings.set("pane", "pane_find");
        dn.g_settings.set("pane_open", true);
        if (sel) {
            if (sel !== search_str) {
                search_str = sel;
                search_history_idx = -1;
                update_search_history()
            }
            el.find_input.value = sel;
            el.find_input.select()
        }
        el.find_input.focus();
        e.preventDefault()
    };
    var goto_shortcut_used = function(e) {
        dn.g_settings.set("find_goto", true);
        dn.g_settings.set("pane", "pane_find");
        dn.g_settings.set("pane_open", true);
        el.goto_input.focus();
        e.preventDefault()
    };
    var replace_shortcut_used = function(e) {
        dn.g_settings.set("find_replace", true);
        find_shortcut_used(e)
    };
    var on_goto_toggled = function(new_value) {
        if (new_value) {
            el.goto_wrapper.style.display = "";
            el.find_wrapper.style.display = "none";
            el.button_goto.classList.add("selected");
            el.info.textContent = "goto line inactive";
            el.replace_wrapper.style.display = "none"
        } else {
            el.goto_wrapper.style.display = "none";
            el.find_wrapper.style.display = "";
            el.button_goto.classList.remove("selected");
            el.info.textContent = "search inactive";
            if (dn.g_settings.get("find_replace")) el.replace_wrapper.style.display = ""
        }
    };
    var on_replace_toggled = function(new_value) {
        if (new_value) {
            el.button_replace.classList.add("selected");
            if (!dn.g_settings.get("find_goto")) el.replace_wrapper.style.display = ""
        } else {
            el.replace_wrapper.style.display = "none";
            el.button_replace.classList.remove("selected")
        }
        if (search_inputs_have_focus) select_search_result_idx(search_current_match_idx)
    };
    var goto_input_focus = function() {
        goto_input_has_focus = true;
        el.info.textContent = "type to goto line";
        perform_goto()
    };
    var goto_input_blur = function(e) {
        goto_input_has_focus = false;
        el.info.textContent = "goto line inactive"
    };
    var perform_goto = function() {
        var validated_str = el.goto_input.value.replace(/[^\d]/, "");
        if (validated_str !== el.goto_input.value) el.goto_input.value = validated_str;
        if (validated_str === "") return;
        var num = parseInt(validated_str);
        dn.editor.gotoLine(num);
        dn.editor.navigateLineEnd()
    };
    var goto_input_keyup = perform_goto;
    var goto_input_keydown = function(e) {
        if (e.which == WHICH.DOWN) {
            el.goto_input.value = parseInt(el.goto_input.value.replace(/[^\d]/, "")) + 1;
            perform_goto();
            e.preventDefault()
        } else if (e.which == WHICH.UP) {
            el.goto_input.value = parseInt(el.goto_input.value.replace(/[^\d]/, "")) - 1;
            perform_goto();
            e.preventDefault()
        } else if (e.which == WHICH.ESC) {
            dn.g_settings.set("pane_open", false);
            e.preventDefault();
            e.stopPropagation();
            dn.focus_editor()
        }
    };
    var update_search_history = function() {
        var current_str = search_str;
        search_history_left_behind_str = current_str;
        if (current_str.length === 0 || !dn.g_atomic_exec) {
            search_history_idx = -1;
            return
        }
        dn.g_atomic_exec(function() {
            var time_now = Date.now();
            if (dn.g_find_history.length === 0) {
                dn.g_find_history.push(current_str);
                search_history_idx = 0;
                search_history_last_modified_time = time_now;
                return
            }
            var top_of_history = dn.g_find_history.get(0);
            if (current_str.length < top_of_history.length && current_str.toLowerCase() === top_of_history.substr(0, current_str.length).toLowerCase()) {
                search_history_idx = -1;
                return
            }
            if (current_str.toLowerCase() == top_of_history.toLowerCase()) {
                dn.g_find_history.set(0, current_str)
            } else if (current_str.length > top_of_history.length && top_of_history.toLowerCase() === current_str.substr(0, top_of_history.length).toLowerCase()) {
                dn.g_find_history.set(0, current_str)
            } else if (time_now > search_history_last_modified_time + dn.const_.find_history_add_delay) {
                dn.g_find_history.insert(0, current_str);
                if (dn.g_find_history.length > dn.const_.find_history_max_len) {
                    dn.g_find_history.remove(dn.g_find_history.length - 1)
                }
            } else {
                dn.g_find_history.set(0, current_str)
            }
            search_history_idx = 0;
            search_history_last_modified_time = time_now
        })
    };
    var search_inputs_focus = function(e) {
        if (e.currentTarget == el.find_input) {
            el.find_input.tabIndex = 101;
            el.replace_input.tabIndex = 102
        } else {
            el.find_input.tabIndex = 102;
            el.replace_input.tabIndex = 101
        }
        if (search_inputs_have_focus) return;
        search_inputs_have_focus = true;
        dn.editor.setHighlightSelectedWord(false);
        perform_search()
    };
    var search_inputs_blur = function(e) {
        if (e.relatedTarget == el.replace_input || e.relatedTarget == el.find_input) return;
        search_inputs_have_focus = false;
        var session = dn.editor.getSession();
        for (var ii = 0; ii < search_markers.length; ii++) session.removeMarker(search_markers[ii]);
        if (search_marker_current !== undefined) {
            session.removeMarker(search_marker_current);
            search_marker_current = undefined
        }
        el.info.textContent = "search inactive";
        el.search_results.innerHTML = "";
        el.info_overflow.textContent = "";
        search_markers = [];
        search_results = [];
        search_current_match_idx = -1;
        el.find_input.setSelectionRange(el.find_input.selectionEnd, el.find_input.selectionEnd);
        dn.editor.setHighlightSelectedWord(true)
    };
    var build_search_options = function() {
        var str = el.find_input.value;
        var use_reg_exp = dn.g_settings.get("find_regex");
        var sensitive = dn.g_settings.get("find_case_sensitive");
        if (use_reg_exp) {
            var re = undefined;
            re = new RegExp(str, sensitive ? "g" : "gi")
        }
        return {
            needle: use_reg_exp ? re : str,
            wrap: true,
            caseSensitive: sensitive,
            wholeWord: dn.g_settings.get("find_whole_words"),
            regExp: use_reg_exp
        }
    };
    var perform_search = function() {
        var session = dn.editor.getSession();
        for (var ii = 0; ii < search_markers.length; ii++) session.removeMarker(search_markers[ii]);
        if (search_marker_current !== undefined) {
            session.removeMarker(search_marker_current);
            search_marker_current = undefined
        }
        search_markers = [];
        search_results = [];
        search_current_match_idx = -1;
        el.search_results.innerHTML = "";
        el.info_overflow.textContent = "";
        el.info.textContent = "";
        search_str = el.find_input.value;
        var search_options = undefined;
        try {
            search_options = build_search_options()
        } catch (e) {
            el.info.textContent = escape_str(e.message)
        }
        if (search_options === undefined) {
            dn.editor.selection.clearSelection()
        } else if (search_str == "") {
            el.info.textContent = "type to search. ";
            dn.editor.selection.clearSelection()
        } else {
            var search = new AceSearch;
            search.setOptions(search_options);
            search_results = search.findAll(session);
            if (search_results.length === 0) {
                el.info.textContent = "no matches found.";
                el.info_overflow.textContent = "";
                dn.editor.selection.clearSelection()
            } else {
                var selected_range = session.getSelection().getRange();
                for (var ii = 0; ii < search_results.length; ii++)
                    if (search_results[ii].end.row > selected_range.start.row || search_results[ii].end.row == selected_range.start.row && search_results[ii].end.column >= selected_range.start.column) break;
                var current_match_idx = ii == search_results.length ? search_results.length - 1 : ii;
                for (var ii = 0; ii < search_results.length; ii++) search_markers.push(session.addMarker(search_results[ii], "find_match_marker", "find_match_marker", false));
                for (var ii = 0; ii < search_results.length; ii++) search_results[ii] = {
                    range: search_results[ii],
                    idx: ii
                };
                select_search_result_idx(current_match_idx)
            }
        }
    };
    var select_search_result_idx = function(new_idx) {
        search_current_match_idx = new_idx;
        var session = dn.editor.getSession();
        if (search_marker_current !== undefined) {
            session.removeMarker(search_marker_current);
            search_marker_current = undefined
        }
        var search_results_sub = [];
        var replace_is_showing = dn.g_settings.get("find_replace");
        var max_search_results = const_.find_max_results_half * 2 + (replace_is_showing ? 0 : 1);
        if (search_results.length <= max_search_results) {
            search_results_sub = search_results
        } else {
            var n_pre = const_.find_max_results_half - (replace_is_showing ? 1 : 0);
            var n_post = const_.find_max_results_half;
            if (search_current_match_idx < n_pre) {
                search_results_sub = search_results_sub.concat(search_results.slice(search_current_match_idx - n_pre));
                search_results_sub = search_results_sub.concat(search_results.slice(0, search_current_match_idx))
            } else {
                search_results_sub = search_results_sub.concat(search_results.slice(search_current_match_idx - n_pre, search_current_match_idx))
            }
            search_results_sub.push(search_results[search_current_match_idx]);
            if (search_current_match_idx + n_post >= search_results.length) {
                search_results_sub = search_results_sub.concat(search_results.slice(search_current_match_idx + 1));
                search_results_sub = search_results_sub.concat(search_results.slice(0, n_post + 1 - (search_results.length - search_current_match_idx)))
            } else {
                search_results_sub = search_results_sub.concat(search_results.slice(search_current_match_idx + 1, search_current_match_idx + n_post + 1))
            }
        }
        var show_replace_buttons = dn.g_settings.get("find_replace");
        var html = "";
        for (var ii = 0; ii < search_results_sub.length; ii++) {
            var row = search_results_sub[ii].range.start.row;
            var col = search_results_sub[ii].range.start.column;
            var prefix_range = new AceRange(row, Math.max(0, col - const_.find_max_prefix_chars), row, col);
            var pre_ellipses = col > const_.find_max_prefix_chars;
            row = search_results_sub[ii].range.end.row;
            col = search_results_sub[ii].range.end.column;
            var suffix_range = new AceRange(row, col, row, col + const_.find_max_suffix_chars);
            html += "<div class='find_result_item" + (search_results_sub[ii].idx == search_current_match_idx ? " find_result_current" : "") + "'>" + "<div class='find_result_line_num'>" + (row + 1) + "</div>" + "<div class='find_result_text'>" + "<div class='find_result_text_inner'>" + (pre_ellipses ? "&#8230;" : "") + escape_str(session.getTextRange(prefix_range)) + "<span class='find_result_match'>" + escape_str(session.getTextRange(search_results_sub[ii].range)) + "</span>" + escape_str(session.getTextRange(suffix_range)) + "</div>" + "</div>" + (show_replace_buttons ? "<div class='button inline_button replace_single_result' title='replace'>r</div>" : "") + "</div>"
        }
        el.search_results.innerHTML = html;
        var els = el.search_results.getElementsByClassName("find_result_item");
        for (var ii = 0; ii < els.length; ii++)
            if (search_results_sub[ii].idx !== search_current_match_idx) els[ii].addEventListener("click", search_result_click(search_results_sub[ii].idx));
        if (show_replace_buttons) {
            var els = el.search_results.getElementsByClassName("replace_single_result");
            for (var ii = 0; ii < els.length; ii++) els[ii].addEventListener("click", search_replace_result_click(search_results_sub[ii].idx))
        }
        if (search_results.length > max_search_results) el.info_overflow.textContent = "... and " + (search_results.length - max_search_results) + " more matches";
        else el.info_overflow.textContent = "";
        search_marker_current = session.addMarker(search_results[search_current_match_idx].range, "find_current_match_marker", "find_current_match_marker", false);
        dn.editor.selection.setSelectionRange(search_results[search_current_match_idx].range, false);
        dn.editor.renderer.scrollSelectionIntoView()
    };
    var settings_changed = function() {
        if (search_inputs_have_focus || dn.g_settings.get("pane") === "pane_find" && dn.g_settings.get("pane_open") && el.find_input.value) perform_search()
    };
    var search_result_click = function(ii) {
        return function(e) {
            select_search_result_idx(ii)
        }
    };
    var search_replace_result_click = function(ii) {
        return function(e) {
            replace_result_idx(ii);
            e.stopPropagation()
        }
    };
    var find_input_keyup = function(e) {
        if (e.which == WHICH.ENTER || e.which == WHICH.ESC || e.which == WHICH.UP || e.which == WHICH.DOWN) return;
        if (search_str == el.find_input.value) return;
        perform_search();
        update_search_history()
    };
    var find_input_keydown = function(e) {
        if (e.which == WHICH.ENTER && !e.shiftKey || !e.ctrlKey && e.which == WHICH.DOWN) {
            select_search_result_idx(search_current_match_idx + 1 < search_results.length ? search_current_match_idx + 1 : 0);
            e.preventDefault();
            return
        } else if (e.which == WHICH.ENTER && e.shiftKey || !e.ctrlKey && e.which == WHICH.UP) {
            select_search_result_idx(search_current_match_idx - 1 < 0 ? search_results.length - 1 : search_current_match_idx - 1);
            e.preventDefault();
            return
        }
        if (e.which == WHICH.ESC) {
            dn.g_settings.set("pane_open", false);
            dn.focus_editor();
            e.preventDefault();
            e.stopPropagation();
            return
        }
        if (e.ctrlKey && dn.g_find_history && (e.which == WHICH.DOWN || e.which == WHICH.UP)) {
            dn.g_atomic_exec(function() {
                if (e.which == WHICH.UP) search_history_idx = Math.max(-1, search_history_idx - 1);
                else search_history_idx++;
                search_history_idx = Math.min(search_history_idx, dn.g_find_history.length - 1);
                if (search_history_idx == -1) {
                    el.find_input.value = search_history_left_behind_str
                } else {
                    el.find_input.value = dn.g_find_history.get(search_history_idx)
                }
                el.find_input.setSelectionRange(el.find_input.value.length, el.find_input.value.length + 10)
            });
            perform_search();
            e.preventDefault()
        }
    };
    var replace_input_keydown = function(e) {
        if (e.which == WHICH.ENTER) {
            if (e.ctrlKey || e.shiftKey) replace_all();
            else replace_result_idx(search_current_match_idx);
            e.preventDefault()
        } else {
            find_input_keydown(e)
        }
    };
    var replace_all = function(e) {
        try {
            var options = build_search_options()
        } catch (e) {
            dn.show_error(e.message);
            return
        }
        dn.editor.replaceAll(el.replace_input.value, options);
        dn.focus_editor()
    };
    var replace_result_idx = function(idx) {
        var range = search_results[idx].range;
        dn.editor.$search.set(build_search_options());
        dn.editor.$tryReplace(range, el.replace_input.value);
        perform_search()
    };
    return {
        focus_on_input: focus_on_input,
        on_document_ready: on_document_ready,
        on_find_shortcut: find_shortcut_used,
        on_replace_shortcut: replace_shortcut_used,
        on_goto_shortcut: goto_shortcut_used
    }
}(dn.const_);
"use strict";
dn.esc_pressed = function(e) {
    dn.g_settings.set("pane_open", !dn.g_settings.get("pane_open"));
    if (dn.g_settings.get("pane_open") && dn.g_settings.get("pane") == "pane_find") {
        dn.find_pane.focus_on_input()
    } else {
        dn.focus_editor()
    }
    e.preventDefault()
};
dn.make_keyboard_shortcuts = function() {
    dn.editor.commands.removeCommands(["find", "findprevious", "findnext", "replace", "jumptomatching", "sortlines", "selecttomatching", "gotoline"]);
    key("command+s, ctrl+s,  ctrl+alt+s,  command+alt+s", dn.file_pane.on_save_shorcut);
    key("command+p, ctrl+p,  ctrl+alt+p,  command+alt+p", dn.file_pane.do_print_shorcut);
    key("command+o, ctrl+o,  ctrl+alt+o,  command+alt+o", dn.do_open);
    key("command+n, ctrl+n,  ctrl+alt+n,  command+alt+n", dn.do_new);
    key("command+l, ctrl+l,  ctrl+alt+l,  command+alt+l", dn.find_pane.on_goto_shortcut);
    key("command+f, ctrl+f,  ctrl+alt+f,  command+alt+f", dn.find_pane.on_find_shortcut);
    key("command+r, ctrl+r,  ctrl+alt+r,  command+alt+r" + ", command+g, ctrl+g,  ctrl+alt+g,  command+alt+g", dn.find_pane.on_replace_shortcut);
    key("command+h, ctrl+h,  ctrl+alt+h,  command+alt+h", dn.file_pane.do_history);
    key("esc", dn.esc_pressed);
    key.filter = function() {
        return 1
    };
    var HashHandler = require("ace/keyboard/hash_handler").HashHandler;
    var extraKeyEvents = new HashHandler([{
        bindKey: {
            win: "Ctrl-Left",
            mac: "Command-Left"
        },
        descr: "Clipboard cyle back on paste",
        exec: dn.clipboard_tool.on_left
    }, {
        bindKey: {
            win: "Ctrl-Down",
            mac: "Command-Down"
        },
        descr: "Clipboard cyle back on paste",
        exec: dn.clipboard_tool.on_left
    }, {
        bindKey: {
            win: "Ctrl-Right",
            mac: "Command-Right"
        },
        descr: "Clipboard cyle forward on paste",
        exec: dn.clipboard_tool.on_right
    }, {
        bindKey: {
            win: "Ctrl-Up",
            mac: "Command-Up"
        },
        descr: "Clipboard cyle forward on paste",
        exec: dn.clipboard_tool.on_right
    }]);
    dn.editor.keyBinding.addKeyboardHandler(extraKeyEvents);
    dn.ctrl_key = "crtl";
    if (dn.platform == "Mac") {
        dn.ctrl_key = "cmd";
        var els = document.getElementsByClassName("ctrl_key");
        for (var ii = 0; ii < els.length; ii++) els[ii].textContent = "cmd"
    }
};
"use strict";
dn.version_str = "2016a";
dn.can_show_drag_drop_error = true;
dn.save_undo_id = 0;
dn.status = {
    file_body: 1,
    file_meta: 1,
    file_new: 1,
    file_sharing: 0,
    authentication: 0,
    popup_active: 0,
    local_settings: 0,
    realtime_settings: 0,
    save_body: 1,
    save_title: 1,
    save_other: 1,
    unsaved_changes: 0,
    user_wants_file: 0,
    warned_read_only: 0
};
dn.the_file = new dn.FileModel;
dn.change_line_history = [];
dn.last_change = null;
dn.change_line_classes = function(rootStr, trueN, factor) {
    var x = [""];
    for (var i = trueN; i; i--)
        for (var k = 0; k < factor; k++) x.push(rootStr + i);
    return x
}("recent_line_", 8, 5);
dn.change_line_classes_rm = function(rootStr, trueN, factor) {
    var x = [""];
    for (var i = trueN; i; i--)
        for (var k = 0; k < factor; k++) x.push(rootStr + i);
    return x
}("recent_line_rm", 8, 5);
dn.el = dn.el || {};
dn.show_status = function() {
    var s = "";
    if (!dn.status.user_wants_file) {
        if (dn.status.unsaved_changes) s = "unsaved file";
        else s = "ex nihilo omnia."
    } else if (dn.status.file_new === 1 && dn.status.file_meta === 1 && dn.status.file_body === 1) {
        s = "" + dn.the_file.title;
        var extra = [];
        if (dn.the_file.is_read_only) extra.push("read-only");
        if (dn.the_file.is_shared) extra.push("shared");
        if (dn.status.file_sharing == -1) extra.push("sharing status unknown");
        if (dn.status.unsaved_changes) extra.push("unsaved changes");
        if (dn.status.save_body == 0) {
            extra.push("saving document")
        } else {
            if (dn.status.save_title == 0) extra.push("updating title");
            if (dn.status.save_other == 0) extra.push("updating file properties")
        }
        if (extra.length) s += "\n[" + extra.join(", ") + "]"
    } else if (dn.status.file_new === 0) s = "Creating new file";
    else if (dn.status.file_new === -1) s = "Failed to create new file";
    else if (dn.status.file_meta === 0 && dn.status.file_body === 0) s = "Loading file:\n" + dn.the_file.file_id;
    else if (dn.status.file_meta === 1 && dn.status.file_body === 0) s = "Loading " + (dn.the_file.is_read_only ? "read-only " : "") + "file:\n" + dn.the_file.title;
    else if (dn.status.file_meta === 0 && dn.status.file_body === 1) s = "Loading metadata for file:\n" + dn.the_file.file_id;
    else if (dn.status.file_meta === 1) s = "Failed to download " + (dn.the_file.is_read_only ? "read-only " : "") + "file:\n" + dn.the_file.title;
    else if (dn.status.file_body === 1) s = "Failed to download metadata for file:\n" + dn.the_file.file_id;
    else s = "Failed to load file:\n" + dn.the_file.file_id;
    if (dn.status.authentication != 1) {
        if (s) s += "\n";
        if (dn.status.authorization == -1) s += "Authorization required...";
        else if (dn.status.popup_active) s += "Login/authenticate with popup...";
        else s += "Authenticating..."
    }
    text_multi(dn.el.widget_text, s, true);
    if (dn.status.save_body == 0 || dn.status.save_title == 0 || dn.status.save_other == 0) dn.el.widget_pending.style.display = "";
    else dn.el.widget_pending.style.display = "none"
};
dn.show_error = function(message) {
    console.log(message);
    text_multi(dn.el.widget_error_text, message, true);
    dn.el.widget_error.style.display = "";
    css_animation(dn.el.the_widget, "shake", function() {
        dn.el.widget_error.style.display = "none"
    }, dn.const_.error_delay_ms)
};
dn.toggle_permission = function(state) {
    var el = dn.el.pane_permissions;
    if (state) {
        if (!dn.status.permissions_showing) {
            dn.status.permissions_showing = 1;
            el.style.display = "";
            dn.g_settings.set("pane", "pane_help");
            dn.g_settings.set("pane_open", true);
            css_animation(dn.el.the_widget, "shake", function() {}, dn.const_.error_delay_ms)
        }
    } else {
        dn.status.permissions_showing = 0;
        el.style.display = "none"
    }
};
dn.show_pane = function(id) {
    if (id === "pane_permissions") return dn.toggle_permission(true);
    if (id !== "pane_file") dn.file_pane.on_close_pane();
    var el = document.getElementById(id);
    for (var ii = 0; ii < dn.el.widget_content.children.length; ii++)
        if (dn.el.widget_content.children[ii] !== el && dn.el.widget_content.children[ii] !== dn.el.pane_permissions) {
            dn.el.widget_content.children[ii].style.display = "none";
            var el_icon = dn.menu_icon_from_pane_id[dn.el.widget_content.children[ii].id];
            if (el_icon) el_icon.classList.remove("icon_selected")
        }
    if (el) {
        el.style.display = "";
        var el_icon = dn.menu_icon_from_pane_id[el.id];
        if (el_icon) el_icon.classList.add("icon_selected")
    } else {
        dn.g_settings.set("pane_open", false)
    }
};
dn.widget_mouse_down = function(e) {
    dn.widget_mouse_down_info = {
        off_left: -e.clientX,
        off_top: -e.clientY,
        start_time: Date.now(),
        is_dragging: e.button !== 0
    };
    e.preventDefault();
    document.addEventListener("mousemove", dn.document_mouse_move_widget);
    document.addEventListener("mouseup", dn.document_mouse_up_widget)
};
dn.document_mouse_move_widget = function(e) {
    var x = e.clientX + dn.widget_mouse_down_info.off_left;
    var y = e.clientY + dn.widget_mouse_down_info.off_top;
    if (!dn.widget_mouse_down_info.is_dragging) {
        dn.widget_mouse_down_info.is_dragging = Date.now() - dn.widget_mouse_down_info.start_time > dn.const_.drag_delay_ms || x * x + y * y > dn.const_.drag_shift_px * dn.const_.drag_shift_px
    }
    if (dn.widget_mouse_down_info.is_dragging) translate(dn.el.the_widget, x, y);
    e.stopPropagation()
};
dn.document_mouse_up_widget = function(e) {
    document.removeEventListener("mousemove", dn.document_mouse_move_widget);
    document.removeEventListener("mouseup", dn.document_mouse_up_widget);
    if (dn.widget_mouse_down_info.is_dragging) {
        var pos = dn.el.the_widget.getBoundingClientRect();
        translate(dn.el.the_widget, 0, 0);
        var widget_w = dn.el.the_widget.offsetWidth;
        var widget_h = dn.el.the_widget.offsetHeight;
        var window_w = window.innerWidth;
        var window_h = window.innerHeight;
        var anchor = [];
        if (pos.left < window_w - (pos.left + widget_w)) {
            anchor[0] = "l";
            anchor[1] = Math.max(0, pos.left / window_w * 100)
        } else {
            anchor[0] = "r";
            anchor[1] = Math.max(0, (window_w - (pos.left + widget_w)) / window_w * 100)
        }
        if (pos.top < window_h - (pos.top + widget_h)) {
            anchor[2] = "t";
            anchor[3] = Math.max(0, pos.top / window_h * 100)
        } else {
            anchor[2] = "b";
            anchor[3] = Math.max(0, (window_h - (pos.top + widget_h)) / window_h * 100)
        }
        if (dn.g_settings) dn.g_settings.set("widget_anchor", anchor)
    } else {
        dn.g_settings.set("pane_open", !dn.g_settings.get("pane_open"))
    }
    dn.widget_mouse_down_info = undefined
};
dn.widget_apply_anchor = function(anchor) {
    anchor = Array.isArray(anchor) ? anchor : dn.g_settings.get("widget_anchor");
    var widget_w = dn.el.the_widget.offsetWidth;
    var widget_h = dn.el.the_widget.offsetHeight;
    var window_w = window.innerWidth;
    var window_h = window.innerHeight;
    if (anchor[0] == "l") {
        if (window_w * anchor[1] / 100 + widget_w > window_w) {
            dn.el.the_widget.style.left = "inherit";
            dn.el.the_widget.style.right = "0px"
        } else {
            dn.el.the_widget.style.left = anchor[1] + "%";
            dn.el.the_widget.style.right = ""
        }
        dn.el.widget_menu.classList.add("flipped");
        dn.el.widget_content.classList.add("flipped");
        var els = document.getElementsByClassName("widget_menu_icon");
        for (var ii = 0; ii < els.length; ii++) els[ii].classList.add("flipped")
    } else {
        if (window_w * anchor[1] / 100 + widget_w > window_w) {
            dn.el.the_widget.style.left = "0px";
            dn.el.the_widget.style.right = ""
        } else {
            dn.el.the_widget.style.left = "inherit";
            dn.el.the_widget.style.right = anchor[1] + "%"
        }
        dn.el.widget_menu.classList.remove("flipped");
        dn.el.widget_content.classList.remove("flipped");
        var els = document.getElementsByClassName("widget_menu_icon");
        for (var ii = 0; ii < els.length; ii++) els[ii].classList.remove("flipped")
    }
    if (anchor[2] == "t") {
        if (window_h * anchor[3] / 100 + widget_h > window_h) {
            dn.el.the_widget.style.top = "inherit";
            dn.el.the_widget.style.bottom = "0px"
        } else {
            dn.el.the_widget.style.top = anchor[3] + "%";
            dn.el.the_widget.style.bottom = ""
        }
    } else {
        if (window_h * anchor[3] / 100 + widget_h > window_h) {
            dn.el.the_widget.style.top = "0px";
            dn.el.the_widget.style.bottom = ""
        } else {
            dn.el.the_widget.style.top = "inherit";
            dn.el.the_widget.style.bottom = anchor[3] + "%"
        }
    }
};
dn.toggle_widget = function(state) {
    if (state) {
        dn.el.widget_menu.style.display = "";
        dn.el.widget_content.style.display = ""
    } else {
        dn.el.widget_menu.style.display = "none";
        dn.el.widget_content.style.display = "none";
        dn.file_pane.on_close_pane();
        dn.focus_editor()
    }
};
dn.check_unsaved = function() {
    if (dn.save_undo_id === dn.editor.getSession().getUndoManager().getCurrentId()) {
        dn.status.unsaved_changes = false;
        dn.render_document_title();
        dn.show_status()
    } else if (!dn.status.unsaved_changes) {
        dn.status.unsaved_changes = true;
        dn.render_document_title();
        dn.show_status()
    }
};
dn.g_settings = function() {
    var ob = {};
    var keeps = {};
    var change_listeners = [];
    return {
        get: function(k) {
            return ob[k]
        },
        set: function(k, v) {
            if (ob[k] === v) return;
            ob[k] = v;
            for (var ii = 0; ii < change_listeners.length; ii++) change_listeners[ii]({
                property: k,
                newValue: v
            })
        },
        keep: function(k) {
            keeps[k] = true
        },
        get_keeps: function() {
            return keeps
        },
        addEventListener: function(flag, callback) {
            if (flag !== "VALUE_CHANGED") throw "only VALUE_CHANGED";
            change_listeners.push(callback)
        },
        transfer_to_true_model: function(real_model) {
            for (var k in ob)
                if (ob.hasOwnProperty(k) && !keeps[k])
                    if (real_model.get(k) !== null && real_model.get(k) !== undefined && JSON.stringify(ob[k]) !== JSON.stringify(real_model.get(k))) this.set(k, real_model.get(k));
            while (change_listeners.length) real_model.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, change_listeners.shift())
        }
    }
}();
dn.load_default_settings = function() {
    dn.status.local_settings = 0;
    try {
        console.log("Loading default/localStorage settings...");
        for (var s in dn.default_settings)
            if (dn.impersonal_settings_keys.indexOf(s) == -1 || !localStorage || !localStorage["g_settings_" + s]) dn.g_settings.set(s, dn.default_settings[s]);
            else dn.g_settings.set(s, JSON.parse(localStorage["g_settings_" + s]))
    } catch (err) {
        if (localStorage) localStorage.clear();
        console.log("Failed to load defaults/localStorage settings.  Have cleared localStorage cache.")
    }
    dn.status.local_settings = 1
};
dn.show_app_data_document = function(doc) {
    dn.g_atomic_exec = function(foo) {
        var result;
        try {
            doc.getModel().beginCompoundOperation();
            result = foo()
        } catch (e) {
            console.log("error in atomic update:\n" + e)
        } finally {
            doc.getModel().endCompoundOperation()
        }
        return result
    };
    var old_temp_g_settings = dn.g_settings;
    dn.g_settings = doc.getModel().getRoot();
    console.log("Transfering to realtime model for settings.");
    old_temp_g_settings.transfer_to_true_model(dn.g_settings);
    var existing_cloud_keys = dn.g_settings.keys();
    for (var s in dn.default_settings)
        if (s in old_temp_g_settings.get_keeps() || existing_cloud_keys.indexOf(s) == -1) dn.g_settings.set(s, old_temp_g_settings.get(s));
    dn.g_clipboard = dn.g_settings.get("clipboard");
    if (!dn.g_clipboard) {
        dn.g_settings.set("clipboard", doc.getModel().createList());
        dn.g_clipboard = dn.g_settings.get("clipboard")
    }
    if (dn.g_clipboard.length > dn.const_.clipboard_max_length) {
        dn.g_clipboard.removeRange(0, dn.g_clipboard.length - dn.const_.clipboard_max_length)
    }
    dn.g_find_history = dn.g_settings.get("findHistory");
    if (!dn.g_find_history) {
        dn.g_settings.set("findHistory", doc.getModel().createList());
        dn.g_find_history = dn.g_settings.get("findHistory")
    } else if (dn.g_find_history.length > dn.const_.find_history_max_len) {
        dn.g_find_history.removeRange(dn.const_.find_history_max_len, dn.g_find_history.length)
    }
    var last_version = dn.g_settings.get("lastDNVersionUsed");
    if (last_version != dn.version_str) {
        if (last_version.length > 0 && parseInt(last_version) !== 2016) {
            document.getElementById("tips_old_user").style.display = "";
            document.getElementById("tips_general").style.display = "none"
        }
        dn.g_settings.set("help_inner", "tips");
        dn.g_settings.set("pane", "pane_help");
        dn.g_settings.set("pane_open", "true");
        dn.g_settings.set("lastDNVersionUsed", dn.version_str)
    }
    dn.status.realtime_settings = 1
};
dn.settings_changed = function(e) {
    var new_value = e.newValue;
    console.log("[user settings] " + e.property + ": " + new_value);
    if (dn.impersonal_settings_keys.indexOf(e.property) > -1 && localStorage) {
        localStorage["g_settings_" + e.property] = JSON.stringify(new_value)
    }
    try {
        switch (e.property) {
            case "widget_anchor":
                dn.widget_apply_anchor(new_value);
                break;
            case "theme":
                dn.editor.setTheme("ace/theme/" + new_value);
                break;
            case "fontSize":
                var scrollLine = dn.get_scroll_line();
                dn.editor.setFontSize(new_value + "em");
                dn.editor.scrollToLine(scrollLine);
                break;
            case "wordWrap":
                var s = dn.editor.getSession();
                var scrollLine = dn.get_scroll_line();
                s.setUseWrapMode(new_value[0]);
                s.setWrapLimitRange(new_value[1], new_value[2]);
                dn.editor.scrollToLine(scrollLine);
                break;
            case "wordWrapAt":
                var curWrap = dn.g_settings.get("wordWrap");
                if (curWrap[1] && curWrap[1] != new_value) dn.g_settings.set("wordWrap", [1, new_value, new_value]);
                dn.editor.setPrintMarginColumn(new_value);
                break;
            case "showGutterHistory":
                var s = dn.editor.getSession();
                if (!new_value) {
                    var h = dn.change_line_history;
                    for (var i = 0; i < h.length; i++)
                        if (h[i]) s.removeGutterDecoration(i, h[i] < 0 ? dn.change_line_classes_rm[-h[i]] : dn.change_line_classes[h[i]]);
                    dn.change_line_history = []
                }
                break;
            case "newLineDefault":
                if (dn.the_file.loaded_body) dn.the_file.compute_newline();
                break;
            case "softTabN":
            case "tabIsHard":
                if (dn.the_file.loaded_body) dn.the_file.compute_newline();
                break;
            case "pane_open":
                if (dn.clipboard_tool.is_active()) break;
                dn.toggle_widget(new_value);
                if (dn.g_settings.keep) dn.g_settings.keep("pane_open");
                break;
            case "pane":
                if (dn.clipboard_tool.is_active()) break;
                dn.show_pane(new_value);
                if (dn.g_settings.keep) dn.g_settings.keep("pane");
                if (new_value !== "pane_help") dn.g_settings.set("help_inner", "main");
                break
        }
    } catch (err) {
        console.log("Error while uptating new settings value.");
        console.dir(e);
        console.dir(err)
    }
};
dn.get_scroll_line = function() {
    return dn.editor.getSession().screenToDocumentPosition(dn.editor.renderer.getScrollTopRow(), 0).row
};
dn.show_file_meta = function(resp) {
    if (resp.error) throw Error(resp.error);
    dn.the_file.file_id = resp.result.id;
    var props = {
        is_read_only: !resp.result.capabilities.canEdit,
        is_shared: resp.result.shared
    };
    if (dn.status.file_meta === 0) {
        props.title = resp.result.name;
        props.description = resp.result.description || "";
        props.loaded_mime_type = resp.result.mimeType;
        if (resp.result.properties) {
            if (resp.result.properties.aceMode !== undefined) props.syntax = resp.result.properties.aceMode;
            if (resp.result.properties.newline !== undefined) props.newline = resp.result.properties.newline;
            if (resp.result.properties.tabs !== undefined) props.tabs = resp.result.properties.tabs
        }
    }
    dn.the_file.set(props);
    if (resp.result.parents && resp.result.parents.length) {
        dn.the_file.folder_id = resp.result.parents[0];
        dn.set_drive_link_to_folder()
    }
    history.replaceState({}, dn.the_file.title, "//" + location.host + location.pathname + "?" + "state=" + JSON.stringify({
        action: "open",
        ids: [dn.the_file.file_id]
    }));
    dn.status.file_meta = 1;
    dn.status.file_new = 1;
    dn.show_status()
};
dn.show_file_body = function(resp) {
    resp.body = decode_body(resp.body);
    dn.setting_session_value = true;
    dn.the_file.loaded_body = resp.body;
    dn.editor.session.setValue(resp.body);
    dn.setting_session_value = false;
    dn.status.file_body = 1;
    dn.show_status();
    dn.editor.setReadOnly(false)
};
dn.on_editor_change = function(e) {
    if (!e.start || !e.end || dn.setting_session_value) return;
    if (dn.the_file.is_read_only && dn.status.warned_read_only === 0) {
        dn.show_error("Warning: you cannot save changes. File loaded as read-only.");
        dn.status.warned_read_only = 1
    }
    if (!dn.g_settings.get("showGutterHistory")) return;
    var n_classes = dn.change_line_classes.length - 1;
    var h = dn.change_line_history;
    var s = dn.editor.getSession();
    var start_row = e.start.row;
    var end_row = e.end.row;
    if (dn.last_change && dn.last_change.start_row == start_row && dn.last_change.end_row == end_row && start_row == end_row) {
        if (dn.last_change.action === e.action) {
            return
        } else if (e.action === "remove") {
            s.removeGutterDecoration(start_row, dn.change_line_classes[n_classes]);
            s.addGutterDecoration(start_row, dn.change_line_classes_rm[n_classes]);
            h[start_row] = -n_classes;
            dn.last_change.action = "remove";
            return
        } else {
            s.removeGutterDecoration(start_row, dn.change_line_classes_rm[n_classes]);
            s.addGutterDecoration(start_row, dn.change_line_classes[n_classes]);
            h[start_row] = n_classes;
            dn.last_change.action = "insert";
            return
        }
    } else {
        dn.last_change = {
            start_row: start_row,
            end_row: end_row,
            action: e.action
        }
    }
    for (var ii = 0; ii < h.length; ii++)
        if (h[ii]) s.removeGutterDecoration(ii, h[ii] < 0 ? dn.change_line_classes_rm[-h[ii]++] : dn.change_line_classes[h[ii]--]);
    if (e.action === "remove") {
        if (e.lines.length > 1) h.splice(start_row, e.lines.length - 1);
        h[start_row] = -n_classes
    } else {
        h[start_row] = n_classes;
        if (e.lines.length > 1) {
            var args_for_splice = [start_row, 0];
            for (var ii = 0; ii < e.lines.length - 1; ii++) args_for_splice.push(n_classes);
            h.splice.apply(h, args_for_splice)
        }
    }
    for (var ii = 0; ii < h.length; ii++)
        if (h[ii]) s.addGutterDecoration(ii, h[ii] < 0 ? dn.change_line_classes_rm[-h[ii]] : dn.change_line_classes[h[ii]])
};
dn.query_unload = function() {
    if (dn.status.unsaved_changes) return "If you leave the page now you will loose the unsaved " + (dn.status.user_wants_file && dn.status.file_new === 1 && dn.status.file_body === 1 ? "changes to " : "new ") + "file '" + dn.the_file.title + "'."
};
dn.set_drive_link_to_folder = function() {
    var els = document.getElementsByClassName("link_drive");
    var href = dn.the_file.folder_id ? "https://drive.google.com/#folders/" + dn.the_file.folder_id : "https://drive.google.com";
    for (var ii = 0; ii < els.length; ii++) els[ii].href = href
};
dn.show_user_info = function(a) {
    dn.user_info = a.result;
    dn.help_pane.on_user_name_change(a.result.name)
};
dn.render_document_title = function() {
    document.title = (dn.status.unsaved_changes ? "*" : "") + dn.the_file.title
};
dn.set_editor_newline = function() {
    dn.editor.session.setNewLineMode(dn.the_file.properties_chosen.newline)
};
dn.set_editor_tabs = function() {
    var val = dn.the_file.properties_chosen.tabs;
    if (val.val === "hard") {
        dn.editor.session.setUseSoftTabs(false)
    } else {
        dn.editor.session.setUseSoftTabs(true);
        dn.editor.session.setTabSize(val.n)
    }
};
dn.set_editor_syntax = function() {
    var mode_str = dn.the_file.properties_chosen.syntax;
    var modes_array = require("ace/ext/modelist").modes;
    for (var ii = 0; ii < modes_array.length; ii++)
        if (modes_array[ii].caption === mode_str) {
            dn.editor.getSession().setMode(modes_array[ii].mode);
            return
        }
    dn.show_error("unrecognised syntax mode requested")
};
dn.create_file = function() {
    dn.status.user_wants_file = 1;
    dn.status.file_new = 0;
    dn.show_status();
    until_success(function(succ, fail) {
        Promise.resolve(dn.pr_auth).then(dn.request_new(dn.new_in_folder, dn.the_file.title)).then(dn.show_file_meta).then(succ, fail)
    }).before_retry(dn.filter_api_errors).then(function(result) {
        console.log("suceeded creating file");
        dn.pr_file_loaded.resolve()
    }).catch(function(err) {
        console.log("failed to create new file");
        console.dir(err);
        dn.show_error(dn.api_error_to_string(err));
        document.title = "Drive Notepad";
        dn.status.file_new = -1;
        dn.show_status();
        dn.g_settings.set("pane", "pane_help");
        dn.g_settings.set("pane_open", true);
        console.dir(err)
    })
};
dn.document_ready = function(e) {
    dn.el.the_widget = document.getElementById("the_widget");
    dn.el.widget_text = document.getElementById("widget_text");
    dn.el.widget_error_text = document.getElementById("widget_error_text");
    dn.el.widget_error = document.getElementById("widget_error");
    dn.el.widget_content = document.getElementById("widget_content");
    dn.el.widget_pending = document.getElementById("widget_pending");
    dn.el.the_widget.addEventListener("mousedown", dn.widget_mouse_down);
    translate(dn.el.the_widget, 0, 0);
    dn.el.the_widget.style.display = "";
    dn.el.widget_error.style.display = "none";
    dn.el.widget_content.addEventListener("mousedown", prevent_default_and_stop_propagation);
    var els = dn.el.widget_content.getElementsByTagName("input");
    for (var ii = 0; ii < els.length; ii++) els[ii].addEventListener("mousedown", stop_propagation);
    var els = dn.el.widget_content.getElementsByTagName("textarea");
    for (var ii = 0; ii < els.length; ii++) els[ii].addEventListener("mousedown", stop_propagation);
    dn.el.editor = document.getElementById("the_editor");
    dn.el.editor.innerHTML = "";
    dn.el.editor.addEventListener("contextmenu", function(e) {
        dn.show_error("See the list of keyboard shortcuts for copy/paste, select-all, and undo/redo.")
    });
    dn.editor = ace.edit("the_editor");
    dn.editor.setHighlightSelectedWord(true);
    dn.editor.getSession().addEventListener("change", dn.on_editor_change);
    dn.editor.addEventListener("input", dn.check_unsaved);
    dn.focus_editor = dn.editor.focus.bind(dn.editor);
    dn.focus_editor();
    dn.editor.setAnimatedScroll(true);
    ace.require("ace/ext/language_tools");
    dn.editor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: false
    });
    dn.editor.$blockScrolling = Infinity;
    dn.clipboard_tool.on_document_ready();
    dn.el.widget_menu = document.getElementById("widget_menu");
    dn.el.menu_open = document.getElementById("menu_open");
    dn.el.menu_find = document.getElementById("menu_find");
    dn.el.menu_help = document.getElementById("menu_help");
    dn.el.menu_file = document.getElementById("menu_file");
    dn.el.menu_general_settings = document.getElementById("menu_general_settings");
    dn.el.widget_menu.addEventListener("mousedown", prevent_default_and_stop_propagation);
    dn.menu_icon_from_pane_id = {};
    var els = dn.el.widget_menu.getElementsByClassName("widget_menu_icon");
    for (var ii = 0; ii < els.length; ii++) {
        els[ii].title = dn.menu_id_to_caption[els[ii].id];
        dn.menu_icon_from_pane_id["pane_" + els[ii].id.substr(5)] = els[ii]
    }
    dn.el.pane_clipboard = document.getElementById("pane_clipboard");
    dn.el.pane_permissions = document.getElementById("pane_permissions");
    document.getElementById("button_auth").addEventListener("click", dn.reauth_manual);
    dn.el.pane_file = document.getElementById("pane_file");
    dn.file_pane.on_document_ready();
    dn.el.menu_file.addEventListener("click", function() {
        dn.g_settings.set("pane", "pane_file")
    });
    dn.el.pane_general_settings = document.getElementById("pane_general_settings");
    dn.settings_pane.on_document_ready();
    dn.el.menu_general_settings.addEventListener("click", function() {
        dn.g_settings.set("pane", "pane_general_settings")
    });
    dn.el.pane_help = document.getElementById("pane_help");
    dn.help_pane.on_document_ready();
    dn.el.menu_help.addEventListener("click", function() {
        dn.g_settings.set("pane", "pane_help")
    });
    dn.el.pane_find = document.getElementById("pane_find");
    dn.find_pane.on_document_ready();
    dn.el.menu_find.addEventListener("click", function() {
        dn.g_settings.set("pane", "pane_find");
        dn.find_pane.focus_on_input()
    });
    dn.el.pane_open = document.getElementById("pane_open");
    dn.open_pane.on_document_ready();
    dn.el.menu_open.addEventListener("click", function() {
        dn.g_settings.set("pane", "pane_open")
    });
    dn.pr_file_loaded = new SpecialPromise;
    dn.g_settings.addEventListener("VALUE_CHANGED", dn.settings_changed);
    dn.make_keyboard_shortcuts();
    dn.load_default_settings();
    document.addEventListener("contextmenu", prevent_default);
    window.addEventListener("resize", dn.widget_apply_anchor);
    window.onbeforeunload = dn.query_unload;
    var params = window_location_to_params_object();
    dn.new_in_folder = undefined;
    if (params["state"]) {
        try {
            state = params["state"];
            state = state.replace(/,\s*}\s*$/, "}");
            var state = JSON.parse(state);
            if (state.action && state.action == "open" && state.ids && state.ids.length > 0) dn.the_file.file_id = state.ids[0];
            else if (state.folderId) dn.new_in_folder = state.folderId
        } catch (e) {
            dn.show_error("Bad URL. This will be treated as a new file.")
        }
    }
    dn.the_file.addEventListener("change", function(e) {
        switch (e.property) {
            case "title":
                dn.render_document_title();
                break;
            case "syntax":
                dn.set_editor_syntax();
                break;
            case "newline":
                dn.set_editor_newline();
                break;
            case "tabs":
                dn.set_editor_tabs();
                break
        }
    });
    dn.pr_auth.on_error(dn.handle_auth_error);
    dn.pr_auth.on_success(function() {
        dn.reauth_auto_delay = 0;
        dn.toggle_permission(false);
        dn.status.popup_active = 0;
        dn.status.authentication = 1;
        dn.show_status()
    });
    offline_simple.addEventListener("online", dn.pr_auth.resolve.bind(dn.pr_auth));
    until_success(function(succ, fail) {
        Promise.resolve(dn.pr_auth).then(dn.request_user_info).then(dn.show_user_info).then(succ, fail)
    }).before_retry(dn.filter_api_errors).then(function() {
        console.log("succeeded getting user info.")
    }).catch(function(err) {
        console.log("failed to load user info");
        console.dir(err);
        dn.show_error(dn.api_error_to_string(err))
    });
    if (dn.the_file.file_id) {
        dn.status.file_meta = 0;
        dn.status.file_body = 0;
        dn.status.user_wants_file = 1;
        dn.show_status();
        dn.editor.setReadOnly(true);
        var pr_meta = until_success(function(succ, fail) {
            Promise.resolve(dn.pr_auth).then(dn.request_file_meta).then(dn.show_file_meta).then(succ, fail)
        }).before_retry(dn.filter_api_errors).catch(function(err) {
            dn.status.file_meta = -1;
            dn.show_status();
            throw err
        });
        var pr_body = until_success(function(succ, fail) {
            Promise.resolve(dn.pr_auth).then(dn.request_file_body).then(dn.show_file_body).then(succ, fail)
        }).before_retry(dn.filter_api_errors).catch(function(err) {
            dn.status.file_body = -1;
            dn.show_status();
            throw err
        });
        Promise.all([pr_meta, pr_body]).then(function(vals) {
            console.log("succeeded loading file body and metadata.");
            dn.the_file.set({
                is_loaded: true
            });
            dn.pr_file_loaded.resolve();
            dn.show_status()
        }).catch(function(err) {
            console.log("failed to load file properly..");
            console.dir(err);
            dn.show_error(dn.api_error_to_string(err));
            document.title = "Drive Notepad";
            dn.g_settings.set("pane", "pane_help");
            dn.g_settings.set("pane_open", true)
        })
    } else {
        dn.show_status();
        dn.the_file.set({
            title: "untitled.txt",
            is_loaded: true
        });
        dn.g_settings.set("pane", "pane_file");
        dn.g_settings.set("pane_open", true)
    }
    until_success(function(succ, fail) {
        Promise.all([dn.pr_auth, dn.pr_realtime_loaded]).then(dn.request_app_data_document).then(dn.show_app_data_document).then(succ, fail)
    }).before_retry(dn.filter_api_errors).then(function() {
        console.log("succeeded loading settings")
    }).catch(function(err) {
        console.log("failed to load realtime settings.");
        console.dir(err);
        dn.show_error(dn.api_error_to_string(err))
    })
};
if (document.readyState != "loading" && document.getElementById("the_widget")) {
    dn.document_ready()
} else {
    document.addEventListener("DOMContentLoaded", dn.document_ready)
}
//# sourceMappingURL=all.build.map.js