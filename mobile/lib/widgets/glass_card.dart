import 'package:flutter/material.dart';
import '../app/theme/glass_theme.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final Color? borderColor;
  final Color? glowColor;
  final VoidCallback? onTap;

  const GlassCard({
    super.key,
    required this.child,
    this.borderRadius = 20.0,
    this.padding = const EdgeInsets.all(18.0),
    this.borderColor,
    this.glowColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Widget cardContent = ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: GlassTheme.defaultBlur(sigma: 16.0),
        child: Container(
          padding: padding,
          decoration: isDark
              ? GlassTheme.darkGlassDecoration(
                  radius: borderRadius,
                  borderColor: borderColor,
                  glowColor: glowColor,
                )
              : GlassTheme.lightGlassDecoration(
                  radius: borderRadius,
                  borderColor: borderColor,
                ),
          child: child,
        ),
      ),
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(borderRadius),
        child: cardContent,
      );
    }

    return cardContent;
  }
}
