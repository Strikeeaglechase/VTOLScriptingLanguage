use crate::vts_parser::VTNode;

pub struct GV {
	pub name: String,
	pub id: usize,
	pub value: f32,
}

impl GV {
	pub fn new(name: &str, id: usize, value: f32) -> GV {
		GV { name: name.to_string(), id: id, value: value }
	}
}

pub struct Emulator {
	pub gvs: Vec<GV>,
	pub total_executed_event_count: usize,
	pub exec_log: Vec<String>,

	vts: VTNode,
	debug: bool,
}

impl Emulator {
	pub fn new(vts: VTNode, debug: bool) -> Emulator {
		Emulator {
			gvs: Vec::new(),
			total_executed_event_count: 0,
			exec_log: Vec::new(),
			vts: vts,
			debug: debug,
		}
	}

	fn execute_sequence(&mut self, sequence: usize, depth: usize) {
		let sequence = self.vts.get_child_by_id(sequence);
		let sequence_name = sequence.get_string("sequenceName").to_owned();
		self.log(format!("{}Executing sequence: {}", "\t".repeat(depth), sequence_name).to_string());

		let events = sequence.get_all_children_with_name("EVENT");
	}

	pub fn execute(&mut self) {
		self.vts.init_child_maps();

		let start_immediately_sequences: Vec<usize> = self
			.vts
			.get_all_children_with_name("SEQUENCE")
			.into_iter()
			.filter(|s| s.get_bool("startImmediately"))
			.map(|s| s.id)
			.collect();

		for s in start_immediately_sequences {
			self.execute_sequence(s, 0);
		}
	}

	fn log(&mut self, msg: String) {
		if self.debug {
			println!("{}", msg);
		}

		self.exec_log.push(msg);
	}
}
