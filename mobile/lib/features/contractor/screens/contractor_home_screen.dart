import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/ui/animated_widgets.dart';
import '../../../../core/ui/glass_container.dart';
import '../../auth/providers/auth_provider.dart';
import '../../home/providers/home_provider.dart';
import 'job_details_screen.dart';

class ContractorHomeScreen extends StatefulWidget {
  const ContractorHomeScreen({super.key});

  @override
  State<ContractorHomeScreen> createState() => _ContractorHomeScreenState();
}

class _ContractorHomeScreenState extends State<ContractorHomeScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    // Fetch all issues (filtering will happen on UI for now, ideal to have backend filter)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<HomeProvider>(context, listen: false).fetchMyIssues();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hello, ${user?.name ?? "Contractor"}',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.white70,
                  ),
            ),
            Text(
              'Work Dashboard',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
            ),
          ],
        ),
        backgroundColor: Colors.transparent,
        centerTitle: false,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: IconButton(
              icon:
                  const Icon(Icons.notifications_outlined, color: Colors.white),
              onPressed: () => Navigator.pushNamed(context, '/notifications'),
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(25),
            ),
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                color: AppColors.accent,
                borderRadius: BorderRadius.circular(25),
              ),
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white60,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold),
              dividerColor: Colors.transparent,
              tabs: const [
                Tab(text: 'Available Jobs'), // Changed from Assigned for demo
                Tab(text: 'Completed'),
              ],
            ),
          ),
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
          Consumer<HomeProvider>(
            builder: (context, provider, child) {
              final allIssues = provider.issues;
              // Simulating contractor view:
              // Available = 'Reported' (Pending) or 'In-Progress'
              // Completed = 'Resolved'
              final availableJobs = allIssues
                  .where((i) =>
                      i.status.toLowerCase() == 'pending' ||
                      i.status.toLowerCase() == 'in-progress')
                  .toList();
              final completedJobs = allIssues
                  .where((i) => i.status.toLowerCase() == 'resolved')
                  .toList();

              return TabBarView(
                controller: _tabController,
                children: [
                  _buildTaskList(context,
                      jobs: availableJobs, isCompleted: false),
                  _buildTaskList(context,
                      jobs: completedJobs, isCompleted: true),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTaskList(BuildContext context,
      {required List<dynamic> jobs, required bool isCompleted}) {
    if (jobs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.work_outline,
                size: 64, color: Colors.white.withOpacity(0.5)),
            const SizedBox(height: 16),
            Text(
              'No jobs found',
              style: TextStyle(color: Colors.white.withOpacity(0.5)),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 120, 16, 16),
      itemCount: jobs.length,
      itemBuilder: (context, index) {
        final job = jobs[index];
        return FadeSlideIn(
          delay: index * 100,
          child: Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: ScaleOnPress(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const JobDetailsScreen()),
                );
              },
              child: GlassContainer(
                padding: const EdgeInsets.all(16),
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
                            border: Border.all(
                                color: AppColors.primary.withOpacity(0.5)),
                          ),
                          child: Text(
                            'Issue #${job.id}',
                            style: const TextStyle(
                              color: AppColors.primaryLight,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        if (isCompleted)
                          const Icon(Icons.check_circle_outline,
                              color: AppColors.success)
                        else
                          Icon(Icons.pending_outlined,
                              color: _getStatusColor(job.status)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      job.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined,
                            size: 16, color: Colors.white70),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            job.description, // Using description as secondary text
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                color: Colors.white.withOpacity(0.7),
                                fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          job.createdAt.toString().split(' ')[0],
                          style: TextStyle(
                              color: Colors.white.withOpacity(0.5),
                              fontSize: 12),
                        ),
                        if (!isCompleted)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              'View Details',
                              style: TextStyle(
                                color: AppColors.background,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    if (status.toLowerCase() == 'pending') return AppColors.warning;
    if (status.toLowerCase() == 'in-progress') return AppColors.info;
    return AppColors.success;
  }
}
