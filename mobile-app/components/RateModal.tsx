import { useStore } from "@/app/store/AttractionStore";
import { baseApiUrl } from "@/constants/Api";
import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import Modal from "react-native-modal";
import { Rating } from "react-native-ratings";

export default function RateModal({
  attractionId,
  isModalVisible,
  setModalVisible,
}: {
  attractionId: number;
  isModalVisible: boolean;
  setModalVisible: (value: boolean | undefined) => void;
}) {
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const [rating, setRating] = useState(0);

  const rateAttraction = async () => {
    try {
      const response = await fetch(
        `${baseApiUrl}/attraction/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ attractionId, rating }),
        }
      );
      console.log("response", response);
      if (response.ok) {
        const createdComment = await response.json();
        setRating(0);
      } else {
        const errData = await response.json();
        Alert.alert(
          "Comment Error",
          errData.message || "Failed to post comment."
        );
      }
    } catch (error) {
      console.error("Comment post error:", error);
      Alert.alert("Error", "An error occurred while posting comment.");
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Rate Attraction" onPress={toggleModal} />

      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={styles.modalContent}>
          <Rating
            type="star"
            ratingCount={5}
            imageSize={30}
            startingValue={0}
            style={{ paddingVertical: 10, alignSelf: "flex-start" }}
            onFinishRating={(val: number) => setRating(val)}
          />
          <Button title="Rate" onPress={toggleModal} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
});
