import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/home_provider.dart';
import '../models/issue_model.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/api_constants.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<HomeProvider>(context, listen: false).fetchMyIssues();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final homeProvider = Provider.of<HomeProvider>(context);
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('UrbanMind'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              authProvider.logout();
              Navigator.pushReplacementNamed(context, '/login');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => homeProvider.fetchMyIssues(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Welcome, ${user?.name ?? 'Citizen'}!',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text('Email: ${user?.email ?? ''}'),
                      Text('Level: ${user?.citizenLevel ?? 1}'),
                      Text('Impact Points: ${user?.impactPoints ?? 0}'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'My Reported Issues',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 12),
              if (homeProvider.isLoading)
                const Center(
                    child: Padding(
                  padding: EdgeInsets.all(32.0),
                  child: CircularProgressIndicator(),
                ))
              else if (homeProvider.error != null)
                Center(child: Text('Error: ${homeProvider.error}'))
              else if (homeProvider.issues.isEmpty)
                const Center(
                    child: Padding(
                  padding: EdgeInsets.all(32.0),
                  child: Text('No issues reported yet.'),
                ))
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: homeProvider.issues.length,
                  itemBuilder: (context, index) {
                    final issue = homeProvider.issues[index];
                    return IssueCard(issue: issue);
                  },
                ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.pushNamed(context, '/report-issue');
          if (result == true) {
            // Refresh issues if a new one was reported
            homeProvider.fetchMyIssues();
          }
        },
        icon: const Icon(Icons.add_photo_alternate),
        label: const Text('Report Issue'),
      ),
    );
  }
}

class IssueCard extends StatelessWidget {
  final IssueModel issue;
  const IssueCard({super.key, required this.issue});

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    switch (issue.status.toLowerCase()) {
      case 'resolved':
        statusColor = Colors.green;
        break;
      case 'in_progress':
        statusColor = Colors.orange;
        break;
      default:
        statusColor = Colors.red;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias, // For ripple effect
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(context, '/issue-detail', arguments: issue);
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (issue.imageUrl != null && issue.imageUrl!.isNotEmpty)
              SizedBox(
                height: 150,
                width: double.infinity,
                child: Image.network(
                  issue.imageUrl!.startsWith('http')
                      ? issue.imageUrl!
                      : '${ApiConstants.baseUrl.replaceAll('/api', '')}${issue.imageUrl}',
                  fit: BoxFit.cover,
                  errorBuilder: (ctx, err, stack) => Container(
                    color: Colors.grey[200],
                    child: Icon(Icons.broken_image, color: Colors.grey[400]),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          issue.title,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 16),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border:
                              Border.all(color: statusColor.withOpacity(0.5)),
                        ),
                        child: Text(
                          issue.status.toUpperCase().replaceAll('_', ' '),
                          style: TextStyle(
                              color: statusColor,
                              fontSize: 10,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    issue.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Colors.grey[800]),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.location_on,
                          size: 14, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Expanded(
                          child: Text(issue.city,
                              style: TextStyle(
                                  color: Colors.grey[600], fontSize: 12))),
                      Text(
                        DateFormat('MMM dd, yyyy').format(issue.createdAt),
                        style: TextStyle(color: Colors.grey[500], fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
