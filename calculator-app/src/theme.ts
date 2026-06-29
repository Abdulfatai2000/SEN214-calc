export const theme = {
  colors: {
    background: '#2C3E50',       // Steel Blue background
    surface: '#34495E',          // Surface/Keys background
    text: '#D6E4F0',             // Soft ice blue text
    border: '#415B76',           // Subtle border color
    accent: '#2979FF',           // Electric Blue accent
    accentLight: '#5294FF',      // Lighter accent for contrast if needed
    textMuted: '#8FA0B2',        // Muted text for live preview
    textDark: '#1A1A2E',         // Dark text (for active tab or white buttons)
    white: '#FFFFFF',            // White for active selectors
    error: '#FF6B6B',            // Error color
    dangerBg: '#4A2A2A',         // Reddish background for warnings (Clear)
    dangerText: '#FF8B8B',       // Light red for warning text
  },
  keyShape: {
    borderRadius: 20,            // Soft Squircles shape
    gap: 8,
    borderWidth: 0,
    elevation: 3,                // Subtle elevation shadow
  },
  fonts: {
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    bold: 'Outfit_700Bold',
  },
  displayStyle: {
    // Floating Card: displays as a card elevated from screen edges
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
    padding: 16,
    backgroundColor: '#34495E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  }
};
