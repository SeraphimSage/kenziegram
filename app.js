const express = require("express");
const multer = require("multer");
const app = express();
const fs = require("fs");
app.set("views", "./views");
app.set("view engine", "pug");

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/uploads");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + ".jpg";
		cb(null, file.filename + "-" + uniqueSuffix);
	},
});

const upload = multer({ storage: storage });

const uploaded_files = [];
let requestCount = 0;

app.get("/", (req, res) => {
	const path = "./public/uploads";
	fs.readdir(path, (err, items) => {
		var modified = fs.statSync(imagePath).mtimeMs;
		const images = items.map((image) => {
			res.render("index", { title: "Kenziegram", images: items });
		});
	});
});

app.post("/upload", upload.single("image"), (req, res, next) => {
	uploaded_files.push(req.file.filename);
	console.log("Uploaded: " + req.file.filename);

	res.redirect("/");
});

app.get("/poll", (req, res) => {
	if (requestCount < uploaded_files.length) {
		res.send({ image: uploaded_files[requestCount] });
		requestCount++;
	} else {
		res.send({});
	}
});

app.use(express.static("./public"));

const port = 3000;

app.listen(port, () =>
	console.log(`App listening at http://localhost:${port}`)
);
