import { StyleSheet, Text, View } from "react-native";
import { formatTenge } from "@/lib/mock/properties";
import type { MockProperty } from "@/lib/types/property";

type RadarClusterProps = {
  district: string;
  isActive?: boolean;
  properties: MockProperty[];
};

export function RadarCluster({
  district,
  isActive = false,
  properties,
}: RadarClusterProps) {
  const availableCount = properties.filter(
    (property) => property.availabilityStatus === "available_now",
  ).length;
  const minPrice = Math.min(...properties.map((property) => property.hourlyPrice));

  return (
    <View style={[styles.wrap, isActive && styles.activeWrap]}>
      <View style={[styles.ring, availableCount > 0 && styles.availableRing]} />
      <View style={[styles.cluster, isActive && styles.activeCluster]}>
        <View style={styles.topRow}>
          <Text style={styles.countText}>{properties.length}</Text>
          <Text style={styles.unitText}>объектов</Text>
        </View>
        <Text numberOfLines={1} style={styles.districtText}>
          {district}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.priceText}>от {formatTenge(minPrice)} ₸/ч</Text>
          {availableCount > 0 ? (
            <View style={styles.livePill}>
              <Text style={styles.liveText}>{availableCount} сейчас</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    height: 102,
    justifyContent: "center",
    shadowColor: "#2B2118",
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    width: 138,
  },
  activeWrap: {
    transform: [{ scale: 1.04 }],
  },
  ring: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    borderColor: "rgba(42, 76, 66, 0.34)",
    borderWidth: 2,
  },
  availableRing: {
    borderColor: "rgba(17, 166, 101, 0.52)",
  },
  cluster: {
    width: 126,
    minHeight: 76,
    justifyContent: "center",
    borderRadius: 28,
    borderColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    backgroundColor: "rgba(255, 247, 231, 0.88)",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  activeCluster: {
    backgroundColor: "rgba(255, 252, 242, 0.96)",
    borderColor: "rgba(17, 166, 101, 0.58)",
  },
  topRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 5,
  },
  countText: {
    color: "#171512",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
  },
  unitText: {
    color: "#6F6558",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  districtText: {
    color: "#332B23",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: -1,
  },
  bottomRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 5,
  },
  priceText: {
    color: "#4A433A",
    flexShrink: 1,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0,
  },
  livePill: {
    borderRadius: 999,
    backgroundColor: "rgba(17, 166, 101, 0.14)",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  liveText: {
    color: "#118C58",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
