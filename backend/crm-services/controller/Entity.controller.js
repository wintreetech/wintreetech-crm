import EntityModel from "../models/Entity.model.js";

/* -----------------------------
   Get All Entities
----------------------------- */
export const getEntities = async (req, res) => {
	try {
		const doc = await EntityModel.findOne();
		return res.status(200).json({
			success: true,
			data: doc?.entities || [],
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Failed to fetch entities",
			error: err.message,
		});
	}
};

/* -----------------------------
   Add Entities (multiple)
----------------------------- */
export const addEntities = async (req, res) => {
	try {
		const { entities } = req.body;

		if (!Array.isArray(entities) || entities.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Entities must be a non-empty array",
			});
		}

		const cleaned = entities.map((e) => e.trim());

		let doc = await EntityModel.findOne();

		if (!doc) {
			doc = await EntityModel.create({ entities: cleaned });
		} else {
			doc.entities = [...new Set([...doc.entities, ...cleaned])];
			await doc.save();
		}

		return res.status(201).json({
			success: true,
			message: "Entities added successfully",
			data: doc.entities,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Failed to add entities",
			error: err.message,
		});
	}
};

/* -----------------------------
   Delete One Entity
----------------------------- */
export const deleteEntity = async (req, res) => {
	try {
		const { name } = req.params;

		const doc = await EntityModel.findOne();
		if (!doc) {
			return res.status(404).json({
				success: false,
				message: "Entity document not found",
			});
		}

		doc.entities = doc.entities.filter((e) => e !== name);
		await doc.save();

		return res.status(200).json({
			success: true,
			message: "Entity deleted successfully",
			data: doc.entities,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Failed to delete entity",
			error: err.message,
		});
	}
};
