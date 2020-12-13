{
	let docCategories
	let docQuote
	let docButton
	let selectedCategory
	let docStar
	let quoteDic = {}
	let docFavoQuotes

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	const showQuote = data => {
		quoteDic.value = data.value;
		quoteDic.id = data.id;
		docQuote.innerHTML = quoteDic.value;
	}

	const saveQuote = () => {
		let storedQuotes = [];
		if (localStorage.getItem("favoQuotes") != null) {
			storedQuotes = JSON.parse(localStorage.getItem("favoQuotes")); 			//get them back
		}
		storedQuotes.push(quoteDic);
		localStorage.setItem("favoQuotes", JSON.stringify(storedQuotes)); 				//store quotes
		console.log(storedQuotes);
		showFavoQuotes();
	}

	const deleteQuote = (quoteId) => {
		if (localStorage.getItem("favoQuotes") != null) {
			let storedQuotes = JSON.parse(localStorage.getItem("favoQuotes")); 			//get them back
			let newStoredQuotes = [];
			for (quote of storedQuotes) {
				if (quote.id != quoteId) {
					newStoredQuotes.push(quote);
				}
			}
			localStorage.setItem("favoQuotes", JSON.stringify(newStoredQuotes)); 				//store quotes
			console.log(newStoredQuotes);
		}
		showFavoQuotes();
	}

	const showFavoQuotes = () => {
		let storedQuotes = JSON.parse(localStorage.getItem("favoQuotes")); 			//get them back
		let quotesHTML = "";
		for (quote of storedQuotes) {
			quotesHTML += `<p id="quote-field">${quote.value}</p>`;
		}
		docFavoQuotes.innerHTML = quotesHTML;
	}

	const showSelect = data => {
		let htmlSelectText
		for (let selectItem of data) {
			htmlSelectText += `<option value="${selectItem}">${capitalizeFirstLetter(selectItem)}</option>`;
		}
		docCategories.innerHTML += htmlSelectText;
	}

	const checkLikesAndFavo = () => {
		// FAVO
		if (localStorage.getItem("favoQuotes") != null) {
			let storedQuotes = JSON.parse(localStorage.getItem("favoQuotes")); 			//get them back
			let isFavo = false;
			for (quote of storedQuotes) {
				if (quote.id == quoteDic.id) {			// checken of de display qoute een favo qoute is
					isFavo = true;
				}
			}
			if (isFavo == true) {
				docStar.checked = true;
			}
			else {
				docStar.checked = false;
			}
		}
	}

	const getRandomQuote = async () => {
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
		checkLikesAndFavo();
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
		docStar = document.querySelector("#star");
		docFavoQuotes = document.querySelector("#favo-quotes");
		selectedCategory = docCategories.value;							// eerste item erin steken

		docButton.addEventListener("click", function (event) {
			getRandomQuote();
		});

		docStar.addEventListener("change", function (event) {
			if (this.checked) {
				// Checkbox is checked..
				saveQuote();
			} else {
				// Checkbox is not checked..
				deleteQuote(quoteDic.id);
			}
		});

		docCategories.onchange = function () {
			selectedCategory = docCategories.value;
			getRandomQuote();
		}

		showFavoQuotes();
		getCategories();
		getRandomQuote();
	});
}