import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'storage_service.dart';

class ApiService {
  final StorageService _storageService = StorageService();

  Future<Map<String, String>> _getHeaders({bool isMultipart = false}) async {
    final token = await _storageService.getToken();
    final headers = <String, String>{};

    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  Future<dynamic> post(String url, Map<String, dynamic> body) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse(url),
        headers: headers,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      rethrow;
    }
  }

  Future<dynamic> get(String url) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );
      return _handleResponse(response);
    } catch (e) {
      rethrow;
    }
  }

  // Handle various response statuses according to requirements
  dynamic _handleResponse(http.Response response) {
    final responseBody = jsonDecode(response.body);

    switch (response.statusCode) {
      case 200:
      case 201:
        return responseBody;
      case 400:
        throw Exception(
            responseBody['message'] ?? responseBody['error'] ?? 'Bad Request');
      case 401:
        // Unauthorized - Token likely expired or invalid
        _storageService.deleteToken();
        throw Exception('Unauthorized');
      case 403:
        throw Exception('Forbidden: ${responseBody['message']}');
      case 500:
        throw Exception('Server Error: Please try again later');
      default:
        throw Exception('Error occurred: ${response.statusCode}');
    }
  }

  // Method for multipart request (Image Upload)
  Future<dynamic> postMultipart(
      String url, Map<String, String> fields, File imageFile) async {
    try {
      final request = http.MultipartRequest('POST', Uri.parse(url));
      final headers = await _getHeaders(isMultipart: true);
      request.headers.addAll(headers);

      request.fields.addAll(fields);
      request.files
          .add(await http.MultipartFile.fromPath('image', imageFile.path));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      return _handleResponse(response);
    } catch (e) {
      rethrow;
    }
  }
}
