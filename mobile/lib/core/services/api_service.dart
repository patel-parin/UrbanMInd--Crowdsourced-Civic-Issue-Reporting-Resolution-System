import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/api_constants.dart';

class ApiService {
  final _storage = const FlutterSecureStorage();

  Future<Map<String, String>> _getHeaders() async {
    final token = await _storage.read(key: 'auth_token');
    print('DEBUG: Token from storage: ${token != null ? "FOUND" : "MISSING"}');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String endpoint) async {
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    final headers = await _getHeaders();

    try {
      final response = await http.get(url, headers: headers);
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    final headers = await _getHeaders();

    try {
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<dynamic> put(String endpoint, Map<String, dynamic> body) async {
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    final headers = await _getHeaders();

    try {
      final response = await http.put(
        url,
        headers: headers,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      // Handle unauthorized (logout)
      throw Exception('Unauthorized');
    } else {
      final body = jsonDecode(response.body);
      throw Exception(body['message'] ?? 'Something went wrong');
    }
  }

  Future<dynamic> postMultipart(
      String endpoint, Map<String, String> fields, File file) async {
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    final token = await _storage.read(key: 'auth_token');

    var request = http.MultipartRequest('POST', url);

    // Headers
    request.headers.addAll({
      'Content-Type': 'multipart/form-data',
      if (token != null) 'Authorization': 'Bearer $token',
    });

    // Fields
    fields.forEach((key, value) {
      request.fields[key] = value;
    });

    // File
    // Assuming 'image' is the field name for the file, check backend if different
    var stream = http.ByteStream(file.openRead());
    var length = await file.length();

    var multipartFile = http.MultipartFile(
      'image', // Field name
      stream,
      length,
      filename: file.path.split('/').last,
    );

    request.files.add(multipartFile);

    try {
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
