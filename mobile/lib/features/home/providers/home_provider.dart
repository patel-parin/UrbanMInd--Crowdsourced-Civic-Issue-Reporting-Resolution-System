import 'package:flutter/material.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../models/issue_model.dart';

class HomeProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

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
}
