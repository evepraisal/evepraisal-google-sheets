/*====================================================================================================================================*
  Evepraisal Tools by Kevin McDonald
  ====================================================================================================================================
  Version:      1.2.0
  Project Page: https://github.com/evepraisal/evepraisal-google-sheets
  Copyright:    (c) 2018 by Kevin McDonald

  ------------------------------------------------------------------------------------------------------------------------------------
  A library for importing evepraisal data into Google spreadsheets. Functions include:
     EVEPRAISAL_TOTAL  For getting totals of an existing appraisal
     EVEPRAISAL_ITEM   For getting the current price of an item
  
  For bug reports see https://github.com/evepraisal/evepraisal-google-sheets
  ------------------------------------------------------------------------------------------------------------------------------------
  Changelog:
  
  1.0.0  Initial release
  1.1.0  Handle urlfetch limit more gracefully by trying to return a long-term cache copy.
         Allow names for EVEPRAISAL_ITEM as well as type IDs.
  1.2.0  Batches API calls to items to prevent hitting the UrlFetch limit.
 *====================================================================================================================================*/

/**
 * @fileoverview Provides the custom functions EVEPRAISAL_ITEM and EVEPRAISAL_TOTAL
 * @OnlyCurrentDoc
 */

function onInstall() {
  onOpen();
}

// This method adds a custom menu item to run the script
function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.addMenu('Evepraisal',
             [{ name: 'Use in this spreadsheet', functionName: 'use' }]);
}

/**
 * Show available functions
 */
function use() {
  var title = 'Evepraisal Functions';
  var message = 'The EVEPRAISAL_TOTAL and EVEPRAISAL_ITEM functions are now available in ' +
      'this spreadsheet. More information is available in the function help ' +
      'box that appears when you start using them in a forumula.';
  var ui = SpreadsheetApp.getUi();
  ui.alert(title, message, ui.ButtonSet.OK);
}

function fetchUrl(url, timeout, longTimeout) {
  if (timeout == null) {
    timeout = 300;
  }
  var cache = CacheService.getScriptCache();
  var cached = cache.get(url);
  if (cached != null) {
   Logger.log('Cache hit ' + url);
   return cached;
  }

  try {
    Logger.log('Cache miss. fetching ' + url);
    var jsondata = UrlFetchApp.fetch(url).getContentText();
    cache.put(url, jsondata, timeout);
    if (longTimeout != null) {
      cache.put("long|" + url, jsondata, longTimeout);
    }
    return jsondata;

  } catch (ex) {
    // If we hit our UrlFetchApp limit then try to pull from the long cache
    if ((/Service invoked too many times for one day/ig).test(ex.toString())) {
      var cached = cache.get("long|" + url);
      if (cached != null) {
        Logger.log('UrlFetchApp limit hit, but found long cache value');
        return cached;
      } else {
        Logger.log('UrlFetchApp limit hit. Did not find long cache value');
      }
    }
    throw ex;
  }
}

function fetchItem(item_id) {
  if (typeof item_id == "number") {
    var page_size = 25;
    var pages = Math.floor(item_id/page_size);
    var offset = pages * page_size - 1;
    var jsondata = fetchUrl("https://evepraisal.com/items.json?offset=" + offset + "&limit=" + page_size, 300, 86400);
    var response = JSON.parse(jsondata);
    items = response['items'];
    for (idx in items) {
      if (items[idx]['type']['id'] == item_id) {
        return items[idx];
      }
    }
    throw "item "+item_id+" not found";
  } else {
    var jsondata = fetchUrl("https://evepraisal.com/item/" + encodeURIComponent(item_id) + ".json", 300, 86400);
    return JSON.parse(jsondata);
  }
}

/**
 * Imports the total buy or sell price of an Evepraisal given the appraisal id. For example: =EVEPRAISAL_TOTAL("gp5av", "buy")
 * 
 * @param {string} appraisal_id the alphanumeric id of the appraisal. E.G. "gp5av".
 * @param {string} order_type The options are: "buy" or "sell". The default is "sell".
 * @return {number}
 * @customfunction
 **/
function EVEPRAISAL_TOTAL(appraisal_id, order_type) {
  if (appraisal_id == null) {
    throw "required parameter 'appraisal_id' not given"
  }

  if (order_type == null) {
    order_type = "sell";
  }

  var jsondata = fetchUrl("https://evepraisal.com/a/" + encodeURIComponent(appraisal_id) + ".json", 86400, null);
  var object = JSON.parse(jsondata);
  return object["totals"][order_type];
}

/**
 * Imports the price of an Eve Online item from Evepraisal by item id.
 * @param {number} item_id the numeric id or name of an eve online item. This ID is shown when searching for an item on Evepraisal. E.G. 587 for rifter.
 * @param {string} market the market to price an item in. Options are "universe", "jita", "amarr", "dodixie", "hek", "rens". The default is "jita".
 * @param {string} order_type the order type. The options are: "buy" or "sell". The default is "sell".
 * @param {string} attribute the attribute to use when . Options are "avg", "max", "median", "min", "percentile", "stddev", "volume", "order_count". The default is "min" for sell and "max" for buy.
 * @return {number}
 * @customfunction
 **/
function EVEPRAISAL_ITEM(item_id, market, order_type, attribute) {
  if (item_id === "#N/A" || item_id === "#ERROR!") {
    throw "Invalid type: " + item_id;
  }

  if (item_id == null || item_id === "") {
    item_id = 34; // because why not show some tritanium as a default
  }
  if (market == null) {
    market = "jita";
  }
  if (order_type == null) {
    order_type = "sell";
  }
  if (attribute == null) {
    if (order_type == "sell") {
      attribute = "min";
    } else {
      attribute = "max"
    }
  }

  var object = fetchItem(item_id);
  if (object["summaries"] == null) {
    throw "No market data for " + object['type']['name'];
  }
  for (i in object["summaries"]) {
    if (object["summaries"][i]["market_name"] == market) {
      return object["summaries"][i]["prices"][order_type][attribute];
    }
  }

  throw "market "+market+" not found";
}
