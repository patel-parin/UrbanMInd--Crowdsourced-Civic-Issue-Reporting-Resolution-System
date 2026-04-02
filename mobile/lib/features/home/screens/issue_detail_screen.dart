import 'package:flutter/material.dart';
import '../../../../core/constants/api_constants.dart';
import '../models/issue_model.dart';
import 'package:intl/intl.dart';

class IssueDetailScreen extends StatelessWidget {
  const IssueDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Get the issue passed via arguments
    final issue = ModalRoute.of(context)!.settings.arguments as IssueModel;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: issue.imageUrl != null && issue.imageUrl!.isNotEmpty
                  ? Image.network(
                      // Quick hack to fix image URL relative path for emulator
                      issue.imageUrl!.startsWith('http')
                          ? issue.imageUrl!
                          : '${ApiConstants.baseUrl.replaceAll('/api', '')}${issue.imageUrl}',
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, err, stack) => Container(
                        color: Colors.grey[300],
                        child: Icon(Icons.broken_image,
                            size: 60, color: Colors.grey[500]),
                      ),
                    )
                  : Container(
                      color: Theme.of(context).primaryColor.withOpacity(0.1),
                      child: Icon(Icons.image,
                          size: 60, color: Theme.of(context).primaryColor),
                    ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          issue.title,
                          style: Theme.of(context)
                              .textTheme
                              .headlineMedium
                              ?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                        ),
                      ),
                      _StatusBadge(status: issue.status),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.access_time,
                          size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        DateFormat('MMMM dd, yyyy • hh:mm a')
                            .format(issue.createdAt),
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Location Section
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.grey[50],
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 10),
                            ],
                          ),
                          child: const Icon(Icons.location_on,
                              color: Colors.redAccent),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'LOCATION',
                                style: TextStyle(
                                  color: Colors.grey[500],
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                issue.address,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w600),
                              ),
                              Text(
                                issue.city,
                                style: TextStyle(
                                    color: Colors.grey[600], fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                  Text(
                    'Description',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    issue.description,
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.5,
                      color: Colors.grey[800],
                    ),
                  ),

                  const SizedBox(height: 32),
                  // Additional Metadata if needed (Category etc)
                  Row(
                    children: [
                      Chip(
                        label: Text(issue.category),
                        avatar: const Icon(Icons.category, size: 16),
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    IconData icon;

    switch (status.toLowerCase()) {
      case 'resolved':
        color = Colors.green;
        icon = Icons.check_circle;
        break;
      case 'in_progress':
        color = Colors.orange;
        icon = Icons.pending;
        break;
      default:
        color = Colors.redAccent;
        icon = Icons.error_outline;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            status.toUpperCase().replaceAll('_', ' '),
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
