const applyLinks = {
	"income certificate": "https://www.tnesevai.tn.gov.in/",
	"caste certificate": "https://www.tnesevai.tn.gov.in/",
	"birth certificate": "https://tnurbanepay.tn.gov.in/",
	"community certificate": "https://www.tnesevai.tn.gov.in/",
	"nativity certificate": "https://www.tnesevai.tn.gov.in/",
	"patta chitta": "https://eservices.tn.gov.in/eservicesnew/index.html"
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
