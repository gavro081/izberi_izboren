// NOTE: there is not a single match for the letter 'ѕ' (ѕ како ѕвонче) in the entire db, so both dz and dj are mapped to 'џ'
// this way you can search for "Menadzment", instead of having to write "Menadjment"
// if there is ever a term anywhere in the db that contains the letter 'ѕ' by design that term will be unsearchable :)

const latinToCyrillicMap: [RegExp, string][] = [
	[/(sh)/gi, "ш"],
	[/(ch)/gi, "ч"],
	[/(zh)/gi, "ж"],
	[/(gj)/gi, "ѓ"],
	[/(kj)/gi, "ќ"],
	[/(lj)/gi, "љ"],
	[/(nj)/gi, "њ"],
	[/(dj)/gi, "џ"],
	[/(dz)/gi, "џ"],
	[/(a)/gi, "а"],
	[/(b)/gi, "б"],
	[/(v)/gi, "в"],
	[/(g)/gi, "г"],
	[/(d)/gi, "д"],
	[/(e)/gi, "е"],
	[/(z)/gi, "з"],
	[/(i)/gi, "и"],
	[/(j)/gi, "ј"],
	[/(k)/gi, "к"],
	[/(l)/gi, "л"],
	[/(m)/gi, "м"],
	[/(n)/gi, "н"],
	[/(o)/gi, "о"],
	[/(p)/gi, "п"],
	[/(r)/gi, "р"],
	[/(s)/gi, "с"],
	[/(t)/gi, "т"],
	[/(u)/gi, "у"],
	[/(f)/gi, "ф"],
	[/(h)/gi, "х"],
	[/(c)/gi, "ц"],
];

export function LatinToCyrillic(text: string): string {
	let result = text;
	latinToCyrillicMap.forEach(([pattern, replacement]) => {
		result = result.replace(pattern, replacement);
	});
	return result;
}

// console.log(LatinToCyrillic("abvgdGjezhzijklLjmnnjOprstkjufhcchdjsh"));
