const sqlite = require("sqlite")
const express = require("express")
const fs = require("fs")
const path = require("path")

async function main() {
  // AUFGABE 1
  // Stellen Sie sicher, dass das Importieren der Daten abgeschlossen ist, bevor der folgende Code ausgeführt wird.
  // Beachten Sie die Ausgaben ind der Konsole, diese sollten in folgender Reihenfolge ausgegeben werden:
  //   Currency and rates imported
  //   HTTP Server is running
  // Sie können Sich die Datei "lib/importer.js" gerne ansehen, in dieser sind jedoch keine Änderungen notwendig, Sie
  // müssen diese auch nicht verstehen.


  const importer = require("./lib/importer")
  importer.import()
  
  const db = await sqlite.open("rates.node.sqlite")
  let currencies = await db.all("SELECT code, rate FROM currency LEFT JOIN fx ON fx.`to` = currency.id GROUP BY code ORDER BY date")

  // AUFGABE 2
  // Das Array currencies besteht aus Objekten wie diesem: {code: "USD", rate: 0.81}
  // Sortieren Sie das Array nach dem Währungskürzel ("code") aufsteigend.
  // Die SQL-Abfrage nicht ändern, es soll mit JavaScript sortiert werden!
  //console.log( currencies );
  
  const app = express()
  
  app.get("/currencies.php", (req, res) => {
    // AUFGABE 3
    // "Less code is better code."
    // In den folgenden zwei Zeilen werden insgesamt drei Funktionen aufgerufen. Vereinfachen Sie das Code-Stück,
    // sodass nur noch eine Funktion aufgerufen werden muss.
	
	res.header("Content-Type", "application/json")
    res.send(JSON.stringify(currencies))

  })
  
  app.get("/", (req, res) => res.sendFile(path.resolve("index.html")))
  
  app.listen(8090)
  console.log("HTTP Server is running")
}

main()