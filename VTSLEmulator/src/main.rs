pub mod emulator;
pub mod line_scanner;
pub mod vts_parser;
use std::fs;

use vts_parser::VTNode;

fn rec_count_size(vts: &VTNode) -> usize {
	let mut size = 0;
	for child in vts.children.iter() {
		size += rec_count_size(child);
	}

	size += vts.children.len();

	size
}

fn main() {
	let result = fs::read_to_string("./input.vts").unwrap();
	let vts = vts_parser::read_vts_file(&result);

	println!("Size: {}", rec_count_size(&vts));
	for child in vts.children.iter() {
		println!("-> {}", child.name);
	}

	let output = vts_parser::write_vts_file(&vts);
	fs::write("./output.vts", output).unwrap();
}
