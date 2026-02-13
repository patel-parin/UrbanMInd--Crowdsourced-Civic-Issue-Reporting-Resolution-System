import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/ui/animated_widgets.dart';
import '../../../../core/ui/glass_container.dart';
import '../../auth/providers/auth_provider.dart';
import '../../home/providers/home_provider.dart';

class CitizenHomeScreen extends StatefulWidget {
  const CitizenHomeScreen({super.key});

  @override
  State<CitizenHomeScreen> createState() => _CitizenHomeScreenState();
}

class _CitizenHomeScreenState extends State<CitizenHomeScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch issues to populate stats and recent activity
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<HomeProvider>(context, listen: false).fetchMyIssues();
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.person, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hello, ${user?.name ?? "Citizen"}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.white70,
                      ),
                ),
                Text(
                  'UrbanMind',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                ),
              ],
            ),
          ],
        ),
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
              onPressed: () {
                // TODO: Notifications screen
              },
            ),
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
          SafeArea(
            child: Consumer<HomeProvider>(
              builder: (context, provider, child) {
                final issues = provider.issues;
                final totalIssues = issues.length;
                final resolvedIssues = issues
                    .where((i) => i.status.toLowerCase() == 'resolved')
                    .length;

                return SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Impact Card
                      FadeSlideIn(
                        child: GlassContainer(
                          padding: const EdgeInsets.all(24),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Your Impact',
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.8),
                                      fontSize: 14,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    '$totalIssues Reports',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 28,
                                      fontWeight: FontWeight.bold,
                                      height: 1.2,
                                    ),
                                  ),
                                  Text(
                                    '$resolvedIssues Resolved',
                                    style: const TextStyle(
                                      color: AppColors.accent,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: AppColors.accent.withOpacity(0.2),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: AppColors.accent.withOpacity(0.5),
                                    width: 1,
                                  ),
                                ),
                                child: const Icon(
                                  Icons.insights_rounded,
                                  color: AppColors.accent,
                                  size: 32,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Action Buttons
                      FadeSlideIn(
                        delay: 200,
                        child: Row(
                          children: [
                            Expanded(
                              child: ScaleOnPress(
                                onTap: () => Navigator.pushNamed(
                                    context, '/report-issue'),
                                child: GlassContainer(
                                  height: 160,
                                  color: AppColors.primary.withOpacity(0.2),
                                  border: Border.all(
                                      color: AppColors.primary, width: 1),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.1),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                          Icons.add_a_photo_outlined,
                                          color: Colors.white,
                                          size: 32,
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      const Text(
                                        'Report Issue',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: ScaleOnPress(
                                onTap: () =>
                                    Navigator.pushNamed(context, '/my-issues'),
                                child: GlassContainer(
                                  height: 160,
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.1),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                          Icons.history_rounded,
                                          color: Colors.white,
                                          size: 32,
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      const Text(
                                        'My Reports',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 32),

                      FadeSlideIn(
                        delay: 400,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Recent Activity',
                              style: Theme.of(context)
                                  .textTheme
                                  .titleMedium
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                            ),
                            TextButton(
                              onPressed: () =>
                                  Navigator.pushNamed(context, '/my-issues'),
                              child: const Text('View All'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Recent Issues List
                      provider.isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : issues.isEmpty
                              ? const Center(
                                  child: Text('No recent activity',
                                      style: TextStyle(color: Colors.white54)))
                              : FadeSlideIn(
                                  delay: 600,
                                  child: ListView.builder(
                                    shrinkWrap: true,
                                    physics:
                                        const NeverScrollableScrollPhysics(),
                                    itemCount:
                                        issues.length > 3 ? 3 : issues.length,
                                    itemBuilder: (context, index) {
                                      final issue = issues[index];
                                      return Padding(
                                        padding:
                                            const EdgeInsets.only(bottom: 12),
                                        child: GlassContainer(
                                          padding: const EdgeInsets.all(12),
                                          borderRadius: 16,
                                          child: Row(
                                            children: [
                                              Container(
                                                width: 60,
                                                height: 60,
                                                decoration: BoxDecoration(
                                                  color: Colors.white
                                                      .withOpacity(0.1),
                                                  borderRadius:
                                                      BorderRadius.circular(12),
                                                  image: issue.imageUrl != null
                                                      ? DecorationImage(
                                                          image: NetworkImage(
                                                              issue.imageUrl!),
                                                          fit: BoxFit.cover,
                                                        )
                                                      : null,
                                                ),
                                                child: issue.imageUrl == null
                                                    ? const Icon(
                                                        Icons
                                                            .image_not_supported_outlined,
                                                        color: Colors.white54)
                                                    : null,
                                              ),
                                              const SizedBox(width: 16),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      issue.title,
                                                      maxLines: 1,
                                                      overflow:
                                                          TextOverflow.ellipsis,
                                                      style: const TextStyle(
                                                        color: Colors.white,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        fontSize: 16,
                                                      ),
                                                    ),
                                                    const SizedBox(height: 4),
                                                    Text(
                                                      'Reported on ${issue.createdAt.toLocal().toString().split(' ')[0]}',
                                                      style: TextStyle(
                                                        color: Colors.white
                                                            .withOpacity(0.6),
                                                        fontSize: 12,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                        horizontal: 10,
                                                        vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: _getStatusColor(
                                                          issue.status)
                                                      .withOpacity(0.2),
                                                  borderRadius:
                                                      BorderRadius.circular(20),
                                                  border: Border.all(
                                                      color: _getStatusColor(
                                                              issue.status)
                                                          .withOpacity(0.5)),
                                                ),
                                                child: Text(
                                                  issue.status.toUpperCase(),
                                                  style: TextStyle(
                                                    color: _getStatusColor(
                                                        issue.status),
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
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
