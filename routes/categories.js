/* Load our db */
var db = require("../database.js");

exports.get = function (req, res) {
	if(req.query.page != 'undefined') {

		var page = req.query.page ? req.query.page : 1, 
		limit = req.query.limit ? req.query.limit : 10,
		offset = limit * (page-1);

		var sql = "SELECT id, category_name FROM categories ORDER BY id DESC LIMIT " + limit + "  OFFSET " + offset;
		
	} else {
		var sql = "SELECT id, category_name FROM categories";
	}
	
	db.exec(sql, [], function(err, results) {
		
		if (err) { // If unexpected error then send 500
			res.status(500).send("Server Error.");
		} else {

			var totalSql = "SELECT COUNT(id) as total FROM categories";

			db.exec(totalSql, [], function(totalSqlErr, totalResults) {
				if(totalSqlErr) {
					res.status(500).send("Server Error.")
				} else {
					res.send({success:true, data:results, totalRecords:totalResults[0].total});
				}
			});
		}
	});
};

exports.add = function (req, res) {

	var checkRecordSql = "SELECT id FROM categories WHERE category_name=?";

	db.exec(checkRecordSql, [req.body.category_name], function(err, results) {
		if (err) { // If unexpected error then send 500
			res.status(500).send("Server Error");
			return;
		} else {
			if(results.length > 0) {
				res.status(409).send({success:false, message: "Category already exists."});
			} else {

				var sql = "INSERT INTO categories SET ?"

				db.exec(sql, req.body, function(err, results) {
					
					if (err) { // If unexpected error then send 500
						res.status(500).send("Server Error");
						return;
					}
					
					if(results.affectedRows === 1) {
						res.send({success:true, data:results});
					} else {
						res.status(409).send({success:false, message: "Error while inserting record."});
					}

				});
			}
		}
	});
};

exports.update = function (req, res) {

	var recordChecksql = "SELECT id FROM categories WHERE category_name=? AND id!=?";

	db.exec(recordChecksql, [req.body.category_name, req.body.id], function(err, results) {
		
		if (err) { // If unexpected error then send 500
			res.status(500).send("Server Error");
			return;
		} else {
			if(results.length == 0) {

				var sql = "UPDATE categories SET category_name=? WHERE id=?";

				console.log(sql);				
				
				db.exec(sql, [req.body.category_name, req.body.id], function(err, results) {
					
					if (err) { // If unexpected error then send 500
						res.status(500).send("Server Error");
						return;
					}
					
					if(results) {
						res.send({success:true, data:results});
					} else {
						res.status(500).send({success:false});
					}

				});
			} else {
				res.status(409).send({success: false, msg: "Already exists."});
			}
		}
	});
};

/** DELETE ANSWER HANDLE */
exports.delete = function (req, res) {

	var sql = "DELETE FROM categories WHERE id=?";

	db.exec(sql, [req.body.id], function(err, results) {
		
		if (err) { // If unexpected error then send 500
			res.status(500).send("Server Error");
			return;
		} else {
			if(results.affectedRows === 1) {
				res.send({success:true, data:results});
			} else {
				res.send({success:false, message:"Record doesn't exist."});
			}
		}

	});
};
