const express = require("express");
const multer = require("multer");
const app = express();
const fs = require("fs");

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

app.get("/", (req, res) => {
	const path = "./public/uploads";
	fs.readdir(path, (err, items) => {
		const images = items.map((image) => {
			return `<img style = 'height:200px' src='./uploads/${image}' />`;
		});
		res.send(`
		<style>
			body {
			background-color: darkgray;
		}

		#pictureForm {
			position: relative;
			align-self: center;
			text-align: center;
		}

		h2 {
			text-align: center;
		}

		#sentPictures {
			display: flex;
			justify-content: center;
			align-content: center;
			flex-direction: row-reverse;
		}

		img {
			flex-basis: auto;
		}
		
		</style>
		<h1>Kenziegram</h1>
            <form id="pictureForm" method='post' action='/upload' enctype='multipart/form-data'>
                <div >
					<label for='image'>Choose a picture</label>
					<br />
                    <input type="file" id="image" name="image">
				</div>
                <div>
                    <button>Send the picture</button>
                </div>
            </form>
			<h2>Sent Pictures</h2>
			<div id="sentPictures">
            ${images}
			</div>
        `);
	});
});

app.post("/upload", upload.single("image"), function (request, response, next) {
	// request.file is the \`myFile\` file
	// request.body will hold the text fields, if there were any
	uploaded_files.push(request.file.filename);
	console.log("Uploaded: " + request.file.filename);
	response.redirect("/");
});

app.use(express.static("./public"));

const port = 3000;

app.listen(port, () =>
	console.log(`Example app listening at http://localhost:${port}`)
);
