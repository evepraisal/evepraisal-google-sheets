# evepraisal-google-sheets
Evepraisal helper functions intended for use in Google sheets

## Install

1. Open a google sheets document
2. Go to Tools > Script Editor...
3. Replace the contents of the file with the contents of [Evepraisal.gs](https://raw.githubusercontent.com/evepraisal/evepraisal-google-sheets/master/Evepriasal.gs)
4. Save the file (enter in a project name, this doesn't really matter)
5. Try some of the examples below


## Examples
```
// Get the total buy price for an existing appraisal
=EVEPRAISAL_TOTAL("gp5av", "buy")

// Get the cost of a single unit of tritanium in jita
=EVEPRAISAL_ITEM(34, "jita", "sell", "volume")
=EVEPRAISAL_ITEM(34, "jita", "sell", "min")
=EVEPRAISAL_ITEM(34, "jita", "sell", "avg")

```
