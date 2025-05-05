
import React from "react";
import ReviewForm from "../ReviewForm";
import { CraftsmanReviewWithCraftsman } from "./types";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  
  return (
    <div className="mb-6">
      <h4 className="text-md font-semibold mb-2">
        {t("edit_review_for")}: {editingReview.craftsman?.name}
      </h4>
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
