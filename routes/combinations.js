/* Load our db */
var db = require("../database.js");

exports.add = function (req, res) {
	
	var duplicatesSql = '', data = req.body.data;

	console.log("\n\n========== DATA ===========");
	console.log(data);
	console.log("\n\n");

	for (var i = 0; i < data.length; i++) {
		duplicatesSql += "SELECT * FROM combinations WHERE q_one=" + data[i][0] + " AND q_two=" + data[i][1] + " AND q_three=" + data[i][2] + " AND q_four=" + data[i][3] + " AND q_five=" + data[i][4] + " AND q_six=" + data[i][5] + " AND q_seven=" + data[i][6] + " AND q_eight=" + data[i][7] + " AND authority_id=" + data[i][8] + ";";
	};

	console.log("============ DUPLICATE CHECKS SQL ===========");
	console.log(duplicatesSql);
	console.log("\n\n");

	db.exec(duplicatesSql, [], function (err, results) {
		
		var insertArray = [];

		for (var i = 0; i < results.length; i++) {
			console.log("==== RESULTS FOR QUERY " + i + " ====");
			console.log(results[i]);
			console.log("\n\n");

			if(results[i].length == 0) {
				insertArray.push(data[i]);
			}
		}

		if(insertArray.length) {
			console.log("====== INSERT DATA ======");
			console.log(insertArray);
			console.log("\n\n");

			var sql = "INSERT INTO `combinations` (`q_one`, `q_two`, `q_three`, `q_four`, `q_five`, `q_six`, `q_seven`, `q_eight`, `authority_id`) VALUES ?";

			db.exec(sql, [insertArray], function(err, results) {
				
				if (err) {
					res.status(500).send("Server Error.");
				} else {
					res.send({success:true});			
				}
			});
		} else {
			res.send({success:true});
		}
		
	});
};
