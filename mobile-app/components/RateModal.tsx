import { useStore } from "@/app/store/AttractionStore";
import { baseApiUrl } from "@/constants/Api";
import { addIdToList } from "@/utils/AttractionRating";
import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import Modal from "react-native-modal";
import { Rating } from "react-native-ratings";

export default function RateModal({
  attractionId,
  isModalVisible,
  setModalVisible,
  setDisabled,
}: {
  attractionId: number;
  isModalVisible: boolean | undefined;
  setModalVisible: (value: boolean | undefined) => void;
  setDisabled: (value: boolean) => void;
}) {
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const [rating, setRating] = useState(0);

  const rateAttraction = async () => {
    try {
      const response = await fetch(`${baseApiUrl}/attraction/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ attractionId, rating }),
      });
      console.log("response", response);
      if (response.ok) {
        await addIdToList(attractionId);
        setDisabled(true);
        Alert.alert("Success", "Attraction rated successfully!");
      } else {
        const errData = await response.json();
        Alert.alert(
          "Rate Error",
          errData.message || "Failed to rate attraction."
        );
      }
    } catch (error) {
      console.error("Attraction rate error:", error);
      Alert.alert("Error", "An error occurred while rating attraction.");
    } finally {
      toggleModal();
    }
  };

  return (
    <View style={styles.container}>
      {/* <Button title="Rate Attraction" onPress={toggleModal} /> */}

      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={styles.modalContent}>
          <Rating
            type="star"
            ratingCount={5}
            imageSize={55}
            startingValue={0}
            onFinishRating={(val: number) => setRating(val)}
          />
          <Button title="Rate attraction" onPress={rateAttraction} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: {
    gap: 15,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
});
