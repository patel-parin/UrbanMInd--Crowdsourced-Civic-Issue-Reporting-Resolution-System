import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../auth/providers/auth_provider.dart';

class ContractorHomeScreen extends StatelessWidget {
  const ContractorHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hello, ${user?.name ?? "Contractor"}',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
            Text(
              'Work Dashboard',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
            ),
          ],
        ),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: DefaultTabController(
        length: 2,
        child: Column(
          children: [
            const TabBar(
              tabs: [
                Tab(text: 'Assigned'),
                Tab(text: 'Completed'),
              ],
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.textSecondary,
              indicatorColor: AppColors.primary,
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _buildTaskList(context, isCompleted: false),
                  _buildTaskList(context, isCompleted: true),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskList(BuildContext context, {required bool isCompleted}) {
    // Placeholder list
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 4,
      itemBuilder: (context, index) {
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Issue #${1023 + index}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Chip(
                      label: Text(isCompleted ? 'Done' : 'In Progress'),
                      backgroundColor: isCompleted
                          ? AppColors.success.withOpacity(0.1)
                          : AppColors.info.withOpacity(0.1),
                      labelStyle: TextStyle(
                        color: isCompleted ? AppColors.success : AppColors.info,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                    'Garbage collection pending at Sector 45 near central park.'),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (!isCompleted)
                      ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                        ),
                        child: const Text('Update Status'),
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
