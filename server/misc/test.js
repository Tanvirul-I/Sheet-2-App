const main = async () => {
	const { getSheetInfo } = require("../controllers/sheetController");

	const values = [];

	await getSheetInfo(
		"tanvirul.islam@stonybrook.edu",
		"https://docs.google.com/spreadsheets/d/1ABj6vW67Q1NJEEDXbTaq7d_fo32kZYn4m2acbAR07nA/edit#gid=0"
	);
	await getSheetInfo(
		"tanvirul.islam@stonybrook.edu",
		"https://docs.google.com/spreadsheets/d/1ABj6vW67Q1NJEEDXbTaq7d_fo32kZYn4m2acbAR07nA/edit#gid=309368727"
	);
	await getSheetInfo(
		"tanvirul.islam@stonybrook.edu",
		"https://docs.google.com/spreadsheets/d/1ABj6vW67Q1NJEEDXbTaq7d_fo32kZYn4m2acbAR07nA/edit#gid=610148519"
	);
};

module.exports = {
	main,
};
