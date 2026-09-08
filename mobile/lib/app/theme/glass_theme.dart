import 'dart:ui';
import 'package:flutter/material.dart';

class GlassTheme {
  static BoxDecoration darkGlassDecoration({
    double radius = 20.0,
    Color? borderColor,
    Color? glowColor,
  }) {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(radius),
      color: const Color(0xFF0F172A).withValues(alpha: 0.65),
      border: Border.all(
        color: borderColor ?? Colors.white.withValues(alpha: 0.12),
        width: 1.2,
      ),
      boxShadow: [
        BoxShadow(
          color: glowColor ?? Colors.black.withValues(alpha: 0.35),
          blurRadius: 18,
          offset: const Offset(0, 8),
        ),
      ],
    );
  }

  static BoxDecoration lightGlassDecoration({
    double radius = 20.0,
    Color? borderColor,
  }) {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(radius),
      color: Colors.white.withValues(alpha: 0.75),
      border: Border.all(
        color: borderColor ?? Colors.black.withValues(alpha: 0.08),
        width: 1.2,
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.06),
          blurRadius: 16,
          offset: const Offset(0, 6),
        ),
      ],
    );
  }

  static ImageFilter defaultBlur({double sigma = 16.0}) {
    return ImageFilter.blur(sigmaX: sigma, sigmaY: sigma);
  }
}
