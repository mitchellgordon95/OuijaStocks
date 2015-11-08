var yahooFinance = require("yahoo-finance");
var express =  require("express");
var app = express();

app.use(express.static('public'));

app.get("/priceChanges/:stock", function(req, resp) {
    var page = req.query.page;
    var stock = req.params.stock;
    if (!page)
        page = 1;
    if (!stock) {
        resp.status(401).send("Invalid stock ticker");
    }
    else {
        var toDate = new Date();
        toDate.setFullYear(toDate.getFullYear() - (page - 1));
        var yearBefore = new Date();
        yearBefore.setFullYear(yearBefore.getFullYear() - page);
        yahooFinance.historical({
            symbol: stock,
            from: yearBefore,
            to: toDate
        }, function (err, quotes) {
            if (err) {
                console.log(err);
                resp.status(401).send("Invalid stock ticker, probably");
            }
            else {

                var output = [];
                quotes.forEach(function(el) {
                    output.push({ change: (el.open - el.close) / el.open, date: el.date });
                });
                resp.send(output);
            }
        });
    }
})
 
var server = app.listen(8080, function () {
    console.log('Ouija Stocks listening on ' + server.address().port);
});
