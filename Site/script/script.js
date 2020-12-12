{
let showResult = data => {
    const Doc_quote = document.querySelector("#randomQuote");
    let quoteText = data.value;
    Doc_quote.innerHTML = quoteText;
}


let getRandomQuote = async () => {
	const url = `https://api.chucknorris.io/jokes/random`;

	// Met de fetch API proberen we de data op te halen.
	const request = await fetch(url);
	const data = await request.json();
	console.log(data);

	showResult(data);
};


document.addEventListener('DOMContentLoaded', function() {
	//getRandomQuote();
});
}