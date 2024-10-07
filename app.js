const sharp = require("sharp");
const path = require("path");
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
		if (err) {
			return res.status(500).send("Unable to read the directory.");
		}

		const images = items.map((image) => {
			const imagePath = "./public/uploads";
			var modified = fs.statSync(imagePath).mtimeMs;
			return { filename: image, modifiedTime: modified };
		});

		res.render("index", { title: "Kenziegram", images: items });
	});
});

app.post("/upload", upload.single("image"), (req, res, next) => {
	const filePath = path.join(_dirname, "public", "uploads", req.file.filename);
	const ext = path.extName(req.file.filename).toLowerCase();

	if (ext == ".gif") {
		const webpPath = filePath.replace(".gif", ".webp");
		sharp(filePath, { animated: true }) // Use `animated: true` to support GIF conversion
			.toFormat("webp")
			.toFile(webpPath, (err, info) => {
				if (err) {
					console.error("Error converting GIF to WebP:", err);
					return res.status(500).send("Error processing GIF.");
				}

				// Store the WebP filename
				uploaded_files.push(path.basename(webpPath));
				console.log(
					"Converted GIF to animated WebP: " + path.basename(webpPath)
				);

				// Delete the original GIF to save space
				fs.unlink(filePath, (unlinkErr) => {
					if (unlinkErr)
						console.error("Error deleting original GIF:", unlinkErr);
				});

				// Redirect after processing
				res.redirect("/");
			});
	} else {
		const webpPath = filePath.replace(ext, ".webp");
		sharp(filePath)
			.toFormat("webp")
			.toFile(webpPath, (err, info) => {
				if (err) {
					console.log("Error converting to WebP: ", err);
					return res.status(500).send("Error processing image.");
				}

				uploaded_files.push(path.basename(webpPath));
				console.log("Converted and uploaded: " + path.basename(webpPath));

				fs.unlink(filePath, (unlinkErr) => {
					if (unlinkErr) {
						console.error("Error deleting original file: ", unlinkErr);
					}
				});

				res.redirect("/");
			});
	}

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
