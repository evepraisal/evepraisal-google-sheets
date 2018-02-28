# evepraisal-google-sheets
Evepraisal helper functions intended for use in Google sheets

## Examples
```
// Get the total buy price for an existing appraisal
=EvepraisalTotal("gp5av", "buy")

// Get the cost of a single unit of tritanium in jita
=EvepraisalItem(34, "jita", "sell", "volume")
=EvepraisalItem(34, "jita", "sell", "min")
=EvepraisalItem(34, "jita", "sell", "avg")
```
