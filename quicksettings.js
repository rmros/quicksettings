(function() {
	var QuickSettings = {
		_topZ: 1,

		_panel: null,
		_titleBar: null,
		_content: null,
		_startX: 0,
		_startY: 0,
		_hidden: false,
		_collapsed: false,
		_controls: null,
		_keyCode: -1,
		_draggable: true,
		_collapsible: true,

		create: function(x, y, title) {
			var obj = Object.create(this);
			obj._init(x, y, title);
			return obj;
		},

		_init: function(x, y, title) {
			this._bindHandlers();
			this._createPanel(x, y);
			this._createTitleBar(title || "QuickSettings");
			this._createContent();

			document.body.appendChild(this._panel);
		},

		_bindHandlers: function() {
			this._startDrag = this._startDrag.bind(this);
			this._drag = this._drag.bind(this);
			this._endDrag = this._endDrag.bind(this);
			this._doubleClickTitle = this._doubleClickTitle.bind(this);
			this._onKeyUp = this._onKeyUp.bind(this);
		},

		_createPanel: function(x, y) {
			this._panel = document.createElement("div");
			this._panel.className = "msettings_main";
			this.setPosition(x || 0, y || 0);
			this._controls = {};
		},

		_createTitleBar: function(text) {
			this._titleBar = document.createElement("div");
			this._titleBar.textContent = text;
			this._titleBar.className = "msettings_title_bar";

			this._titleBar.addEventListener("mousedown", this._startDrag);
			this._titleBar.addEventListener("dblclick", this._doubleClickTitle);

			this._panel.appendChild(this._titleBar);
		},

		_createContent: function() {
			this._content = document.createElement("div");
			this._content.className = "msettings_content";
			this._panel.appendChild(this._content);
		},

		setPosition: function(x, y) {
			this._panel.style.left = x + "px";
			this._panel.style.top = y + "px";
		},

		setSize: function(w, h) {
			this._panel.style.width = w + "px";
			this._content.style.width = w + "px";
			this._content.style.height = (h - this._titleBar.offsetHeight) + "px";
		},

		setDraggable: function(draggable) {
			this._draggable = draggable;
			if(this._draggable || this._collapsible) {
				this._titleBar.style.cursor = "pointer";
			}
			else {
				this._titleBar.style.cursor = "default";
			}
		},

		setCollapsible: function(collapsible) {
			this._collapsible = collapsible;
			if(this._draggable || this._collapsible) {
				this._titleBar.style.cursor = "pointer";
			}
			else {
				this._titleBar.style.cursor = "default";
			}
		},

		_startDrag: function(event) {
			this._panel.style.zIndex = ++QuickSettings._topZ;
			if(this._draggable) {
				document.body.addEventListener("mousemove", this._drag);
				document.body.addEventListener("mouseup", this._endDrag);
				this._startX = event.clientX;
				this.startY = event.clientY;
			}
			event.preventDefault();
		},

		_drag: function(event) {
			var x = parseInt(this._panel.style.left),
				y = parseInt(this._panel.style.top),
				mouseX = event.clientX,
				mouseY = event.clientY;

			this.setPosition(x + mouseX - this._startX, y + mouseY - this.startY);
			this._startX = mouseX;
			this.startY = mouseY;
			event.preventDefault();
		},

		_endDrag: function(event) {
			document.body.removeEventListener("mousemove", this._drag);
			document.body.removeEventListener("mouseup", this._endDrag);
			event.preventDefault();
		},

		_doubleClickTitle: function() {
			if(this._collapsible) {
				this.toggleCollapsed();
			}
		},

		toggleCollapsed: function() {
			if(this._collapsed) {
				this.expand();
			}
			else {
				this.collapse();
			}
		},

		collapse: function() {
			this._panel.removeChild(this._content);
			this._collapsed = true;
		},

		expand: function() {
			this._panel.appendChild(this._content);
			this._collapsed = false;
		},

		hide: function() {
			this._panel.style.visibility = "hidden";
			this._hidden = true;
		},

		show: function() {
			this._panel.style.visibility = "visible";
			this._hidden = false;
		},

		_createContainer: function() {
			var container = document.createElement("div");
			container.className = "msettings_container";
			return container;
		},

		_createLabel: function(title) {
			var label = document.createElement("div");
			label.innerHTML = title;
			label.className = "msettings_label";
			return label;
		},

		setKey: function(char) {
			this._keyCode = char.toUpperCase().charCodeAt(0);
			document.body.addEventListener("keyup", this.onKeyUp);
		},

		_onKeyUp: function(event) {
			if(event.keyCode === this._keyCode) {
				this.toggleVisibility();
			}
		},

		toggleVisibility: function() {
			if(this._hidden) {
				this.show();
			}
			else {
				this.hide();
			}
		},

		addRange: function(title, min, max, value, step, callback) {
			var container = this._createContainer();

			var range = document.createElement("input");
			range.type = "range";
			range.id = title;
			range.min = min || 0;
			range.max = max || 100;
			// range.step = step || 1;
			range.value = value || 0;
			range.className = "msettings_range";

			var label = this._createLabel("<b>" + title + ":</b> " + range.value);

			container.appendChild(label);
			container.appendChild(range);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				range: range,
				label: label,
				callback: callback
			};

			var eventName = "input";
			if(this._isIE()) {
				eventName = "change";
			}
			range.addEventListener(eventName, function() {
				label.innerHTML = "<b>" + title + ":</b> " + range.value;
				if(callback) {
					callback(parseFloat(range.value));
				}
			});
		}, 

		_isIE: function() {
			if(navigator.userAgent.indexOf("rv:11") != -1) {
				return true;
			}
			if(navigator.userAgent.indexOf("MSIE") != -1) {
				return true;
			}
			return false;
		},

		getRangeValue: function(title) {
			return this._controls[title].range.value;
		},

		setRangeValue: function(title, value) {
			var control = this._controls[title];
			control.range.value = value;
			control.label.innerHTML = "<b>" + title + ":</b> " + control.range.value;
			if(control.callback) {
				control.callback(control.range.value);
			}
		},

		setRangeParameters: function(title, min, max, step) {
			var control = this._controls[title];
			control.range.min = min;
			control.range.max = max;
			control.range.step = step;
		},

		addBoolean: function(title, value, callback) {
			var container = this._createContainer();

			var label = document.createElement("span");
			label.className = "msettings_checkbox_label";
			label.textContent = title;

			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.id = title;
			checkbox.checked = value;
			checkbox.className = "msettings_checkbox";

			container.appendChild(checkbox);
			container.appendChild(label);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				checkbox: checkbox,
				callback: callback
			};

			checkbox.addEventListener("change", function() {
				if(callback) {
					callback(checkbox.checked);
				}
			});
			label.addEventListener("click", function() {
				checkbox.checked = !checkbox.checked;
				if(callback) {
					callback(checkbox.checked);
				}
			});
		},

		getBoolean: function(title) {
			return this._controls[title].checkbox.checked;
		},

		setBoolean: function(title, value) {
			this._controls[title].checkbox.checked = value;
			if(control.callback) {
				this._controls[title].callback(value);
			}
		},

		addButton: function(title, callback) {
			var container = this._createContainer();

			var button = document.createElement("input");
			button.type = "button";
			button.id = title;
			button.value = title;
			button.className = "msettings_button";

			container.appendChild(button);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				button: button
			}

			button.addEventListener("click", function() {
				if(callback) {
					callback(button);
				}
			});
		},

		addColor: function(title, color, callback) {
			var container = this._createContainer();
			var label = this._createLabel("<b>" + title + ":</b> " + color);

			var colorInput = document.createElement("input");
			try {
				colorInput.type = "color";
			}
			catch(e) {
				colorInput.type = "text";
			}
			colorInput.id = title;
			colorInput.value = color || "#ff0000";
			colorInput.className = "msettings_color";

			container.appendChild(label);
			container.appendChild(colorInput);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				colorInput: colorInput,
				label: label,
				callback: callback
			};

			colorInput.addEventListener("input", function() {
				label.innerHTML = "<b>" + title + ":</b> " + colorInput.value;
				if(callback) {
					callback(colorInput.value);
				}
			});
		},

		getColor: function(title) {
			return this._controls[title].colorInput.value;
		},

		setColor: function(title, value) {
			var control = this._controls[title];
			control.colorInput.value = value;
			control.label.innerHTML = "<b>" + title + ":</b> " + control.colorInput.value;
			if(control.callback) {
				control.callback(control.colorInput.value);
			}
		},

		addText: function(title, text, callback) {
			var container = this._createContainer();
			var label = this._createLabel("<b>" + title + "</b>");

			var textInput = document.createElement("input");
			textInput.type = "text";
			textInput.id = title;
			textInput.value = text || "";

			container.appendChild(label);
			container.appendChild(textInput);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				textInput: textInput,
				label: label,
				callback: callback
			}

			textInput.addEventListener("input", function() {
				if(callback) {
					callback(textInput.value);
				}
			});
		}, 

		getText: function(title) {
			return this._controls[title].textInput.value;
		},

		setText: function(title, text) {
			var control = this._controls[title];
			control.textInput.value = text;
			if(control.callback) {
				control.callback(text);
			}
		},

		addInfo: function(title, info) {
			var container = this._createContainer();
			container.innerHTML = info;
			this._controls[title] = {
				container: container
			};
			this._content.appendChild(container);
		},

		addDropDown: function(title, items, callback) {
			var container = this._createContainer();

			var label = this._createLabel("<b>" + title + "<b>");
			var select = document.createElement("select");
			for(var i = 0; i < items.length; i++) {
				var option = document.createElement("option");
				option.label = items[i];
				select.add(option);
			};
			select.addEventListener("change", function() {
				var index = select.selectedIndex,
					options = select.options;

				if(callback) {
					callback({
						index: index,
						value: options[index].label
					});
				}
			});
			container.appendChild(label);
			container.appendChild(select);
			this._content.appendChild(container);

			this._controls[title] = {
				container: container,
				select: select,
				label: label,
				callback: callback
			};
		},

		getDropDownValue: function(title) {
			var control = this._controls[title],
				select = control.select,
				index = select.selectedIndex,
				options = select.options;
			return {
				index: index,
				value: options[index].label
			}
		},

		setDropDownIndex: function(title, index) {
			var control = this._controls[title],
				options = control.select.options;
			control.select.selectedIndex = index;
			if(control.callback) {
				control.callback({
					index: index,
					value: options[index].label
				});
			}
		},

		getInfo: function(title) {
			return this._controls[title].container.innerHTML;
		},

		setInfo: function(title, info) {
			this._controls[title].container.innerHTML = info;
		},

		removeControl: function(title) {
			var container = this._controls[title].container;
			if(container.parentElement) {
				container.parentElement.removeChild(container);
			}
			this._controls[title] = null;
		}
	};

	if (typeof define === "function" && define.amd) {
	    define(QuickSettings);
	} else {
	   window.QuickSettings = QuickSettings;
	}

}());
