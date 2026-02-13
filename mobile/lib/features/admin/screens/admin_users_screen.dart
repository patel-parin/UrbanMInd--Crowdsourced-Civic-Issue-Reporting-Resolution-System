import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/ui/animated_widgets.dart';
import '../../../../core/ui/glass_container.dart';

class AdminUsersScreen extends StatelessWidget {
  const AdminUsersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Mock Data
    final users = [
      {'name': 'John Doe', 'email': 'john@example.com', 'role': 'Citizen'},
      {'name': 'Jane Smith', 'email': 'jane@example.com', 'role': 'Citizen'},
      {
        'name': 'Robert Brown',
        'email': 'bob@contractor.com',
        'role': 'Contractor'
      },
      {'name': 'Alice Admin', 'email': 'alice@admin.com', 'role': 'Admin'},
    ];

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title:
            const Text('Manage Users', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon:
              const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: AppColors.primaryGradient,
            ),
          ),
          ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 100, 16, 16),
            itemCount: users.length,
            itemBuilder: (context, index) {
              final user = users[index];
              return FadeSlideIn(
                delay: index * 100,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GlassContainer(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color:
                                _getRoleColor(user['role']!).withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            user['name']![0].toUpperCase(),
                            style: TextStyle(
                              color: _getRoleColor(user['role']!),
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user['name']!,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              Text(
                                user['email']!,
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.6),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color:
                                _getRoleColor(user['role']!).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: _getRoleColor(user['role']!)
                                    .withOpacity(0.5)),
                          ),
                          child: Text(
                            user['role']!,
                            style: TextStyle(
                              color: _getRoleColor(user['role']!),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
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

  Color _getRoleColor(String role) {
    switch (role.toLowerCase()) {
      case 'admin':
        return AppColors.error; // Red/Rose for Admin
      case 'contractor':
        return AppColors.warning; // Amber for Contractor
      default:
        return AppColors.accent; // Cyan for Citizen
    }
  }
}
