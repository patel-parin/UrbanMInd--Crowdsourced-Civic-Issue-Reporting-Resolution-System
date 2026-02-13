import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/ui/animated_widgets.dart';
import '../../../../core/ui/glass_container.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/constants/api_constants.dart';
import '../../home/models/issue_model.dart';
import '../../home/screens/issue_detail_screen.dart';

class AdminIssuesScreen extends StatefulWidget {
  const AdminIssuesScreen({super.key});

  @override
  State<AdminIssuesScreen> createState() => _AdminIssuesScreenState();
}

class _AdminIssuesScreenState extends State<AdminIssuesScreen> {
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
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title:
            const Text('Manage Issues', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon:
              const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _fetchAllIssues,
          ),
        ],
      ),
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: AppColors.primaryGradient,
            ),
          ),
          _isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: Colors.white))
              : _error != null
                  ? Center(
                      child: Text('Error: $_error',
                          style: const TextStyle(color: Colors.white)))
                  : _issues.isEmpty
                      ? const Center(
                          child: Text('No issues found',
                              style: TextStyle(color: Colors.white)))
                      : ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 100, 16, 16),
                          itemCount: _issues.length,
                          itemBuilder: (context, index) {
                            final issue = _issues[index];
                            return FadeSlideIn(
                              delay: index * 100,
                              child: Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: GlassContainer(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            '#${issue.id.substring(issue.id.length - 6)}', // Short ID
                                            style: const TextStyle(
                                              color: AppColors.accent,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: (_getStatusColor(
                                                      issue.status))
                                                  .withOpacity(0.2),
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                              border: Border.all(
                                                  color: _getStatusColor(
                                                      issue.status)),
                                            ),
                                            child: Text(
                                              issue.status.toUpperCase(),
                                              style: TextStyle(
                                                color: _getStatusColor(
                                                    issue.status),
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        issue.title,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          const Icon(Icons.location_on_outlined,
                                              color: Colors.white70, size: 14),
                                          const SizedBox(width: 4),
                                          Expanded(
                                            child: Text(
                                              issue.address,
                                              style: const TextStyle(
                                                  color: Colors.white70,
                                                  fontSize: 13),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 16),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: OutlinedButton(
                                              onPressed: () {
                                                // TODO: Assign Contractor Logic
                                              },
                                              style: OutlinedButton.styleFrom(
                                                side: const BorderSide(
                                                    color: AppColors.primary),
                                                foregroundColor:
                                                    AppColors.primary,
                                              ),
                                              child: const Text('Assign'),
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: ElevatedButton(
                                              onPressed: () {
                                                Navigator.push(
                                                  context,
                                                  MaterialPageRoute(
                                                    builder: (_) =>
                                                        const IssueDetailScreen(),
                                                    settings: RouteSettings(
                                                        arguments: issue),
                                                  ),
                                                );
                                              },
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor:
                                                    AppColors.surface,
                                                foregroundColor: Colors.white,
                                              ),
                                              child: const Text('View'),
                                            ),
                                          ),
                                        ],
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

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'resolved':
        return AppColors.success;
      case 'in_progress':
        return AppColors.info;
      case 'pending':
      default:
        return AppColors.warning;
    }
  }
}
