import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { MockProperty } from "@/lib/types/property";
import { PropertyHeroCard } from "@/components/property/PropertyHeroCard";

type HeroPropertyCarouselProps = {
  onPressProperty: (property: MockProperty) => void;
  onSelectedPropertyChange: (property: MockProperty) => void;
  properties: MockProperty[];
};

type HeroSlide = {
  imageUrl: string;
  property: MockProperty;
};

export function HeroPropertyCarousel({
  onPressProperty,
  onSelectedPropertyChange,
  properties,
}: HeroPropertyCarouselProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo<HeroSlide[]>(
    () => {
      const usedOwners = new Set<string>();

      return properties.reduce<HeroSlide[]>((acc, property) => {
        if (usedOwners.has(property.ownerName)) {
          return acc;
        }

        usedOwners.add(property.ownerName);
        const cover = [...property.photos].sort(
          (left, right) => left.priority - right.priority,
        )[0];

        acc.push({
          imageUrl: cover.url,
          property,
        });

        return acc;
      }, []);
    },
    [properties],
  );

  useEffect(() => {
    if (!slides[activeIndex]) {
      return;
    }

    onSelectedPropertyChange(slides[activeIndex].property);
  }, [activeIndex, onSelectedPropertyChange, slides]);

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % slides.length;
        scrollRef.current?.scrollTo({ animated: true, x: nextIndex * width });
        return nextIndex;
      });
    }, 4200);

    return () => {
      clearInterval(timer);
    };
  }, [slides.length, width]);

  function handleMomentumEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.max(0, Math.min(nextIndex, slides.length - 1)));
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        bounces={false}
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={handleMomentumEnd}
        pagingEnabled
        ref={scrollRef}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={styles.scroller}
      >
        {slides.map((slide, index) => (
          <View
            key={slide.property.id}
            style={[styles.slide, { width }]}
          >
            <PropertyHeroCard
              imageSource={{ uri: slide.imageUrl }}
              isActive={index === activeIndex}
              onPress={() => {
                onPressProperty(slide.property);
              }}
              property={slide.property}
              showInfoPanel={false}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#090806",
  },
  scroller: {
    backgroundColor: "#090806",
  },
  slide: {
    backgroundColor: "#090806",
  },
});
