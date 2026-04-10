import { X } from "lucide-react";
import DevelopmentSectionCard from "./DevelopmentSectionCard.jsx";
import { developmentSections } from "./sections.js";

function DevelopmentSectionsModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  return (
    <dialog open={isOpen} className="modal modal-bottom sm:modal-middle">
      <div
        className="
          modal-box
          w-screen h-screen max-w-none
          sm:w-11/12 sm:max-w-3xl sm:h-auto sm:max-h-none
          overflow-y-auto rounded-lg
        "
      >
        <h1 className="text-2xl font-bold mb-2">
          Development Sections for {record.companyName}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Upload, review, and manage files for each development-related section.
        </p>

        <div className="space-y-3">
          {developmentSections.map((section) => (
            <DevelopmentSectionCard
              key={section.title}
              {...section}
              record={record}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X />
        </button>
      </div>
    </dialog>
  );
}

export default DevelopmentSectionsModal;
