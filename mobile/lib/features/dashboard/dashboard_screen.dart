import 'package:flutter/material.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/glass_button.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Stack(
        children: [
          // Background ambient gradient
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 350,
              height: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF2563EB).withOpacity(isDark ? 0.15 : 0.08),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            right: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF10B981).withOpacity(isDark ? 0.12 : 0.06),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(18.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Good Morning 👋',
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                          Text(
                            'DevSecOps Overview',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : const Color(0xFF0F172A),
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.notifications_outlined),
                            onPressed: () {},
                          ),
                          const CircleAvatar(
                            radius: 18,
                            backgroundImage: NetworkImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'),
                          ),
                        ],
                      )
                    ],
                  ),
                  const SizedBox(height: 20),

                  // System Health Card
                  GlassCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'SYSTEM HEALTH',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text('94% HEALTHY', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        _buildServiceRow('API Gateway', '✓ Healthy', Colors.green),
                        _buildServiceRow('Database Cluster', '✓ Healthy', Colors.green),
                        _buildServiceRow('Payment Service', '⚠ Degraded', Colors.orange),
                        _buildServiceRow('Authentication API', '✓ Healthy', Colors.green),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // AI Insight Card
                  GlassCard(
                    glowColor: const Color(0xFF8B5CF6).withOpacity(0.3),
                    borderColor: const Color(0xFF8B5CF6).withOpacity(0.4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Text('🤖', style: TextStyle(fontSize: 20)),
                            SizedBox(width: 8),
                            Text(
                              'AI Insight',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Spacer(),
                            Text('Confidence 94%', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          '"Payment API latency increased by 23% after the latest deployment v2.14.0."',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Recommendation: "Monitor database connection pool exhaustion and consider rollback to v2.13.9."',
                          style: TextStyle(fontSize: 13, color: Colors.grey),
                        ),
                        const SizedBox(height: 14),
                        GlassButton(
                          text: 'View Analysis',
                          icon: Icons.auto_awesome,
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // KPI Cards
                  Row(
                    children: [
                      Expanded(
                        child: GlassCard(
                          child: _buildMetricTile('Active Projects', '4', Icons.folder_outlined, Colors.blue),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GlassCard(
                          child: _buildMetricTile('Running Pipelines', '2', Icons.play_circle_outline, Colors.amber),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: GlassCard(
                          child: _buildMetricTile('Failed Deployments', '1', Icons.warning_amber_rounded, Colors.red),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GlassCard(
                          child: _buildMetricTile('Self-Healed', '18', Icons.healing_outlined, const Color(0xFF10B981)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.account_tree_outlined), label: 'Pipelines'),
          NavigationDestination(icon: Icon(Icons.shield_outlined), label: 'Security'),
          NavigationDestination(icon: Icon(Icons.healing_outlined), label: 'Self-Healing'),
          NavigationDestination(icon: Icon(Icons.settings_outlined), label: 'Settings'),
        ],
      ),
    );
  }

  Widget _buildServiceRow(String name, String status, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(name, style: const TextStyle(fontSize: 14)),
          Text(status, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildMetricTile(String title, String val, IconData icon, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            Icon(icon, size: 18, color: color),
          ],
        ),
        const SizedBox(height: 8),
        Text(val, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
