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
				quotesHTML += `<p id="quote-field">${quote.value}</p>`;
			}
			docFavoQuotes.innerHTML = quotesHTML;
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

		const url = 'http://localhost:7071/api/likes';
		fetch(url, {
			method: 'POST', // or 'PUT'
			body: quoteDic.id, // data can be `string` or {object}!
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(res => res.json())
			.then(response => {
				console.log(response);
				showLikes(response);
			})
			.catch(error => console.error('Error:', error));
	}

	function postData(data) {
		const url = 'http://localhost:7071/api/likes';
		fetch(url, {
			method: 'PUT', // or 'PUT'
			body: JSON.stringify(data), // data can be `string` or {object}!
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(res => res.json())
			.then(response => {
				console.log(response);
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