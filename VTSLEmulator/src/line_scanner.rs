pub struct LineScanner<'a> {
	lines: Vec<&'a str>,
	idx: usize,
}

impl LineScanner<'_> {
	pub fn new<'a>(content: &'a str) -> LineScanner<'a> {
		let lines: Vec<&str> = content.lines().map(|l| l.trim()).filter(|l| l.len() > 0).collect();

		LineScanner { lines, idx: 0 }
	}

	pub fn eof(&self) -> bool {
		self.idx >= self.lines.len()
	}

	pub fn read_line(&mut self) -> &str {
		if self.eof() {
			// return None;
			return "";
		}

		let line = self.lines[self.idx];
		self.idx += 1;
		line
	}

	pub fn peak_line(&self) -> &str {
		if self.eof() {
			// return None;
			return "";
		}

		self.lines[self.idx]
	}
}
