/* Load our db */
var db = require("../database.js");

/** LOGIN HANDLE */
exports.login = function (req, res) {

	var sql = "SELECT * FROM users WHERE username=? AND password=?";

	db.exec(sql, [req.body.username, req.	body.password], function(err, results) {
		
		if (err) { // If unexpected error then send 500
			res.status(500).send("Server Error");
			return;
		}
		
		if(results.length) { // If data found then send appropriate response
			res.send({success:true, data:results});
		} else {
			// If no data then invalid authentication failed 
			res.status(401).send({success:false});
		}

	});
};

/** QUESTIONS HANDLE */
exports.questions = function (req, res) {

	var sql = "SELECT * FROM questions";
	
	db.exec(sql, [], function(err, results) {
		
		if (err) { // If unexpected error then send 500
			res.status(500).send("Server Error");
			return;
		} else {
			res.send({success:true, questions:results});
		}
		
	});
};

/** GET ANSWERS HANDLE */
exports.answers = function (req, res) {
	
	var orderBy = req.query.orderBy ? JSON.parse(req.query.orderBy) : [{column:'id', desc:'desc'}]; // Get order by params
	
	var page = req.query.page ? req.query.page : 1, 
	limit = req.query.limit ? req.query.limit : 10,
	offset = limit * (page-1),
	condition;

	var sql = "SELECT k.*, q.question FROM keywords AS k LEFT JOIN questions as q ON q.id = k.question_id ";

	if(req.query.filterType != 'undefined') {
		var filterValue = req.query.value; 
		if(filterValue != 'all') {
			
			switch(req.query.filterType){
			
				case 'question_id':
					sql += " WHERE question_id="+req.query.value;
					condition = " WHERE question_id="+req.query.value;
					break;
				case 'assigned':
					if(filterValue == "assigned") {
						sql += " WHERE question_id != 0";
						condition = " WHERE question_id != 0";
					} else {
						sql += " WHERE question_id = 0";
						condition = " WHERE question_id = 0";
					}
					break;
				case 'search':
					sql += " WHERE keyword LIKE '%" + req.query.value + "%'";
					condition = " WHERE keyword LIKE '%"+req.query.value+"%'";
					break;

				default:
					res.send({success:false});
					break;
			}
		}
	}
		
	// Order by column
	sql += " ORDER BY " + orderBy[0].column + " " + orderBy[0].type;

	sql += " LIMIT " + limit + "  OFFSET " + offset;
	
	console.log(sql);
	
	db.exec(sql, [], function(err, results) {
		
		if (err) { // If unexpected error then send 500
			
			res.status(500).send("Server Error.");
			return;
		} else {

			var allCats = "SELECT id, category_name FROM categories";

			db.exec(allCats, [], function(err, allCatsResult) {
				
				if (err) { // If unexpected error then send 500
					res.status(500).send("Server Error.");
				} else {

					var ansIdsStr = '';
					/** Get Associated categories */
					for (var i = 0; i < results.length; i++) {
						ansIdsStr += results[i].id + ',';
					}

					ansIdsStr = ansIdsStr.replace(/,+$/,'');
					
					var catsArray = [];
					for (var i = 0; i < allCatsResult.length; i++) {
						allCatsResult[i].ticked = false;
						catsArray.push(allCatsResult[i].id);
					};

					// Get associated categories
					var catsSql = "SELECT * FROM assoc_keyword_categories as akc JOIN categories as cat ON akc.category_id = cat.id WHERE answer_id IN("+ansIdsStr+")";

					db.exec(catsSql, [], function (err, catRes){

						for (var i = 0; i < results.length; i++) {
							
							results[i].selectedCategories = [];

							for (var j = 0; j < catRes.length; j++) {
								
								if(results[i].id == catRes[j].answer_id) {

									results[i].selectedCategories.push(catRes[j]);
								}
							};
						};


						for (var i = 0; i < results.length; i++) {

							// console.log("==================== --> " + i + " <-- ======================");
							
							var tmp = JSON.parse(JSON.stringify(allCatsResult));

							// console.log(tmp);
							
							for (var k = 0; k < results[i].selectedCategories.length; k++) {
								
								var index = catsArray.indexOf(results[i].selectedCategories[k].category_id);
								
								//console.log(index);
								
								if(index !== -1) {

									tmp[index].ticked =  true;
								}
							}				
							
							results[i].categories = tmp;
						}

						// Get total records
						var totalSql = "SELECT COUNT(id) as total FROM keywords";
						
						if(condition) {
							totalSql += condition;
						}

						db.exec(totalSql, [], function(totalSqlErr, totalResults) {
							if(totalSqlErr) {
								res.status(500).send("Server Error.")
							} else {
								for (var i = 0; i < results.length; i++) {
									results[i].approved = results[i].approved === 0 ? false : true;
									results[i].visible = results[i].visible === 0 ? false : true;

								};

								// Send the results
								res.send({success:true, data:results, totalRecords:totalResults[0].total});
							}
						});
					});
				}
			});


		}
	});
};

/** ADD ANSWER HANDLE */
exports.addAnswer = function (req, res) {

	var checkRecordSql = "SELECT id FROM keywords WHERE keyword=? AND question_id=?";

	db.exec(checkRecordSql, [req.body.keyword, req.body.question_id], function(err, results) {
		if (err) { // If unexpected error then send 500
			res.status(500).send("Server Error");
			return;
		} else {
			if(results.length > 0) {
				res.status(409).send({success:false, message: "You already have this record."});
			} else {

				var sql = "INSERT INTO keywords SET ?"

				var selectedCategories = req.body.selectedCategories;
				
				delete req.body.selectedCategories;
				
				db.exec(sql, req.body, function(err, results) {
					
					if (err) { // If unexpected error then send 500
						res.status(500).send("Server Error");
						return;
					}
					
					if(results.affectedRows === 1) {

						for (var i = 0; i < selectedCategories.length; i++) {
							
							// Set insert object
							selectedCategories[i].category_id = selectedCategories[i].id;
							selectedCategories[i].answer_id = results.insertId;
							
							// Remove un necessary details
							delete selectedCategories[i].category_name;
							delete selectedCategories[i].id;
							delete selectedCategories[i].ticked;

							console.log(i + ' --> ' + JSON.stringify(selectedCategories[i]));
							
							db.exec("INSERT INTO assoc_keyword_categories SET ?", selectedCategories[i], function (req, res){});

						};

						res.send({success:true, data:results});
					} else {
						res.status(409).send({success:false, message: "Error while inserting record."});
					}

				});
			}
		}

	});

};

/** UPDATE ANSWER HANDLE */
exports.updateAnswer = function (req, res) {

	/**
	 * 1. Check if same keyword
	 * 2. If no conflict then update data
	 * 3. Delete categories if provided
	 * 4. Insert new categories if provided
	 * 5. Send response
	 */

	var recordChecksql = "SELECT id FROM keywords WHERE (keyword='" + req.body.keyword + "' AND question_id=" + req.body.question_id + ') AND id !=' + req.body.id;

	db.exec(recordChecksql, [], function(err, selectCheckresults) {
		
		if (err) { // If unexpected error then send 500
			res.status(500).send("Server Error");
			return;
		} else {
			if(selectCheckresults.length == 0) {

				var sql = "UPDATE keywords SET keyword='" + req.body.keyword + "', question_id=" + req.body.question_id + ", approved="+req.body.approved+", visible="+req.body.visible+", notes='"+req.body.notes+"' WHERE id=" + req.body.id;
						
				db.exec(sql, req.body, function(err, updateResult) {
					
					console.log("============ UPDATE RESULT =============");
					console.log(updateResult);
					console.log("\n\n");

					if (err) { // If unexpected error then send 500
						res.status(500).send("Server Error");
						return;
					} else {

						// Delete categories if any
						var deleteRecordsString = '', catsToBeDeleted = req.body.catsToBeDeleted;

						if(catsToBeDeleted.length > 0) {
							for (var i = 0; i < catsToBeDeleted.length; i++) {
								deleteRecordsString += "DELETE FROM assoc_keyword_categories WHERE answer_id=" + req.body.id + " AND category_id=" + catsToBeDeleted[i] + ";";
							};

							console.log("==== DELETE QUERIES ====")
							console.log(deleteRecordsString +'\n\n');

							db.exec(deleteRecordsString, [], function(err, deleteResult) {

								console.log("============ DELETE CATS RESULT =============");
								console.log(deleteResult);
								console.log('\n\n');

								if (err) { // If unexpected error then send 500
									res.status(500).send("Server Error");
									return;
								} else {
									

									if(req.body.selectedCategories.length > 0) {
										// Insert categories
										var insertBulkArray = [];
										selectedCategories = req.body.selectedCategories;

										for (var i = 0; i < selectedCategories.length; i++) {
											insertBulkArray.push([req.body.id, selectedCategories[i].id]);
										}
										
										console.log("============ INSERT CATS ARRAY =============");
										console.log(insertBulkArray);
										console.log('\n\n');

										var insertSql = "INSERT INTO assoc_keyword_categories (answer_id, category_id) VALUES ?";
										db.exec(insertSql, [insertBulkArray], function(err, catInsertResult) {
											
											console.log("============ INSERT CATS RESULT =============");
											console.log(catInsertResult);
											console.log('\n\n');
											
											if (err) { // If unexpected error then send 500
												res.status(500).send("Server Error");
												return;
											} else {
												if(catInsertResult) {
													res.send({
														success:true, 
														insertedCategoriesResult:catInsertResult, 
														deletedCategoriesResult:deleteResult, 
														recordUpdateResult:updateResult
													});
												} else {
													res.status(500).send({success:false});
												}
											}
										});
									} else {

										if(deleteResult) {
											res.send({
													success:true, 
													deletedCategoriesResult:deleteResult, 
													recordUpdateResult:updateResult
												});
										} else {
											res.status(500).send({success:false});
										}
									}
								}
							});
						} else {

							if(req.body.selectedCategories.length > 0) {
								// Insert categories
								var insertBulkArray = [];
								selectedCategories = req.body.selectedCategories;

								for (var i = 0; i < selectedCategories.length; i++) {
									insertBulkArray.push([req.body.id, selectedCategories[i].id]);
								}
								
								console.log("============ INSERT CATS ARRAY =============");
								console.log(insertBulkArray);
								console.log('\n\n');
								
								var insertSql = "INSERT INTO assoc_keyword_categories (answer_id, category_id) VALUES ?";
								db.exec(insertSql, [insertBulkArray], function(err, catInsertResult) {
									
									console.log("============ INSERT CATS RESULT =============");
									console.log(catInsertResult);
									console.log('\n\n');
									
									if (err) { // If unexpected error then send 500
										res.status(500).send("Server Error");
										return;
									} else {
										if(catInsertResult) {
											res.send({
												success:true, 
												insertedCategoriesResult:catInsertResult, 
												recordUpdateResult:updateResult
											});
										} else {
											res.status(500).send({success:false});
										}
									}
								});
							} else {
								if(updateResult) {
									res.send({success:true, recordUpdateResult:updateResult});
								} else {
									res.status(500).send({success:false});
								}
							}

						}						
					}
				});
			} else {
				res.status(409).send({success: false, msg: "Already assigned to this question."});
			}
		}
	});
};

/** DELETE ANSWER HANDLE */
exports.deleteAnswer = function (req, res) {

	var sql = "DELETE FROM keywords WHERE id=" + req.body.id;

	db.exec(sql, req.body, function(err, results) {
		
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

/** Get keyword suggestions */
exports.keywordSuggestions = function (req, res) {

	var sql = "SELECT * FROM keywords WHERE";
	
	/**  If question id add it to query */
	if(req.query.question_id) {
		sql+= " question_id=" + req.query.question_id + " AND";
	}
	
	sql += " keyword LIKE '%" + req.query.keyword + "%'";

	db.exec(sql, req.body, function(err, results) {
		
		if (err) { // If unexpected error then send 500
			res.status(500).send("Server Error");
			return;
		} else {
			res.send({success:true, results:results});
		}

	});
};

/** Get keyword suggestions */
exports.getAllKeywords = function (req, res) {

	var sql = "SELECT id, keyword FROM keywords";

	db.exec(sql, [], function(err, results) {
		
		if (err) { // If unexpected error then send 500
			res.status(500).send("Server Error");
			return;
		} else {
			res.send({success:true, data:results});
		}

	});
};