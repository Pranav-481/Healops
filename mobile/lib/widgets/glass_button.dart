import 'dart:ui';
import 'package:flutter/material.dart';

enum GlassButtonVariant { primary, secondary, danger, outlined }

class GlassButton extends StatefulWidget {
  final String text;
  final IconData? icon;
  final VoidCallback? onPressed;
  final GlassButtonVariant variant;
  final bool isLoading;

  const GlassButton({
    super.key,
    required this.text,
    this.icon,
    this.onPressed,
    this.variant = GlassButtonVariant.primary,
    this.isLoading = false,
  });

  @override
  State<GlassButton> createState() => _GlassButtonState();
}

class _GlassButtonState extends State<GlassButton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 140),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Color _getBackgroundColor(BuildContext context) {
    switch (widget.variant) {
      case GlassButtonVariant.primary:
        return const Color(0xFF2563EB).withOpacity(0.85);
      case GlassButtonVariant.secondary:
        return Colors.white.withOpacity(0.15);
      case GlassButtonVariant.danger:
        return const Color(0xFFDC2626).withOpacity(0.85);
      case GlassButtonVariant.outlined:
        return Colors.transparent;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bg = _getBackgroundColor(context);

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTapDown: (_) => _controller.forward(),
        onTapUp: (_) {
          _controller.reverse();
          widget.onPressed?.call();
        },
        onTapCancel: () => _controller.reverse(),
        child: AnimatedScale(
          scale: _isHovered ? 1.03 : 1.0,
          duration: const Duration(milliseconds: 150),
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    color: bg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.25),
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: widget.variant == GlassButtonVariant.primary
                            ? const Color(0xFF2563EB).withOpacity(0.4)
                            : Colors.black.withOpacity(0.2),
                        blurRadius: _isHovered ? 16 : 8,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (widget.isLoading)
                        const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      else if (widget.icon != null)
                        Icon(widget.icon, size: 18, color: Colors.white),
                      if (widget.icon != null || widget.isLoading) const SizedBox(width: 8),
                      Text(
                        widget.text,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
