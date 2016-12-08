(function(global) {
	var init,
		document = global.document,
		iArray = [],
		push = iArray.push,
		slice = iArray.slice;
	// 核心函数
	function jquery(selector) {
		return new jquery.fn.init(selector);
	}
	// 核心原型对象
	jquery.fn = jquery.prototype = {
		constructor: jquery,
		length: 0,
		// jquery原型上的each方法，是用来方便遍历jquery对象的。
		each: function(callback) {
			jquery.each(this, callback);
			return this;
		},
		get: function(index) {
			// // 防止index为数值的字符串 -1
			// index = +index;
			// index = index < 0 ? this.length + index : index;
			// return this[index];
			if (index == null) {
				return slice.call(this);
			}

			return index < 0 ? this[+index + this.length] : this[index];
		},
		eq: function(index) {
			// index = +index;
			// index = index < 0 ? this.length + index : index;
			// return jquery(this[index]);
			if (index == null) {
				return this;
			}
			var node = index < 0 ? this[+index + this.length] : this[index];
			return jquery(node);
		},
		first: function() {
			return this.eq(0);
		},
		last: function() {
			return this.eq(-1);
		},
		toArray: function() {
			return slice.call(this);
		},
		slice: function() {
			return jquery(slice.apply(this, arguments));
		}
	};
	init = jquery.fn.init = function(selector) {
		// 过滤无效值: null undefined '' false 
		if (!selector) {
			return this;
		}
		// string : 用伪数组方式存储用户创建或查询出来的dom元素
		else if (jquery.isString(selector)) {
			// html 字符串
			if (jquery.isHTML(selector)) {
				push.apply(this, jquery.parseHTML(selector));
				// for(var i=0,l=len;i<l;i++;this.length++){
				// 	this[this.length] = target[i];
				// }			
			} else { // 选择器   // NodeList -> 伪数组
				push.apply(this, document.querySelectorAll(selector));
			}
		}
		// dom -> single node
		else if (jquery.isDOM(selector)) {
			this[0] = selector;
			this.length = 1;
		}
		// dom数组 || dom伪数组对象 （NodeList HTMLCollection）
		else if (jquery.isArrayLike(selector)) {
			push.apply(this, selector);
		}
		// function
		else if (jquery.isFunction(selector)) {
			// 1. 如果此时dom树已加载完毕
			// 直接执行selector函数
			if (jquery.isReady) {
				selector();
			} else { // 2. 否则
				if (global.addEventListener) {
					// a:如果支持DOMContentLoaded这个事件
					// 就用此事件监听dom加载是否完成
					document.addEventListener('DOMContentLoaded', function() {
						jquery.isReady = true;
						selector();
					});
				} else {
					// b: 如果支持onreadystatechange事件
					// 就用该事件监听dom加载是否完成
					document.attachEvent('onreadystatechange', function() {
						jquery.isReady = true;
						selector();
					});
				}
			}
		}
	};
	// 实现init对象继承自jquery.prototype
	init.prototype = jquery.fn;
	// 方便用户扩展jquery函数和原型
	// 使用了拷贝继承方式
	// jquery.extend = jquery.fn.extend = function(source, target) {
	// 	var k;
	// 	// 如果target为null 或者 undefined，就向this上扩展成员
	// 	// 否则就向target对象上扩展
	// 	if(target == undefined){
	// 		target = this;
	// 	}
	// 	for (k in source) {
	// 		target[k] = source[k]
	// 	}
	// };

	jquery.extend = jquery.fn.extend = function() {
		var k,
			target,
			len = arguments.length;

		if (arguments.length === 1) {
			// 如果只传入一个参数，那么扩展对象为this
			target = this;
			len = 2; // 让下面的循环要执行一次
		} else {
			// 否则扩展对象为最后一个实参对象
			target = arguments[len - 1];
		}

		for (var i = 0; i < len - 1; i++) {
			for (k in arguments[i]) {
				target[k] = arguments[i][k];
			}
		}

	};

	// 给jquery函数添加isReady属性判断dom树是否加载完毕
	jquery.isReady = false;
	// 类型判断方法
	jquery.extend({
		isString: function(obj) {
			return !!obj && typeof obj === 'string';
		},
		isHTML: function(obj) {
			obj = jquery.trim(obj);
			return !!obj && obj.charAt(0) === '<' && obj.charAt(obj.length - 1) === '>' &&
				obj.length >= 3;
		},
		isFunction: function(obj) {
			return !!obj && typeof obj === 'function';
		},
		isDOM: function(obj) {
			return !!obj && !!obj.nodeType;
		},
		isArrayLike: function(obj) {
			// 过滤基本数据类型 以及 无效值（null undefined）
			if (!obj || typeof obj !== 'object') {
				return false;
			}
			// 过滤函数和global
			if (jquery.isFunction(obj) || jquery.isGlobal(obj)) {
				return false;
			}
			var type = obj instanceof Array ? 'array' : 'object',
				length = 'length' in obj && obj.length;
			return type === 'array' || length === 0 ||
				typeof length === 'number' && length > 0 && (length - 1) in obj;
		},
		isGlobal: function(obj) {
			return !!obj && obj.window === obj;
		}
	});

	// 工具类方法
	jquery.extend({
		parseHTML: function(html) {
			var ret = [],
				div = document.createElement('div');
			div.innerHTML = html;
			for (var elem = div.firstChild; elem; elem = elem.nextSibling) {
				if (elem.nodeType === 1) {
					ret.push(elem);
				}
			}
			return ret;
		},
		trim: function(str) {
			if (str == null) {
				return '';
			} else {
				return (str + '').replace(/^\s+|\s+$/g, '');
			}
		},
		each: function(obj, callback) {
			var i = 0,
				l = obj.length;
			for (; i < l; i++) {
				if (callback.call(obj[i], obj[i], i) === false) break;
			}
		}
	});

	// DOM Operation
	jquery.unique = function(arr) {
		var ret = [];
		jquery.each(arr, function(v) {
			if (ret.indexOf(v) === -1) {
				ret.push(v);
			}
		});
		return ret;
	};
	jquery.fn.extend({
		appendTo: function(target) {
			var node,
				ret = [];
			// 1：统一target类型
			target = jquery(target);
			// 2: 先遍历this，在遍历 target
			this.each(function(source) {
				target.each(function(elem, i) {
					// 如果遍历target元素不是第一项，就要拷贝source节点
					node = i === 0 ? source : source.cloneNode(true);
					ret.push(node);
					elem.appendChild(node);
				});
			});
			return jquery(ret);
		},
		append: function(source) {
			// 1: 统一source类型，为jquery对象
			source = jquery(source);
			// 2: source调用appendTo方法将自己本身上的所有dom节点依次添加到this对象上的
			// 		所有dom元素上
			source.appendTo(this);
			// 实现链式编程
			return this;
		},
		// $('<p><p><p>').prependTo('div')
		prependTo: function(target) {
			var node,
				ret = [],
				firstChild,
				self = this;
			// 1: 统一target类型，为jquery对象
			target = jquery(target);
			target.each(function(elem, i) {
				// 临时缓存当前目标dom元素elem的第一个子节点
				firstChild = elem.firstChild;
				self.each(function(source) {
					node = i === 0 ? source : source.cloneNode(true);
					ret.push(node);
					elem.insertBefore(node, firstChild);
				});
			});
			return jquery(ret);
		},
		prepend: function(source) {
			source = jquery(source);
			source.prependTo(this);
			return this;
		},
		empty: function() {
			return this.each(function() {
				this.innerHTML = '';
			});
		},
		remove: function() {
			return this.each(function() {
				this.parentNode.removeChild(this);
			});
		},
		next: function() {
			var ret = [];
			this.each(function(elem) {
				// 遍历当前elem元素的所有下一个兄弟节点			
				while (elem = elem.nextSibling) {
					// 如果当前兄弟节点类型为元素
					if (elem.nodeType === 1) {
						// 就将当前的兄弟节点保存到ret，并结束循环
						ret.push(elem);
						break;
					}
				}
				// elem = elem.nextSibling;
				// while(elem && elem.nodeType !== 1){
				// 	elem = elem.nextSibling;
				// }
				// ret.push(elem);
			});
			return jquery(jquery.unique(ret));
		},
		nextAll: function() {
			var ret = [];
			this.each(function(elem) {
				while (elem = elem.nextSibling) {
					if (elem.nodeType === 1) {
						ret.push(elem);
					}
				}
			});
			return jquery(jquery.unique(ret));
		},
		prev: function() {
			var ret = [];
			this.each(function(elem) {
				while (elem = elem.previousSibling) {
					if (elem.nodeType === 1) {
						ret.push(elem);
						break;
					}
				}
			});
			return jquery(jquery.unique(ret));
		},
		prevAll: function() {
			var ret = [];
			this.each(function(elem) {
				while (elem = elem.previousSibling) {
					if (elem.nodeType === 1) {
						ret.push(elem);
					}
				}
			});
			return jquery(jquery.unique(ret));
		},
		before: function(newNodes) {
			var elem;
			newNodes = jquery(newNodes);
			return this.each(function(node, i) {
				newNodes.each(function(newNode) {
					elem = i === 0 ? newNode : newNode.cloneNode(true);
					node.parentNode.insertBefore(elem, node);
				});
			});
		},
		after: function(newNodes) {
			var elem, nextSibling;
			newNodes = jquery(newNodes);
			return this.each(function(node, i) {
				nextSibling = node.nextSibling;
				newNodes.each(function(newNode) {
					elem = i === 0 ? newNode : newNode.cloneNode(true);
					node.parentNode.insertBefore(elem, nextSibling);
				});
			});
		},
		parents: function() {
			var ret = [],
				parent;
			this.each(function(elem) {
				parent = elem.parentNode;
				if (!!parent && ret.indexOf(parent) === -1) {
					ret.push(parent);
				}
			});
			return jquery(ret);
		}
	});

	// attribute module
	jquery.propFix = {
		"class": "className",
		"for": "htmlFor"
	};
	jquery.each([
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function(v) {
		jquery.propFix[v.toLowerCase()] = v;
	});
	// console.log(jquery.propFix);
	jquery.fn.extend({
		attr: function(name, value) {
			// 如果value为undefined，默认认为只传入name参数，表示获取属性值
			// 默认获取jquery对象上第一个dom元素的属性值，如果没有就返回undefined值。
			if (value == undefined) {
				return this.get(0) ? this.get(0).getAttribute(name) : undefined;
			}
			// 如果value不为undefined，此时就是给jquery对象上的每一个dom元素设置属性值
			// 遍历每一个dom元素，使用setAttribute设置属性值
			return this.each(function(elem) {
				elem.setAttribute(name, value);
			});
			// return this;
		},
		prop: function(name, value) {
			// 首先判断name是否有映射关系
			name = jquery.propFix[name] ? jquery.propFix[name] : name;
			if (value == undefined) {
				return this.get(0) ? this.get(0)[name] : undefined;
			}
			return this.each(function(elem) {
				elem[name] = value;
			});
		},
		html: function(html) {
			if (html == undefined) {
				return this.get(0) ? this.get(0).innerHTML : null;
			}
			return this.each(function(elem) {
				elem.innerHTML = html;
			});
		},
		text: function(txt) {
			if (txt == undefined) {
				// 1. 如果this具有dom元素，并且支持textContent属性
				// 		就返回this上的第一个dom元素的textContext属性值
				// 	  	若不支持extContent属性，就返回this上的第一个dom元素的innerText属性值
				// 		
				// 2. 如果没有dom元素就返回null
				return this.get(0) ? (this.get(0).textContent ?
					this.get(0).textContent : this.get(0).innerText) : null;
			}
			return this.each(function(elem) {
				if (elem.textContent) {
					elem.textContent = txt;
				} else {
					elem.innerText = txt;
				}
			});
		},
		val: function(value) {
			if (value == undefined) {
				return this.get(0) ? this.get(0).value : null;
			}
			return this.each(function(elem) {
				elem.value = value;
			});
		}
	});

	// css module
	jquery.fn.extend({
		css: function(name, value) {
			// 1: 只给name传参
			if (value == undefined) {
				// a: 类型为对象: 给每一个dom元素同时设置多个样式
				if (typeof name === 'object') {
					return this.each(function(elem) {
						for (var k in name) {
							elem.style[k] = name[k];
						}
					});
				} else { // b: 类型为字符串
					return this.get(0) ?
						(global.getComputedStyle ?
							global.getComputedStyle(this.get(0))[name] :
							this.get(0).currentStyle[name]) :
						null;
				}
			} else { // 2: 给name和value都传参
				return this.each(function(elem) {
					elem.style[name] = value;
				});
			}
		},
		addClass: function(className) {
			return this.each(function(elem) {
				if ((' ' + elem.className + ' ').indexOf(' ' + className + ' ') === -1) {
					elem.className = jquery.trim(elem.className + ' ' + className);
				}
			});
		},
		removeClass: function(className) {
			return this.each(function(elem) {
				elem.className = jquery.trim((' ' + elem.className + ' ')
					.replace(' ' + className + ' ', ' '));
			});
		},
		hasClass: function(className) {
			return this.get(0) ? (
				(' ' + this.get(0).className + ' ').indexOf(' ' + className + ' ') === -1 ?
				false : true) : false;
		},
		toggleClass: function(className) {
			return this.each(function(elem) {
				// 将当前遍历到的dom元素，转换为jquery对象
				// 就可以使用addClass和removeClass方法
				var $elem = jquery(elem);
				// 如果当前dom元素具有指定的样式类，就将其删除
				if ($elem.hasClass(className)) {
					$elem.removeClass(className);
				} else { // 否则，就添加指定的样式类
					$elem.addClass(className);
				}
			});
		}
	});

	// event module
	jquery.fn.extend({
		on: function(type, callback) {
			return this.each(function(elem) {
				if (document.addEventListener) {
					elem.addEventListener(type, callback);
				} else {
					elem.attachEvent('on' + type, callback);
				}
			});
		},
		off: function(type, callback) {
			return this.each(function(elem) {
				if (document.removeEventListener) {
					elem.removeEventListener(type, callback);
				} else {
					elem.detachEvent('on' + type, callback);
				}
			});
		}
	});

	// 快捷的事件绑定方法['click', 'dblclick', 'mouseover', 'mouseout',...]
	jquery.each(('click dblclick mouseover mouseout mouseenter mouseleave mousedown mouseup ' +
		'keydown keyup keypress blur focus').split(' '), function(type) {
		jquery.fn[type] = function(callback) {
			return this.on(type, callback);
		};
	});

	// Ajax模块
	function createRequest() {
		return window.XMLHttpRequest ? new window.XMLHttpRequest() :
			new window.ActiveXObject('XMLHTTP');
	}

	function formatData(data) {
		var k,
			ret = [];
		for (k in data) {
			ret.push(window.encodeURIComponent(k) + '=' +
				window.encodeURIComponent(data[k]));
		}
		ret.push(('_=' + Math.random()).replace('.', ''));
		return ret.join('&');
	}

	// Ajax请求的默认设置
	jquery.AjaxSettings = {
		url: '',
		type: 'GET',
		data: null,
		async: true,
		dataType: 'json',
		timeout: null,
		contentType: 'application/x-www-form-urlencoded'
	}

	// Ajax请求
	function Ajax(options) {
		var xhr,
			context = {},
			url,
			postData;
		// 过滤无效的参数
		if (!options || !options.url) {
			console.warn('参数异常.');
			return;
		}

		// 1：创建请求
		xhr = createRequest();

		// 将默认设置和用户设置合并到context对象
		jquery.extend(jquery.AjaxSettings, options, context);
		// postData存储发送的数据
		postData = context.data = formatData(context.data || {});
		context.type = context.type.toUpperCase();
		// 如果是get请求，将发送的数据拼接到url上
		// 并设置postData为null
		if (context.type === 'GET') {
			url = context.url + '?' + postData;
			postData = null;
		} else { // 如果是post请求，设置请求头信息
			xhr.setRequestHeader('Content-Type', context.contentType);
		}
		// 3：与服务器建立连接
		xhr.open(context.type, url, context.async);

		// 4：监听状态
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) {
					// 如果指定的数据格式为json，就转换为json对象
					// 否则就直接返回文本
					var data = context.dataType.toLowerCase() === 'json' ?
						JSON.parse(xhr.responseText) :
						xhr.responseText;
					context.success && context.success(data, context, xhr);
				} else {
					context.fail && context.fail({
						"errorCode": xhr.status,
						"message": "请求超时."
					})
				}
			}
		};
		// 5：发送请求
		xhr.send(postData);
	}

	// 跨域请求--JSONP

	function Jsonp(options) {
		var context = {},
			scriptElem,
			headElem,
			callbackName;
		// 过滤无效参数
		if (!options.url || !options.callback) {
			console.warn('参数异常.');
			return;
		}

		jquery.extend(jquery.AjaxSetting, options, context);
		// 1
		scriptElem = document.createElement('script');
		headElem = document.getElementsByTagName('head')[0];

		// 2
		headElem.appendChild(scriptElem);

		// 3
		callbackName = ('jsonp_' + Math.random()).replace('.', '');
		context.data = context.data || {};
		context.data[context.callback] = callbackName;
		window[callbackName] = function(data) {
			// 杀驴
			headElem.removeChild(scriptElem);
			delete window[callbackName];
			// 清除超时的延时函数
			window.clearTimeout(scriptElem.timerId);

			context.success && context.success(data);
		};

		// 4
		context.data = formatData(context.data);

		// 5
		context.url += '?' + context.data;

		// 6
		if (context.timeout) {
			scriptElem.timerId = window.setTimeout(function() {
				// 杀驴
				headElem.removeChild(scriptElem);
				delete window[callbackName];

				context.fail && context.fail({
					"message": "请求超时."
				});
			}, context.timeout);
		}

		// 7 发送请求
		scriptElem.src = context.url;

	}

	jquery.extend({
		Ajax: function(options) {
			if (!options || !options.url) {
				console.warn('参数异常.');
				return;
			}
			// JSONP
			if(options.dataType && options.dataType.toLowerCase() === 'jsonp'){
				Jsonp(options);
			} else {
				Ajax(options);
			}
		}
	});


	// 兼容IE8 array indexOf方法
	(function() {
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function(value) {
				for (var i = 0, l = this.length; i < l; i++) {
					if (this[i] === value) return i;
				}
				return -1;
			}
		}
	}());

	global.$ = global.jquery = jquery;
}(window));