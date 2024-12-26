///*
pub mod emulator;
pub mod line_scanner;
pub mod vts_parser;
use std::{
	fs::{self, File},
	io::Write,
};

use emulator::Emulator;

const DEBUG: bool = false;

fn main() {
	let start_time = std::time::Instant::now();

	let result = fs::read_to_string("./input.vts").unwrap();
	let vts = vts_parser::read_vts_file(&result);

	let writer: Option<Box<(dyn FnMut(String) + 'static)>> = if DEBUG {
		if fs::metadata("./log.txt").is_ok() {
			fs::remove_file("./log.txt").unwrap();
		}
		let log_file: &mut File = Box::leak(Box::new(File::create("./log.txt").unwrap()));

		let writer = |mut msg: String| {
			msg.push('\n');
			log_file.write_all(msg.as_bytes()).unwrap();
		};

		Some(Box::new(writer))
	} else {
		None
	};

	let mut emulator = Emulator::new(DEBUG, writer);
	emulator.execute(vts);

	let elapsed = start_time.elapsed();
	println!("Elapsed: {}ms", elapsed.as_millis());
}
