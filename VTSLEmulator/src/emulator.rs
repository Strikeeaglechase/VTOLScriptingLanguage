use crate::vts_parser::{VTNode, VTValue};

#[derive(Debug)]
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

pub struct ExecutedUnitEvent {
	pub unit_id: f32,
	pub method: String,
}

pub struct Emulator {
	pub gvs: Vec<GV>,
	pub total_executed_event_count: usize,
	pub exec_log: Vec<String>,
	pub executed_unit_events: Vec<ExecutedUnitEvent>,

	debug: bool,
	log_writer: Option<Box<dyn FnMut(String)>>,
}

impl Emulator {
	pub fn new(debug: bool, log_writer: Option<Box<dyn FnMut(String)>>) -> Emulator {
		Emulator {
			gvs: Vec::new(),
			total_executed_event_count: 0,
			exec_log: Vec::new(),
			debug: debug,
			executed_unit_events: Vec::new(),
			log_writer: log_writer,
		}
	}

	fn execute_sequence(&mut self, vts: &VTNode, sequence: &VTNode, depth: usize) {
		let sequence_name = sequence.get_string("sequenceName").to_owned();
		self.log(format!("{}Executing sequence: {}", "\t".repeat(depth), sequence_name).to_string());

		let events = sequence.get_all_children_with_name("EVENT");
		for event in events {
			if event.has_value("conditional") {
				let event_start_condition = event.get_number("conditional");
				self.sync_wait_for_conditional(vts, event_start_condition);

				// Debug info:
				let conditionals = vts.get_child("Conditionals").get_all_children_with_name("CONDITIONAL");
				let jump_flag = conditionals
					.iter()
					.find(|c| c.get_number("id") == event_start_condition)
					.unwrap()
					.get_child("COMP")
					.get_number("c_value");

				let result = "\t".repeat(depth + 1) + &format!("<WAITED> {jump_flag}");
				self.log(result);
			}

			let event_targets = event.get_all_children_with_name("EventTarget");
			self.fire_events_sync(vts, event_targets, depth + 1);
		}
	}

	fn fire_events_sync(&mut self, vts: &VTNode, events: Vec<&VTNode>, depth: usize) {
		for event in events {
			self.fire_event(vts, event, depth);
		}
	}

	fn convert_event_args_to_string(&self, vts: &VTNode, event: &VTNode) -> Vec<String> {
		let param_infos = event.get_all_children_with_name("ParamInfo");

		let values = param_infos.iter().map(|p| match p.get_string("type").as_str() {
			"System.String" => p.get_string("value").to_string(),
			"System.Single" => p.get_number("value").to_string(),
			"GlobalValue" => {
				let gv = self.get_gv(p.get_number("value") as usize);
				gv.name.to_string() + "(" + &gv.value.to_string() + ")"
			}
			"ConditionalActionReference" => {
				let conditional_actions = vts.get_all_children_with_name("ConditionalAction");
				let conditional = conditional_actions.iter().find(|c| c.get_number("id") == p.get_number("value")).unwrap();

				conditional.get_string("name").to_string() + " " + &p.get_number("value").to_string()
			}
			_ => panic!("Unhandled param type: {}", p.get_string("type")),
		});

		values.collect()
		// values.map(|v| v.to_string()).collect()
	}

	fn debug_event(&mut self, vts: &VTNode, event: &VTNode, depth: usize) {
		if !self.debug {
			return;
		}

		let mut result = "\t".repeat(depth);
		match event.get_string("targetType").as_str() {
			"System" => {
				result.push_str(event.get_string("methodName"));
				result.push_str(" ");
				result.push_str(&self.convert_event_args_to_string(vts, event).join(", "));
			}
			"Event_Sequences" => {
				result.push_str(event.get_string("methodName"));
				result.push_str(" ");
				let sequences = vts.get_all_children_with_name("SEQUENCE");
				let seq = sequences.iter().find(|s| s.get_number("id") == event.get_number("targetID")).unwrap();
				result.push_str(seq.get_string("sequenceName"));
			}
			_ => {}
		}

		self.log(result);
	}

	fn fire_event(&mut self, vts: &VTNode, event: &VTNode, depth: usize) {
		self.debug_event(vts, event, depth);
		self.total_executed_event_count += 1;

		match event.get_string("targetType").as_str() {
			"System" => self.handle_system_event(vts, event, depth),
			"Event_Sequences" => self.handle_event_sequence_event(vts, event, depth),
			"Unit" => self.handle_unit_event(event),
			_ => panic!("Unhandled event target type: {}", event.get_string("targetType")),
		}

		self.check_exception_flags();
	}

	fn check_exception_flags(&self) {
		let stack_overflow = self.get_gv_by_name("c_stackOverflowFlag");
		let index_oob = self.get_gv_by_name("c_indexOutOfBoundsFlag");

		if stack_overflow.value != 0.0 && index_oob.value != 0.0 {
			panic!("Ya somehow caused both a stack overflow and an index out of bounds error at the same time");
		}

		if stack_overflow.value != 0.0 {
			panic!("Stack overflow");
		}

		if index_oob.value != 0.0 {
			panic!("Index out of bounds");
		}
	}

	// fn parse_event_args(&self, vts: &VTNode, event: &VTNode) -> Vec<EventArg> {
	// 	let param_infos = event.get_all_children_with_name("ParamInfo");
	//
	// 	let values = param_infos.iter().map(|p| match p.get_string("type").as_str() {
	// 		"GlobalValue" => EventArg::GV(p.get_number("value") as usize),
	// 		"System.String" => EventArg::VTValue(VTValue::String(p.get_string("value").to_owned())),
	// 		"System.Single" => EventArg::VTValue(VTValue::Number(p.get_number("value"))),
	// 		"ConditionalActionReference" => {
	// 			let conditional_actions = vts.get_all_children_with_name("ConditionalAction");
	// 			let conditional = conditional_actions.iter().find(|c| c.get_number("id") == p.get_number("value")).unwrap();
	// 			EventArg::VTNode(conditional)
	// 		}
	// 		_ => panic!("Unhandled param type: {}", p.get_string("type")),
	// 	});
	//
	// 	values.collect()
	// }

	fn parse_event_args_as_cond_action<'a>(&self, vts: &'a VTNode, event: &VTNode) -> &'a VTNode {
		let param_infos = event.get_all_children_with_name("ParamInfo");
		let conditional_actions = vts.get_all_children_with_name("ConditionalAction");
		let conditional = conditional_actions
			.iter()
			.find(|c| c.get_number("id") == param_infos[0].get_number("value"))
			.unwrap();

		conditional
	}

	fn parse_event_args_as_gv_number(&mut self, event: &VTNode) -> (&mut GV, f32) {
		let param_infos = event.get_all_children_with_name("ParamInfo");
		let gv = self.get_gv_mut(param_infos[0].get_number("value") as usize);
		let value = param_infos[1].get_number("value");

		(gv, value)
	}

	fn parse_event_args_as_gv_gv(&mut self, event: &VTNode) -> (f32, &mut GV) {
		let param_infos = event.get_all_children_with_name("ParamInfo");
		let gv_a = self.get_gv(param_infos[0].get_number("value") as usize).value;
		let gv_b = self.get_gv_mut(param_infos[1].get_number("value") as usize);

		(gv_a, gv_b)
	}

	fn parse_event_args_as_string(&self, event: &VTNode) -> String {
		let param_infos = event.get_all_children_with_name("ParamInfo");
		param_infos[0].get_string("value").to_owned()
	}

	fn handle_system_event(&mut self, vts: &VTNode, event: &VTNode, depth: usize) {
		let target_id = event.get_number("targetID") as usize;
		let method_name = event.get_string("methodName").as_str();

		match (target_id, method_name) {
			(0, "FireConditionalAction") => {
				let conditional = self.parse_event_args_as_cond_action(vts, event);
				self.handle_conditional_action(vts, conditional, depth + 1);
			}
			(1, "DisplayMessage") => println!("Print: {}", self.parse_event_args_as_string(event)),
			(2, "SetValue") => {
				let (gv, value) = self.parse_event_args_as_gv_number(event);
				gv.value = value;
			}
			(2, "IncrementValue") => {
				let (gv, value) = self.parse_event_args_as_gv_number(event);
				gv.value += value;
			}
			(2, "DecrementValue") => {
				let (gv, value) = self.parse_event_args_as_gv_number(event);
				gv.value -= value;
			}
			(2, "CopyValue") => {
				let (source, destination) = self.parse_event_args_as_gv_gv(event);
				destination.value = source;
			}
			(2, "AddValues") => {
				let (source, destination) = self.parse_event_args_as_gv_gv(event);
				destination.value += source;
			}
			(2, "MultiplyValues") => {
				let (source, destination) = self.parse_event_args_as_gv_gv(event);
				destination.value *= source;
			}

			_ => {
				panic!("Unhandled system event: {} {}", target_id, method_name);
			}
		}
	}

	fn handle_event_sequence_event(&mut self, vts: &VTNode, event: &VTNode, depth: usize) {
		let sequences = vts.get_all_children_with_name("SEQUENCE");
		let sequence = sequences.iter().find(|s| s.get_number("id") == event.get_number("targetID"));

		if let Some(sequence) = sequence {
			match event.get_string("methodName").as_str() {
				"Restart" => self.execute_sequence(vts, sequence, depth),
				_ => panic!("Unhandled sequence event: {}", event.get_string("methodName")),
			}
		} else {
			panic!("Could not find sequence with id: {}", event.get_number("targetID"));
		}
	}

	fn handle_unit_event(&mut self, event: &VTNode) {
		// if self.debug {
		println!("Unit {}.{}()", event.get_number("targetID"), event.get_string("methodName"));
		// }
		self.executed_unit_events.push(ExecutedUnitEvent {
			unit_id: event.get_number("targetID"),
			method: event.get_string("methodName").to_owned(),
		});
	}

	fn handle_conditional_action(&mut self, vts: &VTNode, ca: &VTNode, depth: usize) {
		let bb = ca.get_child("BASE_BLOCK");
		let base_condition = bb.get_child("CONDITIONAL");
		let base_is_true = self.evaluate_condition(base_condition);
		if base_is_true {
			let base_action = bb.get_child("ACTIONS");
			let events = base_action.get_all_children_with_name("EventTarget");
			self.fire_events_sync(vts, events, depth);
		} else {
			let else_if_blocks = ca.get_all_children_with_name("ELSE_IF");
			for else_if_block in else_if_blocks {
				let condition = else_if_block.get_child("CONDITIONAL");
				let is_true = self.evaluate_condition(condition);
				if is_true {
					let actions = else_if_block.get_all_children_with_name("EventTarget");
					self.fire_events_sync(vts, actions, depth);
					return;
				}
			}

			let else_block = bb.maybe_get_child("ELSE_ACTIONS");
			if let Some(else_block) = else_block {
				let actions = else_block.get_all_children_with_name("EventTarget");
				self.fire_events_sync(vts, actions, depth);
			}
		}
	}

	fn sync_wait_for_conditional(&self, vts: &VTNode, conditional: f32) {
		let conditionals = vts.get_child("Conditionals").get_all_children_with_name("CONDITIONAL");
		let condition = conditionals.iter().find(|c| c.get_number("id") == conditional).unwrap();

		let result = self.evaluate_condition(condition);
		if !result {
			panic!("Sync condition {conditional} failed");
		}
	}

	fn evaluate_condition(&self, condition: &VTNode) -> bool {
		let all_comps = condition.get_all_children_with_name("COMP");
		let root = all_comps.iter().position(|c| c.get_number("id") == condition.get_number("root")).unwrap();

		self.evaluate_comp(root, &all_comps)
	}

	fn evaluate_comp(&self, comp_idx: usize, all_comps: &Vec<&VTNode>) -> bool {
		let comp = all_comps[comp_idx];
		match comp.get_string("type").as_str() {
			"SCCGlobalValue" => {
				let gv = self.get_gv(comp.get_number("gv") as usize);
				match comp.get_string("comparison").as_str() {
					"Equals" => gv.value == comp.get_number("c_value"),
					"Less_Than" => gv.value < comp.get_number("c_value"),
					"Greater_Than" => gv.value > comp.get_number("c_value"),
					_ => panic!("Unhandled comparison type: {}", comp.get_string("comparison")),
				}
			}
			"SCCGlobalValueCompare" => {
				let gv_a = self.get_gv(comp.get_number("gvA") as usize);
				let gv_b = self.get_gv(comp.get_number("gvB") as usize);
				match comp.get_string("comparison").as_str() {
					"Equals" => gv_a.value == gv_b.value,
					"NotEquals" => gv_a.value != gv_b.value,
					"Greater" => gv_a.value > gv_b.value,
					"Greater_Or_Equal" => gv_a.value >= gv_b.value,
					"Less" => gv_a.value < gv_b.value,
					"Less_Or_Equal" => gv_a.value <= gv_b.value,
					_ => panic!("Unhandled comparison type: {}", comp.get_string("comparison")),
				}
			}
			"SCCOr" => {
				let mut or_children = comp.get_list("factors").iter().map(|f| match f {
					VTValue::Number(n) => all_comps.iter().position(|c| c.get_number("id") == *n).unwrap(),
					_ => panic!("Expected number in list, got: {:?}", f),
				});

				or_children.any(|c| self.evaluate_comp(c, all_comps))
			}
			"SCCAnd" => {
				let mut and_children = comp.get_list("factors").iter().map(|f| match f {
					VTValue::Number(n) => all_comps.iter().position(|c| c.get_number("id") == *n).unwrap(),
					_ => panic!("Expected number in list, got: {:?}", f),
				});

				and_children.all(|c| self.evaluate_comp(c, all_comps))
			}
			_ => panic!("Unhandled conditional type: {}", comp.get_string("type")),
		}
	}

	fn load_gvs(&mut self, vts: &VTNode) {
		let gvs = vts.get_all_children_with_name("gv");

		for gv in gvs {
			let data = gv.get_list("data");

			let id = data[0].as_number();
			let name = data[1].as_string();
			let default_value = data[3].as_number();

			self.gvs.push(GV::new(name, id as usize, default_value));
		}
	}

	pub fn execute(&mut self, vts: VTNode) {
		self.load_gvs(&vts);

		let start_immediately_sequences: Vec<&VTNode> = vts
			.get_all_children_with_name("SEQUENCE")
			.into_iter()
			.filter(|s| s.get_bool("startImmediately"))
			.collect();

		for s in start_immediately_sequences {
			self.execute_sequence(&vts, s, 0);
		}
	}

	fn get_gv(&self, id: usize) -> &GV {
		self.gvs.iter().find(|g| g.id == id).unwrap()
	}

	fn get_gv_mut(&mut self, id: usize) -> &mut GV {
		self.gvs.iter_mut().find(|g| g.id == id).unwrap()
	}

	fn get_gv_by_name(&self, name: &str) -> &GV {
		self.gvs.iter().find(|g| g.name == name).unwrap()
	}

	fn log(&mut self, msg: String) {
		if !self.debug {
			return;
		}

		if let Some(ref mut log_writer) = self.log_writer {
			log_writer(msg.clone());
		}

		self.exec_log.push(msg);
	}
}
