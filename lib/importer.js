const sqlite = require("sqlite")
const path = require("path")
const lineReader = require("line-reader")
//const Promise = require("promise");
const Promise = require('bluebird');
const moment = require("moment")

async function main() {
  const db = await sqlite.open("rates.node.sqlite")
  await db.exec("DROP TABLE IF EXISTS currency")
  await db.exec("CREATE TABLE currency (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, name TEXT)")
  await db.exec("DROP TABLE IF EXISTS fx")
  await db.exec("CREATE TABLE fx (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, date INTEGER, `from` TEXT NOT NULL, `to` TEXT NOT NULL, rate REAL NOT NULL)")
  
  const currencyStatement = await db.prepare("INSERT INTO currency VALUES(NULL, ?, NULL)")
  await currencyStatement.run(["EUR"])
  const fxStatement = await db.prepare("INSERT INTO fx VALUES(NULL, ?, (SELECT id FROM currency WHERE code = 'EUR'), (SELECT id FROM currency WHERE code = ?), ?)")
  
  const currencies = []
  let promise
  
  const eachLine = Promise.promisify(lineReader.eachLine);
  const promises = []
  return new Promise((resolve) => {eachLine("eurofxref-hist.csv", function(line) {
    if (currencies.length == 0) {
      promise = Promise.all(line.split(",").slice(1).filter(currency => currency != "").map(currency => {
        currencies.push(currency)
        return currencyStatement.run([currency])
      }))
    } else {
      promise.then(() => {
        let date = moment(line.split(",")[0], "YYYY-MM-DD").unix()
        line.split(",").slice(1).forEach((rate, index) => {
          if (rate != "" && rate != "N/A") {
            promises.push(fxStatement.run([date, currencies[index], rate]))
          }
        })
      })
    }
  }).then(() => {
    promise.then(() => {
      Promise.all(promises).then(resolve)
    })
  })}).then(() => console.log("Currency and rates imported"))
}

module.exports = {
  import: () => main()
}