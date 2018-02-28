/*====================================================================================================================================*
  Evepraisal by Kevin McDonald
  ====================================================================================================================================
  Version:      1.0.0
  Project Page: https://github.com/evepraisal/evepraisal-google-sheets
  Copyright:    (c) 2018 by Kevin McDonald

  ------------------------------------------------------------------------------------------------------------------------------------
  A library for importing evepraisal data into Google spreadsheets. Functions include:
     EvepraisalTotal  For getting totals of an existing appraisal
     EvepraisalItem   For getting the current price of an item
  
  For bug reports see https://github.com/evepraisal/evepraisal-google-sheets
  ------------------------------------------------------------------------------------------------------------------------------------
  Changelog:
  
  1.0.0  Initial release
 *====================================================================================================================================*/

/**
 * Imports the total buy or sell price of an Evepraisal given the appraisal id.
 *
 * For example:
 *
 *   =EvepraisalTotal("gp5av", "buy")
 *   =EvepraisalTotal("gp5av")
 * 
 * @param {appraisal_id} the alphanumeric id of the appraisal. E.G. "gp5av".
 * @param {order_type}   the order type. The options are: "buy" or "sell". The default is "sell".
 * @return a single value.
 * @customfunction
 **/
function EvepraisalTotal(appraisal_id, order_type) {
  if (appraisal_id == null) {
    throw "required parameter 'appraisal_id' not given"
  }

  if (order_type == null) {
    order_type = "sell";
  }

  var jsondata = UrlFetchApp.fetch("https://evepraisal.com/a/" + appraisal_id + ".json");
  var object   = JSON.parse(jsondata.getContentText());
  return object["totals"][order_type];
}

/**
 * Imports the price of an Eve Online item from Evepraisal by item id.
 *
 * For example:
 *
 *   =EvepraisalItem(34, "jita", "sell", "volume")
 *   =EvepraisalItem(34, "jita", "sell", "min")
 *   =EvepraisalItem(34, "jita", "sell", "avg")
 * 
 * @param {item_id}    the numeric id of the item. The ID is shown when searching for an item on Evepraisal. E.G. 587 for rifter.
 * @param {market}     the market to price an item in. Options are "universe", "jita", "amarr", "dodixie", "hek", "rens". The default is "jita".
 * @param {order_type} the order type. The options are: "buy" or "sell". The default is "sell".
 * @param {attribute}  the attribute to use when . Options are "avg", "max", "median", "min", "percentile", "stddev", "volume", "order_count". The default is "min" for sell and "max" for buy.
 * @return a single value.
 * @customfunction
 **/
function EvepraisalItem(item_id, market, order_type, attribute) {
  if (item_id == null) {
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

  var jsondata = UrlFetchApp.fetch("https://evepraisal.com/item/" + item_id + ".json");
  var object = JSON.parse(jsondata.getContentText());
  
  for (i in object["summaries"]) {
    if (object["summaries"][i]["market_name"] == market) {
      return object["summaries"][i]["prices"][order_type][attribute];
    }
  }
  
  throw "market "+market+" not found";
}
