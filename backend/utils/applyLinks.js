const applyLinks = {
	"income certificate": "https://www.tnesevai.tn.gov.in/",
	"caste certificate": "https://www.tnesevai.tn.gov.in/",
	"birth certificate": "https://tnurbanepay.tn.gov.in/",
	"community certificate": "https://www.tnesevai.tn.gov.in/",
	"nativity certificate": "https://www.tnesevai.tn.gov.in/",
	"first graduate certificate": "https://www.tnesevai.tn.gov.in/",
	"agricultural income certificate": "https://www.tnesevai.tn.gov.in/",
	"family migration certificate": "https://www.tnesevai.tn.gov.in/",
	"widow certificate": "https://www.tnesevai.tn.gov.in/",
	"obc certificate": "https://www.tnesevai.tn.gov.in/",
	"residence certificate": "https://www.tnesevai.tn.gov.in/",
	"unmarried certificate": "https://www.tnesevai.tn.gov.in/",
	"ignops pension scheme": "https://www.tnesevai.tn.gov.in/",
	"unmarried women pension scheme": "https://www.tnesevai.tn.gov.in/"
};

function findApplyLink(query, services = []) {
	const normalizedQuery = (query || "").toLowerCase();
	const normalizedServices = services.map((service) => String(service || "").toLowerCase());

	for (const [serviceName, url] of Object.entries(applyLinks)) {
		if (normalizedQuery.includes(serviceName)) {
			return { serviceName, url };
		}

		if (normalizedServices.some((service) => service.includes(serviceName))) {
			return { serviceName, url };
		}
	}

	return null;
}

module.exports = {
	applyLinks,
	findApplyLink
};
