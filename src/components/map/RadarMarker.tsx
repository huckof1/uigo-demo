import { StyleSheet, Text, View } from "react-native";
import {
  availabilityColors,
  getMarkerLabel,
  getMarkerTimeLabel,
} from "@/lib/mock/properties";
import type { MockProperty } from "@/lib/types/property";

type RadarMarkerProps = {
  isSelected?: boolean;
  property: MockProperty;
};

export function RadarMarker({ isSelected = false, property }: RadarMarkerProps) {
  const colors = availabilityColors[property.availabilityStatus];

  return (
    <View style={styles.wrap}>
      <View
        pointerEvents="none"
        style={[
          styles.ring,
          { borderColor: colors.background },
          property.availabilityStatus === "available_now" && styles.activeRing,
          property.availabilityStatus === "available_soon" && styles.soonRing,
          property.availabilityStatus === "available_later" && styles.laterRing,
          property.availabilityStatus === "unknown_time" && styles.staticRing,
          property.availabilityStatus === "occupied" && styles.staticRing,
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          { backgroundColor: colors.glow },
          property.availabilityStatus === "available_now" && styles.activeGlow,
          property.availabilityStatus === "available_soon" && styles.soonGlow,
          property.availabilityStatus === "available_later" && styles.laterGlow,
          property.availabilityStatus === "unknown_time" && styles.staticGlow,
          property.availabilityStatus === "occupied" && styles.staticGlow,
          isSelected && styles.selectedGlow,
        ]}
      />

      <View
        pointerEvents="none"
        style={[styles.yurt, isSelected && styles.selectedYurt]}
      >
        <View style={styles.baseShadow} />
        <View style={styles.roof}>
          <View style={styles.roofCap} />
          <View style={styles.roofHighlight} />
          <View style={styles.shanyrak} />
          <View style={[styles.roofRib, styles.roofRibFarLeft]} />
          <View style={[styles.roofRib, styles.roofRibLeft]} />
          <View style={[styles.roofRib, styles.roofRibRight]} />
          <View style={[styles.roofRib, styles.roofRibFarRight]} />
          <View style={styles.roofBellyLine} />
        </View>
        <View style={styles.wall}>
          <View style={[styles.topOrnamentBand, { backgroundColor: colors.background }]} />
          <View style={styles.wallLattice}>
            <View style={[styles.latticeLine, styles.latticeLineLeftOne]} />
            <View style={[styles.latticeLine, styles.latticeLineLeftTwo]} />
            <View style={[styles.latticeLine, styles.latticeLineRightOne]} />
            <View style={[styles.latticeLine, styles.latticeLineRightTwo]} />
          </View>
          <View style={styles.doorAwning} />
          <View style={styles.doorFrame}>
            <View style={styles.doorPanel} />
            <View style={styles.doorDivider} />
            <View style={styles.doorPanel} />
            <View style={styles.doorKnob} />
          </View>
          <View style={[styles.bottomBand, { backgroundColor: colors.background }]} />
        </View>
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.priceLabel,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
          isSelected && styles.selectedLabel,
        ]}
      >
        <Text style={[styles.priceText, { color: colors.text }]}>
          {getMarkerLabel(property)}
        </Text>
      </View>
      <View pointerEvents="none" style={styles.timeLabel}>
        <Text style={styles.timeText}>{getMarkerTimeLabel(property)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    height: 88,
    justifyContent: "flex-start",
    width: 78,
  },
  ring: {
    position: "absolute",
    top: 2,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    opacity: 0.58,
  },
  activeRing: {
    opacity: 0.72,
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  soonRing: {
    opacity: 0.68,
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  laterRing: {
    opacity: 0.36,
  },
  staticRing: {
    opacity: 0,
  },
  glow: {
    position: "absolute",
    top: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activeGlow: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  soonGlow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.92,
  },
  laterGlow: {
    opacity: 0.58,
  },
  staticGlow: {
    opacity: 0.26,
  },
  selectedGlow: {
    opacity: 0.92,
  },
  yurt: {
    top: 11,
    width: 48,
    height: 34,
    alignItems: "center",
  },
  selectedYurt: {
    shadowColor: "#171512",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  baseShadow: {
    position: "absolute",
    bottom: -2,
    width: 42,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(55, 39, 25, 0.18)",
  },
  roof: {
    width: 48,
    height: 22,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "#F4E5C8",
    borderColor: "#5D3B20",
    borderWidth: 1.5,
    overflow: "hidden",
  },
  roofCap: {
    position: "absolute",
    top: -1,
    alignSelf: "center",
    width: 14,
    height: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "#7C4E28",
  },
  roofHighlight: {
    position: "absolute",
    top: 5,
    left: 7,
    width: 17,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.38)",
    transform: [{ rotate: "-11deg" }],
  },
  shanyrak: {
    position: "absolute",
    top: 1,
    alignSelf: "center",
    width: 12,
    height: 5,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    borderColor: "rgba(67, 42, 24, 0.72)",
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  roofRib: {
    position: "absolute",
    top: 1,
    width: 1.6,
    height: 26,
    borderRadius: 2,
    backgroundColor: "rgba(122, 76, 37, 0.68)",
  },
  roofRibFarLeft: {
    left: 9,
    transform: [{ rotate: "35deg" }],
  },
  roofRibLeft: {
    left: 19,
    transform: [{ rotate: "14deg" }],
  },
  roofRibRight: {
    right: 19,
    transform: [{ rotate: "-14deg" }],
  },
  roofRibFarRight: {
    right: 9,
    transform: [{ rotate: "-35deg" }],
  },
  roofBellyLine: {
    position: "absolute",
    left: 1,
    right: 1,
    bottom: 2,
    height: 1.2,
    borderRadius: 999,
    backgroundColor: "rgba(122, 76, 37, 0.45)",
  },
  wall: {
    width: 47,
    height: 16,
    marginTop: -3,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: "#F9EFD9",
    borderColor: "#5D3B20",
    borderWidth: 1.5,
    overflow: "hidden",
  },
  topOrnamentBand: {
    position: "absolute",
    top: 1,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.9,
  },
  wallLattice: {
    position: "absolute",
    top: 4,
    left: 3,
    right: 3,
    bottom: 2,
    overflow: "hidden",
  },
  latticeLine: {
    position: "absolute",
    width: 1.2,
    height: 17,
    borderRadius: 1,
    backgroundColor: "rgba(92, 62, 35, 0.22)",
  },
  latticeLineLeftOne: {
    left: 6,
    top: -3,
    transform: [{ rotate: "-23deg" }],
  },
  latticeLineLeftTwo: {
    left: 15,
    top: -3,
    transform: [{ rotate: "-23deg" }],
  },
  latticeLineRightOne: {
    right: 6,
    top: -3,
    transform: [{ rotate: "23deg" }],
  },
  latticeLineRightTwo: {
    right: 15,
    top: -3,
    transform: [{ rotate: "23deg" }],
  },
  doorAwning: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    width: 17,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#B0773E",
  },
  doorFrame: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    width: 14,
    height: 11,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: "#8A572F",
    flexDirection: "row",
    justifyContent: "center",
    overflow: "hidden",
  },
  doorPanel: {
    width: 6.5,
    height: 11,
    backgroundColor: "#A87542",
  },
  doorDivider: {
    width: 1,
    height: 11,
    backgroundColor: "rgba(70, 43, 24, 0.72)",
  },
  doorKnob: {
    position: "absolute",
    right: 2,
    top: 5,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#F2D38B",
  },
  bottomBand: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 1,
    height: 2,
    opacity: 0.86,
  },
  priceLabel: {
    position: "absolute",
    top: 49,
    borderRadius: 999,
    borderWidth: 1.5,
    minHeight: 24,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  selectedLabel: {
    borderWidth: 2,
  },
  priceText: {
    fontSize: 11,
    fontWeight: "900",
    includeFontPadding: false,
    letterSpacing: 0,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.14)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 1,
  },
  timeLabel: {
    position: "absolute",
    top: 75,
    minHeight: 18,
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: "rgba(72, 61, 50, 0.18)",
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  timeText: {
    color: "#211C17",
    fontSize: 9,
    fontWeight: "900",
    includeFontPadding: false,
    letterSpacing: 0,
  },
});
