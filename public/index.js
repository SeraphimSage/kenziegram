setInterval(() => {
	fetch("/poll")
		.then((res) => res.json())
		.then((json) => {
			if (json.src) {
				const image = document.createElement("img");
				const container = document.getElementById("sentPictures");
				image.src = "./uploads/" + json.src;
				container.appendChild(image);
			}
		});
}, 5000);
