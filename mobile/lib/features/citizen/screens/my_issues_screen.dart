import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/ui/animated_widgets.dart';
import '../../../../core/ui/glass_container.dart';
import '../../home/providers/home_provider.dart';
import '../../home/models/issue_model.dart';

class MyIssuesScreen extends StatefulWidget {
  const MyIssuesScreen({super.key});

  @override
  State<MyIssuesScreen> createState() => _MyIssuesScreenState();
}

class _MyIssuesScreenState extends State<MyIssuesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    // Fetch issues on load
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
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('My Reports', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon:
              const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
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
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(25),
              ),
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white60,
              labelStyle:
                  const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              dividerColor: Colors.transparent,
              tabs: const [
                Tab(text: 'All'),
                Tab(text: 'Pending'),
                Tab(text: 'In Progress'),
                Tab(text: 'Resolved'),
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
              if (provider.isLoading) {
                return const Center(child: CircularProgressIndicator());
              }

              if (provider.error != null) {
                return Center(
                  child: Text(
                    'Error: ${provider.error}',
                    style: const TextStyle(color: AppColors.error),
                  ),
                );
              }

              return TabBarView(
                controller: _tabController,
                children: [
                  _buildIssueList(provider.issues, null), // All
                  _buildIssueList(provider.issues, 'pending'),
                  _buildIssueList(provider.issues, 'in-progress'),
                  _buildIssueList(provider.issues, 'resolved'),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildIssueList(List<IssueModel> issues, String? statusFilter) {
    // Determine status filter (backend might use lowercase)
    final filteredIssues = statusFilter == null
        ? issues
        : issues
            .where((issue) =>
                issue.status.toLowerCase() == statusFilter.toLowerCase())
            .toList();

    return filteredIssues.isEmpty
        ? Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.inbox_outlined,
                    size: 64, color: Colors.white.withOpacity(0.5)),
                const SizedBox(height: 16),
                Text(
                  'No reports found',
                  style: TextStyle(color: Colors.white.withOpacity(0.5)),
                ),
              ],
            ),
          )
        : ListView.builder(
            padding: const EdgeInsets.fromLTRB(
                16, 120, 16, 16), // Top padding for AppBar + TabBar
            itemCount: filteredIssues.length,
            itemBuilder: (context, index) {
              final issue = filteredIssues[index];
              final statusColor = _getStatusColor(issue.status);

              return FadeSlideIn(
                delay: index * 100,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GlassContainer(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            image: issue.imageUrl != null
                                ? DecorationImage(
                                    image: NetworkImage(issue.imageUrl!),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          child: issue.imageUrl == null
                              ? const Icon(Icons.image_not_supported_outlined,
                                  color: Colors.white54)
                              : null,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                issue.title,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Reported on ${issue.createdAt.toLocal().toString().split(' ')[0]}',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.6),
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: statusColor.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                      color: statusColor.withOpacity(0.5)),
                                ),
                                child: Text(
                                  issue.status.toUpperCase(),
                                  style: TextStyle(
                                    color: statusColor,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded,
                            color: Colors.white54, size: 16),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'resolved':
        return AppColors.success;
      case 'in-progress':
        return AppColors.info;
      case 'pending':
      default:
        return AppColors.warning;
    }
  }
}
