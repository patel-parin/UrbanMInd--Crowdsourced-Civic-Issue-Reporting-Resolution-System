import 'package:flutter/material.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/services/storage_service.dart';
import '../models/user_model.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();

  AuthStatus _status = AuthStatus.unknown;
  UserModel? _user;
  bool _isLoading = false;
  String? _error;

  AuthStatus get status => _status;
  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Check auth status on startup
  Future<void> checkAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await _storageService.getToken();
      if (token == null) {
        _status = AuthStatus.unauthenticated;
      } else {
        // Verify token by fetching user profile
        final response = await _apiService.get(ApiConstants.me);
        _user = UserModel.fromJson(response);
        _status = AuthStatus.authenticated;
      }
    } catch (e) {
      // If error (e.g. 401), we assume unauthenticated
      _status = AuthStatus.unauthenticated;
      await _storageService.deleteToken();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post(ApiConstants.login, {
        'email': email,
        'password': password,
      });

      final token = response['token'];
      final userData = response['user'];

      if (token != null) {
        await _storageService.saveToken(token);
        _user = UserModel.fromJson(userData);
        _status = AuthStatus.authenticated;
      } else {
        throw Exception('Token missing in response');
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _status = AuthStatus.unauthenticated;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> signup(String name, String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Signup does NOT return token, so we don't change status to authenticated
      await _apiService.post(ApiConstants.register, {
        'name': name,
        'email': email,
        'password': password,
        'role': 'citizen', // Default role
      });
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _storageService.deleteToken();
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
