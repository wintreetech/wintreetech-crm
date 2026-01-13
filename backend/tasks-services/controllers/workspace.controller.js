import Workspace from "../models/workspace.model.js";
import { deleteS3WorkspaceFolder } from "../utils/s3Cleanup.js";

/**
 * Create a new Workspace
 */
export const createWorkspace = async (req, res) => {
  try {
    const newWorkspace = new Workspace(req.body);
    const saved = await newWorkspace.save();

    // Convert to object and inject 'id' for frontend consistency
    const result = saved.toObject();
    result.id = result._id;

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get all workspaces with ID normalization
 */
export const getAllWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({}).sort({ createdAt: -1 }).lean();

    const mappedWorkspaces = workspaces.map((ws) => ({
      ...ws,
      id: ws._id, // Ensure frontend 'id' field is present
    }));

    res.status(200).json(mappedWorkspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete Workspace by slug
 */

export const deleteWorkspace = async (req, res) => {
  try {
    const { slug } = req.params;
    const { workspaceId } = req.body; // Getting _id from the body for precision

    if (!workspaceId) {
      return res
        .status(400)
        .json({ message: "Workspace ID (_id) is required for deletion" });
    }

    // Precision query using both identifiers
    const deletedWorkspace = await Workspace.findOneAndDelete({
      _id: workspaceId,
      slug: slug,
    });

    if (!deletedWorkspace) {
      return res.status(404).json({
        message: "Workspace not found or ID/Slug mismatch",
      });
    }

    // S3 CLEANUP: Delete the entire folder associated with this slug
    try {
      await deleteS3WorkspaceFolder(slug);
      console.log(`S3 cleanup successful for workspace slug: ${slug}`);
    } catch (s3Error) {
      console.error("S3 Workspace Folder Cleanup Failed:", s3Error);
    }

    res.status(200).json({
      message: "Workspace deleted successfully",
      id: deletedWorkspace._id,
      slug: deletedWorkspace.slug,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add/Update Members in Workspace
 * Implements strict de-duplication to ensure no member is added twice.
 */
export const addWorkspaceMember = async (req, res) => {
  try {
    const { slug } = req.params;
    const { members } = req.body;

    if (!Array.isArray(members)) {
      return res.status(400).json({ message: "Members must be an array" });
    }

    // STEP 1: Strict De-duplication using Map
    const uniqueMembers = Array.from(
      new Map(
        members.map((m) => {
          const memberId = String(m.id || m._id);
          return [memberId, { ...m, id: memberId }];
        })
      ).values()
    );

    // STEP 2: Use $set to overwrite with the unique list
    const updatedWorkspace = await Workspace.findOneAndUpdate(
      { slug },
      { $set: { members: uniqueMembers } },
      { new: true }
    ).lean();

    if (!updatedWorkspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Normalize result ID
    updatedWorkspace.id = updatedWorkspace._id;

    res.status(200).json(updatedWorkspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single Workspace details by slug
 */
export const getWorkspaceBySlug = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ slug: req.params.slug }).lean();

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    workspace.id = workspace._id;

    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
