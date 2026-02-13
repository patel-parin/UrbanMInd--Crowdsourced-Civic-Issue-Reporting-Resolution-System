import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/ui/animated_widgets.dart';
import '../../../../core/ui/glass_container.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Mock Notifications
    final List<Map<String, dynamic>> notifications = [
      {
        'title': 'Issue Resolved',
        'message': 'Your report #1023 has been marked as resolved.',
        'time': '2 mins ago',
        'icon': Icons.check_circle_outline,
        'color': AppColors.success,
      },
      {
        'title': 'Status Update',
        'message': 'Work has started on "Broken Streetlight".',
        'time': '1 hour ago',
        'icon': Icons.sync,
        'color': AppColors.info,
      },
      {
        'title': 'New Feature',
        'message': 'You can now track issue resolution in real-time.',
        'time': '1 day ago',
        'icon': Icons.star_outline,
        'color': AppColors.accent,
      },
    ];

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title:
            const Text('Notifications', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon:
              const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.cleaning_services_outlined,
                color: Colors.white70),
            onPressed: () {},
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

          // List
          ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 120, 16, 16),
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final notif = notifications[index];
              return FadeSlideIn(
                delay: index * 100,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GlassContainer(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 20),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: notif['color'].withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(notif['icon'],
                              color: notif['color'], size: 24),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    notif['title'],
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  Text(
                                    notif['time'],
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.5),
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                notif['message'],
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.8),
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
