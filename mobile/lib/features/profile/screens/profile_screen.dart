import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/ui/animated_widgets.dart';
import '../../../../core/ui/glass_container.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Profile', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon:
              const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_rounded, color: Colors.white),
            onPressed: () {
              // TODO: Edit Profile
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // Background
          Container(
            decoration: const BoxDecoration(
              gradient: AppColors.primaryGradient,
            ),
          ),

          // Content
          SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 120, 16, 16),
            child: Column(
              children: [
                // Profile Card
                FadeSlideIn(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.1),
                          shape: BoxShape.circle,
                          border:
                              Border.all(color: AppColors.primary, width: 2),
                        ),
                        child: CircleAvatar(
                          radius: 50,
                          backgroundColor: AppColors.surfaceLight,
                          child: Text(
                            (user != null && user.name.isNotEmpty
                                ? user.name[0].toUpperCase()
                                : "U"),
                            style: const TextStyle(
                              fontSize: 40,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        user?.name ?? "Citizen User",
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user?.email ?? "email@example.com",
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Stats Row
                FadeSlideIn(
                  delay: 200,
                  child: Row(
                    children: [
                      Expanded(
                        child: GlassContainer(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          child: Column(
                            children: [
                              const Text(
                                '12',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primary,
                                ),
                              ),
                              Text(
                                'Reports',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.white.withOpacity(0.6),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: GlassContainer(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          child: Column(
                            children: [
                              const Text(
                                '8',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.accent,
                                ),
                              ),
                              Text(
                                'Resolved',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.white.withOpacity(0.6),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Settings List
                FadeSlideIn(
                  delay: 400,
                  child: Column(
                    children: [
                      _buildSettingsTile(
                        icon: Icons.history_rounded,
                        title: 'My Reports',
                        onTap: () => Navigator.pushNamed(context, '/my-issues'),
                      ),
                      const SizedBox(height: 16),
                      _buildSettingsTile(
                        icon: Icons.notifications_outlined,
                        title: 'Notifications',
                        onTap: () {},
                      ),
                      const SizedBox(height: 16),
                      _buildSettingsTile(
                        icon: Icons.lock_outline_rounded,
                        title: 'Privacy & Security',
                        onTap: () {},
                      ),
                      const SizedBox(height: 16),
                      _buildSettingsTile(
                        icon: Icons.help_outline_rounded,
                        title: 'Help & Support',
                        onTap: () {},
                      ),
                      const SizedBox(height: 32),

                      // Logout Button
                      ScaleOnPress(
                        onTap: () {
                          auth.logout();
                          Navigator.pushNamedAndRemoveUntil(
                              context, '/login', (route) => false);
                        },
                        child: GlassContainer(
                          color: AppColors.error.withOpacity(0.2),
                          border: Border.all(
                              color: AppColors.error.withOpacity(0.5)),
                          child: const Center(
                            child: Text(
                              'Logout',
                              style: TextStyle(
                                color: AppColors.error,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ScaleOnPress(
      onTap: onTap,
      child: GlassContainer(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 22),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded,
                color: Colors.white.withOpacity(0.5), size: 16),
          ],
        ),
      ),
    );
  }
}
