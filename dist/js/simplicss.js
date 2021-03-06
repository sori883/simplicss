(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery'), require('popper.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'jquery', 'popper.js'], factory) :
  (global = global || self, factory(global.simplicss = {}, global.jQuery, global.Popper));
}(this, (function (exports, $, Popper) { 'use strict';

  $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
  Popper = Popper && Object.prototype.hasOwnProperty.call(Popper, 'default') ? Popper['default'] : Popper;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  /**
   * --------------------------------------------------------------------------
   * simplicss (v4.3.1): util.js
   * Licensed under MIT (https://github.com/twbs/simplicss/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Private TransitionEnd Helpers
   * ------------------------------------------------------------------------
   */
  // transitionendイベント用で変数になってるのはprefixをつけるから？

  var TRANSITION_END = 'transitionend';
  var MAX_UID = 1000000;
  var MILLISECONDS_MULTIPLIER = 1000; // Shoutout AngusCroll (https://goo.gl/pxwQGp)
  // オブジェクトの型を判定する

  function toType(obj) {
    return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
  } //


  function getSpecialTransitionEndEvent() {
    return {
      bindType: TRANSITION_END,
      delegateType: TRANSITION_END,
      handle: function handle(event) {
        if ($(event.target).is(this)) {
          return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
        }

        return undefined; // eslint-disable-line no-undefined
      }
    };
  } // transitionの遷移時間を引数でもらう


  function transitionEndEmulator(duration) {
    var _this = this;

    var called = false; // 呼び出しもとのエレメントでTRANSITION_ENDで一度だけ実行

    $(this).one(Util.TRANSITION_END, function () {
      // コールバックをtrueにする
      called = true;
    });
    setTimeout(function () {
      // falseだったらtriggerTransitionEndを実行する
      if (!called) {
        Util.triggerTransitionEnd(_this);
      }
    }, duration); // settimeoutの時間は引数の遷移時間
    // エレメントを返す

    return this;
  }

  function setTransitionEndSupport() {
    // jQueryのカスタムプラグインを作成
    $.fn.emulateTransitionEnd = transitionEndEmulator;
    $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
  }
  /**
   * --------------------------------------------------------------------------
   * Public Util Api
   * --------------------------------------------------------------------------
   */


  var Util = {
    TRANSITION_END: 'scTransitionEnd',
    // prefixはNAME(tooltipだとtooltipとか)
    getUID: function getUID(prefix) {
      do {
        // eslint-disable-next-line no-bitwise
        prefix += ~~(Math.random() * MAX_UID); // ランダムな値を生成してprefixに追加
      } while (document.getElementById(prefix)); // 一致するIDの分だけ続行


      return prefix;
    },
    getSelectorFromElement: function getSelectorFromElement(element) {
      // 引数elementのdata-target属性の値を取得
      var selector = element.getAttribute('data-target'); // data-targetが存在しないか#の場合

      if (!selector || selector === '#') {
        // elementのhref属性の値を取得
        var hrefAttr = element.getAttribute('href'); // hrefAttrが存在していてかつ、#かどうかを判定して、trueならhrefAttrをtrimして返す。falseなら、空文字を入れる
        // trim: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/trim

        selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : '';
      }

      try {
        // html要素内にselectorで指定されている要素が存在するか判定
        // 存在していた場合、selectorを返す
        // なかったらnullを返す
        return document.querySelector(selector) ? selector : null;
      } catch (err) {
        // エラーになったらnullを返す
        return null;
      }
    },
    // 要素から遷移時間を取得
    getTransitionDurationFromElement: function getTransitionDurationFromElement(element) {
      // エレメントがなかったら0を返す
      if (!element) {
        return 0;
      } // transition-durationとtransition-delayの値を取得


      var transitionDuration = $(element).css('transition-duration');
      var transitionDelay = $(element).css('transition-delay'); // 浮動小数点を取得

      var floatTransitionDuration = parseFloat(transitionDuration);
      var floatTransitionDelay = parseFloat(transitionDelay); // cssプロパティ、値がなければ0を返す

      if (!floatTransitionDuration && !floatTransitionDelay) {
        return 0;
      } // 複数値が指定されてたら最初の1つだけ取得する


      transitionDuration = transitionDuration.split(',')[0];
      transitionDelay = transitionDelay.split(',')[0]; // 変化にかかる時間(transitionDuration)と変化が始める時間(transitionDelay)を足して1000をかけて(秒にする)返す

      return (parseFloat(transitionDuration) + parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER; // ×1000する
    },
    reflow: function reflow(element) {
      // 要素の高さを取得する
      // heightとpaddingとborderの合計値
      return element.offsetHeight;
    },
    // 引数エレメントでtrainsition_endイベントを実行する
    triggerTransitionEnd: function triggerTransitionEnd(element) {
      $(element).trigger(TRANSITION_END);
    },
    // TODO: Remove in v5
    supportsTransitionEnd: function supportsTransitionEnd() {
      return Boolean(TRANSITION_END);
    },
    // 引数がdom要素か判定する
    // 違う場合はundefinedを返す
    isElement: function isElement(obj) {
      return (obj[0] || obj).nodeType;
    },
    // configの値がDefaultType
    typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
      // default typeの分だけループ
      // dropdownだとoffset、flipなどなど
      for (var property in configTypes) {
        // Object.prototype.hasOwnPropertyはオブジェクトにpropertyがあるか判定する
        // offsetプロパティが、configTypesにあるか
        if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
          // configTypesからプロパティの値を取得(正規表現で使う文字列)
          var expectedTypes = configTypes[property]; // configの中からpropertyの値を取得

          var value = config[property]; // valueが存在してdom要素だった場合は文字列(element)を格納
          // falseの場合は型を判定して格納

          var valueType = value && Util.isElement(value) ? 'element' : toType(value); //  expectedTypesの正規表現に、valueTypeが一致しているか確認

          if (!new RegExp(expectedTypes).test(valueType)) {
            // 一致してなかったらthrowする
            throw new Error(componentName.toUpperCase() + ": " + ("Option \"" + property + "\" provided type \"" + valueType + "\" ") + ("but expected type \"" + expectedTypes + "\"."));
          }
        }
      }
    },
    findShadowRoot: function findShadowRoot(element) {
      // shadow domが関連付けされてないときはnullを返す
      if (!document.documentElement.attachShadow) {
        return null;
      } // elementのgetRootNodeがfunctionなら


      if (typeof element.getRootNode === 'function') {
        // elementのroot要素を取得
        var root = element.getRootNode(); // rootがshadowrootのインスタンスならrootを返す。
        // そうじゃない場合はnullを返す

        return root instanceof ShadowRoot ? root : null;
      } // elementがshadow domのインスタンス
      // つまりshadow domの要素だったら、elementを返す


      if (element instanceof ShadowRoot) {
        return element;
      } // shadow domのルートが探せない場合はnullを返す


      if (!element.parentNode) {
        return null;
      } // elementのparentNodeに対して同じ操作を繰り返す


      return Util.findShadowRoot(element.parentNode);
    },
    jQueryDetection: function jQueryDetection() {
      if (typeof $ === 'undefined') {
        throw new TypeError('simplicss\'s JavaScript requires jQuery. jQuery must be included before simplicss\'s JavaScript.');
      }

      var version = $.fn.jquery.split(' ')[0].split('.');
      var minMajor = 1;
      var ltMajor = 2;
      var minMinor = 9;
      var minPatch = 1;
      var maxMajor = 4;

      if (version[0] < ltMajor && version[1] < minMinor || version[0] === minMajor && version[1] === minMinor && version[2] < minPatch || version[0] >= maxMajor) {
        throw new Error('simplicss\'s JavaScript requires at least jQuery v1.9.1 but less than v4.0.0');
      }
    }
  };
  Util.jQueryDetection();
  setTransitionEndSupport();

  var NAME = 'alert';
  var VERSION = '0.5.2';
  var DATA_KEY = 'sc.alert'; // アラート閉じた時のイベントとかに使うみたい
  // http://bootstrap3.cyberlab.info/javascript/alerts-events.html

  var EVENT_KEY = "." + DATA_KEY; // イベントを無効にする用
  // https://getbootstrap.jp/docs/4.1/getting-started/javascript/

  var DATA_API_KEY = '.data-api'; // 他のフレームワークと名前衝突を回避する用

  var JQUERY_NO_CONFLICT = $.fn[NAME]; // アラート消す用

  var Selector = {
    DISMISS: '[data-dismiss="alert"]'
  }; // イベント用の名前
  // e.g. close.sc.alert

  var Event = {
    CLOSE: "close" + EVENT_KEY,
    CLOSED: "closed" + EVENT_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
  }; // htmlのクラス名

  var ClassName = {
    ALERT: 'alert',
    FADE: 'fade',
    SHOW: 'show'
  };

  var Alert = /*#__PURE__*/function () {
    function Alert(element) {
      this._element = element;
    } // バージョンのゲッター


    var _proto = Alert.prototype;

    // public method
    _proto.close = function close(element) {
      // このクラス内のthisはalertクラス
      // コンストラクタで取得したelement
      var rootElement = this._element; // closeにelementが引数で渡されていたら

      if (element) {
        // div.alertを取得
        rootElement = this._getRootElement(element);
      } // カスタムイベントを作成


      var customEvent = this._triggerCloseEvent(rootElement); // イベントがブラウザの処理を禁止していた場合は闇に葬り去る
      // http://www.jquerystudy.info/reference/events/isDefaultPrevented.html


      if (customEvent.isDefaultPrevented()) {
        return;
      } // showクラスを削除する
      // fadeクラスがなかった場合、要素を削除する


      this._removeElement(rootElement);
    } // this._elementを削除するみたい
    ;

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      this._element = null;
    } // private method
    // closeで使ってるやつ
    ;

    _proto._getRootElement = function _getRootElement(element) {
      // elementのdata-targetもしくはhrefで指定されているselectorを取得
      var selector = Util.getSelectorFromElement(element);
      var parent = false; // selectorがあった場合

      if (selector) {
        // data-targetもしくはhrefで指定されている要素を取得
        // 開始タグから終了タグまで持ってくるみたい
        parent = document.querySelector(selector);
      } // 上のifを通らなかったか通ってもnullが帰ってきた場合


      if (!parent) {
        // data-targetもしくはhrefが指定されてないので、一番近い.alertを取得する
        parent = $(element).closest("." + ClassName.ALERT)[0];
      }

      return parent;
    } // closeで使ってるやつ
    ;

    _proto._triggerCloseEvent = function _triggerCloseEvent(element) {
      // close.sc.alertイベントを定義
      var closeEvent = $.Event(Event.CLOSE);
      $(element).trigger(closeEvent); // closeイベントを発生
      // closeEvent返すんか

      return closeEvent;
    } // closeで使ってるやつ
    ;

    _proto._removeElement = function _removeElement(element) {
      var _this = this;

      // showクラスを削除
      $(element).removeClass(ClassName.SHOW); // fadeクラスを持ってなかった場合

      if (!$(element).hasClass(ClassName.FADE)) {
        // アラートを削除
        this._destroyElement(element);

        return; // eslint-disable-line no-useless-return
      } // 要素の変化にかかる時間を取得


      var transitionDuration = Util.getTransitionDurationFromElement(element);
      $(element) // .oneは一回だけ実行するイベント。TRANSITION_ENDはイベント名。
      // エレメントを削除してclosedイベントを実行する
      .one(Util.TRANSITION_END, function (event) {
        return _this._destroyElement(element, event);
      }) // util.jsのtransitionEndEmulatorを実行
      .emulateTransitionEnd(transitionDuration);
    } // _removeElementで使ってるやつ
    ;

    _proto._destroyElement = function _destroyElement(element) {
      $(element) // elementを。。。
      .detach() // elementを隔離
      .trigger(Event.CLOSED) // closedイベントを発生させる
      .remove(); // element削除
      // https://qiita.com/BRSF/items/1aa9d154bde497b0baa0#remove%E3%81%AE%E5%A0%B4%E5%90%88
    } // static
    ;

    Alert._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // elementを格納
        var $element = $(this); // elementのdata-sc.alert属性を取得

        var data = $element.data(DATA_KEY); // dataがなかったら

        if (!data) {
          // アラートをインスタンス化
          // thisはelement
          data = new Alert(this); // elementにdata-sc.alertを設定
          // 中身はdata

          $element.data(DATA_KEY, data);
        } // configがcloseだったら・・・・


        if (config === 'close') {
          // alert.close(element)になる
          data[config](this);
        }
      });
    };

    Alert._handleDismiss = function _handleDismiss(alertInstance) {
      return function (event) {
        // イベントがあったら
        if (event) {
          // イベントの動作を停止させる
          event.preventDefault();
        } // 引数で受け取ったalertインスタンスのcloseを実行
        // 引数はhtmlのbutton


        alertInstance.close(this);
      };
    };

    _createClass(Alert, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);

    return Alert;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Apiの定義
   * ------------------------------------------------------------------------
   */
  // ここがブラウザで使う部分みたい


  $(document).on(Event.CLICK_DATA_API, // click.sc.alert.data-api
  Selector.DISMISS, // [data-dismiss="alert"]
  Alert._handleDismiss(new Alert()) // staticのやつ実行するんだね
  );
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  // .alertは_jQueryInterface

  $.fn[NAME] = Alert._jQueryInterface; // .alert.ConstructorはAlert

  $.fn[NAME].Constructor = Alert; // .alert.noConflict
  // 衝突回避用

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Alert._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$1 = 'button';
  var VERSION$1 = '0.5.2';
  var DATA_KEY$1 = 'sc.button';
  var EVENT_KEY$1 = "." + DATA_KEY$1;
  var DATA_API_KEY$1 = '.data-api';
  var JQUERY_NO_CONFLICT$1 = $.fn[NAME$1];
  var ClassName$1 = {
    ACTIVE: 'active',
    BUTTON: 'btn',
    FOCUS: 'focus'
  };
  var Selector$1 = {
    DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
    DATA_TOGGLES: '[data-toggle="buttons"]',
    DATA_TOGGLE: '[data-toggle="button"]',
    DATA_TOGGLES_BUTTONS: '[data-toggle="buttons"] .btn',
    INPUT: 'input:not([type="hidden"])',
    ACTIVE: '.active',
    BUTTON: '.btn'
  };
  var Event$1 = {
    CLICK_DATA_API: "click" + EVENT_KEY$1 + DATA_API_KEY$1,
    FOCUS_BLUR_DATA_API: "focus" + EVENT_KEY$1 + DATA_API_KEY$1 + " " + ("blur" + EVENT_KEY$1 + DATA_API_KEY$1),
    LOAD_DATA_API: "load" + EVENT_KEY$1 + DATA_API_KEY$1
  };
  /**
   * ------------------------------------------------------------------------
   * クラス
   * ------------------------------------------------------------------------
   */

  var Button = /*#__PURE__*/function () {
    function Button(element) {
      this._element = element;
    } // バージョンのゲッター


    var _proto = Button.prototype;

    // toggleメソッド
    _proto.toggle = function toggle() {
      var triggerChangeEvent = true;
      var addAriaPressed = true; // '[data-toggle="buttons"]'をもつ要素の親要素を取得する

      var rootElement = $(this._element).closest(Selector$1.DATA_TOGGLES)[0]; // rootElementがあったら

      if (rootElement) {
        // hiddenじゃないinputを取得する
        var input = this._element.querySelector(Selector$1.INPUT); // inputがあった場合


        if (input) {
          // inputがradioだった場合
          if (input.type === 'radio') {
            // .classList.contains(クラス名)が存在するか確認する
            // radioがチェックされててかつ、.activeクラスが存在する場合。
            if (input.checked && this._element.classList.contains(ClassName$1.ACTIVE)) {
              // .activeなボタンを押したらfalseにする
              triggerChangeEvent = false;
            } else {
              // .activeを持つ要素を取得する。
              var activeElement = rootElement.querySelector(Selector$1.ACTIVE); // activeElementが存在してたら

              if (activeElement) {
                // .activeクラスを削除する
                $(activeElement).removeClass(ClassName$1.ACTIVE);
              }
            } // inputがcheckboxだったら

          } else if (input.type === 'checkbox') {
            // this._elementのタグ名が<label>でかつ、.activeクラスを持っていたら
            if (this._element.tagName === 'LABEL' && input.checked === this._element.classList.contains(ClassName$1.ACTIVE)) {
              triggerChangeEvent = false;
            }
          } else {
            // radioもしくはcheckboxじゃない場合、pointless/invalid checkedをinputに追加しちゃあかん
            triggerChangeEvent = false;
          } // .activeクラスを持っていない場合の処理


          if (triggerChangeEvent) {
            // アクティブを持っていないか確認
            input.checked = !this._element.classList.contains(ClassName$1.ACTIVE); // input要素に対してchangeを発動

            $(input).trigger('change');
          } // inputにfocusを当てる


          input.focus();
          addAriaPressed = false;
        }
      } // buttonがdisabled属性を持ってるまたは、disabledクラスを持っていた場合


      if (!(this._element.hasAttribute('disabled') || this._element.classList.contains('disabled'))) {
        // ボタンがinputじゃなかったら
        if (addAriaPressed) {
          // .activeがあったらaria-pressed属性にfalseなかったらtrue
          this._element.setAttribute('aria-pressed', !this._element.classList.contains(ClassName$1.ACTIVE));
        } // .activeクラスを持ってたら.activeを消す


        if (triggerChangeEvent) {
          $(this._element).toggleClass(ClassName$1.ACTIVE);
        }
      }
    } // this._elementを削除するみたい
    ;

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$1);
      this._element = null;
    } // Static
    ;

    Button._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // elementのdata-sc.buttonを取得
        var data = $(this).data(DATA_KEY$1); // dataがなかったら

        if (!data) {
          // buttonをインスタンス化
          // thisはエレメント
          data = new Button(this); // thisにdata-sc.alertを設定
          // 中身はボタンクラス

          $(this).data(DATA_KEY$1, data);
        } // configがtoggleだったら


        if (config === 'toggle') {
          // button.toggleになる
          data[config]();
        }
      });
    };

    _createClass(Button, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$1;
      }
    }]);

    return Button;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document) // click.sc.alert.data-api'と[data-toggle^="button"]'
  .on(Event$1.CLICK_DATA_API, Selector$1.DATA_TOGGLE_CARROT, function (event) {
    // イベント対象のelement
    var button = event.target; // イベント対象のelementが.btnを持ってたら

    if (!$(button).hasClass(ClassName$1.BUTTON)) {
      // .btnを持つ要素を取得する
      button = $(button).closest(Selector$1.BUTTON)[0];
    } // ボタンがない、ボタンがdisable属性またはクラスを持つ場合


    if (!button || button.hasAttribute('disabled') || button.classList.contains('disabled')) {
      // イベントを禁止にする
      event.preventDefault(); // firefoxのバグで指定しないとだめみたい
    } else {
      // hidden以外のinputボタンを取得
      var inputBtn = button.querySelector(Selector$1.INPUT); // inputボタンが存在してdisabled属性またはクラスを持ってたら

      if (inputBtn && (inputBtn.hasAttribute('disabled') || inputBtn.classList.contains('disabled'))) {
        // イベントを禁止にする
        event.preventDefault(); // firefoxのバグで指定しないとだめみたい

        return;
      } // ここわかりやすい
      // https://qiita.com/Chrowa3/items/b3e2961c4930abc1369b


      Button._jQueryInterface.call($(button), 'toggle');
    }
  }) // focus.sc.alert.data-api +  blur.sc.alert.data-api'と[data-toggle^="button"]'
  .on(Event$1.FOCUS_BLUR_DATA_API, Selector$1.DATA_TOGGLE_CARROT, function (event) {
    // button要素を取得する
    var button = $(event.target).closest(Selector$1.BUTTON)[0]; // button要素に対して、fucusクラスをつける
    // event,typeがfocusinならtrue、違うならfalse
    // trueなら絶対クラスを付与、falseなら削除

    $(button).toggleClass(ClassName$1.FOCUS, /^focus(in)?$/.test(event.type));
  }); // load.sc.alert.data-api'

  $(window).on(Event$1.LOAD_DATA_API, function () {
    // windowsロード時にボタンの状態を見て.activeを追加する
    // checkとかになってないのに.activeがついてたら削除する
    // data-toggle内のcheckboxとradioを見つける
    //  '[data-toggle="buttons"]をもつ .btn要素を全て取得する
    var buttons = [].slice.call(document.querySelectorAll(Selector$1.DATA_TOGGLES_BUTTONS)); // buttonsの数だけループ回すよ

    for (var i = 0, len = buttons.length; i < len; i++) {
      // ボタンのi番目
      var button = buttons[i]; // hidden以外のinputを取得

      var input = button.querySelector(Selector$1.INPUT); // inputがcheckされているか、checked属性を持っている場合

      if (input.checked || input.hasAttribute('checked')) {
        // .activeを追加する
        button.classList.add(ClassName$1.ACTIVE);
      } else {
        // check状態じゃなかったら削除
        button.classList.remove(ClassName$1.ACTIVE);
      }
    } //  全ての[data-toggle="button"]を取得する


    buttons = [].slice.call(document.querySelectorAll(Selector$1.DATA_TOGGLE));

    for (var _i = 0, _len = buttons.length; _i < _len; _i++) {
      var _button = buttons[_i]; // aria-pressedにtrueが指定されていたら

      if (_button.getAttribute('aria-pressed') === 'true') {
        _button.classList.add(ClassName$1.ACTIVE);
      } else {
        _button.classList.remove(ClassName$1.ACTIVE);
      }
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$1] = Button._jQueryInterface;
  $.fn[NAME$1].Constructor = Button;

  $.fn[NAME$1].noConflict = function () {
    $.fn[NAME$1] = JQUERY_NO_CONFLICT$1;
    return Button._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$2 = 'collapse';
  var VERSION$2 = '4.4.1';
  var DATA_KEY$2 = 'sc.collapse';
  var EVENT_KEY$2 = "." + DATA_KEY$2;
  var DATA_API_KEY$2 = '.data-api';
  var JQUERY_NO_CONFLICT$2 = $.fn[NAME$2];
  var Default = {
    toggle: true,
    parent: ''
  };
  var DefaultType = {
    toggle: 'boolean',
    parent: '(string|element)'
  };
  var Event$2 = {
    SHOW: "show" + EVENT_KEY$2,
    SHOWN: "shown" + EVENT_KEY$2,
    HIDE: "hide" + EVENT_KEY$2,
    HIDDEN: "hidden" + EVENT_KEY$2,
    CLICK_DATA_API: "click" + EVENT_KEY$2 + DATA_API_KEY$2
  };
  var ClassName$2 = {
    SHOW: 'show',
    COLLAPSE: 'collapse',
    COLLAPSING: 'collapsing',
    COLLAPSED: 'collapsed'
  };
  var Dimension = {
    WIDTH: 'width',
    HEIGHT: 'height'
  };
  var Selector$2 = {
    ACTIVES: '.show, .collapsing',
    DATA_TOGGLE: '[data-toggle="collapse"]'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Collapse = /*#__PURE__*/function () {
    function Collapse(element, config) {
      this._isTransitioning = false;
      this._element = element; // cofigを取得

      this._config = this._getConfig(config); // data-toggle="collapse"を持っていて、hrefもしくはdata-targetを持ってる要素を取得する

      this._triggerArray = [].slice.call(document.querySelectorAll("[data-toggle=\"collapse\"][href=\"#" + element.id + "\"]," + ("[data-toggle=\"collapse\"][data-target=\"#" + element.id + "\"]"))); // [data-toggle="collapse"]を持つ要素を全て取得する

      var toggleList = [].slice.call(document.querySelectorAll(Selector$2.DATA_TOGGLE)); // 取得した[data-toggle="collapse"]を持つ要素の数だけループする

      for (var i = 0, len = toggleList.length; i < len; i++) {
        // [data-toggle="collapse"]要素を取り出す
        var elem = toggleList[i]; // elemのhrefで指定した値を取得

        var selector = Util.getSelectorFromElement(elem); // セレクターで指定された(クリックされた)要素で指定されているhrefのelementを取得

        var filterElement = [].slice.call(document.querySelectorAll(selector)).filter(function (foundElem) {
          return foundElem === element;
        }); // selectorが存在していて、filterElementも存在していた場合

        if (selector !== null && filterElement.length > 0) {
          // this._selectorにselector(hrefの値)を入れる
          this._selector = selector; // this._triggerArrayにelem([data-toggle="collapse"]を持つ要素)を入れる

          this._triggerArray.push(elem);
        }
      } // this._config.parentが存在していたらgetParentを実行する
      // 存在していなかったnullを入れる


      this._parent = this._config.parent ? this._getParent() : null; // config.parentが存在していなかったら

      if (!this._config.parent) {
        // 開閉する要素が.showを持っているかによって
        // trigger要素に.collapsedとaria-expanded属性を付与したり削除したりする
        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
      } // cofig.toggleがtrueだった場合


      if (this._config.toggle) {
        // Collapse.toggleを実行
        this.toggle();
      }
    } // Getters


    var _proto = Collapse.prototype;

    // Public
    _proto.toggle = function toggle() {
      // this._elementは開閉する要素
      // その要素がshowを持っている場合
      if ($(this._element).hasClass(ClassName$2.SHOW)) {
        // hideを実行
        this.hide();
      } else {
        // showを持っていない場合はshowを実行
        this.show();
      }
    };

    _proto.show = function show() {
      var _this = this;

      // this._isTransitioningがtrueもしくは、開閉対象の要素がshowを持っていたら
      // 処理を終了する
      if (this._isTransitioning || $(this._element).hasClass(ClassName$2.SHOW)) {
        return;
      }

      var actives;
      var activesData; // this._parentが存在していたら

      if (this._parent) {
        // parentから.showか.collapsingを持つ要素を取得する
        actives = [].slice.call(this._parent.querySelectorAll(Selector$2.ACTIVES)).filter(function (elem) {
          // this._config.parent要素がstringの場合
          if (typeof _this._config.parent === 'string') {
            // .activesの要素でdata-parent属性がthis._config.parentもののみを取得
            return elem.getAttribute('data-parent') === _this._config.parent;
          } // this._config.parent要素がstring以外の場合
          // elemのクラスリストにcollapseが存在するもののみを取得


          return elem.classList.contains(ClassName$2.COLLAPSE);
        }); // activesに要素が存在していない場合は、nullを代入する

        if (actives.length === 0) {
          actives = null;
        }
      } // activesがnullじゃない場合


      if (actives) {
        // activesからクリックされたtrigger要素のhrefで指定された要素を削除
        // 削除後に残ったactivesからDATA_KEYの値を取得する
        activesData = $(actives).not(this._selector).data(DATA_KEY$2); // activesDataが存在していて、activesData._isTransitioningがtrueなら
        // 処理終了

        if (activesData && activesData._isTransitioning) {
          return;
        }
      } // showイベントを定義


      var startEvent = $.Event(Event$2.SHOW); // showイベントを発動

      $(this._element).trigger(startEvent); // showイベントがブラウザのデフォルト動作を禁止していたら処理終了

      if (startEvent.isDefaultPrevented()) {
        return;
      } // activesが存在する場合


      if (actives) {
        // activesからthis._selectorで指定された要素を削除して、jQueryInterfaceでhideを実行
        // つまり、showするのと同時に既に開いている要素を閉じる
        Collapse._jQueryInterface.call($(actives).not(this._selector), 'hide'); // activeDataが存在しない場合


        if (!activesData) {
          // activesにDATA_KEYでnullを設定
          $(actives).data(DATA_KEY$2, null);
        }
      } // this._elementが.widthを持っていたらwidthを取得
      // もっていなかったらheightを取得


      var dimension = this._getDimension(); // this._element(開閉される要素)から.collapseを削除
      // そして、.collapsingを付与


      $(this._element).removeClass(ClassName$2.COLLAPSE).addClass(ClassName$2.COLLAPSING); // 開閉対象の高さを0pxにする

      this._element.style[dimension] = 0; // [data-toggle="collapse"]を持つ要素が0じゃない場合

      if (this._triggerArray.length) {
        // _triggerArrayの.collapsedを削除
        // aria-expandedをtrueで設定
        $(this._triggerArray).removeClass(ClassName$2.COLLAPSED).attr('aria-expanded', true);
      } // this._isTransitioningにtrueを設定


      this.setTransitioning(true);

      var complete = function complete() {
        // ここでshowをしている。詳細は_transitions.scssを確認だけど
        // 単純に.showを持っていない.collapse要素はdisplay:none;している
        // .collapsingを削除し、.collapseと.showを付与
        $(_this._element).removeClass(ClassName$2.COLLAPSING).addClass(ClassName$2.COLLAPSE).addClass(ClassName$2.SHOW); // 0に設定したstyleを空にする

        _this._element.style[dimension] = ''; // this._isTransitioningにfalseを設定

        _this.setTransitioning(false); // shownイベントを発動


        $(_this._element).trigger(Event$2.SHOWN);
      }; // dimensionの1文字目を大文字にする


      var capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      var scrollSize = "scroll" + capitalizedDimension; // 開閉する要素の遷移時間を取得

      var transitionDuration = Util.getTransitionDurationFromElement(this._element); // 開閉する要素

      $(this._element).one(Util.TRANSITION_END, complete) // 一度だけ発動するcomplete
      .emulateTransitionEnd(transitionDuration); // ここでTRANTION_ENDをtriggerしてる
      // this._elementのdimensionスタイルに、scrollSize分の値を適用する

      this._element.style[dimension] = this._element[scrollSize] + "px";
    };

    _proto.hide = function hide() {
      var _this2 = this;

      // this._isTransitioningがtrueもしくは、開閉対象の要素がshowを持っていなかったら
      // 処理を終了する
      if (this._isTransitioning || !$(this._element).hasClass(ClassName$2.SHOW)) {
        return;
      } // hideイベントを定義する


      var startEvent = $.Event(Event$2.HIDE); // hideイベントを発動する

      $(this._element).trigger(startEvent); // hideイベントがブラウザの動作を停止していたら処理終了

      if (startEvent.isDefaultPrevented()) {
        return;
      } // this._elementが.widthを持っていたらwidthを取得
      // もっていなかったらheightを取得


      var dimension = this._getDimension(); // getBoundingClientRectは要素の位置を取得する
      // つまり、開閉要素の位置(dimensionでheightかwidthを指定)を取得して
      // 開閉要素のスタイルに指定する


      this._element.style[dimension] = this._element.getBoundingClientRect()[dimension] + "px"; // 開閉要素の高さを取得する
      // heightとpaddingとborderの合計値

      Util.reflow(this._element); // 開閉要素に.collapsingを追加する
      // .collapseと.showは削除する

      $(this._element).addClass(ClassName$2.COLLAPSING).removeClass(ClassName$2.COLLAPSE).removeClass(ClassName$2.SHOW); // trigger要素の長さを取得

      var triggerArrayLength = this._triggerArray.length; // triggerArrayLengthが1以上だったら

      if (triggerArrayLength > 0) {
        // triggerArrayLengthの長さの分だけループする
        for (var i = 0; i < triggerArrayLength; i++) {
          // triggerArrayのひとつを取得
          var trigger = this._triggerArray[i]; // triggerに指定されている開閉要素を取得する

          var selector = Util.getSelectorFromElement(trigger); // selectorが存在していたら

          if (selector !== null) {
            // 開閉要素を全て取得して、配列で入れる
            var $elem = $([].slice.call(document.querySelectorAll(selector))); // 開閉要素がshowを持っていない場合

            if (!$elem.hasClass(ClassName$2.SHOW)) {
              // trrigerに.collapsedを追加する
              $(trigger).addClass(ClassName$2.COLLAPSED) // aria-expanded属性をfalseにする
              .attr('aria-expanded', false);
            }
          }
        }
      } // this._isTransitioningをtrueにする


      this.setTransitioning(true);

      var complete = function complete() {
        // this._isTransitioningをfalseにする
        _this2.setTransitioning(false); // 開閉要素に対して.collapsingを削除
        // .collapseを追加
        // Hiddenイベントを実行


        $(_this2._element).removeClass(ClassName$2.COLLAPSING).addClass(ClassName$2.COLLAPSE).trigger(Event$2.HIDDEN);
      }; // 開閉要素に設定したスタイルを空にする


      this._element.style[dimension] = ''; // this._elementから遷移時間を取得

      var transitionDuration = Util.getTransitionDurationFromElement(this._element); // .collapsingの遷移が終わったタイミングでcompleteを実行
      // emulateTransitionEndでTRANSITION_ENDを実行

      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
    };

    _proto.setTransitioning = function setTransitioning(isTransitioning) {
      // this._isTransitioningに引数を設定
      // trueかfalse
      this._isTransitioning = isTransitioning;
    } // 全てを破壊する
    ;

    _proto.dispose = function dispose() {
      // DATA_KEYを削除
      $.removeData(this._element, DATA_KEY$2); // 各要素にnullを代入して削除

      this._config = null;
      this._parent = null;
      this._element = null;
      this._triggerArray = null;
      this._isTransitioning = null;
    } // Private
    // configを取得する
    ;

    _proto._getConfig = function _getConfig(config) {
      // configにDefaultの値と、configの値を展開して入れる
      config = _objectSpread2({}, Default, {}, config);
      config.toggle = Boolean(config.toggle); // Stringをbooleanに変換する
      // confignの値がDefaultTypeの型と一致しているか確認

      Util.typeCheckConfig(NAME$2, config, DefaultType); // configを返す

      return config;
    };

    _proto._getDimension = function _getDimension() {
      // this._elementは開閉要素
      // this._elementが.widthを持っているか判定
      var hasWidth = $(this._element).hasClass(Dimension.WIDTH); // .widthが存在していたらwidthを返す
      // .widthが存在していなかったらheightを返す

      return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
    };

    _proto._getParent = function _getParent() {
      var _this3 = this;

      var parent; // this._config.parentがElementか判定する

      if (Util.isElement(this._config.parent)) {
        // Elementだった場合そのまま格納
        parent = this._config.parent; // jQuery object
        // this._config.parent.jqueryがundefinedじゃない場合

        if (typeof this._config.parent.jquery !== 'undefined') {
          // elementを格納
          parent = this._config.parent[0];
        }
      } else {
        // this._config.parentがElementじゃない場合
        // this._config.parentに指定されている要素を探して格納
        parent = document.querySelector(this._config.parent);
      } // [data-toggle="collapse"][data-parent="#accordion"]みたいになる


      var selector = "[data-toggle=\"collapse\"][data-parent=\"" + this._config.parent + "\"]"; // parent要素の中からselectorとマッチする要素を取得する
      // data-toggleとdata-parent両方持っている要素のみ

      var children = [].slice.call(parent.querySelectorAll(selector)); // elementはselectorと一致した要素

      $(children).each(function (i, element) {
        // 開閉する要素が.showを持っているかによって
        // trigger要素に.collapsedとaria-expanded属性を付与したり削除したりする
        _this3._addAriaAndCollapsedClass(Collapse._getTargetFromElement(element), // hrefとかに指定されている要素
        [element] // data-toggleとdata-parent両方持っている要素
        );
      }); // data-parent属性に指定された親要素を返す

      return parent;
    } // elementはhrefとかに指定されている開閉する要素
    // triggerArrayはelementを開閉させるためにクリックする要素
    ;

    _proto._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(element, triggerArray) {
      // elementがshowを持っているか判定
      var isOpen = $(element).hasClass(ClassName$2.SHOW); // triggerArrayに要素が入っているか判定

      if (triggerArray.length) {
        // elementがshowを持っていた場合は.collapsedを削除
        // elementがshowを持っていない場合は.collapsedを付与
        // aria-expanded属性にisOpenの値を設定
        $(triggerArray).toggleClass(ClassName$2.COLLAPSED, !isOpen).attr('aria-expanded', isOpen);
      }
    } // Static
    // elementはdata-toggleとdata-parent両方持っている要素
    ;

    Collapse._getTargetFromElement = function _getTargetFromElement(element) {
      // elementが持ってるhrefやdata-targetに指定されているselectorを取得
      var selector = Util.getSelectorFromElement(element); // selectorが存在していたら、selectorに指定されている要素を取得して返す
      // なかったらnullを返す

      return selector ? document.querySelector(selector) : null;
    };

    Collapse._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // selectorの要素(開閉する要素)
        var $this = $(this); // $thisのDATA_KEYと結びつくdata取得

        var data = $this.data(DATA_KEY$2); // configを格納

        var _config = _objectSpread2({}, Default, {}, $this.data(), {}, typeof config === 'object' && config ? config : {}); // dataが存在していないかつ、_config.toggleがtrue
        // configがshowまたはhideだった場合


        if (!data && _config.toggle && /show|hide/.test(config)) {
          // toggleをfalseにする
          _config.toggle = false;
        } // dataが存在してなかったらdataをインスタンス化する
        // インスタンス化したdataはDATA_KEYでElementに設定する


        if (!data) {
          // thisはdata-toggle="collapse"を持つ要素
          // _configは上で設定した_config
          data = new Collapse(this, _config);
          $this.data(DATA_KEY$2, data);
        } // configがstringだった場合


        if (typeof config === 'string') {
          // configメソッドがdata(collapseクラス)にあるか確認する
          if (typeof data[config] === 'undefined') {
            // なかったらエラーを返す
            throw new TypeError("No method named \"" + config + "\"");
          } // 存在していたら実行


          data[config]();
        }
      });
    };

    _createClass(Collapse, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$2;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }]);

    return Collapse;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */
  // DATA_TOGGLEに対して、クリックイベントを定義する


  $(document).on(Event$2.CLICK_DATA_API, Selector$2.DATA_TOGGLE, function (event) {
    // 折りたたみ可能な要素な要素ないではなく、<a>要素（URLを変更する）に対してのみ動作を停止する
    if (event.currentTarget.tagName === 'A') {
      event.preventDefault();
    } // thisはクリックしたelement(イベント要素)


    var $trigger = $(this); // セレクタを取得(#collapseOneとか)

    var selector = Util.getSelectorFromElement(this); // セレクタで指定された要素を取得

    var selectors = [].slice.call(document.querySelectorAll(selector));
    $(selectors).each(function () {
      // selectorで指定されているtoggleする要素
      var $target = $(this); // targetのDATA_KEYを取得する

      var data = $target.data(DATA_KEY$2); // configとdataが一致していたら$trigger.data()を入れる
      // それ以外の場合はtoggleを入れる
      // $trigger.data()は<a>のdata-toggleの値を取得する

      var config = data ? 'toggle' : $trigger.data(); // jqueryInterfaceを呼ぶ

      Collapse._jQueryInterface.call($target, config);
    });
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$2] = Collapse._jQueryInterface;
  $.fn[NAME$2].Constructor = Collapse;

  $.fn[NAME$2].noConflict = function () {
    $.fn[NAME$2] = JQUERY_NO_CONFLICT$2;
    return Collapse._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$3 = 'dropdown';
  var VERSION$3 = '0.5.2';
  var DATA_KEY$3 = 'sc.dropdown';
  var EVENT_KEY$3 = "." + DATA_KEY$3;
  var DATA_API_KEY$3 = '.data-api';
  var JQUERY_NO_CONFLICT$3 = $.fn[NAME$3];
  var ESCAPE_KEYCODE = 27; // Escキー

  var SPACE_KEYCODE = 32; // スペースキー

  var TAB_KEYCODE = 9; // タブキー

  var ARROW_UP_KEYCODE = 38; // ↑キー

  var ARROW_DOWN_KEYCODE = 40; // ↓キー

  var RIGHT_MOUSE_BUTTON_WHICH = 3; // マウスの右クリック
  // 正規表現オブジェクト作成

  var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE);
  var Event$3 = {
    HIDE: "hide" + EVENT_KEY$3,
    HIDDEN: "hidden" + EVENT_KEY$3,
    SHOW: "show" + EVENT_KEY$3,
    SHOWN: "shown" + EVENT_KEY$3,
    CLICK: "click" + EVENT_KEY$3,
    CLICK_DATA_API: "click" + EVENT_KEY$3 + DATA_API_KEY$3,
    KEYDOWN_DATA_API: "keydown" + EVENT_KEY$3 + DATA_API_KEY$3,
    KEYUP_DATA_API: "keyup" + EVENT_KEY$3 + DATA_API_KEY$3
  };
  var ClassName$3 = {
    DISABLED: 'disabled',
    SHOW: 'show',
    DROPUP: 'dropup',
    DROPRIGHT: 'dropright',
    DROPLEFT: 'dropleft',
    MENURIGHT: 'dropdown-menu-right',
    MENULEFT: 'dropdown-menu-left',
    POSITION_STATIC: 'position-static'
  };
  var Selector$3 = {
    DATA_TOGGLE: '[data-toggle="dropdown"]',
    FORM_CHILD: '.dropdown form',
    MENU: '.dropdown-menu',
    NAVBAR_NAV: '.navbar-nav',
    VISIBLE_ITEMS: '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)'
  };
  var AttachmentMap = {
    TOP: 'top-start',
    TOPEND: 'top-end',
    BOTTOM: 'bottom-start',
    BOTTOMEND: 'bottom-end',
    RIGHT: 'right-start',
    RIGHTEND: 'right-end',
    LEFT: 'left-start',
    LEFTEND: 'left-end'
  };
  var Default$1 = {
    offset: 0,
    flip: true,
    boundary: 'scrollParent',
    reference: 'toggle',
    display: 'dynamic',
    popperConfig: null
  };
  var DefaultType$1 = {
    offset: '(number|string|function)',
    flip: 'boolean',
    boundary: '(string|element)',
    reference: '(string|element)',
    display: 'string',
    popperConfig: '(null|object)'
  };
  /**
   * ------------------------------------------------------------------------
   * Class
   * ------------------------------------------------------------------------
   */

  var Dropdown = /*#__PURE__*/function () {
    // button.dropdown-toggleと、configがobjectならobject、違うならnull
    function Dropdown(element, config) {
      this._element = element;
      this._popper = null; // configを取得

      this._config = this._getConfig(config); // .dropdown-menuを取得

      this._menu = this._getMenuElement(); // dropdownがnavbarに内包されているか確認

      this._inNavbar = this._detectNavbar(); // クリックイベントの設定（ここでtoggleも登録）

      this._addEventListeners();
    } // Getters


    var _proto = Dropdown.prototype;

    _proto.toggle = function toggle() {
      // エレメントがdisable属性もしくはclassを持ってたら処理終了
      if (this._element.disabled || $(this._element).hasClass(ClassName$3.DISABLED)) {
        return;
      } // メニューが.showを持ってるか判定


      var isActive = $(this._menu).hasClass(ClassName$3.SHOW); // メニューを閉じる

      Dropdown._clearMenus(); // .showを持ってたらshowする必要ないので処理終了


      if (isActive) {
        return;
      } // 下のshowを発動。popperは使う


      this.show(true);
    };

    _proto.show = function show(usePopper) {
      if (usePopper === void 0) {
        usePopper = false;
      }

      // dropdownもしくはメニューがdisableになってたら処理終了
      if (this._element.disabled || $(this._element).hasClass(ClassName$3.DISABLED) || $(this._menu).hasClass(ClassName$3.SHOW)) {
        return;
      } // .dropdown-toggleをrelatedTargetに入れる


      var relatedTarget = {
        relatedTarget: this._element
      }; // show.sc.dropdownイベントを定義して、relatedTargetを渡す

      var showEvent = $.Event(Event$3.SHOW, relatedTarget); // エレメントの親要素を取得
      // .dropdown

      var parent = Dropdown._getParentFromElement(this._element); // parentに対してshoweventを発動する


      $(parent).trigger(showEvent); // ブラウザの処理を禁止してたら処理終了

      if (showEvent.isDefaultPrevented()) {
        return;
      } // navに入ってない状態でusepopperが使われる時


      if (!this._inNavbar && usePopper) {
        /**
         * Check for Popper dependency
         * Popper - https://popper.js.org
         */
        // popperが読み込まれているか確認
        if (typeof Popper === 'undefined') {
          throw new TypeError('Simplicss\'s dropdowns require Popper.js (https://popper.js.org/)');
        } // .data-toggle要素を格納


        var referenceElement = this._element; // this._configはDefault
        // parentだったら

        if (this._config.reference === 'parent') {
          // this._elementの親要素を格納する
          referenceElement = parent;
        } else if (Util.isElement(this._config.reference)) {
          // this._config.referenceがdom要素だったら
          // this._config.referenceを突っ込む
          referenceElement = this._config.reference; // jquery要素か確認する

          if (typeof this._config.reference.jquery !== 'undefined') {
            referenceElement = this._config.reference[0];
          }
        } // boundaryがscrollParentじゃない場合は、位置をstaticに設定してメニューが親をエスケープ出来るようにする


        if (this._config.boundary !== 'scrollParent') {
          // parentに.position-staticを追加
          $(parent).addClass(ClassName$3.POSITION_STATIC);
        } // popperをインスタンス化
        // referenceElementはdata-toggle、this._menuはメニュー、this._getPopperConfig()はpopperのコンフィグ
        // ちなみにここでdropdownメニューを表示している


        this._popper = new Popper(referenceElement, this._menu, this._getPopperConfig());
      } // タッチデバイスの場合、空のマウスオーバリスナーを追加


      if ('ontouchstart' in document.documentElement && $(parent).closest(Selector$3.NAVBAR_NAV).length === 0) {
        $(document.body).children().on('mouseover', null, $.noop);
      } // フォーカスさせる。キーイベントのため？


      this._element.focus(); // showのときはaria-expanded属性を付与してtrueを設定する


      this._element.setAttribute('aria-expanded', true); // menuの.showを切り替える


      $(this._menu).toggleClass(ClassName$3.SHOW); // parentの.showを切り替えて、表示後のイベントをrelatedTargerに対して発動する

      $(parent).toggleClass(ClassName$3.SHOW).trigger($.Event(Event$3.SHOWN, relatedTarget));
    };

    _proto.hide = function hide() {
      // disableクラス、属性も持っていた場合と、メニューがshowを持っていた場合は処理を終了させる
      if (this._element.disabled || $(this._element).hasClass(ClassName$3.DISABLED) || !$(this._menu).hasClass(ClassName$3.SHOW)) {
        return;
      } // this._elementをターゲットにする


      var relatedTarget = {
        relatedTarget: this._element
      }; // ターゲットに対してhideイベントを定義する

      var hideEvent = $.Event(Event$3.HIDE, relatedTarget); // .dropdownを取得する

      var parent = Dropdown._getParentFromElement(this._element); // 親要素に対してhideイベントを実行する


      $(parent).trigger(hideEvent); // hideイベントがブラウザの動作を止めていたら処理を終了する

      if (hideEvent.isDefaultPrevented()) {
        return;
      } // popperがあった場合は、削除する


      if (this._popper) {
        this._popper.destroy();
      } // this._menuのshowクラスを切り替える


      $(this._menu).toggleClass(ClassName$3.SHOW); // 親要素に対して、showクラスを切り替えて、hiddenイベントを発動する

      $(parent).toggleClass(ClassName$3.SHOW).trigger($.Event(Event$3.HIDDEN, relatedTarget));
    };

    _proto.dispose = function dispose() {
      // this_elementのdata-apiを削除する
      $.removeData(this._element, DATA_KEY$3); // this_elementのイベントを削除

      $(this._element).off(EVENT_KEY$3);
      this._element = null;
      this._menu = null; // popperがnullじゃなかったら、削除してnullにする

      if (this._popper !== null) {
        this._popper.destroy();

        this._popper = null;
      }
    };

    _proto.update = function update() {
      // dropdownがnavbarにあるか確認
      this._inNavbar = this._detectNavbar(); // popperがnullじゃなかったら

      if (this._popper !== null) {
        // popper要素の位置を変更
        this._popper.scheduleUpdate();
      }
    } // Private
    ;

    _proto._addEventListeners = function _addEventListeners() {
      var _this = this;

      // this_elementをクリックした時のイベントを定義する
      $(this._element).on(Event$3.CLICK, function (event) {
        // this._elementイベント禁止
        event.preventDefault(); // 親要素のイベントが実行されないようにeventの伝播を禁止する

        event.stopPropagation(); // toggleを発動する

        _this.toggle();
      });
    } // configを取得
    // 引数はtoggleだとnullでそうじゃなかったらobject
    ;

    _proto._getConfig = function _getConfig(config) {
      // configにdefaultの設定を$(this._element).data()、configの順に上書きしていく感じ
      config = _objectSpread2({}, this.constructor.Default, {}, $(this._element).data(), {}, config);
      Util.typeCheckConfig( // dropdown
      NAME$3, // 上で作ったconfigが入ってる
      config, // default typeがそのまま入ってる
      this.constructor.DefaultType);
      return config;
    };

    _proto._getMenuElement = function _getMenuElement() {
      // this._menuが存在しなかった場合
      if (!this._menu) {
        // this._elementの親要素を返す。div.dropdownとかbtn-groupとか
        var parent = Dropdown._getParentFromElement(this._element); // parentが存在していた場合


        if (parent) {
          // parentの中から.dropdown-menuを取得してthis._menuに格納する
          this._menu = parent.querySelector(Selector$3.MENU);
        }
      } // this._menuが存在してたらそのまま返す。
      // 存在してなかったら、取得して返す


      return this._menu;
    };

    _proto._getPlacement = function _getPlacement() {
      // this.elementの親要素を取得（.dropdown）
      var $parentDropdown = $(this._element.parentNode); // bottom-startを格納。初期値

      var placement = AttachmentMap.BOTTOM; // dropupを持ってたら

      if ($parentDropdown.hasClass(ClassName$3.DROPUP)) {
        // top-startを格納
        placement = AttachmentMap.TOP; // メニューがdropdown-menu-rightを持っていた場合

        if ($(this._menu).hasClass(ClassName$3.MENURIGHT)) {
          // top-endを格納
          placement = AttachmentMap.TOPEND;
        } // droprightを持っていた場合

      } else if ($parentDropdown.hasClass(ClassName$3.DROPRIGHT)) {
        // right-startを格納
        placement = AttachmentMap.RIGHT; // dropleftを持っていた場合
      } else if ($parentDropdown.hasClass(ClassName$3.DROPLEFT)) {
        // left-startを格納
        placement = AttachmentMap.LEFT; // dropdown-menu-rightを持っていた場合
      } else if ($(this._menu).hasClass(ClassName$3.MENURIGHT)) {
        // bottom-endを格納
        placement = AttachmentMap.BOTTOMEND;
      }

      return placement;
    };

    _proto._detectNavbar = function _detectNavbar() {
      // .navbar要素にdropdownが存在していないか確認
      return $(this._element).closest('.navbar').length > 0;
    };

    _proto._getOffset = function _getOffset() {
      var _this2 = this;

      var offset = {}; // this._config.offsetが関数だったら

      if (typeof this._config.offset === 'function') {
        // dataはpopperみたい
        offset.fn = function (data) {
          // data.offsetに展開して格納
          data.offsets = _objectSpread2({}, data.offsets, {}, _this2._config.offset(data.offsets, _this2._element) || {});
          return data;
        };
      } else {
        // offsetにthis._config.offsetを入れる
        offset.offset = this._config.offset;
      }

      return offset;
    };

    _proto._getPopperConfig = function _getPopperConfig() {
      // popperの設定を定義
      var popperConfig = {
        // 表示位置
        placement: this._getPlacement(),
        // offsetを更新するためのリスト
        modifiers: {
          // offset
          offset: this._getOffset(),
          // popperの表示を反転する
          flip: {
            enabled: this._config.flip
          },
          // flipを動作させるためにpreventOverflowが必要
          preventOverflow: {
            boundariesElement: this._config.boundary
          }
        }
      }; // this._config.displayがstaticの場合は、popperを無効化する

      if (this._config.display === 'static') {
        popperConfig.modifiers.applyStyle = {
          enabled: false
        };
      }

      return _objectSpread2({}, popperConfig, {}, this._config.popperConfig);
    } // Static
    // callの通り、configはtoggle
    ;

    Dropdown._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // こんな感じで使わないとdataには入らない
        // $('.dropdown-toggle').data('sc.dropdown', '')
        var data = $(this).data(DATA_KEY$3); // configはtoggleの場合はnullになる。

        var _config = typeof config === 'object' ? config : null;

        if (!data) {
          // thisはdropdown-toggle(button)
          // つまりelement
          data = new Dropdown(this, _config); // elementにsc.dropdownでdataをセットする

          $(this).data(DATA_KEY$3, data);
        } // toggleの場合はstring


        if (typeof config === 'string') {
          // dataのtoggleを指してるみたい
          if (typeof data[config] === 'undefined') {
            // toggleメソッドがなかったらスロー
            throw new TypeError("No method named \"" + config + "\"");
          } // toggle関数を発動する


          data[config]();
        }
      });
    };

    Dropdown._clearMenus = function _clearMenus(event) {
      // イベントが存在していてかつ、イベントがマウスの右クリックまたはキーを離した、またはタブキーじゃないものを押下した場合
      if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH || event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
        // 処理を終了する
        return;
      } //  '[data-toggle="dropdown"]'をもつ .要素を全て取得する


      var toggles = [].slice.call(document.querySelectorAll(Selector$3.DATA_TOGGLE)); // 取得したtogglesの数だけループ回す

      for (var i = 0, len = toggles.length; i < len; i++) {
        // togglesの親ノードを取得する
        var parent = Dropdown._getParentFromElement(toggles[i]); // toggle要素のsc.dropdownを取得する
        // jqueryInterfaceをで設定してdataを取得する（dataはdropdownのコンストラクタで定義した変数）


        var context = $(toggles[i]).data(DATA_KEY$3); // 連想配列にtoggleを追加

        var relatedTarget = {
          relatedTarget: toggles[i]
        }; // イベントが存在してイベントがclickだったら
        // bottonクリックのロキにイベントが発動してる

        if (event && event.type === 'click') {
          // relatedTargetのclickイベントにイベントを追加
          relatedTarget.clickEvent = event;
        } // sc.dropdownが存在していたら


        if (!context) {
          // 更新式に行く
          // つまり、クリックされてないものはcontextがないので、更新式に飛ばされて次のボタンの判定に入る
          continue;
        } // contextのmenuをdropdownmenuに代入


        var dropdownMenu = context._menu; // parentがshowクラスを持っていなかったら

        if (!$(parent).hasClass(ClassName$3.SHOW)) {
          // メニューが開いていないので、更新式に行く
          continue;
        } // イベントが存在してるのが前提
        // イベントがclickで、イベントのターゲットタグがinputもしくはtextareaまたは、イベントがキーを離してイベントキーがタブ以外でparentの中にイベントのターゲット要素が含まれている場合
        // /input|textarea/i.test(event.target.tagName) はmenu-itemがinputかtextareaの場合はtrue


        if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) && $.contains(parent, event.target)) {
          // parentにevent.targetが含まれているか。つまりparentのdropdownにクリックしたメニューが含まれているか
          // つまりmenuを閉じなくてもいいイベントの場合はメニューを閉じる処理しませんよってことみたい
          // 更新式に行く
          continue;
        } // hideイベントオブジェクトを定義する。
        // relatedTargetはイベント発生時に実行する関数に渡す値(data-toggle="dropdown"を持つ要素)
        // http://www.jquerystudy.info/reference/events/event.html


        var hideEvent = $.Event(Event$3.HIDE, relatedTarget); // parent要素に対して、hideEventを発生去せる
        // parentは.dropdown

        $(parent).trigger(hideEvent); // hideがブラウザの動作を停止していたら

        if (hideEvent.isDefaultPrevented()) {
          // 利用ユーザが特定の要素に対してe.preventDefault()みたいなのを書いたら処理をしない
          // 更新式に行く
          continue;
        } // タッチデバイスだった場合、iOS用のマウスオーバリスナーを削除


        if ('ontouchstart' in document.documentElement) {
          $(document.body).children().off('mouseover', null, $.noop);
        } // toggleに'aria-expanded=falseを設定


        toggles[i].setAttribute('aria-expanded', 'false'); // contextにpopperがあったら

        if (context._popper) {
          // popperインスタンスを削除
          context._popper.destroy();
        } // .dropdown-menuの.showを削除


        $(dropdownMenu).removeClass(ClassName$3.SHOW); // parentの.showを削除してhiddenイベントを定義しつつ発動
        // parentは.dropdown

        $(parent).removeClass(ClassName$3.SHOW).trigger($.Event(Event$3.HIDDEN, relatedTarget));
      }
    };

    Dropdown._getParentFromElement = function _getParentFromElement(element) {
      // elementがボタンの要素全部になってる
      var parent; // data-targetがないのでnullです。

      var selector = Util.getSelectorFromElement(element); // selectorが存在した場合

      if (selector) {
        // documentからselectorの要素を取得する
        parent = document.querySelector(selector);
      } // parentが存在していたらparentを返す
      // そうでなければ、elementのparentNodeで返す
      // parentNodeは親ノード


      return parent || element.parentNode;
    } // eslint-disable-next-line complexity
    ;

    Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
      // inputとtextareaの場合は、dropdownのコマンドを無効化する
      if (/input|textarea/i.test(event.target.tagName) ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE && (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE || $(event.target).closest(Selector$3.MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
        return;
      } // イベントを無効化して、伝藩しないようにする


      event.preventDefault();
      event.stopPropagation(); // disable属性または、disableクラスを持っていた場合、処理を終了する

      if (this.disabled || $(this).hasClass(ClassName$3.DISABLED)) {
        return;
      } // dropdownの親要素を取得する


      var parent = Dropdown._getParentFromElement(this); // parentが.showクラスを持っているか判定


      var isActive = $(parent).hasClass(ClassName$3.SHOW); // isActiveがfalseか、event.whichがエスケープキーだった場合、処理を終了させる

      if (!isActive && event.which === ESCAPE_KEYCODE) {
        return;
      } // isActiveがfalseまたは、isActiveがtrueかつエスケープキーが押下された場合もしくは、スペースキーが押下された場合


      if (!isActive || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {
        // エスキープキーだった場合
        if (event.which === ESCAPE_KEYCODE) {
          // parentのdata_toggleを持つ要素を取得
          var toggle = parent.querySelector(Selector$3.DATA_TOGGLE); // toggleをフォーカスする

          $(toggle).trigger('focus');
        } // クリップイベントを発動する


        $(this).trigger('click');
        return;
      } // disableしてないdropdown-menuとdropdown-itemを取得して、visibleのみを残す


      var items = [].slice.call(parent.querySelectorAll(Selector$3.VISIBLE_ITEMS)).filter(function (item) {
        return $(item).is(':visible');
      }); // itemsで取得したものがなかったら処理終了

      if (items.length === 0) {
        return;
      } // event.targetが何番目か取得する


      var index = items.indexOf(event.target); // 上キーが押されていて、indexが0よりおおきかったら

      if (event.which === ARROW_UP_KEYCODE && index > 0) {
        // indexを-1する
        index--;
      } // 下キーが押されていて、indexがindexの長さ-1より小さかったら


      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
        // indexを＋1する
        index++;
      } // indexが0より小さかったら


      if (index < 0) {
        // indexを0にする
        index = 0;
      } // drop-down-itemのindex番目をfucusする


      items[index].focus();
    };

    _createClass(Dropdown, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$3;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$1;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$1;
      }
    }]);

    return Dropdown;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document) // data-toggle="dropdown"のキーイベントを登録
  .on(Event$3.KEYDOWN_DATA_API, Selector$3.DATA_TOGGLE, Dropdown._dataApiKeydownHandler) // .dropdown-menuのキーイベントを登録
  .on(Event$3.KEYDOWN_DATA_API, Selector$3.MENU, Dropdown._dataApiKeydownHandler) // メニュークリーンを登録
  .on(Event$3.CLICK_DATA_API + " " + Event$3.KEYUP_DATA_API, Dropdown._clearMenus) // [data-toggle="dropdown"]のイベント伝藩を止めて、jQueryInterfaceをcallする
  .on(Event$3.CLICK_DATA_API, Selector$3.DATA_TOGGLE, function (event) {
    event.preventDefault();
    event.stopPropagation();

    Dropdown._jQueryInterface.call($(this), 'toggle');
  }) // イベントが伝藩しないようにする
  .on(Event$3.CLICK_DATA_API, Selector$3.FORM_CHILD, function (e) {
    e.stopPropagation();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$3] = Dropdown._jQueryInterface;
  $.fn[NAME$3].Constructor = Dropdown;

  $.fn[NAME$3].noConflict = function () {
    $.fn[NAME$3] = JQUERY_NO_CONFLICT$3;
    return Dropdown._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$4 = 'modal';
  var VERSION$4 = '4.4.1';
  var DATA_KEY$4 = 'sc.modal';
  var EVENT_KEY$4 = "." + DATA_KEY$4;
  var DATA_API_KEY$4 = '.data-api';
  var JQUERY_NO_CONFLICT$4 = $.fn[NAME$4];
  var ESCAPE_KEYCODE$1 = 27; // エスケープキー

  var Default$2 = {
    backdrop: true,
    keyboard: true,
    focus: true,
    show: true
  };
  var DefaultType$2 = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    focus: 'boolean',
    show: 'boolean'
  };
  var Event$4 = {
    HIDE: "hide" + EVENT_KEY$4,
    HIDE_PREVENTED: "hidePrevented" + EVENT_KEY$4,
    HIDDEN: "hidden" + EVENT_KEY$4,
    SHOW: "show" + EVENT_KEY$4,
    SHOWN: "shown" + EVENT_KEY$4,
    FOCUSIN: "focusin" + EVENT_KEY$4,
    RESIZE: "resize" + EVENT_KEY$4,
    CLICK_DISMISS: "click.dismiss" + EVENT_KEY$4,
    KEYDOWN_DISMISS: "keydown.dismiss" + EVENT_KEY$4,
    MOUSEUP_DISMISS: "mouseup.dismiss" + EVENT_KEY$4,
    MOUSEDOWN_DISMISS: "mousedown.dismiss" + EVENT_KEY$4,
    CLICK_DATA_API: "click" + EVENT_KEY$4 + DATA_API_KEY$4
  };
  var ClassName$4 = {
    SCROLLABLE: 'modal-dialog-scrollable',
    SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
    BACKDROP: 'modal-backdrop',
    OPEN: 'modal-open',
    FADE: 'fade',
    SHOW: 'show',
    STATIC: 'modal-static'
  };
  var Selector$4 = {
    DIALOG: '.modal-dialog',
    MODAL_BODY: '.modal-body',
    DATA_TOGGLE: '[data-toggle="modal"]',
    DATA_DISMISS: '[data-dismiss="modal"]',
    FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
    STICKY_CONTENT: '.sticky-top'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Modal = /*#__PURE__*/function () {
    function Modal(element, config) {
      // configを取得
      this._config = this._getConfig(config); // modal要素

      this._element = element; // .modal-dialog要素を取得する

      this._dialog = element.querySelector(Selector$4.DIALOG);
      this._backdrop = null;
      this._isShown = false;
      this._isBodyOverflowing = false;
      this._ignoreBackdropClick = false;
      this._isTransitioning = false;
      this._scrollbarWidth = 0;
    } // Getters


    var _proto = Modal.prototype;

    // Public
    _proto.toggle = function toggle(relatedTarget) {
      // isShownがtrueだった場合は、hideを実行
      // falseの場合は、クリックされるbtn要素を引数に、showを実行
      return this._isShown ? this.hide() : this.show(relatedTarget);
    };

    _proto.show = function show(relatedTarget) {
      var _this = this;

      // isShownか_isTransitioningがtrueの場合は処理終了
      if (this._isShown || this._isTransitioning) {
        return;
      } // modal要素が、fadeクラスを持っていたら


      if ($(this._element).hasClass(ClassName$4.FADE)) {
        // _isTransitioningにtrueを代入
        this._isTransitioning = true;
      } // showイベントをrelatedTargetに対して、定義する。


      var showEvent = $.Event(Event$4.SHOW, {
        relatedTarget: relatedTarget
      }); // modalイベントに対してshowイベントを発動する

      $(this._element).trigger(showEvent); // isShownがtrueもしくは、showEvenetがブラウザの動作を停止していた場合
      // 処理終了

      if (this._isShown || showEvent.isDefaultPrevented()) {
        return;
      } // isShownをtrueにする


      this._isShown = true; // スクロールバーが存在するか確認し
      // スクロールバーの横幅を取得

      this._checkScrollbar(); // .modal-openでoverflow: hiddenにしたとき、
      // 表示がくずれない用に、paddingかmarginを調整する


      this._setScrollbar(); // modal要素の幅をスクロールバーに合わせて調整


      this._adjustDialog(); // ESCキー押下時のイベントをmodal要素に対して設定
      // .modal-staticが付与されていたらアニメーションしながらフォーカスする。付与されていなかったらhide


      this._setEscapeEvent(); // windowリサイズ時に、modal要素の横幅を調整する
      // イベントを定義


      this._setResizeEvent(); // modal要素に、click-dismissイベントを設定
      // 対象セクレタのdata-dismiss='modal'クリック時に
      // modalをhideする


      $(this._element).on(Event$4.CLICK_DISMISS, Selector$4.DATA_DISMISS, function (event) {
        return _this.hide(event);
      }); // .modal-dialog要素に、マウスボタン押下時のイベントを定義する

      $(this._dialog).on(Event$4.MOUSEDOWN_DISMISS, function () {
        // modal要素に対して、マウスボタンが離れた時のイベントをバインドする
        $(_this._element).one(Event$4.MOUSEUP_DISMISS, function (event) {
          // event.target(マウスが離れた場所)とmodal要素が一致していた場合
          if ($(event.target).is(_this._element)) {
            _this._ignoreBackdropClick = true;
          }
        });
      }); // _showBackdropはmodalが表示されていたらbackdropを表示して_showElementを実行
      // modalが非表示ならbackdropを削除して_showElementを実行
      // _config.backdropがfalseならcallbackを実行するだけ
      // showElementはmodalを表示する

      this._showBackdrop(function () {
        return _this._showElement(relatedTarget);
      });
    };

    _proto.hide = function hide(event) {
      var _this2 = this;

      // イベントがあったら停止
      if (event) {
        event.preventDefault();
      } // modalが表示されているか、遷移中なら処理終了


      if (!this._isShown || this._isTransitioning) {
        return;
      } // hideイベントを定義する


      var hideEvent = $.Event(Event$4.HIDE); // modal要素に対して、hideイベントを実行する

      $(this._element).trigger(hideEvent); // modalが表示いないまたは、hideEventがブラウザの動作を停止させている場合は処理終了

      if (!this._isShown || hideEvent.isDefaultPrevented()) {
        return;
      } // isShownをfalseにする


      this._isShown = false; // modal要素が.fadeを持っているか判定

      var transition = $(this._element).hasClass(ClassName$4.FADE); // modal要素が.fadeを持っている場合

      if (transition) {
        // _isTransitioningをtrueにする
        this._isTransitioning = true;
      } // modal要素からエスケープキーでmodalをhideするイベントを削除する


      this._setEscapeEvent(); // modal要素からブラウザのリサイズイベントを削除する


      this._setResizeEvent(); // focusinイベントを削除


      $(document).off(Event$4.FOCUSIN); // modal要素から.showを削除する

      $(this._element).removeClass(ClassName$4.SHOW); // modal要素からクリックを離した時のイベントを削除する

      $(this._element).off(Event$4.CLICK_DISMISS); // dialogからマウスダウンを離したときのイベントを削除する

      $(this._dialog).off(Event$4.MOUSEDOWN_DISMISS); // modal要素が.fadeを持っていたら

      if (transition) {
        // modal要素の遷移時間を取得する
        var transitionDuration = Util.getTransitionDurationFromElement(this._element); // 遷移終了時にmodalを非表示にする

        $(this._element).one(Util.TRANSITION_END, function (event) {
          return _this2._hideModal(event);
        }).emulateTransitionEnd(transitionDuration);
      } else {
        // modalを非表示にする
        this._hideModal();
      }
    };

    _proto.dispose = function dispose() {
      // window、this_element、this._dialogのイベントを削除する
      [window, this._element, this._dialog].forEach(function (htmlElement) {
        return $(htmlElement).off(EVENT_KEY$4);
      }); // documentには、Event.FOCUSIN`と `Event.CLICK_DATA_APIの2つのイベントがある
      // documentのfocusinイベントを削除

      $(document).off(Event$4.FOCUSIN); // modal要素からdata_keyを削除する

      $.removeData(this._element, DATA_KEY$4); // 各種設定初期化

      this._config = null;
      this._element = null;
      this._dialog = null;
      this._backdrop = null;
      this._isShown = null;
      this._isBodyOverflowing = null;
      this._ignoreBackdropClick = null;
      this._isTransitioning = null;
      this._scrollbarWidth = null;
    };

    _proto.handleUpdate = function handleUpdate() {
      // modal要素の幅をスクロールバーに合わせて調整
      this._adjustDialog();
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      // configにDefaultとconfigを格納する
      config = _objectSpread2({}, Default$2, {}, config); // configの型がDefaultTypeと一致しているか確認
      // 一致していなかった場合は、エラー

      Util.typeCheckConfig(NAME$4, config, DefaultType$2); // configを返す

      return config;
    };

    _proto._triggerBackdropTransition = function _triggerBackdropTransition() {
      var _this3 = this;

      // .modal-staticはアニメーションで要素をフォーカスする
      // _config.backdropがstaticの場合（Defaultではstatic）
      if (this._config.backdrop === 'static') {
        // hidePreventedイベントを定義する
        var hideEventPrevented = $.Event(Event$4.HIDE_PREVENTED); // modal要素に対してhideEventPreventedを実行する

        $(this._element).trigger(hideEventPrevented); // イベントでブラウザのデフォルトの動作が停止されていた場合は処理終了

        if (hideEventPrevented.defaultPrevented) {
          return;
        } // modal要素に.staticを追加


        this._element.classList.add(ClassName$4.STATIC); // modal要素の遷移時間を取得


        var modalTransitionDuration = Util.getTransitionDurationFromElement(this._element); // 遷移終了時のイベントをバインド

        $(this._element).one(Util.TRANSITION_END, function () {
          // modal要素から.staticを削除
          _this3._element.classList.remove(ClassName$4.STATIC);
        }).emulateTransitionEnd(modalTransitionDuration); // 遷移終了時のイベントを実行

        this._element.focus(); // modal要素にフォーカスする

      } else {
        // this._config.backdropがstaticじゃない場合は
        // hideを実行
        this.hide();
      }
    };

    _proto._showElement = function _showElement(relatedTarget) {
      var _this4 = this;

      // relatedTargetはbtnとかのトリガー要素
      // this._elementはmodal要素
      // modal要素が.fadeを持っているか判定
      var transition = $(this._element).hasClass(ClassName$4.FADE); // this._dialogが存在する場合は、modal-body要素を取得する。
      // 存在しない場合は、null

      var modalBody = this._dialog ? this._dialog.querySelector(Selector$4.MODAL_BODY) : null; // modal要素の親要素が存在していないまたは、
      // parentNodeのがエレメントじゃない場合

      if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
        // bodyにmodal要素を追加する
        document.body.appendChild(this._element);
      } // modal要素にdisplay:block;を設定する


      this._element.style.display = 'block'; // modal要素のaria-hidden属性を削除する

      this._element.removeAttribute('aria-hidden'); // modal要素に、aria-modal="true"を設定する


      this._element.setAttribute('aria-modal', true); // .modal-dialogが.modal-dialog-scrollableを持っているかつ、
      // .modal-body要素が存在する場合


      if ($(this._dialog).hasClass(ClassName$4.SCROLLABLE) && modalBody) {
        // .modal-bodyのスクロール位置を0にする
        modalBody.scrollTop = 0;
      } else {
        // modal要素のスクロール位置を0にする
        this._element.scrollTop = 0;
      } // modal要素が.fadeを持っている場合


      if (transition) {
        // modal要素のpaddingとborderを含む
        // 高さを取得する
        Util.reflow(this._element);
      } // modal要素に.showを追加する


      $(this._element).addClass(ClassName$4.SHOW); // _config.focusがtrueの場合

      if (this._config.focus) {
        // modal要素をフォーカスする
        this._enforceFocus();
      } // shownイベントを定義する


      var shownEvent = $.Event(Event$4.SHOWN, {
        relatedTarget: relatedTarget
      }); // 遷移完了後のイベントを定義

      var transitionComplete = function transitionComplete() {
        // _config.focusがtrueならフォーカスする
        if (_this4._config.focus) {
          _this4._element.focus();
        } // _isTransitioningをfalseにする


        _this4._isTransitioning = false; // modal要素に対して、shownEventを発動する

        $(_this4._element).trigger(shownEvent);
      }; // modal要素が.fadeを持っている場合


      if (transition) {
        // .modal-dialog要素から遷移時間を取得
        var transitionDuration = Util.getTransitionDurationFromElement(this._dialog); // modal-dialogにtransisionendイベントをバインドして
        // 遷移時間分ずらして実行

        $(this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(transitionDuration);
      } else {
        // modal要素が.fadeをもっていない場合は、
        // transitionCompleteを実行する
        transitionComplete();
      }
    } // modal要素をフォーカスする
    ;

    _proto._enforceFocus = function _enforceFocus() {
      var _this5 = this;

      $(document).off(Event$4.FOCUSIN) // 無限フォーカスループにならないように、フォーカスイベントを削除する
      .on(Event$4.FOCUSIN, function (event) {
        // フォーカスイベントをバインドする
        if (document !== event.target && // event.targetとdocumentが一致しない
        _this5._element !== event.target && // event.targetとmodal要素が一致しない
        $(_this5._element).has(event.target).length === 0) {
          // modal要素にevent.targetが存在しない場合
          // modal要素をフォーカスする
          _this5._element.focus();
        }
      });
    };

    _proto._setEscapeEvent = function _setEscapeEvent() {
      var _this6 = this;

      if (this._isShown) {
        // isShownがtrueだった場合（show関数の冒頭でtrueにしてる）
        // modal要素に、keydown.dismissイベントをバインドする
        $(this._element).on(Event$4.KEYDOWN_DISMISS, function (event) {
          //  _config.keyboardがtrueで、エスケープキーを謳歌された場合
          if (_this6._config.keyboard && event.which === ESCAPE_KEYCODE$1) {
            // エスケープキーのデフォルト動作を停止する
            event.preventDefault(); // hideを実行

            _this6.hide();
          } else if (!_this6._config.keyboard && event.which === ESCAPE_KEYCODE$1) {
            // _config.keyboardがfalseで、エスケープキーが押下されたとき
            // backdropが'static'の場合は、要素をアニメーションしながらフォーカスする
            // staticじゃない場合はhideする
            _this6._triggerBackdropTransition();
          }
        });
      } else if (!this._isShown) {
        // modalが表示されていないとき
        // modalから、キーイベントを削除する
        $(this._element).off(Event$4.KEYDOWN_DISMISS);
      }
    };

    _proto._setResizeEvent = function _setResizeEvent() {
      var _this7 = this;

      // modalが表示されていたら
      if (this._isShown) {
        // windowのリサイズ時イベントを設定する
        // modal要素の幅をスクロールバーに合わせて調整
        $(window).on(Event$4.RESIZE, function (event) {
          return _this7.handleUpdate(event);
        });
      } else {
        // modalが表示されていない場合は、リサイズイベント削除
        $(window).off(Event$4.RESIZE);
      }
    };

    _proto._hideModal = function _hideModal() {
      var _this8 = this;

      // modal要素にdisplay:none;を設定する
      this._element.style.display = 'none'; // modal要素にaria-hidden='true'を付与する

      this._element.setAttribute('aria-hidden', true); // modal要素からaria-modal属性を削除する


      this._element.removeAttribute('aria-modal'); // _isTransitioningをfasleにする


      this._isTransitioning = false; // backdropを削除する

      this._showBackdrop(function () {
        $(document.body).removeClass(ClassName$4.OPEN); // modyの.modal-openを削除する

        _this8._resetAdjustments(); // modal要素から左右のpaddingを削除する


        _this8._resetScrollbar(); // setScrollbarで設定したpaddingとかを削除する
        // hiddenイベントを発動する


        $(_this8._element).trigger(Event$4.HIDDEN);
      });
    };

    _proto._removeBackdrop = function _removeBackdrop() {
      if (this._backdrop) {
        // backdrop要素が存在していた場合
        $(this._backdrop).remove(); // backdrop要素を削除

        this._backdrop = null; // backdrop要素をnullにする
      }
    } // callbackは関数
    ;

    _proto._showBackdrop = function _showBackdrop(callback) {
      var _this9 = this;

      // backdropはmodal表示時の背景
      // http://bootstrap3.cyberlab.info/javascript/modals-options-backdrop.html#usage2
      // modal要素が.fadeを持っている場合はfadeを格納
      // 持っていない場合は空文字
      var animate = $(this._element).hasClass(ClassName$4.FADE) ? ClassName$4.FADE : ''; // _isShownと_config.backdropがtrueの場合
      // modalをshowするとき

      if (this._isShown && this._config.backdrop) {
        // _backdropに<div>を作成する
        this._backdrop = document.createElement('div'); // divに.modal-backdropを付与する

        this._backdrop.className = ClassName$4.BACKDROP; // modal要素が.fadeを持っていた場合

        if (animate) {
          // backdropに.fadeを追加
          this._backdrop.classList.add(animate);
        } // body要素にdiv.modal-backdrop要素を追加


        $(this._backdrop).appendTo(document.body); // クリックを離したときにのイベントを定義

        $(this._element).on(Event$4.CLICK_DISMISS, function (event) {
          // this._ignoreBackdropClickがtrueの場合
          if (_this9._ignoreBackdropClick) {
            // falseにして、処理を終了する
            _this9._ignoreBackdropClick = false;
            return;
          } // クリックを離したところと、イベントハンドラがアタッチされた要素が一致しない場合


          if (event.target !== event.currentTarget) {
            // 処理を終了する
            return;
          } // backdropが'static'の場合は、要素をアニメーションしながらフォーカスする
          // staticじゃない場合はhideする


          _this9._triggerBackdropTransition();
        }); // modal要素が.fadeを持っていた場合

        if (animate) {
          // backdropの高さを取得する
          Util.reflow(this._backdrop);
        } // backdropに.showを追加する


        $(this._backdrop).addClass(ClassName$4.SHOW); // callbackが存在しない場合は処理終了

        if (!callback) {
          return;
        } // .fadeが付与されていなかったらcallbackを実行して処理終了


        if (!animate) {
          callback();
          return;
        } // 以下は、.fadeがmodal要素に付与されていて、callabckが存在する場合
        // backdropの遷移時間を取得する


        var backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop); // backdropの遷移終了時のイベントを定義し、
        // 遷移時間の分だけ送らせて実行

        $(this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(backdropTransitionDuration);
      } else if (!this._isShown && this._backdrop) {
        // isShownがfalseで、backdropがtrueの場合
        // modalをhideするとき
        // backdrop要素から.showを削除
        $(this._backdrop).removeClass(ClassName$4.SHOW); // backdropを削除する関数を定義

        var callbackRemove = function callbackRemove() {
          _this9._removeBackdrop(); // backdropを削除


          if (callback) {
            // callback関数が存在していたら実行
            callback();
          }
        }; // modal要素が.fadeを持っていたら


        if ($(this._element).hasClass(ClassName$4.FADE)) {
          // backdropの遷移時間を取得する
          var _backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop); // backdropの遷移終了時にcallbackRemoveを実行


          $(this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(_backdropTransitionDuration);
        } else {
          // .fadeがなかったらそのままbackdropを削除
          callbackRemove();
        }
      } else if (callback) {
        // _config.backdropがfalseの場合は、
        // callbackを実行
        callback();
      }
    } // ----------------------------------------------------------------------
    // the following methods are used to handle overflowing modals
    // todo (fat): these should probably be refactored out of modal.js
    // ----------------------------------------------------------------------
    ;

    _proto._adjustDialog = function _adjustDialog() {
      // this._elementはmodal要素
      // modal要素の高さが、ブラウザの表示高さを超えていた場合は、true
      // this.elementは表示されてないから、基本は0
      var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight; // _isBodyOverflowingがfalseで、isModalOverflowingがtrueの場合

      if (!this._isBodyOverflowing && isModalOverflowing) {
        // modal要素の実際のpadding-leftをスクロールバーの幅にする
        this._element.style.paddingLeft = this._scrollbarWidth + "px";
      } // _isBodyOverflowingがtrueで、isModalOverflowingがfalseの場合


      if (this._isBodyOverflowing && !isModalOverflowing) {
        // modal要素の実際のpadding-rightをスクロールバーの幅にする
        this._element.style.paddingRight = this._scrollbarWidth + "px";
      }
    };

    _proto._resetAdjustments = function _resetAdjustments() {
      // modal要素から左右のpaddingを削除する
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    };

    _proto._checkScrollbar = function _checkScrollbar() {
      // body要素の幅を取得
      var rect = document.body.getBoundingClientRect(); // body要素の幅(right+left)がwindowのコンテンツ幅より小さいか判定
      // つまりX方向にスクロールバーがあるか確認

      this._isBodyOverflowing = rect.left + rect.right < window.innerWidth; // スクロールバーの横幅を取得

      this._scrollbarWidth = this._getScrollbarWidth();
    };

    _proto._setScrollbar = function _setScrollbar() {
      var _this10 = this;

      // body要素がはみ出ていた場合
      if (this._isBodyOverflowing) {
        // DOMNode.style.paddingRightは実際の値を返す。設定されていない場合は''を返す
        // $(DOMNode).css('padding-right')はcssの値を返す。設定されていない場合は''を返す
        // .fixed-top、.fixed-bottom、.is-fixed、.sticky-topを持つ要素を取得する
        var fixedContent = [].slice.call(document.querySelectorAll(Selector$4.FIXED_CONTENT)); // .sticky-topを持つ要素を取得する

        var stickyContent = [].slice.call(document.querySelectorAll(Selector$4.STICKY_CONTENT)); // 固定コンテンツのpaddingを調整する

        $(fixedContent).each(function (index, element) {
          // fixedContentの実際のpadding-rightを取得する
          var actualPadding = element.style.paddingRight; // fixedContentにcssで設定されているpadding-rightを取得

          var calculatedPadding = $(element).css('padding-right');
          $(element).data('padding-right', actualPadding) // elementに実際のpadding-rightを設定する
          .css('padding-right', parseFloat(calculatedPadding) + _this10._scrollbarWidth + "px"); // elementのpadding-rightにスクロールバーの横幅を足した値を設定する
        }); // stickyコンテンツのmarginを調整する

        $(stickyContent).each(function (index, element) {
          // stickyコンテンツの実際のmargin-rightを取得する
          var actualMargin = element.style.marginRight; // stickyコンテンツにcssで指定されているmargin-rightを取得する

          var calculatedMargin = $(element).css('margin-right');
          $(element).data('margin-right', actualMargin) // elementに実際のmargin-rightを設定する
          .css('margin-right', parseFloat(calculatedMargin) - _this10._scrollbarWidth + "px"); // elementのmargin-rightにスクロールバーの横幅を足した値を設定する
        }); // body要素のpaddingを調整する
        // body要素の実際のpadding-rightを取得する

        var actualPadding = document.body.style.paddingRight; // body要素にcssで指定されているpadding-rightを取得する

        var calculatedPadding = $(document.body).css('padding-right');
        $(document.body).data('padding-right', actualPadding) // body要素に実際のpadding-rightを設定する
        .css('padding-right', parseFloat(calculatedPadding) + this._scrollbarWidth + "px"); // body要素のpadding-rightにスクロールバーの横幅を足した値を設定する
      } // body要素に.modal-openを追加する
      // overflow: hidden;でスクロールバーがなくなった時に、表示がずれないようにするため


      $(document.body).addClass(ClassName$4.OPEN);
    };

    _proto._resetScrollbar = function _resetScrollbar() {
      // fixedコンテンツのpaddindを戻す
      // fixedクラスを持つ要素を取得
      var fixedContent = [].slice.call(document.querySelectorAll(Selector$4.FIXED_CONTENT));
      $(fixedContent).each(function (index, element) {
        // _setScrollbarで設定したpadding-rightを取得する
        var padding = $(element).data('padding-right'); // padding-right属性を削除

        $(element).removeData('padding-right'); // paddingが存在したらそれを代入。なかったら空文字

        element.style.paddingRight = padding ? padding : '';
      }); // stickyコンテンツのpaddingを戻す
      // .sticky-topが付与された要素を収録

      var elements = [].slice.call(document.querySelectorAll("" + Selector$4.STICKY_CONTENT));
      $(elements).each(function (index, element) {
        // 要素からmargin-rightを取得
        var margin = $(element).data('margin-right'); // marginがundefinedじゃなかったら

        if (typeof margin !== 'undefined') {
          // .sticky-topのmargin-rightを削除する
          $(element).css('margin-right', margin).removeData('margin-right');
        }
      }); // bodyのpadding-rightを戻す

      var padding = $(document.body).data('padding-right'); // modyのpadding-rightを咲くjおする

      $(document.body).removeData('padding-right'); // paddingが存在したらその値、なかったら空文字

      document.body.style.paddingRight = padding ? padding : '';
    };

    _proto._getScrollbarWidth = function _getScrollbarWidth() {
      // thx d.walsh
      // div要素を作成
      var scrollDiv = document.createElement('div'); // divに.modal-scrollbar-measurerを付与

      scrollDiv.className = ClassName$4.SCROLLBAR_MEASURER; // scrolldivをbody要素に追加

      document.body.appendChild(scrollDiv); // scrollDiv.getBoundingClientRectはscssで指定したwidthを取得(50px)
      // clientWidthはスクロールバーの横幅を含まないscrollDivの横幅を取得
      // これを引くと、スクロールバーの横幅になる

      var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth; // scrollDivを削除

      document.body.removeChild(scrollDiv); // スクロールバーの横幅を返す

      return scrollbarWidth;
    } // Static
    // relatedTargetはクリックされるbtn要素
    ;

    Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        // thisはmodal要素
        // thisのDATA_KEYを取得
        var data = $(this).data(DATA_KEY$4); // _configに値を格納する

        var _config = _objectSpread2({}, Default$2, {}, $(this).data(), {}, typeof config === 'object' && config ? config : {}); // dataが存在していなかったら


        if (!data) {
          // modalをインスタンス化してdataに格納する
          data = new Modal(this, _config); // dataをmodal要素に入れる

          $(this).data(DATA_KEY$4, data);
        } // configがStringの場合


        if (typeof config === 'string') {
          // modalクラスにメソッドが存在するか確認
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          } // メソッドが存在した場合は、relatedTargetを引数に実行する


          data[config](relatedTarget);
        } else if (_config.show) {
          // _config.showがtrueの場合
          // relatedTargetを引数にshowを実行する
          data.show(relatedTarget);
        }
      });
    };

    _createClass(Modal, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$4;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$2;
      }
    }]);

    return Modal;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */
  // sc.modal.data-apiのイベントを定義する
  // 対象は、 [data-toggle="modal"]


  $(document).on(Event$4.CLICK_DATA_API, Selector$4.DATA_TOGGLE, function (event) {
    var _this11 = this;

    var target; // thisは[data-toggle="modal"]が付与されているelement
    // [data-toggle="modal"]要素で指定されている['data-target"]かhrefを取得する
    // つまり、modal要素

    var selector = Util.getSelectorFromElement(this); // selectorが存在したら

    if (selector) {
      // targetにselectorを元に取得した要素を格納する
      target = document.querySelector(selector);
    } // $(target).data(DATA_KEY)が存在したら'toggle'を格納する
    // 存在していない場合は、


    var config = $(target).data(DATA_KEY$4) ? 'toggle' : _objectSpread2({}, $(target).data(), {}, $(this).data()); // thisのhtmlが<a>か<area>だったらブラウザのデフォルト動作を禁止する
    // <a>クリックでページが変わるとか

    if (this.tagName === 'A' || this.tagName === 'AREA') {
      event.preventDefault();
    } // modalのshowイベントをバインドしてshow時に無名関数を実行する


    var $target = $(target).one(Event$4.SHOW, function (showEvent) {
      // showEventがブラウザの動作を停止していたら
      if (showEvent.isDefaultPrevented()) {
        // modalが実際に表示される場合のみforcusする
        return;
      } // modalのhiddenイベントをバインドして、hidden時に無名関数を実行する


      $target.one(Event$4.HIDDEN, function () {
        // thisは[data-toggle="modal"]が付与された要素
        // それが表示状態なら
        if ($(_this11).is(':visible')) {
          // focusする
          _this11.focus();
        }
      });
    }); // configとthisはjQueryInterfaceに渡す引数

    Modal._jQueryInterface.call($(target), config, this);
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$4] = Modal._jQueryInterface;
  $.fn[NAME$4].Constructor = Modal;

  $.fn[NAME$4].noConflict = function () {
    $.fn[NAME$4] = JQUERY_NO_CONFLICT$4;
    return Modal._jQueryInterface;
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.4.1): tools/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */
  var uriAttrs = ['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href'];
  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  var DefaultWhitelist = {
    // htmlタグにつけることを許可された属性達
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  };
  /**
   * 安全なURLのパターン
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */

  var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;
  /**
   * 安全なdataのURLパターン。画像、ビデオ、音声のみが一致する
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */

  var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i; // attrはhtmlの属性、allowedAttributeListは許可されている属性一覧

  function allowedAttribute(attr, allowedAttributeList) {
    // attrの属性とかを小文字で取得する
    var attrName = attr.nodeName.toLowerCase(); // allowedAttributeListにattrNameがあるか探す。なかったら-1が帰ってくる

    if (allowedAttributeList.indexOf(attrName) !== -1) {
      // uriAttrsにattrNameがあるか探す
      if (uriAttrs.indexOf(attrName) !== -1) {
        // 値が真偽か判定して真偽を返す
        // attrの中で安全なURLと安全なdataURLと一致するものがあったらtrue
        // なかったらfalse
        return Boolean(attr.nodeValue.match(SAFE_URL_PATTERN) || attr.nodeValue.match(DATA_URL_PATTERN));
      } // 属性がなかったらtrueを返す。処理はここで終わり


      return true;
    } // allowedAttributeListから正規表現として使える文字を選別


    var regExp = allowedAttributeList.filter(function (attrRegex) {
      return attrRegex instanceof RegExp;
    }); // attrNameの中にregExpとマッチするものがあるか確認

    for (var i = 0, l = regExp.length; i < l; i++) {
      if (attrName.match(regExp[i])) {
        return true;
      }
    }

    return false;
  }

  function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
    // unsafeHtmlがなかったらそのまま返す
    if (unsafeHtml.length === 0) {
      return unsafeHtml;
    } // sanitizeFnがtrueで、functionならsanitizeFnを実行して返す


    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeHtml);
    }

    var domParser = new window.DOMParser(); // DOMツリー作成

    var createdDocument = domParser.parseFromString(unsafeHtml, 'text/html'); // whitelistのキーをwhitelistKeysに入れる

    var whitelistKeys = Object.keys(whiteList); // createdDocumentの要素を1個ずつ取得する

    var elements = [].slice.call(createdDocument.body.querySelectorAll('*')); // エレメントの数だけ回すよ

    var _loop = function _loop(i, len) {
      // elにelementsのi番目を入れる
      var el = elements[i]; // nodeNameを小文字で取得する
      // 取得するnodeNameには、Classも含まれる

      var elName = el.nodeName.toLowerCase(); // el.nodeNameがwhitelistKeysにあるか判定。
      // '*'には一致しないんだね

      if (whitelistKeys.indexOf(el.nodeName.toLowerCase()) === -1) {
        // elを削除
        el.parentNode.removeChild(el); // forの条件式に戻る

        return "continue";
      } // elの属性を取得
      // roleとかclass


      var attributeList = [].slice.call(el.attributes); // whiteList[*]は全部に適用されるので、基本入れる
      // whiteList[elName]は該当するelementがあれば入れる
      // []は多分区切り

      var whitelistedAttributes = [].concat(whiteList['*'] || [], whiteList[elName] || []); // attributeList(htmlについてたclassとかの属性)

      attributeList.forEach(function (attr) {
        // attrが許可された属性か判定
        if (!allowedAttribute(attr, whitelistedAttributes)) {
          // 許可されてなかったらElementsから属性を削除
          el.removeAttribute(attr.nodeName);
        }
      });
    };

    for (var i = 0, len = elements.length; i < len; i++) {
      var _ret = _loop(i);

      if (_ret === "continue") continue;
    } // サニタイズしたHTMLを返却


    return createdDocument.body.innerHTML;
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$5 = 'tooltip';
  var VERSION$5 = '4.4.1';
  var DATA_KEY$5 = 'sc.tooltip';
  var EVENT_KEY$5 = "." + DATA_KEY$5;
  var JQUERY_NO_CONFLICT$5 = $.fn[NAME$5];
  var CLASS_PREFIX = 'sc-tooltip';
  var SCCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];
  var DefaultType$3 = {
    animation: 'boolean',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string',
    delay: '(number|object)',
    html: 'boolean',
    selector: '(string|boolean)',
    placement: '(string|function)',
    offset: '(number|string|function)',
    container: '(string|element|boolean)',
    fallbackPlacement: '(string|array)',
    boundary: '(string|element)',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    whiteList: 'object',
    popperConfig: '(null|object)'
  };
  var AttachmentMap$1 = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left'
  };
  var Default$3 = {
    animation: true,
    template: '<div class="tooltip" role="tooltip">' + '<div class="arrow"></div>' + '<div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    selector: false,
    placement: 'top',
    offset: 0,
    container: false,
    fallbackPlacement: 'flip',
    boundary: 'scrollParent',
    sanitize: true,
    sanitizeFn: null,
    whiteList: DefaultWhitelist,
    popperConfig: null
  };
  var HoverState = {
    SHOW: 'show',
    OUT: 'out'
  };
  var Event$5 = {
    HIDE: "hide" + EVENT_KEY$5,
    HIDDEN: "hidden" + EVENT_KEY$5,
    SHOW: "show" + EVENT_KEY$5,
    SHOWN: "shown" + EVENT_KEY$5,
    INSERTED: "inserted" + EVENT_KEY$5,
    CLICK: "click" + EVENT_KEY$5,
    FOCUSIN: "focusin" + EVENT_KEY$5,
    FOCUSOUT: "focusout" + EVENT_KEY$5,
    MOUSEENTER: "mouseenter" + EVENT_KEY$5,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$5
  };
  var ClassName$5 = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$5 = {
    TOOLTIP: '.tooltip',
    TOOLTIP_INNER: '.tooltip-inner',
    ARROW: '.arrow'
  };
  var Trigger = {
    HOVER: 'hover',
    FOCUS: 'focus',
    CLICK: 'click',
    MANUAL: 'manual'
  };

  var Tooltip = /*#__PURE__*/function () {
    // elementは data-toggle="tooltip"が付与されたelement
    // configはobject(config)かfalse
    function Tooltip(element, config) {
      // popperがなかったら、throw
      if (typeof Popper === 'undefined') {
        throw new TypeError('Simplicss\'s tooltips require Popper.js (https://popper.js.org/)');
      } // private


      this._isEnabled = true;
      this._timeout = 0;
      this._hoverState = '';
      this._activeTrigger = {};
      this._popper = null; // Protected

      this.element = element;
      this.config = this._getConfig(config);
      this.tip = null;

      this._setListeners();
    } // Getters


    var _proto = Tooltip.prototype;

    // Public
    _proto.enable = function enable() {
      this._isEnabled = true;
    };

    _proto.disable = function disable() {
      this._isEnabled = false;
    };

    _proto.toggleEnabled = function toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    };

    _proto.toggle = function toggle(event) {
      // this._isEnabledがfalseなら処理終了
      if (!this._isEnabled) {
        return;
      } // イベントが存在した場合


      if (event) {
        // dataKeyを格納
        var dataKey = this.constructor.DATA_KEY; // event.currentTargetからdataKeyの値を取得（Tooltipのclass）

        var context = $(event.currentTarget).data(dataKey); // contextがなかったら再設定する

        if (!context) {
          context = new this.constructor(event.currentTarget, this._getDelegateConfig());
          $(event.currentTarget).data(dataKey, context);
        } // event.currentTargetの逆の値を格納


        context._activeTrigger.click = !context._activeTrigger.click; // _activeTriggerがtrueだったら

        if (context._isWithActiveTrigger()) {
          // showの処理
          context._enter(null, context);
        } else {
          // falseならhideの処理
          context._leave(null, context);
        }
      } else {
        // _activeTriggerがfalseの場合
        // tipelementがshowクラスを持っていたら
        if ($(this.getTipElement()).hasClass(ClassName$5.SHOW)) {
          // hide処理を実行
          this._leave(null, this); // 処理終了


          return;
        } // showを持っていなかったらshowをする


        this._enter(null, this);
      }
    };

    _proto.dispose = function dispose() {
      // タイムアウトを削除
      clearTimeout(this._timeout); // this.elementに紐付いているdataを削除（Tooltipクラス）

      $.removeData(this.element, this.constructor.DATA_KEY); // this.elementに紐付いているイベントを削除

      $(this.element).off(this.constructor.EVENT_KEY); // .modalに紐付いているイベントも削除

      $(this.element).closest('.modal').off('hide.sc.modal', this._hideModalHandler); // this.tipがあったら削除

      if (this.tip) {
        $(this.tip).remove();
      } // 各設定を削除


      this._isEnabled = null;
      this._timeout = null;
      this._hoverState = null;
      this._activeTrigger = null;

      if (this._popper) {
        this._popper.destroy();
      }

      this._popper = null;
      this.element = null;
      this.config = null;
      this.tip = null;
    };

    _proto.show = function show() {
      var _this = this;

      // 対象のElementsがdisplay:noneだったらエラーにする
      if ($(this.element).css('display') === 'none') {
        throw new Error('Please use show on visible elements');
      } // showEventにshow.sc.tooltipを入れる


      var showEvent = $.Event(this.constructor.Event.SHOW); // titleが存在していて、isEnableがtrue

      if (this.isWithContent() && this._isEnabled) {
        // showイベントを発動する
        $(this.element).trigger(showEvent); // this,.elementに関連するshadow dowのrootを取得する

        var shadowRoot = Util.findShadowRoot(this.element); // jQuery.contains( 対象の要素 ,含まれているか調べたい要素 )

        var isInTheDom = $.contains( // shadowRootがnullじゃなかったらshadowRootが対象の要素
        // nullだった場合は、this.elementを内包するトップレベルのdocument(bodyとか)
        shadowRoot !== null ? shadowRoot : this.element.ownerDocument.documentElement, this.element // this.elementを探す
        ); // showイベントがブラウザの動作を停止している
        // もしくは、this.elementがdomにない場合は処理終了

        if (showEvent.isDefaultPrevented() || !isInTheDom) {
          return;
        } // tip elementの取得


        var tip = this.getTipElement(); // 固有IDを取得

        var tipId = Util.getUID(this.constructor.NAME); // tipに対して、固有のIDを設定

        tip.setAttribute('id', tipId); // this.elementに対して、tipIDを設定

        this.element.setAttribute('aria-describedby', tipId); // tipにコンテンツの内容を設定する。あとshowとfadeクラスがあったら削除する

        this.setContent(); // animationがtrueの場合

        if (this.config.animation) {
          // fadeクラスを付与する
          $(tip).addClass(ClassName$5.FADE);
        } // placementがfunctionなら、実行する
        // functionじゃない場合は、this.config.placementを入れる


        var placement = typeof this.config.placement === 'function' ? this.config.placement.call(this, tip, this.element) : this.config.placement; // AttachmentMapから該当するplacementを取得する

        var attachment = this._getAttachment(placement); // sc-tooltip-topなどのクラスを付与する


        this.addAttachmentClass(attachment); // body要素を取得する

        var container = this._getContainer(); // tipにthis(tooltip)データを設定する


        $(tip).data(this.constructor.DATA_KEY, this); // this.element.ownerDocument.documentElementはhtml要素
        // this.tipはtooltip
        // htmlにtolltipの要素があるか確認する

        if (!$.contains(this.element.ownerDocument.documentElement, this.tip)) {
          // htmlにthis.tipが含まれていなかったらtipをcontainer(body要素)に追加する
          // ここでhtmlに要素を追加して、tooltipを表示してる
          $(tip).appendTo(container);
        } // inserted.sc.tooltipはツールチップテンプレートがDOMに追加されたときに show.sc.tooltip イベントの後に発動。


        $(this.element).trigger(this.constructor.Event.INSERTED); // this.popperをインスタンス化
        // popperは位置調整

        this._popper = new Popper(this.element, tip, this._getPopperConfig(attachment)); // tipにshowクラスを設定する

        $(tip).addClass(ClassName$5.SHOW); // iOSのために、空のマウスオーバリスナーを追加
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

        if ('ontouchstart' in document.documentElement) {
          $(document.body).children().on('mouseover', null, $.noop);
        }

        var complete = function complete() {
          // animationがtrueの場合
          if (_this.config.animation) {
            // popperで定義した表示位置を調整してる
            _this._fixTransition();
          } // hoverStateを代入


          var prevHoverState = _this._hoverState; // hoverStateをnullにする

          _this._hoverState = null; // shownイベントを実行する

          $(_this.element).trigger(_this.constructor.Event.SHOWN); // prevHoverStateがoutなら

          if (prevHoverState === HoverState.OUT) {
            // hoveroutしたときにhideする関数
            _this._leave(null, _this);
          }
        }; // tipがfadeクラスをもってたら


        if ($(this.tip).hasClass(ClassName$5.FADE)) {
          // tip要素から遷移時間を取得
          var transitionDuration = Util.getTransitionDurationFromElement(this.tip); // tipに一度だけ(one)実行されるcompleteをバインド

          $(this.tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
        } else {
          // そのままcompleteを実行
          complete();
        }
      }
    };

    _proto.hide = function hide(callback) {
      var _this2 = this;

      // tipのelementを取得
      var tip = this.getTipElement(); // hideイベントを定義

      var hideEvent = $.Event(this.constructor.Event.HIDE);

      var complete = function complete() {
        // tipのHoverStateがshowじゃなく、tipにparentNodeが存在する場合
        if (_this2._hoverState !== HoverState.SHOW && tip.parentNode) {
          // parentNodeからtipを削除する
          tip.parentNode.removeChild(tip);
        } // tipからsc-tooltipと名のつくクラスを削除する


        _this2._cleanTipClass(); // this.elementはdata-toggle="tooltip"がついている要素


        _this2.element.removeAttribute('aria-describedby'); // hiddenイベントを発動


        $(_this2.element).trigger(_this2.constructor.Event.HIDDEN); // popperが存在していたら

        if (_this2._popper !== null) {
          // popperを破棄する
          _this2._popper.destroy();
        } // 引数のcallbackがあったら


        if (callback) {
          // callbackを実行する
          callback();
        }
      }; // hideイベントを実行する


      $(this.element).trigger(hideEvent); // hideイベントがブラウザの機能を停止していたら
      // 処理終了

      if (hideEvent.isDefaultPrevented()) {
        return;
      } // tipからshowクラスを削除する


      $(tip).removeClass(ClassName$5.SHOW); // iOSのために、空のマウスオーバリスナーを追加
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

      if ('ontouchstart' in document.documentElement) {
        $(document.body).children().off('mouseover', null, $.noop);
      } // activeTriggerのclick、focus、hoverをfalseにする


      this._activeTrigger[Trigger.CLICK] = false;
      this._activeTrigger[Trigger.FOCUS] = false;
      this._activeTrigger[Trigger.HOVER] = false; // tipがfadeクラスを持ってたら

      if ($(this.tip).hasClass(ClassName$5.FADE)) {
        // tip要素から遷移時間を取得
        var transitionDuration = Util.getTransitionDurationFromElement(tip); // tipに一度だけ(one)実行されるcompleteをバインド

        $(tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        // fadeを持ってなかったらそのまま実行
        complete();
      } // hoverStateに空文字を入れる


      this._hoverState = '';
    };

    _proto.update = function update() {
      // popperのスケジュールをアップデートする
      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    } // Protected
    ;

    _proto.isWithContent = function isWithContent() {
      // titleが存在しているか判定
      return Boolean(this.getTitle());
    } // AttachmentMapから取得したtooltipが出る場所
    ;

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      // tipのelementにsc-tooltip-topなどのクラスを付与する
      $(this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      // this.tipはHTML elementのtooltip
      // this.config.templateは、Defaultのtooltipテンプレート
      this.tip = this.tip || $(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      // tipのelementを取得する
      var tip = this.getTipElement(); // tipにテキストを設定する

      this.setElementContent($(tip.querySelectorAll(Selector$5.TOOLTIP_INNER)), this.getTitle()); // tipからfadeとshowクラスを削除する

      $(tip).removeClass(ClassName$5.FADE + " " + ClassName$5.SHOW);
    } // elementは.tooltip-inner
    // contentはtitle
    ;

    _proto.setElementContent = function setElementContent($element, content) {
      // コンテンツがオブジェクトで、content.nodeTypeまたはcontent.jqueryが存在するか
      if (typeof content === 'object' && (content.nodeType || content.jquery)) {
        // contentがDOMノードまたはjQuery
        // config.htmlがfalse以外の場合
        if (this.config.html) {
          // contentの親要素が.tooltip-innerの場合
          if (!$(content).parent().is($element)) {
            // .tooltip-innerの子要素を全て削除してcontentを追加する
            $element.empty().append(content);
          }
        } else {
          // elementのテキストをcontentのテキストにする
          $element.text($(content).text());
        }

        return;
      } // config.htmlが存在する場合


      if (this.config.html) {
        // contentをサニタイズ
        if (this.config.sanitize) {
          content = sanitizeHtml(content, this.config.whiteList, this.config.sanitizeFn);
        } // elementのhtmlをcontentに変更


        $element.html(content);
      } else {
        // elementのtextをcontentにする
        $element.text(content);
      }
    };

    _proto.getTitle = function getTitle() {
      // elementのタイトルを取得
      var title = this.element.getAttribute('data-original-title'); // タイトルが存在しなかったら

      if (!title) {
        // this.config,titleがfunctionなら実行してその結果を返す
        // 単純にtitleがなかったらDefaultのtitleを使う
        title = typeof this.config.title === 'function' ? this.config.title.call(this.element) : this.config.title;
      }

      return title;
    } // Private
    // 引数は表示位置(topとか)
    ;

    _proto._getPopperConfig = function _getPopperConfig(attachment) {
      var _this3 = this;

      // defaultのconfig
      var defaultScConfig = {
        placement: attachment,
        modifiers: {
          offset: this._getOffset(),
          flip: {
            behavior: this.config.fallbackPlacement
          },
          arrow: {
            element: Selector$5.ARROW
          },
          preventOverflow: {
            boundariesElement: this.config.boundary
          }
        },
        onCreate: function onCreate(data) {
          if (data.originalPlacement !== data.placement) {
            // popperの表示位置を設定する
            _this3._handlePopperPlacementChange(data);
          }
        },
        onUpdate: function onUpdate(data) {
          return _this3._handlePopperPlacementChange(data);
        }
      };
      return _objectSpread2({}, defaultScConfig, {}, this.config.popperConfig);
    };

    _proto._getOffset = function _getOffset() {
      var _this4 = this;

      var offset = {}; // offsetがfunctionなら

      if (typeof this.config.offset === 'function') {
        // dataはpopperみたい
        offset.fn = function (data) {
          // popperのoffsetに、展開して入れる
          data.offsets = _objectSpread2({}, data.offsets, {}, _this4.config.offset(data.offsets, _this4.element) || {});
          return data;
        };
      } else {
        // configのoffsetを代入
        offset.offset = this.config.offset;
      }

      return offset;
    };

    _proto._getContainer = function _getContainer() {
      if (this.config.container === false) {
        // body要素を返す
        return document.body;
      }

      if (Util.isElement(this.config.container)) {
        return $(this.config.container);
      }

      return $(document).find(this.config.container);
    };

    _proto._getAttachment = function _getAttachment(placement) {
      // AttachmentMapから該当するplacementを取得する
      return AttachmentMap$1[placement.toUpperCase()];
    };

    _proto._setListeners = function _setListeners() {
      var _this5 = this;

      // this.config.triggerを' '(半角スペース)で分割する
      // Defaultならhoverとfocusになる
      var triggers = this.config.trigger.split(' '); // triggerの分だけ繰り返す

      triggers.forEach(function (trigger) {
        // triggerがclickだったら
        if (trigger === 'click') {
          $(_this5.element).on( // click.sc.tooltip
          _this5.constructor.Event.CLICK, // Defaultはfalse
          _this5.config.selector, function (event) {
            return _this5.toggle(event);
          } // toggleさせる
          );
        } else if (trigger !== Trigger.MANUAL) {
          // Triggerがmanualじゃなかったら。(hoverかfocus)
          // triggerがhoverか判定
          var eventIn = trigger === Trigger.HOVER ? _this5.constructor.Event.MOUSEENTER // trueはmouseenter.sc.tooltipを入れる
          : _this5.constructor.Event.FOCUSIN; // falseはfocusin.sc.tooltipを入れる
          // triggerがhoverか判定

          var eventOut = trigger === Trigger.HOVER ? _this5.constructor.Event.MOUSELEAVE // trueはmouseleave.sc.tooltipを入れる
          : _this5.constructor.Event.FOCUSOUT; // trueはfoucusout.sc.tooltipを入れる

          $(_this5.element).on(eventIn, // mouseenter.sc.tooltip
          _this5.config.selector, // Defaultはfalse
          function (event) {
            return _this5._enter(event);
          } // showさせる
          ).on(eventOut, // mouseleave.sc.tooltip
          _this5.config.selector, // Defaultはfalse
          function (event) {
            return _this5._leave(event);
          } // hideさせる
          );
        }
      }); // _hideModalHandlerを定義

      this._hideModalHandler = function () {
        // this.elementがあったら
        if (_this5.element) {
          // elementをhideする
          _this5.hide();
        }
      }; // tooltip付近のmodalに対して、hide.sc.modalを設定


      $(this.element).closest('.modal').on('hide.sc.modal', this._hideModalHandler); // this.config.selectorがtrueだったら

      if (this.config.selector) {
        this.config = _objectSpread2({}, this.config, {
          // this.configを展開して格納
          trigger: 'manual',
          // triggerをmanualに設定
          selector: '' // selectorは空文字にする

        });
      } else {
        // falseならfixTitleを実行
        this._fixTitle();
      }
    };

    _proto._fixTitle = function _fixTitle() {
      // data-original-titleを取得して、そのTypeを判定
      var titleType = typeof this.element.getAttribute('data-original-title'); // this.elementにtitleが存在していて、titleTypeがstringじゃない場合

      if (this.element.getAttribute('title') || titleType !== 'string') {
        this.element.setAttribute('data-original-title', this.element.getAttribute('title') || '' // title属性があるならtitle属性の値で、無いなら空文字
        ); // this.elementのtitle属性を空文字にする

        this.element.setAttribute('title', '');
      }
    } // eventはmouseoverとかのイベント
    ;

    _proto._enter = function _enter(event, context) {
      // dataKeyにsc.tooltipを入れる
      var dataKey = this.constructor.DATA_KEY; // event.currentTargetはtooltipが付与されているelement
      // 引数のcontextか、jQueryInterfaceでelementに入れたやつを入れる

      context = context || $(event.currentTarget).data(dataKey); // contextが存在しているか確認

      if (!context) {
        // contextがない場合は、tooltipのコンストラクタを読んどくみたい
        context = new this.constructor( // tooltipが付与されたelement
        event.currentTarget, // defaultにないtooltip.configを追加する
        this._getDelegateConfig()); // tooltipが付与された要素に対して、sc.tooltipのデータキーで
        // context(tooltipのインスタンス)を入れる

        $(event.currentTarget).data(dataKey, context);
      } // eventが存在してたら


      if (event) {
        // event.typeがfocusinだったら、focusをtrueにする
        // focusinじゃなかったらhoverをtrueにする
        context._activeTrigger[event.type === 'focusin' ? Trigger.FOCUS : Trigger.HOVER] = true;
      } // div.tooltipがshowクラスを持っているもしくは、contextの_hoverStateがshowだった場合


      if ($(context.getTipElement()).hasClass(ClassName$5.SHOW) || context._hoverState === HoverState.SHOW) {
        // context._hoverStateにshowを入れる
        context._hoverState = HoverState.SHOW;
        return;
      } // setTimeout()を使用して設定された遅延処理を取り消す


      clearTimeout(context._timeout); // context._hoverStateにshowを入れる

      context._hoverState = HoverState.SHOW; // context.config.delayが存在していなくて、delay.showが0の場合

      if (!context.config.delay || !context.config.delay.show) {
        // showを発動
        context.show(); // 処理終了

        return;
      } // context._timeoutにdelay.showの分だけ遅らせたshowを発動する


      context._timeout = setTimeout(function () {
        // hoverStateがshowの場合
        if (context._hoverState === HoverState.SHOW) {
          context.show();
        }
      }, context.config.delay.show);
    };

    _proto._leave = function _leave(event, context) {
      // datakeyを取得
      var dataKey = this.constructor.DATA_KEY; // 引数にもよるけど、contextはtootip。それかイベントのcurrentTarget(datakey)の値

      context = context || $(event.currentTarget).data(dataKey); // contextが存在してなかったら

      if (!context) {
        context = new this.constructor( // tooltipが付与されたelement
        event.currentTarget, // ユーザ側でconfigが設定されてたら上書きする
        this._getDelegateConfig()); // eventのcurrentTargetにcontextを設定する

        $(event.currentTarget).data(dataKey, context);
      } // eventが存在していたら


      if (event) {
        // event.typeがfocusoutだったらfucusに対してfalseを設定
        // 違っかたらhoverに対してfalseを設定
        context._activeTrigger[event.type === 'focusout' ? Trigger.FOCUS : Trigger.HOVER] = false;
      } // _activeTriggerがtrueなら処理終了


      if (context._isWithActiveTrigger()) {
        return;
      } // タイムアウトを削除


      clearTimeout(context._timeout); // hoverStateにoutを設定

      context._hoverState = HoverState.OUT; // delayが0か、delay.hideが存在してなかったら

      if (!context.config.delay || !context.config.delay.hide) {
        // tolltipのhideを実行して処理終了
        context.hide();
        return;
      } // delay.hideの分だけhideを遅らせて発動


      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.OUT) {
          context.hide();
        }
      }, context.config.delay.hide);
    };

    _proto._isWithActiveTrigger = function _isWithActiveTrigger() {
      // this._activeTrigger分回す
      for (var trigger in this._activeTrigger) {
        // trueだったら
        if (this._activeTrigger[trigger]) {
          // trueを返す
          return true;
        }
      } // .activeTriggerがfalseしかなかったり、forで回すための
      // 値がなかったらfalseを返す


      return false;
    } // configはobject(config)かfalse
    ;

    _proto._getConfig = function _getConfig(config) {
      // sc.tooltipとか
      // placementとかtoggleの指定があればそれも
      var dataAttributes = $(this.element).data(); // dataAttributesのキーを取得してその分ループしまくる

      Object.keys(dataAttributes).forEach(function (dataAttr) {
        // 禁止されているdataAttrがないか存在しているか確認。
        // ['sanitize', 'whiteList', 'sanitizeFn']
        if (DISALLOWED_ATTRIBUTES.indexOf(dataAttr) !== -1) {
          // 存在している場合はそのdataAttrを削除する
          delete dataAttributes[dataAttr];
        }
      });
      config = _objectSpread2({}, this.constructor.Default, {}, dataAttributes, {}, typeof config === 'object' && config ? config : {}); // config.delayがnumberだった場合

      if (typeof config.delay === 'number') {
        config.delay = {
          // config.delayのshowとhideに
          // config.delayの値を代入
          show: config.delay,
          hide: config.delay
        };
      } // config.titleがnumberだった場合
      // Stringに変換する


      if (typeof config.title === 'number') {
        config.title = config.title.toString();
      } // config.cotentがnumberだった場合
      // Stringに変換する


      if (typeof config.content === 'number') {
        config.content = config.content.toString();
      } // configの各値のtypeがDefaultTypeの通りになっているか確認
      // 例えば、configのanimationの型はbooleanかどうかとか


      Util.typeCheckConfig(NAME$5, config, this.constructor.DefaultType); // config.sanitizeがtrueなら
      // Defaultはtrue

      if (config.sanitize) {
        // config.sanitizeFnはDefaultはfalse
        // config.whiteListはsanitaizer.jsのwhitelist
        config.template = sanitizeHtml(config.template, config.whiteList, config.sanitizeFn);
      } // configを返す


      return config;
    };

    _proto._getDelegateConfig = function _getDelegateConfig() {
      var config = {};

      if (this.config) {
        // tooltipのconfigのkey分だけfor
        for (var key in this.config) {
          // Defaultのkeyの値と、this.configのkeyの値が不一致だったら
          if (this.constructor.Default[key] !== this.config[key]) {
            // configのkeyに、this.configのkeyの値を入れる
            config[key] = this.config[key];
          }
        }
      }

      return config;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      // tipの要素を取得
      var $tip = $(this.getTipElement()); // tipのclassにマッチしているものがあるか確認

      var tabClass = $tip.attr('class').match(SCCLS_PREFIX_REGEX); // tabClassに値があったら

      if (tabClass !== null && tabClass.length) {
        // TabClassに該当するクラスを全て削除する
        $tip.removeClass(tabClass.join(''));
      }
    } // popperの表示位置を変更するとかの処理だと思う
    ;

    _proto._handlePopperPlacementChange = function _handlePopperPlacementChange(popperData) {
      // popperのインスタンスを格納
      var popperInstance = popperData.instance;
      this.tip = popperInstance.popper; // tipからクラスを削除する

      this._cleanTipClass(); // popperData.placementから取得した表示位置クラスを設定する


      this.addAttachmentClass(this._getAttachment(popperData.placement));
    };

    _proto._fixTransition = function _fixTransition() {
      // tipのelementを取得
      var tip = this.getTipElement(); // configのanimetionを取得

      var initConfigAnimation = this.config.animation; // tipにx-placementがなかったら処理終了

      if (tip.getAttribute('x-placement') !== null) {
        return;
      } // tipのfadeクラスを削除する


      $(tip).removeClass(ClassName$5.FADE); // configのanimetionをfalseにする

      this.config.animation = false; // tolltipのhideを実行

      this.hide(); // tolltipのshowを実行

      this.show(); // config.animationにanimationを再設定

      this.config.animation = initConfigAnimation;
    } // Static
    // 引数はtooltip({container: $('#customContainer')[0]})とかのオブジェクト
    // あと、tooltip('show')のshowとか
    ;

    Tooltip._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // $('#target').tooltipみたいな形な記述があればtooltipが入る
        // その時、configに指定された値が入る。placement : 'top'とか
        var data = $(this).data(DATA_KEY$5); // configがobjectならobjectを_configに入れる
        // それ以外(undefinedとかshowとか)ならfalseを入れる

        var _config = typeof config === 'object' && config; // dataがundefinedで、configがdisposeまたは、hideにマッチする場合
        // 処理を終了する


        if (!data && /dispose|hide/.test(config)) {
          return;
        } // dataがundefinedの場合


        if (!data) {
          // dataにインスタンス化したTooltipを入れる
          // thisはdata-toggle="tooltip"が指定されてるelements
          // _configはfalseかobject
          data = new Tooltip(this, _config); // elementsに対して、sc.tooltipって名前でdata(tooltipのインスタンス)
          // を設定する

          $(this).data(DATA_KEY$5, data);
        } // configがstringの場合(showとか)


        if (typeof config === 'string') {
          // tooltipsにconfigと同じ名前のメソッドがあるか判定
          // 存在しない場合は、ないよっていう
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          } // throwされなかった場合は、configと同じ名前のメソッドを実行する


          data[config]();
        }
      });
    };

    _createClass(Tooltip, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$5;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$3;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME$5;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY$5;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event$5;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY$5;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$3;
      }
    }]);

    return Tooltip;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$5] = Tooltip._jQueryInterface;
  $.fn[NAME$5].Constructor = Tooltip;

  $.fn[NAME$5].noConflict = function () {
    $.fn[NAME$5] = JQUERY_NO_CONFLICT$5;
    return Tooltip._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$6 = 'popover';
  var VERSION$6 = '4.4.1';
  var DATA_KEY$6 = 'sc.popover';
  var EVENT_KEY$6 = "." + DATA_KEY$6;
  var JQUERY_NO_CONFLICT$6 = $.fn[NAME$6];
  var CLASS_PREFIX$1 = 'sc-popover';
  var SCCLS_PREFIX_REGEX$1 = new RegExp("(^|\\s)" + CLASS_PREFIX$1 + "\\S+", 'g');

  var Default$4 = _objectSpread2({}, Tooltip.Default, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip">' + '<div class="arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div></div>'
  });

  var DefaultType$4 = _objectSpread2({}, Tooltip.DefaultType, {
    content: '(string|element|function)'
  });

  var ClassName$6 = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$6 = {
    TITLE: '.popover-header',
    CONTENT: '.popover-body'
  };
  var Event$6 = {
    HIDE: "hide" + EVENT_KEY$6,
    HIDDEN: "hidden" + EVENT_KEY$6,
    SHOW: "show" + EVENT_KEY$6,
    SHOWN: "shown" + EVENT_KEY$6,
    INSERTED: "inserted" + EVENT_KEY$6,
    CLICK: "click" + EVENT_KEY$6,
    FOCUSIN: "focusin" + EVENT_KEY$6,
    FOCUSOUT: "focusout" + EVENT_KEY$6,
    MOUSEENTER: "mouseenter" + EVENT_KEY$6,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$6
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */
  // Tooltipを継承するみたい

  var Popover = /*#__PURE__*/function (_Tooltip) {
    _inheritsLoose(Popover, _Tooltip);

    function Popover() {
      return _Tooltip.apply(this, arguments) || this;
    }

    var _proto = Popover.prototype;

    // Overrides
    // tooltipのメソッドを書き換える
    // 存在した場合はtooltipのshowを継続する
    _proto.isWithContent = function isWithContent() {
      // 存在する方のみ返す
      return this.getTitle() || this._getContent();
    };

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      // popoverのCLASS_PREFIXが使われるようにする
      $(this.getTipElement()).addClass(CLASS_PREFIX$1 + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      // ここで、オーバライドしているのはpopoverの$(this.config.template)[0]を使うため
      this.tip = this.tip || $(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      // tipのelementを取得する
      var $tip = $(this.getTipElement()); // jsイベントを維持するために、htmlにappendを使用する
      // .popover-headerと['data-original-title']属性のタイトルが引数
      // .popover-headerにthis.getTitle()で取得したテキストを設定する

      this.setElementContent($tip.find(Selector$6.TITLE), this.getTitle()); // ['data-content']属性の値を取得

      var content = this._getContent(); // コンテンツがfunctionの場合


      if (typeof content === 'function') {
        // this.elementに対してcontent関数を実行し、その結果をコンテンツに格納する
        content = content.call(this.element);
      } // .popover-bodyに対して、contentのテキストを設定する


      this.setElementContent($tip.find(Selector$6.CONTENT), content); // tipのfadeクラスとshowクラスを削除する

      $tip.removeClass(ClassName$6.FADE + " " + ClassName$6.SHOW);
    } // Private
    ;

    _proto._getContent = function _getContent() {
      // ['data-content']属性が存在していた場合は、その値を返す
      // 存在しなかった場合はconfig.contentを返す
      return this.element.getAttribute('data-content') || this.config.content;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      // tipの要素を取得
      var $tip = $(this.getTipElement()); // tipに.sc-popoverに関連クラスがあるか確認する

      var tabClass = $tip.attr('class').match(SCCLS_PREFIX_REGEX$1); // tabClassが存在していて、tabClassの長さが0以上の場合

      if (tabClass !== null && tabClass.length > 0) {
        // TabClassに該当するクラスを全て削除する
        $tip.removeClass(tabClass.join(''));
      }
    } // Static
    ;

    Popover._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // thisはdata-toggle="popover"を持った要素
        // その要素から、DATA_KEYの値を取得する
        var data = $(this).data(DATA_KEY$6); // configがibjectなら、_configに代入する
        // オブジェクトじゃないならnullを代入する

        var _config = typeof config === 'object' ? config : null; // dataが存在していなくて、disposeとhideがconfigに含まれている場合


        if (!data && /dispose|hide/.test(config)) {
          return;
        } // dataが存在しない場合


        if (!data) {
          // dataをインスタンス化する
          // thisはdata-toggle="popover"を持った要素
          // _configはobjectかnull
          data = new Popover(this, _config); // popover要素にDATA_KEY名でPopoverのインスタンスを設定する

          $(this).data(DATA_KEY$6, data);
        } // dataがあった場合
        // configがstringの場合


        if (typeof config === 'string') {
          // Popoverにconfigと同じ名前のメソッドがあるか判定する
          if (typeof data[config] === 'undefined') {
            // 存在しない場合は、エラー
            throw new TypeError("No method named \"" + config + "\"");
          } // 存在した場合は実行する


          data[config]();
        }
      });
    };

    _createClass(Popover, null, [{
      key: "VERSION",
      // Getters
      get: function get() {
        return VERSION$6;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$4;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME$6;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY$6;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event$6;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY$6;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$4;
      }
    }]);

    return Popover;
  }(Tooltip);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$6] = Popover._jQueryInterface;
  $.fn[NAME$6].Constructor = Popover;

  $.fn[NAME$6].noConflict = function () {
    $.fn[NAME$6] = JQUERY_NO_CONFLICT$6;
    return Popover._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$7 = 'scrollspy';
  var VERSION$7 = '4.4.1';
  var DATA_KEY$7 = 'sc.scrollspy';
  var EVENT_KEY$7 = "." + DATA_KEY$7;
  var DATA_API_KEY$5 = '.data-api';
  var JQUERY_NO_CONFLICT$7 = $.fn[NAME$7];
  var Default$5 = {
    offset: 10,
    method: 'auto',
    target: ''
  };
  var DefaultType$5 = {
    offset: 'number',
    method: 'string',
    target: '(string|element)'
  };
  var EVENT_ACTIVATE = "activate" + EVENT_KEY$7;
  var EVENT_SCROLL = "scroll" + EVENT_KEY$7;
  var EVENT_LOAD_DATA_API = "load" + EVENT_KEY$7 + DATA_API_KEY$5;
  var CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item';
  var CLASS_NAME_ACTIVE = 'active';
  var SELECTOR_DATA_SPY = '[data-spy="scroll"]';
  var SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
  var SELECTOR_NAV_LINKS = '.nav-link';
  var SELECTOR_NAV_ITEMS = '.nav-item';
  var SELECTOR_LIST_ITEMS = '.list-group-item';
  var SELECTOR_DROPDOWN = '.dropdown';
  var SELECTOR_DROPDOWN_ITEMS = '.dropdown-item';
  var SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
  var METHOD_OFFSET = 'offset';
  var METHOD_POSITION = 'position';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var ScrollSpy = /*#__PURE__*/function () {
    // elementはdata-spy="scroll"要素
    function ScrollSpy(element, config) {
      var _this = this;

      this._element = element; // elementがbody要素だった場合はwindowを格納
      // bodyじゃない場合は、elementを格納

      this._scrollElement = element.tagName === 'BODY' ? window : element;
      this._config = this._getConfig(config); // configの格納と、config.targetにuidを設定
      // selectorにconfig.targetと各selectorを設定

      this._selector = this._config.target + " " + SELECTOR_NAV_LINKS + "," + (this._config.target + " " + SELECTOR_LIST_ITEMS + ",") + (this._config.target + " " + SELECTOR_DROPDOWN_ITEMS);
      this._offsets = [];
      this._targets = [];
      this._activeTarget = null;
      this._scrollHeight = 0; // scrollElementにscrollイベントを定義

      $(this._scrollElement).on(EVENT_SCROLL, function (event) {
        return _this._process(event);
      }); // target要素(切り替わる要素のhrefで指定されている要素)の位置を取得
      // this._offsetsとthis._targetsにpush

      this.refresh();

      this._process();
    } // Getters


    var _proto = ScrollSpy.prototype;

    // Public
    _proto.refresh = function refresh() {
      var _this2 = this;

      // scrollElementがwindowの場合は、'offset'を格納
      // windowじゃない場合は'postion'を格納
      // windowのときはoffsetをする(offsetはwindowからの位置)
      // windowじゃないときはpositionをする(positionは親要素からの位置)
      var autoMethod = this._scrollElement === this._scrollElement.window ? METHOD_OFFSET : METHOD_POSITION; // config.methodが'auto'の場合(Defaultはauto)は、autoMethodを格納する
      // autoじゃない場合は、config,methodを格納

      var offsetMethod = this._config.method === 'auto' ? autoMethod : this._config.method; // offsetMethodが'position'だった場合はスクロール要素内のスクロール量を取得
      // positionじゃない場合は、0を格納

      var offsetBase = offsetMethod === METHOD_POSITION ? this._getScrollTop() : 0; // offsetsとtargetsを初期化

      this._offsets = [];
      this._targets = []; // scroll要素の高さを取得

      this._scrollHeight = this._getScrollHeight(); // selector要素を全部取得する

      var targets = [].slice.call(document.querySelectorAll(this._selector));
      targets.map(function (element) {
        // elementはselector
        var target; // selectorの、href要素の値を取得

        var targetSelector = Util.getSelectorFromElement(element); // targetSelectorがnullじゃない場合

        if (targetSelector) {
          // hrefで指定された要素を取得(selectorのhrefで指定されている要素)
          target = document.querySelector(targetSelector);
        } // target(selectorで指定されている要素)が存在している場合


        if (target) {
          // targetのBoundingClientRectを取得
          var targetBCR = target.getBoundingClientRect(); // target要素自体のwidthまたはheightが0じゃなかったら（つまりブラウザ的に表示されてたら）

          if (targetBCR.width || targetBCR.height) {
            // TODO (fat): remove sketch reliance on jQuery position/offset
            return [// targetのoffset.top
            // targetのoffset.top(ブラウザの上の位置)とoffsetBase(windowの場合は0)を足してmapのキーにする
            $(target)[offsetMethod]().top + offsetBase, targetSelector // selector要素で指定されているhrefの値
            ];
          }
        }

        return null; // ターゲットが存在していない場合は、nullを返す
      }).filter(function (item) {
        return item;
      }) // mapのnullを削除
      .sort(function (a, b) {
        return a[0] - b[0];
      }) // キーの降順にする(ブラウザで一番下のtargetから)
      .forEach(function (item) {
        _this2._offsets.push(item[0]); // _offsetsにtargetのoffsetを追加


        _this2._targets.push(item[1]); // _targetsにselectorで指定されているtargetを追加

      });
    };

    _proto.dispose = function dispose() {
      //  data-spy="scroll"からScrollspayを削除する
      $.removeData(this._element, DATA_KEY$7); // イベントを削除

      $(this._scrollElement).off(EVENT_KEY$7); // 全部null

      this._element = null;
      this._scrollElement = null;
      this._config = null;
      this._selector = null;
      this._offsets = null;
      this._targets = null;
      this._activeTarget = null;
      this._scrollHeight = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread2({}, Default$5, {}, typeof config === 'object' && config ? config : {}); // targetがstringじゃない場合

      if (typeof config.target !== 'string') {
        // targetのidを取得
        var id = $(config.target).attr('id'); // idが存在していない場合

        if (!id) {
          // scrollspy+ランダムな値のIDを作成
          id = Util.getUID(NAME$7); // targetにid属性を付与して、idを設定

          $(config.target).attr('id', id);
        } // idが存在している場合は、config.targetに#idを設定


        config.target = "#" + id;
      } // configの型がDefaultTypeに一致するか判定


      Util.typeCheckConfig(NAME$7, config, DefaultType$5); // configを返す

      return config;
    };

    _proto._getScrollTop = function _getScrollTop() {
      // scrollElementがwindowだった場合、そのページのスクロール量を取得
      // windowじゃない場合はその要素内のスクロール量を取得
      return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
    };

    _proto._getScrollHeight = function _getScrollHeight() {
      // scrollHeight(要素全体の高さ)が存在する場合は返す(scrollElementがwindowの場合は存在しない)
      // windowの場合も、表示されていない部分を含む全体の高さを取得
      return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, // 各ブラウザでX軸のスクロールバーを含む高さの取得方法が違うから
      document.documentElement.scrollHeight // こんな感じで書いてる
      );
    };

    _proto._getOffsetHeight = function _getOffsetHeight() {
      // スクロール要素がwindowの場合は、windowで表示されている高さを返す
      // そうじゃない場合は、スクロール要素の高さを取得する
      return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
    };

    _proto._process = function _process() {
      // 要素のスクロール量を取得(windowならbodyの高さ)してconfig.offsetを足す
      // 現在のスクロール位置
      var scrollTop = this._getScrollTop() + this._config.offset; // スクロール要素の高さの最大値を取得


      var scrollHeight = this._getScrollHeight(); // 要素のスクロール出来る高さを取得する
      // スクロールしないと見えないところも含めて(window.inner)


      var maxScroll = this._config.offset + // 70
      scrollHeight - // 5863-1024
      this._getOffsetHeight(); // スクロール要素の高さを取得する
      // scrollHeightが一致していない場合(両方とも_getScrollHeightで取得した値)


      if (this._scrollHeight !== scrollHeight) {
        // target要素(切り替わる要素のhrefで指定されている要素)の位置を取得
        this.refresh();
      } // scrollTopが、maxScroll以上の場合
      // つまり、スクロールが一番最後までスクロールされている状態


      if (scrollTop >= maxScroll) {
        // targets配列から一番最後の値を取得
        var target = this._targets[this._targets.length - 1]; // (this._activeTargetがtargetと一致しない場合
        // スクロールが一番下まで行ってる場合、基本は一番最後のselectorがactiveになっているので、activeを付与

        if (this._activeTarget !== target) {
          // target要素に.activeを付与する
          // あと、this._activeTargetにtargetに格納
          this._activate(target);
        } // 処理終了


        return;
      } // activeTargetがnullじゃなく、要素の現座のスクロール位置がthis._offset[0]未満の場合かつ、this._offset[0]が0より大きい場合
      // this.offsetsは、target要素のoffset


      if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
        // this._activeTargetをnullにする
        this._activeTarget = null; // .activeを削除する

        this._clear(); // 処理終了


        return;
      } // offsetsの長さを取得


      var offsetLength = this._offsets.length; // offsetsの長さの分だけループ

      for (var i = offsetLength; i--;) {
        // this._activeTarget(activeになってる要素)と、target要素が一致していないかつ、
        // scrollTop(スクロール量)が、target要素のoffset以上かつ、
        // this._offsets[i + 1]がundefined(最後のtarget要素)または、scrollTop(スクロール量)が、targetより少ない場合
        var isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (typeof this._offsets[i + 1] === 'undefined' || scrollTop < this._offsets[i + 1]); // targetがactive判定の場合

        if (isActiveTarget) {
          // .activeを付与
          this._activate(this._targets[i]);
        }
      }
    };

    _proto._activate = function _activate(target) {
      // target要素を代入
      this._activeTarget = target; // selector要素から、.activeを削除する

      this._clear();

      var queries = this._selector.split(',') // selectorをカンマで区切る
      .map(function (selector) {
        return selector + "[data-target=\"" + target + "\"]," + selector + "[href=\"" + target + "\"]";
      }); // 区切ったselectorに、data-targetまたはhrefにtargetを指定する
      // queries要素を取得する。queriesのイメージは以下
      // queries定義した時にmapで、targetを元に、selectorを取得しようとしてる
      // ".navbar .nav-link[data-target="#fat"],.navbar .nav-link[href="#fat"]"


      var $link = $([].slice.call(document.querySelectorAll(queries.join(',')))); // $link要素が.dropdown-itemを持ってるか判定

      if ($link.hasClass(CLASS_NAME_DROPDOWN_ITEM)) {
        // $link付近の.dropdownを取得して、.dropdown-toggleに.activeを追加する
        $link.closest(SELECTOR_DROPDOWN).find(SELECTOR_DROPDOWN_TOGGLE).addClass(CLASS_NAME_ACTIVE); // $linkにも、.activeを追加する

        $link.addClass(CLASS_NAME_ACTIVE);
      } else {
        // .dropdown-itemを持っていない場合
        // $linkに.activeを追加
        $link.addClass(CLASS_NAME_ACTIVE); // トリガーされたリンクの親をアクティブに設定する
        // <ul>と<nav>の両方のマークアップでは、親はnavの祖先の前の兄弟要素
        // .navと.list-groupの親要素を取得して、.nav-linkと.list-group-itemの前の兄弟要素に、.activeを追加する

        $link.parents(SELECTOR_NAV_LIST_GROUP).prev(SELECTOR_NAV_LINKS + ", " + SELECTOR_LIST_ITEMS).addClass(CLASS_NAME_ACTIVE); // .nav-linkが.nav-item内にある場合の処理
        // .navと.list-groupの親要素を取得して、.nav-itemの子要素の.nav-linkに、.activeを追加すうｒ

        $link.parents(SELECTOR_NAV_LIST_GROUP).prev(SELECTOR_NAV_ITEMS).children(SELECTOR_NAV_LINKS).addClass(CLASS_NAME_ACTIVE);
      } // スクロール要素に対して、activeteイベントを発動する


      $(this._scrollElement).trigger(EVENT_ACTIVATE, {
        relatedTarget: target
      });
    };

    _proto._clear = function _clear() {
      // セレクター要素を取得して、.activeを持つ要素から.activeを削除する
      [].slice.call(document.querySelectorAll(this._selector)).filter(function (node) {
        return node.classList.contains(CLASS_NAME_ACTIVE);
      }).forEach(function (node) {
        return node.classList.remove(CLASS_NAME_ACTIVE);
      });
    } // Static
    ;

    ScrollSpy._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        // spy要素のDATA_KEYを取得
        var data = $(this).data(DATA_KEY$7); // configがobjectの場合は、_configに格納
        // そうじゃない場合は、falseを格納

        var _config = typeof config === 'object' && config; // dataが存在しない場合


        if (!data) {
          // インスタンス化。引数はspy要素とconfig
          data = new ScrollSpy(this, _config); // spy要素にdataを設定

          $(this).data(DATA_KEY$7, data);
        } // configがstringの場合


        if (typeof config === 'string') {
          // ScrollSpyに同じ名前のメソッドがあるか確認
          if (typeof data[config] === 'undefined') {
            // 存在しない場合はエラー
            throw new TypeError("No method named \"" + config + "\"");
          } // 存在する場合はメソッドを実行


          data[config]();
        }
      });
    };

    _createClass(ScrollSpy, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$7;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$5;
      }
    }]);

    return ScrollSpy;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(window).on(EVENT_LOAD_DATA_API, function () {
    // 読み込み完了時
    // data-spy='scroll'要素を取得
    var scrollSpys = [].slice.call(document.querySelectorAll(SELECTOR_DATA_SPY)); //  data-spy='scroll'の要素数を取得

    var scrollSpysLength = scrollSpys.length; // data-spy='scroll'の要素数だけループ

    for (var i = scrollSpysLength; i--;) {
      // data-spy='scroll'の要素を取得
      var $spy = $(scrollSpys[i]); // jQueryInterfaceを実行
      // $spy.data()は引数(spy要素についてるdata-属性を取得してconfigにしてる)

      ScrollSpy._jQueryInterface.call($spy, $spy.data());
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$7] = ScrollSpy._jQueryInterface;
  $.fn[NAME$7].Constructor = ScrollSpy;

  $.fn[NAME$7].noConflict = function () {
    $.fn[NAME$7] = JQUERY_NO_CONFLICT$7;
    return ScrollSpy._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$8 = 'tab';
  var VERSION$8 = '4.4.1';
  var DATA_KEY$8 = 'sc.tab';
  var EVENT_KEY$8 = "." + DATA_KEY$8;
  var DATA_API_KEY$6 = '.data-api';
  var JQUERY_NO_CONFLICT$8 = $.fn[NAME$8];
  var EVENT_HIDE = "hide" + EVENT_KEY$8;
  var EVENT_HIDDEN = "hidden" + EVENT_KEY$8;
  var EVENT_SHOW = "show" + EVENT_KEY$8;
  var EVENT_SHOWN = "shown" + EVENT_KEY$8;
  var EVENT_CLICK_DATA_API = "click" + EVENT_KEY$8 + DATA_API_KEY$6;
  var CLASS_NAME_DROPDOWN_MENU = 'dropdown-menu';
  var CLASS_NAME_ACTIVE$1 = 'active';
  var CLASS_NAME_DISABLED = 'disabled';
  var CLASS_NAME_FADE = 'fade';
  var CLASS_NAME_SHOW = 'show';
  var SELECTOR_DROPDOWN$1 = '.dropdown';
  var SELECTOR_NAV_LIST_GROUP$1 = '.nav, .list-group';
  var SELECTOR_ACTIVE = '.active';
  var SELECTOR_ACTIVE_UL = '> li > .active';
  var SELECTOR_DATA_TOGGLE = '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]';
  var SELECTOR_DROPDOWN_TOGGLE$1 = '.dropdown-toggle';
  var SELECTOR_DROPDOWN_ACTIVE_CHILD = '> .dropdown-menu .active';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Tab = /*#__PURE__*/function () {
    function Tab(element) {
      // this.elementにクリックされた要素を格納する
      this._element = element;
    } // Getters


    var _proto = Tab.prototype;

    // Public
    // tab-contents > tab-paneがdisplay:none;にしている
    // tab-cotents > activeを付与されるとdisplay:block;になる
    _proto.show = function show() {
      var _this = this;

      // クリックされた要素にparentNodeが存在しているかつ、
      // そのparentNodeがエレメントでかつ
      // .activeまたは、.disableを持っている場合
      if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && $(this._element).hasClass(CLASS_NAME_ACTIVE$1) || $(this._element).hasClass(CLASS_NAME_DISABLED)) {
        // 処理を終了させる
        return;
      }

      var target;
      var previous; // クリックされた要素近くの.list-groupの中から.navを取得する
      // 0番目はElement

      var listElement = $(this._element).closest(SELECTOR_NAV_LIST_GROUP$1)[0]; // クリックされた要素のhrefで指定されている値を取得

      var selector = Util.getSelectorFromElement(this._element); // listElementが存在した場合

      if (listElement) {
        // listElementのnodeNameがULまたは、OLの場合は、> li > .activeを入れる。そうじゃない場合は.activeをセレクタにする
        var itemSelector = listElement === 'UL' || listElement.nodeName === 'OL' ? SELECTOR_ACTIVE_UL : SELECTOR_ACTIVE; // クリックしたlist-groupから、.activeな要素を取得して、配列で格納する

        previous = $.makeArray($(listElement).find(itemSelector)); // 配列の0番目(.activeな要素)を取得

        previous = previous[previous.length - 1];
      } // hideイベントを定義する


      var hideEvent = $.Event(EVENT_HIDE, {
        relatedTarget: this._element // クリックされた要素

      }); // showイベントを定義する

      var showEvent = $.Event(EVENT_SHOW, {
        relatedTarget: previous // activeな要素

      }); // activeな要素が存在したら、hideイベントを実行する

      if (previous) {
        $(previous).trigger(hideEvent);
      } // クリックされた要素に対して、showイベントを発動


      $(this._element).trigger(showEvent);

      if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
        // showまたはhideイベントがブラウザの動作を停止していた場合は、処理終了
        return;
      } // selectorが存在していたら


      if (selector) {
        // selectorで指定されているtarget要素を取得
        target = document.querySelector(selector);
      } // (1)現在.active要素から.activeを削除
      // (2)クリックされた要素に.activeを付与


      this._activate(this._element, // クリックされた要素
      listElement // クリックされた要素のULエレメント
      ); // complete関数を定義


      var complete = function complete() {
        // hiddenイベントを定義
        var hiddenEvent = $.Event(EVENT_HIDDEN, {
          relatedTarget: _this._element // クリックされた要素

        });
        var shownEvent = $.Event(EVENT_SHOWN, {
          relatedTarget: previous // クリックされた段階で、activeな要素

        }); // クリックされた段階で.activeな要素にはhiddenイベントを実行

        $(previous).trigger(hiddenEvent); // クリックされた要素にはshownイベントを実行

        $(_this._element).trigger(shownEvent);
      }; // target要素(selectorで指定されている、タブで切り替わる要素)


      if (target) {
        // targetが存在していたら TODO
        this._activate(target, target.parentNode, complete);
      } else {
        // targetが存在しない場合はcomplite関数を実行
        complete();
      }
    };

    _proto.dispose = function dispose() {
      // this._elementのDATA_KEYを削除
      $.removeData(this._element, DATA_KEY$8); // this._elementをnullにする

      this._element = null;
    } // Private
    // showから2回実行される
    // 1回目はcallbackがないので(1)と(2)をやる
    // (1)現在.active要素から.activeを削除
    // (2)クリックされた要素に.activeを付与
    ;

    _proto._activate = function _activate(element, container, callback) {
      var _this2 = this;

      // 1回目の引数
      // elementはクリックされた要素
      // containerはelementの親要素(UL)
      // 2回目の引数
      // elementはtarget要素(selectorで指定されている、タブで切り替わる要素)
      // containerはtargetの親要素
      // callbackはhiddenとshownイベントを実行するcomplete関数
      // containerが存在していて、ULまたはOL要素だった場合(1回目)はactiveなselectorをULかOLから取得
      // falseの場合は、親要素からactiveな要素を取得(ULとOL以外の1回目か、2回目(activeなtargetの取得))
      var activeElements = container && (container.nodeName === 'UL' || container.nodeName === 'OL') ? $(container).find(SELECTOR_ACTIVE_UL) // > li > .activeのselctorを使ってcontainer要素からactive要素を取得する
      : $(container).children(SELECTOR_ACTIVE); // ULまたはOL要素じゃない場合は、container要素からただ.activeを取得する
      // active要素を取得

      var active = activeElements[0]; // callbackがあるかつ、activeが存在していて.fadeを持っている場合
      // 1回目はundefined(callbackないから)、2回目はfadeを持ってたらtrue

      var isTransitioning = callback && active && $(active).hasClass(CLASS_NAME_FADE); // completeに_trantitionCompleteを入れる

      var complete = function complete() {
        return _this2._transitionComplete(element, active, callback);
      }; // activeが存在していて、activeが.fadeを持っていた場合


      if (active && isTransitioning) {
        // active要素の遷移時間を取得
        var transitionDuration = Util.getTransitionDurationFromElement(active); // active要素から、.showを削除し、complete(_trantsitionComplete)を実行

        $(active).removeClass(CLASS_NAME_SHOW).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        // falseの場合は、そのまま実行
        // クリックされたselector要素はcallbackがないのでtransitionしない
        complete();
      }
    } // showで2回実行される
    // 1回目は(1)と(2)、
    // (1)現在.active要素から.activeを削除
    // (2)クリックされた要素に.activeを付与
    ;

    _proto._transitionComplete = function _transitionComplete(element, active, callback) {
      // 1回目の引数は以下
      // elementはクリックされた要素
      // activeはクリックする前のactiveな要素
      // 2回目の引数は以下
      // elementはtarget要素(クリックしたselectorで指定されている、タブで切り替わる要素)
      // activeはクリックされた時点でactiveな親要素
      // callbackはhiddenとshownイベントを実行するcomplete関数
      // activeが存在した場合
      if (active) {
        // .activeを削除
        $(active).removeClass(CLASS_NAME_ACTIVE$1); // .activeの親要素から、.dropdown-menu .active要素を取得する

        var dropdownChild = $(active.parentNode).find(SELECTOR_DROPDOWN_ACTIVE_CHILD)[0]; // dropdownChildが存在する場合

        if (dropdownChild) {
          // .activeを削除する
          $(dropdownChild).removeClass(CLASS_NAME_ACTIVE$1);
        } // active要素のrole属性がtabの場合


        if (active.getAttribute('role') === 'tab') {
          // aria-selectedをfalseにする
          active.setAttribute('aria-selected', false);
        }
      } // elementに.activeを付与する


      $(element).addClass(CLASS_NAME_ACTIVE$1); // elementのroleがtabの場合

      if (element.getAttribute('role') === 'tab') {
        // aria-selectedをtrueにする
        element.setAttribute('aria-selected', true);
      } // element要素の高さ取得する


      Util.reflow(element); // elementが.fadeを持っていた場合

      if (element.classList.contains(CLASS_NAME_FADE)) {
        // .showを追加する
        // .fadeに.showが付与されてないとopacity:0;になってるから
        // tab-contents自体は.activeを付与された時点でdisplay:block;になる
        element.classList.add(CLASS_NAME_SHOW);
      } // elemntに親要素が存在していて、その親要素が.dropdown-menuを持っていた場合
      // つまり、.dropdown-itemをクリックしたとき


      if (element.parentNode && $(element.parentNode).hasClass(CLASS_NAME_DROPDOWN_MENU)) {
        // ,dropdown-menuの親要素から.dropdown要素を取得する
        var dropdownElement = $(element).closest(SELECTOR_DROPDOWN$1)[0]; // .dropdown要素が存在した場合

        if (dropdownElement) {
          // 取得した.dropdown要素から、.dropdown-toggle要素を取得する
          var dropdownToggleList = [].slice.call(dropdownElement.querySelectorAll(SELECTOR_DROPDOWN_TOGGLE$1)); // .dropdown-toggle要素に.activeを追加する

          $(dropdownToggleList).addClass(CLASS_NAME_ACTIVE$1);
        } // elementにaria-expanded属性をtrueで付与する


        element.setAttribute('aria-expanded', true);
      } // callback関数がある場合は実行する


      if (callback) {
        callback();
      }
    } // Static
    ;

    Tab._jQueryInterface = function _jQueryInterface(config) {
      // configはshow
      // classList.containsするときに.get(0)いらないのは、ここでeachしてるからみたい
      return this.each(function () {
        // クリックされた要素
        var $this = $(this); // クリックされた要素から、DATA_KEYを取得

        var data = $this.data(DATA_KEY$8); // dataが存在していない場合

        if (!data) {
          // Tabをインストタンス化
          // 引数はクリックされた要素
          data = new Tab(this); // クリックされた要素に対してTabのインスタンスを設定

          $this.data(DATA_KEY$8, data);
        } // configがstringの場合


        if (typeof config === 'string') {
          // Tabにconfigと同じ関数があるか判定
          if (typeof data[config] === 'undefined') {
            // なかったらエラー
            throw new TypeError("No method named \"" + config + "\"");
          } // あったら実行


          data[config]();
        }
      });
    };

    _createClass(Tab, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$8;
      }
    }]);

    return Tab;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */
  // [data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]に対してクリックイベントを定義


  $(document).on(EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
    // ブラウザのデフォルト動作を停止する
    event.preventDefault(); // showを引数に、jQueryInterfaceを発動する

    Tab._jQueryInterface.call($(this), 'show');
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$8] = Tab._jQueryInterface;
  $.fn[NAME$8].Constructor = Tab;

  $.fn[NAME$8].noConflict = function () {
    $.fn[NAME$8] = JQUERY_NO_CONFLICT$8;
    return Tab._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$9 = 'toast';
  var VERSION$9 = '4.4.1';
  var DATA_KEY$9 = 'sc.toast';
  var EVENT_KEY$9 = "." + DATA_KEY$9;
  var JQUERY_NO_CONFLICT$9 = $.fn[NAME$9];
  var Event$7 = {
    CLICK_DISMISS: "click.dismiss" + EVENT_KEY$9,
    HIDE: "hide" + EVENT_KEY$9,
    HIDDEN: "hidden" + EVENT_KEY$9,
    SHOW: "show" + EVENT_KEY$9,
    SHOWN: "shown" + EVENT_KEY$9
  };
  var ClassName$7 = {
    FADE: 'fade',
    HIDE: 'hide',
    SHOW: 'show',
    SHOWING: 'showing'
  };
  var DefaultType$6 = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number'
  };
  var Default$6 = {
    animation: true,
    autohide: true,
    delay: 500
  };
  var Selector$7 = {
    DATA_DISMISS: '[data-dismiss="toast"]'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Toast = /*#__PURE__*/function () {
    // elementはtoast要素
    // configはそれがobjectかのtrueかfalse
    function Toast(element, config) {
      this._element = element;
      this._config = this._getConfig(config);
      this._timeout = null; // toast要素クリック時にdata-dismiss='toast'を持つ要素をhideするイベントを定義

      this._setListeners();
    } // Getters


    var _proto = Toast.prototype;

    // Public
    _proto.show = function show() {
      var _this = this;

      // showイベントを定義
      var showEvent = $.Event(Event$7.SHOW); // showイベントを発動

      $(this._element).trigger(showEvent); // showイベントがブラウザのデフォルト動作を禁止していたら処理終了

      if (showEvent.isDefaultPrevented()) {
        return;
      } // animationがtrueの場合(Defaulrはtrue)


      if (this._config.animation) {
        // toast要素に.fadeを追加
        this._element.classList.add(ClassName$7.FADE);
      } // 処理完了時の関数を定義


      var complete = function complete() {
        // toast要素から.showingを削除
        _this._element.classList.remove(ClassName$7.SHOWING); // .showを付与


        _this._element.classList.add(ClassName$7.SHOW); // shownイベントを実行


        $(_this._element).trigger(Event$7.SHOWN); // autohideがtrueの場合(Defaultはtrue)

        if (_this._config.autohide) {
          // delayだけ送らせてhideを実行(Defaultは500)
          _this._timeout = setTimeout(function () {
            _this.hide();
          }, _this._config.delay);
        }
      }; // .hideを削除


      this._element.classList.remove(ClassName$7.HIDE); // taost要素の高さを取得


      Util.reflow(this._element); // .showingを付与

      this._element.classList.add(ClassName$7.SHOWING); // animetionがtrueの場合


      if (this._config.animation) {
        // toast要素の遷移時間を取得
        var transitionDuration = Util.getTransitionDurationFromElement(this._element); // 遷移時間だけ送らせてcomplete関数を実行

        $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        // animetionがfalseの場合は即実行
        complete();
      }
    };

    _proto.hide = function hide() {
      // toast要素が.showを持っていた場合は処理終了
      if (!this._element.classList.contains(ClassName$7.SHOW)) {
        return;
      } // hideイベントを定義


      var hideEvent = $.Event(Event$7.HIDE); // hideイベントを実行

      $(this._element).trigger(hideEvent); // hideイベントがブラウザの処理を停止していたら処理終了

      if (hideEvent.isDefaultPrevented()) {
        return;
      } // closeを実行


      this._close();
    };

    _proto.dispose = function dispose() {
      // timeoutを削除
      clearTimeout(this._timeout);
      this._timeout = null; // toast要素が.showを持っていたら削除する

      if (this._element.classList.contains(ClassName$7.SHOW)) {
        this._element.classList.remove(ClassName$7.SHOW);
      } // クリック時に非表示にするイベントを削除


      $(this._element).off(Event$7.CLICK_DISMISS); // toast要素を削除する

      $.removeData(this._element, DATA_KEY$9);
      this._element = null;
      this._config = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread2({}, Default$6, {}, $(this._element).data(), {}, typeof config === 'object' && config ? config : {}); // configの値が、DefaultTypeの型と一致しているか確認

      Util.typeCheckConfig(NAME$9, config, this.constructor.DefaultType); // configを返す

      return config;
    };

    _proto._setListeners = function _setListeners() {
      var _this2 = this;

      // toast要素クリック時にdata-dismiss='toast'を持つ要素をhideする
      $(this._element).on(Event$7.CLICK_DISMISS, // click.dismiss
      Selector$7.DATA_DISMISS, // data-dismiss='toast'
      function () {
        return _this2.hide();
      } // hideする
      );
    };

    _proto._close = function _close() {
      var _this3 = this;

      // 関数定義
      var complete = function complete() {
        _this3._element.classList.add(ClassName$7.HIDE); // toast要素に.hideを追加


        $(_this3._element).trigger(Event$7.HIDDEN); // hiddenイベントを実行
      }; // toast要素から.showを削除


      this._element.classList.remove(ClassName$7.SHOW); // animetionがtrueの場合(Defaultはtrue)


      if (this._config.animation) {
        // toast要素の遷移時間を取得
        var transitionDuration = Util.getTransitionDurationFromElement(this._element); // toast要素の遷移時間後に、complete関数を実行

        $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        // animationがfalseならすぐに実行
        complete();
      }
    } // Static
    ;

    Toast._jQueryInterface = function _jQueryInterface(config) {
      // thisはtoast要素
      // configは$('.toast').toast('show')のshow部分
      // toast要素の数だけ処理を行う
      return this.each(function () {
        // toast要素を格納
        var $element = $(this); // toast要素にDATAが設定されているか確認

        var data = $element.data(DATA_KEY$9); // configがobjectか判定してする
        // objectの場合は、objectをそのまま入れる
        // objectじゃない場合は、false

        var _config = typeof config === 'object' && config; // dataが存在していない場合


        if (!data) {
          // toast要素と_configを引数にtoastをインスタンス化する
          // thisはtoast要素
          data = new Toast(this, _config); // toast要素にToastインスタンスを紐付け

          $element.data(DATA_KEY$9, data);
        } // configがstringの場合


        if (typeof config === 'string') {
          // Toastにconfigと同じ名前の引数が存在しない場合はエラー
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          } // Toastのメソッドを実行


          data[config](this);
        }
      });
    };

    _createClass(Toast, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$9;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$6;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$6;
      }
    }]);

    return Toast;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$9] = Toast._jQueryInterface;
  $.fn[NAME$9].Constructor = Toast;

  $.fn[NAME$9].noConflict = function () {
    $.fn[NAME$9] = JQUERY_NO_CONFLICT$9;
    return Toast._jQueryInterface;
  };

  exports.Alert = Alert;
  exports.Button = Button;
  exports.Collapse = Collapse;
  exports.Dropdown = Dropdown;
  exports.Modal = Modal;
  exports.Popover = Popover;
  exports.Scrollspy = ScrollSpy;
  exports.Tab = Tab;
  exports.Toast = Toast;
  exports.Tooltip = Tooltip;
  exports.Util = Util;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=simplicss.js.map
