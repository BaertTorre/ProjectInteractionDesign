{
	let docCategories
	let docQuote
	let docButton
	let selectedCategory
	let docStar
	let quoteDic = {}
	let docFavoQuotes
	let docLike
	let docDislike
	let docLikeText
	let docDislikeText
	let docFavoButtons

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	const showQuote = data => {
		quoteDic.value = data.value;
		quoteDic.id = data.id;
		quoteDic.category = selectedCategory;
		docQuote.innerHTML = quoteDic.value;
	}

	const saveQuote = () => {
		let storedQuotes = [];
		if (localStorage.getItem("favoQuotes") != null) {
			storedQuotes = JSON.parse(localStorage.getItem("favoQuotes")); 			//get them back
		}
		storedQuotes.push(quoteDic);
		localStorage.setItem("favoQuotes", JSON.stringify(storedQuotes)); 				//store quotes
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
		}
		showFavoQuotes();
	}

	const showFavoQuotes = () => {
		let storedQuotes = JSON.parse(localStorage.getItem("favoQuotes")); 			//get them back
		if (storedQuotes != null) {
			let quotesHTML = "";
			for (quote of storedQuotes) {
				quotesHTML += `<p style="grid-column: 1";>${quote.value}</p>`;
				quotesHTML += `<div class="c-field__favo-div"><button style="grid-column: 0"; value="${quote.id}" class="c-field__favo-button"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
				width="1rem" height="1rem" viewBox="0 0 488.936 488.936" style="enable-background:new 0 0 488.936 488.936;"
				xml:space="preserve">
				   <path d="M381.16,111.948H107.376c-6.468,0-12.667,2.819-17.171,7.457c-4.504,4.649-6.934,11.014-6.738,17.477l9.323,307.69
					   c0.39,12.92,10.972,23.312,23.903,23.312h20.136v-21.012c0-24.121,19.368-44.049,43.488-44.049h127.896
					   c24.131,0,43.893,19.928,43.893,44.049v21.012h19.73c12.933,0,23.52-10.346,23.913-23.268l9.314-307.7
					   c0.195-6.462-2.234-12.863-6.738-17.513C393.821,114.767,387.634,111.948,381.16,111.948z"/>
				   <path d="M309.166,435.355H181.271c-6.163,0-11.915,4.383-11.915,11.516v30.969c0,6.672,5.342,11.096,11.915,11.096h127.895
					   c6.323,0,11.366-4.773,11.366-11.096v-30.969C320.532,440.561,315.489,435.355,309.166,435.355z"/>
				   <path d="M427.696,27.106C427.696,12.138,415.563,0,400.591,0H88.344C73.372,0,61.239,12.138,61.239,27.106v30.946
					   c0,14.973,12.133,27.106,27.105,27.106H400.59c14.973,0,27.105-12.133,27.105-27.106L427.696,27.106L427.696,27.106z"/>
		   </svg></button></div>`;
			}
			docFavoQuotes.innerHTML = quotesHTML;

			docFavoButtons = document.querySelectorAll(".c-field__favo-button");
			addEventlistenersFavoButtons();
		}
	}

	const showSelect = data => {
		let htmlSelectText
		for (let selectItem of data) {
			htmlSelectText += `<option value="${selectItem}">${capitalizeFirstLetter(selectItem)}</option>`;
		}
		docCategories.innerHTML += htmlSelectText;
	}

	const checkFavo = () => {
		// FAVO
		if (localStorage.getItem("favoQuotes") != null) {
			let storedQuotes = JSON.parse(localStorage.getItem("favoQuotes")); 			//get them back
			if (storedQuotes != null) {
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
		else {
			docStar.checked = false;
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
		checkFavo();
		getLikes();
	};

	const getCategories = async () => {
		const url = `https://api.chucknorris.io/jokes/categories`;

		// Met de fetch API proberen we de data op te halen.
		const request = await fetch(url);
		const data = await request.json();
		showSelect(data);
	};

	const showLikes = (responseData) => {
		docLikeText.innerHTML = responseData.likes;
		docDislikeText.innerHTML = responseData.dislikes;
	}

	function getLikes() {
		// zorgen dat de knop niet meer geliked is
		docDislike.checked = false;
		docLike.checked = false;

		const url = 'https://projectinteractionfunctionapp.azurewebsites.net/api/likes';
		fetch(url, {
			method: 'POST', // or 'PUT'
			body: quoteDic.id, // data can be `string` or {object}!
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(res => res.json())
			.then(response => {
				showLikes(response);
			})
			.catch(error => console.error('Error:', error));
	}

	function postData(data) {
		const url = 'https://projectinteractionfunctionapp.azurewebsites.net/api/likes';
		fetch(url, {
			method: 'PUT', // or 'PUT'
			body: JSON.stringify(data), // data can be `string` or {object}!
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(res => res.json())
			.then(response => {
				showLikes(response);
			})
			.catch(error => console.error('Error:', error));
	}

	const updateLikes = (isLiked) => {
		let data
		if (isLiked == true) {
			if (docDislike.checked) {
				docDislike.checked = false;
				data = { "Likes": 1, "Dislikes": -1, "Category": quoteDic.category, "Id": quoteDic.id }
			}
			else {
				data = { "Likes": 1, "Dislikes": 0, "Category": quoteDic.category, "Id": quoteDic.id }
			}
		}
		else {
			data = { "Likes": -1, "Dislikes": 0, "Category": quoteDic.category, "Id": quoteDic.id }
		}
		postData(data);
	}

	const updateDislikes = (isdisLiked) => {
		let data
		if (isdisLiked == true) {
			if (docLike.checked) {
				docLike.checked = false;
				data = { "Likes": -1, "Dislikes": 1, "Category": quoteDic.category, "Id": quoteDic.id }
			}
			else {
				data = { "Likes": 0, "Dislikes": 1, "Category": quoteDic.category, "Id": quoteDic.id }
			}
		}
		else {
			data = { "Likes": 0, "Dislikes": -1, "Category": quoteDic.category, "Id": quoteDic.id }
		}
		postData(data);
	}

	const addEventlisteners = () => {
		docButton.addEventListener("click", function (event) {
			getRandomQuote();
		});

		docLike.addEventListener("change", function (event) {
			if (this.checked) {
				// Checkbox is checked..
				updateLikes(true);
			} else {
				// Checkbox is not checked..
				updateLikes(false);
			}
		});

		docDislike.addEventListener("change", function (event) {
			if (this.checked) {
				// Checkbox is checked..
				updateDislikes(true);
			} else {
				// Checkbox is not checked..
				updateDislikes(false);
			}
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
	}

	const addEventlistenersFavoButtons = () => {
		for (let docFavoButton of docFavoButtons) {
			docFavoButton.addEventListener("click", function (event) {
				setTimeout(() => {
					deleteQuote(this.value);
					checkFavo();
				}, 300);
			});
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		docCategories = document.querySelector("#categories");
		docQuote = document.querySelector("#quote-field");
		docButton = document.querySelector("#buttonRefresh");
		docStar = document.querySelector("#star");
		docFavoQuotes = document.querySelector("#favo-quotes");
		docLike = document.querySelector("#like");
		docDislike = document.querySelector("#dislike");
		docLikeText = document.querySelector("#likeText");
		docDislikeText = document.querySelector("#dislikeText");
		selectedCategory = docCategories.value;							// eerste item erin steken

		addEventlisteners();
		showFavoQuotes();
		getCategories();
		getRandomQuote();
	});
}