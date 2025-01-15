import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

const Map = () => {
  const [attractions, setAttractions] = useState([
    { id: 1, name: "Arena", latitude: 44.8731, longitude: 13.8494 },
    {
      id: 2,
      name: "Temple of Augustus",
      latitude: 44.8702,
      longitude: 13.8417,
    },
  ]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 44.8666,
          longitude: 13.8493,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {attractions.map((attraction) => (
          <Marker
            key={attraction.id}
            coordinate={{
              latitude: attraction.latitude,
              longitude: attraction.longitude,
            }}
            title={attraction.name}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default Map;
