import { StyleSheet, Text, View } from "react-native";
import {
  availabilityColors,
  availabilityLabels,
} from "@/lib/mock/properties";
import type { PropertyAvailabilityStatus } from "@/lib/types/property";

const statuses: PropertyAvailabilityStatus[] = [
  "available_now",
  "available_soon",
  "available_later",
  "unknown_time",
  "occupied",
];

export function RadarLegend() {
  return (
    <View style={styles.wrap}>
      {statuses.map((status) => (
        <View key={status} style={styles.item}>
          <View
            style={[
              styles.dot,
              { backgroundColor: availabilityColors[status].background },
            ]}
          />
          <Text style={styles.text}>{availabilityLabels[status]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 7,
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  dot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  text: {
    color: "#211D18",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
