{
	let docCategories
	let docQuote
	let docButton

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	const showQuote = data => {
		let htmlQuoteText = data.value
		docQuote.innerHTML = htmlQuoteText;
	}

	const showSelect = data => {
		let htmlSelectText
		for (let selectItem of data) {
			htmlSelectText += `<option value="${selectItem}">${capitalizeFirstLetter(selectItem)}</option>`;
		}
		docCategories.innerHTML += htmlSelectText;
	}

	const getRandomQuote = async () => {
		let selectedCategory = docCategories.value;
		let url
		if (selectedCategory == "everything") {
			url = `https://api.chucknorris.io/jokes/random`;
		}
		else {
			url = `https://api.chucknorris.io/jokes/random?category=${selectedCategory}`;
		}

		// Met de fetch API proberen we de data op te halen.
		const request = await fetch(url);
		const data = await request.json();
		showQuote(data);
	};

	const getCategories = async () => {
		const url = `https://api.chucknorris.io/jokes/categories`;

		// Met de fetch API proberen we de data op te halen.
		const request = await fetch(url);
		const data = await request.json();
		showSelect(data);
	};

	document.addEventListener('DOMContentLoaded', function () {
		docCategories = document.querySelector("#categories");
		docQuote = document.querySelector("#quote-field");
		docButton = document.querySelector("#buttonRefresh");

		docButton.addEventListener("click", function (event) {
			getRandomQuote();
		});

		getCategories();
		getRandomQuote();
	});
}