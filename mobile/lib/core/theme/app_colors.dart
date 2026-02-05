import 'package:flutter/material.dart';

class AppColors {
  // Primary Brand Colors
  static const Color primary = Color(0xFF2563EB); // Vivid Blue
  static const Color primaryDark = Color(0xFF1E40AF);
  static const Color primaryLight = Color(0xFF60A5FA);

  // Secondary/Accent Colors
  static const Color accent = Color(0xFF0F172A); // Slate 900
  static const Color secondary = Color(0xFF64748B); // Slate 500

  // Functional Colors
  static const Color success = Color(0xFF10B981); // Emerald 500
  static const Color error = Color(0xFFEF4444); // Red 500
  static const Color warning = Color(0xFFF59E0B); // Amber 500
  static const Color info = Color(0xFF3B82F6); // Blue 500

  // Background Colors
  static const Color background = Color(0xFFF8FAFC); // Slate 50
  static const Color surface = Colors.white;
  static const Color surfaceVariant = Color(0xFFF1F5F9); // Slate 100

  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF64748B); // Slate 500
  static const Color textInverse = Colors.white;

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF1E40AF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
