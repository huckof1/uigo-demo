import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { SharedValue } from "react-native-reanimated";
import { useSharedValue, withSpring, withTiming } from "react-native-reanimated";

export type DemoRole = "guest" | "tenant";
export type AuthIntent = "booking" | "open_menu" | "profile";
export type SelectedMode = "owner" | "tenant";
export type TenantPurpose = "daily" | "hours" | "urgent";

export type PendingAuthIntent = {
  intent: AuthIntent;
  propertyId?: string;
};

export type TenantProfile = {
  city: string;
  name: string;
  phone: string;
  purpose: TenantPurpose;
};

type DemoSessionContextValue = {
  addBookingRequest: (propertyId: string) => void;
  bookingPropertyIds: string[];
  clearAuthIntent: () => void;
  closeMenu: () => void;
  completeEmailDemoAuth: (email: string) => void;
  completeTenantProfile: (profile: TenantProfile) => void;
  email?: string;
  isAuthenticated: boolean;
  isMenuOpen: boolean;
  logout: () => void;
  menuProgress: SharedValue<number>;
  openMenu: () => void;
  pendingAuthIntent?: PendingAuthIntent;
  role: DemoRole;
  selectedMode?: SelectedMode;
  selectMode: (mode: SelectedMode) => void;
  setMenuProgress: (progress: number) => void;
  startAuthIntent: (intent: PendingAuthIntent) => void;
  tenantProfile?: TenantProfile;
  tenantProfileComplete: boolean;
  toggleMenu: () => void;
};

const DemoSessionContext = createContext<DemoSessionContextValue | null>(null);

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<DemoRole>("guest");
  const [email, setEmail] = useState<string | undefined>();
  const [selectedMode, setSelectedMode] = useState<SelectedMode | undefined>();
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | undefined>();
  const [pendingAuthIntent, setPendingAuthIntent] = useState<
    PendingAuthIntent | undefined
  >();
  const [bookingPropertyIds, setBookingPropertyIds] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuProgress = useSharedValue(0);
  const isAuthenticated = role === "tenant";

  const value = useMemo<DemoSessionContextValue>(
    () => ({
      addBookingRequest: (propertyId: string) => {
        setBookingPropertyIds((currentIds) => {
          const nextIds = [
            propertyId,
            ...currentIds.filter((currentId) => currentId !== propertyId),
          ];

          if (nextIds.length === currentIds.length && nextIds[0] === currentIds[0]) {
            return currentIds;
          }

          return nextIds;
        });
      },
      bookingPropertyIds,
      clearAuthIntent: () => {
        setPendingAuthIntent(undefined);
      },
      closeMenu: () => {
        menuProgress.value = withTiming(0, { duration: 210 });
        setIsMenuOpen(false);
      },
      completeEmailDemoAuth: (nextEmail: string) => {
        setEmail(nextEmail);
        setRole("tenant");
      },
      completeTenantProfile: (profile: TenantProfile) => {
        setTenantProfile(profile);
        setSelectedMode("tenant");
      },
      email,
      isAuthenticated,
      isMenuOpen,
      logout: () => {
        setEmail(undefined);
        setBookingPropertyIds([]);
        setPendingAuthIntent(undefined);
        setSelectedMode(undefined);
        setTenantProfile(undefined);
        setRole("guest");
        menuProgress.value = withTiming(0, { duration: 210 });
        setIsMenuOpen(false);
      },
      menuProgress,
      openMenu: () => {
        if (!isAuthenticated) {
          return;
        }

        setIsMenuOpen(true);
        menuProgress.value = withSpring(1, { damping: 23, stiffness: 190 });
      },
      pendingAuthIntent,
      role,
      selectedMode,
      selectMode: (mode: SelectedMode) => {
        setSelectedMode(mode);
      },
      setMenuProgress: (progress: number) => {
        menuProgress.value = progress;
      },
      startAuthIntent: (intent: PendingAuthIntent) => {
        setPendingAuthIntent(intent);
      },
      toggleMenu: () => {
        if (!isAuthenticated) {
          return;
        }

        if (isMenuOpen) {
          menuProgress.value = withTiming(0, { duration: 210 });
          setIsMenuOpen(false);
          return;
        }

        setIsMenuOpen(true);
        menuProgress.value = withSpring(1, { damping: 23, stiffness: 190 });
      },
      tenantProfile,
      tenantProfileComplete: Boolean(tenantProfile),
    }),
    [
      email,
      bookingPropertyIds,
      isAuthenticated,
      isMenuOpen,
      menuProgress,
      pendingAuthIntent,
      role,
      selectedMode,
      tenantProfile,
    ],
  );

  return (
    <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  const value = useContext(DemoSessionContext);

  if (!value) {
    throw new Error("useDemoSession must be used inside DemoSessionProvider");
  }

  return value;
}
