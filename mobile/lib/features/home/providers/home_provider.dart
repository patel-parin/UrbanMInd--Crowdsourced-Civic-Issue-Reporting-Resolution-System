import 'dart:io';
import 'package:flutter/material.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../models/issue_model.dart'; // Ensure this model exists and matches backend

import '../../../../core/services/socket_service.dart';

class HomeProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final SocketService? _socketService;

  HomeProvider({SocketService? socketService})
      : _socketService = socketService {
    _initSocketListeners();
  }

  void _initSocketListeners() {
    _socketService?.listen('issue_updated', (data) {
      // Refresh issues when an update is received
      fetchMyIssues();
    });

    _socketService?.listen('new_issue', (data) {
      fetchMyIssues();
    });
  }

  List<IssueModel> _issues = [];
  bool _isLoading = false;
  String? _error;

  List<IssueModel> get issues => _issues;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchMyIssues() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get(ApiConstants.myIssues);

      if (response is List) {
        _issues = response.map((data) => IssueModel.fromJson(data)).toList();
      } else if (response is Map && response['issues'] is List) {
        _issues = (response['issues'] as List)
            .map((data) => IssueModel.fromJson(data))
            .toList();
      } else {
        _issues = [];
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createIssue({
    required String title,
    required String description,
    required double latitude,
    required double longitude,
    required String address,
    File? imageFile,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // If image is present, we need multipart request
      if (imageFile != null) {
        // Note: ApiService needs postMultipart implementation
        // For now, assuming standard post if backend supports base64 or similar
        // But best to use multipart.
        // Let's implement postMultipart in ApiService if needed.
        // Since ApiService.postMultipart was empty in the view, I should probably implement it there first.
        // For this step, I'll assume we can use a standard POST with image data if backend supports it,
        // OR I will implement `postMultipart` in ApiService in the next step.

        // Using a placeholder for now to avoid breaking without ApiService update.
        await _apiService.postMultipart(
            ApiConstants.createIssue,
            {
              'title': title,
              'description': description,
              'latitude': latitude.toString(),
              'longitude': longitude.toString(),
              'address': address,
            },
            imageFile);
      } else {
        await _apiService.post(ApiConstants.createIssue, {
          'title': title,
          'description': description,
          'latitude': latitude,
          'longitude': longitude,
          'address': address,
        });
      }

      // Refresh list
      await fetchMyIssues();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
