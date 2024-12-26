use indexmap::IndexMap;
use regex::Regex;
use std::{fmt::Display, sync::LazyLock};

use crate::line_scanner::LineScanner;

#[derive(Debug, Clone, Copy)]
pub struct Vector3 {
	pub x: f32,
	pub y: f32,
	pub z: f32,
}

#[derive(Debug, Clone)]
pub enum VTValue {
	Null,
	String(String),
	Number(f32),
	Bool(bool),
	Vector3(Vector3),
	List(Vec<VTValue>),
}

impl VTValue {
	pub fn as_number(&self) -> f32 {
		match self {
			VTValue::Number(n) => *n,
			_ => panic!("Value is not a number"),
		}
	}

	pub fn as_bool(&self) -> bool {
		match self {
			VTValue::Bool(b) => *b,
			_ => panic!("Value is not a bool"),
		}
	}

	pub fn as_vector3(&self) -> Vector3 {
		match self {
			VTValue::Vector3(v) => *v,
			_ => panic!("Value is not a Vector3"),
		}
	}

	pub fn as_list(&self) -> &Vec<VTValue> {
		match self {
			VTValue::List(l) => l,
			_ => panic!("Value is not a list"),
		}
	}

	pub fn as_string(&self) -> &String {
		match self {
			VTValue::String(s) => s,
			_ => panic!("Value is not a string"),
		}
	}
}

impl Display for VTValue {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		match self {
			VTValue::Null => write!(f, "null"),
			VTValue::String(s) => write!(f, "{}", s),
			VTValue::Number(n) => write!(f, "{}", n),
			VTValue::Bool(b) => write!(f, "{}", b),
			VTValue::Vector3(v) => write!(f, "({}, {}, {})", v.x, v.y, v.z),
			VTValue::List(l) => {
				let mut result = "".to_string();
				for item in l {
					result.push_str(&format!("{}, ", item));
				}

				write!(f, "[{}]", result)
			}
		}
	}
}

// static VTS_NODE_ID: AtomicUsize = AtomicUsize::new(0);
static EMPTY_STRING: String = String::new();

#[derive(Debug)]
pub struct VTNode {
	pub name: String,
	// empty_string: String,
	pub values: IndexMap<String, VTValue>,
	pub children: Vec<VTNode>,
}

impl VTNode {
	pub fn new(name: &str) -> VTNode {
		VTNode {
			name: name.to_string(),
			values: IndexMap::new(),
			children: Vec::new(),
			// empty_string: "".to_string(),
			//id: VTS_NODE_ID.fetch_add(1, Ordering::SeqCst),
			//child_map: HashMap::new(),
		}
	}

	pub fn get_value(&self, key: &str) -> &VTValue {
		self.values.get(key).expect(format!("Key {} not present in node {}", key, self.name).as_str())
	}

	pub fn has_value(&self, key: &str) -> bool {
		self.values.contains_key(key)
	}

	pub fn get_string(&self, key: &str) -> &String {
		match self.get_value(key) {
			VTValue::String(s) => s,
			VTValue::Null => &EMPTY_STRING,
			_ => panic!("Value for key \"{}\" is not a string, value: {:?}", key, self.get_value(key)),
		}
	}

	pub fn get_number(&self, key: &str) -> f32 {
		match self.get_value(key) {
			VTValue::Number(n) => *n,
			_ => panic!("Value for key \"{}\" is not a number, value: {:?}", key, self.get_value(key)),
		}
	}

	pub fn get_bool(&self, key: &str) -> bool {
		match self.get_value(key) {
			VTValue::Bool(b) => *b,
			_ => panic!("Value for key \"{}\" is not a bool, value: {:?}", key, self.get_value(key)),
		}
	}

	pub fn get_vector3(&self, key: &str) -> Vector3 {
		match self.get_value(key) {
			VTValue::Vector3(v) => *v,
			_ => panic!("Value for key \"{}\" is not a Vector3, value: {:?}", key, self.get_value(key)),
		}
	}

	pub fn get_list(&self, key: &str) -> &Vec<VTValue> {
		match self.get_value(key) {
			VTValue::List(l) => l,
			_ => panic!("Value for key \"{}\" is not a list, value: {:?}", key, self.get_value(key)),
		}
	}

	pub fn set_value_overwrite(&mut self, key: &str, value: VTValue) {
		self.set_value(key, value);
	}

	pub fn set_value(&mut self, key: &str, value: VTValue) {
		if self.values.contains_key(key) {
			panic!("Key {} already present in node {}", key, self.name);
		}

		self.values.insert(key.to_string(), value);
	}

	pub fn add_child(&mut self, child: VTNode) {
		self.children.push(child);
	}

	pub fn maybe_get_child(&self, name: &str) -> Option<&VTNode> {
		self.children.iter().find(|c| c.name == name)
	}

	pub fn get_child(&self, name: &str) -> &VTNode {
		self
			.children
			.iter()
			.find(|c| c.name == name)
			.expect(format!("Child {} not present in node {}", name, self.name).as_str())
	}

	pub fn get_children(&self, name: &str) -> Vec<&VTNode> {
		self.children.iter().filter(|c| c.name == name).collect()
	}

	pub fn get_all_children(&self) -> Vec<&VTNode> {
		let mut result = Vec::new();
		for child in self.children.iter() {
			result.push(child);
			result.append(&mut child.get_all_children());
		}

		result
	}

	pub fn get_all_children_with_name(&self, name: &str) -> Vec<&VTNode> {
		let mut result = Vec::new();
		for child in self.children.iter() {
			if child.name == name {
				result.push(child);
			}

			result.append(&mut child.get_all_children_with_name(name));
		}

		result
	}
}

static VEC_REGEX: LazyLock<Regex> = std::sync::LazyLock::new(|| Regex::new(r"^\([-\d.E]+, [-\d.E]+, [-\d.E]+\)$").unwrap());

fn parse_vt_value(value: &str) -> VTValue {
	if value.len() == 0 {
		return VTValue::String("".to_string());
	}

	if value == "null" {
		return VTValue::Null;
	}

	if value == "True" {
		return VTValue::Bool(true);
	}

	if value == "False" {
		return VTValue::Bool(false);
	}

	if let Ok(value) = value.parse::<f32>() {
		return VTValue::Number(value);
	}

	if VEC_REGEX.is_match(value) {
		let parts: Vec<f32> = value[1..value.len() - 1].split(", ").map(|p| p.parse::<f32>().unwrap()).collect();
		return VTValue::Vector3(Vector3 { x: parts[0], y: parts[1], z: parts[2] });
	}

	if value.contains(";") {
		return VTValue::List(value.split_terminator(";").map(|v| parse_vt_value(v)).collect());
	}

	VTValue::String(value.to_string())
}

fn process_value_line(line: &str) -> (String, VTValue) {
	let eq_idx = line.find("=").unwrap();
	let key = line[..eq_idx].trim().to_string();
	let value = line[eq_idx + 1..].trim();

	(key, parse_vt_value(value))
}

fn read_node(scanner: &mut LineScanner) -> VTNode {
	let mut node = VTNode::new(scanner.read_line());

	scanner.read_line();

	while !scanner.eof() && scanner.peak_line().contains("=") {
		let (key, value) = process_value_line(scanner.read_line());
		node.values.insert(key, value);
	}

	while !scanner.eof() && !scanner.peak_line().contains("}") {
		let child = read_node(scanner);
		node.add_child(child);
	}

	scanner.read_line();

	return node;
}

pub fn read_vts_file(file_content: &str) -> VTNode {
	let mut scanner = LineScanner::new(file_content);

	read_node(&mut scanner)
}

fn stringify_vt_value(value: &VTValue) -> String {
	match value {
		VTValue::Null => "null".to_string(),
		VTValue::String(s) => s.clone(),
		VTValue::Number(n) => n.to_string(),
		VTValue::Bool(b) => b.to_string(),
		VTValue::Vector3(v) => format!("({}, {}, {})", v.x, v.y, v.z),
		VTValue::List(l) => {
			let mut result = "".to_string();
			for item in l {
				result.push_str(&stringify_vt_value(item));
				result.push_str(";");
			}

			result
		}
	}
}

fn stringify_vts(node: &VTNode) -> Vec<String> {
	let mut lines: Vec<String> = vec![node.name.clone(), "{".to_string()];

	for (key, value) in node.values.iter() {
		lines.push(format!("\t{} = {}", key, stringify_vt_value(value)));
	}

	for child in node.children.iter() {
		let mut child_content = stringify_vts(child);
		child_content.iter_mut().for_each(|l| l.insert_str(0, "\t"));
		lines.append(&mut child_content);
	}

	lines.push("}".to_string());

	lines
}

pub fn write_vts_file(node: &VTNode) -> String {
	let lines = stringify_vts(node);
	lines.join("\n")
}
