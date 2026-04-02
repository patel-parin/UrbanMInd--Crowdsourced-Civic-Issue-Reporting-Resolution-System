import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/ui/animated_widgets.dart';
import '../../../../core/ui/glass_container.dart';

class JobDetailsScreen extends StatelessWidget {
  const JobDetailsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Job Details', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon:
              const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Map Placeholder
                GlassContainer(
                  height: 200,
                  padding: EdgeInsets.zero,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        color: Colors.black26,
                        child: const Center(
                          child:
                              Icon(Icons.map, size: 64, color: Colors.white24),
                        ),
                      ),
                      const Positioned(
                        bottom: 16,
                        right: 16,
                        child: CircleAvatar(
                          backgroundColor: AppColors.primary,
                          child: Icon(Icons.directions, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Job Info
                FadeSlideIn(
                  child: GlassContainer(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: AppColors.primary),
                              ),
                              child: const Text(
                                'Issue #1023',
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const Text(
                              'Oct 24, 2023',
                              style: TextStyle(color: Colors.white70),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Pothole on Main St. needing immediate repair.',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined,
                                color: Colors.white70, size: 18),
                            const SizedBox(width: 8),
                            Text(
                              'Sector 45, Near Central Park',
                              style: TextStyle(
                                  color: Colors.white.withOpacity(0.8)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Description',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Large pothole reported by citizen. Causes traffic slowdown during rush hour. Needs filling and resurfacing.',
                          style: TextStyle(
                              color: Colors.white.withOpacity(0.7),
                              height: 1.5),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Status Actions
                FadeSlideIn(
                  delay: 200,
                  child: GlassContainer(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Update Status',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: ScaleOnPress(
                                onTap: () {},
                                child: Container(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 12),
                                  decoration: BoxDecoration(
                                    color: AppColors.info.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppColors.info),
                                  ),
                                  child: const Center(
                                    child: Text(
                                      'Start',
                                      style: TextStyle(
                                        color: AppColors.info,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: ScaleOnPress(
                                onTap: () {},
                                child: Container(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 12),
                                  decoration: BoxDecoration(
                                    color: AppColors.success.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(12),
                                    border:
                                        Border.all(color: AppColors.success),
                                  ),
                                  child: const Center(
                                    child: Text(
                                      'Complete',
                                      style: TextStyle(
                                        color: AppColors.success,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
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
          ),
        ],
      ),
    );
  }
}
