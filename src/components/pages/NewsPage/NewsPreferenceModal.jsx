import React, { useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import { Modal, message } from "antd";
import { Button } from "antd/es/radio";
const UPSERT_USER_PREFERENCES = gql`
  mutation UpsertUserPreferences(
    $userId: uuid!
    $categories: [String!]
    $keywords: [String!]
  ) {
    insert_user_preferences(
      objects: {
        user_id: $userId
        preferred_categories: $categories
        preferred_keywords: $keywords
      }
      on_conflict: {
        constraint: user_preferences_user_id_key
        update_columns: [preferred_categories, preferred_keywords]
      }
    ) {
      returning {
        user_id
      }
    }
  }
`;

const NewsPreferenceModal = ({
  showModal,
  userId,
  setShowModal,
  refetchPreferences,
  initialPreferences,
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [keywords, setKeywords] = useState("");

  const CATEGORIES = [
    "business",
    "sports",
    "technology",
    "entertainment",
    "health",
  ];

  const [insertPreferences] = useMutation(UPSERT_USER_PREFERENCES);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async () => {
    const cleanedKeywords = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k !== "");

    console.log("Submitting: ", selectedCategories, cleanedKeywords);

    try {
      await insertPreferences({
        variables: {
          userId,
          categories: selectedCategories,
          keywords: cleanedKeywords,
        },
      });
      message.success("Preferences saved");
      refetchPreferences();
      setShowModal(false);
    } catch (err) {
      console.error("Error updating preferences", err);
      message.error("Failed to save preferences");
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };
  useEffect(() => {
    if (showModal && initialPreferences) {
      setSelectedCategories(initialPreferences.preferred_categories || []);
      setKeywords((initialPreferences.preferred_keywords || []).join(", "));
    }
  }, [showModal, initialPreferences]);

  return (
    <Modal open={showModal} onCancel={handleCancel} footer={null}>
      <div className="modal-overlay">
        <div className="modal">
          <h2>Select Your News Preferences</h2>

          <div>
            <h3>Categories</h3>
            {CATEGORIES.map((category) => (
              <label key={category}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                {category}
              </label>
            ))}
          </div>

          <div>
            <h3>Keywords (comma separated)</h3>
            <input
              type="text"
              placeholder="Enter keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit}>Save Preferences</Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewsPreferenceModal;
