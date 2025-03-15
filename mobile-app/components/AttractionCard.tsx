import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Button, Chip } from "react-native-paper";

export default function AttractionCard({
  title,
  image,
  description,
  inRoute,
  onClick,
  category,
  city,
  rating,
  price,
}: any) {
  return (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: image }} style={styles.cover} />
      <Card.Title title={title} />
      <Card.Content>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.labelsRow}>
          <Chip icon="folder" style={styles.chip}>
            {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
          </Chip>

          <Chip icon="map-marker" style={styles.chip}>
            {city}
          </Chip>
          <Chip icon="star" style={styles.chip}>
            {rating}
          </Chip>
        </View>
        {price > 0 && (
          <View style={styles.labelsRow}>
            <Chip style={styles.chip}>{price + " €"}</Chip>
          </View>
        )}
      </Card.Content>
      <Card.Actions>
        <Button onPress={onClick}>
          {inRoute ? "Remove from Route" : "Add to Route"}
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  cover: {
    height: 200,
  },
  description: {
    // marginVertical: 8,
  },
  labelsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
  },
});
