import 'package:flutter/material.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/constants/api_constants.dart';
import '../../home/models/issue_model.dart';
import '../../home/screens/issue_detail_screen.dart';

class AdminIssueListScreen extends StatefulWidget {
  const AdminIssueListScreen({super.key});

  @override
  State<AdminIssueListScreen> createState() => _AdminIssueListScreenState();
}

class _AdminIssueListScreenState extends State<AdminIssueListScreen> {
  final ApiService _apiService = ApiService();
  List<IssueModel> _issues = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchAllIssues();
  }

  Future<void> _fetchAllIssues() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Assuming GET /issue/all exists and returns all issues for admin
      // You might need to check role server-side
      final response = await _apiService.get(ApiConstants.allIssues);

      if (response is List) {
        _issues = response.map((data) => IssueModel.fromJson(data)).toList();
      } else if (response is Map && response['issues'] is List) {
        _issues = (response['issues'] as List)
            .map((data) => IssueModel.fromJson(data))
            .toList();
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('All Issues'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchAllIssues,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _issues.isEmpty
                  ? const Center(child: Text('No issues found'))
                  : ListView.builder(
                      itemCount: _issues.length,
                      itemBuilder: (context, index) {
                        final issue = _issues[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: _getStatusColor(issue.status),
                              child: Icon(_getStatusIcon(issue.status),
                                  color: Colors.white),
                            ),
                            title: Text(
                              issue.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style:
                                  const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(issue.description,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis),
                                const SizedBox(height: 4),
                                Text(
                                  'Status: ${issue.status.toUpperCase()}',
                                  style: TextStyle(
                                    color: _getStatusColor(issue.status),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                            trailing:
                                const Icon(Icons.arrow_forward_ios, size: 16),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const IssueDetailScreen(),
                                  settings: RouteSettings(arguments: issue),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'resolved':
        return Colors.green;
      case 'in_progress':
        return Colors.orange;
      case 'pending':
      default:
        return Colors.red;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'resolved':
        return Icons.check;
      case 'in_progress':
        return Icons.construction;
      case 'pending':
      default:
        return Icons.priority_high;
    }
  }
}
