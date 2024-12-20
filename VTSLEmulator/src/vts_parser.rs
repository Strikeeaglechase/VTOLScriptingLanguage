use indexmap::IndexMap;
use regex::Regex;
use std::{
	collections::HashMap,
	sync::{
		atomic::{AtomicUsize, Ordering},
		LazyLock,
	},
};

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

static VTS_NODE_ID: AtomicUsize = AtomicUsize::new(0);

#[derive(Debug, Clone)]
pub struct VTNode {
	pub name: String,
	pub values: IndexMap<String, VTValue>,
	pub children: Vec<VTNode>,

	pub id: usize,
	child_map: HashMap<usize, Vec<usize>>,
}

impl VTNode {
	pub fn new(name: &str) -> VTNode {
		VTNode {
			name: name.to_string(),
			values: IndexMap::new(),
			children: Vec::new(),

			id: VTS_NODE_ID.fetch_add(1, Ordering::SeqCst),
			child_map: HashMap::new(),
		}
	}

	pub fn get_value(&self, key: &str) -> &VTValue {
		self.values.get(key).expect(format!("Key {} not present in node {}", key, self.name).as_str())
	}

	pub fn get_string(&self, key: &str) -> &String {
		match self.get_value(key) {
			VTValue::String(s) => s,
			_ => panic!("Value for key {} is not a string", key),
		}
	}

	pub fn get_number(&self, key: &str) -> f32 {
		match self.get_value(key) {
			VTValue::Number(n) => *n,
			_ => panic!("Value for key {} is not a number", key),
		}
	}

	pub fn get_bool(&self, key: &str) -> bool {
		match self.get_value(key) {
			VTValue::Bool(b) => *b,
			_ => panic!("Value for key {} is not a bool", key),
		}
	}

	pub fn get_vector3(&self, key: &str) -> Vector3 {
		match self.get_value(key) {
			VTValue::Vector3(v) => *v,
			_ => panic!("Value for key {} is not a Vector3", key),
		}
	}

	pub fn get_list(&self, key: &str) -> &Vec<VTValue> {
		match self.get_value(key) {
			VTValue::List(l) => l,
			_ => panic!("Value for key {} is not a list", key),
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

	fn get_child_path(&self, child_id: usize) -> Option<Vec<usize>> {
		for (idx, child) in self.children.iter().enumerate() {
			if child.id == child_id {
				return Some(vec![idx]);
			}

			if let Some(mut path) = child.get_child_path(child_id) {
				path.insert(0, idx);
				return Some(path);
			}
		}

		None
	}

	fn resolve_child_path(&self, path: &[usize]) -> &VTNode {
		let mut cur = self;
		for &child_idx in path.iter() {
			cur = &cur.children[child_idx];
		}

		cur
	}

	pub fn init_child_maps(&mut self) {
		self.child_map.clear();

		let child_ids = self.get_all_children().into_iter().map(|c| c.id).collect::<Vec<usize>>();
		child_ids.into_iter().for_each(|child_id| {
			let path = self
				.get_child_path(child_id)
				.expect(format!("Child with id {} not present in node {}", child_id, self.name).as_str());

			self.child_map.insert(child_id, path);
		});

		self.children.iter_mut().for_each(|c| c.init_child_maps());
	}

	pub fn get_child_by_id(&self, id: usize) -> &VTNode {
		if let Some(child) = self.child_map.get(&id) {
			return self.resolve_child_path(child);
		}

		panic!("Child with id {} not present in node {}", id, self.name);
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
		return VTValue::List(value.split(";").map(|v| parse_vt_value(v)).collect());
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
		node.children.push(child);
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
