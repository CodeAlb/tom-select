/**
* Tom Select v1.1.1
* Licensed under the Apache License, Version 2.0 (the "License");
*/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('../../tom-select.ts')) :
	typeof define === 'function' && define.amd ? define(['../../tom-select.ts'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.TomSelect));
}(this, (function (TomSelect) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var TomSelect__default = /*#__PURE__*/_interopDefaultLegacy(TomSelect);

	var defaults = {
	  options: [],
	  optgroups: [],
	  plugins: [],
	  delimiter: ',',
	  splitOn: null,
	  // regexp or string for splitting up values from a paste command
	  persist: true,
	  diacritics: true,
	  create: null,
	  createOnBlur: false,
	  createFilter: null,
	  highlight: true,
	  openOnFocus: true,
	  maxOptions: 50,
	  maxItems: null,
	  hideSelected: null,
	  duplicates: false,
	  addPrecedence: false,
	  selectOnTab: false,
	  preload: null,
	  allowEmptyOption: false,
	  closeAfterSelect: false,
	  scrollDuration: 60,
	  loadThrottle: 300,
	  loadingClass: 'loading',
	  dataAttr: null,
	  //'data-data',
	  optgroupField: 'optgroup',
	  valueField: 'value',
	  labelField: 'text',
	  disabledField: 'disabled',
	  optgroupLabelField: 'label',
	  optgroupValueField: 'value',
	  lockOptgroupOrder: false,
	  sortField: '$order',
	  searchField: ['text'],
	  searchConjunction: 'and',
	  mode: null,
	  wrapperClass: 'ts-control',
	  inputClass: 'ts-input',
	  dropdownClass: 'ts-dropdown',
	  dropdownContentClass: 'ts-dropdown-content',
	  itemClass: 'item',
	  optionClass: 'option',
	  dropdownParent: null,
	  controlInput: null,
	  copyClassesToDropdown: true,

	  /*
	  load                 : null, // function(query, callback) { ... }
	  score                : null, // function(search) { ... }
	  onInitialize         : null, // function() { ... }
	  onChange             : null, // function(value) { ... }
	  onItemAdd            : null, // function(value, $item) { ... }
	  onItemRemove         : null, // function(value) { ... }
	  onClear              : null, // function() { ... }
	  onOptionAdd          : null, // function(value, data) { ... }
	  onOptionRemove       : null, // function(value) { ... }
	  onOptionClear        : null, // function() { ... }
	  onOptionGroupAdd     : null, // function(id, data) { ... }
	  onOptionGroupRemove  : null, // function(id) { ... }
	  onOptionGroupClear   : null, // function() { ... }
	  onDropdownOpen       : null, // function(dropdown) { ... }
	  onDropdownClose      : null, // function(dropdown) { ... }
	  onType               : null, // function(str) { ... }
	  onDelete             : null, // function(values) { ... }
	  */
	  render: {
	    /*
	    item: null,
	    optgroup: null,
	    optgroup_header: null,
	    option: null,
	    option_create: null
	    */
	  }
	};

	/**
	 * Converts a scalar to its best string representation
	 * for hash keys and HTML attribute values.
	 *
	 * Transformations:
	 *   'str'     -> 'str'
	 *   null      -> ''
	 *   undefined -> ''
	 *   true      -> '1'
	 *   false     -> '0'
	 *   0         -> '0'
	 *   1         -> '1'
	 *
	 */
	function hash_key(value) {
	  if (typeof value === 'undefined' || value === null) return null;
	  if (typeof value === 'boolean') return value ? '1' : '0';
	  return value + '';
	}
	/**
	 * Prevent default
	 *
	 */

	function addEvent(target, type, callback, options) {
	  target.addEventListener(type, callback, options);
	}

	function getSettings(input, settings_user) {
	  var settings = Object.assign({}, defaults, settings_user);
	  var attr_data = settings.dataAttr;
	  var field_label = settings.labelField;
	  var field_value = settings.valueField;
	  var field_disabled = settings.disabledField;
	  var field_optgroup = settings.optgroupField;
	  var field_optgroup_label = settings.optgroupLabelField;
	  var field_optgroup_value = settings.optgroupValueField;
	  var tag_name = input.tagName.toLowerCase();
	  var placeholder = input.getAttribute('placeholder') || input.getAttribute('data-placeholder');

	  if (!placeholder && !settings.allowEmptyOption) {
	    let option = input.querySelector('option[value=""]');

	    if (option) {
	      placeholder = option.textContent;
	    }
	  }

	  var settings_element = {
	    placeholder: placeholder,
	    options: [],
	    optgroups: [],
	    items: [],
	    maxItems: null
	  };
	  /**
	   * Initialize from a <select> element.
	   *
	   */

	  var init_select = () => {
	    var i, n, tagName, children;
	    var options = settings_element.options;
	    var optionsMap = {};

	    var readData = el => {
	      var data = Object.assign({}, el.dataset); // get plain object from DOMStringMap

	      var json = attr_data && data[attr_data];

	      if (typeof json === 'string' && json.length) {
	        data = Object.assign(data, JSON.parse(json));
	      }

	      return data;
	    };

	    var addOption = (option, group) => {
	      var value = hash_key(option.value);
	      if (!value && !settings.allowEmptyOption) return; // if the option already exists, it's probably been
	      // duplicated in another optgroup. in this case, push
	      // the current group to the "optgroup" property on the
	      // existing option so that it's rendered in both places.

	      if (optionsMap.hasOwnProperty(value)) {
	        if (group) {
	          var arr = optionsMap[value][field_optgroup];

	          if (!arr) {
	            optionsMap[value][field_optgroup] = group;
	          } else if (!Array.isArray(arr)) {
	            optionsMap[value][field_optgroup] = [arr, group];
	          } else {
	            arr.push(group);
	          }
	        }

	        return;
	      }

	      var option_data = readData(option);
	      option_data[field_label] = option_data[field_label] || option.textContent;
	      option_data[field_value] = option_data[field_value] || value;
	      option_data[field_disabled] = option_data[field_disabled] || option.disabled;
	      option_data[field_optgroup] = option_data[field_optgroup] || group;
	      optionsMap[value] = option_data;
	      options.push(option_data);

	      if (option.selected) {
	        settings_element.items.push(value);
	      }
	    };

	    var addGroup = optgroup => {
	      var i, n, id, optgroup_data, options;
	      id = optgroup.getAttribute('label');

	      if (id) {
	        optgroup_data = readData(optgroup);
	        optgroup_data[field_optgroup_label] = id;
	        optgroup_data[field_optgroup_value] = id;
	        optgroup_data[field_disabled] = optgroup.disabled;
	        settings_element.optgroups.push(optgroup_data);
	      }

	      var options = optgroup.children;

	      for (i = 0, n = options.length; i < n; i++) {
	        addOption(options[i], id);
	      }
	    };

	    settings_element.maxItems = input.hasAttribute('multiple') ? null : 1;
	    children = input.children;

	    for (i = 0, n = children.length; i < n; i++) {
	      tagName = children[i].tagName.toLowerCase();

	      if (tagName === 'optgroup') {
	        addGroup(children[i]);
	      } else if (tagName === 'option') {
	        addOption(children[i]);
	      }
	    }
	  };
	  /**
	   * Initialize from a <input type="text"> element.
	   *
	   */


	  var init_textbox = () => {
	    var i, n, values, option;
	    var data_raw = input.getAttribute(attr_data);

	    if (!data_raw) {
	      var value = input.value.trim() || '';
	      if (!settings.allowEmptyOption && !value.length) return;
	      values = value.split(settings.delimiter);

	      for (i = 0, n = values.length; i < n; i++) {
	        option = {};
	        option[field_label] = values[i];
	        option[field_value] = values[i];
	        settings_element.options.push(option);
	      }

	      settings_element.items = values;
	    } else {
	      settings_element.options = JSON.parse(data_raw);

	      for (i = 0, n = settings_element.options.length; i < n; i++) {
	        settings_element.items.push(settings_element.options[i][field_value]);
	      }
	    }
	  };

	  if (tag_name === 'select') {
	    init_select();
	  } else {
	    init_textbox();
	  }

	  return Object.assign({}, defaults, settings_element, settings_user);
	}

	/**
	 * Plugin: "change_listener" (Tom Select)
	 * Copyright (c) contributors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
	 * file except in compliance with the License. You may obtain a copy of the License at:
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
	 * ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 *
	 */
	TomSelect__default['default'].define('change_listener', function (options) {
	  var self = this;
	  var changed = false;
	  addEvent(self.input, 'change', () => {
	    // prevent infinite loops
	    if (changed) {
	      changed = false;
	      return;
	    }

	    changed = true;
	    var settings = getSettings(self.input, {});
	    self.setupOptions(settings.options, settings.optgroups);
	    self.setValue(settings.items);
	  });
	});

})));
//# sourceMappingURL=change_listener.js.map
