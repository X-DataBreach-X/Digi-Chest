// useState lets the grid remember how much space it was given.
import { useState } from 'react';
// Built-in React Native pieces used to build the screen, read sizes, and measure space.
import {
  type LayoutChangeEvent,
  // Tells which platform the app is running on (web, iOS, or Android).
  Platform,
  ScrollView,
  // Type for a style that may be a single style, a list of styles, or nothing.
  type StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  // Type describing the style options a View accepts.
  type ViewStyle,
} from 'react-native';

// Gives the screen the current light or dark colors.
import { useTheme } from '../../constants/theme';

// Screens at least this wide get the side-by-side computer layout.
const WIDE_SCREEN_MIN_WIDTH = 768;
// On phones, the regular inventory shows at least this many boxes (rounded up to full rows).
// Raised from 36 to 100 so there is room for more items (computers scroll to reach the extra boxes).
const INVENTORY_SLOT_COUNT = 100;
// Width and height of each inventory box, in pixels.
const SLOT_SIZE = 96;
// Space between boxes, in pixels; also used when counting how many boxes fit.
const SLOT_GAP = 6;
// The four armor slots, listed top to bottom.
const ARMOR_SLOTS = ['Head', 'Chest', 'Legs', 'Feet'];
// Wardrobe spacing is measured in box sizes, so everything shrinks together on narrow screens.
// Space between the stacked armor boxes (0.125 of a box = 12px at full size).
const ARMOR_GAP_RATIO = 0.125;
// The one equal space between every side-by-side box in the row (36px at full size).
const ITEM_GAP_RATIO = 0.375;
// How far the arm boxes are raised above the hand boxes (about 38px at full size).
const ARM_RAISE_RATIO = 0.4;
// Total row width in box sizes: 5 boxes plus the 4 equal gaps between them.
const WARDROBE_ROW_UNITS = 5 + 4 * ITEM_GAP_RATIO;

// The Inventory tab: avatar and the regular inventory.
export default function InventoryScreen() {
  // Reads the current theme colors.
  const { colors } = useTheme();
  // Builds the styles using those colors.
  const styles = createStyles(colors);
  // Reads the current window width so the layout can react to it.
  const { width } = useWindowDimensions();
  // True on computers and wide tablets, false on phones.
  const isWide = width >= WIDE_SCREEN_MIN_WIDTH;

  // The right side on computers; first on phones.
  const avatarSection = (
    // A bordered panel that holds the avatar.
    <View style={[styles.section, styles.avatarSection]}>
      {/* Section heading. */}
      <Text style={styles.heading}>Avatar</Text>
      {/* Fills the panel and centers the placeholder text. */}
      <View style={styles.avatarArea}>
        {/* Stands in for the 3D avatar until it is built. */}
        <Text style={styles.placeholderText}>3D avatar goes here</Text>
      </View>
    </View>
  );

  // Remembers how wide the wardrobe row is (zero until it is first measured).
  const [wardrobeWidth, setWardrobeWidth] = useState(0);
  // Box size: as big as fits across the row, but never bigger than a regular inventory box.
  const equipSize = Math.min(SLOT_SIZE, Math.floor(wardrobeWidth / WARDROBE_ROW_UNITS));
  // The equal space between every side-by-side box, scaled to the box size.
  const itemGap = equipSize * ITEM_GAP_RATIO;
  // Moves the arm boxes up; negative because up is the negative direction on screen.
  const armRaise = { transform: [{ translateY: -equipSize * ARM_RAISE_RATIO }] };

  // Saves the wardrobe row's width whenever its space changes, such as a window resize.
  function handleWardrobeLayout(event: LayoutChangeEvent) {
    // Stores the width so the box size is recalculated.
    setWardrobeWidth(event.nativeEvent.layout.width);
  }

  // The bottom right on computers; second on phones.
  const equipmentSection = (
    // A bordered panel that holds what the character wears and holds.
    <View style={styles.section}>
      {/* Section heading. */}
      <Text style={styles.heading}>Wardrobe</Text>
      {/* The Pack slot for back items (jet packs, backpacks), pinned to the panel's top right corner. */}
      <View style={styles.packCorner}>
        {/* Its name, styled like "Wardrobe" so the two line up across the top. */}
        <Text style={styles.heading}>Pack</Text>
        {/* The empty back-item box, the same size as the other wardrobe boxes. */}
        <EquipSlot size={equipSize} styles={styles} />
      </View>
      {/* A row of five: left hand, left arm, armor column, right arm, right hand, centered in the panel. */}
      {/* It measures its width so the boxes can shrink to fit narrow screens. */}
      {/* The gap puts the same space between every pair of neighboring boxes. */}
      <View style={[styles.equipmentRow, { gap: itemGap }]} onLayout={handleWardrobeLayout}>
        {/* The item held in the left hand. */}
        <EquipSlot size={equipSize} styles={styles} />
        {/* The left arm piece (forearm to upper arm), raised above the hand box. */}
        <EquipSlot size={equipSize} styles={styles} style={armRaise} />
        {/* The four armor boxes stacked top to bottom, with gaps scaled to the box size. */}
        <View style={{ gap: equipSize * ARMOR_GAP_RATIO }}>
          {/* Draws one box for each armor slot: head, chest, legs, feet. */}
          {ARMOR_SLOTS.map((label) => (
            // One armor box; key uses the slot name because each name is unique.
            <EquipSlot key={label} size={equipSize} styles={styles} />
          ))}
        </View>
        {/* The right arm piece, mirroring the left one. */}
        <EquipSlot size={equipSize} styles={styles} style={armRaise} />
        {/* The item held in the right hand. */}
        <EquipSlot size={equipSize} styles={styles} />
      </View>
    </View>
  );

  // The left side on computers; third on phones.
  const inventorySection = (
    // A bordered panel that holds the regular inventory boxes.
    <View style={[styles.section, isWide && styles.fill]}>
      {/* Section heading. */}
      <Text style={styles.heading}>Inventory</Text>
      {/* The grid of empty boxes for collected items. */}
      {/* On computers, scrollable adds a scroll bar on the right when there are more boxes than fit. */}
      <SlotGrid
        minCount={INVENTORY_SLOT_COUNT}
        fillHeight={isWide}
        scrollable={isWide}
        styles={styles}
      />
    </View>
  );

  // Computer layout: inventory on the left, avatar on the right.
  if (isWide) {
    // Returns the side-by-side layout.
    return (
      // A row that splits the screen into left and right halves.
      <View style={[styles.screen, styles.wideRow]}>
        {/* Left half: the regular inventory, top and bottom. */}
        <View style={styles.column}>{inventorySection}</View>
        {/* Right half: the avatar on top, the equipment below it in the bottom right. */}
        <View style={styles.column}>
          {/* The avatar stretches to fill whatever height the equipment leaves. */}
          {avatarSection}
          {/* The equipment panel takes only the height its boxes need. */}
          {equipmentSection}
        </View>
      </View>
    );
  }

  // Phone layout: every section stacked in a scrollable column.
  return (
    // Lets the player scroll when the sections are taller than the phone.
    <ScrollView style={styles.screen} contentContainerStyle={styles.phoneColumn}>
      {/* First: the avatar. */}
      {avatarSection}
      {/* Second: the equipment. */}
      {equipmentSection}
      {/* Third: the regular inventory. */}
      {inventorySection}
    </ScrollView>
  );
}

// Describes the values EquipSlot needs.
type EquipSlotProps = {
  // Width and height of the box, in pixels.
  size: number;
  // The screen's styles, so the box matches the current theme.
  styles: ReturnType<typeof createStyles>;
  // Extra spacing or positioning for this box; optional, so most boxes skip it.
  style?: StyleProp<ViewStyle>;
};

// Draws one empty equipment box.
function EquipSlot({ size, styles, style }: EquipSlotProps) {
  // Returns the box.
  return (
    // Reuses the inventory box look, sets the size, then applies any extra style.
    <View style={[styles.slot, { width: size, height: size }, style]} />
  );
}

// Describes the values SlotGrid needs.
type SlotGridProps = {
  // On phones, the fewest boxes to draw before rounding up to a full row.
  minCount: number;
  // True on computers: fill the section's height with rows instead of using minCount.
  fillHeight: boolean;
  // True to put the grid in its own scroll area; optional, so it is off unless asked for.
  scrollable?: boolean;
  // The screen's styles, so the boxes match the current theme.
  styles: ReturnType<typeof createStyles>;
};

// Counts how many boxes fit side by side (or top to bottom) in a given length.
function slotsThatFit(length: number) {
  // Each box takes SLOT_SIZE plus one gap; the extra gap accounts for the last box having none.
  return Math.max(1, Math.floor((length + SLOT_GAP) / (SLOT_SIZE + SLOT_GAP)));
}

// Draws a grid of empty item boxes that fills the space it is given.
function SlotGrid({ minCount, fillHeight, scrollable = false, styles }: SlotGridProps) {
  // Remembers the grid's measured width and height (zero until the first measurement).
  const [size, setSize] = useState({ width: 0, height: 0 });
  // Remembers how tall the visible part of the scroll area is (only used when scrollable).
  const [viewHeight, setViewHeight] = useState(0);

  // Saves the grid's new size whenever its space changes, such as a window resize.
  function handleLayout(event: LayoutChangeEvent) {
    // Pulls the width and height out of the layout event.
    const { width, height } = event.nativeEvent.layout;
    // Stores them so the box count is recalculated.
    setSize({ width, height });
  }

  // Saves the scroll area's visible height, which stays the same no matter how many boxes are inside.
  function handleScrollLayout(event: LayoutChangeEvent) {
    // Stores only the height; the width still comes from the grid itself.
    setViewHeight(event.nativeEvent.layout.height);
  }

  // How many boxes fit across one row.
  const columns = slotsThatFit(size.width);
  // Rows needed to hold at least minCount boxes.
  const minRows = Math.ceil(minCount / columns);
  // Rows that fit in the visible space; a scrolling grid's own height grows with its boxes, so it uses viewHeight.
  const fitRows = slotsThatFit(scrollable ? viewHeight : size.height);
  // Scrolling: fill the view, or more if minCount needs it; computers: fill; phones: hold minCount.
  const rows = scrollable ? Math.max(fitRows, minRows) : fillHeight ? fitRows : minRows;
  // Draws nothing until the grid has been measured, then fills every row completely.
  const count = size.width > 0 ? columns * rows : 0;

  // The grid of boxes, shared by the scrolling and non-scrolling versions.
  const grid = (
    // A row that wraps onto new lines; it measures itself so the count can be calculated.
    // It only stretches to fill when not scrolling, so a scrolling grid can grow past the view.
    <View style={[styles.slotGrid, fillHeight && !scrollable && styles.fill]} onLayout={handleLayout}>
      {/* Makes a list of `count` numbers and draws one box for each. */}
      {Array.from({ length: count }, (_, index) => (
        // One empty box; key keeps React's list tracking correct.
        <View key={index} style={styles.slot} />
      ))}
    </View>
  );

  // Without scrolling, the grid is returned as is.
  if (!scrollable) return grid;

  // With scrolling, the grid sits inside a scroll area whose bar appears on the right.
  return (
    // Fills the section, measures its visible height, and keeps the bar visible on Android.
    // scrollArea also colors the bar on web to match the theme.
    <ScrollView style={styles.scrollArea} onLayout={handleScrollLayout} persistentScrollbar>
      {/* The boxes; anything below the visible area is reached by scrolling. */}
      {grid}
    </ScrollView>
  );
}

// Creates the screen's styles from the current theme colors.
function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  // Returns the finished style sheet.
  return StyleSheet.create({
    // The whole screen's background.
    screen: {
      // Fills all available space.
      flex: 1,
      // Uses the theme's background color.
      backgroundColor: colors.background,
    },
    // Computer layout: places the two halves side by side.
    wideRow: {
      // Lays children out left to right.
      flexDirection: 'row',
      // Space between the halves.
      gap: 16,
      // Space between the halves and the screen edge.
      padding: 16,
    },
    // One half of the computer layout.
    column: {
      // Each half takes an equal share of the width.
      flex: 1,
      // Space between the sections inside a half.
      gap: 16,
    },
    // Phone layout: the stacked column inside the scroll view.
    phoneColumn: {
      // Space between the stacked sections.
      gap: 16,
      // Space between the sections and the screen edge.
      padding: 16,
    },
    // The shared look of every section panel.
    section: {
      // Slightly lighter panel color than the background.
      backgroundColor: colors.surface,
      // Thin outline around the panel.
      borderWidth: 1,
      // Outline color from the theme.
      borderColor: colors.border,
      // Rounded panel corners.
      borderRadius: 12,
      // Space inside the panel.
      padding: 16,
      // Space between the heading and the content.
      gap: 12,
    },
    // Makes a section stretch to fill its half of the screen.
    fill: {
      // Takes all remaining height.
      flex: 1,
    },
    // The inventory's scroll area on computers.
    scrollArea: {
      // Takes all remaining height in the section.
      flex: 1,
      // Web only: colors the scroll bar's handle and track with the theme so it blends in.
      // (Phones use their own small overlay bar, so this is skipped there.)
      ...(Platform.OS === 'web' && { scrollbarColor: `${colors.border} ${colors.surface}` }),
    },
    // Sizes the avatar section.
    avatarSection: {
      // Fills the whole right half on computers.
      flex: 1,
      // Keeps it tall enough to see the avatar on phones.
      minHeight: 300,
    },
    // The space where the 3D avatar will be drawn.
    avatarArea: {
      // Fills the rest of the avatar panel.
      flex: 1,
      // Centers the placeholder text vertically.
      justifyContent: 'center',
      // Centers the placeholder text horizontally.
      alignItems: 'center',
      // Dashed outline marks it as unfinished.
      borderStyle: 'dashed',
      // Thin outline.
      borderWidth: 1,
      // Outline color from the theme.
      borderColor: colors.border,
      // Rounded corners to match the panel.
      borderRadius: 8,
    },
    // The section titles.
    heading: {
      // Medium-large text.
      fontSize: 18,
      // Bold text.
      fontWeight: 'bold',
      // Main text color from the theme.
      color: colors.text,
    },
    // The faded "goes here" text.
    placeholderText: {
      // Faded text color from the theme.
      color: colors.textMuted,
    },
    // The wrapping row of item boxes.
    slotGrid: {
      // Lays boxes out left to right.
      flexDirection: 'row',
      // Moves boxes to a new line when the row is full.
      flexWrap: 'wrap',
      // Space between boxes.
      gap: SLOT_GAP,
      // Centers the full rows so leftover space is split evenly on both sides.
      justifyContent: 'center',
      // Lines rows up from the top instead of spreading them out.
      alignContent: 'flex-start',
      // Hides any box that would poke past the section's edge.
      overflow: 'hidden',
    },
    // One empty item box.
    slot: {
      // Box width.
      width: SLOT_SIZE,
      // Box height.
      height: SLOT_SIZE,
      // Darker inside than the panel, like an empty slot.
      backgroundColor: colors.background,
      // Thin outline around the box.
      borderWidth: 1,
      // Outline color from the theme.
      borderColor: colors.border,
      // Slightly rounded corners.
      borderRadius: 4,
    },
    // Holds the Pack name and box in the Wardrobe panel's top right corner.
    packCorner: {
      // Takes it out of the normal top-to-bottom flow so it doesn't push the row down.
      position: 'absolute',
      // Lines its top up with the "Wardrobe" heading (matches the panel's padding).
      top: 16,
      // Keeps it the same distance from the right edge as the heading is from the left.
      right: 16,
      // Centers the name over the box.
      alignItems: 'center',
      // Space between the name and the box.
      gap: 6,
    },
    // The row holding the hands, arms, and armor column.
    equipmentRow: {
      // Lays the three parts out left to right.
      flexDirection: 'row',
      // Centers the three parts across the panel.
      justifyContent: 'center',
      // Lines the hand boxes up with the middle of the armor column.
      alignItems: 'center',
    },
  });
}
