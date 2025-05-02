
import React from "react";
import ReviewForm from "../ReviewForm";
import { CraftsmanReviewWithCraftsman } from "./types";

interface EditReviewSectionProps {
  editingReview: CraftsmanReviewWithCraftsman;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditReviewSection: React.FC<EditReviewSectionProps> = ({
  editingReview,
  userId,
  onSuccess,
  onCancel
}) => {
  return (
    <div className="mb-6">
      <h4 className="text-md font-semibold mb-2">Upraviť hodnotenie pre: {editingReview.craftsman?.name}</h4>
      <ReviewForm
        userId={userId || ""}
        profileId={editingReview.craftsman_id}
        userName={editingReview.customer_name}
        onSuccess={onSuccess}
        existingReview={{
          id: editingReview.id,
          rating: editingReview.rating,
          comment: editingReview.comment
        }}
        onCancel={onCancel}
      />
    </div>
  );
};

export default EditReviewSection;
