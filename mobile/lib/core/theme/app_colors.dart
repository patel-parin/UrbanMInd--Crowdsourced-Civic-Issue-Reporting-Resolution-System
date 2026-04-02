import 'package:flutter/material.dart';

class AppColors {
  //  Backgrounds (Rich Navy/Slate)
  static const Color background = Color(0xFF0B1121); // Deepest Navy
  static const Color surface = Color(0xFF151E32); // Lighter Navy
  static const Color surfaceLight = Color(0xFF2A3655); // Highlight

  // Primary (Electric & Vibrant)
  static const Color primary = Color(0xFF6366F1); // Electric Indigo
  static const Color primaryDark = Color(0xFF4338CA);
  static const Color primaryLight = Color(0xFF818CF8);

  // Accents (Neon Pop)
  static const Color accent = Color(0xFF06B6D4); // Cyan Neon
  static const Color accentPink = Color(0xFFEC4899); // Hot Pink
  static const Color accentAmber = Color(0xFFF59E0B); // Amber glow

  // Functional
  static const Color success = Color(0xFF10B981); // Emerald
  static const Color error = Color(0xFFEF4444); // Red
  static const Color warning = Color(0xFFF59E0B); // Amber
  static const Color info = Color(0xFF3B82F6); // Blue

  // Text
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Color(0xFF94A3B8); // Slate 400
  static const Color textInverse = Color(0xFF0F172A);

  // Premium Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [
      Color(0xFF0B1121), // Deepest Navy
      Color(0xFF1E1B4B), // Rich Indigo
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [
      Color(0xCC151E32), // Translucent Navy
      Color(0x990B1121), // Translucent Darker
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [
      Color(0xFF6366F1), // Indigo
      Color(0xFFEC4899), // Pink
    ],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient glassGradient = LinearGradient(
    colors: [
      Color(0xCC2A3655), // Lighter surface
      Color(0x66151E32), // Darker surface
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
