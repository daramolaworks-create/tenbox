import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  ShoppingBag,
  Search,
  Package,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { TabType, Shipment } from "../types";
import { UserProfile } from "../store";
import OfferSlider from "./OfferSlider";

interface HomeViewProps {
  user: UserProfile | null;
  shipments: Shipment[];
  orderHistory: any[];
  onNavigate: (tab: TabType) => void;
  onViewSettings: (view: "list" | "account" | "addresses" | "orders") => void;
  onShipParcel: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({
  user,
  shipments,
  orderHistory,
  onNavigate,
  onViewSettings,
  onShipParcel,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "#34C759";
      case "out_for_delivery":
        return "#1C39BB";
      case "exception":
        return "#FF3B30";
      default:
        return "#FF9500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return CheckCircle;
      case "exception":
        return AlertCircle;
      default:
        return Truck;
    }
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const allActivity = useMemo(() => {
    return [
      ...shipments.map((s) => ({
        type: "shipment",
        data: s,
        date: s.date ? new Date(s.date) : new Date(0),
      })),
      ...orderHistory.map((o) => ({
        type: "order",
        data: o,
        date: o.date ? new Date(o.date) : new Date(0),
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [shipments, orderHistory]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: 24 }}>
        <Text style={styles.heroText}>{greeting},</Text>
        <Text style={[styles.heroText, { color: "#1C39BB" }]}>
          {user?.name || "Guest"}.
        </Text>
      </View>

      <OfferSlider />

      <TouchableOpacity activeOpacity={0.9} onPress={() => onNavigate("shop")}>
        <View style={styles.featuredCard}>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredLabel}>GLOBAL SHOPPING</Text>
            <Text style={styles.featuredTitle}>Shop the World</Text>
            <Text style={styles.featuredDesc}>
              Import from Amazon, Apple, and more.
            </Text>
            <View style={styles.featuredLogos}>
              <Image
                source={require("../assets/logos/amazon.png")}
                style={{ width: 50, height: 20 }}
                resizeMode="contain"
              />
              <Image
                source={require("../assets/logos/apple.png")}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.featuredIcon}>
            <ShoppingBag color="#fff" size={32} />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          activeOpacity={0.8}
          onPress={onShipParcel}
        >
          <View style={[styles.iconBox, { backgroundColor: "#E0E7FF" }]}>
            <Package color="#1C39BB" size={24} />
          </View>
          <Text style={styles.quickTitle}>Ship Parcel</Text>
          <Text style={styles.quickDesc}>Send anywhere</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          activeOpacity={0.8}
          onPress={() => onNavigate("track")}
        >
          <View style={[styles.iconBox, { backgroundColor: "#DCFCE7" }]}>
            <Search color="#166534" size={24} />
          </View>
          <Text style={styles.quickTitle}>Track Order</Text>
          <Text style={styles.quickDesc}>{shipments.length} active</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        <TouchableOpacity
          onPress={() => {
            onViewSettings("orders");
            onNavigate("settings");
          }}
        >
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Combined Activity Feed */}
      {allActivity.length === 0 ? (
        <View style={styles.emptyActivity}>
          <Clock size={24} color="#C7C7CC" />
          <Text style={styles.emptyText}>No recent activity.</Text>
        </View>
      ) : (
        allActivity.slice(0, 3).map((item, i) => {
          const isShipment = item.type === "shipment";
          const data = item.data;

          let icon, color, title, statusText, subText, idText, DetailsAction;

          const status = (data.status || "pending").toLowerCase();
          color = getStatusColor(status);
          icon = getStatusIcon(status);
          statusText = status.replace(/_/g, " ");

          if (isShipment) {
            title = data.itemsString || "Shipment";
            subText =
              status === "delivered"
                ? "Delivered successfully"
                : `Expected ${data.estimatedDelivery || "soon"}`;

            // Safer ID display: tracking number can be long, show last part or slice
            const trackNum = data.trackingNumber || "";
            const shortId = trackNum.includes("-")
              ? trackNum.split("-")[1]
              : trackNum.slice(-8);
            idText = `${data.carrier || "Carrier"} • #${shortId}`;
            DetailsAction = () => onNavigate("track");
          } else {
            // Order Logic
            title = data.items || "Order";
            if (title.length > 30) title = title.substring(0, 28) + "...";

            subText = `Placed on ${data.date}`;
            // Safer Order ID: UUIDs might not have hyphens where we expect
            const orderId = data.id || "";
            idText = `ORDER #${orderId.split("-")[0] || orderId.slice(0, 8)}`;
            DetailsAction = () => {
              onViewSettings("orders");
              onNavigate("settings");
            };
          }

          const IconComponent = icon;

          return (
            <TouchableOpacity
              key={`${item.type}-${data.id || i}`}
              style={styles.orderCard}
              activeOpacity={0.9}
              onPress={DetailsAction}
            >
              <View style={styles.cardMain}>
                <View
                  style={[
                    styles.statusIconBox,
                    { backgroundColor: color + "15" },
                  ]}
                >
                  <IconComponent size={24} color={color} strokeWidth={2.5} />
                </View>

                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text style={styles.activityMeta}>{subText}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: color + "15" },
                  ]}
                >
                  <Text style={[styles.statusBadgeText, { color: color }]}>
                    {statusText}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.idBadge}>
                  <Image
                    source={require("../assets/logo.png")}
                    style={{ width: 12, height: 12, tintColor: "#AEAEB2" }}
                    resizeMode="contain"
                  />
                  <Text style={styles.orderIdSm}>{idText}</Text>
                </View>

                <View style={styles.viewAction}>
                  <Text style={styles.viewText}>{isShipment ? "Track" : "Details"}</Text>
                  <ChevronRight size={14} color="#1C39BB" strokeWidth={3} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* Banner Ad */}
      <TouchableOpacity activeOpacity={0.9} style={{ marginTop: 20 }}>
        <Image
          source={require("../assets/offers/banner_ad.png")}
          style={{ width: "100%", height: 100, borderRadius: 12 }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8F9FB", paddingBottom: 24, paddingHorizontal: 24 },
  heroText: {
    color: "#000",
    fontSize: 34,
    fontFamily: "Satoshi-Bold",
    letterSpacing: -0.6,
  },
  featuredCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  featuredContent: { flex: 1 },
  featuredLabel: {
    color: "#1C39BB",
    fontSize: 11,
    fontFamily: "Satoshi-Bold",
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  featuredTitle: {
    color: "#000",
    fontSize: 24,
    fontFamily: "Satoshi-Bold",
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  featuredDesc: {
    color: "#8E8E93",
    fontSize: 14,
    fontFamily: "Satoshi-Regular",
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredLogos: { flexDirection: "row", gap: 12, alignItems: "center" },
  featuredIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1C39BB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1C39BB",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  quickGrid: { flexDirection: "row", gap: 16, marginBottom: 32 },
  quickCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F2F2F7",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  quickTitle: {
    color: "#1C1C1E",
    fontSize: 16,
    fontFamily: "Satoshi-Bold",
    marginBottom: 4,
  },
  quickDesc: {
    color: "#8E8E93",
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    opacity: 0.8
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#1C1C1E",
    fontSize: 16,
    fontFamily: "Satoshi-Bold",
    letterSpacing: -0.2,
  },
  seeAll: {
    color: "#1C39BB",
    fontSize: 13,
    fontFamily: "Satoshi-Bold"
  },
  emptyActivity: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F2F2F7",
    borderStyle: "dashed",
  },
  emptyText: {
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 12,
    fontSize: 15,
    fontFamily: "Satoshi-Medium",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statusIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: "Satoshi-Bold",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 13,
    color: "#8E8E93",
    fontFamily: "Satoshi-Medium",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F8F9FB",
  },
  idBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8F9FB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderIdSm: {
    fontSize: 11,
    color: "#8E8E93",
    fontFamily: "Satoshi-Bold",
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: "Satoshi-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  viewAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewText: {
    fontSize: 13,
    color: "#1C39BB",
    fontFamily: "Satoshi-Bold",
  },
});

export default HomeView;
