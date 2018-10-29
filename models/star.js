/* ===== Star Class ===============================
|  Class with a constructor for star			   |
|  ===============================================*/

module.exports = class Star {
	constructor(data) {
		this.validateInput(data);

		this.ra = data.ra,
			this.dec = data.dec,
			this.story = data.story;

	    // optional elements should only be included when present
		if (data.mag)
			this.mag = data.mag;

		if (data.con)
			this.con = data.con;
	}

	toJSON() {
		const json = {
			'dec': this.dec,
			'ra': this.ra,
			'story': new Buffer(this.story).toString('hex'),
		}
		if (this.mag)
			json['mag'] = mag;
		if (this.con)
			json['con'] = con;

		return json;
	}

	validateInput(input) {
		const {dec, ra, story} = input;

		if (typeof dec !== 'string' || typeof ra !== 'string' || typeof story !== 'string' || !dec.length || !ra.length || !story.length) {
			throw new Error("Star info should include non-empty strings 'dec', 'ra' & 'story'");
		}

		if (story.split(/\s+/).length > 250 || new Buffer(story).length > 500) {
			throw new Error('Star story is too long; Maximum 250 words / 500 bytes allowed');
		}

		// https://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only#comment70467722_14313213
		const isASCII = (str => /^[\x00-\x7F]*$/.test(str));

		if (!isASCII(story)) {
			throw new Error('Star story should only contain ASCII chars');
		}
	}
}
